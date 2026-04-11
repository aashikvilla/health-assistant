import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  return (
    <div className="min-h-screen bg-surface">

      {/* Header — glassmorphism floating bar */}
      <header className="sticky top-0 z-30 glass">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-b from-primary-bright to-primary rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold text-text-primary">Health Assistant</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted hidden sm:block">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="h-9 px-4 text-sm font-medium text-text-secondary bg-surface-muted rounded-full hover:bg-surface-subtle transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-text-muted mt-1">Here&apos;s your health overview for today.</p>
        </div>

        {/* Stats — surface-lowest cards on surface base, no borders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Steps Today',  value: '—', bg: 'bg-info-subtle',    text: 'text-info'     },
            { label: 'Water Intake', value: '—', bg: 'bg-secondary-subtle', text: 'text-secondary' },
            { label: 'Sleep Hours',  value: '—', bg: 'bg-primary-subtle',  text: 'text-primary'  },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-lowest rounded-2xl p-6 flex items-start gap-4 shadow-xs">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.text} font-bold text-lg`}>
                —
              </div>
              <div>
                <p className="text-sm text-text-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Account info — surface-lowest card, no borders */}
        <div className="bg-surface-lowest rounded-2xl p-6 space-y-4 shadow-xs">
          <h2 className="font-bold text-text-primary">Account</h2>
          <div className="space-y-3">
            {[
              { label: 'Email',    value: user.email },
              { label: 'User ID',  value: user.id, mono: true },
              { label: 'Provider', value: user.app_metadata?.provider ?? 'email' },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex items-center gap-3 text-sm">
                <span className="text-text-muted w-20 shrink-0">{label}</span>
                <span className={`text-text-primary ${mono ? 'font-mono text-xs text-text-muted' : ''}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}
