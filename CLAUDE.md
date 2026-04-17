# Vitae — AI Assistant Context

> **Read this first.** This file is the primary context document for Claude, GitHub Copilot, Cursor, and any other AI coding assistant working on this codebase. Follow every rule here without exception.

---

## What This Project Is

**Vitae** is a mobile-first Next.js 16 health records app. Users upload prescriptions and lab reports, get AI-powered plain-language explanations, and manage records for their whole family. Stack: Next.js 16 App Router · Supabase (auth + Postgres) · Tailwind CSS v4 · TypeScript strict · Vercel.

Key docs to read before making changes:
- `docs/current-state.md` — what's built, what's a stub, what's broken
- `docs/architecture.md` — data flow and security model
- `docs/coding-patterns.md` — service/hook/component patterns
- `docs/design-system.md` — color tokens, typography, component library
- `docs/folder-structure.md` — where everything lives and hard rules per folder

---

## Design System — Non-Negotiable

### Single Source of Truth

All colors are defined **once** in `app/globals.css` `:root` block. Never define colors anywhere else.

### The Palette (Digital Health)

| Role | Token | Value |
|------|-------|-------|
| Primary blue | `--color-primary` | `#1d4ed8` |
| Primary hover | `--color-primary-hover` | `#1e40af` |
| Primary subtle | `--color-primary-subtle` | `#dbeafe` |
| Accent purple | `--color-accent` | `#9333ea` |
| Accent hover | `--color-accent-hover` | `#7c3aed` |
| Accent subtle | `--color-accent-subtle` | `#f3e8ff` |
| Violet | `--color-violet` | `#a855f7` |
| Violet subtle | `--color-violet-subtle` | `#f3e8ff` |
| Pink | `--color-pink` | `#ec4899` |
| Pink subtle | `--color-pink-subtle` | `#fce7f3` |
| Teal (health) | `--color-teal` | `#006a66` |
| Teal subtle | `--color-teal-subtle` | `#dff4f2` |
| Error/tertiary | `--color-error` | `#ab2653` |
| Surface base | `--color-surface` | `#f8f9ff` |
| Surface subtle | `--color-surface-subtle` | `#f2f3ff` |
| White card | `--color-surface-container-lowest` | `#ffffff` |
| Text primary | `--color-text-primary` | `#07071a` |
| Text secondary | `--color-text-secondary` | `#16163a` |
| Text muted | `--color-text-muted` | `#3b3b62` |
| Border | `--color-border` | `rgba(168,85,247,0.13)` |

### Token Usage Rules

```tsx
// ✅ Always use semantic Tailwind tokens
<div className="bg-surface text-text-primary border border-border">
<button className="bg-primary text-white hover:bg-primary-hover">
<span className="text-text-muted bg-accent-subtle">

// ❌ Never hardcode hex values in style props or className
<div style={{ background: '#1d4ed8' }}>
<div className="bg-[#1d4ed8]">
```

### Gradient Utilities

Multi-stop gradients are defined as CSS classes in `globals.css`. Use them via `className`, never inline:

```tsx
// ✅ Named gradient classes
<div className="gradient-hero">          // dark navy → blue → violet → pink
<div className="gradient-brand">         // blue → violet
<div className="gradient-brand-full">    // blue → violet → pink
<div className="gradient-cta-box">       // deep dark CTA background

// ❌ Never inline gradients
<div style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}>
```

**Permitted exceptions** (intentional brand moments, not design system colors):
- `LabAlertCard` critical/warning gradient headers (`#be123c`, `#d97706`)
- WhatsApp share button (`#25D366`)

### Fonts

```tsx
font-display   // Plus Jakarta Sans — headings, labels, numbers
font-body      // Manrope — body text, descriptions, UI copy
font-sans      // Plus Jakarta Sans — alias for display
```

---

## UI Component Library

### Available Components (`components/ui/`)

Always import from the barrel:

```tsx
import { Button, Card, Badge, Input, Heading, Section, Accordion, Spinner,
         GradientHeroHeader, PageHeader, EmptyState, SectionHeader, ListItem
       } from '@/components/ui'
```

### Component Reference

| Component | Use for |
|-----------|---------|
| `Button` | All interactive buttons. Variants: `primary`, `secondary`, `ghost`, `danger`, `link`. Supports `href` for link rendering. |
| `Card` | Card containers. Variants: `default`, `outlined`, `elevated`. |
| `Badge` | Status/tag labels. Variants: `default`, `primary`, `success`, `warning`, `error`, `info`. |
| `Input` | All text inputs. Handles label, error, hint. |
| `Heading` | Semantic headings h1–h6 with consistent sizing. |
| `Section` | Page section wrapper with optional title. |
| `Accordion` | Collapsible content sections. |
| `Spinner` | Loading indicator. |
| `GradientHeroHeader` | Full-bleed gradient hero with nav bar, title, subtitle, stat pills. |
| `PageHeader` | Sticky back-nav bar with title and optional action. |
| `EmptyState` | Empty state with icon, heading, description, CTA. |
| `SectionHeader` | Uppercase section label with optional count and action link. |
| `ListItem` | Icon + title + subtitle + badge row. |

### Do Not Bypass UI Primitives

```tsx
// ✅ Use the component
<Button variant="secondary" disabled>Upgrade</Button>
<Badge variant="warning">High</Badge>
<Input label="Email" type="email" name="email" />

// ❌ Never build these manually
<button className="rounded-full bg-surface-muted ...">Upgrade</button>
<span className="px-2 py-0.5 rounded-full bg-warning-subtle ...">High</span>
<input className="rounded-xl bg-surface-subtle ..." />
```

---

## Architecture Rules

### Component Layers

```
components/ui/          → Zero data deps. Props only. No Supabase, no services.
components/features/    → Receive data from pages. May use hooks. No direct service calls.
components/layout/      → Structural shells. May read constants. No domain data fetching.
app/<route>/page.tsx    → Fetch data (Server Component). Pass as props to feature components.
```

### Service Pattern

```ts
// services/example.service.ts
export const exampleService = {
  async getData(userId: string): Promise<ApiResponse<Data[]>> {
    const supabase = await createClient()
    const { data, error } = await supabase.from('table').select('*').eq('user_id', userId)
    if (error) return { data: null, error: error.message, success: false }
    return { data, error: null, success: true }
  }
}
// ✅ Always return ApiResponse<T> — never throw, never return raw Supabase results
```

### Server Actions

```ts
'use server'
// ✅ Always validate auth inside the action
export async function myAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  // delegate to service
}
```

### Imports

```ts
// ✅ Always use @/ aliases
import { Button } from '@/components/ui'
import { familyService } from '@/services/family.service'
import type { FamilyProfile } from '@/types/family'

// ❌ Never use relative paths for cross-folder imports
import { Button } from '../../../components/ui/Button'
```

---

## Mobile-First — Non-Negotiable

Every component is built mobile-first (375px baseline). Add `sm:`, `md:`, `lg:` modifiers for larger screens.

```tsx
// ✅ Mobile-first
<div className="flex flex-col gap-4 p-4 sm:flex-row sm:gap-6">

// ❌ Desktop-first
<div className="flex flex-row gap-6 max-sm:flex-col">
```

### Touch Targets

All interactive elements must be ≥44×44px (Apple HIG + WCAG 2.5.5).

```tsx
// ✅ Icon-only buttons
<button className="touch-target flex items-center justify-center rounded-xl">

// ✅ Use .pb-safe / .pt-safe on fixed bars
<nav className="fixed bottom-0 inset-x-0 pb-safe">
```

---

## Tailwind v4 Specifics

- Use `shrink-0` not `flex-shrink-0`
- Use `z-100` not `z-[100]` (for standard values)
- Use `bg-white/18` not `bg-white/[.18]`
- Use `-translate-y-px` not `-translate-y-[1px]`
- All theme tokens registered via `@theme inline` in `globals.css` — no `tailwind.config.ts` color overrides

---

## TypeScript Rules

- All props typed with explicit interfaces — no `any`
- Service returns use `ApiResponse<T>` from `@/types`
- No `as any` casts — use type guards or proper generics
- `import type { ... }` for type-only imports
- `interface` for object shapes, `type` for unions

---

## What NOT to Do

| ❌ Never | ✅ Instead |
|----------|-----------|
| Hardcode hex colors in `style={{}}` | Use Tailwind token classes |
| Define `--variable` in page-level CSS | Define in `globals.css :root` only |
| Use `flex-shrink-0` | Use `shrink-0` (Tailwind v4) |
| Import from `components/ui/Button` directly | Import from `@/components/ui` barrel |
| Build raw `<button>`, `<input>`, badge `<span>` | Use `Button`, `Input`, `Badge` components |
| Fetch data in UI primitive components | Fetch in Server Components, pass as props |
| Use `../../` relative imports | Use `@/` absolute imports |
| Put business logic in route files | Put in `services/*.service.ts` |
| Return raw Supabase errors from services | Wrap in `ApiResponse<T>` |
| Create inline gradient `style` props | Use `.gradient-brand`, `.gradient-hero` etc. |

---

## File to Edit for Common Tasks

| Task | File |
|------|------|
| Change a color | `app/globals.css` `:root` block only |
| Add a new gradient | `app/globals.css` gradient utilities section |
| Add a new UI primitive | `components/ui/NewComponent.tsx` + export from `components/ui/index.ts` |
| Add a new page | `app/(app)/route/page.tsx` (authenticated) or `app/(public)/route/page.tsx` |
| Add a server action | `app/actions.ts` or `app/(app)/route/actions.ts` |
| Add business logic | `services/feature.service.ts` |
| Add a type | `types/feature.ts` + re-export from `types/index.ts` |
| Add a constant | `constants/index.ts` |
