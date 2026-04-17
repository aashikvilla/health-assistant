'use client'

import { useState } from 'react'
import type { PrescriptionData, Medication, Confidence } from '@/types/prescription'
import { Button } from '@/components/ui'
import FieldRow from './FieldRow'

interface Props {
  data:      PrescriptionData
  onConfirm: (data: PrescriptionData) => void
  onRetry:   () => void
}

// Accent colours for medicine cards  cycles through a warm palette
const MED_ACCENTS = [
  'var(--color-primary)',
  'var(--color-teal)',
  'var(--color-accent-hover)',
  'var(--color-warning)',
  'var(--color-tertiary)',
  'var(--color-success)',
  'var(--color-error)',
]

export default function ReviewScreen({ data, onConfirm, onRetry }: Props) {
  const [prescription, setPrescription] = useState<PrescriptionData>(data)

  function updateDoctor(val: string)  { setPrescription((p) => ({ ...p, doctor:  val, doctorConfidence:  'high' as Confidence })) }
  function updateDate(val: string)    { setPrescription((p) => ({ ...p, date:    val, dateConfidence:    'high' as Confidence })) }
  function updateIllness(val: string) { setPrescription((p) => ({ ...p, illness: val, illnessConfidence: 'high' as Confidence })) }

  function updateMedication(index: number, field: keyof Medication, val: string) {
    setPrescription((p) => {
      const meds = [...p.medications]
      meds[index] = { ...meds[index], [field]: val, confidence: 'high' as Confidence }
      return { ...p, medications: meds }
    })
  }

  function removeMedication(index: number) {
    setPrescription((p) => ({
      ...p,
      medications: p.medications.filter((_, i) => i !== index)
    }))
  }

  function confirmDoctor()  { setPrescription(p => ({ ...p, doctorConfidence:  'high' as Confidence })) }
  function confirmDate()    { setPrescription(p => ({ ...p, dateConfidence:    'high' as Confidence })) }
  function confirmIllness() { setPrescription(p => ({ ...p, illnessConfidence: 'high' as Confidence })) }
  function confirmMedication(index: number) {
    setPrescription(p => {
      const meds = [...p.medications]
      meds[index] = { ...meds[index], confidence: 'high' as Confidence }
      return { ...p, medications: meds }
    })
  }

  const isFrequencyValid = (f: string) => /^\d-\d-\d$/.test(f)

  const lowCount = [
    prescription.doctorConfidence  === 'low' ? 1 : 0,
    prescription.dateConfidence    === 'low' ? 1 : 0,
    prescription.illnessConfidence === 'low' ? 1 : 0,
    ...prescription.medications.map((m) => (m.confidence === 'low' ? 1 : 0)),
  ].reduce((a, b) => a + b, 0)

  const missingRequired =
    !prescription.doctor.trim()  ||
    !prescription.date.trim()    ||
    !prescription.illness.trim() ||
    prescription.medications.some(
      (m) => !m.name?.trim() || !isFrequencyValid(m.frequency ?? '') || !m.duration?.trim()
    )

  // Compute duplicate medication names (case-insensitive, trimmed)
  const duplicateNames = new Set<string>()
  const seenNames = new Set<string>()
  prescription.medications.forEach((med) => {
    const normalizedName = med.name?.toLowerCase().trim() || ''
    if (normalizedName && seenNames.has(normalizedName)) {
      duplicateNames.add(normalizedName)
    }
    if (normalizedName) {
      seenNames.add(normalizedName)
    }
  })

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 px-5 pt-7 pb-36 flex flex-col gap-5 max-w-2xl mx-auto w-full">

        {/* ── Step indicator ─────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-primary bg-primary-subtle px-3 py-1 rounded-full">
            Step 2 of 3
          </span>
          <div className="flex gap-1.5">
            <div className="w-8 h-1.5 rounded-full bg-primary" />
            <div className="w-8 h-1.5 rounded-full bg-primary" />
            <div className="w-8 h-1.5 rounded-full bg-border" />
          </div>
        </div>

        {/* ── Heading + escape link ──────────────────────────── */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-text-primary leading-tight">
              Check the Details
            </h1>
            <button
              onClick={onRetry}
              className="flex-shrink-0 text-sm text-text-muted underline underline-offset-2 mt-1 hover:text-primary transition-colors"
            >
              Wrong document?
            </button>
          </div>
          <p className="text-lg text-text-secondary mt-2 leading-relaxed">
            We read your prescription. Check that everything looks right.
          </p>
        </div>

        {/* ── Low confidence warning ─────────────────────────── */}
        {lowCount > 0 && (
          <div className="flex items-start gap-3 bg-warning-subtle rounded-2xl px-4 py-4 border border-warning/20">
            <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-base text-text-secondary leading-relaxed">
              <strong className="text-text-primary">
                {lowCount} detail{lowCount > 1 ? 's' : ''} could not be read clearly.
              </strong>{' '}
              Please tap and correct {lowCount > 1 ? 'them' : 'it'} before continuing.
            </p>
          </div>
        )}

        {/* ── Prescription info ──────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
            Prescription Info
          </h2>
          <div className="bg-surface-container-lowest rounded-2xl px-4 divide-y divide-border-subtle"
            style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}>
            <FieldRow label="Doctor"              value={prescription.doctor}  confidence={prescription.doctorConfidence}  onChange={updateDoctor}  required onConfirm={confirmDoctor} />
            <FieldRow label="Date"                value={prescription.date}    confidence={prescription.dateConfidence}    onChange={updateDate}    required onConfirm={confirmDate} />
            <FieldRow label="Illness / Diagnosis" value={prescription.illness} confidence={prescription.illnessConfidence} onChange={updateIllness} required onConfirm={confirmIllness} />
          </div>
        </section>

        {/* ── Disclaimer  before medicines ─────────────────── */}
        <div className="flex items-start gap-2.5 px-1">
          <svg className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-text-muted leading-relaxed">
            AI-extracted  these details may contain errors. Always confirm with your doctor before taking any medication.
          </p>
        </div>

        {/* ── Medicines ──────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
            Medicines Found ({prescription.medications.length})
          </h2>
          <div className="flex flex-col gap-3">
            {prescription.medications.map((med, i) => {
              const accent = MED_ACCENTS[i % MED_ACCENTS.length]
              const medName = med.name?.trim() || `Medicine ${i + 1}`
              const normalizedName = med.name?.toLowerCase().trim() || ''
              
              // Check if this is a duplicate (later occurrence)
              const isDuplicate = normalizedName && duplicateNames.has(normalizedName)
              const isFirstOccurrence = isDuplicate && prescription.medications.findIndex(m => 
                m.name?.toLowerCase().trim() === normalizedName
              ) === i

              return (
                <div key={i}>
                  {/* Duplicate warning banner (only for later occurrences) */}
                  {isDuplicate && !isFirstOccurrence && (
                    <div className="flex items-start gap-3 bg-warning-subtle rounded-2xl px-4 py-3 border border-warning/20 mb-3">
                      <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm text-text-primary font-medium">
                          "{medName}" appears more than once  was this prescribed twice?
                        </p>
                      </div>
                      <button
                        onClick={() => removeMedication(i)}
                        className="text-xs font-semibold text-warning hover:text-warning-dark px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div
                    className="bg-surface-container-lowest rounded-2xl overflow-hidden"
                    style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}
                  >
                  {/* Card header  medicine name as title */}
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderLeft: `3px solid ${accent}` }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: accent }}
                    >
                      {i + 1}
                    </div>
                    <p className="text-sm font-semibold text-text-primary truncate flex-1">{medName}</p>
                    <button
                      onClick={() => removeMedication(i)}
                      className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-text-muted hover:text-error hover:bg-error-subtle transition-colors"
                      aria-label={`Remove ${medName}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  {/* Fields */}
                  <div className="px-4 divide-y divide-border-subtle">
                    <FieldRow label="Name" value={med.name} confidence={med.confidence} onChange={(v) => updateMedication(i, 'name', v)} required onConfirm={() => confirmMedication(i)} />

                    {/* Frequency — M / A / N inputs */}
                    <div className="flex items-start gap-3 py-4 min-h-[64px]">
                      <div className="flex-shrink-0 mt-1">
                        {!isFrequencyValid(med.frequency ?? '') ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-error-subtle" title="Required — fill in frequency" aria-label="Required field">
                            <svg className="w-3.5 h-3.5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01" />
                            </svg>
                          </span>
                        ) : med.confidence === 'high' ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-subtle" title="Looks good" aria-label="High confidence">
                            <svg className="w-3.5 h-3.5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        ) : (
                          <button type="button" onClick={() => confirmMedication(i)} className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-warning-subtle" title="Tap to confirm this looks right" aria-label="Confirm frequency">
                            <svg className="w-3.5 h-3.5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-muted mb-2">Frequency</p>
                        <div className="flex items-end gap-2">
                          {(['M', 'A', 'N'] as const).map((slot, si) => {
                            const parts = (med.frequency || '').split('-')
                            const val = parts[si] ?? ''
                            return (
                              <div key={slot} className="flex flex-col items-center gap-1">
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
                                    updateMedication(i, 'frequency', newParts.join('-'))
                                  }}
                                  className="w-12 h-12 text-center text-lg font-bold rounded-xl bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors"
                                />
                                <span className="text-[10px] text-text-muted font-semibold">{slot}</span>
                              </div>
                            )
                          })}
                          <span className="text-text-muted text-sm pb-1 ml-1">×/day</span>
                        </div>
                      </div>
                    </div>

                    <FieldRow label="Duration (days)" value={med.duration} confidence={med.confidence} onChange={(v) => updateMedication(i, 'duration', v.replace(/\D/g, ''))} required onConfirm={() => confirmMedication(i)} />
                  </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

      </div>

      {/* ── Sticky action bar ──────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-sm px-5 py-4 pb-safe border-t border-border-subtle">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          {missingRequired && (
            <p className="text-sm text-error text-center font-medium">
              Please fill in all required fields before continuing.
            </p>
          )}
          {!missingRequired && lowCount > 0 && (
            <p className="text-sm text-error text-center font-medium">
              Please verify the flagged fields before continuing.
            </p>
          )}
          <Button
            onClick={() => onConfirm(prescription)}
            variant="primary"
            size="lg"
            fullWidth
            disabled={missingRequired || lowCount > 0}
            className="min-h-[60px] text-xl rounded-2xl"
          >
            Yes, This Looks Right →
          </Button>
          <Button
            onClick={onRetry}
            variant="ghost"
            size="lg"
            fullWidth
          >
            Upload a different prescription
          </Button>
        </div>
      </div>
    </div>
  )
}
