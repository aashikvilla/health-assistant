/**
 * Shared explanation generation logic.
 * Used by both app/api/explain/route.ts and app/(app)/explanation/[id]/page.tsx
 * (on-demand generation for authenticated records that were saved without explanation).
 */

import type { PrescriptionData, PrescriptionExplanation } from '@/types/prescription'
import { callGemini, stripJsonFences, GeminiError } from '@/lib/gemini'

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

/**
 * Generate a plain-language prescription explanation via Gemini 2.5 Flash-Lite.
 * Returns null on rate-limit (429); throws on other errors.
 */
export async function generateExplanation(
  prescription: PrescriptionData,
  apiKey: string
): Promise<PrescriptionExplanation | null> {
  try {
    const raw = await callGemini({
      apiKey,
      prompt: buildExplainPrompt(prescription),
      maxTokens: 4096,
      jsonMode: true,
    })
    try {
      return JSON.parse(stripJsonFences(raw)) as PrescriptionExplanation
    } catch {
      return null
    }
  } catch (err) {
    if (err instanceof GeminiError && err.status === 429) return null
    throw err
  }
}
