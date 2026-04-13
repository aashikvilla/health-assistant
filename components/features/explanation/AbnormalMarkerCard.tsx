'use client'

import type { AbnormalMarker } from '@/types/lab-report'

interface AbnormalMarkerCardProps {
  marker: AbnormalMarker
  className?: string
}

const STATUS_CONFIG = {
  low: {
    label: 'Low',
    bg: 'var(--color-warning-subtle)',
    text: 'var(--color-warning)',
    border: 'var(--color-warning)',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    ),
  },
  high: {
    label: 'High',
    bg: 'var(--color-error-subtle)',
    text: 'var(--color-error)',
    border: 'var(--color-error)',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    ),
  },
  critical: {
    label: 'Critical',
    bg: 'var(--color-error-subtle)',
    text: 'var(--color-error)',
    border: 'var(--color-error)',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
} as const

function AbnormalMarkerCard({ marker, className = '' }: AbnormalMarkerCardProps) {
  const config = STATUS_CONFIG[marker.status]

  return (
    <div
      className={[
        'bg-surface-container-lowest rounded-3xl overflow-hidden',
        className,
      ].filter(Boolean).join(' ')}
      style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}
    >
      {/* Status accent bar */}
      <div className="h-1.5 rounded-t-3xl" style={{ background: config.border }} />

      <div className="p-4 space-y-3">
        {/* Header — name + status badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: config.bg, color: config.text }}
            >
              {config.icon}
            </div>
            <h3 className="font-display text-base font-semibold text-text-primary leading-tight truncate">
              {marker.name}
            </h3>
          </div>
          <span
            className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: config.bg, color: config.text }}
          >
            {config.label}
          </span>
        </div>

        {/* Value + range row */}
        <div className="flex items-baseline gap-4">
          <div>
            <span className="font-body text-2xl font-bold" style={{ color: config.text }}>
              {marker.value}
            </span>
            {marker.unit && (
              <span className="font-body text-sm text-text-muted ml-1">{marker.unit}</span>
            )}
          </div>
          <div className="font-body text-sm text-text-muted">
            Range: <span className="font-medium text-text-secondary">{marker.referenceRange}</span>
          </div>
        </div>

        {/* Explanation */}
        <div
          className="rounded-2xl p-3"
          style={{ background: config.bg, borderLeft: `3px solid ${config.border}` }}
        >
          <p className="font-body text-sm text-text-primary leading-relaxed">
            {marker.explanation}
          </p>
        </div>
      </div>
    </div>
  )
}

export { AbnormalMarkerCard }
export type { AbnormalMarkerCardProps }
