import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import { BottomNav }     from '@/components/layout/BottomNav'

export const metadata = {
  title: 'Family Hub — Nuskha',
}

interface HubLayoutProps {
  children: React.ReactNode
}

export default async function HubLayout({ children }: HubLayoutProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Page content — pb-20 leaves room above bottom nav */}
      <main className="flex-1 pb-20 sm:pb-0">
        {children}
      </main>

      {/* Bottom nav — mobile only, hidden on sm+ */}
      <BottomNav />
    </div>
  )
}
