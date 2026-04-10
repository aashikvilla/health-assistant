import { type HTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Size = 'sm' | 'md' | 'lg'

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: Size
  label?: string
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sizes: Record<Size, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
}

// ─── Component ────────────────────────────────────────────────────────────────

function Spinner({ size = 'md', label = 'Loading…', className = '', ...props }: SpinnerProps) {
  return (
    <div role="status" className={['inline-flex', className].filter(Boolean).join(' ')} {...props}>
      <svg
        className={['animate-spin text-primary', sizes[size]].join(' ')}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}

export { Spinner }
