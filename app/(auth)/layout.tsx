/**
 * (auth) Route Group Layout — isolated authentication pages
 *
 * Provides minimal layout for authentication flows:
 * - Only Vitae logo (linking to homepage)
 * - Clean container for auth content
 * - Minimal copyright line
 * - No marketing navigation or footer distractions
 */

import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-text-primary">
      {/* Minimal header with just logo */}
      <header className="flex items-center justify-center py-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
              <rect width="30" height="30" rx="8.5" fill="#1d4ed8"/>
              <path d="M4 15 L8.5 15 L10.5 10 L15 21 L19.5 10 L21.5 15 L26 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-text-primary">Vitae</span>
        </Link>
      </header>

      {/* Auth content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Minimal footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-text-muted">© 2025 Vitae</p>
      </footer>
    </div>
  )
}