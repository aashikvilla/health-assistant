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
      href="/hub/add-member"
      className="flex flex-col items-center gap-1.5 min-w-[56px]"
      aria-label="Add a family member"
    >
      <div className="w-14 h-14 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted hover:bg-primary-subtle hover:text-primary transition-colors">
        <span className="text-xl font-light">+</span>
      </div>
      <span className="text-xs text-text-muted text-center">{label}</span>
    </Link>
  )
}
