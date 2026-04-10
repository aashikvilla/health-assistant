'use client'

import { useState } from 'react'
import type { PrescriptionData } from '@/types/prescription'
import UploadPicker from './_components/UploadPicker'
import ProcessingState from './_components/ProcessingState'
import ReviewScreen from './_components/ReviewScreen'

type Step = 'pick' | 'processing' | 'review'

export default function UploadPage() {
  const [step, setStep] = useState<Step>('pick')
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runOCR(body: FormData | string) {
    setError(null)
    setStep('processing')

    try {
      let res: Response

      if (typeof body === 'string') {
        // Manual text entry
        res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: body }),
        })
      } else {
        // File upload
        res = await fetch('/api/ocr', {
          method: 'POST',
          body,
        })
      }

      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'Something went wrong')
      }

      const data: PrescriptionData = await res.json()
      setPrescription(data)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('pick')
    }
  }

  function handleFileSelected(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    runOCR(formData)
  }

  function handleManualText(text: string) {
    runOCR(text)
  }

  function handleConfirm(data: PrescriptionData) {
    localStorage.setItem('nuskha_pending_prescription', JSON.stringify(data))
    // Auth section reads this key after login and writes to Supabase
    // For now, show a simple success state
    alert('Prescription saved! Sign in to store it permanently.')
  }

  function handleRetry() {
    setPrescription(null)
    setStep('pick')
  }

  return (
    <>
      {step === 'pick' && (
        <>
          {error && (
            <div
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-sm shadow-lg max-w-sm w-full mx-4"
              style={{ background: 'rgba(171,38,83,0.1)', color: 'var(--nuskha-alert)', fontFamily: 'var(--font-manrope)' }}
            >
              {error}
            </div>
          )}
          <UploadPicker
            onFileSelected={handleFileSelected}
            onManualText={handleManualText}
          />
        </>
      )}

      {step === 'processing' && <ProcessingState />}

      {step === 'review' && prescription && (
        <ReviewScreen
          data={prescription}
          onConfirm={handleConfirm}
          onRetry={handleRetry}
        />
      )}
    </>
  )
}
