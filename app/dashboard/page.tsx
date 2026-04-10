import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Health Assistant</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-gray-500 mt-1">Here's your health overview for today.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Steps Today', value: '—', icon: '🚶', color: 'bg-blue-50 text-blue-700' },
            { label: 'Water Intake', value: '—', icon: '💧', color: 'bg-cyan-50 text-cyan-700' },
            { label: 'Sleep Hours', value: '—', icon: '😴', color: 'bg-purple-50 text-purple-700' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
          <h2 className="font-semibold text-gray-900">Account</h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 w-24">Email</span>
            <span className="text-gray-900">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 w-24">User ID</span>
            <span className="text-gray-400 font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 w-24">Provider</span>
            <span className="text-gray-900 capitalize">{user.app_metadata?.provider ?? 'email'}</span>
          </div>
        </div>
      </main>
    </div>
  )
}
