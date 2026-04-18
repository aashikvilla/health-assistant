import { NextRequest, NextResponse } from 'next/server'
import { extractPrescriptionData, classifyAndExtract } from '@/lib/extract'
import { checkRateLimit } from '@/lib/rate-limit'
import { RATE_LIMIT, RATE_WINDOW_MS } from '@/lib/rate-limit-config'
import { createClient } from '@/lib/supabase/server'
import { usageService } from '@/services/usage.service'

export const maxDuration = 300

export const USAGE_LIMIT_ERROR = 'USAGE_LIMIT_REACHED'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(RATE_WINDOW_MS / 1000)) },
    })
  }

  // Resolve authenticated user (anonymous uploads bypass quota)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const limit = await usageService.checkLimit(user.id)
    if (!limit.allowed) {
      return NextResponse.json({ error: USAGE_LIMIT_ERROR }, { status: 429 })
    }
  }

  try {
    const contentType = req.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      const { text } = await req.json()
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'text field is required' }, { status: 400 })
      }
      const prescription = await extractPrescriptionData({ type: 'text', content: text })
      if (user) await usageService.incrementSuccessful(user.id)
      return NextResponse.json({ documentType: 'prescription', data: prescription })
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ error: 'file field is required' }, { status: 400 })
      }

      const MAX_BYTES = 6 * 1024 * 1024 // 6 MB
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: 'File is too large. Maximum size is 6 MB.' }, { status: 413 })
      }

      const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
      if (file.type !== 'application/pdf' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Unsupported file type. Please upload a JPG, PNG, WEBP, or PDF.' }, { status: 415 })
      }

      const arrayBuffer = await file.arrayBuffer()

      if (file.type === 'application/pdf') {
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const result = await classifyAndExtract({ type: 'image', base64, mimeType: 'application/pdf' })
        if (result.documentType === 'other') {
          if (user) await usageService.incrementInvalid(user.id)
          return NextResponse.json({ error: 'This doesn\'t look like a prescription or lab report. Please upload a medical document.' }, { status: 422 })
        }
        if (user) await usageService.incrementSuccessful(user.id)
        return NextResponse.json({ documentType: result.documentType, data: result.data })
      }

      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const result = await classifyAndExtract({ type: 'image', base64, mimeType: file.type })
      if (result.documentType === 'other') {
        if (user) await usageService.incrementInvalid(user.id)
        return NextResponse.json({ error: 'This doesn\'t look like a prescription or lab report. Please upload a medical document.' }, { status: 422 })
      }
      if (user) await usageService.incrementSuccessful(user.id)
      return NextResponse.json({ documentType: result.documentType, data: result.data })
    }

    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
