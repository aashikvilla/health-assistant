import { NextRequest, NextResponse } from 'next/server'
import type { PrescriptionData } from '@/types/prescription'
import { checkRateLimit } from '@/lib/rate-limit'
import { RATE_LIMIT, RATE_WINDOW_MS } from '@/lib/rate-limit-config'
import { generateExplanation } from '@/lib/explain'
import { GeminiError } from '@/lib/gemini'

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

    const apiKey = process.env.GEMINI_API_KEY_EXPLAIN
    if (!apiKey) throw new Error('GEMINI_API_KEY_EXPLAIN is not set')

    const explanation = await generateExplanation(prescription, apiKey)
    if (!explanation) {
      return NextResponse.json(
        { error: 'AI is currently rate-limited. Please try again in a minute.' },
        { status: 429 }
      )
    }

    return NextResponse.json(explanation)
  } catch (err) {
    if (err instanceof GeminiError) {
      const status = err.status === 429 ? 429 : 502
      return NextResponse.json({ error: err.message }, { status })
    }
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
