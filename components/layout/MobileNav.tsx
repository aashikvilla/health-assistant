'use client'

import { useState } from 'react'
import Link from 'next/link'

/**
 * Mobile hamburger menu for the homepage nav.
 * Only visible at ≤640px (controlled via CSS in homepage.css).
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        className="hp-hamburger"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span className={`hp-ham-line ${open ? 'open' : ''}`} />
        <span className={`hp-ham-line ${open ? 'open' : ''}`} />
        <span className={`hp-ham-line ${open ? 'open' : ''}`} />
      </button>

      {open && (
        <div className="hp-mobile-menu" onClick={() => setOpen(false)}>
          <div className="hp-mobile-menu-inner" onClick={(e) => e.stopPropagation()}>
            <a href="#features" onClick={() => setOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setOpen(false)}>How it Works</a>
            <a href="#testimonials" onClick={() => setOpen(false)}>Testimonials</a>
            <a href="#footer" onClick={() => setOpen(false)}>Get in touch</a>
            <hr />
            <Link href="/auth" onClick={() => setOpen(false)}>Sign in</Link>
            <Link href="/upload" className="hp-mobile-cta" onClick={() => setOpen(false)}>Open App</Link>
          </div>
        </div>
      )}
    </>
  )
}
