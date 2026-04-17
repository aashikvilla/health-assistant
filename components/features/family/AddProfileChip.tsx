'use client'

import Link from 'next/link'

interface AddProfileChipProps {
  label?: string
  disabled?: boolean
}

export function AddProfileChip({ label = 'Add', disabled = false }: AddProfileChipProps) {
  if (disabled) {
    return (
      <div className="flex flex-col items-center gap-1.5 min-w-[56px] opacity-40 cursor-not-allowed">
        <div className="w-14 h-14 rounded-full bg-surface-muted flex items-center justify-center text-text-muted">
          <span className="text-xl font-light">+</span>
        </div>
        <span className="text-xs text-text-muted text-center">Limit reached</span>
      </div>
    )
  }

  return (
    <Link
      href="/dashboard/add-member"
      className="flex flex-col items-center gap-1.5 min-w-[60px]"
      aria-label="Add a family member"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center transition-all bg-surface-subtle border-2 border-dashed border-accent/30"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" className="text-accent/60">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
      <span className="font-body text-[10px] text-text-muted text-center font-medium">{label}</span>
    </Link>
  )
}
