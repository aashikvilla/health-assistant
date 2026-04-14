'use client'

import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'pwa-install-dismissed'

type Platform = 'android' | 'ios' | null

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return null
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  return null
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  )
}

export function PWAInstallBanner() {
  const [show, setShow] = useState(false)
  const [platform, setPlatform] = useState<Platform>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    if (isInStandaloneMode()) return
    if (localStorage.getItem(DISMISSED_KEY)) return

    const detected = detectPlatform()
    if (!detected) return
    setPlatform(detected)

    if (detected === 'android') {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        setShow(true)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }

    // iOS — no beforeinstallprompt, show manual instructions
    if (detected === 'ios') {
      const timer = setTimeout(() => setShow(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setShow(false)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') localStorage.setItem(DISMISSED_KEY, '1')
    setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Install Nuskha"
        className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-3xl shadow-xl px-6 pt-5 pb-8 pb-safe"
      >
        {/* Handle */}
        <div className="mx-auto w-10 h-1 rounded-full bg-border mb-5" />

        <div className="flex items-start gap-4 mb-5">
          {/* App icon */}
          <img
            src="/icons/icon-192.png"
            alt=""
            className="w-14 h-14 rounded-2xl flex-shrink-0"
          />
          <div>
            <p className="font-semibold text-text-primary text-base">Install Nuskha</p>
            <p className="text-sm text-text-secondary mt-0.5">
              Add to your home screen for the best experience — works offline too.
            </p>
          </div>
        </div>

        {platform === 'ios' ? (
          <div className="bg-surface-subtle rounded-2xl p-4 mb-5 space-y-3">
            <Step n={1} text={<>Tap the <strong>Share</strong> button <ShareIcon /> in Safari</>} />
            <Step n={2} text={<>Scroll down and tap <strong>"Add to Home Screen"</strong></>} />
            <Step n={3} text={<>Tap <strong>Add</strong> in the top right</>} />
          </div>
        ) : null}

        <div className="flex gap-3">
          {platform === 'android' ? (
            <button
              onClick={install}
              className="flex-1 h-12 bg-primary text-text-inverse font-semibold rounded-xl text-sm"
            >
              Install
            </button>
          ) : null}
          <button
            onClick={dismiss}
            className="flex-1 h-12 bg-surface-muted text-text-secondary font-semibold rounded-xl text-sm"
          >
            {platform === 'ios' ? 'Got it' : 'Not now'}
          </button>
        </div>
      </div>
    </>
  )
}

function Step({ n, text }: { n: number; text: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 h-6 rounded-full bg-primary text-text-inverse text-xs font-bold flex items-center justify-center flex-shrink-0">
        {n}
      </span>
      <span className="text-sm text-text-secondary">{text}</span>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg className="inline w-4 h-4 mx-0.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  )
}
