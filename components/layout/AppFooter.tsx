import { APP_NAME } from '@/constants'

/**
 * Slim brand footer used on marketing/landing routes.
 *
 * NOT used inside the hub route group — there, navigation is handled by
 * `BottomNav` (mobile) which is mounted in `app/hub/layout.tsx`. Adding a
 * footer there would compete with the bottom nav for screen real estate.
 *
 * Use this on `/`, `/auth`, and any other routes that don't mount BottomNav.
 */
export function AppFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border-subtle bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted">
        <p>
          &copy; {year} {APP_NAME} — Family prescription manager
        </p>
        <p>
          Made for families. Always consult your doctor.
        </p>
      </div>
    </footer>
  )
}
