/**
 * Vitae  Service Worker
 *
 * Strategy:
 *   - Static assets (JS, CSS, fonts, images) → Cache-first
 *   - Navigation (HTML pages)                → Network-first, fall back to cache
 *   - API / Supabase                         → Network-only (never cache auth data)
 *
 * Update the CACHE_VERSION whenever you make breaking changes to cached content.
 */

const CACHE_VERSION = 'v1'
const CACHE_STATIC  = `health-static-${CACHE_VERSION}`
const CACHE_PAGES   = `health-pages-${CACHE_VERSION}`

// Routes to precache on install so the app works offline from the first visit
const PRECACHE_PAGES = ['/', '/auth']

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_PAGES)
      .then((cache) => cache.addAll(PRECACHE_PAGES))
      .then(() => self.skipWaiting())
  )
})

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  const KNOWN_CACHES = [CACHE_STATIC, CACHE_PAGES]

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !KNOWN_CACHES.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never intercept non-GET, cross-origin API calls, or Supabase
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com')
  ) {
    return
  }

  // Static assets → Cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, CACHE_STATIC))
    return
  }

  // HTML navigation → Network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, CACHE_PAGES))
    return
  }
})

// ─── Strategies ───────────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(cacheName)
    cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    return cached ?? new Response('Offline  please reconnect.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

function isStaticAsset(pathname) {
  return /\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|webp|svg|ico|gif)$/.test(pathname) ||
    pathname.startsWith('/_next/static/')
}
