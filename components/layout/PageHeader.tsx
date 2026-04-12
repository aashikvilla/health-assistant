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
 * // Sub-page
 * <PageHeader
 *   variant="page"
 *   title="Add Family Member"
 *   backHref="/dashboard"
 *   rightSlot={<SaveButton />}
 * />
 *
 * // Auth page
 * <PageHeader variant="minimal" />
 * ```
 */

interface PageHeaderProps {
  variant?: 'brand' | 'page' | 'minimal'
  /** Page title — required when `variant === 'page'` */
  title?: string
  /** Where the back arrow links to. Defaults to `/dashboard`. */
  backHref?: string
  /** Optional right-aligned action(s) — e.g. logout, notifications, menu */
  rightSlot?: React.ReactNode
}

export function PageHeader({
  variant = 'brand',
  title,
  backHref = '/dashboard',
  rightSlot,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 glass-surface pt-safe border-b border-border-subtle">
      {/* Container with responsive padding */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-14">
          {/* Left content */}
          {variant === 'brand' && (
            <Link
              href="/"
              className="font-bold text-xl text-text-primary tracking-tight hover:opacity-80 transition-opacity"
            >
              {APP_NAME}
            </Link>
          )}

          {variant === 'page' && (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Back button */}
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
              {/* Title */}
              {title && (
                <h1 className="text-base font-semibold text-text-primary truncate">
                  {title}
                </h1>
              )}
            </div>
          )}

          {variant === 'minimal' && <div />}

          {/* Right actions */}
          {rightSlot && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {rightSlot}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
