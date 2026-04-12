'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <div className="bg-surface">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-surface border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <span className="font-bold text-text-primary text-lg">Nuskha</span>
            </div>

            <div className="hidden sm:flex items-center gap-8">
              <a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-text-secondary hover:text-text-primary transition-colors">How it works</a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/auth" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                Sign in
              </Link>
              <Link href="/upload" className="hidden sm:inline-flex h-9 px-6 bg-primary text-white rounded-full font-semibold text-sm hover:bg-primary-hover transition-colors">
                Try Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-subtle border border-primary-subtle">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
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
                className="inline-flex items-center justify-center h-12 px-8 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-colors shadow-md"
              >
                Try Free Upload
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-border-subtle pt-4">
                      {['Aspirin 500mg', 'Vitamin D3 1000IU', 'Omeprazole 20mg'].map((med) => (
                        <div key={med} className="flex items-center gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal"></span>
                          <span className="text-text-secondary">{med}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-2xl p-4 border border-teal-subtle">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-subtle flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-teal" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2zm0-6h2v6h-2zm.99-5C6.47 6 5 7.48 5 9s1.49 3 3.01 3S11 10.52 11 9 9.52 6 8 6z"/>
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

      {/* Features */}
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
          {[
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
          ].map((feature, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`group rounded-2xl p-6 sm:p-8 border transition-all cursor-pointer ${
                hoveredFeature === i
                  ? 'bg-surface-container-lowest border-primary shadow-lg'
                  : 'bg-surface-subtle border-border-subtle hover:border-border'
              }`}
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">{feature.title}</h3>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
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
          {[
            { num: '1', title: 'Upload Document', desc: 'Take a photo or upload a PDF of your prescription or lab report.' },
            { num: '2', title: 'AI Extracts Data', desc: 'Our AI reads and analyzes your document in seconds.' },
            { num: '3', title: 'Review Results', desc: 'See medications, test results, and key information clearly displayed.' },
            { num: '4', title: 'Save & Track', desc: 'Create an account to save results and build your health records.' },
          ].map((step, i) => (
            <div key={i} className="relative text-center">
              <div className="w-12 h-12 rounded-full bg-primary-subtle border-2 border-primary flex items-center justify-center mx-auto mb-4 font-bold text-lg text-primary">
                {step.num}
              </div>
              <h3 className="font-bold text-text-primary mb-2 text-lg">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>

              {i < 3 && (
                <div className="hidden md:block absolute top-5 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="bg-primary rounded-3xl px-6 sm:px-12 py-12 sm:py-16 text-white">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">
            Start uploading your health documents today. No signup required to try it out.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center h-12 px-8 bg-white text-primary font-semibold rounded-full hover:bg-white/90 transition-colors"
          >
            Try Free
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-muted border-t border-border-subtle mt-16 sm:mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <span className="font-bold text-text-primary">Nuskha</span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Making health information accessible and understandable for everyone.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wide">Product</h4>
              <ul className="space-y-2">
                <li><a href="/upload" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Try Upload</a></li>
                <li><a href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a></li>
                <li><a href="/auth" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Sign In</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wide">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wide">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-muted">© 2026 Nuskha. All rights reserved.</p>
            <p className="text-xs text-text-muted">Made with care for your health.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
