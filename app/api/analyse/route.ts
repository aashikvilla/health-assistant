import { NextRequest, NextResponse } from 'next/server'
import type { LabReportData } from '@/types/lab-report'
import type { LabReportExplanation } from '@/types/lab-report'

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

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

function buildMockAnalysis(data: LabReportData): LabReportExplanation {
  const abnormal = data.tests
    .filter((t) => t.status === 'low' || t.status === 'high' || t.status === 'critical')
    .map((t, i) => ({
      id: `marker-${i}`,
      name: t.testName,
      value: t.result,
      unit: t.unit,
      status: t.status as 'low' | 'high' | 'critical',
      referenceRange: t.referenceRange,
      explanation: `Your ${t.testName} is ${t.status === 'low' ? 'below' : 'above'} the normal range. This is something to discuss with your doctor at your next visit.`,
    }))

  return {
    patientName: data.patientName || 'Patient',
    labName: data.labName || 'Lab',
    testDate: data.testDate || new Date().toLocaleDateString('en-IN'),
    doctorName: data.doctorName || 'your doctor',
    abnormalMarkers: abnormal,
    doctorNotes: [
      'Bring this report to your next doctor visit for review.',
      'Do not stop or change any medication based on these results without consulting your doctor.',
      'If you feel unwell or notice new symptoms, contact your doctor promptly.',
    ],
  }
}

function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

function buildPrompt(report: LabReportData): string {
  return `You are a patient-friendly lab report interpreter. Given this lab report data, identify ONLY the parameters that are OUT OF RANGE (low, high, or critical) and explain each in plain English.

Lab Report:
${JSON.stringify(report, null, 2)}

Return ONLY valid JSON — no markdown, no code fences:
{
  "patientName": string,
  "labName": string,
  "testDate": string,
  "doctorName": string,
  "abnormalMarkers": [
    {
      "id": "marker-0",
      "name": string (test name),
      "value": string (the result value),
      "unit": string (unit of measurement),
      "status": "low" | "high" | "critical",
      "referenceRange": string (e.g. "4.0 - 11.0"),
      "explanation": string (2-3 sentences in plain English: what this marker does in the body, what this result means for the patient, and whether it is mildly or significantly off. Be reassuring but honest. Use simple language an Indian family member would understand.)
    }
  ],
  "doctorNotes": string[] (3-5 specific follow-up points the patient should raise with their doctor based on the abnormal results)
}

Rules:
- ONLY include markers where status is "low", "high", or "critical". Do NOT include normal markers.
- If ALL markers are normal, return an empty abnormalMarkers array and a single doctorNote saying "All your results are within normal range — great news!"
- Never diagnose. Say "this may suggest..." or "this marker is linked to..." — never "you have..."
- Be reassuring in tone. Most abnormal values are mildly off and manageable.
- Give India-relevant context in doctorNotes where useful (e.g., dietary tips with Indian foods, sunlight advice).
- doctorNotes should be specific to the abnormal findings, not generic.`
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
  try {
    const report: LabReportData = await req.json()

    if (DEV_MODE) {
      await sleep(1500)
      return NextResponse.json(buildMockAnalysis(report))
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set')

    const prompt = buildPrompt(report)
    let lastError = ''

    for (const model of FREE_MODELS) {
      try {
        const raw = await callModel(apiKey, model, prompt)
        const cleaned = stripJsonFences(raw)
        try {
          const parsed = JSON.parse(cleaned) as LabReportExplanation
          return NextResponse.json(parsed)
        } catch {
          lastError = 'AI response was incomplete. Retrying with another model.'
          continue
        }
      } catch (err) {
        const e = err as Error & { code?: number }
        lastError = e.message
        if (e.code === 429 || e.code === 402) continue
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
