'use client'

import { useState } from 'react'
import type { PrescriptionData } from '@/types/prescription'
import { Button } from '@/components/ui'

interface ManualMed {
  name:     string
  dosage:   string
  duration: string
}

interface Props {
  onFileSelected: (file: File) => void
  onManualData:   (data: PrescriptionData) => void
}

export default function UploadPicker({ onFileSelected, onManualData }: Props) {
  const [showManual, setShowManual] = useState(false)
  const [fileError,  setFileError]  = useState<string | null>(null)

  const [doctor,      setDoctor]      = useState('')
  const [illness,     setIllness]     = useState('')
  const [date,        setDate]        = useState('')
  const [medications, setMedications] = useState<ManualMed[]>([{ name: '', dosage: '', duration: '' }])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError(null)
    if (file.size > 6 * 1024 * 1024) {
      setFileError('This file is too large. Please use a file under 6 MB.')
      e.target.value = ''
      return
    }
    onFileSelected(file)
  }

  function updateMed(index: number, field: keyof ManualMed, value: string) {
    setMedications((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function handleSubmit() {
    onManualData({
      doctor,
      doctorConfidence:  doctor.trim()  ? 'high' : 'low',
      illness,
      illnessConfidence: illness.trim() ? 'high' : 'low',
      date,
      dateConfidence:    date.trim()    ? 'high' : 'low',
      medications: medications
        .filter((m) => m.name.trim())
        .map((m)   => ({ ...m, confidence: 'high' as const })),
    })
  }

  const canSubmit = medications.some((m) => m.name.trim())

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 px-5 pt-7 pb-6 flex flex-col gap-6 max-w-2xl mx-auto w-full">

        {/* ── Step indicator ─────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-primary bg-primary-subtle px-3 py-1 rounded-full">
            Step 1 of 3
          </span>
          <div className="flex gap-1.5">
            <div className="w-8 h-1.5 rounded-full bg-primary" />
            <div className="w-8 h-1.5 rounded-full bg-border" />
            <div className="w-8 h-1.5 rounded-full bg-border" />
          </div>
        </div>

        {/* ── Heading ────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary leading-tight">
            Add a Health Record
          </h1>
          <p className="text-lg text-text-secondary mt-2 leading-relaxed">
            Upload a photo, upload a file, or enter details manually
          </p>
        </div>

        {/* ── File size error ────────────────────────────────── */}
        {fileError && (
          <div className="flex items-start gap-3 px-4 py-3 bg-error-subtle rounded-2xl border border-error/20">
            <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-base text-error">{fileError}</p>
          </div>
        )}

        {/* ── Upload options ─────────────────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* PRIMARY  Photo (camera / gallery) */}
          <label className="block cursor-pointer active:opacity-90 transition-opacity">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-4 bg-primary px-5 py-5 rounded-2xl min-h-[80px]"
              style={{ boxShadow: '0 4px 20px rgba(0,88,189,0.25)' }}>
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-white leading-tight">Upload a Photo</p>
                <p className="text-base text-white/80 mt-0.5">Upload a photo from your gallery</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 px-1">
              <svg className="w-3.5 h-3.5 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-text-muted">Works best with a steady, well-lit photo  no flash needed</p>
            </div>
          </label>

          {/* SECONDARY  PDF */}
          <label className="block cursor-pointer active:opacity-80 transition-opacity">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-4 bg-surface-container-lowest px-5 py-4 rounded-2xl min-h-[72px] border border-border"
              style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}>
              <div className="w-12 h-12 rounded-xl bg-teal-subtle flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-text-primary">Upload a PDF</p>
                <p className="text-base text-text-muted mt-0.5">Tap if you have a PDF file</p>
              </div>
            </div>
          </label>

          {/* TERTIARY  Type manually */}
          <button
            onClick={() => setShowManual((v) => !v)}
            className="flex items-center gap-4 w-full bg-surface-container-lowest px-5 py-4 rounded-2xl min-h-[64px] border border-border active:opacity-80 transition-opacity text-left"
            style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}
          >
            <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-text-primary">Enter details manually</p>
              <p className="text-base text-text-muted mt-0.5">Type in your prescription  takes about 2 minutes</p>
            </div>
            <svg
              className="w-5 h-5 text-text-muted flex-shrink-0 transition-transform"
              style={{ transform: showManual ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Manual entry form */}
          {showManual && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 border border-border space-y-4"
              style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}>
              <p className="text-sm font-semibold text-teal uppercase tracking-wider">
                Prescription Details
              </p>

              {[
                { label: 'Doctor Name',          value: doctor,   setter: setDoctor,  placeholder: 'e.g. Dr. Priya Sharma' },
                { label: 'Illness / Diagnosis',  value: illness,  setter: setIllness, placeholder: 'e.g. Cold and Cough' },
                { label: 'Date on Prescription', value: date,     setter: setDate,    placeholder: 'e.g. 15 Apr 2026' },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-sm font-medium text-text-secondary block">{label}</label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-surface-subtle rounded-xl px-4 py-3 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-colors"
                  />
                </div>
              ))}

              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">Medicines</p>
                {medications.map((med, i) => (
                  <div key={i} className="bg-surface-subtle rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Medicine {i + 1}
                      </span>
                      {medications.length > 1 && (
                        <button
                          onClick={() => setMedications((p) => p.filter((_, j) => j !== i))}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-error"
                          aria-label="Remove"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {[
                      { field: 'name'     as const, placeholder: 'Medicine name (required)' },
                      { field: 'dosage'   as const, placeholder: 'Dosage e.g. 1 tablet twice daily' },
                      { field: 'duration' as const, placeholder: 'Duration e.g. 5 days' },
                    ].map(({ field, placeholder }) => (
                      <input
                        key={field}
                        type="text"
                        value={med[field]}
                        onChange={(e) => updateMed(i, field, e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                      />
                    ))}
                  </div>
                ))}
                <button
                  onClick={() => setMedications((p) => [...p, { name: '', dosage: '', duration: '' }])}
                  className="w-full py-3 rounded-xl text-base font-medium text-teal bg-teal-subtle min-h-[48px]"
                >
                  + Add another medicine
                </button>
              </div>

              <Button
                disabled={!canSubmit}
                onClick={handleSubmit}
                variant="primary"
                size="lg"
                fullWidth
                className="min-h-[56px] rounded-2xl"
              >
                Continue
              </Button>
            </div>
          )}
        </div>

        {/* ── Privacy reassurance ────────────────────────────── */}
        <div className="flex items-center justify-center gap-2">
          <svg className="w-3.5 h-3.5 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-sm text-text-muted text-center">
            Your document is encrypted and never shared
          </p>
        </div>

      </div>
    </div>
  )
}
