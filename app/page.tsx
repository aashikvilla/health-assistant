import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col px-5 py-12" style={{ background: 'var(--nuskha-surface)' }}>
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">

        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
            Nuskha
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.45, fontFamily: 'var(--font-manrope)' }}>
            नुस्खा &middot; prescription &middot; remedy
          </p>
        </div>

        {/* Hero */}
        <div className="mb-10 space-y-3">
          <h2 className="text-3xl font-bold leading-tight" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
            Your parents&apos; prescriptions, explained in plain English
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.6, fontFamily: 'var(--font-manrope)' }}>
            And shared with your family in one tap. No medical knowledge needed.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="space-y-3 mb-10">
          <Link
            href="/upload"
            className="w-full flex items-center justify-center py-4 rounded-2xl font-semibold text-base transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, var(--nuskha-primary) 0%, #0040a0 100%)',
              color: '#fff',
              fontFamily: 'var(--font-jakarta)',
              boxShadow: '0 4px 20px rgba(0,88,189,0.3)',
            }}
          >
            Upload a Prescription
          </Link>
          <p className="text-center text-xs" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.4, fontFamily: 'var(--font-manrope)' }}>
            No account needed to try
          </p>
        </div>

        {/* Feature list */}
        <div className="space-y-4">
          {[
            {
              icon: '📷',
              title: 'Photograph any prescription',
              desc: 'Handwritten, printed, PDF — we read them all',
            },
            {
              icon: '💊',
              title: 'Plain-language explanation',
              desc: 'What each drug does, how to take it, what to avoid',
            },
            {
              icon: '👨‍👩‍👧',
              title: 'Family history, one place',
              desc: 'Manage Papa, Mummy, and yourself under one account',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4 items-start">
              <span className="text-2xl mt-0.5">{icon}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--nuskha-on-surface)', fontFamily: 'var(--font-jakarta)' }}>
                  {title}
                </p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--nuskha-on-surface)', opacity: 0.5, fontFamily: 'var(--font-manrope)' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
