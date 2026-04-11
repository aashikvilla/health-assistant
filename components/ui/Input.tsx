import { forwardRef, type InputHTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:    string
  hint?:     string
  error?:    string
  leading?:  React.ReactNode
  trailing?: React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────
// Per design.md input rules:
//   - Default: surface-subtle background (container-low), no border
//   - Focus:   transition to surface-lowest + ghost border at 20% opacity
//   - Error:   tertiary ghost border (alert colour)

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leading, trailing, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leading && (
            <span className="absolute left-3 text-text-muted pointer-events-none">{leading}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-xl bg-surface-subtle px-3 py-2.5 text-base text-text-primary placeholder:text-text-muted',
              'transition-all focus:outline-none focus:bg-surface-lowest',
              error
                ? 'ring-1 ring-tertiary/50 focus:ring-tertiary/60'
                : 'ring-0 focus:ring-1 focus:ring-black/20',
              leading  ? 'pl-9'  : '',
              trailing ? 'pr-9'  : '',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {trailing && (
            <span className="absolute right-3 text-text-muted pointer-events-none">{trailing}</span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-error">{error}</p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-text-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }
