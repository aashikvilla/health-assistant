import { type HTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = 'default' | 'subtle' | 'outlined' | 'elevated'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
export interface CardBodyProps   extends HTMLAttributes<HTMLDivElement> {}
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

// ─── Styles ───────────────────────────────────────────────────────────────────

const variants: Record<Variant, string> = {
  default:  'bg-surface border border-border',
  subtle:   'bg-surface-subtle border border-border-subtle',
  outlined: 'bg-surface border-2 border-border-strong',
  elevated: 'bg-surface shadow-md border border-border',
}

const paddings = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

// ─── Components ───────────────────────────────────────────────────────────────

function Card({ variant = 'default', padding = 'md', className = '', ...props }: CardProps) {
  return (
    <div
      className={['rounded-2xl', variants[variant], paddings[padding], className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}

function CardHeader({ className = '', ...props }: CardHeaderProps) {
  return (
    <div
      className={['pb-4 border-b border-border', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

function CardBody({ className = '', ...props }: CardBodyProps) {
  return <div className={['py-4', className].filter(Boolean).join(' ')} {...props} />
}

function CardFooter({ className = '', ...props }: CardFooterProps) {
  return (
    <div
      className={['pt-4 border-t border-border', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export { Card, CardHeader, CardBody, CardFooter }
