'use client'

import { useState } from 'react'
import type { Confidence } from '@/types/prescription'

interface Props {
  label:    string
  value:    string
  confidence: Confidence
  onChange: (val: string) => void
}

export default function FieldRow({ label, value, confidence, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(value)

  function commit() {
    onChange(draft)
    setEditing(false)
  }

  return (
    <div className="flex items-start gap-3 py-4 min-h-[64px]">

      {/* Confidence indicator */}
      <div className="flex-shrink-0 mt-1">
        {confidence === 'high' ? (
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-subtle"
            title="Looks good"
            aria-label="High confidence"
          >
            <svg className="w-3.5 h-3.5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        ) : (
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-warning-subtle"
            title="Please verify"
            aria-label="Please verify"
          >
            <svg className="w-3.5 h-3.5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v4m0 4h.01" />
            </svg>
          </span>
        )}
      </div>

      {/* Label + value */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-muted mb-1">{label}</p>

        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') commit() }}
            className="w-full px-3 py-2 text-lg rounded-xl bg-surface-subtle text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-colors"
          />
        ) : (
          <button
            onClick={() => { setDraft(value); setEditing(true) }}
            className="w-full text-left text-lg rounded-lg transition-opacity active:opacity-70"
            style={{ color: value ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: value ? 500 : 400 }}
          >
            {value || 'Tap to add…'}
          </button>
        )}
      </div>

      {/* Edit link */}
      {!editing && (
        <button
          onClick={() => { setDraft(value); setEditing(true) }}
          className="flex-shrink-0 text-sm font-semibold text-primary min-w-[44px] min-h-[44px] flex items-center justify-end"
        >
          Edit
        </button>
      )}
    </div>
  )
}
