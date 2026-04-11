'use client'

import { useState } from 'react'
import type { PrescriptionData } from '@/types/prescription'
import type { LabReportData } from '@/types/lab-report'
import UploadPicker from './_components/UploadPicker'
import ProcessingState from './_components/ProcessingState'
import ReviewScreen from './_components/ReviewScreen'
import LabReportReviewScreen from './_components/LabReportReviewScreen'

type Step = 'pick' | 'processing' | 'review'
type DocumentType = 'prescription' | 'lab_report'

const NOT_MEDICAL_MSG = "This doesn't look like a prescription or lab report. Please upload a medical document."

export default function UploadPage() {
  const [step, setStep] = useState<Step>('pick')
  const [documentType, setDocumentType] = useState<DocumentType>('prescription')
  const [prescription, setPrescription] = useState<PrescriptionData | null>(null)
  const [labReport, setLabReport] = useState<LabReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showNotMedicalModal, setShowNotMedicalModal] = useState(false)

  async function runOCR(body: FormData | string) {
    setError(null)
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
        res = await fetch('/api/ocr', {
          method: 'POST',
          body,
        })
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

      if (docType === 'lab_report') {
        setLabReport(data as LabReportData)
      } else {
        setPrescription(data as PrescriptionData)
      }

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

  function handleConfirmPrescription(data: PrescriptionData) {
    localStorage.setItem('nuskha_pending_prescription', JSON.stringify(data))
    alert('Prescription saved! Sign in to store it permanently.')
  }

  function handleConfirmLabReport(data: LabReportData) {
    localStorage.setItem('nuskha_pending_lab_report', JSON.stringify(data))
    alert('Lab report saved! Sign in to store it permanently.')
  }

  function handleRetry() {
    setPrescription(null)
    setLabReport(null)
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
            onManualData={handleManualData}
          />
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
            className="w-full max-w-sm rounded-3xl px-6 py-8 flex flex-col items-center text-center gap-4"
            style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 8px 48px rgba(24,28,33,0.18)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(171,38,83,0.1)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--nuskha-alert)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
                Unrecognised Document
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.6, fontFamily: 'var(--font-manrope)' }}>
                The uploaded file doesn&apos;t appear to be a prescription or a blood report. Please upload a medical document and try again.
              </p>
            </div>
            <button
              onClick={() => setShowNotMedicalModal(false)}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, var(--nuskha-primary) 0%, #0040a0 100%)',
                color: '#fff',
                fontFamily: 'var(--font-jakarta)',
                boxShadow: '0 4px 20px rgba(0,88,189,0.3)',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </>
  )
}
