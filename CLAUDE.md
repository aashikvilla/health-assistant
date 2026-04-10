# Health Assistant — AI Coding Context

> Read this file before writing any code. If you are making a structural decision not covered here, add it to the relevant doc in `/docs/`.

---

## Project

A collaborative health application built by a distributed team using multiple AI coding editors (Claude Code, Cursor, Windsurf, Copilot, etc.). Every decision here is deliberate — follow the patterns, don't invent new ones unless you've raised them with the team.

**Stack:** Next.js 16.2.3 · React 19 · TypeScript (strict) · Tailwind CSS v4 · Supabase · Vercel

---

## ⚠ Next.js 16 Breaking Changes

- `middleware.ts` is **deprecated** — use `proxy.ts` with exported `proxy` function
- Read `node_modules/next/dist/docs/` before using any Next.js API you're unsure about
- `@supabase/ssr` replaces `@supabase/auth-helpers-nextjs` entirely

---

## Folder Structure

See [`docs/folder-structure.md`](./docs/folder-structure.md) for the complete tree and rules.

**Short version:**

```
app/          → routing + server actions only
components/
  ui/         → primitive UI library (themed, no data fetching)
  layout/     → structural shells
  features/   → domain-specific compound components
services/     → business logic (pure async, no React)
hooks/        → React wrappers around services
lib/supabase/ → Supabase client factories
types/        → TypeScript interfaces
constants/    → app-wide constants (no magic strings)
docs/         → architecture, patterns, design system
```

---

## Theming — Read This Before Styling Anything

All colours, radii, and shadows live in `app/globals.css` as CSS variables.
Tailwind v4 maps them to utilities via `@theme`.

**Always use semantic tokens:**

```tsx
// ✅ correct — updates with the theme
<div className="bg-surface text-text-primary border border-border">

// ❌ wrong — hardcoded colour bypasses theme
<div className="bg-white text-gray-900 border-gray-200">
```

**Token reference:** `docs/design-system.md`
Current palette is a **placeholder** — design.md is pending. Use semantic names so the swap is zero-effort.

---

## Component Rules

1. Import UI primitives from the barrel: `import { Button, Card } from '@/components/ui'`
2. UI components in `components/ui/` have zero dependencies — no services, no Supabase
3. Feature components receive data as props from server components or hooks
4. Each component: typed props, handles loading/empty/error/success states
5. `className` prop always forwarded to allow local overrides

---

## Service Rules

```ts
// services/<feature>.service.ts
export const featureService = {
  async doThing(userId: string): Promise<ApiResponse<Result>> {
    const supabase = await createClient()
    const { data, error } = await supabase.from('table').select('*')
    if (error) return { data: null, error: error.message, success: false }
    return { data, error: null, success: true }
  }
}
```

- Services are plain objects of async functions — no classes, no hooks
- Always return `ApiResponse<T>` — never throw, never return raw Supabase response
- Services can be used in Server Components, Server Actions, API routes, and hooks

---

## Auth Rules

- **Never trust the client** — always call `supabase.auth.getUser()` server-side before mutations
- `proxy.ts` protects `/dashboard/*` at the edge but is not a substitute for server-side auth checks
- OAuth callback is handled at `app/auth/callback/route.ts` — do not move it

---

## Coding Conventions

See [`docs/coding-patterns.md`](./docs/coding-patterns.md) for the full reference.

- TypeScript: no `any`, no type assertions without a comment explaining why
- Imports: always use `@/` aliases, never relative `../../`
- Naming: `PascalCase` components, `camelCase` hooks/services/utils, `SCREAMING_SNAKE` env vars
- No `console.log` in committed code
- Handle all states: loading · empty · error · success — never just the happy path

---

## What Lives Where

| Task | Where |
|---|---|
| Fetch data on page load | `app/.../page.tsx` (Server Component) |
| Client-side data fetching | `hooks/use<Name>.ts` → calls service |
| Business logic | `services/<feature>.service.ts` |
| Form mutations | `app/actions.ts` (Server Actions) |
| REST endpoints | `app/api/<feature>/route.ts` |
| Reusable UI | `components/ui/` |
| Page-specific UI | `components/features/<feature>/` |
| Constants / routes | `constants/index.ts` |
| Shared types | `types/<feature>.ts` |

---

## Docs

| File | Purpose |
|---|---|
| `docs/architecture.md` | System design, data flow, auth flow |
| `docs/folder-structure.md` | Directory tree + rules |
| `docs/coding-patterns.md` | Patterns with code examples |
| `docs/design-system.md` | Colour tokens, typography (design.md pending) |

---

## Branches

| Branch | Purpose |
|---|---|
| `master` | Production — deploys to https://health-assistant-snowy.vercel.app |
| `develop` | Integration — PRs merge here first |
| `feature/*` | Feature branches — branch off `develop` |
| `fix/*` | Bug fixes — branch off `develop` |

**Never commit directly to `master`.** PRs only.
