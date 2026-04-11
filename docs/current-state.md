# Nuskha — Current State (Honest Audit)

> **Date of audit:** 2026-04-12 (updated same day)
> **Audited by:** Claude (Sonnet 4.6) on `develop` branch
> **Purpose:** Single source of truth for what's actually built, what's static, what's broken, and what's missing.
>
> For the full feature plan with independent work units, see **`docs/plan.md`**.
> For the full DB schema, see **`docs/schema.md`**.

---

## 1. TL;DR

| | |
|---|---|
| **What works end-to-end** | Auth (email + Google OAuth), Family Hub (profiles + active medications + lab alerts), Add Member form, Upload → Storage → DB persist |
| **What works half-way** | OCR extraction works in dev-mode mock only — real AI calls fail (broken model ID in `lib/extract.ts`) |
| **What's a stub** | Explanation page (`/explanation/[id]`), `/timeline` (stub page), `/settings` (stub page) |
| **What doesn't exist** | `/records/[id]`, `/share/[token]`, medication reminders, push notifications, lab trends |
| **Data gap** | `documentsService.createFromExtraction` does NOT write to `prescriptions` table — hub list is always empty |

**Bottom line:** Upload → DB is now wired. Family sharing model (profile_memberships, family_groups) is live. The single biggest blocker to a real demo is the broken OpenRouter model ID — fix that and the full upload → hub flow works end-to-end.

---

## 2. FRD Feature Map (F1–F8)

Cross-referenced against `docs/MedAssist_AI_FRD.md`.

| FRD ID | Feature | Status | Notes |
|---|---|---|---|
| **F1** | Auth (email + Google OAuth) | ✅ **Built** | Server actions in `app/actions.ts`, OAuth callback at `app/auth/callback/route.ts`. Email verification flow exists via Supabase. `DEV_BYPASS_AUTH=true` injects mock user via `lib/supabase/server.ts` Proxy wrapper. |
| **F2** | Document upload (image/PDF/manual) | ⚠ **Partial** | UI complete (`app/upload/page.tsx`). PDF text extraction works via `pdf-parse` (`lib/pdf-utils.ts`). OCR endpoint at `app/api/ocr/route.ts` calls OpenRouter. **Persistence missing** — confirmed prescriptions only go to `localStorage` and an `alert()`. No `documents` table writes. |
| **F3** | AI extraction & classification | ⚠ **Broken model** | `lib/extract.ts` calls model `google/gemma-4-26b-a4b-it` — **this model identifier does not exist on OpenRouter**. Real calls will 404. FRD specifies Gemini Flash → Groq → Claude tiering; current code is single-tier OpenRouter only. `NEXT_PUBLIC_DEV_MODE=true` returns mocked response and bypasses the broken model — that's why no one noticed. |
| **F4** | Plain-language explanation (`/explanation/[id]`) | ❌ **Stub only** | Page renders, but `fetchPrescription(_id)` always returns `null`, so the page **always redirects to `/dashboard`**. `MedicationCard` is typed against the wrong interface (`Medication` instead of `MedicationExplanation`) — the rich fields it reads (`treats`, `howToTake`, `sideEffects`, `avoid`) don't exist on the type. Would be a TypeScript error if it were ever rendered. |
| **F5** | Family Hub (profiles + per-profile prescriptions) | ✅ **Built** | `app/hub/page.tsx` + `services/family.service.ts`. ProfileWheel, AddMemberForm, EmptyPrescriptions, PrescriptionListItem all clean. 5-profile cap enforced server-side (`FAMILY_LIMITS.maxProfiles`). DEV_BYPASS_AUTH skips RLS-blocked profile fetch. |
| **F6** | Records / timeline (`/timeline`, `/records/[id]`) | ❌ **Missing** | No routes exist. BottomNav links to `/timeline` (404). `PrescriptionListItem` links to `/records/${id}` (404). Stage 6 unstarted. |
| **F7** | Share via signed link (`/share/[token]`) | ❌ **Missing** | No routes, no `shared_links` table writes. Stage 7 unstarted. |
| **F8** | Medication reminders + push | ❌ **Missing** | DB schema exists (`medications`, `medication_logs`, `push_subscriptions`, `preventive_reminders`) but **no UI, no service, no PWA push wiring**. Service worker file exists but only handles install banner. |

---

## 3. Page-by-Page Status

| Route | File | Status | Issues |
|---|---|---|---|
| `/` | `app/page.tsx` | Built, marketing | Uses `from-primary-bright` token (doesn't exist — falls back to nothing) |
| `/auth` | `app/auth/page.tsx` | Built | Uses `bg-surface-lowest` (doesn't exist) |
| `/auth/callback` | route handler | Built | **Defaults `next` to `/dashboard`** — should be `/hub` |
| `/dashboard` | `app/dashboard/page.tsx` | **Static placeholder, to be removed** | "Steps Today —", "Water Intake —". Uses `glass` (doesn't exist), `bg-secondary-subtle` (doesn't exist). Was the original landing for auth'd users; superseded by `/hub`. |
| `/hub` | `app/hub/page.tsx` | ✅ Built | The canonical post-auth landing. Has its own header (should move to shared layout). |
| `/hub/add-member` | `app/hub/add-member/page.tsx` | ✅ Built | Has its own header. Hardcodes `MAX_PROFILES = 5` (also defined in `constants/index.ts`). |
| `/upload` | `app/upload/page.tsx` | ⚠ Partial | Three-step state machine works. **Confirms drop to `localStorage` instead of DB.** Heavy use of `var(--nuskha-*)` CSS vars that **don't exist in `globals.css`** — visual styling silently falls back. No header. `_components` folder violates documented folder structure. |
| `/explanation/[id]` | `app/explanation/[id]/page.tsx` | ❌ Stub | Always redirects. `MedicationCard` type is wrong. Uses `bg-surface-container-lowest` (exists) and `shadow-ambient` (doesn't). |
| `/timeline` | — | ❌ Missing | BottomNav links here |
| `/settings` | — | ❌ Missing | BottomNav links here |
| `/records/[id]` | — | ❌ Missing | PrescriptionListItem links here |
| `/share/[token]` | — | ❌ Missing | FRD F7 |

---

## 4. Cross-cutting issues, by severity

### 🔴 Critical (silent failures, broken user paths)

1. **Upload never persists.** Confirmed prescriptions are saved to `localStorage` and the user gets an `alert()`. No `documents` row is written. This is the single biggest gap to MVP.
2. **Explanation page is a stub.** `fetchPrescription()` returns `null`. The whole "AI explains your medicines" feature does not function.
3. **Invalid OpenRouter model.** `google/gemma-4-26b-a4b-it` is not a real model ID. The real OCR path will 404. Hidden by `NEXT_PUBLIC_DEV_MODE=true` mock.
4. **`MedicationCard` is type-broken.** Reads fields that don't exist on the `Medication` type. TypeScript would catch this if the page were ever wired up to real data.
5. **Auth redirect inconsistency.** `app/actions.ts` redirects to `/dashboard`. `lib/supabase/middleware.ts` redirects authenticated users from `/auth` to `/hub`. `auth/callback/route.ts` defaults `next` to `/dashboard`. Three different "where do I land after sign-in" answers in three files.
6. **`proxy.ts` vs `middleware.ts` contradiction on `/upload`.** `proxy.ts` matcher excludes `upload` and `api/ocr`; `middleware.ts` lists `/upload` in `protectedPrefixes`. The exclusion wins, so `/upload` is **silently unauthenticated** despite being listed as protected. This means anyone can hit upload without signing in — possibly intentional for the "try before signup" flow, but undocumented.

### 🟡 Medium (visible but not blocking)

7. **`/dashboard` is dead weight.** Static placeholder with hard-coded em-dashes. Should be merged into `/hub` (the user explicitly asked for this).
8. **No shared header/footer.** Every page builds its own header bar. Hub, dashboard, add-member, explanation, upload all duplicate logo/nav patterns inconsistently.
9. **`app/upload/_components/`** — private folder violates the documented folder structure (`docs/folder-structure.md` says feature components belong in `components/features/<feature>/`).
10. **`.env.example` is incomplete.** Missing `OPENROUTER_API_KEY`, `DEV_BYPASS_AUTH`, `NEXT_PUBLIC_DEV_MODE`. New devs cloning the repo won't know they need these.
11. **`manifest.ts` has old branding.** `name: 'Health Assistant'`, `theme_color: '#059669'` (old emerald), shortcut points to `/dashboard`. Doesn't match `app/layout.tsx` which uses Nuskha + `#0058bd`.
12. **BottomNav has dead links.** Links to `/timeline` and `/settings` — both 404.
13. **Non-existent design tokens used silently.** Many components reference Tailwind classes for tokens that aren't defined in `@theme inline`:
    - `bg-surface-lowest` → should be `bg-surface-container-lowest`
    - `from-primary-bright`, `to-tertiary` → not defined
    - `bg-secondary`, `bg-secondary-subtle` → not defined (palette has no "secondary")
    - `border-on-surface`, `text-on-surface` → not defined
    - `shadow-ambient` → not defined
    - `glass` → should be `glass-surface`
    - `safe-bottom` → should be `pb-safe`
    - `tertiary` token defined in `:root` but **not registered in `@theme inline`**
14. **Upload screens use `--nuskha-*` CSS vars that don't exist** in `globals.css` (`--nuskha-surface`, `--nuskha-primary`, `--nuskha-on-surface`, `--nuskha-teal`, `--nuskha-alert`, `--nuskha-surface-low`, `--nuskha-surface-lowest`, `--nuskha-primary-container`, `--nuskha-teal-container`, `--font-jakarta`). Inline `style={{ background: 'var(--nuskha-...)' }}` falls back silently, so the screens render with no background color and partially-broken typography.

### 🟢 Minor (cleanup)

15. **`PWAInstallBanner` uses `safe-bottom`** (should be `pb-safe`) and `animate-slide-up` (not defined). Also says "Install Health Assistant" — old branding.
16. **`docs/design-system.md` is stale** — still describes the placeholder emerald palette even though "Clinical Curator" is now applied.
17. **`docs/folder-structure.md`** doesn't mention the `app/upload/_components/` exception or the `app/explanation/[id]/` route.
18. **Stage 5 dev log** in `docs/stage-5-dev-log.md` is the only stage log; other stages have no equivalent.

---

## 5. Fixes applied in this audit pass

These are *small, contained* fixes the user authorized as part of "fix if small, rest let's document":

| # | Fix | File(s) |
|---|---|---|
| F1 | Add missing env vars to `.env.example` | `.env.example` |
| F2 | Redirect all auth flows to `/hub` instead of `/dashboard` | `app/actions.ts`, `app/auth/callback/route.ts` |
| F3 | Replace `/dashboard` page with a redirect to `/hub` (preserve external links) | `app/dashboard/page.tsx` |
| F4 | Remove `dashboard` from `ROUTES` constant | `constants/index.ts` |
| F5 | Update PWA manifest to Nuskha branding + correct theme color + shortcut to `/hub` | `app/manifest.ts` |
| F6 | Add `--nuskha-*` token aliases to `globals.css` so upload screens actually render | `app/globals.css` |
| F7 | Register `--color-tertiary` in `@theme inline` (was defined but not exposed to Tailwind) | `app/globals.css` |
| F8 | Move `app/upload/_components/*` to `components/features/upload/*` and update imports | `app/upload/page.tsx`, `components/features/upload/*` |
| F9 | Fix `MedicationCard` to accept `MedicationExplanation` from `types/analysis.ts` | `components/features/explanation/MedicationCard.tsx` |
| F10 | Fix `PWAInstallBanner`: `safe-bottom`→`pb-safe`, branding to Nuskha, drop missing `animate-slide-up` | `components/layout/PWAInstallBanner.tsx` |
| F11 | Extract `AppHeader` + `AppFooter` shared layout components and use them in `/hub` | `components/layout/AppHeader.tsx`, `components/layout/AppFooter.tsx`, `app/hub/page.tsx` |
| F12 | Fix `/upload` auth contradiction: remove from `proxy.ts` matcher exclusion (it should be protected) | `proxy.ts` |
| F13 | Update `docs/folder-structure.md` to reflect the upload move and document the no-`_components` rule | `docs/folder-structure.md` |
| F14 | Update `docs/design-system.md` to document the actual Clinical Curator palette in use | `docs/design-system.md` |

---

## 6. What's NOT fixed (deliberately deferred)

These need design discussion or are too large for a single audit pass:

| Issue | Why deferred | Owner |
|---|---|---|
| Upload → DB persistence | Needs `documents.service.ts`, `document_analyses.service.ts`, server action, RLS test. Real Stage 2 work, not a fix. | stage-2-upload |
| Real explanation pipeline | Needs the AI explanation prompt, `document_analyses.medications_found` JSON write path, server fetch in `app/explanation/[id]/page.tsx`. Stage 3 work. | stage-3-insight |
| OpenRouter model fix | Need to decide: stay on OpenRouter (pick a real model), or switch to Gemini Flash direct (FRD's choice), or wire Anthropic. Architectural decision, not a typo fix. | tech lead |
| `/timeline`, `/settings`, `/records/[id]`, `/share/[token]` routes | Stages 6 + 7 unstarted. BottomNav and PrescriptionListItem will keep 404'ing until those teams ship. | stage-6, stage-7 |
| Remove inline-style heavy upload components | Refactoring all `style={{ }}` props to Tailwind classes is a 5-file rewrite. Aliasing `--nuskha-*` (F6) makes them render correctly without the rewrite. Refactor when stage-2-upload picks this up next. | stage-2-upload |
| Migration of remaining hardcoded design tokens | Many files use ad-hoc `from-primary-bright`, `bg-surface-lowest`, etc. Sweeping these requires touching ~15 files. | next styling pass |
| Medication reminder UI + push wiring | Stage 8 unstarted. DB tables exist; nothing else. | stage-8 |

---

## 7. Coding standards (written down so they actually get followed)

These are the conventions everyone is supposed to follow. Some are documented in `CLAUDE.md` / `AGENTS.md` already; this is the consolidated list.

### Folder structure (hard rules)

- **Routing & Server Actions only** in `app/`. No business logic, no compound components.
- **Compound feature components** live in `components/features/<feature>/`. **Never** in `app/<route>/_components/`.
  - Exception: a single-use leaf component used only by one route's page may colocate, but if it grows past one file or 100 LOC, move it.
- **UI primitives** in `components/ui/` have **zero data dependencies** — no Supabase, no services, no `next/headers`. Import them via the barrel: `import { Button, Card } from '@/components/ui'`.
- **Layout shells** in `components/layout/`. The new shared header/footer (`AppHeader`, `AppFooter`) live here.
- **Services** in `services/<feature>.service.ts`. Plain object exports of async functions. **Always return `ApiResponse<T>`** — never throw, never return raw Supabase results.
- **Types** in `types/<feature>.ts`. Re-export from `types/index.ts` for tree-friendly imports.

### Theming (hard rules)

- **Always use semantic Tailwind tokens.** `bg-surface`, `text-text-primary`, `border-border`. Not `bg-white`, `text-gray-900`, `border-gray-200`.
- **Never use inline `style={{ }}` with raw CSS variables** (`var(--nuskha-...)`). It silently falls back when the var is missing. Use Tailwind classes that map to `@theme inline`.
- If you need a token that doesn't exist, **add it to both `:root` AND `@theme inline`** in `app/globals.css`. Both blocks. Tailwind v4 doesn't see vars that aren't registered in `@theme inline`.
- See `docs/design-system.md` for the canonical Clinical Curator palette.

### Auth (hard rules)

- **Never trust the client.** Every server action, route handler, and Server Component that mutates or reads user-scoped data must call `supabase.auth.getUser()` server-side first.
- Middleware (`proxy.ts` → `lib/supabase/middleware.ts`) is for **session refresh + edge redirects**, not as the primary auth check.
- The canonical post-auth landing is `/hub`. If you're tempted to redirect somewhere else, update this doc first.
- `DEV_BYPASS_AUTH=true` is **dev-only** and gated on `NODE_ENV === 'development'` in `lib/supabase/server.ts`. Never ship this to prod.

### Mobile-first (hard rules)

- Base Tailwind classes target 375px. Add `sm:` / `md:` / `lg:` for larger.
- Touch targets ≥ **44×44px**.
- Inputs ≥ `text-base` (16px) to prevent iOS auto-zoom.
- Use `pb-safe` / `pt-safe` on fixed bars. Never hardcode safe-area px values.

### TypeScript (hard rules)

- **No `any`.** No type assertions without an inline `// reason: …` comment.
- Imports use `@/` aliases. No `../../../`.
- All states handled in components: loading · empty · error · success. Never just the happy path.
- No `console.log` in committed code.

### When in doubt

- **Read the existing service before writing a new one.** Half the bugs in this codebase are duplicated logic that drifted apart.
- **Read this file** before adding a new route or feature so you know the gap.
- **Update this file** when you ship something that changes the picture.

---

## 8. Recommended next steps to reach FRD MVP

In priority order:

1. **Pick the AI provider story.** Decide: real OpenRouter model, Gemini Flash direct, or Anthropic. Update `lib/extract.ts`. Without this, every other fix downstream is wasted.
2. **Wire upload → DB.** Build `services/documents.service.ts` with `createDocument()`. Replace the `localStorage.setItem` + `alert()` in `app/upload/page.tsx` with a server action that writes to `documents` and links to `family_profiles.id`.
3. **Wire explanation pipeline.** Build the explanation service, write the `document_analyses` JSON shape, swap the stub `fetchPrescription()` for a real query. Fix `MedicationCard`'s type (already done in this pass — see F9).
4. **Stub the missing routes.** Even an "Coming soon" `/timeline` page is better than a 404 from BottomNav. 30 minutes of work, big UX improvement.
5. **Stage 6 (records).** This is the natural next vertical slice — it consumes the data Stage 2 produces.
6. **Sweep the design tokens.** Once a single pass is funded, replace every `bg-surface-lowest` with `bg-surface-container-lowest`, every `var(--nuskha-*)` with a Tailwind class, etc. Add a lint rule to prevent regressions.

---

## 9. Files worth reading first when picking this up

If you're new to the codebase, read these in this order — they give you the full mental model in ~30 min:

1. `docs/MedAssist_AI_FRD.md` — the product vision
2. **This file** — the gap between vision and reality
3. `CLAUDE.md` + `AGENTS.md` — the conventions
4. `docs/architecture.md` — the data flow
5. `app/hub/page.tsx` — the only fully-working vertical slice (read top to bottom)
6. `services/family.service.ts` — the canonical service shape
7. `lib/supabase/server.ts` — the auth + dev-bypass plumbing
8. `app/globals.css` — the design tokens

Skip `app/dashboard/page.tsx` and `app/explanation/[id]/page.tsx` — both are about to be reworked.
