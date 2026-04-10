import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-2">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">Health Assistant</h1>
          <p className="text-xl text-gray-600 max-w-md mx-auto">
            Your personal health companion. Track, monitor, and improve your wellbeing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center justify-center px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
          >
            Get Started
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-emerald-700 font-semibold rounded-xl border border-emerald-200 hover:bg-emerald-50 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <p className="text-sm text-gray-400">Free to use. No credit card required.</p>
      </div>
    </main>
  )
}
