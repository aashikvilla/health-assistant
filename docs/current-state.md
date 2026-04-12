# Nuskha — Current State (Honest Audit)

> **Date of audit:** 2026-04-13
> **Audited by:** Claude (Sonnet 4.6) on `develop` branch
> **Purpose:** Single source of truth for what's actually built, what's a stub, and what's broken.
>
> For the full feature plan with independent work units, see **`docs/plan.md`**.
> For the full DB schema, see **`docs/schema.md`**.

---

## 1. TL;DR

| | |
|---|---|
| **Works end-to-end** | Auth (email + Google OAuth), Family Hub, Add Member, Public upload → review → AI explanation → save → login → auto-save to DB → redirect to document view |
| **Works in dev only** | OCR extraction — real AI calls fail (broken model ID `google/gemma-4-26b-a4b-it` in `lib/extract.ts`). `NEXT_PUBLIC_DEV_MODE=true` returns mock data. |
| **Stub / always redirects** | `/explanation/[id]` — `fetchPrescription` returns `null`, page always redirects to `/dashboard` |
| **Minimal stub** | `/settings` — shows email + sign-out only |
| **Not started** | `/share/[token]`, medication reminders, push notifications, lab trends, profile editing, onboarding |

**Single biggest blocker to a real demo:** Fix the AI model in `lib/extract.ts`. Three functions all use `google/gemma-4-26b-a4b-it` which doesn't exist on OpenRouter.

---

## 2. FRD Feature Map

| FRD ID | Feature | Status | Notes |
|---|---|---|---|
| **F1** | Auth (email + Google OAuth) | ✅ **Built** | `ensureSelfProfile` called in `(app)/layout.tsx` on every authenticated render — safety net for all sign-in paths. `emailRedirectTo` wired for email confirmation. `returnTo` threaded through auth forms. |
| **F2** | Document upload + DB persist | ✅ **Built** | `createFromExtraction` writes `documents` + `document_analyses` + `prescriptions` + `timeline_events`. Public upload flow: review → AI explanation → save → auth redirect → auto-save to DB → `/records/{id}`. Authenticated upload at `/dashboard/upload/[profileId]`. |
| **F2-A** | Fix AI model | 🔴 **Blocked** | `lib/extract.ts` uses `google/gemma-4-26b-a4b-it` — not a real OpenRouter model. Hidden by `NEXT_PUBLIC_DEV_MODE=true`. |
| **F3** | Records & Timeline | ✅ **Built** | `/records/[id]` (DocumentDetail), `/timeline` (TimelineView with profile + type filters), `records.service.ts`. |
| **F4** | Plain-language explanation (authenticated) | ❌ **Stub** | `app/(app)/explanation/[id]/page.tsx` exists but `fetchPrescription` returns `null` → always redirects. The explanation components (`MedicationCard`, `DoctorNotes`, `DisclaimerBanner`) are correctly typed and working — just need to be wired to real data. |
| **F5** | Family Hub (profiles + per-profile data) | ✅ **Built** | Dashboard, ProfileWheel, AddMemberForm, PrescriptionListItem, ActiveMedicationsStrip, LabAlertCard all working. |
| **F6** | Profile editing | ❌ **Missing** | No edit form. Profiles created with email prefix as name. |
| **F7** | Share via signed link | ❌ **Missing** | No routes, no `shared_links` writes. |
| **F8** | Medication reminders + push | ❌ **Missing** | DB schema exists, nothing else. |

---

## 3. Page-by-Page Status

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ Built | Marketing landing page with hero, features, how-it-works |
| `/upload` | ✅ Built | Full elderly-UX flow: upload → OCR → review → AI explanation → save CTA → auth redirect |
| `/auth` | ✅ Built | Email + Google OAuth, sign-in + sign-up tabs, `returnTo` hidden field, "check email" info message |
| `/auth/callback` | ✅ Built | `ensureSelfProfile` + redirect to `next` param (defaults `/dashboard`) |
| `/dashboard` | ✅ Built | Family hub: ProfileWheel, active medications strip, lab alerts, prescription list, PendingUploadBanner |
| `/dashboard/add-member` | ✅ Built | Add family member form with relationship picker |
| `/dashboard/upload/[profileId]` | ✅ Built | Authenticated upload → review → save to DB |
| `/records/[id]` | ✅ Built | Document detail: prescription summary, medication list with dosage/duration, lab report with test values + status badges |
| `/timeline` | ✅ Built | All records chronological, filterable by profile + type (prescriptions / lab reports) |
| `/settings` | ⚠ Stub | Shows email + sign-out. Needs `users_profile` (F1-A) before real content. |
| `/explanation/[id]` | ❌ Stub | `fetchPrescription` returns `null` → always redirects to `/dashboard` |
| `/share/[token]` | ❌ Missing | Not started |

---

## 4. Key service status

| Service | Status | Notes |
|---|---|---|
| `services/family.service.ts` | ✅ | `getProfiles`, `createProfile`, `ensureSelfProfile`, `getProfilePrescriptions` |
| `services/documents.service.ts` | ✅ | `createFromExtraction` — writes documents + analyses + prescriptions + timeline_events |
| `services/records.service.ts` | ✅ | `getAllDocumentsForUser`, `getRecord` |
| `lib/extract.ts` | 🔴 Broken | `google/gemma-4-26b-a4b-it` model ID does not exist on OpenRouter. Fix before turning off dev mode. |
| `app/api/ocr/route.ts` | ✅ (dev) | Calls `lib/extract.ts`. Works in dev mode with mock. |
| `app/api/explain/route.ts` | ✅ | Plain-language explanation generation. Used in public upload flow. |

---

## 5. Data flow (public upload → authenticated view)

```
/upload (public)
  → user uploads image
  → /api/ocr → lib/extract.ts → PrescriptionData | LabReportData
  → ReviewScreen (user verifies OCR)
  → /api/explain → PrescriptionExplanation
  → AI explanation screen with "Save to My Account" CTA
  → localStorage.setItem('nuskha_pending_upload', { type, data, explanation })
  → redirect to /auth?mode=signup&return=/dashboard

/auth
  → user signs up or signs in
  → signUp/signIn server action → ensureSelfProfile (creates family_group + family_profile + membership)
  → redirect to /dashboard

/dashboard
  → PendingUploadBanner mounts
  → reads localStorage, finds pending upload
  → auto-calls savePendingUpload server action
  → createFromExtraction → documents + document_analyses + prescriptions + timeline_events
  → redirect to /records/{documentId}

/records/{id}
  → DocumentDetail renders the saved prescription/lab report
```

---

## 6. Auth data flow

| Path | ensureSelfProfile called? |
|---|---|
| Email sign-up, no email confirmation (session immediate) | ✅ in `signUp` action |
| Email sign-up, email confirmation required | ✅ in `/auth/callback` (after user clicks email link) |
| Google OAuth | ✅ in `/auth/callback` |
| Email sign-in | ✅ in `signIn` action |
| Any authenticated page load (safety net) | ✅ in `(app)/layout.tsx` |

---

## 7. What's NOT fixed (deliberately deferred)

| Issue | Why deferred |
|---|---|
| F2-A: AI model fix | Architectural decision — which provider? OpenRouter model choice, Gemini direct, or Anthropic. |
| F4: Wire explanation page | Needs F2-A working first to have real `terms_explained` data in DB. |
| F1-A: users_profile row | Low priority — no feature currently reads it. Needed before settings/onboarding. |
| F1-B: Onboarding | Needs users_profile first. Self-profile currently uses email prefix as name. |
| F6: Profile editing | Post-MVP quality of life. |
| F5/F7/F8/F11 | Not started — see `docs/plan.md` for specs. |

---

## 8. Coding standards (enforced)

- **No `any`**, no type assertions without comment
- **Server Components default** — `'use client'` only when state/effects/browser APIs are needed
- **`ApiResponse<T>`** from all services — never throw, never return raw Supabase result
- **Semantic tokens only** — `bg-surface`, `text-text-primary`, `border-border`. Never `bg-white`, `text-gray-900`
- **`@/` imports** — never relative `../../`
- **44px minimum touch targets** — enforced on all interactive elements
- **Handle all states** — loading · empty · error · success. No happy-path-only components

---

## 9. Files to read first when picking this up

1. `docs/MedAssist_AI_FRD.md` — product vision
2. **This file** — current reality
3. `CLAUDE.md` — conventions
4. `docs/architecture.md` — data flow
5. `app/(app)/dashboard/page.tsx` — the working vertical slice
6. `services/family.service.ts` — canonical service shape
7. `lib/supabase/server.ts` — auth + dev-bypass plumbing
8. `app/globals.css` — design tokens
