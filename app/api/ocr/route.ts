import { NextRequest, NextResponse } from 'next/server'
import { extractPrescriptionData, classifyDocument, extractLabReportData } from '@/lib/extract'
import { checkRateLimit } from '@/lib/rate-limit'
import { RATE_LIMIT, RATE_WINDOW_MS } from '@/lib/rate-limit-config'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(RATE_WINDOW_MS / 1000)) },
    })
  }

  try {
    const contentType = req.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      const { text } = await req.json()
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'text field is required' }, { status: 400 })
      }
      const prescription = await extractPrescriptionData({ type: 'text', content: text })
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
        const { extractTextFromPDF } = await import('@/lib/pdf-utils')
        const text = await extractTextFromPDF(arrayBuffer)
        if (!text.trim()) {
          return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 422 })
        }
        const docType = await classifyDocument({ type: 'text', content: text })
        if (docType === 'other') {
          return NextResponse.json({ error: 'This doesn\'t look like a prescription or lab report. Please upload a medical document.' }, { status: 422 })
        }
        if (docType === 'lab_report') {
          const report = await extractLabReportData({ type: 'text', content: text })
          return NextResponse.json({ documentType: 'lab_report', data: report })
        }
        const prescription = await extractPrescriptionData({ type: 'text', content: text })
        return NextResponse.json({ documentType: 'prescription', data: prescription })
      }

      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const imageInput = { type: 'image' as const, base64, mimeType: file.type }
      const docType = await classifyDocument(imageInput)
      if (docType === 'other') {
        return NextResponse.json({ error: 'This doesn\'t look like a prescription or lab report. Please upload a medical document.' }, { status: 422 })
      }
      if (docType === 'lab_report') {
        const report = await extractLabReportData(imageInput)
        return NextResponse.json({ documentType: 'lab_report', data: report })
      }
      const prescription = await extractPrescriptionData(imageInput)
      return NextResponse.json({ documentType: 'prescription', data: prescription })
    }

    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
