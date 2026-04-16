'use client'

import { useEffect, useState } from 'react'

interface ProcessingStateProps {
  label?: string
  documentType?: 'prescription' | 'lab_report'
}

const PRESCRIPTION_STEPS = [
  'Reading your document',
  'Finding your medications',
  'Checking all the details',
  'Writing your plain-English summary',
]

const LAB_REPORT_STEPS = [
  'Reading your report',
  'Identifying your test results',
  'Checking values against normal ranges',
  'Writing your plain-English summary',
]

export default function ProcessingState({ label, documentType }: ProcessingStateProps) {
  const STEPS = documentType === 'lab_report' ? LAB_REPORT_STEPS : PRESCRIPTION_STEPS
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [elapsed, setElapsed] = useState(0)

  // Advance steps with stagger so user sees each one complete
  useEffect(() => {
    if (activeStep >= STEPS.length - 1) return
    const t = setTimeout(() => {
      setCompletedSteps((prev) => new Set([...prev, activeStep]))
      setTimeout(() => setActiveStep((s) => s + 1), 200)
    }, 1200)
    return () => clearTimeout(t)
  }, [activeStep])

  // Elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const estimateText = elapsed < 3
    ? 'Ready in about 10 seconds'
    : elapsed < 8
    ? `About ${Math.max(2, 10 - elapsed)} seconds left`
    : elapsed < 15
    ? 'Almost there…'
    : 'Taking a little longer than usual…'

  return (
    /* Fixed overlay — covers header + footer during processing */
    <div className="fixed inset-0 z-50 bg-surface flex flex-col items-center justify-center px-6 py-10 overflow-auto">
      <div className="w-full max-w-sm flex flex-col items-center">

        {/* ── Keep-open notice — top priority ─────────────────── */}
        <div
          className="w-full flex items-start gap-3 rounded-2xl px-4 py-3.5 mb-8"
          style={{ background: 'var(--color-warning-subtle, #fffbeb)', border: '1px solid rgba(234,179,8,0.25)' }}
        >
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ color: 'var(--color-warning, #ca8a04)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
          </svg>
          <p className="text-sm font-medium leading-snug" style={{ color: 'var(--color-warning, #92400e)' }}>
            Keep this tab open — your document is being processed
          </p>
        </div>

        {/* ── Scanning document animation ──────────────────────── */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Glow ring */}
          <div
            className="absolute w-28 h-28 rounded-full animate-ping opacity-10"
            style={{ background: 'var(--color-primary)' }}
          />
          {/* Document container */}
          <div
            className="relative w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden"
            style={{ background: 'var(--color-primary)', boxShadow: '0 8px 32px rgba(0,88,189,0.35)' }}
          >
            {/* Document lines */}
            <div className="flex flex-col gap-1.5 w-10 relative z-10">
              {[100, 80, 90, 65, 75].map((w, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full bg-white"
                  style={{ width: `${w}%`, opacity: 0.6 + (i % 2) * 0.2 }}
                />
              ))}
            </div>
            {/* Scan beam */}
            <div
              className="absolute inset-x-0 h-0.5 bg-white opacity-80"
              style={{
                animation: 'scan-beam 1.6s ease-in-out infinite',
                boxShadow: '0 0 8px 2px rgba(255,255,255,0.6)',
              }}
            />
          </div>
        </div>

        <style>{`
          @keyframes scan-beam {
            0%   { top: 20%; }
            50%  { top: 80%; }
            100% { top: 20%; }
          }
          @keyframes tick-pop {
            0%   { transform: scale(0.4); opacity: 0; }
            60%  { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1);   opacity: 1; }
          }
          .tick-pop { animation: tick-pop 220ms cubic-bezier(0.34,1.56,0.64,1) forwards; }
        `}</style>

        {/* ── Text ─────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-text-primary text-center leading-tight">
          {label ?? (documentType === 'lab_report' ? 'Reading your report…' : 'Reading your prescription…')}
        </h2>
        <p className="text-base text-text-muted mt-1.5 text-center">
          {estimateText}
        </p>

        {/* ── Step list ────────────────────────────────────────── */}
        <div
          className="w-full mt-7 rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}
        >
          {STEPS.map((step, i) => {
            const done   = completedSteps.has(i)
            const active = i === activeStep
            const pending = !done && !active
            return (
              <div
                key={step}
                className="flex items-center gap-4 px-5 py-4 transition-colors duration-300"
                style={{
                  background: active
                    ? 'var(--color-primary-subtle, rgba(0,88,189,0.06))'
                    : 'var(--color-surface-container-lowest)',
                  borderBottom: i < STEPS.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                }}
              >
                {/* Step indicator */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                  style={{
                    background: done   ? 'var(--color-teal, #0d9488)'   :
                                active ? 'var(--color-primary)'          :
                                         'var(--color-surface-muted, #e5e7eb)',
                  }}
                >
                  {done ? (
                    <svg
                      className="w-4 h-4 text-white tick-pop"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : active ? (
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full opacity-25" style={{ background: 'var(--color-text-muted)' }} />
                  )}
                </div>

                {/* Label */}
                <span
                  className="text-sm transition-all duration-300"
                  style={{
                    color:      done    ? 'var(--color-text-muted)'    :
                                active  ? 'var(--color-text-primary)'  :
                                          'var(--color-text-muted)',
                    fontWeight: active  ? 600 : 400,
                    opacity:    pending ? 0.45 : 1,
                  }}
                >
                  {step}
                </span>

                {/* Active pulse dot on right */}
                {active && (
                  <div className="ml-auto flex-shrink-0">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ background: 'var(--color-primary)' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
