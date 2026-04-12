'use client'

import { useState } from 'react'
import type { PrescriptionData } from '@/types/prescription'

interface ManualMed {
  name: string
  dosage: string
  duration: string
}

interface Props {
  onFileSelected: (file: File) => void
  onManualData: (data: PrescriptionData) => void
}

export default function UploadPicker({ onFileSelected, onManualData }: Props) {
  const [showManual, setShowManual] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const [doctor, setDoctor] = useState('')
  const [illness, setIllness] = useState('')
  const [date, setDate] = useState('')
  const [medications, setMedications] = useState<ManualMed[]>([{ name: '', dosage: '', duration: '' }])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError(null)
    if (file.size > 6 * 1024 * 1024) {
      setFileError('File is too large. Maximum size is 6 MB.')
      e.target.value = ''
      return
    }
    onFileSelected(file)
  }

  function updateMed(index: number, field: keyof ManualMed, value: string) {
    setMedications((prev) => prev.map((m, i) => i === index ? { ...m, [field]: value } : m))
  }

  function addMed() {
    setMedications((prev) => [...prev, { name: '', dosage: '', duration: '' }])
  }

  function removeMed(index: number) {
    setMedications((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    onManualData({
      doctor,
      doctorConfidence: doctor.trim() ? 'high' : 'low',
      illness,
      illnessConfidence: illness.trim() ? 'high' : 'low',
      date,
      dateConfidence: date.trim() ? 'high' : 'low',
      medications: medications
        .filter((m) => m.name.trim())
        .map((m) => ({ ...m, confidence: 'high' as const })),
    })
  }

  const canSubmit = medications.some((m) => m.name.trim())

  const inputStyle = {
    background: 'var(--nuskha-surface-low)',
    color: 'var(--nuskha-on-surface)',
    fontFamily: 'var(--font-manrope)',
    border: 'none',
  }

  function inputFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.background = 'var(--nuskha-surface-lowest)'
    e.target.style.boxShadow = '0 0 0 1.5px rgba(24,28,33,0.20)'
  }

  function inputBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    e.target.style.background = 'var(--nuskha-surface-low)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: 'var(--nuskha-surface)' }}>
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--nuskha-teal)', fontFamily: 'var(--font-manrope)' }}>
            Upload Prescription
          </p>
          <h1 className="text-3xl font-bold leading-tight" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
            How would you like to add it?
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.55, fontFamily: 'var(--font-manrope)' }}>
            We&apos;ll extract the details automatically using AI.
          </p>
        </div>

        {/* File error */}
        {fileError && (
          <div className="mb-4 px-4 py-3 rounded-xl flex gap-3" style={{ background: 'rgba(171,38,83,0.08)' }}>
            <span style={{ color: 'var(--nuskha-alert)' }}>⚠</span>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--nuskha-alert)', fontFamily: 'var(--font-manrope)' }}>
              {fileError}
            </p>
          </div>
        )}

        {/* Option cards */}
        <div className="space-y-3">

          {/* Take / Upload Photo */}
          <label
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer"
            style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--nuskha-primary-container)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--nuskha-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
                Take or Upload a Photo
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}>
                Camera, gallery, or screenshot — JPG, PNG, WEBP
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--nuskha-primary)', color: '#fff', fontFamily: 'var(--font-manrope)' }}>
              Best
            </span>
          </label>

          {/* Upload PDF */}
          <label
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer"
            style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}
          >
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--nuskha-teal-container)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--nuskha-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="13" x2="15" y2="13"/>
                <line x1="9" y1="17" x2="15" y2="17"/>
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
                Upload PDF
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}>
                For digital hospital prescriptions
              </p>
            </div>
          </label>

          {/* Type Manually */}
          <button
            onClick={() => setShowManual((v) => !v)}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all active:scale-[0.98]"
            style={{ background: showManual ? 'var(--nuskha-surface-low)' : 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}
          >
            <span className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(24,28,33,0.06)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--nuskha-on-surface)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="17" y1="10" x2="3" y2="10"/>
                <line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/>
                <line x1="17" y1="18" x2="3" y2="18"/>
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
                Type Manually
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}>
                Fallback if the photo isn&apos;t readable
              </p>
            </div>
          </button>

          {/* Structured manual entry form */}
          {showManual && (
            <div className="rounded-2xl p-4 space-y-4" style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}>

              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--nuskha-teal)', fontFamily: 'var(--font-manrope)' }}>
                Prescription Details
              </p>

              {/* Doctor */}
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.6, fontFamily: 'var(--font-manrope)' }}>
                  Doctor Name
                </label>
                <input
                  type="text"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  placeholder="e.g. Dr. Priya Sharma"
                  className="w-full rounded-xl px-4 py-3 text-base outline-none transition-colors"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Illness */}
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.6, fontFamily: 'var(--font-manrope)' }}>
                  Illness / Diagnosis
                </label>
                <input
                  type="text"
                  value={illness}
                  onChange={(e) => setIllness(e.target.value)}
                  placeholder="e.g. Upper Respiratory Tract Infection"
                  className="w-full rounded-xl px-4 py-3 text-base outline-none transition-colors"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.6, fontFamily: 'var(--font-manrope)' }}>
                  Date
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. 11 Apr 2026"
                  className="w-full rounded-xl px-4 py-3 text-base outline-none transition-colors"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                />
              </div>

              {/* Medications */}
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.6, fontFamily: 'var(--font-manrope)' }}>
                  Medications
                </p>

                {medications.map((med, i) => (
                  <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: 'var(--nuskha-surface-low)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}>
                        Medication {i + 1}
                      </span>
                      {medications.length > 1 && (
                        <button
                          onClick={() => removeMed(i)}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                          style={{ color: 'var(--nuskha-alert)' }}
                          aria-label="Remove medication"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMed(i, 'name', e.target.value)}
                      placeholder="Medicine name (required)"
                      className="w-full rounded-lg px-3 py-2.5 text-base outline-none"
                      style={{ background: 'var(--nuskha-surface-lowest)', color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-manrope)', border: 'none' }}
                    />
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMed(i, 'dosage', e.target.value)}
                      placeholder="Dosage (e.g. 1 tablet twice daily)"
                      className="w-full rounded-lg px-3 py-2.5 text-base outline-none"
                      style={{ background: 'var(--nuskha-surface-lowest)', color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-manrope)', border: 'none' }}
                    />
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMed(i, 'duration', e.target.value)}
                      placeholder="Duration (e.g. 5 days)"
                      className="w-full rounded-lg px-3 py-2.5 text-base outline-none"
                      style={{ background: 'var(--nuskha-surface-lowest)', color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-manrope)', border: 'none' }}
                    />
                  </div>
                ))}

                <button
                  onClick={addMed}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-opacity"
                  style={{ color: 'var(--nuskha-teal)', fontFamily: 'var(--font-manrope)', background: 'var(--nuskha-teal-container)' }}
                >
                  + Add another medication
                </button>
              </div>

              <button
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-40"
                style={{ background: 'var(--nuskha-primary)', color: '#fff', fontFamily: 'var(--font-jakarta)' }}
              >
                Save Prescription
              </button>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="mt-6 px-4 py-3 rounded-xl flex gap-3" style={{ background: '#fff8e1' }}>
          <span className="text-base mt-0.5">💡</span>
          <p className="text-xs leading-relaxed" style={{ color: '#7a6200', fontFamily: 'var(--font-manrope)' }}>
            If your prescription arrived on WhatsApp, screenshot it and upload the image. For best results, ensure it&apos;s flat and well-lit.
          </p>
        </div>

      </div>
    </div>
  )
}
