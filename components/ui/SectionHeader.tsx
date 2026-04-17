import React from 'react'
import Link from 'next/link'

interface SectionHeaderAction {
  label: string
  href: string
}

interface SectionHeaderProps {
  label: string
  count?: number
  action?: SectionHeaderAction
}

export function SectionHeader({ label, count, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest">
        {label}
        {count !== undefined && (
          <span className="ml-1.5 font-body text-[11px] font-semibold text-text-muted normal-case tracking-normal">
            ({count})
          </span>
        )}
      </span>
      {action && (
        <Link href={action.href} className="text-xs font-semibold text-primary hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  )
}
