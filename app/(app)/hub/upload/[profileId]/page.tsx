'use client'

/**
 * Authenticated Upload Page — /hub/upload/[profileId]
 *
 * Same OCR state machine as the public /upload page, but:
 * - User is always authenticated (enforced by (app)/layout.tsx)
 * - On confirm, uploads file to Supabase Storage, then persists extracted
 *   data to the DB via server action
 * - Linked to a specific family profile
 *
 * URL: /hub/upload/:profileId
 *
 * UX flow:
 *   pick → processing → review → saving → redirected to /hub?profile=...
 */

import { useState, useTransition, use } from 'react'
import { useRouter }      from 'next/navigation'
import { createClient }   from '@/lib/supabase/client'
import type { PrescriptionData } from '@/types/prescription'
import type { LabReportData }    from '@/types/lab-report'
import UploadPicker      from '@/components/features/upload/UploadPicker'
import ProcessingState   from '@/components/features/upload/ProcessingState'
import ReviewScreen      from '@/components/features/upload/ReviewScreen'
import LabReportReviewScreen from '@/components/features/upload/LabReportReviewScreen'
import { AppHeader }     from '@/components/layout/AppHeader'
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

type Step = 'pick' | 'processing' | 'review' | 'saving' | 'saved'
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
    setStep('pick')
  }

  // ── DB persistence ─────────────────────────────────────────────────────────

  function handleConfirmPrescription(data: PrescriptionData) {
    setSaveError(null)
    setStep('saving')
    startTransition(async () => {
      // Upload file first; fall back to 'ocr-extracted' if it fails
      const fileUrl = selectedFile
        ? (await uploadToStorage(selectedFile)) ?? 'ocr-extracted'
        : 'ocr-extracted'

      const result = await savePrescription(profileId, data, fileUrl)
      if (!result.success) {
        setSaveError(result.error)
        setStep('review')
        return
      }
      router.push(`/hub?profile=${profileId}`)
    })
  }

  function handleConfirmLabReport(data: LabReportData) {
    setSaveError(null)
    setStep('saving')
    startTransition(async () => {
      const fileUrl = selectedFile
        ? (await uploadToStorage(selectedFile)) ?? 'ocr-extracted'
        : 'ocr-extracted'

      const result = await saveLabReport(profileId, data, fileUrl)
      if (!result.success) {
        setSaveError(result.error)
        setStep('review')
        return
      }
      router.push(`/hub?profile=${profileId}`)
    })
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <AppHeader variant="page" title="Upload Prescription" backHref={`/hub?profile=${profileId}`} />

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
