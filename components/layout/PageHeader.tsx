import Link from 'next/link'
import { APP_NAME } from '@/constants'

/**
 * Unified page header for all pages (public, authenticated, any route).
 *
 * Features:
 * - Sticky, glassmorphic (frosted glass effect)
 * - Safe-area support for notched phones (iPhone X+)
 * - Three variants: 'brand' (home), 'page' (with back button), 'minimal' (no nav)
 * - Right slot for auth buttons, notifications, etc.
 * - Optional middle slot for centered nav links (public landing page)
 * - Mobile-first responsive padding
 *
 * Variants:
 * - `brand`: Shows logo + app name. Use on home/hub pages.
 * - `page`: Shows back arrow + page title. Use on sub-pages.
 * - `minimal`: Just the right slot. Use on auth/login pages.
 *
 * Usage:
 * ```tsx
 * // Home page
 * <PageHeader variant="brand" rightSlot={<LogoutButton />} />
 *
 * // Landing page with centred nav
 * <PageHeader
 *   variant="brand"
 *   middleSlot={<nav>...</nav>}
 *   rightSlot={<Link href="/auth">Sign in</Link>}
 * />
 *
 * // Sub-page
 * <PageHeader
 *   variant="page"
 *   title="Add Family Member"
 *   backHref="/dashboard"
 * />
 * ```
 */

interface PageHeaderProps {
  variant?: 'brand' | 'page' | 'minimal'
  /** Page title  required when `variant === 'page'` */
  title?: string
  /** Where the back arrow links to. Defaults to `/dashboard`. */
  backHref?: string
  /** Optional right-aligned action(s)  e.g. logout, sign in */
  rightSlot?: React.ReactNode
  /**
   * Optional centred content  e.g. nav anchor links on the landing page.
   * Switches the header to a 3-column grid for true centre alignment.
   */
  middleSlot?: React.ReactNode
}

export function PageHeader({
  variant = 'brand',
  title,
  backHref = '/dashboard',
  rightSlot,
  middleSlot,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 glass-surface pt-safe border-b border-border-subtle">
      <div className="px-4 sm:px-6 lg:px-8">
        {/*
          3-column grid: [left 1fr] [center auto] [right 1fr]
          When middleSlot is absent the center collapses to 0px and
          left/right share equal widths  functionally identical to the
          old justify-between layout.
        */}
        <div
          className="grid items-center h-14"
          style={{ gridTemplateColumns: '1fr auto 1fr' }}
        >

          {/* ── Left ───────────────────────────────────────── */}
          <div className="flex items-center min-w-0">
            {variant === 'brand' && (
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <svg width="32" height="32" viewBox="0 0 30 30" fill="none" className="shrink-0" aria-hidden="true">
                  <rect width="30" height="30" rx="8.5" style={{ fill: 'var(--color-primary)' }} />
                  <path d="M4 15 L8.5 15 L10.5 10 L15 21 L19.5 10 L21.5 15 L26 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <span className="font-bold text-lg text-text-primary tracking-tight">
                  {APP_NAME}
                </span>
              </Link>
            )}

            {variant === 'page' && (
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  href={backHref}
                  className="touch-target flex items-center justify-center -ml-3 rounded-lg text-text-secondary hover:bg-surface-subtle transition-colors flex-shrink-0"
                  aria-label="Back"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Link>
                {title && (
                  <h1 className="text-base font-semibold text-text-primary truncate">
                    {title}
                  </h1>
                )}
              </div>
            )}
          </div>

          {/* ── Centre ─────────────────────────────────────── */}
          <div className="flex items-center justify-center">
            {middleSlot}
          </div>

          {/* ── Right ──────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-2 flex-shrink-0">
            {rightSlot}
          </div>

        </div>
      </div>
    </header>
  )
}
