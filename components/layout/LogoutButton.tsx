'use client'

import { signOut } from '@/app/actions'

/**
 * Icon button that signs the user out.
 * Uses a form so the server action runs server-side  no client Supabase client needed.
 */
export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="touch-target flex items-center justify-center rounded-xl text-text-muted hover:bg-surface-subtle hover:text-error transition-colors"
        aria-label="Sign out"
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
            strokeWidth={1.75}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </form>
  )
}
