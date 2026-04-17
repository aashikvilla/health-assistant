# Coding Patterns & Conventions

---

## 0. Mobile-First  Non-Negotiable

**Every component, every layout, every screen is built mobile-first.** No exceptions.

### The Rule

Write base styles for mobile (320px+), then add responsive modifiers for larger screens.

```tsx
// ✅ Mobile-first
<div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6 sm:p-6 md:p-8">

// ❌ Desktop-first (reversed logic  breaks on small screens)
<div className="flex flex-row gap-6 p-8 max-sm:flex-col max-sm:gap-4 max-sm:p-4">
```

### Breakpoints (Tailwind defaults  mobile-first)

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
// ✅ Use the Button component  already handles this
<Button size="md">Save</Button>   // h-10 = 40px + padding → ≥44px

// ✅ Icon-only buttons need explicit sizing
<button className="touch-target flex items-center justify-center rounded-xl">
  <svg ... />
</button>

// ❌ Too small  impossible to tap accurately on mobile
<button className="h-6 w-6"><svg ... /></button>
```

### Safe Areas (Notched phones)

Use CSS env() classes for fixed bars  never hardcode bottom/top padding.

```tsx
// ✅ Fixed bottom nav
<nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border pb-safe">

// ✅ Fixed header
<header className="fixed top-0 left-0 right-0 bg-surface border-b border-border pt-safe">

// ❌ Hardcoded  breaks on iPhone with home indicator
<nav className="fixed bottom-0 pb-8">
```

### Text & Font Sizes

```tsx
// ✅ Never smaller than 16px on inputs  prevents iOS zoom
<input className="text-base ..." />   // text-base = 16px

// ✅ Body text minimum 14px
<p className="text-sm ...">           // text-sm = 14px  OK for secondary text

// ❌ Too small  causes accessibility and legibility issues
<p className="text-xs ...">primary content</p>
```

### Spacing

Comfortable touch spacing. Minimum 8px between interactive elements.

```tsx
// ✅ List of tappable items
<ul className="divide-y divide-border">
  <li className="flex items-center px-4 py-3 min-h-[44px]">...</li>
</ul>

// ✅ Form fields  generous spacing
<div className="space-y-5">
  <Input label="Email" ... />
  <Input label="Password" ... />
</div>
```

### Forms on Mobile

```tsx
// ✅ Correct input types  mobile keyboard selection
<input type="email"    inputMode="email"   />   // email keyboard
<input type="tel"      inputMode="tel"     />   // number pad
<input type="number"   inputMode="numeric" />   // numeric keyboard
<input type="search"   inputMode="search"  />   // search keyboard with return key

// ✅ autocomplete for faster entry
<input type="email"    autoComplete="email"         />
<input type="password" autoComplete="current-password" />
<input type="password" autoComplete="new-password"     />
```

### Responsive Layouts

```tsx
// ✅ Card grid  1 col on mobile, 2 on tablet, 3 on desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// ✅ Stack → row on larger screens
<div className="flex flex-col sm:flex-row gap-3">

// ✅ Hide/show by breakpoint
<span className="hidden sm:block">Full label</span>
<span className="sm:hidden">Short</span>

// ✅ Responsive text size
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
```

### Navigation

For mobile: bottom navigation or hamburger menu. For desktop: sidebar or top nav.

```tsx
// ✅ Bottom nav (mobile)  always use pb-safe
<nav className="fixed bottom-0 inset-x-0 flex justify-around bg-surface border-t border-border pb-safe sm:hidden">
  {/* Mobile nav items */}
</nav>

// ✅ Sidebar (desktop only)
<aside className="hidden lg:flex w-64 flex-col ...">
  {/* Desktop nav */}
</aside>
```

---

## 1. Component Layers

### UI Primitives (`components/ui/`)
Purely presentational. Receive data via props. Zero dependencies on services or Supabase.

```tsx
// ✅ Correct
function Button({ onClick, children, variant = 'primary' }) { ... }

// ❌ Wrong  UI components don't fetch or call services
function Button() {
  const data = useQuery(...)  // NO
}
```

### Feature Components (`components/features/`)
Receive data from the page (server component) or call hooks. Do not call services directly.

```tsx
// ✅ Correct  page fetches, component renders
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const supabase = await createClient()
  const metrics  = await metricsService.getMetrics(userId)
  return <MetricsDashboard metrics={metrics} />
}

// components/features/health/MetricsDashboard.tsx
export function MetricsDashboard({ metrics }: { metrics: Metric[] }) {
  return <div>...</div>
}
```

### Layout Components (`components/layout/`)
Structural shell. Accept `children`. May read session from server but don't fetch domain data.

---

## 2. Service Pattern

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

---

## 3. Hook Pattern

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

## 4. API Route Pattern

Route handlers call services. Never contain logic themselves.

```ts
// app/api/health/metrics/route.ts
import { NextResponse }   from 'next/server'
import { createClient }   from '@/lib/supabase/server'
import { healthService }  from '@/services/health.service'

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

## 5. Server Actions Pattern

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

  // Delegate to service
  const result = await profileService.update(user.id, {
    full_name: formData.get('full_name') as string,
  })

  if (!result.success) return { error: result.error }
  redirect('/dashboard')
}
```

---

## 6. Using UI Components

Always import from the barrel. Use semantic tokens  never raw Tailwind colour values.

```tsx
// ✅
import { Button, Card, Heading } from '@/components/ui'

<Button variant="primary">Save</Button>
<Card variant="elevated">...</Card>

// ❌  bypasses theming
<button className="bg-emerald-600 text-white">Save</button>
```

---

## 7. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase | `MetricCard.tsx` |
| Hook files | camelCase with `use` prefix | `useMetrics.ts` |
| Service files | camelCase with `.service` suffix | `health.service.ts` |
| Type files | camelCase | `user.ts` |
| Constant files | camelCase | `index.ts` |
| Route files | Next.js convention | `page.tsx`, `route.ts`, `layout.tsx` |
| CSS classes | Semantic token names | `bg-primary`, `text-text-secondary` |

---

## 8. TypeScript Rules

- All props typed with explicit interfaces (no `any`)
- Service return types use `ApiResponse<T>` wrapper
- No `as any` casts  use type guards or proper generics
- Prefer `type` over `interface` for unions; `interface` for object shapes

---

## 9. Import Order

```ts
// 1. React / Next.js
import { useState } from 'react'
import { redirect } from 'next/navigation'

// 2. Third-party
import { createBrowserClient } from '@supabase/ssr'

// 3. Internal  absolute (@/)
import { Button } from '@/components/ui'
import { healthService } from '@/services/health.service'
import type { Metric } from '@/types'

// 4. Relative (avoid in most cases  prefer absolute)
import { formatDate } from './utils'
```

---

## 10. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use `bg-primary`, `text-text-primary` | Use `bg-emerald-600`, `text-gray-900` |
| Fetch in Server Components | Fetch in UI primitive components |
| Keep services pure async functions | Put React state in services |
| Use `ApiResponse<T>` for service returns | Return raw Supabase responses |
| Handle loading, error, empty, success states | Render only the success state |
| Use `@/` absolute imports | Use `../../` relative imports |
| Colocate feature types in `types/<feature>.ts` | Put types inline in component files |
