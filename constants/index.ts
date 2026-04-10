// App-wide constants. No magic strings in components.

export const APP_NAME    = 'Health Assistant'
export const APP_TAGLINE = 'Your personal health companion'

export const ROUTES = {
  home:      '/',
  auth:      '/auth',
  dashboard: '/dashboard',
  // Add feature routes here as they're built
} as const

export const AUTH_PROVIDERS = {
  google: 'google',
  email:  'email',
} as const

// Supabase redirect — used in OAuth flows
export const OAUTH_CALLBACK_PATH = '/auth/callback'
