import { type HTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  title?:       string
  description?: string
  action?:      React.ReactNode
  /** Vertical padding preset */
  spacing?: 'sm' | 'md' | 'lg' | 'xl'
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const spacings = {
  sm: 'py-6',
  md: 'py-10',
  lg: 'py-16',
  xl: 'py-24',
}

// ─── Component ────────────────────────────────────────────────────────────────

function Section({
  title,
  description,
  action,
  spacing = 'md',
  className = '',
  children,
  ...props
}: SectionProps) {
  return (
    <section className={[spacings[spacing], className].filter(Boolean).join(' ')} {...props}>
      {(title || description || action) && (
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-text-secondary">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export { Section }
