import { NextRequest, NextResponse } from 'next/server'
import type { LabReportData, LabReportExplanation } from '@/types/lab-report'
import { checkRateLimit } from '@/lib/rate-limit'
import { RATE_LIMIT, RATE_WINDOW_MS } from '@/lib/rate-limit-config'
import { callGemini, stripJsonFences, GeminiError } from '@/lib/gemini'

export const maxDuration = 300

function buildPrompt(report: LabReportData): string {
  // Send only abnormal tests to the model — reduces input size and thinking time.
  // Keep patient/lab metadata so the model has context for doctor notes.
  const abnormalTests = report.tests.filter(
    t => t.status === 'low' || t.status === 'high' || t.status === 'critical'
  )
  const compactReport = {
    patientName:  report.patientName,
    testDate:     report.testDate,
    labName:      report.labName,
    doctorName:   report.doctorName,
    tests: abnormalTests.length > 0 ? abnormalTests : report.tests,
  }

  return `You are a patient-friendly lab report interpreter. Given this lab report data, identify ONLY the parameters that are OUT OF RANGE (low, high, or critical) and explain each in plain English.

Lab Report:
${JSON.stringify(compactReport, null, 2)}

Return ONLY valid JSON — no markdown, no code fences:
{
  "patientName": string,
  "labName": string,
  "testDate": string,
  "doctorName": string,
  "summary": string (2-3 sentences: how the abnormal findings relate to each other, what the single most important priority is, any compounding effects between findings. Be direct and specific — not generic.),
  "connectionTags": string[] (2-4 short pill labels highlighting key links between findings, e.g. "Low D worsens PCOD", "Fix B12 first". Max 5 words each.),
  "abnormalMarkers": [
    {
      "id": "marker-0",
      "name": string (test name, clean and readable),
      "sub": string (test type + severity in one line, e.g. "25-Hydroxyvitamin D · Severely deficient" or "Serum B12 · 41% below lower limit"),
      "value": string (the result value as a string),
      "unit": string (unit of measurement),
      "status": "low" | "high" | "critical",
      "referenceRange": string (numeric range only, e.g. "30 - 70", no units),
      "explanation": string (3-4 sentences: what this marker does in the body, what this specific result means for THIS patient given their other findings, how significantly off it is, India-relevant context. Use simple language an Indian family member would understand. Never say "you have [condition]" — say "this may suggest" or "this is linked to".),
      "bodySystems": string[] (2-5 body systems or organs this marker affects, e.g. ["Bones", "Immune system", "Mood"]. Single words or short phrases only.),
      "actions": [
        {
          "title": string (concise action, e.g. "15–20 min sunlight daily"),
          "detail": string (1-2 sentences of specific guidance with Indian context where relevant),
          "urgent": boolean (true only if this action requires a doctor visit soon)
        }
      ]
    }
  ],
  "doctorNotes": string[] (3-5 specific follow-up points the patient should raise with their doctor based on the abnormal results)
}

Rules:
- ONLY include markers where status is "low", "high", or "critical". Do NOT include normal markers.
- If ALL markers are normal, return empty abnormalMarkers, empty connectionTags, summary saying all results are healthy, and one doctorNote confirming.
- Each marker must have 2–4 actions. At least one action should be a lifestyle/diet change (not just "see a doctor").
- bodySystems must be 2–5 items. Use plain anatomical terms — "Heart", "Kidneys", "Nerves", "Blood cells", "Hormones", etc.
- Be reassuring in tone. Most abnormal values are mildly off and manageable.
- Give India-relevant context in doctorNotes where useful (e.g., dietary tips with Indian foods, sunlight advice).
- doctorNotes should be specific to the abnormal findings, not generic.
- summary must synthesise across findings, not restate individual explanations.
- connectionTags must reflect real clinical relationships — no generic or obvious tags.`
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
    const report: LabReportData = await req.json()

    const apiKey = process.env.GEMINI_API_KEY_EXPLAIN
    if (!apiKey) throw new Error('GEMINI_API_KEY_EXPLAIN is not set')

    const raw = await callGemini({
      apiKey,
      prompt: buildPrompt(report),
      maxTokens: 4096,
      jsonMode: true,
    })

    try {
      const parsed = JSON.parse(stripJsonFences(raw)) as LabReportExplanation
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json(
        { error: 'AI returned malformed response. Please try again.' },
        { status: 502 }
      )
    }
  } catch (err) {
    if (err instanceof GeminiError) {
      const status = err.status === 429 ? 429 : 502
      const message = err.status === 429
        ? 'AI is currently rate-limited. Please try again in a minute.'
        : err.message
      return NextResponse.json({ error: message }, { status })
    }
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
