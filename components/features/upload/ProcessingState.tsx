'use client'

import { useEffect, useState } from 'react'

interface ProcessingStateProps {
  label?: string
}

const STEPS = [
  'Detecting text in your document',
  'Identifying medicines and dosages',
  'Organising prescription details',
  'Preparing your summary',
]

export default function ProcessingState({ label }: ProcessingStateProps) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (activeStep >= STEPS.length - 1) return
    const t = setTimeout(() => setActiveStep((s) => s + 1), 900)
    return () => clearTimeout(t)
  }, [activeStep])

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm flex flex-col items-center">

        {/* ── Pulsing orb ────────────────────────────────────── */}
        <div className="relative mb-10">
          <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-15 scale-110" />
          <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center"
            style={{ boxShadow: '0 8px 32px rgba(0,88,189,0.35)' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* ── Text ───────────────────────────────────────────── */}
        <h2 className="text-3xl font-bold text-text-primary text-center leading-tight">
          {label ?? 'Reading your prescription…'}
        </h2>
        <p className="text-lg text-text-muted mt-2 text-center leading-relaxed">
          {label ? 'Almost done, please wait' : 'This usually takes just a few seconds'}
        </p>

        {/* ── Step list ──────────────────────────────────────── */}
        <div className="w-full mt-8 bg-surface-container-lowest rounded-2xl p-5 space-y-4"
          style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}>
          {STEPS.map((step, i) => {
            const done   = i < activeStep
            const active = i === activeStep
            return (
              <div key={step} className="flex items-center gap-4">
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500"
                  style={{
                    background: done   ? 'var(--color-teal)'    :
                                active ? 'var(--color-primary)'  :
                                         'var(--color-surface-muted)',
                  }}
                >
                  {done ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : active ? (
                    <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-text-muted opacity-30" />
                  )}
                </div>
                <span
                  className="text-base transition-all duration-300"
                  style={{
                    color:      done ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    fontWeight: active ? 600 : done ? 400 : 400,
                    opacity:    done ? 0.6 : active ? 1 : 0.4,
                  }}
                >
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        <p className="text-sm text-text-muted mt-6 text-center">
          Please keep this page open
        </p>
      </div>
    </div>
  )
}
