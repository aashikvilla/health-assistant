'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  'Reading your document',
  'Identifying key data',
  'Structuring results',
  'Generating explanation',
]

export default function ProcessingState() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    if (activeStep >= STEPS.length - 1) return
    const timer = setTimeout(() => setActiveStep((s) => s + 1), 800)
    return () => clearTimeout(timer)
  }, [activeStep])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: 'var(--nuskha-surface)' }}>
      <div className="w-full max-w-md">

        {/* Pulsing icon */}
        <div className="flex justify-center mb-10">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'var(--nuskha-primary)' }} />
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--nuskha-primary)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4"/>
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
          Reading your document
        </h2>
        <p className="text-sm text-center mb-10" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}>
          This usually takes 3–5 seconds
        </p>

        {/* Steps */}
        <div className="rounded-2xl px-6 py-5 space-y-4" style={{ background: 'var(--nuskha-surface-lowest)', boxShadow: '0 2px 24px rgba(24,28,33,0.06)' }}>
          {STEPS.map((step, i) => {
            const done = i < activeStep
            const active = i === activeStep

            return (
              <div key={step} className="flex items-center gap-4">
                {/* Step indicator */}
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500"
                  style={{
                    background: done
                      ? 'var(--nuskha-teal)'
                      : active
                      ? 'var(--nuskha-primary)'
                      : 'var(--nuskha-surface-low)',
                  }}
                >
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : active ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--nuskha-on-surface)', opacity: 0.2 }} />
                  )}
                </div>

                <span
                  className="text-sm transition-all duration-300"
                  style={{
                    fontFamily: 'var(--font-manrope)',
                    color: 'var(--nuskha-on-surface)',
                    opacity: done ? 0.5 : active ? 1 : 0.3,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-center mt-6" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.35, fontFamily: 'var(--font-manrope)' }}>
          Don&apos;t close this tab  we&apos;re almost done
        </p>
      </div>
    </div>
  )
}
