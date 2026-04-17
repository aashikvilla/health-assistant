export default function AccessClosedPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-accent-subtle flex items-center justify-center mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Early access is full
          </h1>
          <p className="font-body text-text-muted text-base leading-relaxed">
            We&apos;ve reached our early access limit for this phase. We&apos;re working on
            opening more spots — drop your email and we&apos;ll notify you when the next
            phase begins.
          </p>
        </div>

        <a
          href="mailto:hello@vitaehealth.app?subject=Early%20Access%20Waitlist"
          className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary text-white font-display font-semibold text-sm hover:bg-primary-hover transition-colors"
        >
          Join the waitlist
        </a>

        <p className="font-body text-text-muted text-sm">
          Already have an account?{' '}
          <a href="/auth" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
