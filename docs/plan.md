# Nuskha — Feature Plan

> **Last updated:** 2026-04-13
> Each feature below is independently workable. They have explicit dependencies, a DB
> checklist, and a code checklist. Assign one feature to one person/session at a time.
> Read `docs/schema.md` before touching any table. Read `docs/current-state.md` for
> honest status of what's already built.

---

## Dependency map

```
F1 Auth ──────────────────────────────────────────────────────┐
F2 Upload ──► F3 AI Model fix ──► F4 Records ──► F5 Timeline  │
                                  F4 Records ──► F6 Explain   │
F1 Auth ──────────────────────────────────────────────────────┤
                                  F7 Medications ──► F8 Push  │
F1 Auth ──► F9 Profile Edit                                   │
F4 Records ──► F10 Share                                       │
F4 Records ──► F11 Lab Trends                                  │
(any) ──────► F12 Design Tokens (cross-cutting)               │
```

---

## F1 — Auth & Account Setup

**Status:** ✅ Core done. Two gaps remain.

### What's built
- Email + Google OAuth sign-in/sign-up
- `ensureSelfProfile` called in **`(app)/layout.tsx`** on every authenticated render (idempotent safety net — prevents "No family group found" for all sign-in paths)
- `emailRedirectTo` set in `signUp` so email confirmation links hit `/auth/callback` (which calls `ensureSelfProfile`)
- `returnTo` param threaded through auth forms → sign-in/sign-up redirect to the correct page after auth
- Family profile claiming by email (account links to existing profile)
- Auto-join all group profiles when claiming

### Gaps

**F1-A: `users_profile` row on signup**
The `users_profile` table (account-level: full name, phone, timezone, notification prefs) is never written to. Create it in `ensureSelfProfile` or via a Supabase Auth trigger.

- DB: `INSERT INTO users_profile (user_id, full_name) VALUES (...)` — use email prefix as default name
- Code: `services/auth.service.ts` → `ensureUserProfile(userId, email)`
- Call from: `app/actions.ts` signIn/signUp, `auth/callback/route.ts`
- RLS: already `user_id = auth.uid()` — correct, no change needed

**F1-B: Onboarding flow**
After first signup, collect: full name, phone number (optional). Sets `onboarding_completed = true` on `users_profile`.

- Route: `app/(app)/onboarding/page.tsx`
- Redirect: after `ensureSelfProfile` → if `!onboarding_completed` → `/onboarding`
- Server action: updates `users_profile` + `family_profiles.full_name`
- Gate: check `onboarding_completed` in `(app)/layout.tsx`

**No DB migrations needed.**

---

## F2 — Document Upload

**Status:** ✅ Done.

### What's built
- Public `/upload` (try before signup) — full elderly-UX redesign with step indicators, semantic tokens, 60px touch targets
- After uploading: OCR → review screen → AI explanation → "Save to My Account" CTA
- Save redirects to `/auth?mode=signup&return=/dashboard`; `returnTo` is passed through auth forms
- After login, `PendingUploadBanner` **auto-saves** to DB immediately on mount and **redirects to `/records/{id}`** (no manual click needed)
- Authenticated `/dashboard/upload/[profileId]` → writes `documents` + `document_analyses` + `prescriptions` + `timeline_events`
- File upload to `medical-documents` Supabase Storage bucket
- **AI model:** `google/gemma-4-26b-a4b-it` (Gemma 4 26B — MoE, multimodal, 256K context, live on OpenRouter). All 3 functions in `lib/extract.ts` working with real uploads.

---

## F3 — Records & Document Detail

**Status:** ✅ Done.

### What's built
- `app/(app)/records/[id]/page.tsx` — document detail page (Server Component)
- `services/records.service.ts` — `getRecord(id, userId)` joins documents + document_analyses
- `components/features/records/DocumentDetail.tsx` — full prescription/lab report view
- `components/features/records/MedicationList.tsx` — medication cards from analysis
- `components/features/records/RecordCard.tsx` — compact card for timeline/list views
- `app/(app)/timeline/page.tsx` — chronological records with profile + type filters
- `components/features/records/TimelineView.tsx` — client component with filter state
- `documentsService.createFromExtraction` also writes `timeline_events` rows

---

## F4 — Plain-Language Explanation (Authenticated)

**Status:** ✅ Done.

### What's built
- `records.service.ts` → `getDocumentWithExplanation(id, userId)` — fetches `documents` + `document_analyses`, detects rich vs raw medication data
- `lib/explain.ts` — shared explanation generation logic (extracted free-model pool, used by both API route and page)
- `documents.service.ts` → `saveExplanationToAnalysis` — persists generated explanation back to DB
- Page detects missing explanation, generates on-demand via `lib/explain.ts`, persists result so next view is instant
- Handles empty medications gracefully (shows "No medication details available")

---

## F5 — Medications & Reminders

**Status:** ❌ Not started. Tables fully built (`medications`, `medication_logs`, `push_subscriptions`, `notifications`).

**Prerequisite:** F2-A (working AI extraction), F3 (records page to link from)

### What's needed

**F5-A: Auto-create medication records from document analyses**
When `createFromExtraction` saves a prescription, also parse `medications_found` and upsert into `medications` table.

- `medications.source_document_id` links back to the document
- `medications.start_date` = document date, `end_date` = start + parsed duration
- `medications.status` = 'active' if end_date > today
- Service: extend `documents.service.ts` or new `services/medications.service.ts`

**DB fix needed:** Update `medications` RLS from `user_id = auth.uid()` to family membership.

**F5-B: Medications list UI**
Per-profile list of active/past medications. Hub already shows active meds from analyses — this is the full CRUD view.

**F5-C: Reminder setup**
Toggle `reminder_enabled`, set `reminder_times` on a medication.

**F5-D: Push notifications**
Most complex part. Skip until F5-A–C are done.

---

## F6 — Profile Management

**Status:** ⚠ Partial. Profile creation works; editing and health metrics don't.

**Prerequisite:** F1-A (users_profile exists)

### What's needed

**F6-A: Edit family profile**
Form to update `full_name`, `date_of_birth`, `email` on a `family_profiles` row.

- Route: `app/(app)/dashboard/profiles/[id]/edit/page.tsx`
- Server action: update `full_name`, `dob`, `email` — verify caller has membership

**F6-B: Health metrics**
Edit `blood_group`, `gender`, `height_cm`, `weight_kg`, `known_conditions`, `allergies` on `family_profiles`.

**F6-C: Edit relationship label**
After claiming a profile, auto-assigned relationships are `'other'`. Let users fix them.

**F6-D: Profile photo**
Upload avatar, update `family_profiles.avatar_url`.

---

## F7 — Share via Signed Link

**Status:** ❌ Not started. Table fully built (`shared_links`).

**Prerequisite:** F3 (document records exist)

---

## F8 — Lab Trends

**Status:** ❌ Not started. `lab_values` table exists.

**Prerequisite:** F2-A (working AI extraction), F3

---

## F9 — Settings Page

**Status:** ⚠ Stub only. Page exists but has minimal content (email + sign-out).

**Prerequisite:** F1-A (`users_profile` row exists)

---

## F10 — Design Token Cleanup

**Status:** ⚠ Partial.
- Upload screens + dashboard upload flow: fully migrated to semantic tokens
- Other pages: may still have `bg-surface-lowest` (→ `bg-surface-container-lowest`), `from-primary-bright`, `to-tertiary`, `shadow-ambient`

Can be done at any time — fully independent.

---

## F11 — PWA Offline & Push

**Status:** ⚠ Minimal. Manifest + install banner done. No offline, no push.

**Prerequisite:** F5-D (push notifications)

---

## Priority order for next work sessions

> Last updated: 2026-04-13 — most core screens are complete. Focus is now on fixing the AI pipeline and wiring authenticated explanation.

| Priority | Feature | Why |
|---|---|---|
| ✅ ~~1~~ | ~~**F2-A** Fix AI model~~ | Done — `google/gemma-4-26b-a4b-it` (Gemma 4 26B) confirmed live on OpenRouter. |
| ✅ ~~2~~ | ~~**F4-A/B** Wire explanation page~~ | Done — `getDocumentWithExplanation`, on-demand generate, persist back to DB. |
| 🔴 1 | **F1-A** users_profile creation | Settings + onboarding need it. Add to `ensureSelfProfile`. |
| 🟡 3 | **F1-A** users_profile creation | Settings + onboarding need it. Add to `ensureSelfProfile`. |
| 🟡 4 | **F1-B** Onboarding flow | Collect real name — self-profile currently uses email prefix |
| 🟢 5 | **F6-A/B/C** Profile editing | Family sharing completeness — edit name, DOB, health metrics, relationship label |
| 🟢 6 | **F5-A/B** Medications table write + list UI | Enables reminders. Auto-create from `document_analyses.medications_found` on save. |
| ⬜ 7 | **F7** Share via signed link | Nice-to-have for MVP |
| ⬜ 8 | **F8** Lab trends | Needs real lab data from working AI first |
| ⬜ 9 | **F5-C/D** Reminders + push | Highest complexity — do after F5-A/B |
| ⬜ 10 | **F10** Token cleanup | Any time, low risk |
