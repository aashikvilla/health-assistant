'use client'

import { useState } from 'react'
import type { Confidence } from '@/types/prescription'

interface Props {
  label: string
  value: string
  confidence: Confidence
  onChange: (val: string) => void
}

export default function FieldRow({ label, value, confidence, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)

  function commit() {
    onChange(draft)
    setEditing(false)
  }

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Confidence badge */}
      <div className="flex-shrink-0 mt-0.5">
        {confidence === 'high' ? (
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs"
            style={{ background: 'rgba(0,106,102,0.1)', color: 'var(--nuskha-teal)' }}
            title="High confidence"
          >
            ✓
          </span>
        ) : (
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs"
            style={{ background: 'rgba(171,38,83,0.1)', color: 'var(--nuskha-alert)' }}
            title="Please verify"
          >
            ⚠
          </span>
        )}
      </div>

      {/* Label + value */}
      <div className="flex-1 min-w-0">
        <p className="text-xs mb-1" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.45, fontFamily: 'var(--font-manrope)' }}>
          {label}
        </p>

        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            className="w-full px-3 py-1.5 text-sm rounded-lg outline-none transition-colors"
            style={{
              background: 'var(--nuskha-surface-lowest)',
              color: 'var(--nuskha-on-surface)',
              fontFamily: 'var(--font-manrope)',
              boxShadow: '0 0 0 1.5px rgba(24,28,33,0.20)',
            }}
          />
        ) : (
          <button
            onClick={() => { setDraft(value); setEditing(true) }}
            className="w-full text-left text-sm py-1 rounded-lg transition-colors hover:opacity-80"
            style={{
              color: value ? 'var(--nuskha-on-surface)' : 'rgba(24,28,33,0.3)',
              fontFamily: 'var(--font-manrope)',
              fontWeight: value ? 500 : 400,
            }}
          >
            {value || 'Tap to add…'}
          </button>
        )}
      </div>

      {/* Edit hint */}
      {!editing && (
        <button
          onClick={() => { setDraft(value); setEditing(true) }}
          className="flex-shrink-0 mt-1 text-xs"
          style={{ color: 'var(--nuskha-primary)', fontFamily: 'var(--font-manrope)', opacity: 0.7 }}
        >
          Edit
        </button>
      )}
    </div>
  )
}
