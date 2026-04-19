'use client'

import { useState, useMemo } from 'react'
import type { PrescriptionData } from '@/types/prescription'
import { Button } from '@/components/ui'
import { compressImage } from '@/lib/utils/image-compress'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MONTH_LABELS: Record<string, string> = {
  Jan:'January', Feb:'February', Mar:'March',    Apr:'April',
  May:'May',     Jun:'June',     Jul:'July',      Aug:'August',
  Sep:'September',Oct:'October', Nov:'November',  Dec:'December',
}

function useDatePicker() {
  const [day,   setDay]   = useState('')
  const [month, setMonth] = useState('')
  const [year,  setYear]  = useState('')

  const iso = useMemo(() => {
    if (!day || !month || year.length !== 4) return ''
    const idx = MONTHS.indexOf(month)
    if (idx < 0) return ''
    const d = new Date(+year, idx, +day)
    if (isNaN(d.getTime()) || d.getDate() !== +day) return ''
    return d.toISOString().split('T')[0]
  }, [day, month, year])

  return { day, setDay, month, setMonth, year, setYear, iso }
}

interface ManualMed {
  name:      string
  frequency: string  // X-X-X format
  duration:  string  // numeric days
}

interface Props {
  onFileSelected: (file: File) => void
  onManualData:   (data: PrescriptionData) => void
}

export default function UploadPicker({ onFileSelected, onManualData }: Props) {
  const [showManual, setShowManual] = useState(false)
  const [fileError,  setFileError]  = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const [doctor,      setDoctor]      = useState('')
  const [illness,     setIllness]     = useState('')
  const datePicker = useDatePicker()
  const [medications, setMedications] = useState<ManualMed[]>([{ name: '', frequency: '', duration: '' }])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target
    const selected = input.files?.[0]
    if (!selected) return
    if (processing) return
    setFileError(null)
    setProcessing(true)

    try {
      const file = selected.type.startsWith('image/')
        ? await compressImage(selected)
        : selected

      if (file.size > 6 * 1024 * 1024) {
        setFileError('This file is too large. Please use a file under 6 MB.')
        input.value = ''
        return
      }
      onFileSelected(file)
    } finally {
      setProcessing(false)
    }
  }

  function updateMed(index: number, field: keyof ManualMed, value: string) {
    setMedications((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function handleSubmit() {
    onManualData({
      doctor,
      doctorConfidence:  doctor.trim()        ? 'high' : 'low',
      illness,
      illnessConfidence: illness.trim()       ? 'high' : 'low',
      date:              datePicker.iso,
      dateConfidence:    datePicker.iso       ? 'high' : 'low',
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

        {/* ── Processing indicator ───────────────────────────── */}
        {processing && (
          <div className="flex items-center gap-3 px-4 py-3 bg-primary-subtle rounded-2xl border border-primary/20">
            <svg className="w-5 h-5 text-primary animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-base text-text-primary">Preparing photo…</p>
          </div>
        )}

        {/* ── Upload options ─────────────────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* PRIMARY  Take a photo (camera) */}
          <label className="block cursor-pointer active:opacity-90 transition-opacity">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              capture="environment"
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
                <p className="text-xl font-bold text-white leading-tight">Take a Photo</p>
                <p className="text-base text-white/80 mt-0.5">Use your phone's camera</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 px-1">
              <svg className="w-3.5 h-3.5 text-text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-text-muted">Works best with a steady, well-lit photo  no flash needed</p>
            </div>
          </label>

          {/* SECONDARY  Upload from gallery */}
          <label className="block cursor-pointer active:opacity-80 transition-opacity">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-4 bg-surface-container-lowest px-5 py-4 rounded-2xl min-h-[72px] border border-border"
              style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}>
              <div className="w-12 h-12 rounded-xl bg-primary-subtle flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-text-primary">Upload from Gallery</p>
                <p className="text-base text-text-muted mt-0.5">Choose an existing photo</p>
              </div>
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
                { label: 'Doctor Name',         value: doctor,  setter: setDoctor,  placeholder: 'e.g. Dr. Priya Sharma' },
                { label: 'Illness / Diagnosis', value: illness, setter: setIllness, placeholder: 'e.g. Cold and Cough' },
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

              {/* Date picker — Day / Month / Year */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-secondary block">
                  Date on Prescription
                </label>
                <div className="flex gap-2">
                  {/* Day */}
                  <input
                    type="number"
                    min="1"
                    max="31"
                    inputMode="numeric"
                    placeholder="DD"
                    value={datePicker.day}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 2)
                      datePicker.setDay(v)
                    }}
                    className="w-16 bg-surface-subtle rounded-xl px-3 py-3 text-base text-center text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-colors"
                  />
                  {/* Month */}
                  <div className="relative flex-1">
                    <select
                      value={datePicker.month}
                      onChange={(e) => datePicker.setMonth(e.target.value)}
                      className="w-full appearance-none bg-surface-subtle rounded-xl px-4 py-3 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-colors pr-8"
                      style={{ color: datePicker.month ? undefined : 'var(--color-text-muted)' }}
                    >
                      <option value="" disabled>Month</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>{MONTH_LABELS[m]}</option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {/* Year */}
                  <input
                    type="number"
                    min="1900"
                    max="2099"
                    inputMode="numeric"
                    placeholder="YYYY"
                    value={datePicker.year}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                      datePicker.setYear(v)
                    }}
                    className="w-24 bg-surface-subtle rounded-xl px-3 py-3 text-base text-center text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-colors"
                  />
                </div>
                {datePicker.iso && (
                  <p className="text-xs text-teal font-medium px-1">
                    {new Date(datePicker.iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>

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
                    {/* Name */}
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMed(i, 'name', e.target.value)}
                      placeholder="Medicine name (required)"
                      className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                    />
                    {/* Frequency M-A-N */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-text-muted">Frequency (Morning – Afternoon – Night)</p>
                      <div className="flex items-end gap-2">
                        {(['M', 'A', 'N'] as const).map((slot, si) => {
                          const parts = (med.frequency || '').split('-')
                          const val = parts[si] ?? ''
                          return (
                            <div key={slot} className="flex flex-col items-center gap-0.5">
                              <input
                                type="number"
                                min="0"
                                max="9"
                                inputMode="numeric"
                                value={val}
                                onChange={(e) => {
                                  const newParts = (med.frequency || '').split('-')
                                  while (newParts.length < 3) newParts.push('')
                                  newParts[si] = e.target.value.replace(/\D/g, '').slice(0, 1)
                                  updateMed(i, 'frequency', newParts.join('-'))
                                }}
                                className="w-12 h-10 text-center font-bold rounded-lg bg-surface-container-lowest focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                              />
                              <span className="text-[10px] text-text-muted font-semibold">{slot}</span>
                            </div>
                          )
                        })}
                        <span className="text-text-muted text-xs pb-4 ml-1">×/day</span>
                      </div>
                    </div>
                    {/* Duration */}
                    <input
                      type="number"
                      min="1"
                      inputMode="numeric"
                      value={med.duration}
                      onChange={(e) => updateMed(i, 'duration', e.target.value.replace(/\D/g, ''))}
                      placeholder="Duration (days)"
                      className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setMedications((p) => [...p, { name: '', frequency: '', duration: '' }])}
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
