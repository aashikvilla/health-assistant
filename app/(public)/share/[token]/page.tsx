import type { Metadata } from 'next'
import Link from 'next/link'
import { shareService } from '@/services/share.service'
import { APP_NAME } from '@/constants'

export const metadata: Metadata = {
  title: 'Shared Prescription — Nuskha',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function SharedPrescriptionPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const result = await shareService.getSharedPrescription(token)

  // Error / expired / revoked states
  if (!result.success || !result.data) {
    return (
      <main className="min-h-screen bg-surface flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-tertiary-subtle flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="font-display text-xl font-bold text-text-primary mb-2">
            Link Unavailable
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            {result.error ?? 'This share link is no longer available.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-3xl bg-primary text-primary-foreground font-semibold text-sm"
          >
            Go to {APP_NAME}
          </Link>
        </div>
      </main>
    )
  }

  const { profileName, doctorName, documentDate, tags, medications, doctorNotes, summary } = result.data

  return (
    <main className="min-h-screen bg-surface">
      {/* ── Shared banner ── */}
      <div className="bg-primary-subtle px-5 py-3">
        <p className="text-xs font-medium text-primary text-center">
          Shared via {APP_NAME} &middot; View only
        </p>
      </div>

      {/* ── Header ── */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
          {formatDate(documentDate)}
        </p>
        <h1 className="font-display text-xl font-bold text-text-primary">
          {doctorName ?? 'Doctor'}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          For: {profileName}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-primary-subtle text-primary text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── AI Summary ── */}
      {summary && (
        <div className="px-5 pb-4">
          <div className="bg-surface-subtle rounded-2xl p-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Summary
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <div className="px-5 pb-4">
        <div className="bg-[#fff8e1] rounded-2xl px-4 py-3 flex gap-3">
          <span className="text-base" aria-hidden="true">&#9888;&#65039;</span>
          <p className="text-xs text-text-secondary leading-relaxed">
            AI-generated summary. Do not adjust medication based on this.
            Consult {doctorName ?? 'your doctor'} before making any changes.
          </p>
        </div>
      </div>

      {/* ── Medications ── */}
      {medications.length > 0 && (
        <section className="bg-surface-container-low rounded-t-3xl px-5 pt-6 pb-8">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
            Medications Explained
          </h2>

          <div className="space-y-4">
            {medications.map((med, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest rounded-2xl p-4"
                style={{ boxShadow: '0 2px 12px 0 rgba(24,28,33,0.06)' }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm">
                      {med.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {med.dosage}
                    </p>
                  </div>
                  {med.frequency && (
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary-subtle text-primary text-xs font-medium">
                      {med.frequency}
                    </span>
                  )}
                </div>

                <dl className="space-y-2 text-sm">
                  {med.treats && (
                    <div>
                      <dt className="text-xs font-semibold text-text-muted">Treats</dt>
                      <dd className="text-text-secondary">{med.treats}</dd>
                    </div>
                  )}
                  {med.how_to_take && (
                    <div>
                      <dt className="text-xs font-semibold text-text-muted">How to take</dt>
                      <dd className="text-text-secondary">{med.how_to_take}</dd>
                    </div>
                  )}
                  {med.side_effects && (
                    <div>
                      <dt className="text-xs font-semibold text-text-muted">Side effects</dt>
                      <dd className="text-text-secondary">{med.side_effects}</dd>
                    </div>
                  )}
                  {med.avoid && (
                    <div>
                      <dt className="text-xs font-semibold text-text-muted">Avoid</dt>
                      <dd className="text-text-secondary">{med.avoid}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>

          {/* ── Doctor notes ── */}
          {doctorNotes.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Things to tell your doctor
              </h2>
              <ul
                className="bg-surface-container-lowest rounded-2xl p-4 space-y-2"
                style={{ boxShadow: '0 2px 12px 0 rgba(24,28,33,0.06)' }}
              >
                {doctorNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-text-muted mt-0.5" aria-hidden="true">&middot;</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ── Acquisition hook ── */}
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-text-muted mb-4">
          Want to manage your family&apos;s prescriptions?
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-3xl bg-primary text-primary-foreground font-semibold text-sm transition-opacity hover:opacity-90"
        >
          Create a free {APP_NAME} account
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </main>
  )
}
