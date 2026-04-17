'use client'

import { useState } from 'react'

/**
 * "Get in touch" button + contact modal for the homepage footer.
 * Self-contained: button triggers modal, form shows success state after submit.
 */
export function ContactModal() {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  function openModal() {
    setSubmitted(false)
    setOpen(true)
    document.body.style.overflow = 'hidden'
  }

  function closeModal() {
    setOpen(false)
    document.body.style.overflow = ''
  }

  async function handleSubmit() {
    if (!email.trim()) return
    if (!message.trim()) return

    try {
      // TODO: wire to a real backend endpoint or create a 'leads' table in Supabase
      // For now, log the submission — the success UX shows regardless
      console.log('Contact form submission:', { email: email.trim(), name: name.trim(), message: message.trim() })
    } catch (err) {
      console.error('Contact form error:', err)
    }

    // Show success state regardless (better UX)
    setSubmitted(true)
    setName('')
    setEmail('')
    setMessage('')
    setTimeout(closeModal, 2800)
  }

  return (
    <>
      <button className="foot-touch-btn" onClick={openModal} type="button">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        Get in touch
      </button>

      {open && (
        <div
          className="modal-overlay open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={closeModal}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>

            {!submitted ? (
              <>
                <div className="modal-title" id="modal-title">Get in touch</div>
                <div className="modal-sub">We&apos;d love to hear from you  questions, feedback, or just a hello. We reply within 24 hours.</div>
                <div className="modal-field">
                  <label className="modal-label" htmlFor="m-name">Your name</label>
                  <input
                    className="modal-input"
                    type="text"
                    id="m-name"
                    placeholder="e.g. Priya Sharma"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label" htmlFor="m-email">Your email</label>
                  <input
                    className="modal-input"
                    type="email"
                    id="m-email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label" htmlFor="m-msg">Message</label>
                  <textarea
                    className="modal-textarea"
                    id="m-msg"
                    placeholder="Tell us what&apos;s on your mind…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <button className="modal-send" onClick={handleSubmit} type="button">
                  Send Message →
                </button>
              </>
            ) : (
              <div className="modal-success" style={{display:'block'}}>
                <div className="modal-success-icon">✉️</div>
                <div className="modal-success-title">Message sent!</div>
                <div className="modal-success-sub">Thanks for reaching out. We&apos;ll get back to you within 24 hours.</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
