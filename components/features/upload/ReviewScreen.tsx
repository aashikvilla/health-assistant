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

// Accent colours for medicine cards — cycles through a warm palette
const MED_ACCENTS = [
  'var(--color-primary, #0058bd)',
  'var(--color-teal, #0d9488)',
  '#7c3aed',
  '#d97706',
  '#db2777',
  '#059669',
  '#dc2626',
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

  const lowCount = [
    prescription.doctorConfidence  === 'low' ? 1 : 0,
    prescription.dateConfidence    === 'low' ? 1 : 0,
    prescription.illnessConfidence === 'low' ? 1 : 0,
    ...prescription.medications.map((m) => (m.confidence === 'low' ? 1 : 0)),
  ].reduce((a, b) => a + b, 0)

  const missingRequired = prescription.medications.some((m) => !m.name?.trim())

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
            <FieldRow label="Doctor"              value={prescription.doctor}  confidence={prescription.doctorConfidence}  onChange={updateDoctor} />
            <FieldRow label="Date"                value={prescription.date}    confidence={prescription.dateConfidence}    onChange={updateDate} />
            <FieldRow label="Illness / Diagnosis" value={prescription.illness} confidence={prescription.illnessConfidence} onChange={updateIllness} />
          </div>
        </section>

        {/* ── Disclaimer — before medicines ─────────────────── */}
        <div className="flex items-start gap-2.5 px-1">
          <svg className="w-4 h-4 text-text-muted flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-text-muted leading-relaxed">
            AI-extracted — these details may contain errors. Always confirm with your doctor before taking any medication.
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
              return (
                <div
                  key={i}
                  className="bg-surface-container-lowest rounded-2xl overflow-hidden"
                  style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}
                >
                  {/* Card header — medicine name as title */}
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
                    <p className="text-sm font-semibold text-text-primary truncate">{medName}</p>
                  </div>
                  {/* Fields */}
                  <div className="px-4 divide-y divide-border-subtle">
                    <FieldRow label="Name"     value={med.name}     confidence={med.confidence} onChange={(v) => updateMedication(i, 'name', v)} required />
                    <FieldRow label="Dosage"   value={med.dosage}   confidence={med.confidence} onChange={(v) => updateMedication(i, 'dosage', v)} />
                    <FieldRow label="Duration" value={med.duration} confidence={med.confidence} onChange={(v) => updateMedication(i, 'duration', v)} />
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
              Please fill in all medicine names before continuing.
            </p>
          )}
          <Button
            onClick={() => onConfirm(prescription)}
            variant="primary"
            size="lg"
            fullWidth
            disabled={missingRequired}
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
