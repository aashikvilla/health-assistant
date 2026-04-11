import { forwardRef, type ButtonHTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
type Size    = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-3xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer'

const variants: Record<Variant, string> = {
  // High-gloss gradient per design.md — primary → primary-bright (top-to-bottom)
  primary:   'bg-gradient-to-b from-primary-bright to-primary text-primary-foreground hover:opacity-90 active:opacity-95',
  // No border — surface-muted background does the visual work
  secondary: 'bg-surface-muted text-text-primary hover:bg-surface-subtle',
  // Transparent — background shift on hover only
  ghost:     'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
  danger:    'bg-gradient-to-b from-[#c42d60] to-tertiary text-tertiary-foreground hover:opacity-90',
  link:      'text-text-link underline-offset-4 hover:underline p-0 h-auto rounded-none',
}

const sizes: Record<Size, string> = {
  sm: 'h-8  px-4  text-sm',
  md: 'h-11 px-5  text-sm',
  lg: 'h-12 px-6  text-base',
}

// ─── Component ────────────────────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          base,
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
