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
  /** Page title — required when `variant === 'page'` */
  title?: string
  /** Where the back arrow links to. Defaults to `/dashboard`. */
  backHref?: string
  /** Optional right-aligned action(s) — e.g. logout, sign in */
  rightSlot?: React.ReactNode
  /**
   * Optional centred content — e.g. nav anchor links on the landing page.
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
          left/right share equal widths — functionally identical to the
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
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
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
