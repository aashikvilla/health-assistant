import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromImage } from '@/lib/ocr'
import { extractPrescriptionData } from '@/lib/extract'
import type { PrescriptionData } from '@/types/prescription'

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

const MOCK_DATA: PrescriptionData = {
  doctor: 'Dr. Priya Sharma',
  doctorConfidence: 'high',
  date: '08 Apr 2026',
  dateConfidence: 'high',
  medications: [
    {
      name: 'Amoxicillin 500mg',
      dosage: '1 capsule twice daily',
      duration: '7 days',
      confidence: 'high',
    },
    {
      name: 'Ibuprofen 400mg',
      dosage: '1 tablet as needed',
      duration: '5 days',
      confidence: 'high',
    },
    {
      name: 'Cetirizine',
      dosage: '10mg once at night',
      duration: '',
      confidence: 'low',
    },
  ],
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(req: NextRequest) {
  try {
    // Dev mode — return mock data after simulated delay
    if (DEV_MODE) {
      await sleep(3500)
      return NextResponse.json(MOCK_DATA)
    }

    const contentType = req.headers.get('content-type') ?? ''

    let rawText: string

    if (contentType.includes('application/json')) {
      // Manual text entry — skip Vision AI
      const { text } = await req.json()
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'text field is required' }, { status: 400 })
      }
      rawText = text
    } else if (contentType.includes('multipart/form-data')) {
      // File upload — run through Vision AI first
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ error: 'file field is required' }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      rawText = await extractTextFromImage(base64, file.type)

      if (!rawText.trim()) {
        return NextResponse.json({ error: 'Could not detect text in the uploaded file' }, { status: 422 })
      }
    } else {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
    }

    const prescription = await extractPrescriptionData(rawText)
    return NextResponse.json(prescription)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
