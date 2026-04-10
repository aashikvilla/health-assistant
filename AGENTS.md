<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Agent Instructions — Health Assistant

This file is read by AI coding assistants (Claude Code, Cursor, Windsurf, GitHub Copilot, Aider, etc.).
Follow these rules on every code change. They exist to keep a distributed team consistent.

---

## STOP — Read These Files First

1. `CLAUDE.md` — project context, architecture summary, rules
2. `docs/coding-patterns.md` — code examples for every pattern used in this project
3. `docs/folder-structure.md` — where everything lives and why

---

## Next.js 16 Breaking Changes

- `middleware.ts` is deprecated → use `proxy.ts` exporting `proxy` function (not `middleware`)
- Always check `node_modules/next/dist/docs/` for any Next.js API you're unsure about

## Supabase — Use `@supabase/ssr` Only

```ts
// ✅ correct
import { createBrowserClient } from '@supabase/ssr'
import { createServerClient }  from '@supabase/ssr'

// ❌ wrong — old package, not installed
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
```

---

## Non-Negotiable Rules

### Theming — Most Important Rule
- **Never** use raw Tailwind colour classes for semantic colours
- **Always** use CSS variable tokens: `bg-primary`, `text-text-secondary`, `border-border`, `bg-surface`
- Tokens are in `app/globals.css`. When design.md arrives, only that file changes

```tsx
// ✅
<div className="bg-surface border border-border text-text-primary rounded-xl">

// ❌ — hardcoded, won't update with theme
<div className="bg-white border border-gray-200 text-gray-900 rounded-xl">
```

### Components
- Import UI primitives from the barrel only: `import { Button, Card } from '@/components/ui'`
- `components/ui/` = zero external dependencies (no services, no Supabase, no fetching)
- Always forward `className` prop from all components
- Handle all four states: loading · empty · error · success

### Services
- Business logic → `services/<feature>.service.ts`
- Return type: `ApiResponse<T>` from `@/types` — never raw Supabase response shape
- No React, no hooks, no side effects inside services

### Auth
- Every Server Action calls `supabase.auth.getUser()` before any mutation
- `proxy.ts` is an edge guard, not a security guarantee

### TypeScript
- No `any` — use `unknown` + type guard if needed
- All component props explicitly typed with an interface
- No `// @ts-ignore`

### Imports
- Always `@/` aliases — never `../../` relative imports
- Order: React/Next.js → third-party → `@/internal` → relative

---

## Before You Finish Any Task

- [ ] `npm run build` passes — zero errors, zero type errors
- [ ] New components handle all four states (loading / empty / error / success)
- [ ] No `console.log` in committed code
- [ ] Grep your changes for `bg-white`, `text-gray-`, `text-emerald-` — replace with semantic tokens
- [ ] New types → `types/<feature>.ts`
- [ ] New constants → `constants/index.ts`
- [ ] Branch created from `develop`, not from `master`

---

## Editor-Specific Notes

**Cursor / Windsurf** — Both read CLAUDE.md + AGENTS.md automatically. Reference `@docs/coding-patterns.md` when asking for patterns.

**GitHub Copilot** — Open `docs/coding-patterns.md` in a tab to improve context window.

**Claude Code** — Trust CLAUDE.md over training data for project conventions.

**Aider** — Run with: `aider --read CLAUDE.md --read docs/coding-patterns.md`

---

## When a Pattern Isn't Documented

1. Check all files in `docs/` first
2. Ask the team before inventing something new
3. If you build a new pattern, add it to `docs/coding-patterns.md` in the same PR
