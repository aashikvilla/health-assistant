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
import type { PrescriptionData }  from '@/types/prescription'
import type { LabReportData }     from '@/types/lab-report'
import UploadPicker          from '@/components/features/upload/UploadPicker'
import ProcessingState       from '@/components/features/upload/ProcessingState'
import ReviewScreen          from '@/components/features/upload/ReviewScreen'
import LabReportReviewScreen from '@/components/features/upload/LabReportReviewScreen'

type Step = 'pick' | 'processing' | 'review' | 'saved'
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
    setStep('pick')
  }

  // ── Confirm — save to localStorage, show "create account" CTA ─────────────

  function confirmAndSave(type: DocumentType, data: PrescriptionData | LabReportData) {
    const pending: PendingUpload = { type, data, timestamp: Date.now() }
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
    setStep('saved')
  }

  function handleConfirmPrescription(data: PrescriptionData) {
    confirmAndSave('prescription', data)
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
