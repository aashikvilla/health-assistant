import Anthropic from '@anthropic-ai/sdk'
import type { PrescriptionData } from '@/types/prescription'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a medical data extraction assistant. Given raw text from a prescription, extract structured data and return ONLY valid JSON — no markdown, no explanation.

Return this exact shape:
{
  "doctor": string,
  "doctorConfidence": "high" | "low",
  "date": string,
  "dateConfidence": "high" | "low",
  "medications": [
    {
      "name": string,
      "dosage": string,
      "duration": string,
      "confidence": "high" | "low"
    }
  ]
}

Rules:
- If a field is clearly present and readable, set confidence "high".
- If a field is missing, illegible, or uncertain, use an empty string and set confidence "low".
- Format date as DD MMM YYYY if possible (e.g., "10 Apr 2026").
- List every distinct medication as a separate entry.
- Never invent data. If something is not in the text, leave it empty with confidence "low".`

export async function extractPrescriptionData(rawText: string): Promise<PrescriptionData> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Extract prescription data from this text:\n\n${rawText}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  return JSON.parse(content.text) as PrescriptionData
}
