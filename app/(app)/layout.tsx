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
import { PageLayout, PageHeader, BottomNav, LogoutButton } from '@/components/layout'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // In dev bypass mode, skip ensureSelfProfile — Supabase DB calls would fail
  // with placeholder keys. The mock user is good enough for UI development.
  const isDevBypass = process.env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development'

  if (!isDevBypass) {
    // Ensure self-profile + family group exist for this user.
    // Idempotent — one fast DB lookup and early-return if already set up.
    // This is the safety net for every sign-in path (email, OAuth, confirmation link).
    const setupResult = await familyService.ensureSelfProfile(user.id, user.email ?? '')
    if (!setupResult.success) {
      // Surface the error rather than silently proceeding — a missing family group
      // breaks all profile and document operations downstream.
      throw new Error(`Profile setup failed: ${setupResult.error}`)
    }
  }

  return (
    <PageLayout
      header={
        <PageHeader
          variant="brand"
          rightSlot={<LogoutButton />}
        />
      }
      footer={null}
      className="pb-20 sm:pb-0"
    >
      {children}
      <BottomNav />
    </PageLayout>
  )
}
