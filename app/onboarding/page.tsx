'use client'

import { useActionState } from 'react'
import { completeOnboarding } from '@/app/actions'

export default function OnboardingPage() {
  const [state, action, pending] = useActionState(completeOnboarding, null)

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-md">
            <svg className="w-7 h-7 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome to Vitae</h1>
          <p className="text-sm text-text-secondary text-center">
            Let&apos;s set up your profile so your health records are personalised.
          </p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="full_name" className="text-sm font-medium text-text-primary">
              Your full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              autoFocus
              placeholder="e.g. Priya Sharma"
              className="w-full px-4 py-3 text-base rounded-xl border border-border bg-surface-container-lowest text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-error">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-base disabled:opacity-60 transition-opacity"
          >
            {pending ? 'Saving…' : 'Get started'}
          </button>
        </form>

      </div>
    </div>
  )
}
