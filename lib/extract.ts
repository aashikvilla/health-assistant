import type { PrescriptionData } from '@/types/prescription'
import type { LabReportData } from '@/types/lab-report'
import { callGemini, stripJsonFences } from '@/lib/gemini'

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
      "frequency": string,
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
- frequency must be in X-X-X format representing morning-afternoon-night doses (e.g. "1-0-1" means 1 in morning, 0 at noon, 1 at night; "0-0-1" means night only). Use 0 if not taken at that time. If unclear, use empty string and set confidence "low".
- duration must be a plain number representing days only (e.g. "7", not "7 days" or "one week"). If unclear, use empty string and set confidence "low".
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

function getExtractKey(): string {
  const key = process.env.GEMINI_API_KEY_EXTRACT
  if (!key) throw new Error('GEMINI_API_KEY_EXTRACT is not set')
  return key
}

export async function extractPrescriptionData(
  input: ImageInput | TextInput
): Promise<PrescriptionData> {
  const prompt = input.type === 'image'
    ? PROMPT
    : `${PROMPT}\n\nManual prescription entry:\n${input.content}`

  const raw = await callGemini({
    apiKey: getExtractKey(),
    prompt,
    image: input.type === 'image' ? { base64: input.base64, mimeType: input.mimeType } : undefined,
    maxTokens: 1024,
    jsonMode: true,
  })

  try {
    const parsed = JSON.parse(stripJsonFences(raw)) as PrescriptionData
    return { ...parsed, medications: parsed.medications ?? [] }
  } catch {
    throw new Error(`Model returned invalid JSON: ${raw.slice(0, 200)}`)
  }
}

export async function classifyDocument(input: ImageInput | TextInput): Promise<'prescription' | 'lab_report' | 'other'> {
  const classifyPrompt = 'Classify this medical document. Reply with ONLY one of these exact words: prescription, lab_report, other'

  const prompt = input.type === 'image'
    ? classifyPrompt
    : `${classifyPrompt}\n\n${input.content.slice(0, 1000)}`

  const raw = await callGemini({
    apiKey: getExtractKey(),
    prompt,
    image: input.type === 'image' ? { base64: input.base64, mimeType: input.mimeType } : undefined,
    maxTokens: 100,
    jsonMode: false,
  })

  const normalized = raw.trim().toLowerCase()
  if (normalized.includes('lab_report') || normalized.includes('lab report')) return 'lab_report'
  if (normalized.includes('prescription')) return 'prescription'
  return 'other'
}

export async function extractLabReportData(input: ImageInput | TextInput): Promise<LabReportData> {
  const prompt = input.type === 'image'
    ? LAB_REPORT_PROMPT
    : `${LAB_REPORT_PROMPT}\n\nLab report text:\n${input.content}`

  const raw = await callGemini({
    apiKey: getExtractKey(),
    prompt,
    image: input.type === 'image' ? { base64: input.base64, mimeType: input.mimeType } : undefined,
    maxTokens: 4096,
    jsonMode: true,
  })

  try {
    const parsed = JSON.parse(stripJsonFences(raw)) as LabReportData
    return { ...parsed, tests: parsed.tests ?? [] }
  } catch {
    throw new Error(`Model returned invalid JSON: ${raw.slice(0, 200)}`)
  }
}
