'use client'

import { useEffect, useState } from 'react'

interface AIExplainStateProps {
  documentType?: 'prescription' | 'lab_report'
}

const PRESCRIPTION_STEPS = [
  'Reading your prescription details',
  'Looking up each medication',
  'Writing your plain-English guide',
  'Almost ready…',
]

const LAB_REPORT_STEPS = [
  'Reading your test results',
  'Checking each value',
  'Writing your plain-English analysis',
  'Almost ready…',
]

export default function AIExplainState({ documentType }: AIExplainStateProps) {
  const STEPS = documentType === 'lab_report' ? LAB_REPORT_STEPS : PRESCRIPTION_STEPS
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (activeStep >= STEPS.length - 1) return
    const t = setTimeout(() => {
      setCompletedSteps((prev) => new Set([...prev, activeStep]))
      setTimeout(() => setActiveStep((s) => s + 1), 200)
    }, 2000)
    return () => clearTimeout(t)
  }, [activeStep])

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const countdownText = elapsed < 5
    ? 'About 15 seconds'
    : elapsed < 10
    ? `About ${Math.max(5, 20 - elapsed)} seconds left`
    : elapsed < 20
    ? 'Almost there…'
    : 'Taking a little longer  hang tight'

  return (
    /* Fixed overlay  hides nav and footer during AI call */
    <div className="fixed inset-0 z-50 bg-surface flex flex-col items-center justify-center px-6 py-10 overflow-auto">
      <div className="w-full max-w-sm flex flex-col items-center">

        {/* ── Animated icon  document transforming to guide ── */}
        <div className="relative mb-8">
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-10"
            style={{ background: 'var(--color-primary)' }}
          />
          <div
            className="relative w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--color-primary)', boxShadow: '0 8px 32px rgba(0,88,189,0.35)' }}
          >
            {/* Medical cross / AI brain icon */}
            <svg className="w-11 h-11 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </div>
        </div>

        <style>{`
          @keyframes tick-pop {
            0%   { transform: scale(0.4); opacity: 0; }
            60%  { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1);   opacity: 1; }
          }
          .tick-pop { animation: tick-pop 220ms cubic-bezier(0.34,1.56,0.64,1) forwards; }
        `}</style>

        {/* ── Headline ─────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-text-primary text-center leading-tight">
          {documentType === 'lab_report'
            ? 'Turning your results into clear answers…'
            : 'Turning medical jargon into clear answers…'}
        </h2>
        <p className="text-base text-text-muted mt-2 text-center">
          {countdownText}
        </p>

        {/* ── Named progress steps ─────────────────────────── */}
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
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                  style={{
                    background: done   ? 'var(--color-teal, #0d9488)'  :
                                active ? 'var(--color-primary)'         :
                                         'var(--color-surface-muted, #e5e7eb)',
                  }}
                >
                  {done ? (
                    <svg className="w-4 h-4 text-white tick-pop" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : active ? (
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full opacity-25" style={{ background: 'var(--color-text-muted)' }} />
                  )}
                </div>

                <span
                  className="text-sm transition-all duration-300"
                  style={{
                    color:      done    ? 'var(--color-text-muted)'   :
                                active  ? 'var(--color-text-primary)' :
                                          'var(--color-text-muted)',
                    fontWeight: active  ? 600 : 400,
                    opacity:    pending ? 0.45 : 1,
                  }}
                >
                  {step}
                </span>

                {active && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-primary)' }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Skeleton cards  preview of what's coming ────── */}
        <div className="w-full mt-5 flex flex-col gap-3">
          {[75, 55, 85].map((w, i) => (
            <div
              key={i}
              className="w-full rounded-xl px-4 py-3.5 flex flex-col gap-2"
              style={{
                background: 'var(--color-surface-container-lowest)',
                boxShadow: '0 1px 6px rgba(24,28,33,0.04)',
                animationDelay: `${i * 0.15}s`,
              }}
            >
              {/* Medicine name line */}
              <div
                className="h-3 rounded-full animate-pulse"
                style={{ width: `${w}%`, background: 'var(--color-border-subtle, #e5e7eb)' }}
              />
              {/* Description lines */}
              <div
                className="h-2.5 rounded-full animate-pulse"
                style={{ width: '90%', background: 'var(--color-border-subtle, #e5e7eb)', opacity: 0.6 }}
              />
              <div
                className="h-2.5 rounded-full animate-pulse"
                style={{ width: '65%', background: 'var(--color-border-subtle, #e5e7eb)', opacity: 0.4 }}
              />
            </div>
          ))}
          <p className="text-xs text-text-muted text-center mt-1 opacity-60">
            Your explanation cards will appear here
          </p>
        </div>

      </div>
    </div>
  )
}
