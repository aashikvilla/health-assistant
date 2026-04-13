# System Architecture

## Overview

Health Assistant is a **Next.js 16 App Router** application using **Supabase** for auth and database, deployed on **Vercel**.

```
Browser
  │
  ▼
Vercel Edge (proxy.ts)       ← Session refresh, route protection
  │
  ▼
Next.js App Router
  ├── Server Components       ← Fetch data, pass as props
  ├── Client Components       ← Interactivity, hooks
  └── Server Actions          ← Form mutations, writes
  │
  ▼
Service Layer                 ← Business logic (framework-agnostic)
  │
  ▼
Supabase
  ├── Auth                    ← Email + Google OAuth
  ├── Database (Postgres)     ← Application data
  └── RLS Policies            ← Row-level security per user
```

## Data Flow

### Read (Server Component)
```
Page (async Server Component)
  → createClient() [server]
  → service.getData(userId)
  → Supabase query (with RLS)
  → Pass data as props to Client/Feature Components
```

### Write (Server Action)
```
Form submission
  → Server Action
  → Validate auth (getUser)
  → service.mutate(...)
  → Supabase mutation
  → redirect() or return error
```

### Read (Client Component / Hook)
```
Client Component
  → useFeatureData() hook
  → service.getData() via fetch/API route
  → Update local state
```

## Auth Flow

```
Sign In (email)
  → signIn() server action
  → supabase.auth.signInWithPassword()
  → Cookie set by @supabase/ssr
  → redirect('/dashboard')

Sign In (Google)
  → signInWithGoogle() server action
  → supabase.auth.signInWithOAuth()
  → redirect to Google consent screen
  → Google → /auth/callback?code=...
  → exchangeCodeForSession()
  → redirect('/dashboard')

Sign Out
  → signOut() server action
  → supabase.auth.signOut()
  → redirect('/')
```

## Security Model

- **proxy.ts** — Blocks unauthenticated requests to `/dashboard/*` before they reach the page
- **Server Actions** — Always call `supabase.auth.getUser()` before any mutation
- **RLS** — Supabase Row Level Security must be enabled on all tables. Never rely on frontend filtering alone.
- **Env vars** — `NEXT_PUBLIC_` prefix only for values safe to expose. Service role key never in client code.

## Environments

| Env | Branch | URL |
|---|---|---|
| Production | `master` | https://health-assistant-snowy.vercel.app |
| Preview | `develop` | Vercel preview URL (per push) |
| Local | — | http://localhost:3000 |

## Technology Decisions

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components, built-in optimisations |
| Auth + DB | Supabase | Real-time, RLS, OAuth, free tier |
| Styling | Tailwind CSS v4 | Utility-first, CSS variable theming |
| Deployment | Vercel | Git auto-deploy, preview URLs |
| Language | TypeScript (strict) | Type safety across all layers |
