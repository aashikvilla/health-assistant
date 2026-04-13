import Link from 'next/link'

const FEATURES = [
  {
    icon: '📄',
    title: 'Smart Document Analysis',
    desc: 'Upload prescriptions or lab reports in any format. Our AI extracts medications, test results, and key dates automatically.',
  },
  {
    icon: '💡',
    title: 'Plain-Language Explanations',
    desc: 'Get clear explanations for every medication — how to take it, what it treats, potential side effects, and what to avoid.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Family Health Hub',
    desc: 'Manage records for your entire family in one place. Add profiles for parents, children, and loved ones.',
  },
  {
    icon: '🔒',
    title: 'Your Data, Your Privacy',
    desc: 'All your medical information is encrypted and stored securely. We never sell your data or use it for advertising.',
  },
  {
    icon: '⚡',
    title: 'Instant Results',
    desc: 'Get analysis in seconds. No waiting for appointments or confusing medical terminology to decode.',
  },
  {
    icon: '📊',
    title: 'Track Over Time',
    desc: 'See how your health evolves. Build a complete picture of your medical history in one dashboard.',
  },
]

const STEPS = [
  { num: '1', title: 'Upload Document',  desc: 'Take a photo or upload a PDF of your prescription or lab report.' },
  { num: '2', title: 'AI Extracts Data', desc: 'Our AI reads and analyses your document in seconds.' },
  { num: '3', title: 'Review Results',   desc: 'See medications, test results, and key information clearly displayed.' },
  { num: '4', title: 'Save & Track',     desc: 'Create an account to save results and build your health records.' },
]

export default function HomePage() {
  return (
    <div className="bg-surface">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-subtle border border-primary-subtle">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-semibold text-primary">AI-Powered Health Management</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
              Understand Your <span className="text-primary">Health Records</span> Instantly
            </h1>

            <p className="text-lg text-text-secondary leading-relaxed max-w-lg">
              Upload your prescriptions and lab reports. Our AI extracts key information and explains everything in plain language — no medical jargon needed.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center h-12 px-8 bg-primary text-white font-semibold rounded-full hover:opacity-90 transition-opacity shadow-md"
              >
                Try Free Upload
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center h-12 px-8 bg-surface-muted text-text-primary font-semibold rounded-full hover:bg-surface-subtle transition-colors"
              >
                Create Account
              </Link>
            </div>

            <p className="text-sm text-text-muted">Free to use. No credit card required. Your data is always private.</p>
          </div>

          {/* Mock UI card — desktop only */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <div className="bg-surface-subtle rounded-3xl p-8 border border-border-subtle shadow-lg">
                <div className="space-y-4">
                  <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-text-muted font-medium mb-1">Prescription Extracted</p>
                        <p className="text-sm font-semibold text-text-primary">5 medications found</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-primary-subtle flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-border-subtle pt-4">
                      {['Aspirin 500mg', 'Vitamin D3 1000IU', 'Omeprazole 20mg'].map((med) => (
                        <div key={med} className="flex items-center gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                          <span className="text-text-secondary">{med}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-2xl p-4 border border-teal-subtle">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-text-primary mb-0.5">Plain Language Explanation</p>
                        <p className="text-xs text-text-secondary leading-relaxed">Aspirin helps prevent blood clots and reduces pain. Take with food.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Features</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Everything You Need to Understand Your Health
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Powerful tools to manage your medical information with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 sm:p-8 border transition-all cursor-default bg-surface-subtle border-border-subtle hover:bg-surface-container-lowest hover:border-primary hover:shadow-lg"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">How It Works</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Simple. Smart. Seamless.
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Get insights from your medical records in minutes, not hours.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 sm:gap-8">
          {STEPS.map((step, i) => (
            <div key={i} className="relative text-center">
              <div className="w-12 h-12 rounded-full bg-primary-subtle border-2 border-primary flex items-center justify-center mx-auto mb-4 font-bold text-lg text-primary">
                {step.num}
              </div>
              <h3 className="font-bold text-text-primary mb-2 text-lg">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>

              {i < 3 && (
                <div className="hidden md:block absolute top-5 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="bg-primary rounded-3xl px-6 sm:px-12 py-12 sm:py-16 text-white">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Start uploading your health documents today. No sign-up required to try it out.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center h-12 px-8 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-colors"
          >
            Try Free
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

    </div>
  )
}
