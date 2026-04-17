'use client'

import { useState } from 'react'

/**
 * Newsletter signup form for the homepage footer.
 * TODO: wire to a real backend endpoint or create a 'leads' table in Supabase.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    setStatus('loading')
    try {
      // TODO: wire to a real backend endpoint or create a 'leads' table in Supabase
      console.log('Newsletter signup:', trimmed)
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <div className="foot-newsletter-head">Stay Updated</div>
      <div className="foot-newsletter-sub">Health tips + new features. No spam.</div>
      <form className="foot-newsletter-form" onSubmit={handleSubmit}>
        <input
          className="foot-newsletter-input"
          type="email"
          placeholder="Your email address"
          aria-label="Email for newsletter"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="foot-newsletter-btn" type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? '…' : 'Go'}
        </button>
      </form>
      {status === 'success' && (
        <div style={{ fontSize: '.8rem', color: 'var(--color-primary)', marginTop: 8, fontWeight: 600 }}>
          ✓ You&apos;re subscribed!
        </div>
      )}
      {status === 'error' && (
        <div style={{ fontSize: '.8rem', color: '#dc2626', marginTop: 8, fontWeight: 600 }}>
          Something went wrong. Try again.
        </div>
      )}
    </>
  )
}
