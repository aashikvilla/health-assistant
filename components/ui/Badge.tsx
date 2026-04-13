import { type HTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
type Size    = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
  size?: Size
  dot?: boolean
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const variants: Record<Variant, string> = {
  default: 'bg-surface-muted  text-text-secondary border border-border',
  primary: 'bg-primary-subtle text-primary        border border-primary/20',
  success: 'bg-success-subtle text-success        border border-success/20',
  warning: 'bg-warning-subtle text-warning        border border-warning/20',
  error:   'bg-error-subtle   text-error          border border-error/20',
  info:    'bg-info-subtle    text-info           border border-info/20',
}

const sizes: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

const dotColors: Record<Variant, string> = {
  default: 'bg-text-muted',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error:   'bg-error',
  info:    'bg-info',
}

// ─── Component ────────────────────────────────────────────────────────────────

function Badge({ variant = 'default', size = 'md', dot = false, className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variants[variant],
        sizes[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {dot && (
        <span
          className={['w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant]].join(' ')}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export { Badge }
