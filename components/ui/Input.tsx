import { forwardRef, type InputHTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  hint?:    string
  error?:   string
  leading?: React.ReactNode
  trailing?: React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, leading, trailing, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leading && (
            <span className="absolute left-3 text-text-muted">{leading}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full rounded-xl border bg-surface px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              error
                ? 'border-error focus:ring-error'
                : 'border-border hover:border-border-strong',
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
            <span className="absolute right-3 text-text-muted">{trailing}</span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-error">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }
