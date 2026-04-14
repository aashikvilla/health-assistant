/**
 * Rate limiting configuration.
 *
 * RATE_LIMIT_MAX     — max requests per window per IP (default: 200)
 * RATE_LIMIT_WINDOW  — window duration in seconds (default: 3600 = 1 hour)
 *
 * Override in environment:
 *   RATE_LIMIT_MAX=500
 *   RATE_LIMIT_WINDOW=3600
 */
export const RATE_LIMIT     = parseInt(process.env.RATE_LIMIT_MAX    ?? '200', 10)
export const RATE_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW ?? '3600', 10) * 1000
