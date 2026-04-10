// App-wide constants. No magic strings in components.

export const APP_NAME    = 'Health Assistant'
export const APP_TAGLINE = 'Your personal health companion'

export const ROUTES = {
  home:      '/',
  auth:      '/auth',
  dashboard: '/dashboard',
  // Stage 5 — Family Hub
  hub:       '/hub',
  addMember: '/hub/add-member',
  // Stage 6 — Records (owned by stage-6-records team)
  timeline:  '/timeline',
  records:   '/records',
  // Stage 2 — Upload (owned by stage-2-upload team)
  upload:    '/upload',
  // Stage 7 — Share (owned by stage-7-share team)
  share:     '/share',
} as const

export const FAMILY_LIMITS = {
  maxProfiles: 5,
} as const

export const AUTH_PROVIDERS = {
  google: 'google',
  email:  'email',
} as const

// Supabase redirect — used in OAuth flows
export const OAUTH_CALLBACK_PATH = '/auth/callback'
