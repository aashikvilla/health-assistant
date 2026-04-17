import React from 'react'
import Link from 'next/link'

interface PageHeaderAction {
  label: string
  href?: string
  onClick?: () => void
}

interface PageHeaderProps {
  title: string
  backHref: string
  action?: PageHeaderAction
}

export function PageHeader({ title, backHref, action }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-surface-container-lowest/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <Link
          href={backHref}
          className="w-9 h-9 rounded-xl bg-surface-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <span className="font-display text-[15px] font-bold text-text-primary">{title}</span>
        {action ? (
          action.href ? (
            <Link href={action.href} className="text-sm font-semibold text-primary hover:underline">
              {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} className="text-sm font-semibold text-primary hover:underline">
              {action.label}
            </button>
          )
        ) : (
          <div className="w-9" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
