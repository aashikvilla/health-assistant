/**
 * Notifications Page
 *
 * Server Component that fetches recent in-app notifications and renders them
 * as a list. Shows empty state when no notifications exist.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { notificationsService } from '@/services/notifications.service'
import { NotificationCard } from '@/components/features/notifications/NotificationCard'
import { signOut } from '@/app/actions'

const BellIcon = () => (
  <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: notifications } = await notificationsService.getRecentNotifications(user.id)
  const count = notifications?.length ?? 0

  return (
    <>
      {/* ── Gradient Hero  full bleed ─────────────────────────── */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 gradient-hero">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 80% 15%, rgba(168,85,247,.45) 0%, transparent 55%), radial-gradient(circle at 5% 85%, rgba(29,78,216,.35) 0%, transparent 50%)' }}
          />
          {/* Nav bar */}
          <div className="relative flex items-center justify-between px-5 pt-safe h-14">
            <span
              className="font-display text-xl font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(90deg,#fff 0%,rgba(255,255,255,.75) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Vitae
            </span>
            {/* Sign-out  hidden on desktop where AppDrawerNav's hamburger takes over */}
            <form action={signOut} className="sm:hidden">
              <button
                type="submit"
                aria-label="Sign out"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </form>
          </div>
          
          {/* Heading section */}
          <div className="relative px-5 pt-6 pb-10">
            <p className="font-body text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-1">
              Medication Reminders
            </p>
            <h1 className="font-display text-[30px] font-extrabold text-white tracking-tight leading-none mb-2">
              Notifications
            </h1>
            <p className="font-body text-sm text-white/70">
              {count > 0
                ? `${count} notification${count === 1 ? '' : 's'} waiting for you`
                : "You're all caught up"}
            </p>
          </div>
        </div>
      </div>

      {/* ── White content sheet  overlaps gradient ─────────────── */}
      <div
        className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 relative z-10 bg-surface rounded-[28px_28px_0_0]"
        style={{
          boxShadow: '0 -4px 24px rgba(29,78,216,.12)',
        }}
      >
        <div className="px-5 pt-5 pb-6 flex flex-col gap-3">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard 
                key={notification.id} 
                notification={notification} 
                userId={user.id} 
              />
            ))
          ) : (
            <div className="flex flex-col items-center text-center gap-4 py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-accent-subtle border border-border flex items-center justify-center">
                <BellIcon />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-display text-base font-bold text-text-primary">No notifications yet</h3>
                <p className="font-body text-sm text-text-muted max-w-xs">
                  Medication reminders will appear here when it&apos;s time to take your medicines.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
