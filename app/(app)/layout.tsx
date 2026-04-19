/**
 * (app) Route Group Layout — authenticated pages
 *
 * Provides for all pages under /app:
 * - Authentication guard (redirects to /auth if not logged in)
 * - Consistent header with logo + logout button
 * - Responsive side padding
 * - Mobile bottom navigation
 *
 * All pages inherit automatically. No overrides needed.
 */

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { familyService } from '@/services/family.service'
import { notificationsService } from '@/services/notifications.service'
import { PageLayout, BottomNav, AppDrawerNav } from '@/components/layout'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // Ensure self-profile + family group exist for this user.
  // Idempotent — one fast DB lookup and early-return if already set up.
  // This is the safety net for every sign-in path (email, OAuth, confirmation link).
  const setupResult = await familyService.ensureSelfProfile(user.id, user.email ?? '')
  if (!setupResult.success) {
    // Surface the error rather than silently proceeding — a missing family group
    // breaks all profile and document operations downstream.
    throw new Error(`Profile setup failed: ${setupResult.error}`)
  }

  // Fetch initial unread count for BottomNav badge
  const { data: initialCount } = await notificationsService.getUnreadCount(user.id)

  return (
    <PageLayout
      header={null}
      footer={null}
      className="pb-20 sm:pb-0"
    >
      {children}
      <BottomNav unreadCount={initialCount ?? 0} userId={user.id} />
      <AppDrawerNav />
    </PageLayout>
  )
}
