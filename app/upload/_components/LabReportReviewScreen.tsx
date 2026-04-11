'use client'

import { useState } from 'react'
import type { LabReportData, LabTest } from '@/types/lab-report'
import type { Confidence } from '@/types/prescription'
import FieldRow from './FieldRow'

interface Props {
  data: LabReportData
  onConfirm: (data: LabReportData) => void
  onRetry: () => void
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  normal:   { bg: 'rgba(0,169,157,0.1)',   text: 'var(--nuskha-teal)',  label: 'Normal'   },
  low:      { bg: 'rgba(234,179,8,0.12)',  text: '#b45309',             label: 'Low'       },
  high:     { bg: 'rgba(171,38,83,0.1)',   text: 'var(--nuskha-alert)', label: 'High'      },
  critical: { bg: 'rgba(171,38,83,0.18)',  text: 'var(--nuskha-alert)', label: 'Critical'  },
  '':       { bg: 'rgba(24,28,33,0.06)',   text: 'var(--nuskha-on-surface)', label: '—'   },
}

export default function LabReportReviewScreen({ data, onConfirm, onRetry }: Props) {
  const [report, setReport] = useState<LabReportData>(data)

  function updateField<K extends keyof LabReportData>(
    field: K,
    confidenceField: keyof LabReportData,
    val: string
  ) {
    setReport((r) => ({ ...r, [field]: val, [confidenceField]: 'high' as Confidence }))
  }

  function updateTest(index: number, field: keyof LabTest, val: string) {
    setReport((r) => {
      const tests = [...r.tests]
      tests[index] = { ...tests[index], [field]: val, confidence: 'high' as Confidence }
      return { ...r, tests }
    })
  }

  const lowConfidenceCount = [
    report.patientNameConfidence === 'low' ? 1 : 0,
    report.testDateConfidence === 'low' ? 1 : 0,
    report.labNameConfidence === 'low' ? 1 : 0,
    report.doctorNameConfidence === 'low' ? 1 : 0,
    ...report.tests.map((t) => (t.confidence === 'low' ? 1 : 0)),
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

        {/* Report details card */}
        <div className="rounded-2xl px-5 mb-4" style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}>
          <FieldRow
            label="Patient Name"
            value={report.patientName}
            confidence={report.patientNameConfidence}
            onChange={(val) => updateField('patientName', 'patientNameConfidence', val)}
          />
          <div style={{ height: 1, background: 'var(--nuskha-surface-low)' }} />
          <FieldRow
            label="Test Date"
            value={report.testDate}
            confidence={report.testDateConfidence}
            onChange={(val) => updateField('testDate', 'testDateConfidence', val)}
          />
          <div style={{ height: 1, background: 'var(--nuskha-surface-low)' }} />
          <FieldRow
            label="Lab / Hospital"
            value={report.labName}
            confidence={report.labNameConfidence}
            onChange={(val) => updateField('labName', 'labNameConfidence', val)}
          />
          <div style={{ height: 1, background: 'var(--nuskha-surface-low)' }} />
          <FieldRow
            label="Referred by"
            value={report.doctorName}
            confidence={report.doctorNameConfidence}
            onChange={(val) => updateField('doctorName', 'doctorNameConfidence', val)}
          />
        </div>

        {/* Tests */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.4, fontFamily: 'var(--font-manrope)' }}>
          Test Results ({report.tests.length})
        </p>

        <div className="space-y-3 mb-6">
          {report.tests.map((test, i) => (
            <div key={i} className="rounded-2xl px-5" style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}>
              {/* Test name row with status badge */}
              <div className="flex items-center justify-between py-3 gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.45, fontFamily: 'var(--font-manrope)', flexShrink: 0 }}>
                  Test
                </span>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  {test.status && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: STATUS_COLORS[test.status]?.bg ?? STATUS_COLORS[''].bg,
                        color: STATUS_COLORS[test.status]?.text ?? STATUS_COLORS[''].text,
                        fontFamily: 'var(--font-manrope)',
                      }}
                    >
                      {STATUS_COLORS[test.status]?.label ?? '—'}
                    </span>
                  )}
                  <span className="text-sm font-medium text-right" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
                    {test.testName || <span style={{ opacity: 0.3 }}>Unknown test</span>}
                  </span>
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--nuskha-surface-low)' }} />
              <FieldRow
                label="Result"
                value={`${test.result}${test.unit ? ' ' + test.unit : ''}`}
                confidence={test.confidence}
                onChange={(val) => updateTest(i, 'result', val)}
              />
              <div style={{ height: 1, background: 'var(--nuskha-surface-low)' }} />
              <FieldRow
                label="Reference Range"
                value={test.referenceRange}
                confidence={test.confidence}
                onChange={(val) => updateTest(i, 'referenceRange', val)}
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
            onClick={() => onConfirm(report)}
            className="w-full py-4 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, var(--nuskha-primary) 0%, #0040a0 100%)',
              color: '#fff',
              fontFamily: 'var(--font-jakarta)',
              boxShadow: '0 4px 20px rgba(0,88,189,0.3)',
            }}
          >
            Looks good — Save Lab Report
          </button>
          <button
            onClick={onRetry}
            className="w-full py-3 rounded-2xl font-medium text-sm transition-all"
            style={{ background: 'transparent', color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}
          >
            Upload a different document
          </button>
        </div>
      </div>
    </div>
  )
}
