# Nuskha — Current State (Honest Audit)

> **Date of audit:** 2026-04-13
> **Audited by:** Claude (Sonnet 4.6) on `develop` branch — post family-profile-management commit
> **Purpose:** Single source of truth for what's actually built, what's a stub, and what's broken.
>
> For the full feature plan with independent work units, see **`docs/plan.md`**.
> For the full DB schema, see **`docs/schema.md`**.

---

## 1. TL;DR

| | |
|---|---|
| **Works end-to-end** | Auth (email + Google OAuth), Family Hub, Add Member, Public upload → review → AI explanation → save → login → auto-save to DB → redirect to document view, Records, Timeline |
| **Works end-to-end** | OCR extraction — `google/gemma-4-26b-a4b-it` (Gemma 4 26B, multimodal, 256K context) confirmed live on OpenRouter. Real uploads work with dev mode off. |
| **Stub / always redirects** | `/explanation/[id]` — `fetchPrescription` returns `null`, page always redirects to `/dashboard` |
| **Minimal stub** | `/settings` — shows email + sign-out only |
| **Not started** | `/share/[token]`, medication reminders UI, push notification UI, lab trends, profile editing, onboarding |

**Core flow is complete.** Auth → upload → OCR → explanation → save → view all work end-to-end.

---

## 2. FRD Feature Map

| FRD ID | Feature | Status | Notes |
|---|---|---|---|
| **F1** | Auth (email + Google OAuth) | ✅ **Built** | `ensureSelfProfile` called in `(app)/layout.tsx` on every authenticated render. `emailRedirectTo` wired. `returnTo` threaded through auth forms. |
| **F1-A** | `users_profile` row on signup | ❌ **Missing** | Table exists, never written to. Needed for settings + onboarding. |
| **F1-B** | Onboarding flow | ❌ **Missing** | No route, no form. Self-profile still uses email prefix as name. |
| **F2** | Document upload + DB persist | ✅ **Built** | `createFromExtraction` writes `documents` + `document_analyses` + `prescriptions` + `timeline_events`. Public + authenticated upload flows both work. |
| **F2-A** | Fix AI model | ✅ **Done** | `google/gemma-4-26b-a4b-it` is Gemma 4 26B — real, multimodal, 256K context, live on OpenRouter. Real uploads work. |
| **F3** | Records & Timeline | ✅ **Built** | `/records/[id]` (DocumentDetail), `/timeline` (TimelineView with profile + type filters), `records.service.ts`. |
| **F4** | Plain-language explanation (authenticated) | ✅ **Done** | `/explanation/[id]` fetches document + analysis via `recordsService.getDocumentWithExplanation`. If no rich explanation in DB, generates on-demand via `lib/explain.ts` and persists back. |
| **F5** | Family Hub (profiles + per-profile data) | ✅ **Built** | Dashboard, ProfileWheel, AddMemberForm, PrescriptionListItem, ActiveMedicationsStrip, LabAlertCard all working. |
| **F6** | Profile editing | ❌ **Missing** | Add member works. No edit form. Profiles created with email prefix as name. |
| **F7** | Share via signed link | ❌ **Missing** | No routes, no `shared_links` writes. DB table exists. |
| **F8** | Medication reminders + push | ❌ **Missing** | DB schema exists (`medications`, `medication_logs`, `push_subscriptions`, `notifications`). No UI, no write path. |

---

## 3. Page-by-Page Status

| Route | Status | Notes |
|---|---|---|
| `/` | ✅ Built | Marketing landing page with hero, features, how-it-works |
| `/upload` | ✅ Built | Full elderly-UX flow: upload → OCR → review → AI explanation → save CTA → auth redirect |
| `/auth` | ✅ Built | Email + Google OAuth, sign-in + sign-up tabs, `returnTo` hidden field |
| `/auth/callback` | ✅ Built | `ensureSelfProfile` + redirect to `next` param (defaults `/dashboard`) |
| `/dashboard` | ✅ Built | Family hub: ProfileWheel, active medications strip, lab alerts, prescription list, PendingUploadBanner |
| `/dashboard/add-member` | ✅ Built | Add family member form with relationship picker (6 types), profile limit enforced (5 max free) |
| `/dashboard/upload/[profileId]` | ✅ Built | Authenticated upload → OCR → review → save to DB → redirect to `/records/[id]` |
| `/records/[id]` | ✅ Built | Document detail: prescription summary, medication list with dosage/duration, lab report with test values + status badges |
| `/timeline` | ✅ Built | All records chronological, filterable by profile + type (prescriptions / lab reports) |
| `/settings` | ⚠ Stub | Shows email + sign-out. Needs F1-A (`users_profile`) before real content. |
| `/explanation/[id]` | ✅ Built | Fetches prescription + explanation from DB. Generates on-demand if not stored, persists result. |
| `/share/[token]` | ❌ Missing | Not started |

---

## 4. Service Status

| Service / File | Status | Notes |
|---|---|---|
| `services/family.service.ts` | ✅ | `getProfiles`, `createProfile` (enforces 5 limit), `ensureSelfProfile`, `getProfilePrescriptions` |
| `services/documents.service.ts` | ✅ | `createFromExtraction` — writes documents + analyses + prescriptions + timeline_events |
| `services/records.service.ts` | ✅ | `getAllDocumentsForUser`, `getRecord` |
| `lib/extract.ts` | ✅ | `google/gemma-4-26b-a4b-it` (Gemma 4 26B, multimodal) — confirmed live on OpenRouter. `extractPrescriptionData`, `extractLabReportData`, `classifyDocument` all working. |
| `app/api/ocr/route.ts` | ✅ (dev) | Calls `lib/extract.ts`. Works in dev mode with mock. |
| `app/api/explain/route.ts` | ✅ | Plain-language explanation generation. Used in public upload flow. Free model pool with 429 fallback. |
| `hooks/` | ❌ Empty | No custom hooks written yet. All state lives in Server Components or services. |

---

## 5. Component Inventory

### UI Primitives (`components/ui/`)
Button, Input, Card, Badge, Heading, Section, Accordion, Spinner — all complete.

### Layout (`components/layout/`)
PageLayout, AppHeader, BottomNav, AppFooter, PageHeader, PageFooter, LogoutButton, PWAInstallBanner, ServiceWorkerRegistration — all complete.

### Upload (`components/features/upload/`)
UploadPicker, ProcessingState, ReviewScreen, LabReportReviewScreen, FieldRow, PendingUploadBanner — all complete.

### Explanation (`components/features/explanation/`)
MedicationCard, DoctorNotes, DisclaimerBanner, ExplanationActions — components built, not wired to authenticated data.

### Family Hub (`components/features/family/`)
ProfileWheel, ProfileChip, AddProfileChip, AddMemberForm, PrescriptionListItem, EmptyPrescriptions — all complete.

### Hub Widgets (`components/features/hub/`)
ActiveMedicationsStrip, LabAlertCard — both complete.

### Records (`components/features/records/`)
TimelineView, RecordCard, DocumentDetail, MedicationList — all complete.

---

## 6. Data Flow (public upload → authenticated view)

```
/upload (public)
  → user uploads image/PDF
  → /api/ocr → lib/extract.ts → PrescriptionData | LabReportData
  → ReviewScreen (user verifies OCR)
  → /api/explain → PrescriptionExplanation
  → AI explanation screen (S05) with "Save to My Account" CTA
  → localStorage.setItem('nuskha_pending_upload', { type, data, explanation })
  → redirect to /auth?mode=signup&return=/dashboard

/auth
  → user signs up or signs in
  → signUp/signIn server action → ensureSelfProfile (creates family_group + family_profile + membership)
  → redirect to /dashboard

/dashboard
  → PendingUploadBanner mounts, reads localStorage, finds pending upload
  → auto-calls savePendingUpload server action
  → createFromExtraction → documents + document_analyses + prescriptions + timeline_events
  → redirect to /records/{documentId}

/records/{id}
  → DocumentDetail renders the saved prescription/lab report
```

---

## 7. Auth Data Flow

| Path | ensureSelfProfile called? |
|---|---|
| Email sign-up, no email confirmation (session immediate) | ✅ in `signUp` action |
| Email sign-up, email confirmation required | ✅ in `/auth/callback` (after user clicks email link) |
| Google OAuth | ✅ in `/auth/callback` |
| Email sign-in | ✅ in `signIn` action |
| Any authenticated page load (safety net) | ✅ in `(app)/layout.tsx` |

---

## 8. What's Deferred (deliberately)

| Issue | Why deferred |
|---|---|
| F1-A: users_profile row | No feature reads it yet. Needed before settings/onboarding. |
| F1-A: users_profile row | No feature reads it yet. Needed before settings/onboarding. |
| F1-B: Onboarding | Needs F1-A. Self-profile currently uses email prefix as name. |
| F6: Profile editing | Post-MVP quality-of-life. |
| F5/F7/F8 | Infrastructure (DB + types) exists. No UI or write path built. |

---

## 9. Database Tables (Supabase)

All tables exist with RLS enabled:

| Table | Used by app? |
|---|---|
| `users_profile` | ❌ Never written to |
| `family_groups` | ✅ |
| `family_profiles` | ✅ |
| `profile_memberships` | ✅ |
| `documents` | ✅ |
| `document_analyses` | ✅ |
| `prescriptions` | ✅ |
| `medications` | ❌ Not written to |
| `lab_values` | ❌ Not written to |
| `timeline_events` | ✅ |
| `notifications` | ❌ Not written to |
| `push_subscriptions` | ❌ Not written to |
| `preventive_reminders` | ❌ Not written to |
| `medication_logs` | ❌ Not written to |
| `shared_links` | ❌ Not written to |

---

## 10. Files to Read First When Picking This Up

1. `docs/MedAssist_AI_FRD.md` — product vision
2. **This file** — current reality
3. `CLAUDE.md` — conventions
4. `docs/architecture.md` — data flow
5. `app/(app)/dashboard/page.tsx` — the working vertical slice
6. `services/family.service.ts` — canonical service shape
7. `lib/supabase/server.ts` — auth + dev-bypass plumbing
8. `app/globals.css` — design tokens
