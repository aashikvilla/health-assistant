'use client'

/**
 * Authenticated Upload Page — /dashboard/upload/[profileId]
 *
 * Same OCR state machine as the public /upload page, but:
 * - User is always authenticated (enforced by (app)/layout.tsx)
 * - On confirm, uploads file to Supabase Storage, then persists extracted
 *   data to the DB via server action
 * - Linked to a specific family profile
 *
 * URL: /dashboard/upload/:profileId
 *
 * UX flow:
 *   pick → processing → review → explaining (S05) → saving → redirected to /dashboard?profile=...
 */

import { useState, useTransition, use } from 'react'
import { useRouter }      from 'next/navigation'
import { createClient }   from '@/lib/supabase/client'
import type { PrescriptionData, PrescriptionExplanation } from '@/types/prescription'
import type { LabReportData, LabReportExplanation } from '@/types/lab-report'
import UploadPicker      from '@/components/features/upload/UploadPicker'
import ProcessingState   from '@/components/features/upload/ProcessingState'
import ReviewScreen      from '@/components/features/upload/ReviewScreen'
import LabReportReviewScreen from '@/components/features/upload/LabReportReviewScreen'
import {
  MedicationCard,
  DoctorNotes,
  DisclaimerBanner,
  ExplanationActions,
  AbnormalMarkerCard,
} from '@/components/features/explanation'
import { savePrescription, saveLabReport } from './actions'

const BUCKET = 'medical-documents'

/**
 * Upload a file to Supabase Storage under the authenticated user's folder.
 * Returns the storage path on success, null on failure (save still proceeds
 * with fileUrl = 'ocr-extracted' as fallback).
 */
async function uploadToStorage(file: File): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const path = `${user.id}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  return error ? null : path
}

type Step = 'pick' | 'processing' | 'review' | 'explaining' | 'saving' | 'saved'
type DocumentType = 'prescription' | 'lab_report'

const NOT_MEDICAL_MSG = "This doesn't look like a prescription or lab report. Please upload a medical document."

interface PageProps {
  params: Promise<{ profileId: string }>
}

export default function AuthenticatedUploadPage({ params }: PageProps) {
  const { profileId } = use(params)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [step, setStep]                 = useState<Step>('pick')
  const [documentType, setDocumentType] = useState<DocumentType>('prescription')
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null)
  const [labReport, setLabReport]       = useState<LabReportData | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [saveError, setSaveError]       = useState<string | null>(null)
  const [explanation, setExplanation]         = useState<PrescriptionExplanation | null>(null)
  const [explainError, setExplainError]       = useState<string | null>(null)
  const [labExplanation, setLabExplanation]   = useState<LabReportExplanation | null>(null)
  const [labExplainError, setLabExplainError] = useState<string | null>(null)
  const [showNotMedicalModal, setShowNotMedicalModal] = useState(false)

  // ── OCR / extraction ───────────────────────────────────────────────────────

  async function runOCR(body: FormData | string) {
    setError(null)
    setSaveError(null)
    setStep('processing')

    try {
      let res: Response

      if (typeof body === 'string') {
        res = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: body }),
        })
      } else {
        res = await fetch('/api/ocr', { method: 'POST', body })
      }

      if (!res.ok) {
        const { error: msg } = await res.json()
        if (msg === NOT_MEDICAL_MSG) {
          setStep('pick')
          setShowNotMedicalModal(true)
          return
        }
        throw new Error(msg ?? 'Something went wrong')
      }

      const { documentType: docType, data } = await res.json()
      setDocumentType(docType)
      if (docType === 'lab_report') setLabReport(data as LabReportData)
      else setPrescription(data as PrescriptionData)
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('pick')
    }
  }

  function handleFileSelected(file: File) {
    setSelectedFile(file)
    const formData = new FormData()
    formData.append('file', file)
    runOCR(formData)
  }

  function handleManualData(data: PrescriptionData) {
    setPrescription(data)
    setDocumentType('prescription')
    setStep('review')
  }

  function handleRetry() {
    setPrescription(null)
    setLabReport(null)
    setSelectedFile(null)
    setSaveError(null)
    setExplanation(null)
    setExplainError(null)
    setLabExplanation(null)
    setLabExplainError(null)
    setStep('pick')
  }

  // ── DB persistence ─────────────────────────────────────────────────────────

  async function handleConfirmPrescription(data: PrescriptionData) {
    setPrescription(data)
    setExplainError(null)
    setExplanation(null)
    setStep('explaining')

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'Failed to generate explanation')
      }

      const result = await res.json() as PrescriptionExplanation
      setExplanation(result)
    } catch (err) {
      setExplainError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  function handleSaveFromExplanation() {
    if (!prescription) return
    setSaveError(null)
    setStep('saving')
    startTransition(async () => {
      const fileUrl = selectedFile
        ? (await uploadToStorage(selectedFile)) ?? 'ocr-extracted'
        : 'ocr-extracted'

      const result = await savePrescription(profileId, prescription, fileUrl, explanation ?? undefined)
      if (!result.success) {
        setSaveError(result.error)
        setStep('explaining')
        return
      }
      router.push(`/dashboard?profile=${profileId}`)
    })
  }

  async function handleConfirmLabReport(data: LabReportData) {
    setLabReport(data)
    setLabExplainError(null)
    setLabExplanation(null)
    setStep('explaining')

    try {
      const res = await fetch('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'Failed to analyse lab report')
      }

      setLabExplanation(await res.json() as LabReportExplanation)
    } catch (err) {
      setLabExplainError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  function handleSaveFromLabExplanation() {
    if (!labReport) return
    setSaveError(null)
    setStep('saving')
    startTransition(async () => {
      const fileUrl = selectedFile
        ? (await uploadToStorage(selectedFile)) ?? 'ocr-extracted'
        : 'ocr-extracted'

      const result = await saveLabReport(profileId, labReport, fileUrl, labExplanation ?? undefined)
      if (!result.success) {
        setSaveError(result.error)
        setStep('explaining')
        return
      }
      router.push(`/records/${result.documentId}`)
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {step === 'pick' && (
        <div className="text-2xl font-bold text-text-primary px-4 pt-6 pb-3">
          Upload Prescription
        </div>
      )}
      {step !== 'pick' && (
        <div className="text-2xl font-bold text-text-primary px-4 pt-6 pb-3">
          {step === 'explaining' && explanation ? 'Your Prescription' : 'Upload Prescription'}
        </div>
      )}

      {saveError && (
        <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-error-subtle border border-error/20 text-sm text-error">
          {saveError}
        </div>
      )}

      {(step === 'pick') && (
        <>
          {error && (
            <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-error-subtle border border-error/20 text-sm text-error">
              {error}
            </div>
          )}
          <UploadPicker onFileSelected={handleFileSelected} onManualData={handleManualData} />
        </>
      )}

      {(step === 'processing' || step === 'saving') && (
        <ProcessingState label={step === 'saving' ? 'Saving to your account…' : undefined} />
      )}

      {step === 'review' && documentType === 'lab_report' && labReport && (
        <LabReportReviewScreen
          data={labReport}
          onConfirm={handleConfirmLabReport}
          onRetry={handleRetry}
        />
      )}

      {step === 'review' && documentType === 'prescription' && prescription && (
        <ReviewScreen
          data={prescription}
          onConfirm={handleConfirmPrescription}
          onRetry={handleRetry}
        />
      )}

      {/* S05 — AI Explanation / Analysis loading */}
      {step === 'explaining' && (
        (documentType === 'prescription' && !explanation && !explainError) ||
        (documentType === 'lab_report' && !labExplanation && !labExplainError)
      ) && (
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="text-center space-y-4">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto"
              style={{ borderColor: 'var(--nuskha-primary)', borderTopColor: 'transparent' }}
            />
            <p className="text-sm font-body" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5 }}>
              {documentType === 'lab_report' ? 'Analysing your report...' : 'Generating explanation...'}
            </p>
          </div>
        </div>
      )}

      {step === 'explaining' && documentType === 'prescription' && explainError && (
        <div className="min-h-screen bg-surface flex items-center justify-center px-5">
          <div className="text-center space-y-4 max-w-xs">
            <p className="text-sm text-error font-body">{explainError}</p>
            <div className="space-y-2">
              <button
                onClick={() => prescription && handleConfirmPrescription(prescription)}
                className="text-primary text-sm font-medium font-body underline"
              >
                Try again
              </button>
              <button
                onClick={() => setStep('review')}
                className="block mx-auto text-text-secondary text-sm font-body"
              >
                Go back to review
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'explaining' && documentType === 'lab_report' && labExplainError && (
        <div className="min-h-screen bg-surface flex items-center justify-center px-5">
          <div className="text-center space-y-4 max-w-xs">
            <p className="text-sm text-error font-body">{labExplainError}</p>
            <div className="space-y-2">
              <button
                onClick={() => labReport && handleConfirmLabReport(labReport)}
                className="text-primary text-sm font-medium font-body underline"
              >
                Try again
              </button>
              <button
                onClick={() => setStep('review')}
                className="block mx-auto text-text-secondary text-sm font-body"
              >
                Go back to review
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'explaining' && documentType === 'lab_report' && labExplanation && (
        <main className="min-h-screen bg-surface flex flex-col">
          <nav className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-lg pt-safe">
            <div className="flex items-center justify-between px-4 h-14">
              <button
                onClick={() => setStep('review')}
                className="touch-target flex items-center justify-center -ml-2 p-2 rounded-xl text-text-primary hover:bg-surface-subtle transition-colors"
                aria-label="Go back"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <h1 className="font-display text-base font-semibold text-text-primary">Your Lab Report</h1>
              <div className="w-10" />
            </div>
          </nav>

          <div className="px-5 pt-3 pb-2">
            <p className="font-body text-sm text-text-muted">
              {labExplanation.doctorName ? `Referred by ${labExplanation.doctorName} · ` : ''}
              For {labExplanation.patientName || 'You'}
            </p>
          </div>

          <div className="px-5 pb-4">
            <DisclaimerBanner doctorName={labExplanation.doctorName || 'your doctor'} />
          </div>

          <section className="flex-1 px-5 pt-4 pb-28 space-y-4">
            {labExplanation.abnormalMarkers.length > 0 ? (
              <>
                <h2 className="font-display text-lg font-semibold text-text-primary">
                  Parameters Outside Normal Range ({labExplanation.abnormalMarkers.length})
                </h2>
                {labExplanation.abnormalMarkers.map((marker) => (
                  <AbnormalMarkerCard key={marker.id} marker={marker} />
                ))}
              </>
            ) : (
              <div className="bg-success-subtle rounded-2xl p-5 flex items-start gap-3">
                <svg className="w-6 h-6 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-display text-base font-semibold text-success">All Clear</p>
                  <p className="font-body text-sm text-text-secondary mt-1 leading-relaxed">
                    All your test results are within normal range. Great news!
                  </p>
                </div>
              </div>
            )}
            <DoctorNotes notes={labExplanation.doctorNotes} title="Things to follow" />
          </section>

          <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface-container-lowest/80 backdrop-blur-lg px-5 py-4 pb-safe">
            <button
              onClick={handleSaveFromLabExplanation}
              disabled={isPending}
              className="w-full h-14 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {isPending ? 'Saving…' : 'Save Lab Report'}
            </button>
          </div>
        </main>
      )}

      {step === 'explaining' && documentType === 'prescription' && explanation && (
        <main className="min-h-screen bg-surface">
          <div className="px-5 pt-3 pb-2">
            <p className="font-body text-sm text-text-muted">
              {explanation.doctorName} &middot; {explanation.date} &middot; For {explanation.patientName}
            </p>
          </div>

          <div className="px-5 pb-4">
            <DisclaimerBanner doctorName={explanation.disclaimerDoctorName} />
          </div>

          <section className="bg-surface-container-low rounded-t-3xl px-5 pt-6 pb-28 space-y-5">
            {explanation.medications.map((med) => (
              <MedicationCard key={med.id} medication={med} />
            ))}
            <DoctorNotes notes={explanation.doctorNotes} />
          </section>

          <div className="fixed bottom-0 left-0 right-0 z-30 bg-surface-container-lowest/80 backdrop-blur-lg px-5 py-4 pb-safe">
            <ExplanationActions
              prescriptionId="preview"
              onSave={handleSaveFromExplanation}
              loading={isPending}
            />
          </div>
        </main>
      )}

      {/* Not a medical document modal */}
      {showNotMedicalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(24,28,33,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowNotMedicalModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl px-6 py-8 flex flex-col items-center text-center gap-4 bg-surface-container-lowest"
            style={{ boxShadow: '0 8px 48px rgba(24,28,33,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-error-subtle">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-error">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-text-primary">Unrecognised Document</h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                This doesn&apos;t appear to be a prescription or blood report. Please upload a medical document.
              </p>
            </div>
            <button
              onClick={() => setShowNotMedicalModal(false)}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm bg-primary text-text-inverse"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </>
  )
}
