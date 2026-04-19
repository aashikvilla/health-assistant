// public/sw.js — Service Worker for Web Push Notifications

// Install event — cache static assets (optional, not required for push)
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Activate event — clean up old caches (optional)
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Push event — show notification
self.addEventListener('push', (event) => {
  if (!event.data) return

  const payload = event.data.json()
  const { title, body, icon, badge, data } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icons/icon-192.png',
      badge: badge || '/icons/badge-72.png',
      data,
      tag: data?.medication_id || 'medication-reminder',
      requireInteraction: true,  // notification stays until user interacts
    })
  )
})

// Notification click event — open or focus app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/notifications') && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/notifications')
      }
    })
  )
})
