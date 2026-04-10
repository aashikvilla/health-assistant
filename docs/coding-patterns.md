# Coding Patterns & Conventions

## 1. Component Layers

### UI Primitives (`components/ui/`)
Purely presentational. Receive data via props. Zero dependencies on services or Supabase.

```tsx
// ✅ Correct
function Button({ onClick, children, variant = 'primary' }) { ... }

// ❌ Wrong — UI components don't fetch or call services
function Button() {
  const data = useQuery(...)  // NO
}
```

### Feature Components (`components/features/`)
Receive data from the page (server component) or call hooks. Do not call services directly.

```tsx
// ✅ Correct — page fetches, component renders
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

Always import from the barrel. Use semantic tokens — never raw Tailwind colour values.

```tsx
// ✅
import { Button, Card, Heading } from '@/components/ui'

<Button variant="primary">Save</Button>
<Card variant="elevated">...</Card>

// ❌ — bypasses theming
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
- No `as any` casts — use type guards or proper generics
- Prefer `type` over `interface` for unions; `interface` for object shapes

---

## 9. Import Order

```ts
// 1. React / Next.js
import { useState } from 'react'
import { redirect } from 'next/navigation'

// 2. Third-party
import { createBrowserClient } from '@supabase/ssr'

// 3. Internal — absolute (@/)
import { Button } from '@/components/ui'
import { healthService } from '@/services/health.service'
import type { Metric } from '@/types'

// 4. Relative (avoid in most cases — prefer absolute)
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
