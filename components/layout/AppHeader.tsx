import Link from "next/link";
import { APP_NAME } from "@/constants";

/**
 * Shared top bar used across authenticated app routes.
 *
 * Two variants:
 *  - `brand` (default): shows the Vitae wordmark and an optional right slot
 *    (e.g. a notifications bell). Used by the hub home page.
 *  - `page`: shows a back arrow + page title + optional right slot. Used by
 *    sub-pages like add-member, upload, explanation, etc.
 *
 * The header is sticky, glassmorphic, and respects the iOS safe-area inset.
 * It does NOT render BottomNav — that lives in `app/hub/layout.tsx` so it
 * only mounts under the hub route group.
 *
 * Mobile-first by design: 56px tall, 44×44 touch targets.
 */
interface AppHeaderProps {
  variant?: "brand" | "page";
  /** Page title — required when `variant === 'page'`. */
  title?: string;
  /** Where the back arrow links to. Defaults to `/dashboard`. */
  backHref?: string;
  /** Optional right-aligned action(s) — e.g. a bell, share button, menu. */
  rightSlot?: React.ReactNode;
}

export function AppHeader({
  variant = "brand",
  title,
  backHref = "/dashboard",
  rightSlot,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 glass-surface pt-safe">
      <div className="flex items-center justify-between gap-3 px-4 h-14">
        {variant === "brand" ? (
          <Link
            href="/dashboard"
            className="font-display text-xl font-bold text-text-primary tracking-tight"
          >
            {APP_NAME}
          </Link>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={backHref}
              className="touch-target flex items-center justify-center -ml-2 rounded-xl text-text-secondary hover:bg-surface-subtle transition-colors"
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

        {rightSlot && (
          <div className="flex items-center gap-1">{rightSlot}</div>
        )}
      </div>
    </header>
  );
}
