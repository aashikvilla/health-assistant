'use client'

import { useState } from 'react'
import type { LabReportData, LabTest } from '@/types/lab-report'
import type { Confidence } from '@/types/prescription'
import { Button } from '@/components/ui'
import FieldRow from './FieldRow'

interface Props {
  data:      LabReportData
  onConfirm: (data: LabReportData) => void
  onRetry:   () => void
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  normal:   { bg: 'var(--color-success-subtle)',  text: 'var(--color-success)', label: 'Normal'   },
  low:      { bg: 'var(--color-warning-subtle)',  text: 'var(--color-warning)', label: 'Low'      },
  high:     { bg: 'var(--color-error-subtle)',    text: 'var(--color-error)',   label: 'High'     },
  critical: { bg: 'var(--color-error-subtle)',    text: 'var(--color-error)',   label: 'Critical' },
  '':       { bg: 'var(--color-surface-muted)',   text: 'var(--color-text-muted)', label: '—'    },
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

  const lowCount = [
    report.patientNameConfidence === 'low' ? 1 : 0,
    report.testDateConfidence    === 'low' ? 1 : 0,
    report.labNameConfidence     === 'low' ? 1 : 0,
    report.doctorNameConfidence  === 'low' ? 1 : 0,
    ...report.tests.map((t) => (t.confidence === 'low' ? 1 : 0)),
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex-1 px-5 pt-7 pb-32 flex flex-col gap-5 max-w-2xl mx-auto w-full">

        {/* ── Step indicator ─────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-primary bg-primary-subtle px-3 py-1 rounded-full">
            Step 2 of 2
          </span>
          <div className="flex gap-1.5">
            <div className="w-8 h-1.5 rounded-full bg-primary" />
            <div className="w-8 h-1.5 rounded-full bg-primary" />
          </div>
        </div>

        {/* ── Heading ────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold text-text-primary leading-tight">
            Check the Details
          </h1>
          <p className="text-lg text-text-secondary mt-2 leading-relaxed">
            We read your lab report. Please check if everything looks right.
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
              Please tap and correct {lowCount > 1 ? 'them' : 'it'} before saving.
            </p>
          </div>
        )}

        {/* ── Report meta ────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
            Report Info
          </h2>
          <div className="bg-surface-container-lowest rounded-2xl px-4 divide-y divide-border-subtle"
            style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}>
            <FieldRow label="Patient Name" value={report.patientName}  confidence={report.patientNameConfidence}  onChange={(v) => updateField('patientName', 'patientNameConfidence', v)} />
            <FieldRow label="Test Date"    value={report.testDate}     confidence={report.testDateConfidence}     onChange={(v) => updateField('testDate', 'testDateConfidence', v)} />
            <FieldRow label="Lab / Hospital" value={report.labName}   confidence={report.labNameConfidence}      onChange={(v) => updateField('labName', 'labNameConfidence', v)} />
            <FieldRow label="Referred by"  value={report.doctorName}  confidence={report.doctorNameConfidence}   onChange={(v) => updateField('doctorName', 'doctorNameConfidence', v)} />
          </div>
        </section>

        {/* ── Test results ───────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2 px-1">
            Test Results ({report.tests.length})
          </h2>
          <div className="flex flex-col gap-3">
            {report.tests.map((test, i) => {
              const style = STATUS_STYLE[test.status] ?? STATUS_STYLE['']
              return (
                <div key={i} className="bg-surface-container-lowest rounded-2xl px-4 divide-y divide-border-subtle"
                  style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}>
                  {/* Test header row */}
                  <div className="flex items-center justify-between py-3">
                    <p className="text-base font-semibold text-text-primary truncate mr-2">
                      {test.testName || <span className="text-text-muted">Unknown test</span>}
                    </p>
                    {test.status && (
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: style.bg, color: style.text }}
                      >
                        {style.label}
                      </span>
                    )}
                  </div>
                  <FieldRow
                    label="Result"
                    value={`${test.result}${test.unit ? ' ' + test.unit : ''}`}
                    confidence={test.confidence}
                    onChange={(v) => updateTest(i, 'result', v)}
                  />
                  <FieldRow
                    label="Reference Range"
                    value={test.referenceRange}
                    confidence={test.confidence}
                    onChange={(v) => updateTest(i, 'referenceRange', v)}
                  />
                </div>
              )
            })}
          </div>
        </section>

        <p className="text-sm text-text-muted text-center leading-relaxed px-2">
          AI-generated — always consult your doctor before making any medical decisions.
        </p>

      </div>

      {/* ── Sticky action bar ──────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 bg-surface/95 backdrop-blur-sm px-5 py-4 pb-safe border-t border-border-subtle">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <Button
            onClick={() => onConfirm(report)}
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
            Upload a different document
          </Button>
        </div>
      </div>
    </div>
  )
}
