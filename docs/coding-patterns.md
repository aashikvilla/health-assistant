# Coding Patterns & Conventions

> The rules in this file are non-negotiable. Every AI assistant, every contributor, every PR must follow them. When in doubt, look at `app/(app)/dashboard/page.tsx` and `services/family.service.ts` as the canonical reference implementations.

---

## 0. Mobile-First — Non-Negotiable

Every component, every layout, every screen is built mobile-first (375px baseline). No exceptions.

```tsx
// ✅ Mobile-first — base styles for mobile, modifiers for larger screens
<div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6 md:p-8">

// ❌ Desktop-first — breaks on small screens
<div className="flex flex-row gap-6 p-8 max-sm:flex-col max-sm:gap-4 max-sm:p-4">
```

### Breakpoints

| Prefix | Min-width | Target |
|--------|-----------|--------|
| *(none)* | 0px | Mobile (375px baseline) |
| `sm:` | 640px | Large phone / small tablet |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop |
| `xl:` | 1280px | Wide desktop |

### Touch Targets

Every interactive element must be at least **44×44px** (Apple HIG + WCAG 2.5.5).

```tsx
// ✅ Button component handles this automatically
<Button size="md">Save</Button>

// ✅ Icon-only buttons need explicit sizing
<button className="touch-target flex items-center justify-center rounded-xl">
  <svg ... />
</button>

// ❌ Too small — impossible to tap accurately
<button className="h-6 w-6"><svg ... /></button>
```

### Safe Areas (Notched Phones)

```tsx
// ✅ Fixed bottom nav
<nav className="fixed bottom-0 inset-x-0 pb-safe">

// ✅ Fixed header
<header className="sticky top-0 pt-safe">

// ❌ Hardcoded — breaks on iPhone with home indicator
<nav className="fixed bottom-0 pb-8">
```

### Input Font Sizes

```tsx
// ✅ 16px minimum on inputs — prevents iOS auto-zoom
<Input className="text-base" />

// ❌ Smaller than 16px triggers iOS zoom
<input className="text-sm" />
```

---

## 1. Design Tokens — Single Source of Truth

All colors are defined **once** in `app/globals.css` `:root`. Never define colors anywhere else.

```tsx
// ✅ Always use semantic Tailwind tokens
<div className="bg-surface text-text-primary border border-border">
<button className="bg-primary text-white hover:bg-primary-hover">
<span className="bg-accent-subtle text-accent-hover">

// ❌ Never hardcode hex values
<div style={{ background: '#1d4ed8' }}>
<div className="bg-[#1d4ed8]">
<div className="bg-blue-600">
```

### Gradient Utilities

Multi-stop gradients are defined as CSS classes in `globals.css`. Use them via `className`:

```tsx
// ✅ Named gradient classes
<div className="gradient-hero">          // hero sections
<div className="gradient-brand">         // blue → violet
<div className="gradient-brand-full">    // blue → violet → pink
<div className="gradient-cta-box">       // dark CTA

// ❌ Never inline gradients
<div style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}>
```

See `docs/design-system.md` for the full token reference.

---

## 2. Component Layers

### UI Primitives (`components/ui/`)

Purely presentational. Props only. Zero dependencies on services, Supabase, or `next/headers`.

```tsx
// ✅ Correct — props in, JSX out
export function Badge({ variant = 'default', children }: BadgeProps) {
  return <span className={variants[variant]}>{children}</span>
}

// ❌ Wrong — UI components never fetch
export function Badge() {
  const data = useQuery(...)  // NO
}
```

Always import from the barrel:

```tsx
// ✅
import { Button, Card, Badge, Input, GradientHeroHeader, PageHeader,
         EmptyState, SectionHeader, ListItem } from '@/components/ui'

// ❌ Never import individual files
import { Button } from '@/components/ui/Button'
```

### Available UI Components

| Component | Use for |
|-----------|---------|
| `Button` | All buttons. Variants: `primary`, `secondary`, `ghost`, `danger`, `link`. Supports `href`. |
| `Card` | Card containers. Variants: `default`, `outlined`, `elevated`. |
| `Badge` | Status/tag labels. Variants: `default`, `primary`, `success`, `warning`, `error`, `info`. |
| `Input` | All text inputs with label, hint, error support. |
| `Heading` | Semantic h1–h6 with consistent sizing. |
| `Section` | Page section wrapper with optional title. |
| `Accordion` | Collapsible content. |
| `Spinner` | Loading indicator. |
| `GradientHeroHeader` | Full-bleed gradient hero with nav, title, subtitle, stat pills. |
| `PageHeader` | Sticky back-nav bar with title and optional action. |
| `EmptyState` | Icon + heading + description + CTA. |
| `SectionHeader` | Uppercase label with optional count and action link. |
| `ListItem` | Icon + title + subtitle + badge row. |

### Do Not Bypass UI Primitives

```tsx
// ✅ Use the component
<Button variant="secondary" disabled>Upgrade</Button>
<Badge variant="warning">High</Badge>
<Input label="Email" type="email" name="email" />
<EmptyState icon={...} heading="No records" description="..." ctaLabel="Upload" ctaHref="..." />

// ❌ Never build these manually
<button className="rounded-full bg-surface-muted ...">Upgrade</button>
<span className="px-2 py-0.5 rounded-full bg-warning-subtle ...">High</span>
<input className="rounded-xl bg-surface-subtle ..." />
<div className="flex flex-col items-center ...">  {/* manual empty state */}
```

### Feature Components (`components/features/`)

Receive data from the page (Server Component) or call hooks. Do not call services directly.

```tsx
// ✅ Page fetches, component renders
// app/(app)/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const supabase = await createClient()
  const profiles = await familyService.getProfiles(user.id)
  return <ProfileSectionWithEdit profiles={profiles.data} />
}

// components/features/family/ProfileSectionWithEdit.tsx
export function ProfileSectionWithEdit({ profiles }: { profiles: FamilyProfile[] }) {
  return <div>...</div>
}
```

### Layout Components (`components/layout/`)

Structural shells. Accept `children`. May read constants but don't fetch domain data.

Active layout components:
- `PageLayout` — root wrapper
- `PageHeader` — variant-driven header (brand / page)
- `PageFooter` — slim footer for public routes
- `BottomNav` — mobile bottom tab bar (primary routes only)
- `AppDrawerNav` — desktop slide-out drawer
- `LogoutButton` — sign-out form action
- `PWAInstallBanner` — iOS/Android install prompt
- `ServiceWorkerRegistration` — PWA service worker

---

## 3. Service Pattern

Services contain all business logic. Plain async functions. No React. No side effects.

```ts
// services/health.service.ts
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

export const healthService = {
  async getMetrics(userId: string): Promise<ApiResponse<Metric[]>> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('user_id', userId)

    if (error) return { data: null, error: error.message, success: false }
    return { data, error: null, success: true }
  },
}
```

Rules:
- Plain object export — no classes
- **Always return `ApiResponse<T>`** — never throw, never return raw Supabase results
- No React, no hooks, no side effects
- Usable from Server Components, Server Actions, API routes, and hooks alike

---

## 4. Hook Pattern

Hooks wrap services for client-side use. Handle loading/error state. Call services, not Supabase directly.

```ts
// hooks/useMetrics.ts
'use client'
import { useState, useEffect } from 'react'
import { healthService } from '@/services/health.service'
import type { Metric } from '@/types'

export function useMetrics(userId: string) {
  const [data,    setData]    = useState<Metric[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    healthService.getMetrics(userId).then(({ data, error }) => {
      setData(data)
      setError(error)
      setLoading(false)
    })
  }, [userId])

  return { data, loading, error }
}
```

---

## 5. API Route Pattern

Route handlers call services. Never contain logic themselves.

```ts
// app/api/health/metrics/route.ts
import { NextResponse }  from 'next/server'
import { createClient }  from '@/lib/supabase/server'
import { healthService } from '@/services/health.service'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await healthService.getMetrics(user.id)
  if (!result.success) return NextResponse.json({ error: result.error }, { status: 500 })

  return NextResponse.json(result.data)
}
```

---

## 6. Server Actions Pattern

For mutations (forms, writes). Always validate auth inside the action.

```ts
// app/actions.ts
'use server'
import { redirect }     from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(_prev: unknown, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const result = await profileService.update(user.id, {
    full_name: formData.get('full_name') as string,
  })

  if (!result.success) return { error: result.error }
  redirect('/dashboard')
}
```

---

## 7. Page Layout Patterns

### Top-Level Pages (Dashboard, Timeline, Settings)

Full-bleed gradient hero + white content sheet that overlaps it:

```tsx
export default async function DashboardPage() {
  // ... data fetching ...
  return (
    <>
      {/* Full-bleed gradient hero */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 gradient-hero">
        <GradientHeroHeader
          title={displayName}
          greeting="Good day,"
          stats={[
            { num: activeMeds.length, label: 'Active Meds' },
            { num: alerts.length,     label: 'Alerts' },
            { num: records.length,    label: 'Records' },
          ]}
          navAction={<SignOutButton />}
        />
      </div>

      {/* Content sheet — overlaps hero */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 relative z-10 bg-surface rounded-[28px_28px_0_0]">
        <div className="px-5 pt-5 pb-6 flex flex-col gap-5">
          {/* page content */}
        </div>
      </div>
    </>
  )
}
```

### Sub-Pages (Records, Explanation, Upload)

Sticky back-nav + scrollable content:

```tsx
export default async function RecordPage() {
  return (
    <>
      <PageHeader title="Your Prescription" backHref="/dashboard" action={<ShareButton />} />
      <div className="px-4 py-5 flex flex-col gap-4">
        {/* page content */}
      </div>
    </>
  )
}
```

---

## 8. Tailwind v4 Syntax

Tailwind v4 has updated class names. Always use the new forms:

| ❌ Old / Wrong | ✅ Correct |
|----------------|-----------|
| `flex-shrink-0` | `shrink-0` |
| `flex-grow` | `grow` |
| `z-[100]` | `z-100` |
| `bg-white/[.18]` | `bg-white/18` |
| `-translate-y-[1px]` | `-translate-y-px` |
| `hover:-translate-y-[1px]` | `hover:-translate-y-px` |
| `bg-[#1d4ed8]` | `bg-primary` |
| `text-[#07071a]` | `text-text-primary` |

---

## 9. Naming Conventions

| Thing | Convention | Example |
|-------|------------|---------|
| Component files | PascalCase | `RecordCard.tsx` |
| Hook files | camelCase with `use` prefix | `useMetrics.ts` |
| Service files | camelCase with `.service` suffix | `health.service.ts` |
| Type files | camelCase | `family.ts` |
| Constant files | camelCase | `index.ts` |
| Route files | Next.js convention | `page.tsx`, `route.ts`, `layout.tsx` |
| CSS classes | Semantic token names | `bg-primary`, `text-text-secondary` |

---

## 10. TypeScript Rules

- All props typed with explicit interfaces — no `any`
- Service return types use `ApiResponse<T>` wrapper
- No `as any` casts — use type guards or proper generics
- `import type { ... }` for type-only imports
- `interface` for object shapes, `type` for unions

---

## 11. Import Order

```ts
// 1. React / Next.js
import { useState } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// 2. Third-party
import { createBrowserClient } from '@supabase/ssr'

// 3. Internal — absolute (@/)
import { Button, Card, Badge } from '@/components/ui'
import { familyService } from '@/services/family.service'
import type { FamilyProfile } from '@/types/family'

// 4. Relative (avoid — prefer absolute)
import { formatDate } from './utils'
```

---

## 12. Security Rules

Every Server Action and API route must:

1. Call `supabase.auth.getUser()` — never trust client-provided user IDs
2. Return `{ error: 'Unauthorized' }` if no user — never throw
3. Use parameterized Supabase queries — never string-interpolate user input
4. Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-accessible code
5. Filter by `user_id` in queries — RLS is the last line of defense, not the only one

---

## 13. Do / Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| Use `bg-primary`, `text-text-primary` | Use `bg-blue-600`, `text-gray-900`, or hex values |
| Use `gradient-hero`, `gradient-brand` classes | Inline `linear-gradient(...)` in style props |
| Use `Button`, `Input`, `Badge`, `Card` components | Build raw `<button>`, `<input>`, badge spans |
| Use `GradientHeroHeader` for top-level pages | Duplicate the gradient hero pattern manually |
| Use `PageHeader` for sub-pages | Build custom sticky nav bars per page |
| Use `EmptyState` for empty content | Build custom empty state layouts per page |
| Use `SectionHeader` for section labels | Hardcode `font-display text-[11px] uppercase` inline |
| Fetch in Server Components | Fetch in UI primitive components |
| Keep services as pure async functions | Put React state in services |
| Use `ApiResponse<T>` for service returns | Return raw Supabase responses |
| Handle loading, error, empty, success states | Render only the success state |
| Use `@/` absolute imports | Use `../../` relative imports |
| Use `shrink-0` (Tailwind v4) | Use `flex-shrink-0` |
| Define tokens in `globals.css :root` only | Define `--variable` in page-level CSS |
| Colocate feature types in `types/<feature>.ts` | Put types inline in component files |
