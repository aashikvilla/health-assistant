/**
 * (app) Route Group Layout — authenticated shell
 *
 * Every route under app/(app)/ inherits this layout.
 * It is the single place that:
 *   1. Enforces authentication (redirects unauthenticated visitors to /auth)
 *   2. Mounts the BottomNav mobile navigation bar
 *   3. Provides the page wrapper with correct bottom padding for the nav bar
 *
 * Individual pages inside this group do NOT re-check auth.
 * They DO render their own <AppHeader> with the appropriate variant/title.
 *
 * DEV_BYPASS_AUTH=true still works — lib/supabase/server.ts injects a mock
 * user at the Supabase client level, so getUser() returns the mock even here.
 */

import { redirect }     from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav }    from '@/components/layout/BottomNav'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Page content — pb-20 leaves room above the bottom nav on mobile */}
      <main className="flex-1 pb-20 sm:pb-0">
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
