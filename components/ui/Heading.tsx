import { type HTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Level = 1 | 2 | 3 | 4 | 5 | 6
type Tag   = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: Level
  /** Render a different HTML tag while keeping visual size */
  as?: Tag
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles: Record<Level, string> = {
  1: 'text-4xl font-bold tracking-tight text-text-primary',
  2: 'text-3xl font-bold tracking-tight text-text-primary',
  3: 'text-2xl font-semibold text-text-primary',
  4: 'text-xl font-semibold text-text-primary',
  5: 'text-lg font-medium text-text-primary',
  6: 'text-base font-medium text-text-secondary',
}

// ─── Component ────────────────────────────────────────────────────────────────

function Heading({ level = 2, as, className = '', ...props }: HeadingProps) {
  const Tag = (as ?? (`h${level}` as Tag)) as Tag
  return (
    <Tag
      className={[styles[level], className].filter(Boolean).join(' ')}
      {...props}
    />
  )
}

export { Heading }
