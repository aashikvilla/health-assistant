/**
 * Notifications Page
 *
 * Server Component that fetches recent in-app notifications and renders them
 * as a list. Shows empty state when no notifications exist.
 */

import { redirect } from 'next/navigation'
import Link from 'next/link'
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

  return (
    <>
      {/* ── Header with sign-out ───────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-surface border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-xl bg-surface-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <span className="font-display text-[15px] font-bold text-text-primary">Notifications</span>
          {/* Sign-out  hidden on desktop where AppDrawerNav's hamburger takes over */}
          <form action={signOut} className="sm:hidden">
            <button
              type="submit"
              aria-label="Sign out"
              className="w-9 h-9 rounded-xl bg-surface-subtle flex items-center justify-center text-text-muted hover:text-error transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </form>
          <div className="w-9 hidden sm:block" aria-hidden="true" />
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-3">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationCard 
              key={notification.id} 
              notification={notification} 
              userId={user.id} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center text-center gap-4 py-10 px-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-subtle border border-border flex items-center justify-center text-2xl">
              <BellIcon />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display text-base font-bold text-text-primary">No notifications yet</h3>
              <p className="font-body text-sm text-text-muted max-w-xs">
                Medication reminders will appear here when it's time to take your medicines.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
