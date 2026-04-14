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
// No-line rule: depth via tonal layering (surface-lowest on surface base).
// Ghost border (ring at 15% opacity) only where accessibility requires it.

const variants: Record<Variant, string> = {
  // Interactive card — #ffffff pops against #f7f9ff surface base. No border needed.
  default:  'bg-surface-container-lowest',
  // Grouping area — sits recessed on the page
  subtle:   'bg-surface-subtle',
  // Accessibility fallback — ghost border at 15% opacity (design.md rule)
  outlined: 'bg-surface-container-lowest ring-1 ring-black/[0.15]',
  // Floating element — ambient shadow only, no muddy drop shadow
  elevated: 'bg-surface-container-lowest shadow-md',
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

// No divider lines — use vertical spacing only (design.md: "Forbid divider lines")
function CardHeader({ className = '', ...props }: CardHeaderProps) {
  return <div className={['pb-4', className].filter(Boolean).join(' ')} {...props} />
}

function CardBody({ className = '', ...props }: CardBodyProps) {
  return <div className={['py-2', className].filter(Boolean).join(' ')} {...props} />
}

function CardFooter({ className = '', ...props }: CardFooterProps) {
  return <div className={['pt-4', className].filter(Boolean).join(' ')} {...props} />
}

export { Card, CardHeader, CardBody, CardFooter }
