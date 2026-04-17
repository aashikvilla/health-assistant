import React from 'react'
import { Button } from './Button'
import Link from 'next/link'

interface EmptyStateProps {
  icon: React.ReactNode
  heading: string
  description: string
  ctaLabel: string
  ctaHref?: string
  ctaOnClick?: () => void
}

export function EmptyState({ icon, heading, description, ctaLabel, ctaHref, ctaOnClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-10 px-4">
      <div className="w-14 h-14 rounded-2xl bg-accent-subtle border border-border flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div className="space-y-1.5">
        <h3 className="font-display text-base font-bold text-text-primary">{heading}</h3>
        <p className="font-body text-sm text-text-muted max-w-xs">{description}</p>
      </div>
      {ctaHref ? (
        <Button href={ctaHref} size="md">{ctaLabel}</Button>
      ) : ctaOnClick ? (
        <Button onClick={ctaOnClick} size="md">{ctaLabel}</Button>
      ) : null}
    </div>
  )
}
