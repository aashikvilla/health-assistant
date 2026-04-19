'use client'

import Link     from 'next/link'
import { usePathname } from 'next/navigation'
import { useNotifications } from '@/hooks/useNotifications'

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

const BellIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',          href: '/dashboard',      icon: (a) => <HomeIcon     active={a} /> },
  { label: 'Timeline',      href: '/timeline',       icon: (a) => <TimelineIcon active={a} /> },
  { label: 'Notifications', href: '/notifications',  icon: (a) => <BellIcon     active={a} /> },
  { label: 'Profile',       href: '/settings',       icon: (a) => <ProfileIcon  active={a} /> },
]

// Show BottomNav only on primary (top-level) screens.
// Sub-routes (add-member, upload, explanation) are focused flows and should
// feel separate from the global nav  they have their own back buttons.
const PRIMARY_PATHS = ['/dashboard', '/timeline', '/notifications', '/settings']

interface BottomNavProps {
  unreadCount?: number
  userId?: string
}

export function BottomNav({ unreadCount: initialCount = 0, userId }: BottomNavProps) {
  const pathname = usePathname()

  // Use the polling hook to get real-time unread count
  // Only initialize if userId is provided (authenticated context)
  const { unreadCount } = userId 
    ? useNotifications(userId, initialCount)
    : { unreadCount: initialCount }

  // Exact match only  /hub shows nav, /dashboard/add-member does not
  const visible = PRIMARY_PATHS.some((p) => pathname === p)
  if (!visible) return null

  return (
    <nav
      className="fixed bottom-0 inset-x-0 pb-safe z-40 sm:hidden"
      style={{
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(124,58,237,.12)',
      }}
      aria-label="Main navigation"
    >
      <div className="flex items-center h-16 px-2">
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const active = pathname === href
          const isNotifications = href === '/notifications'
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors"
              aria-current={active ? 'page' : undefined}
            >
              {/* Icon container */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all relative"
                style={active ? { background: 'rgba(29,78,216,.09)' } : {}}
              >
                <span className={active ? 'text-primary' : 'text-text-muted'}>
                  {icon(active)}
                </span>
                {/* Badge for notifications tab */}
                {isNotifications && unreadCount > 0 && (
                  <span
                    className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-semibold flex items-center justify-center"
                    aria-label={`${unreadCount} unread notifications`}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span
                className={`font-body text-[10px] font-semibold ${active ? 'text-primary' : 'text-text-muted'}`}
              >
                {label}
              </span>
              {/* Active gradient dot */}
              {active && (
                <div
                  className="w-4 h-[3px] rounded-full -mt-0.5 gradient-brand"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
