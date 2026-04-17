# Folder Structure

```
health-assistant/
│
├── app/                          # Next.js App Router  routing + Server Actions only
│   ├── api/                      # Route handlers (REST endpoints)
│   │   └── ocr/
│   │       └── route.ts          # Document OCR + classification (Stage 2)
│   ├── auth/
│   │   ├── page.tsx              # Sign in / Sign up form
│   │   └── callback/
│   │       └── route.ts          # OAuth callback handler
│   ├── dashboard/
│   │   └── page.tsx              # ⚠ DEPRECATED  redirects to /hub. Will be deleted.
│   ├── explanation/
│   │   └── [id]/
│   │       └── page.tsx          # ⚠ Stub  Stage 3 not yet wired
│   ├── hub/
│   │   ├── layout.tsx            # Auth guard + BottomNav mount point
│   │   ├── page.tsx              # Family hub home (canonical post-auth landing)
│   │   ├── actions.ts            # Server Action: createProfile
│   │   └── add-member/
│   │       └── page.tsx          # Add family profile
│   ├── upload/
│   │   └── page.tsx              # Upload / OCR / review state machine
│   ├── actions.ts                # Top-level Server Actions (signIn/signUp/signOut/OAuth)
│   ├── layout.tsx                # Root layout (fonts, PWA registration, install banner)
│   ├── manifest.ts               # PWA manifest
│   ├── page.tsx                  # Marketing landing /
│   └── globals.css               # Design tokens + Tailwind v4 @theme registration
│
├── components/                   # All React components
│   ├── ui/                       # ✦ Primitive UI library  ZERO data deps
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Heading.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Section.tsx
│   │   ├── Accordion.tsx
│   │   ├── Spinner.tsx
│   │   ├── GradientHeroHeader.tsx  # Full-bleed gradient hero with nav + stats
│   │   ├── PageHeader.tsx          # Sticky back-nav bar for sub-pages
│   │   ├── EmptyState.tsx          # Icon + heading + description + CTA
│   │   ├── SectionHeader.tsx       # Uppercase label with optional count + action
│   │   ├── ListItem.tsx            # Icon + title + subtitle + badge row
│   │   └── index.ts              # Barrel  always import via @/components/ui
│   ├── layout/                   # Structural layout shells (used by routes)
│   │   ├── PageHeader.tsx        # Variant-driven header (brand / page)
│   │   ├── PageFooter.tsx        # Slim footer for public/marketing routes
│   │   ├── BottomNav.tsx         # Mobile bottom nav  primary routes only
│   │   ├── AppDrawerNav.tsx      # Desktop slide-out drawer nav
│   │   ├── LogoutButton.tsx      # Sign-out form action
│   │   ├── PWAInstallBanner.tsx  # iOS/Android install prompt
│   │   └── ServiceWorkerRegistration.tsx
│   └── features/                 # Feature-specific compound components
│       ├── family/               # Stage 5  hub
│       │   ├── ProfileWheel.tsx
│       │   ├── ProfileChip.tsx
│       │   ├── AddProfileChip.tsx
│       │   ├── PrescriptionListItem.tsx
│       │   ├── EmptyPrescriptions.tsx
│       │   └── AddMemberForm.tsx
│       ├── upload/               # Stage 2  upload state machine pieces
│       │   ├── UploadPicker.tsx
│       │   ├── ProcessingState.tsx
│       │   ├── ReviewScreen.tsx
│       │   ├── LabReportReviewScreen.tsx
│       │   └── FieldRow.tsx
│       └── explanation/          # Stage 3  prescription explanation cards
│           ├── MedicationCard.tsx
│           ├── DoctorNotes.tsx
│           ├── DisclaimerBanner.tsx
│           ├── ExplanationActions.tsx
│           └── index.ts
│
├── services/                     # Business logic  NO React, NO UI
│   └── family.service.ts         # The canonical service-shape reference
│
├── hooks/                        # Custom React hooks (wrap services)
│
├── lib/                          # Infrastructure & utilities
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server client (with DEV_BYPASS_AUTH proxy)
│   │   └── middleware.ts         # Session refresh + protected-prefix redirects
│   ├── extract.ts                # OpenRouter LLM calls for OCR/classification
│   └── pdf-utils.ts              # PDF text extraction
│
├── types/                        # TypeScript types & interfaces
│   ├── index.ts                  # Barrel export
│   ├── api.ts                    # ApiResponse<T> wrapper
│   ├── user.ts
│   ├── family.ts                 # FamilyProfile, HubPrescription
│   ├── prescription.ts           # Raw extraction shape (Stage 2)
│   ├── lab-report.ts             # Lab report extraction shape
│   ├── analysis.ts               # MedicationExplanation, DocumentAnalysisData
│   └── database.ts               # Auto-generated Supabase types
│
├── constants/                    # App-wide constants  no magic strings
│   └── index.ts                  # ROUTES, FAMILY_LIMITS, AUTH_PROVIDERS
│
├── docs/                         # Project documentation
│   ├── current-state.md          # ★ READ THIS FIRST  honest audit
│   ├── folder-structure.md       # This file
│   ├── coding-patterns.md
│   ├── architecture.md
│   ├── design-system.md          # Digital Health palette reference (canonical)
│   ├── MedAssist_AI_FRD.md       # Product requirements
│   └── stage-5-dev-log.md
│
├── public/                       # Static assets, icons, sw.js
│
├── proxy.ts                      # Next.js 16 edge middleware (renamed from middleware.ts)
├── tailwind.config.ts            # Almost empty  all theming lives in globals.css
├── CLAUDE.md                     # AI assistant context (primary  read this first)
└── AGENTS.md                     # Agent-specific coding rules and quick reference
```

---

## Hard rules

### `app/`
- **Routing, layouts, and Server Actions only.** No business logic. No compound components.
- Server Actions go in `app/actions.ts` (top-level) or `app/<route>/actions.ts` (route-scoped).
- Async `searchParams` and `params` (Next.js 16)  always `await` them.

### `components/ui/`
- **Zero data dependencies.** No Supabase, no services, no `next/headers`.
- Always import via the barrel: `import { Button, Card } from '@/components/ui'`.
- Theme-aware via semantic tokens  never hardcoded colors.
- Forward `className` so callers can override.

### `components/layout/`
- Structural shells used by routes (header, footer, nav, banners).
- May read from constants (`APP_NAME`) but should not call services.
- `AppHeader` is variant-driven (`'brand' | 'page'`) so every authenticated page gets the same shell.

### `components/features/<feature>/`
- Compound components owned by a single feature/stage.
- **Never use `app/<route>/_components/`.** That folder pattern violates this structure  if you find one, move it. (Stage 2 had one; it has been moved to `components/features/upload/`.)
- One exception: a single-file leaf component used only by one route's page may colocate inside `app/<route>/`. The moment it grows past 100 LOC or gets a sibling, move it to `components/features/`.

### `services/<feature>.service.ts`
- Plain object exports of async functions. No classes. No hooks.
- **Always return `ApiResponse<T>`**  never throw, never return raw Supabase results.
- Usable from Server Components, Server Actions, route handlers, and hooks alike.

### `hooks/`
- React-side wrappers around services. They never call Supabase directly.

### `lib/`
- Pure utilities + Supabase client factories. No React. No services.
- `lib/supabase/server.ts` is the only place that owns the `DEV_BYPASS_AUTH` mock-user injection.

### `types/`
- Types and interfaces only  no runtime code, no enums backed by objects.
- Re-export from `types/index.ts` so callers can do `import type { Foo } from '@/types'`.

### `constants/`
- `const` values only  no functions.
- Anything that would otherwise be a magic string in components belongs here.

---

## Imports

- **Always use `@/` aliases.** No `../../../`.
- Import UI primitives via the barrel (`@/components/ui`), not individual files.
- Type-only imports use `import type { ... }`.
