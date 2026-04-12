'use client'

import Link     from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  label: string
  href:  string
  icon:  (active: boolean) => React.ReactNode
}

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const TimelineIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',     href: '/dashboard',      icon: (a) => <HomeIcon     active={a} /> },
  { label: 'Timeline', href: '/timeline', icon: (a) => <TimelineIcon active={a} /> },
  { label: 'Profile',  href: '/settings', icon: (a) => <ProfileIcon  active={a} /> },
]

// Show BottomNav only on primary (top-level) screens.
// Sub-routes (add-member, upload, explanation) are focused flows and should
// feel separate from the global nav — they have their own back buttons.
const PRIMARY_PATHS = ['/dashboard', '/timeline', '/settings']

export function BottomNav() {
  const pathname = usePathname()

  // Exact match only — /hub shows nav, /dashboard/add-member does not
  const visible = PRIMARY_PATHS.some((p) => pathname === p)
  if (!visible) return null

  return (
    <nav
      className="fixed bottom-0 inset-x-0 glass-surface pb-safe z-40 sm:hidden"
      aria-label="Main navigation"
    >
      <div className="flex">
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] text-xs font-medium transition-colors',
                active ? 'text-primary' : 'text-text-muted hover:text-text-secondary',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              {icon(active)}
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
