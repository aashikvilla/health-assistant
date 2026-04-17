/**
 * Shared explanation generation logic.
 * Used by both app/api/explain/route.ts and app/(app)/explanation/[id]/page.tsx
 * (on-demand generation for authenticated records that were saved without explanation).
 */

import type { PrescriptionData, PrescriptionExplanation } from '@/types/prescription'

const FREE_MODELS = [
  'google/gemma-4-31b-it:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openai/gpt-oss-120b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
]

function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

export function buildExplainPrompt(prescription: PrescriptionData): string {
  return `You are a patient-friendly medical explanation assistant. Given this prescription data, return a plain-language explanation.

Prescription:
${JSON.stringify(prescription, null, 2)}

Return ONLY valid JSON  no markdown, no code fences:
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
      "treats": string (1 sentence  what condition this addresses),
      "how_to_take": string (1-2 sentences  timing, food, water),
      "side_effects": string (1-2 sentences  common effects only, plain language),
      "avoid": string (1-2 sentences  food/drink/activity interactions)
    }
  ],
  "doctorNotes": string[] (3-5 follow-up points the patient should raise at next visit)
}`
}

async function tryModel(apiKey: string, model: string, prompt: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://nuskha.app',
      'X-Title': 'Vitae',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw Object.assign(new Error(`OpenRouter ${res.status}: ${err}`), { status: res.status })
  }

  const data = await res.json()
  const raw: string = data.choices?.[0]?.message?.content ?? ''
  if (!raw) throw new Error('Empty response from model')
  return raw
}

/**
 * Generate a plain-language prescription explanation via OpenRouter free model pool.
 * Tries each model in order, skipping on 429/402. Returns null if all fail.
 */
export async function generateExplanation(
  prescription: PrescriptionData,
  apiKey: string
): Promise<PrescriptionExplanation | null> {
  const prompt = buildExplainPrompt(prescription)

  for (const model of FREE_MODELS) {
    try {
      const raw = await tryModel(apiKey, model, prompt)
      try {
        return JSON.parse(stripJsonFences(raw)) as PrescriptionExplanation
      } catch {
        continue // malformed JSON  try next model
      }
    } catch (err) {
      const e = err as Error & { status?: number }
      if (e.status === 429 || e.status === 402) continue
      throw err
    }
  }
  return null
}
