# Vitae — Agent Instructions

> This file provides instructions for AI coding agents (GitHub Copilot, Cursor, Windsurf, Kiro, and similar tools). It supplements `CLAUDE.md` — read that first for full context.

---

## Quick Reference

**Stack:** Next.js 16 App Router · Supabase · Tailwind CSS v4 · TypeScript strict  
**Primary palette:** Digital Health (`#1d4ed8` blue · `#a855f7` violet · `#ec4899` pink)  
**Token source:** `app/globals.css` — single source of truth, never duplicate elsewhere  
**Component library:** `components/ui/` — always import from barrel `@/components/ui`

---

## Agent Behavior Rules

### Before Writing Any Code

1. Read `docs/current-state.md` to understand what's built vs stubbed
2. Check `docs/coding-patterns.md` for the service/hook/component pattern
3. Check `docs/design-system.md` for the full token reference
4. Match the existing code style — don't introduce new patterns or libraries

### When Adding Colors

```tsx
// ✅ Use existing tokens
className="bg-primary text-white"
className="bg-accent-subtle text-accent-hover"
className="bg-surface border border-border"

// ❌ Never do this
style={{ background: '#1d4ed8' }}
className="bg-[#1d4ed8]"
className="bg-blue-600"
```

### When Adding Gradients

```tsx
// ✅ Use named gradient classes from globals.css
className="gradient-hero"        // hero sections (dark → blue → violet → pink)
className="gradient-brand"       // blue → violet
className="gradient-brand-full"  // blue → violet → pink
className="gradient-cta-box"     // deep dark CTA

// ❌ Never inline
style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}
```

### When Adding Interactive Elements

```tsx
// ✅ Use UI primitives
import { Button, Input, Badge, Card } from '@/components/ui'

<Button variant="primary" size="md">Save</Button>
<Button variant="secondary" href="/dashboard">Back</Button>
<Input label="Name" name="name" type="text" required />
<Badge variant="success">Active</Badge>
<Card variant="outlined">...</Card>

// ❌ Never build raw
<button className="bg-primary rounded-full px-4 py-2">Save</button>
<input className="rounded-xl bg-surface-subtle px-3 py-2" />
```

### When Adding Page Headers

```tsx
// ✅ Use PageHeader for sub-pages
import { PageHeader } from '@/components/ui'
<PageHeader title="Record Detail" backHref="/dashboard" />
<PageHeader title="Settings" backHref="/dashboard" action={{ label: 'Edit', onClick: handleEdit }} />

// ✅ Use GradientHeroHeader for top-level pages
import { GradientHeroHeader } from '@/components/ui'
<GradientHeroHeader
  title="Timeline"
  subtitle="All your family's records"
  stats={[{ num: 5, label: 'Records' }]}
/>
```

### When Adding Empty States

```tsx
// ✅ Use EmptyState component
import { EmptyState } from '@/components/ui'
<EmptyState
  icon={<svg>...</svg>}
  heading="No records yet"
  description="Upload a prescription to get started"
  ctaLabel="Upload"
  ctaHref="/dashboard/upload/profile-id"
/>
```

### When Adding Section Headers

```tsx
// ✅ Use SectionHeader
import { SectionHeader } from '@/components/ui'
<SectionHeader label="Your Records" count={5} action={{ label: 'View all', href: '/timeline' }} />
<SectionHeader label="Family" />
```

### When Adding List Rows

```tsx
// ✅ Use ListItem
import { ListItem } from '@/components/ui'
<ListItem
  icon={<svg>...</svg>}
  title="Metformin 500mg"
  subtitle="Twice daily"
  badge={<Badge variant="success">Active</Badge>}
/>
```

---

## Folder Rules (Where to Put Things)

| What | Where |
|------|-------|
| New UI primitive (reused 2+ times) | `components/ui/NewComponent.tsx` + export from `components/ui/index.ts` |
| Feature-specific component | `components/features/<feature>/ComponentName.tsx` |
| Page layout shell | `components/layout/ComponentName.tsx` |
| New page (authenticated) | `app/(app)/<route>/page.tsx` |
| New page (public) | `app/(public)/<route>/page.tsx` |
| Server action | `app/actions.ts` or `app/(app)/<route>/actions.ts` |
| Business logic | `services/<feature>.service.ts` |
| React hook | `hooks/use<Feature>.ts` |
| TypeScript types | `types/<feature>.ts` + re-export from `types/index.ts` |
| App-wide constants | `constants/index.ts` |
| CSS tokens | `app/globals.css` `:root` block only |

---

## Service Pattern (Required Shape)

```ts
// services/example.service.ts
import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

export const exampleService = {
  async getItems(userId: string): Promise<ApiResponse<Item[]>> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', userId)

    if (error) return { data: null, error: error.message, success: false }
    return { data, error: null, success: true }
  },
}
```

Rules:
- Plain object export — no classes
- Always return `ApiResponse<T>` — never throw, never return raw Supabase
- No React, no hooks, no side effects
- Usable from Server Components, Server Actions, API routes, and hooks

---

## Tailwind v4 Syntax (Common Mistakes)

| ❌ Old / Wrong | ✅ Correct |
|----------------|-----------|
| `flex-shrink-0` | `shrink-0` |
| `z-[100]` | `z-100` |
| `bg-white/[.18]` | `bg-white/18` |
| `-translate-y-[1px]` | `-translate-y-px` |
| `hover:-translate-y-[1px]` | `hover:-translate-y-px` |
| `bg-[#1d4ed8]` | `bg-primary` |
| `text-[#07071a]` | `text-text-primary` |

---

## TypeScript Conventions

```ts
// ✅ Explicit interface for props
interface MyComponentProps {
  title: string
  count?: number
  onAction: () => void
}

// ✅ Type-only imports
import type { FamilyProfile } from '@/types/family'

// ✅ ApiResponse wrapper for services
import type { ApiResponse } from '@/types'

// ❌ No any
const data: any = ...  // forbidden
```

---

## Security Checklist

Before submitting any mutation (Server Action or API route):

- [ ] Call `supabase.auth.getUser()` — never trust client-provided user IDs
- [ ] Return `{ error: 'Unauthorized' }` if no user, never throw
- [ ] Use parameterized Supabase queries — never string-interpolate user input
- [ ] Never put `SUPABASE_SERVICE_ROLE_KEY` in client-accessible code
- [ ] RLS is the last line of defense — always filter by `user_id` in queries too

---

## Commit Message Format

```
type(scope): short description

feat(dashboard): add gradient hero header component
fix(auth): handle missing user profile on OAuth callback
refactor(tokens): migrate hardcoded colors to semantic tokens
docs(design-system): update palette to Digital Health
```

Types: `feat` · `fix` · `refactor` · `docs` · `style` · `test` · `chore`
