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

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 px-5 pt-7 pb-32 flex flex-col gap-5 max-w-2xl mx-auto w-full">

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

        {/* ── Heading ────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary leading-tight">
            Check the Details
          </h1>
          <p className="text-lg text-text-secondary mt-2 leading-relaxed">
            We read your prescription. Please check if everything looks right.
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

        {/* ── Medicines ──────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
            Medicines Found ({prescription.medications.length})
          </h2>
          <div className="flex flex-col gap-3">
            {prescription.medications.map((med, i) => (
              <div key={i} className="bg-surface-container-lowest rounded-2xl px-4 divide-y divide-border-subtle"
                style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}>
                <div className="py-2.5">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">Medicine {i + 1}</p>
                </div>
                <FieldRow label="Name"     value={med.name}     confidence={med.confidence} onChange={(v) => updateMedication(i, 'name', v)} />
                <FieldRow label="Dosage"   value={med.dosage}   confidence={med.confidence} onChange={(v) => updateMedication(i, 'dosage', v)} />
                <FieldRow label="Duration" value={med.duration} confidence={med.confidence} onChange={(v) => updateMedication(i, 'duration', v)} />
              </div>
            ))}
          </div>
        </section>

        {/* ── Disclaimer ─────────────────────────────────────── */}
        <p className="text-sm text-text-muted text-center leading-relaxed px-2">
          AI-generated — always consult your doctor before making any medical decisions.
        </p>

      </div>

      {/* ── Sticky action bar ──────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-sm px-5 py-4 pb-safe border-t border-border-subtle">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <Button
            onClick={() => onConfirm(prescription)}
            variant="primary"
            size="lg"
            fullWidth
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
