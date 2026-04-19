// components/features/notifications/PushPermissionBanner.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

interface PushPermissionBannerProps {
  userId: string
  onDismiss: () => void
}

// Helper function to convert VAPID public key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushPermissionBanner({ userId, onDismiss }: PushPermissionBannerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEnable = async () => {
    setLoading(true)
    setError(null)

    try {
      // 1. Check if Notification API is supported
      if (!('Notification' in window)) {
        setError('Push notifications are not supported in this browser')
        setLoading(false)
        return
      }

      // 2. Request permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        onDismiss() // user denied or dismissed
        return
      }

      // 3. Register service worker if not already registered
      const registration = await navigator.serviceWorker.ready

      // 4. Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ) as BufferSource,
      })

      // 5. Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON(),
          deviceInfo: navigator.userAgent,
        }),
      })

      if (!response.ok) {
        setError('Failed to save push subscription. Please try again.')
        setLoading(false)
        return
      }

      onDismiss() // success
    } catch (err) {
      console.error('Error enabling push notifications:', err)
      setError('Failed to enable push notifications. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-accent-subtle border border-accent-hover p-4 mb-4">
      <div className="flex gap-3">
        {/* Bell icon */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base font-bold text-text-primary mb-1">
            Enable medication reminders
          </h3>
          <p className="text-sm text-text-muted mb-3">
            Get notified when it&apos;s time to take your medicines, even when the app is closed.
          </p>

          {error && (
            <p className="text-sm text-error mb-3">{error}</p>
          )}

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleEnable}
              disabled={loading}
            >
              {loading ? 'Enabling...' : 'Enable'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onDismiss}
              disabled={loading}
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
