import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      <div className="max-w-xl w-full text-center space-y-10">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-primary-bright to-primary flex items-center justify-center shadow-md">
            <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-text-primary tracking-tight leading-tight">
            Health Assistant
          </h1>
          <p className="text-lg text-text-secondary max-w-sm mx-auto">
            Your personal health companion. Track, monitor, and improve your wellbeing.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center justify-center h-12 px-8 bg-gradient-to-b from-primary-bright to-primary text-primary-foreground font-semibold rounded-3xl hover:opacity-90 transition-opacity shadow-md"
          >
            Get Started
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center h-12 px-8 bg-surface-muted text-text-primary font-semibold rounded-3xl hover:bg-surface-subtle transition-colors"
          >
            Sign In
          </Link>
        </div>

        <p className="text-sm text-text-muted">Free to use. No credit card required.</p>
      </div>
    </main>
  )
}
