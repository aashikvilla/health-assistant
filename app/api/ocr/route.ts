import { NextRequest, NextResponse } from 'next/server'
import { extractPrescriptionData } from '@/lib/extract'
import type { PrescriptionData } from '@/types/prescription'

const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

const MOCK_DATA: PrescriptionData = {
  doctor: 'Dr. Priya Sharma',
  doctorConfidence: 'high',
  date: '08 Apr 2026',
  dateConfidence: 'high',
  illness: 'Upper Respiratory Tract Infection',
  illnessConfidence: 'high',
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
    if (DEV_MODE) {
      await sleep(3500)
      return NextResponse.json(MOCK_DATA)
    }

    const contentType = req.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      const { text } = await req.json()
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'text field is required' }, { status: 400 })
      }
      const prescription = await extractPrescriptionData({ type: 'text', content: text })
      return NextResponse.json(prescription)
    }

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      if (!file) {
        return NextResponse.json({ error: 'file field is required' }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')

      const prescription = await extractPrescriptionData({
        type: 'image',
        base64,
        mimeType: file.type,
      })
      return NextResponse.json(prescription)
    }

    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
