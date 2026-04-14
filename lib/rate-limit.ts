/**
 * Simple in-memory IP rate limiter.
 *
 * Suitable for ~100 concurrent users on a single serverless instance.
 * State resets on cold start and is NOT shared across instances.
 * Revisit if traffic grows beyond a single instance or requires persistence.
 */

interface Window {
  count:     number
  resetAtMs: number
}

const store = new Map<string, Window>()

/**
 * Returns true if the request should be allowed, false if the limit is exceeded.
 *
 * @param key       Typically the caller's IP address
 * @param limit     Max requests allowed within the window
 * @param windowMs  Rolling window duration in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const window = store.get(key)

  if (!window || now >= window.resetAtMs) {
    store.set(key, { count: 1, resetAtMs: now + windowMs })
    return true
  }

  if (window.count >= limit) return false

  window.count++
  return true
}
