'use client'

/**
 * Public Upload Page — /upload
 *
 * Unauthenticated "try before signup" flow. Users can upload a prescription
 * and see the AI extraction result without creating an account.
 *
 * On confirm:
 *  1. Prescription/lab data is saved to localStorage as nuskha_pending_upload
 *  2. User is shown a "Save to your account" screen (no alert())
 *  3. Clicking "Create free account" → /auth?mode=signup&return=/dashboard
 *     After auth, PendingUploadBanner in /hub detects the pending data and
 *     offers to save it to the DB.
 *
 * If the user is already logged in, they should be using /dashboard/upload/[profileId]
 * instead — the hub upload button routes there automatically.
 */

import { useState }       from 'react'
import { useRouter }      from 'next/navigation'
import type { PrescriptionData, PrescriptionExplanation }  from '@/types/prescription'
import type { LabReportData }     from '@/types/lab-report'
import UploadPicker          from '@/components/features/upload/UploadPicker'
import ProcessingState       from '@/components/features/upload/ProcessingState'
import ReviewScreen          from '@/components/features/upload/ReviewScreen'
import LabReportReviewScreen from '@/components/features/upload/LabReportReviewScreen'
import {
  MedicationCard,
  DoctorNotes,
  DisclaimerBanner,
  ExplanationActions,
} from '@/components/features/explanation'

type Step = 'pick' | 'processing' | 'review' | 'explaining' | 'saved'
type DocumentType = 'prescription' | 'lab_report'

const PENDING_KEY = 'nuskha_pending_upload'
const NOT_MEDICAL_MSG = "This doesn't look like a prescription or lab report. Please upload a medical document."

export interface PendingUpload {
  type:      DocumentType
  data:      PrescriptionData | LabReportData
  timestamp: number
}

export default function PublicUploadPage() {
  const router = useRouter()
  const [step, setStep]                 = useState<Step>('pick')
  const [documentType, setDocumentType] = useState<DocumentType>('prescription')
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null)
  const [labReport, setLabReport]       = useState<LabReportData | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [explanation, setExplanation]   = useState<PrescriptionExplanation | null>(null)
  const [explainError, setExplainError] = useState<string | null>(null)
  const [showNotMedicalModal, setShowNotMedicalModal] = useState(false)

  // ── OCR ────────────────────────────────────────────────────────────────────

  async function runOCR(body: FormData | string) {
    setError(null)
    setStep('processing')

    try {
      let res: Response
      if (typeof body === 'string') {
        res = await fetch('/api/ocr', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ text: body }),
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
    const formData = new FormData()
    formData.append('file', file)
    runOCR(formData)
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
    setStep('pick')
  }

  // ── Confirm — save to localStorage, show "create account" CTA ─────────────

  function confirmAndSave(type: DocumentType, data: PrescriptionData | LabReportData) {
    const pending: PendingUpload = { type, data, timestamp: Date.now() }
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
    setStep('saved')
  }

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
    confirmAndSave('prescription', prescription)
  }

  function handleConfirmLabReport(data: LabReportData) {
    confirmAndSave('lab_report', data)
  }

  function goToSignup() {
    router.push('/auth?mode=signup&return=/dashboard')
  }

  function goToSignin() {
    router.push('/auth?return=/dashboard')
  }

  // ── Saved state — the conversion screen ────────────────────────────────────

  if (step === 'saved') {
    const medCount = documentType === 'prescription'
      ? (prescription as PrescriptionData)?.medications?.length ?? 0
      : (labReport as LabReportData)?.tests?.length ?? 0
    const noun = documentType === 'prescription'
      ? `${medCount} medication${medCount !== 1 ? 's' : ''}`
      : `${medCount} test result${medCount !== 1 ? 's' : ''}`

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-surface">
        <div className="w-full max-w-md flex flex-col items-center text-center gap-6">

          {/* Success icon */}
          <div className="w-20 h-20 rounded-2xl bg-teal-subtle flex items-center justify-center">
            <svg className="w-10 h-10 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-text-primary">
              {documentType === 'prescription' ? 'Prescription read!' : 'Lab report read!'}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              We extracted <strong>{noun}</strong>. Create a free account to save this, track your
              family&apos;s records, and get plain-language explanations for every medicine.
            </p>
          </div>

          {/* Value props */}
          <div className="w-full bg-surface-subtle rounded-2xl px-5 py-4 text-left space-y-3">
            {[
              ['Save this prescription permanently', 'Access it anytime, on any device'],
              ['Add your family', 'One account for everyone in the house'],
              ['Understand every medicine', 'Plain-language explanations, no jargon'],
            ].map(([title, sub]) => (
              <div key={title} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-teal-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-teal" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{title}</p>
                  <p className="text-xs text-text-muted">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="w-full space-y-3">
            <button
              onClick={goToSignup}
              className="w-full py-4 rounded-2xl font-semibold text-sm bg-primary text-text-inverse transition-all active:scale-[0.98]"
              style={{ boxShadow: '0 4px 20px rgba(0,88,189,0.25)' }}
            >
              Create free account — Save it now
            </button>
            <button
              onClick={goToSignin}
              className="w-full py-3 rounded-2xl font-medium text-sm text-text-secondary bg-surface-muted"
            >
              Already have an account? Sign in
            </button>
            <button
              onClick={handleRetry}
              className="w-full py-2 text-sm text-text-muted"
            >
              Start over
            </button>
          </div>

          <p className="text-xs text-text-muted px-4 leading-relaxed">
            Free forever for personal use. No credit card required.
          </p>
        </div>
      </div>
    )
  }

  // ── Main upload flow ────────────────────────────────────────────────────────

  return (
    <>
      {step === 'pick' && (
        <>
          {error && (
            <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-error-subtle border border-error/20 text-sm text-error">
              {error}
            </div>
          )}
          <UploadPicker onFileSelected={handleFileSelected} onManualData={handleManualData} />
        </>
      )}

      {step === 'processing' && <ProcessingState />}

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

      {/* S05 — AI Explanation */}
      {step === 'explaining' && !explanation && !explainError && (
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="text-center space-y-4">
            <div
              className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto"
              style={{ borderColor: 'var(--nuskha-primary)', borderTopColor: 'transparent' }}
            />
            <p className="text-sm font-body" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5 }}>
              Generating explanation...
            </p>
          </div>
        </div>
      )}

      {step === 'explaining' && explainError && (
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

      {step === 'explaining' && explanation && (
        <main className="min-h-screen bg-surface">
          <nav className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-lg pt-safe">
            <div className="flex items-center justify-between px-4 h-14">
              <button
                onClick={() => setStep('review')}
                className="flex items-center justify-center -ml-2 p-2 rounded-xl text-text-primary hover:bg-surface-subtle transition-colors min-w-[44px] min-h-[44px]"
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
