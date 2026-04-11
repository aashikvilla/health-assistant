import type { Metadata } from 'next'
import { AppHeader } from '@/components/layout/AppHeader'

export const metadata: Metadata = { title: 'Timeline — Nuskha' }

/**
 * Timeline page — Stage 6 (Records team)
 *
 * Shows all prescriptions and lab reports across all family profiles
 * in chronological order.
 *
 * STATUS: Coming soon — stub page shown until Stage 6 ships.
 * When ready, replace this with:
 *   1. A server component that fetches all documents for the user
 *   2. A timeline list grouped by month
 *   3. Filter chips by family member and document type
 */
export default function TimelinePage() {
  return (
    <>
      <AppHeader variant="brand" />

      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center">
          <svg className="w-7 h-7 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>

        <div>
          <h1 className="text-xl font-bold text-text-primary">Timeline</h1>
          <p className="text-sm text-text-muted mt-2 leading-relaxed max-w-xs">
            All your family&apos;s prescriptions and lab reports in one place — coming soon.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-warning-subtle text-warning">
          Coming soon
        </span>
      </div>
    </>
  )
}
