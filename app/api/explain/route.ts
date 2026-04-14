import { NextRequest, NextResponse } from 'next/server'
import type { PrescriptionData, PrescriptionExplanation } from '@/types/prescription'
import type { MedicationExplanation } from '@/types/analysis'
import { checkRateLimit } from '@/lib/rate-limit'

const RATE_LIMIT     = 100
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

// Tried in order — skips to next on 429 rate limit
const FREE_MODELS = [
  'google/gemma-4-31b-it:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openai/gpt-oss-120b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function buildMockExplanation(data: PrescriptionData): PrescriptionExplanation {
  const medications: (MedicationExplanation & { id: string })[] = data.medications.map((m, i) => ({
    id: `med-${i}`,
    name: m.name,
    dosage: m.dosage,
    frequency: m.dosage,
    treats: `Prescribed for ${data.illness || 'your condition'}.`,
    how_to_take: m.duration
      ? `Take as directed for ${m.duration}. Follow your doctor's instructions carefully.`
      : 'Take as directed by your doctor.',
    side_effects: 'May cause mild nausea or dizziness. Contact your doctor if symptoms are severe or persist.',
    avoid: 'Avoid alcohol while taking this medication. Inform your doctor of any other medicines you are taking.',
  }))

  return {
    id: 'preview',
    doctorName: data.doctor || 'Your Doctor',
    date: data.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    patientName: 'You',
    disclaimerDoctorName: data.doctor || 'your doctor',
    medications,
    doctorNotes: [
      `Complete the full course as prescribed${data.doctor ? ` by ${data.doctor}` : ''}.`,
      'Report any unusual side effects or allergic reactions immediately.',
      data.illness ? `Monitor your ${data.illness} symptoms and note any changes.` : 'Track your symptoms daily.',
      'Do not stop or adjust dosage without consulting your doctor first.',
    ],
  }
}

function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

function buildPrompt(prescription: PrescriptionData): string {
  return `You are a patient-friendly medical explanation assistant. Given this prescription data, return a plain-language explanation.

Prescription:
${JSON.stringify(prescription, null, 2)}

Return ONLY valid JSON — no markdown, no code fences:
{
  "id": "preview",
  "doctorName": string,
  "date": string,
  "patientName": "You",
  "disclaimerDoctorName": string,
  "medications": [
    {
      "id": "med-0",
      "name": string,
      "dosage": string,
      "frequency": string,
      "treats": string (1 sentence — what condition this addresses),
      "how_to_take": string (1-2 sentences — timing, food, water),
      "side_effects": string (1-2 sentences — common effects only, plain language),
      "avoid": string (1-2 sentences — food/drink/activity interactions)
    }
  ],
  "doctorNotes": string[] (3-5 follow-up points the patient should raise at next visit)
}`
}

async function callModel(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://nuskha.app',
      'X-Title': 'Nuskha',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw Object.assign(new Error(`OpenRouter error ${res.status}: ${err}`), { code: res.status })
  }

  const data = await res.json()
  const raw: string = data.choices?.[0]?.message?.content ?? ''
  if (!raw) throw new Error('Empty response from model')
  return raw
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(RATE_WINDOW_MS / 1000)) },
    })
  }

  try {
    const prescription: PrescriptionData = await req.json()

    if (DEV_MODE) {
      await sleep(1500)
      return NextResponse.json(buildMockExplanation(prescription))
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set')

    const prompt = buildPrompt(prescription)
    let lastError = ''

    for (const model of FREE_MODELS) {
      try {
        const raw = await callModel(apiKey, model, prompt)
        const cleaned = stripJsonFences(raw)
        try {
          const parsed = JSON.parse(cleaned) as PrescriptionExplanation
          return NextResponse.json(parsed)
        } catch {
          // Truncated or malformed JSON — try next model
          lastError = 'AI response was incomplete. Retrying with another model.'
          continue
        }
      } catch (err) {
        const e = err as Error & { code?: number }
        lastError = e.message
        if (e.code === 429 || e.code === 402) continue  // rate-limited or provider spend cap — try next model
        throw err
      }
    }

    return NextResponse.json(
      { error: 'All AI models are currently rate-limited. Please try again in a minute.' },
      { status: 429 }
    )

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
