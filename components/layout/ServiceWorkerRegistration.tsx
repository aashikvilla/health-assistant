'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker on mount.
 * Include this once in the root layout (already done in app/layout.tsx).
 * Safe to render in any environment  no-ops in dev when SW is absent.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing
          newSW?.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              // A new version is available  could trigger an in-app update toast here
              console.info('[SW] New version available. Refresh to update.')
            }
          })
        })
      })
      .catch((err) => console.warn('[SW] Registration failed:', err))
  }, [])

  return null
}
