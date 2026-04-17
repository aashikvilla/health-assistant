'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PrescriptionData, PrescriptionExplanation } from '@/types/prescription'
import {
  MedicationCard,
  DoctorNotes,
  DisclaimerBanner,
  ExplanationActions,
} from '@/components/features/explanation'

export default function ExplanationPreviewPage() {
  const router = useRouter()
  const [explanation, setExplanation] = useState<PrescriptionExplanation | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('nuskha_pending_prescription')
    if (!raw) {
      router.replace('/upload')
      return
    }

    const prescription: PrescriptionData = JSON.parse(raw)

    fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescription),
    })
      .then(async (res) => {
        if (!res.ok) {
          const { error: msg } = await res.json()
          throw new Error(msg ?? 'Failed to generate explanation')
        }
        return res.json() as Promise<PrescriptionExplanation>
      })
      .then(setExplanation)
      .catch((err: Error) => setError(err.message))
  }, [router])

  if (error) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center px-5">
        <div className="text-center space-y-4 max-w-xs">
          <p className="text-text-muted text-sm font-body">{error}</p>
          <button
            onClick={() => router.push('/upload')}
            className="text-primary text-sm font-medium font-body underline"
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  if (!explanation) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center space-y-4">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto"
            style={{ borderColor: 'var(--nuskha-primary)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm font-body" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5 }}>
            Generating explanation...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-lg pt-safe">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.back()}
            className="touch-target flex items-center justify-center -ml-2 p-2 rounded-xl text-text-primary hover:bg-surface-subtle transition-colors"
            aria-label="Go back"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="font-display text-base font-semibold text-text-primary">Your Prescription</h1>
          <div className="w-10" />
        </div>
      </nav>

      {/* Context line */}
      <div className="px-5 pt-3 pb-2">
        <p className="font-body text-sm text-text-muted">
          {explanation.doctorName} &middot; {explanation.date} &middot; For {explanation.patientName}
        </p>
      </div>

      {/* Disclaimer  visible without scrolling */}
      <div className="px-5 pb-4">
        <DisclaimerBanner doctorName={explanation.disclaimerDoctorName} />
      </div>

      {/* Medication cards + doctor notes */}
      <section className="bg-surface-container-low rounded-t-3xl px-5 pt-6 pb-28 space-y-5">
        {explanation.medications.map((med) => (
          <MedicationCard key={med.id} medication={med} />
        ))}
        <DoctorNotes notes={explanation.doctorNotes} />
      </section>

      {/* Sticky bottom CTAs */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface-container-lowest/80 backdrop-blur-lg px-5 py-4 pb-safe">
        <ExplanationActions prescriptionId="preview" />
      </div>
    </main>
  )
}
