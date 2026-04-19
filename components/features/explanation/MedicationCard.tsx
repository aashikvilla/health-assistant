'use client'

import { useState } from 'react'
import type { MedicationExplanation } from '@/types'
import { stripMedicationPrefix } from '@/lib/utils/string'
import RxImageSlot from '@/components/features/upload/RxImageSlot'

interface MedicationCardProps {
  medication: MedicationExplanation & { id: string }
  className?: string
}

const DETAIL_ROWS = [
  { key: 'treats',       label: 'Treats',       warning: false },
  { key: 'how_to_take',  label: 'How to take',  warning: false },
  { key: 'side_effects', label: 'Side effects', warning: true  },
  { key: 'avoid',        label: 'Avoid',        warning: false },
] as const satisfies ReadonlyArray<{ key: keyof MedicationExplanation; label: string; warning: boolean }>

const PALETTES = [
  { bg: 'var(--color-primary-subtle)',  accent: 'var(--color-primary)',       light: '#93c5fd',                      label: 'var(--color-primary-hover)' },
  { bg: 'var(--color-success-subtle)',  accent: 'var(--color-success)',       light: '#86efac',                      label: 'var(--color-success)' },
  { bg: 'var(--color-warning-subtle)',  accent: 'var(--color-warning)',       light: '#fcd34d',                      label: 'var(--color-warning)' },
  { bg: 'var(--color-pink-subtle)',     accent: 'var(--color-pink)',          light: 'var(--color-pink-subtle)',     label: 'var(--color-tertiary)' },
  { bg: 'var(--color-accent-subtle)',   accent: 'var(--color-accent-hover)',  light: '#c4b5fd',                      label: 'var(--color-accent-hover)' },
  { bg: 'var(--color-teal-subtle)',     accent: 'var(--color-teal)',          light: '#67e8f9',                      label: 'var(--color-teal)' },
]

function getPalette(name: string) {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return PALETTES[hash % PALETTES.length]
}

/** Strip dosage from name: "Pantoprazole 40 mg" → "Pantoprazole" */
function extractGenericName(name: string): string {
  return name
    .replace(/\d+\s*(mg|mcg|ml|g|iu|%)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Extract dosage string from name: "Pantoprazole 40 mg" → "40 mg" */
function extractDosageFromName(name: string): string | null {
  const match = name.match(/(\d+\s*(mg|mcg|ml|g|iu|%))/i)
  return match ? match[1] : null
}

/** Medicine packet box illustration  looks like actual product packaging */
export function MedicinePacket({ name, dosage }: { name: string; dosage: string }) {
  const p = getPalette(name)
  const genericName = extractGenericName(name)
  const dosageStr = extractDosageFromName(name) ?? dosage

  return (
    <div
      className="w-full h-full rounded-2xl relative overflow-hidden flex flex-col justify-between p-3"
      style={{ background: p.bg }}
    >
      {/* Top  brand stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
        style={{ background: p.accent }}
      />

      {/* Medicine name on the "box" */}
      <div className="mt-2">
        <p
          className="font-display text-[11px] font-bold leading-tight line-clamp-2"
          style={{ color: p.label }}
        >
          {genericName}
        </p>
      </div>

      {/* Bottom  dosage + tablet icon */}
      <div className="flex items-end justify-between">
        <span
          className="font-body text-[10px] font-semibold"
          style={{ color: p.accent }}
        >
          {dosageStr}
        </span>

        {/* Small blister pack icon */}
        <svg width="24" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="23" height="17" rx="3" fill={p.light} fillOpacity="0.5" stroke={p.accent} strokeOpacity="0.3" />
          <ellipse cx="7" cy="6" rx="3" ry="2.5" fill={p.accent} fillOpacity="0.4" />
          <ellipse cx="17" cy="6" rx="3" ry="2.5" fill={p.accent} fillOpacity="0.4" />
          <ellipse cx="7" cy="13" rx="3" ry="2.5" fill={p.accent} fillOpacity="0.4" />
          <ellipse cx="17" cy="13" rx="3" ry="2.5" fill={p.accent} fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  )
}

function MedicationCard({ medication, className = '' }: MedicationCardProps) {
  const [open, setOpen] = useState(false)
  const displayName = stripMedicationPrefix(medication.name)
  const p = getPalette(displayName)

  return (
    <div
      className={['bg-surface-container-lowest rounded-3xl overflow-hidden shadow-ambient', className]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Top row  medicine packet + info card */}
      <div className="flex gap-4 p-4">

        {/* Medicine packet illustration */}
        <div className="shrink-0 w-[88px] h-[100px] rounded-2xl overflow-hidden">
          <RxImageSlot medicineName={displayName} width={88} height={100} />
        </div>

        {/* Info card */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h3 className="font-display text-[15px] font-semibold text-text-primary leading-tight">
              {displayName}
            </h3>
            <p className="font-body text-sm text-text-muted mt-1">
              {medication.dosage}
            </p>
            <div
              className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold font-body"
              style={{ background: p.bg, color: p.accent }}
            >
              {medication.frequency}
            </div>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="mt-2.5 self-start flex items-center gap-1 text-xs font-medium rounded-lg px-3 py-1.5 transition-colors"
            style={{
              background: p.bg,
              color: p.label,
              fontFamily: 'var(--font-manrope)',
            }}
          >
            {open ? 'Hide details' : 'View details'}
            <svg
              className="w-3.5 h-3.5 transition-transform"
              style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expandable detail rows */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-4">
          {DETAIL_ROWS.map(({ key, label, warning }) => {
            const value = medication[key]
            if (!value) return null
            return (
              <div
                key={key}
                className="rounded-2xl p-3"
                style={{ background: warning ? 'rgba(245,158,11,0.08)' : 'var(--color-surface-subtle)' }}
              >
                <p className="font-body text-xs font-medium uppercase tracking-wider text-text-muted mb-1">
                  {label}
                </p>
                <p className="font-body text-sm text-text-primary leading-relaxed">
                  {value}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { MedicationCard }
export type { MedicationCardProps }
