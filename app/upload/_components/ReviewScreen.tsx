'use client'

import { useState } from 'react'
import type { PrescriptionData, Medication, Confidence } from '@/types/prescription'
import FieldRow from './FieldRow'

interface Props {
  data: PrescriptionData
  onConfirm: (data: PrescriptionData) => void
  onRetry: () => void
}

export default function ReviewScreen({ data, onConfirm, onRetry }: Props) {
  const [prescription, setPrescription] = useState<PrescriptionData>(data)

  function updateDoctor(val: string) {
    setPrescription((p) => ({ ...p, doctor: val, doctorConfidence: 'high' as Confidence }))
  }

  function updateDate(val: string) {
    setPrescription((p) => ({ ...p, date: val, dateConfidence: 'high' as Confidence }))
  }

  function updateMedication(index: number, field: keyof Medication, val: string) {
    setPrescription((p) => {
      const meds = [...p.medications]
      meds[index] = { ...meds[index], [field]: val, confidence: 'high' as Confidence }
      return { ...p, medications: meds }
    })
  }

  const lowConfidenceCount = [
    prescription.doctorConfidence === 'low' ? 1 : 0,
    prescription.dateConfidence === 'low' ? 1 : 0,
    ...prescription.medications.map((m) => (m.confidence === 'low' ? 1 : 0)),
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen flex flex-col px-5 py-10" style={{ background: 'var(--nuskha-surface)' }}>
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col">

        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--nuskha-teal)', fontFamily: 'var(--font-manrope)' }}>
            Review & Confirm
          </p>
          <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
            Does this look right?
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}>
            Tap any field to correct it before saving.
          </p>
        </div>

        {/* Low confidence notice */}
        {lowConfidenceCount > 0 && (
          <div className="mb-4 px-4 py-3 rounded-xl flex gap-3" style={{ background: 'rgba(171,38,83,0.06)' }}>
            <span style={{ color: 'var(--nuskha-alert)', fontSize: '1rem' }}>⚠</span>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--nuskha-alert)', fontFamily: 'var(--font-manrope)' }}>
              {lowConfidenceCount} field{lowConfidenceCount > 1 ? 's' : ''} couldn&apos;t be read clearly. Please verify before saving.
            </p>
          </div>
        )}

        {/* Prescription details card */}
        <div className="rounded-2xl px-5 mb-4" style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}>
          <FieldRow
            label="Doctor"
            value={prescription.doctor}
            confidence={prescription.doctorConfidence}
            onChange={updateDoctor}
          />
          <div style={{ height: 1, background: 'var(--nuskha-surface-low)' }} />
          <FieldRow
            label="Date"
            value={prescription.date}
            confidence={prescription.dateConfidence}
            onChange={updateDate}
          />
        </div>

        {/* Medications */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.4, fontFamily: 'var(--font-manrope)' }}>
          Medications ({prescription.medications.length})
        </p>

        <div className="space-y-3 mb-6">
          {prescription.medications.map((med, i) => (
            <div key={i} className="rounded-2xl px-5" style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}>
              <FieldRow
                label="Medication name"
                value={med.name}
                confidence={med.confidence}
                onChange={(val) => updateMedication(i, 'name', val)}
              />
              <div style={{ height: 1, background: 'var(--nuskha-surface-low)' }} />
              <FieldRow
                label="Dosage"
                value={med.dosage}
                confidence={med.confidence}
                onChange={(val) => updateMedication(i, 'dosage', val)}
              />
              <div style={{ height: 1, background: 'var(--nuskha-surface-low)' }} />
              <FieldRow
                label="Duration"
                value={med.duration}
                confidence={med.confidence}
                onChange={(val) => updateMedication(i, 'duration', val)}
              />
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center mb-6 px-4 leading-relaxed" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.4, fontFamily: 'var(--font-manrope)' }}>
          AI-generated — always consult your doctor before making any medical decisions.
        </p>

        {/* Actions */}
        <div className="space-y-3 mt-auto">
          <button
            onClick={() => onConfirm(prescription)}
            className="w-full py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, var(--nuskha-primary) 0%, #0040a0 100%)',
              color: '#fff',
              fontFamily: 'var(--font-jakarta)',
              boxShadow: '0 4px 20px rgba(0,88,189,0.3)',
            }}
          >
            Looks good — Save Prescription
          </button>
          <button
            onClick={onRetry}
            className="w-full py-3 rounded-2xl font-medium text-sm transition-all"
            style={{ background: 'transparent', color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}
          >
            Upload a different prescription
          </button>
        </div>
      </div>
    </div>
  )
}
