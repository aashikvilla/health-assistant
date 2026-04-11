// App-wide constants. No magic strings in components.

export const APP_NAME    = 'Nuskha'
export const APP_TAGLINE = 'Upload, understand, and manage your family\'s prescriptions'

export const ROUTES = {
  home:      '/',
  auth:      '/auth',
  // Stage 5 — Family Hub (canonical post-auth landing)
  hub:          '/hub',
  addMember:    '/hub/add-member',
  hubUpload:    (profileId: string) => `/hub/upload/${profileId}` as const,
  // Stage 6 — Records (owned by stage-6-records team)
  timeline:  '/timeline',
  records:   '/records',
  // Stage 2 — Public (unauthenticated) upload
  upload:    '/upload',
  // Stage 8 — Settings
  settings:  '/settings',
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
