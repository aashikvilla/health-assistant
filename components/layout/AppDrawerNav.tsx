'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions'

// ── Icons (same paths as BottomNav) ───────────────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function TimelineIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Home',     href: '/dashboard', Icon: HomeIcon     },
  { label: 'Timeline', href: '/timeline',  Icon: TimelineIcon },
  { label: 'Profile',  href: '/settings',  Icon: ProfileIcon  },
]

// Only show the hamburger on top-level screens — same rule as BottomNav.
const PRIMARY_PATHS = ['/dashboard', '/timeline', '/settings']

// ── Component ─────────────────────────────────────────────────────────────────

export function AppDrawerNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on route change (handles back/forward navigation too)
  useEffect(() => { setOpen(false) }, [pathname])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const visible = PRIMARY_PATHS.some((p) => pathname === p)
  if (!visible) return null

  return (
    <>
      {/* ── Hamburger trigger — desktop only ───────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        aria-expanded={open}
        className="hidden sm:flex fixed top-[10px] right-5 z-40 w-9 h-9 rounded-xl items-center justify-center flex-col gap-[5px] transition-opacity hover:opacity-80"
        style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)' }}
      >
        <span className="w-[14px] h-[1.5px] bg-white rounded-full block" />
        <span className="w-[14px] h-[1.5px] bg-white rounded-full block" />
        <span className="w-[14px] h-[1.5px] bg-white rounded-full block" />
      </button>

      {/* ── Backdrop ───────────────────────────────────────────────── */}
      <div
        className={`hidden sm:block fixed inset-0 z-50 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(15,15,45,.55)', backdropFilter: 'blur(4px)' }}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* ── Drawer panel ───────────────────────────────────────────── */}
      <div
        className={`hidden sm:flex fixed top-0 right-0 bottom-0 z-50 flex-col w-64 transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: '#ffffff',
          boxShadow: '-8px 0 40px rgba(15,15,45,.18)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-border-subtle flex-shrink-0">
          <span className="font-body text-[11px] font-bold text-text-muted uppercase tracking-widest">
            Menu
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface-subtle transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map(({ label, href, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors min-h-[48px]"
                style={active
                  ? { background: 'rgba(29,78,216,.07)', borderLeft: '2px solid #1d4ed8', color: '#1d4ed8' }
                  : { color: '#64748b', borderLeft: '2px solid transparent' }
                }
                aria-current={active ? 'page' : undefined}
              >
                <span style={{ color: active ? '#1d4ed8' : '#94a3b8' }}>
                  <Icon active={active} />
                </span>
                <span className="font-body text-sm font-semibold">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-4 py-4 border-t border-border-subtle flex-shrink-0">
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors hover:bg-error-subtle min-h-[48px]"
              style={{ color: '#ef4444' }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="font-body text-sm font-semibold">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
