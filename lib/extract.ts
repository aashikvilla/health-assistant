import type { PrescriptionData } from '@/types/prescription'
import type { LabReportData } from '@/types/lab-report'

type ImageInput = { type: 'image'; base64: string; mimeType: string }
type TextInput = { type: 'text'; content: string }

const PROMPT = `You are a medical data extraction assistant. Extract structured prescription data and return ONLY valid JSON  no markdown, no explanation, no code fences.

Return this exact shape:
{
  "doctor": string,
  "doctorConfidence": "high" | "low",
  "date": string,
  "dateConfidence": "high" | "low",
  "illness": string,
  "illnessConfidence": "high" | "low",
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

const LAB_REPORT_PROMPT = `You are a medical data extraction assistant. Extract structured lab report data and return ONLY valid JSON  no markdown, no explanation, no code fences.

Return this exact shape:
{
  "patientName": string,
  "patientNameConfidence": "high" | "low",
  "testDate": string,
  "testDateConfidence": "high" | "low",
  "labName": string,
  "labNameConfidence": "high" | "low",
  "doctorName": string,
  "doctorNameConfidence": "high" | "low",
  "tests": [
    {
      "testName": string,
      "result": string,
      "unit": string,
      "referenceRange": string,
      "status": "normal" | "low" | "high" | "critical" | "",
      "confidence": "high" | "low"
    }
  ]
}

Rules:
- If a field is clearly present and readable, set confidence "high".
- If a field is missing, illegible, or uncertain, use an empty string and set confidence "low".
- Format testDate as DD MMM YYYY if possible (e.g., "10 Apr 2026").
- List every distinct test as a separate entry.
- For status: compare result against referenceRange if available  "normal" if within range, "low" if below, "high" if above, "critical" if flagged as critical, "" if undeterminable.
- Never invent data. If something is not in the text, leave it empty with confidence "low".`

function stripJsonFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

export async function extractPrescriptionData(
  input: ImageInput | TextInput
): Promise<PrescriptionData> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set')

  type ContentPart =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }

  let content: ContentPart[]

  if (input.type === 'image') {
    content = [
      {
        type: 'image_url',
        image_url: { url: `data:${input.mimeType};base64,${input.base64}` },
      },
      { type: 'text', text: PROMPT },
    ]
  } else {
    content = [
      {
        type: 'text',
        text: `${PROMPT}\n\nManual prescription entry:\n${input.content}`,
      },
    ]
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://nuskha.app',
      'X-Title': 'Vitae',
    },
    body: JSON.stringify({
      model: 'google/gemma-4-26b-a4b-it',
      max_tokens: 1024,
      messages: [{ role: 'user', content }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const raw: string = data.choices?.[0]?.message?.content ?? ''

  if (!raw) throw new Error('Empty response from model')

  try {
    return JSON.parse(stripJsonFences(raw)) as PrescriptionData
  } catch {
    throw new Error(`Model returned invalid JSON: ${raw.slice(0, 200)}`)
  }
}

export async function classifyDocument(input: ImageInput | TextInput): Promise<'prescription' | 'lab_report' | 'other'> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set')

  type ContentPart =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }

  const classifyPrompt = 'Classify this medical document. Reply with ONLY one of these exact words: prescription, lab_report, other'

  const content: ContentPart[] = input.type === 'image'
    ? [
        { type: 'image_url', image_url: { url: `data:${input.mimeType};base64,${input.base64}` } },
        { type: 'text', text: classifyPrompt },
      ]
    : [{ type: 'text', text: `${classifyPrompt}\n\n${input.content.slice(0, 1000)}` }]

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://nuskha.app',
      'X-Title': 'Vitae',
    },
    body: JSON.stringify({
      model: 'google/gemma-4-26b-a4b-it',
      max_tokens: 10,
      messages: [{ role: 'user', content }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const raw = (data.choices?.[0]?.message?.content ?? '').trim().toLowerCase()

  if (raw.includes('lab_report') || raw.includes('lab report')) return 'lab_report'
  if (raw.includes('prescription')) return 'prescription'
  return 'other'
}

export async function extractLabReportData(input: ImageInput | TextInput): Promise<LabReportData> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set')

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://nuskha.app',
      'X-Title': 'Vitae',
    },
    body: JSON.stringify({
      model: 'google/gemma-4-26b-a4b-it',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: input.type === 'image'
            ? [
                { type: 'image_url', image_url: { url: `data:${input.mimeType};base64,${input.base64}` } },
                { type: 'text', text: LAB_REPORT_PROMPT },
              ]
            : `${LAB_REPORT_PROMPT}\n\nLab report text:\n${input.content}`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const raw: string = data.choices?.[0]?.message?.content ?? ''

  if (!raw) throw new Error('Empty response from model')

  try {
    return JSON.parse(stripJsonFences(raw)) as LabReportData
  } catch {
    throw new Error(`Model returned invalid JSON: ${raw.slice(0, 200)}`)
  }
}
