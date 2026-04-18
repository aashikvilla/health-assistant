'use client'

/**
 * Public Upload Page  /upload
 *
 * Unauthenticated "try before signup" flow. Users upload a prescription and
 * see the AI extraction + plain-language explanation without an account.
 *
 * On clicking "Save to my account":
 *  1. Prescription data + AI explanation saved to localStorage as nuskha_pending_upload
 *  2. User is redirected to /auth?mode=signup&return=/dashboard
 *  3. After auth, PendingUploadBanner in the dashboard saves everything to the DB.
 */

import { useState }       from 'react'
import { useRouter }      from 'next/navigation'
import type { PrescriptionData, PrescriptionExplanation } from '@/types/prescription'
import type { LabReportData, LabReportExplanation }     from '@/types/lab-report'
import UploadPicker          from '@/components/features/upload/UploadPicker'
import ProcessingState       from '@/components/features/upload/ProcessingState'
import AIExplainState        from '@/components/features/upload/AIExplainState'
import ReviewScreen          from '@/components/features/upload/ReviewScreen'
import LabReportReviewScreen from '@/components/features/upload/LabReportReviewScreen'
import {
  MedicationCard,
  DoctorNotes,
  DisclaimerBanner,
  AbnormalMarkerCard,
} from '@/components/features/explanation'
import { Button } from '@/components/ui'

type Step         = 'pick' | 'processing' | 'review' | 'explaining'
type DocumentType = 'prescription' | 'lab_report'

const PENDING_KEY     = 'nuskha_pending_upload'
const NOT_MEDICAL_MSG = "This doesn't look like a prescription or lab report. Please upload a medical document."

export interface PendingUpload {
  type:            DocumentType
  data:            PrescriptionData | LabReportData
  explanation?:    PrescriptionExplanation | null
  labExplanation?: LabReportExplanation | null
  timestamp:       number
}

export default function PublicUploadPage() {
  const router = useRouter()

  const [step,         setStep]         = useState<Step>('pick')
  const [documentType, setDocumentType] = useState<DocumentType>('prescription')
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null)
  const [labReport,    setLabReport]    = useState<LabReportData | null>(null)
  const [error,        setError]        = useState<string | null>(null)
  const [explanation,  setExplanation]  = useState<PrescriptionExplanation | null>(null)
  const [explainError, setExplainError] = useState<string | null>(null)
  const [labExplanation, setLabExplanation] = useState<LabReportExplanation | null>(null)
  const [labExplainError, setLabExplainError] = useState<string | null>(null)
  const [showNotMedicalModal, setShowNotMedicalModal] = useState(false)

  // ── OCR ────────────────────────────────────────────────────────────────────

  async function runOCR(body: FormData | string) {
    setError(null)
    setStep('processing')

    try {
      const res = typeof body === 'string'
        ? await fetch('/api/ocr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: body }) })
        : await fetch('/api/ocr', { method: 'POST', body })

      if (!res.ok) {
        let msg: string | undefined
        try { msg = (await res.json()).error } catch { /* non-JSON timeout response */ }
        if (msg === NOT_MEDICAL_MSG) { setStep('pick'); setShowNotMedicalModal(true); return }
        throw new Error(msg ?? 'Something went wrong. Please try again.')
      }

      const { documentType: docType, data } = await res.json()
      setDocumentType(docType)

      if (docType === 'lab_report') {
        // Lab reports skip review → stay on processing while AI analyses
        const labData = data as LabReportData
        setLabReport(labData)
        setLabExplainError(null)
        setLabExplanation(null)
        // Stay on 'processing'  documentType is now 'lab_report' so
        // ProcessingState will show "Reading your report..." with lab steps

        try {
          const analyseRes = await fetch('/api/analyse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(labData),
          })
          if (!analyseRes.ok) {
            let msg: string | undefined
            try { msg = (await analyseRes.json()).error } catch { /* non-JSON timeout response */ }
            throw new Error(msg ?? 'Failed to analyse lab report. Please try again.')
          }
          setLabExplanation(await analyseRes.json() as LabReportExplanation)
          setStep('explaining') // Jump to insight screen with results ready
        } catch (err) {
          setLabExplainError(err instanceof Error ? err.message : 'Something went wrong')
          setStep('explaining') // Show error state
        }
      } else {
        setPrescription(data as PrescriptionData)
        setStep('review')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStep('pick')
    }
  }

  function handleFileSelected(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    runOCR(fd)
  }

  function handleManualData(data: PrescriptionData) {
    setError(null)
    setPrescription(data)
    setDocumentType('prescription')
    setStep('review')
  }

  function handleRetry() {
    setPrescription(null)
    setLabReport(null)
    setExplanation(null)
    setExplainError(null)
    setLabExplanation(null)
    setLabExplainError(null)
    setStep('pick')
  }

  // ── Confirm prescription → fetch explanation ────────────────────────────────

  async function handleConfirmPrescription(data: PrescriptionData) {
    setPrescription(data)
    setExplainError(null)
    setExplanation(null)
    setStep('explaining')

    try {
      const res = await fetch('/api/explain', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      })

      if (!res.ok) {
        const { error: msg } = await res.json()
        throw new Error(msg ?? 'Failed to generate explanation')
      }

      setExplanation(await res.json() as PrescriptionExplanation)
    } catch (err) {
      setExplainError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  // ── Lab report confirm → fetch AI analysis ──────────────────────────────────

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

  // ── Save lab analysis → localStorage & auth gate ───────────────────────────

  function handleSaveLabReport() {
    if (!labReport) return
    const pending: PendingUpload = {
      type:            'lab_report',
      data:            labReport,
      labExplanation:  labExplanation ?? null,
      timestamp:       Date.now(),
    }
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
    router.push('/auth?mode=signup&return=/dashboard')
  }

  // ── Save from explanation  include explanation in pending ─────────────────

  function handleSaveFromExplanation() {
    if (!prescription) return
    const pending: PendingUpload = {
      type:        'prescription',
      data:        prescription,
      explanation: explanation ?? null,
      timestamp:   Date.now(),
    }
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
    router.push('/auth?mode=signup&return=/dashboard')
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {step === 'pick' && (
        /* Full-screen overlay  hides marketing nav + footer during upload flow */
        <div className="fixed inset-0 z-40 bg-surface overflow-auto">
          {error && (
            <div className="mx-4 mt-4 px-4 py-3 rounded-2xl bg-error-subtle border border-error/20 flex items-start gap-3">
              <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-base text-error">{error}</p>
            </div>
          )}
          <UploadPicker onFileSelected={handleFileSelected} onManualData={handleManualData} />
        </div>
      )}

      {step === 'processing' && <ProcessingState documentType={documentType} />}

      {step === 'review' && documentType === 'prescription' && prescription && (
        <ReviewScreen data={prescription} onConfirm={handleConfirmPrescription} onRetry={handleRetry} />
      )}

      {/* ── AI Explanation/Analysis loading ── */}
      {step === 'explaining' && (
        (documentType === 'prescription' && !explanation && !explainError) ||
        (documentType === 'lab_report' && !labExplanation && !labExplainError)
      ) && (
        <AIExplainState documentType={documentType} />
      )}

      {/* ── Prescription explanation error ── */}
      {step === 'explaining' && documentType === 'prescription' && explainError && (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-error-subtle flex items-center justify-center">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">Explanation failed</p>
              <p className="text-base text-text-muted mt-1 leading-relaxed">{explainError}</p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <Button
                onClick={() => prescription && handleConfirmPrescription(prescription)}
                variant="primary"
                size="lg"
                fullWidth
                className="min-h-[56px] rounded-2xl"
              >
                Try Again
              </Button>
              <Button
                onClick={() => setStep('review')}
                variant="ghost"
                size="lg"
                fullWidth
              >
                Go back and check the details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lab report analysis error ── */}
      {step === 'explaining' && documentType === 'lab_report' && labExplainError && (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-sm flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-error-subtle flex items-center justify-center">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-text-primary">Analysis failed</p>
              <p className="text-base text-text-muted mt-1 leading-relaxed">{labExplainError}</p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <Button
                onClick={() => labReport && handleConfirmLabReport(labReport)}
                variant="primary"
                size="lg"
                fullWidth
                className="min-h-[56px] rounded-2xl"
              >
                Try Again
              </Button>
              <Button
                onClick={() => setStep('review')}
                variant="ghost"
                size="lg"
                fullWidth
              >
                Go back and check the details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Explanation screen  Prescription (Step 3) ── */}
      {step === 'explaining' && documentType === 'prescription' && explanation && (
        <div className="min-h-screen bg-surface flex flex-col">

          {/* Sticky header */}
          <nav className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border-subtle pt-safe">
            <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto w-full">
              <button
                onClick={() => setStep('review')}
                className="flex items-center justify-center -ml-2 p-2 rounded-xl text-text-primary min-w-[44px] min-h-[44px]"
                aria-label="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="text-center">
                <p className="text-base font-bold text-text-primary">Your Prescription</p>
                <p className="text-xs text-text-muted">{explanation.doctorName} · {explanation.date}</p>
              </div>
              <div className="w-10" />
            </div>
          </nav>

          {/* Step indicator */}
          <div className="px-5 pt-4 pb-2 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-primary bg-primary-subtle px-3 py-1 rounded-full">
                Step 3 of 3
              </span>
              <div className="flex gap-1.5">
                <div className="w-8 h-1.5 rounded-full bg-primary" />
                <div className="w-8 h-1.5 rounded-full bg-primary" />
                <div className="w-8 h-1.5 rounded-full bg-primary" />
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="px-5 pt-2 pb-1 max-w-2xl mx-auto w-full">
            <DisclaimerBanner doctorName={explanation.disclaimerDoctorName} />
          </div>

          {/* Medication cards */}
          <div className="flex-1 px-5 pt-4 pb-56 space-y-4 max-w-2xl mx-auto w-full">
            {explanation.medications.map((med) => (
              <MedicationCard key={med.id} medication={med} />
            ))}
            <DoctorNotes notes={explanation.doctorNotes} />
          </div>

          {/* ── Sticky Save CTA ─────────────────────────────────── */}
          <div className="fixed bottom-0 inset-x-0 z-30 pb-safe">
            <div className="bg-surface-container-lowest border-t border-border-subtle px-5 pt-4 pb-5 max-w-lg mx-auto">

              {/* Value prop */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">
                  {['📋', '👨‍👩‍👧‍👦', '🔒'].map((e) => (
                    <span key={e} className="text-base">{e}</span>
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-tight">
                  Save this · Add your family · Stay private
                </p>
              </div>

              <Button
                onClick={handleSaveFromExplanation}
                variant="primary"
                size="lg"
                fullWidth
                className="min-h-[60px] text-xl rounded-2xl"
              >
                Save to My Account  Free
              </Button>
              <p className="text-sm text-text-muted text-center mt-2">
                Create a free account in 30 seconds · No credit card needed
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ── Lab Report Analysis screen (Step 3) ── */}
      {step === 'explaining' && documentType === 'lab_report' && labExplanation && (
        <div className="min-h-screen bg-surface flex flex-col">

          {/* Sticky header */}
          <nav className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border-subtle pt-safe">
            <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto w-full">
              <button
                onClick={() => setStep('review')}
                className="flex items-center justify-center -ml-2 p-2 rounded-xl text-text-primary min-w-[44px] min-h-[44px]"
                aria-label="Go back"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="text-center">
                <p className="text-base font-bold text-text-primary">Your Lab Report</p>
                <p className="text-xs text-text-muted">
                  {labExplanation.labName}{labExplanation.testDate ? ` · ${labExplanation.testDate}` : ''}
                </p>
              </div>
              <div className="w-10" />
            </div>
          </nav>

          {/* Step indicator */}
          <div className="px-5 pt-4 pb-2 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-primary bg-primary-subtle px-3 py-1 rounded-full">
                Step 3 of 3
              </span>
              <div className="flex gap-1.5">
                <div className="w-8 h-1.5 rounded-full bg-primary" />
                <div className="w-8 h-1.5 rounded-full bg-primary" />
                <div className="w-8 h-1.5 rounded-full bg-primary" />
              </div>
            </div>
          </div>

          {/* Context line */}
          <div className="px-5 pt-2 pb-1 max-w-2xl mx-auto w-full">
            <p className="font-body text-sm text-text-muted">
              {labExplanation.doctorName ? `Referred by ${labExplanation.doctorName} · ` : ''}
              For {labExplanation.patientName || 'You'}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="px-5 pt-2 pb-1 max-w-2xl mx-auto w-full">
            <DisclaimerBanner doctorName={labExplanation.doctorName || 'your doctor'} />
          </div>

          {/* Content */}
          <div className="flex-1 px-5 pt-4 pb-56 space-y-4 max-w-2xl mx-auto w-full">

            {/* Abnormal markers */}
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

            {/* Doctor notes */}
            <DoctorNotes notes={labExplanation.doctorNotes} title="Things to follow" />
          </div>

          {/* Sticky Save CTA */}
          <div className="fixed bottom-0 inset-x-0 z-30 pb-safe">
            <div className="bg-surface-container-lowest border-t border-border-subtle px-5 pt-4 pb-5 max-w-lg mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex gap-1">
                  {['📋', '👨\u200D👩\u200D👧\u200D👦', '🔒'].map((e) => (
                    <span key={e} className="text-base">{e}</span>
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-tight">
                  Save this · Add your family · Stay private
                </p>
              </div>
              <Button
                onClick={handleSaveLabReport}
                variant="primary"
                size="lg"
                fullWidth
                className="min-h-[60px] text-xl rounded-2xl"
              >
                Save to My Account  Free
              </Button>
              <p className="text-sm text-text-muted text-center mt-2">
                Create a free account in 30 seconds · No credit card needed
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ── Not a medical document modal ── */}
      {showNotMedicalModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ background: 'rgba(24,28,33,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowNotMedicalModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl px-6 py-8 flex flex-col items-center text-center gap-5 bg-surface-container-lowest"
            style={{ boxShadow: '0 8px 48px rgba(24,28,33,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-2xl bg-error-subtle flex items-center justify-center">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-text-primary">Not Recognised</h2>
              <p className="text-base text-text-secondary leading-relaxed">
                This doesn&apos;t look like a prescription or blood report.
                Please upload a medical document.
              </p>
            </div>
            <Button
              onClick={() => setShowNotMedicalModal(false)}
              variant="primary"
              size="lg"
              fullWidth
              className="min-h-[56px] rounded-2xl"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
