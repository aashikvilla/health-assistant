import type { PrescriptionData, Medication } from '@/types/prescription'
import type { LabReportData, LabTest } from '@/types/lab-report'
import { callGemini, stripJsonFences, GEMINI_PDF_MODEL } from '@/lib/gemini'

type ImageInput = { type: 'image'; base64: string; mimeType: string }
type TextInput = { type: 'text'; content: string }

const PROMPT = `You are a medical data extraction assistant. Extract structured prescription data and return ONLY valid JSON — no markdown, no explanation, no code fences, no null values.

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
- ALL fields must always be present in the output. Never omit a field. Never use null — use "" for any missing or unclear value.
- If a field is clearly present and readable, set confidence "high". If missing, illegible, or uncertain, use "" and set confidence "low".
- Format date as DD MMM YYYY (e.g., "17 Jul 2024").
- List every distinct medication as a separate entry.
- frequency must be in X-X-X format (morning-afternoon-night doses). Examples: "1-0-1" = morning and night only, "0-0-1" = night only, "1-1-1" = three times daily. If unclear, use "" and confidence "low".
- duration is the number of days as a plain integer string (no units). Convert written durations: "10 days" → "10", "1 week" → "7", "2 weeks" → "14", "1 month" → "30". If a single follow-up duration appears for the whole prescription (e.g. "follow for 1 month"), apply it to every medication. If genuinely unclear, use "".
- Never invent data that is not visible in the document.`

const LAB_REPORT_PROMPT = `You are a medical data extraction assistant. Extract structured lab report data and return ONLY valid JSON — no markdown, no explanation, no code fences, no null values.

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
- ALL fields must always be present. Never omit a field. Never use null — use "" for any missing or unclear value.
- If a field is clearly present and readable, set confidence "high". If missing, illegible, or uncertain, use "" and set confidence "low".
- Format testDate as DD MMM YYYY (e.g., "10 Apr 2026").
- List every distinct test as a separate entry.
- For status: compare result against referenceRange — "normal" if within range, "low" if below, "high" if above, "critical" if explicitly flagged, "" if undeterminable.
- Never invent data that is not visible in the document.`

function getExtractKey(): string {
  const key = process.env.GEMINI_API_KEY_EXTRACT
  if (!key) throw new Error('GEMINI_API_KEY_EXTRACT is not set')
  return key
}

function normalizePrescription(raw: unknown): PrescriptionData {
  const p = (Array.isArray(raw) ? raw[0] ?? {} : raw ?? {}) as Record<string, unknown>
  const meds = Array.isArray(p.medications) ? p.medications : []
  return {
    doctor:            typeof p.doctor   === 'string' ? p.doctor   : '',
    doctorConfidence:  p.doctorConfidence  === 'high' ? 'high' : 'low',
    date:              typeof p.date     === 'string' ? p.date     : '',
    dateConfidence:    p.dateConfidence    === 'high' ? 'high' : 'low',
    illness:           typeof p.illness  === 'string' ? p.illness  : '',
    illnessConfidence: p.illnessConfidence === 'high' ? 'high' : 'low',
    medications: meds.map((m: unknown): Medication => {
      const med = (m ?? {}) as Record<string, unknown>
      return {
        name:       typeof med.name      === 'string' ? med.name      : '',
        frequency:  typeof med.frequency === 'string' ? med.frequency : '',
        duration:   typeof med.duration  === 'string' ? med.duration  : '',
        confidence: med.confidence === 'high' ? 'high' : 'low',
      }
    }),
  }
}

function normalizeLabReport(raw: unknown): LabReportData {
  const p = (Array.isArray(raw) ? raw[0] ?? {} : raw ?? {}) as Record<string, unknown>
  const tests = Array.isArray(p.tests) ? p.tests : []
  const validStatuses = new Set(['normal', 'low', 'high', 'critical', ''])
  return {
    patientName:           typeof p.patientName === 'string' ? p.patientName : '',
    patientNameConfidence: p.patientNameConfidence === 'high' ? 'high' : 'low',
    testDate:              typeof p.testDate    === 'string' ? p.testDate    : '',
    testDateConfidence:    p.testDateConfidence    === 'high' ? 'high' : 'low',
    labName:               typeof p.labName     === 'string' ? p.labName     : '',
    labNameConfidence:     p.labNameConfidence     === 'high' ? 'high' : 'low',
    doctorName:            typeof p.doctorName  === 'string' ? p.doctorName  : '',
    doctorNameConfidence:  p.doctorNameConfidence  === 'high' ? 'high' : 'low',
    tests: tests.map((t: unknown): LabTest => {
      const test = (t ?? {}) as Record<string, unknown>
      const status = typeof test.status === 'string' && validStatuses.has(test.status)
        ? (test.status as LabTest['status'])
        : ''
      return {
        testName:       typeof test.testName       === 'string' ? test.testName       : '',
        result:         typeof test.result         === 'string' ? test.result         : '',
        unit:           typeof test.unit           === 'string' ? test.unit           : '',
        referenceRange: typeof test.referenceRange === 'string' ? test.referenceRange : '',
        status,
        confidence: test.confidence === 'high' ? 'high' : 'low',
      }
    }),
  }
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
    maxTokens: 2048,
    jsonMode: true,
  })

  try {
    return normalizePrescription(JSON.parse(stripJsonFences(raw)))
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
    return normalizeLabReport(JSON.parse(stripJsonFences(raw)))
  } catch {
    throw new Error(`Model returned invalid JSON: ${raw.slice(0, 200)}`)
  }
}

const COMBINED_PROMPT = `You are a medical document extractor. Classify the document type and extract all data in a single JSON response — no markdown, no code fences, no null values.

If this is a PRESCRIPTION return:
{
  "documentType": "prescription",
  "doctor": string,
  "doctorConfidence": "high" | "low",
  "date": string,
  "dateConfidence": "high" | "low",
  "illness": string,
  "illnessConfidence": "high" | "low",
  "medications": [{ "name": string, "frequency": string, "duration": string, "confidence": "high" | "low" }]
}

If this is a LAB REPORT return:
{
  "documentType": "lab_report",
  "patientName": string,
  "patientNameConfidence": "high" | "low",
  "testDate": string,
  "testDateConfidence": "high" | "low",
  "labName": string,
  "labNameConfidence": "high" | "low",
  "doctorName": string,
  "doctorNameConfidence": "high" | "low",
  "tests": [{ "testName": string, "result": string, "unit": string, "referenceRange": string, "status": "normal" | "low" | "high" | "critical" | "", "confidence": "high" | "low" }]
}

If NEITHER return:
{ "documentType": "other" }

Rules:
- ALL fields must be present. Never omit a field. Never use null — use "" for missing values.
- If clearly readable set confidence "high", otherwise use "" and confidence "low".
- Format dates as DD MMM YYYY (e.g. "17 Jul 2024").
- frequency in X-X-X format (morning-afternoon-night). E.g. "1-0-1", "0-0-1". Use "" if unclear.
- duration as plain integer days. Convert: "1 week"→"7", "1 month"→"30". Apply global prescription duration to all medications if stated. Use "" if unclear.
- For lab status: "normal" within range, "low" below, "high" above, "critical" if flagged, "" if unclear.
- Never invent data not visible in the document.`

export type ClassifyAndExtractResult =
  | { documentType: 'prescription'; data: PrescriptionData }
  | { documentType: 'lab_report';   data: LabReportData }
  | { documentType: 'other';        data: null }

export async function classifyAndExtract(input: ImageInput | TextInput): Promise<ClassifyAndExtractResult> {
  const prompt = input.type === 'text'
    ? `${COMBINED_PROMPT}\n\nDocument text:\n${input.content}`
    : COMBINED_PROMPT

  const isPdf = input.type === 'image' && input.mimeType === 'application/pdf'
  const raw = await callGemini({
    apiKey: getExtractKey(),
    prompt,
    image: input.type === 'image' ? { base64: input.base64, mimeType: input.mimeType } : undefined,
    maxTokens: 4096,
    jsonMode: true,
    ...(isPdf ? { model: GEMINI_PDF_MODEL } : {}),
  })

  let parsed: Record<string, unknown>
  try {
    const json = JSON.parse(stripJsonFences(raw))
    parsed = (Array.isArray(json) ? json[0] ?? {} : json) as Record<string, unknown>
  } catch {
    throw new Error(`Model returned invalid JSON: ${raw.slice(0, 200)}`)
  }

  const docType = parsed.documentType
  if (docType === 'prescription') return { documentType: 'prescription', data: normalizePrescription(parsed) }
  if (docType === 'lab_report')   return { documentType: 'lab_report',   data: normalizeLabReport(parsed) }
  return { documentType: 'other', data: null }
}
