import { NextRequest, NextResponse } from 'next/server'
import type { LabReportData, LabReportExplanation } from '@/types/lab-report'
import { checkRateLimit } from '@/lib/rate-limit'
import { RATE_LIMIT, RATE_WINDOW_MS } from '@/lib/rate-limit-config'
import { callGemini, stripJsonFences, GeminiError } from '@/lib/gemini'

export const maxDuration = 60

function buildPrompt(report: LabReportData): string {
  return `You are a patient-friendly lab report interpreter. Given this lab report data, identify ONLY the parameters that are OUT OF RANGE (low, high, or critical) and explain each in plain English.

Lab Report:
${JSON.stringify(report, null, 2)}

Return ONLY valid JSON  no markdown, no code fences:
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
- If ALL markers are normal, return an empty abnormalMarkers array and a single doctorNote saying "All your results are within normal range  great news!"
- Never diagnose. Say "this may suggest..." or "this marker is linked to..."  never "you have..."
- Be reassuring in tone. Most abnormal values are mildly off and manageable.
- Give India-relevant context in doctorNotes where useful (e.g., dietary tips with Indian foods, sunlight advice).
- doctorNotes should be specific to the abnormal findings, not generic.`
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
