'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Newsletter signup form for the homepage footer.
 * Inserts into the `leads` table with type = 'newsletter'.
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
      const supabase = createClient()
      const { error } = await supabase
        .from('leads')
        .insert({ type: 'newsletter', email: trimmed })

      if (error) {
        // Duplicate email (unique constraint) — treat as success
        if (error.code === '23505') {
          setStatus('success')
        } else {
          console.error('Newsletter insert error:', error)
          setStatus('error')
        }
      } else {
        setStatus('success')
      }
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
        <div style={{ fontSize: '.8rem', color: 'var(--blue)', marginTop: 8, fontWeight: 600 }}>
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
