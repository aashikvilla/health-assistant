# Nuskha — Feature Plan

> **Last updated:** 2026-04-12
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
- Self-profile auto-creation on every login (`ensureSelfProfile`)
- Family profile claiming by email (account links to existing profile)
- Auto-join all group profiles when claiming
- `DEV_BYPASS_AUTH=true` dev bypass

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

**Status:** ✅ Core done. One blocker.

### What's built
- Public `/upload` (try before signup) → saves to `localStorage` → conversion CTA
- Authenticated `/hub/upload/[profileId]` → writes `documents` + `document_analyses`
- File upload to `medical-documents` Supabase Storage bucket
- `PendingUploadBanner` — recovers a pre-auth upload after login
- OCR state machine: pick → processing → review → saving

### Gap

**F2-A: Fix AI model (BLOCKING)**
`lib/extract.ts` calls `google/gemma-4-26b-a4b-it` which does not exist on OpenRouter.
Real uploads fail silently because `NEXT_PUBLIC_DEV_MODE=true` is on everywhere.

Decision needed — pick one:
- **Option A (recommended):** Switch to `google/gemini-flash-1.5` on OpenRouter (FRD's first choice, cheapest)
- **Option B:** Call Google AI directly via `@google/generative-ai` SDK (no OpenRouter dependency)
- **Option C:** Use `claude-haiku-4-5-20251001` via Anthropic SDK (most reliable, slightly higher cost)

- File to fix: `lib/extract.ts` — change model string and verify response shape
- Also fix: prompt in `app/api/ocr/route.ts` if needed
- Test: turn off `NEXT_PUBLIC_DEV_MODE` and upload a real prescription photo

**F2-B: Write to `prescriptions` table on save**
`documentsService.createFromExtraction` writes `documents` + `document_analyses` but not `prescriptions`.
The hub's prescription list queries `prescriptions` — it always returns empty.

- Fix `services/documents.service.ts`: after writing `document_analyses`, also insert into `prescriptions`
  ```ts
  await supabase.from('prescriptions').insert({
    profile_id,
    user_id: userId,
    doctor_name: buildDoctorName(data, type),
    prescription_date: buildDocDate(data, type),
    condition_tags: type === 'prescription' ? [(data as PrescriptionData).illness].filter(Boolean) : [],
    medication_count: type === 'prescription' ? (data as PrescriptionData).medications.length : 0,
  })
  ```
- No migration needed — table exists with correct columns

---

## F3 — Records & Document Detail

**Status:** ❌ Not started. Tables exist.

**Prerequisite:** F2-B (prescriptions write path)

### What's needed

**F3-A: `/records/[id]` — Document detail page**
Shows one document: summary, doctor, date, tags, medications list (from `document_analyses.medications_found`), raw file preview if file_url is a storage path.

- Route: `app/(app)/records/[id]/page.tsx` (Server Component)
- Service: `services/records.service.ts` → `getDocument(id)` — joins `documents` + `document_analyses`
- Components: `components/features/records/DocumentDetail.tsx`, `MedicationList.tsx`
- `PrescriptionListItem` already links to `/records/${rx.id}` — wire it up

**F3-B: `/timeline` — Chronological records list**
Per-profile list of all documents ordered by date. Filterable by type (prescription/lab).

- Route: `app/(app)/timeline/page.tsx` (Server Component, currently a stub)
- Service: `records.service.ts` → `getDocumentsForProfile(profileId, { type?, limit, offset })`
- Component: `components/features/records/RecordCard.tsx` — compact card with type icon, date, doctor, summary
- Also write to `timeline_events` on document save (so future activity feeds work)

**DB changes:**
- Update `timeline_events` RLS from `user_id = auth.uid()` to family membership (do this when first writing to the table)

---

## F4 — Plain-Language Explanation

**Status:** ❌ Stub only. Data exists in DB, page always redirects.

**Prerequisite:** F3-A (records detail page, to link from)

### What's needed

**F4-A: Wire `fetchPrescription` in explanation page**
`app/(app)/explanation/[id]/page.tsx` calls `fetchPrescription(id)` which always returns `null`.

- Service: `records.service.ts` → `getDocumentWithAnalysis(id)` — returns `documents` JOIN `document_analyses`
- Map `document_analyses.medications_found` → `MedicationExplanation[]` shape (check `types/analysis.ts`)
- Map `document_analyses.terms_explained` → doctor notes / glossary
- Feed into existing `MedicationCard` components (already type-fixed)

**F4-B: AI explanation generation**
Currently there is no prompt to generate plain-language explanations. `document_analyses.terms_explained` and `recommendations` are empty in the DB.

Option A: Generate explanations at upload time (adds to OCR API latency — ~3-5s extra)
Option B: Generate on-demand when user first opens explanation page (lazy, shows loading state)
Option C: Background job after upload (best UX, needs Supabase Edge Function or cron)

Recommended: **Option B** for now. On explanation page load, if `terms_explained` is empty → call `/api/explain/[id]` → stream response → update `document_analyses`.

---

## F5 — Medications & Reminders

**Status:** ❌ Not started. Tables fully built (`medications`, `medication_logs`, `push_subscriptions`, `notifications`).

**Prerequisite:** F2-A (working AI extraction), F3-A (records page to link from)

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

- Route: part of `app/(app)/records/[id]` or separate `/medications` tab
- Component: `components/features/medications/MedicationDetail.tsx`
- Actions: mark as taken, pause, end

**F5-C: Reminder setup**
Toggle `reminder_enabled`, set `reminder_times` on a medication.

- Component: `components/features/medications/ReminderToggle.tsx`
- Server action: `updateMedicationReminder(medicationId, enabled, times[])`

**F5-D: Push notifications**
Most complex part. Skip until F5-A–C are done.

- Register push subscription: `POST /api/push/subscribe` → writes `push_subscriptions`
- Send reminders: Supabase Edge Function on a cron schedule reads due notifications, sends via Web Push API
- Client: service worker in `public/sw.js` handles `push` event, shows notification

---

## F6 — Profile Management

**Status:** ⚠ Partial. Profile creation works; editing and health metrics don't.

**Prerequisite:** F1-A (users_profile exists)

### What's needed

**F6-A: Edit family profile**
Form to update `full_name`, `date_of_birth`, `email` on a `family_profiles` row.

- Route: `app/(app)/hub/profiles/[id]/edit/page.tsx`
- Server action: `hub/profiles/actions.ts` → `updateProfile(id, input)` → `familyService.updateProfile`
- Add `updateProfile` to `services/family.service.ts`
- Guard: verify caller has a membership for this profile

**F6-B: Health metrics**
Edit `blood_group`, `gender`, `height_cm`, `weight_kg`, `known_conditions`, `allergies` on `family_profiles`.

- Extend the edit form above with a collapsible "Health Info" section
- These are optional fields — show a completeness nudge on the hub

**F6-C: Edit relationship label**
After claiming a profile, auto-assigned relationships are `'other'`. Let users fix them.

- In profile edit form: dropdown to change `profile_memberships.relationship`
- Server action: `UPDATE profile_memberships SET relationship = ? WHERE user_id = ? AND profile_id = ?`

**F6-D: Profile photo**
Upload avatar to `medical-documents` bucket (or separate `avatars` bucket), update `family_profiles.avatar_url`.

- Reuse `uploadToStorage` helper from the upload page
- Display in `ProfileWheel` avatar circles

**No DB migrations needed for F6-A/B/C/D.**

---

## F7 — Share via Signed Link

**Status:** ❌ Not started. Table fully built (`shared_links`).

**Prerequisite:** F3-A (document records exist)

### What's needed

**F7-A: Create share link**
Form to select which documents to share, optional PIN, expiry.

- Route: `app/(app)/hub/share/page.tsx` or modal on hub
- Server action: `createShareLink(profileId, { documentIds, includesMeds, expiresInDays, pin? })`
- Writes to `shared_links`, returns the token URL `/share/[token]`

**F7-B: `/share/[token]` public view**
Read-only, no auth required. Shows shared data based on `shared_links` flags.

- Route: `app/(public)/share/[token]/page.tsx` (Server Component, outside `(app)` route group)
- Queries `shared_links` by token, checks `is_revoked` and `expires_at`
- If `pin_hash` set → show PIN entry first
- Increments `view_count`, updates `last_viewed_at`

**DB changes:**
- `shared_links` needs a public anon SELECT policy on `share_token`:
  ```sql
  CREATE POLICY "Public read by token"
    ON shared_links FOR SELECT
    USING (NOT is_revoked AND expires_at > now());
  ```
- `documents` and `document_analyses` need anon read via a DB function or service role for the public view

---

## F8 — Lab Trends

**Status:** ❌ Not started. `lab_values` table exists.

**Prerequisite:** F2-A (working AI extraction), F3-A (records page)

### What's needed

**F8-A: Parse + store lab values from document analyses**
When saving a lab report, parse `document_analyses.values_out_of_range` (and the full test array from `key_findings.tests`) into `lab_values` rows.

- Add to `documents.service.ts`: after analysis write, insert `lab_values` rows
- `lab_values.test_date` = `documents.document_date`
- DB fix: update `lab_values` RLS from `user_id = auth.uid()` to family membership

**F8-B: Trend charts on records page**
For each test name that has multiple `lab_values` rows over time, show a sparkline chart.

- Component: `components/features/labs/LabTrendChart.tsx`
- Query: `SELECT * FROM lab_values WHERE profile_id = ? AND test_name = ? ORDER BY test_date`
- Library: `recharts` (already likely in deps) or plain SVG for minimal bundle

---

## F9 — Settings Page

**Status:** ⚠ Stub only (`/settings` page exists but has minimal content).

**Prerequisite:** F1-A (`users_profile` row exists)

### What's needed

**F9-A: Account settings**
Display + edit `users_profile` fields: full name, phone, timezone.

- Expand `app/(app)/settings/page.tsx`
- Server action: `updateUserProfile(input)` → updates `users_profile`

**F9-B: Notification preferences**
Toggle `notification_preferences.push`, `.email`, `.whatsapp` on `users_profile`.

**F9-C: Manage family group**
List profiles in the family group, show each member's relationship label, let user edit them (links to F6-C).
Show pending profiles (have email but no account claimed yet).

**F9-D: Data export**
Export all documents/prescriptions as a ZIP or PDF. Optional, post-MVP.

---

## F10 — Design Token Cleanup

**Status:** ⚠ Partial. `--nuskha-*` aliases added; many invalid tokens still in code.

**Prerequisite:** None. Can be done at any time, fully independent.

### What's needed

Sweep all files for invalid Tailwind class references and replace with correct semantic tokens.

Known bad tokens (from original audit):
| Bad | Correct |
|---|---|
| `bg-surface-lowest` | `bg-surface-container-lowest` |
| `from-primary-bright` | `from-primary` (or define the token) |
| `to-tertiary` | define `--color-tertiary-bright` in globals.css if needed |
| `bg-secondary`, `bg-secondary-subtle` | no secondary in palette — use `bg-teal` or `bg-surface-subtle` |
| `border-on-surface`, `text-on-surface` | `border-border`, `text-text-primary` |
| `shadow-ambient` | `shadow-md` |
| `glass` | `glass-surface` |
| `safe-bottom` | `pb-safe` |
| `animate-slide-up` | remove or define in globals.css |
| `bg-warning-subtle`, `text-warning` | define if not in @theme inline |

After sweep: add a Tailwind lint rule (`eslint-plugin-tailwindcss`) to catch regressions.

---

## F11 — PWA Offline & Push

**Status:** ⚠ Minimal. Manifest + install banner done. No offline, no push.

**Prerequisite:** F5-D (push notifications)

### What's needed

**F11-A: Service worker offline caching**
Cache shell assets (JS, CSS, fonts) on install. Serve cached hub page when offline.

- Update `public/sw.js`
- Cache strategy: network-first for API calls, cache-first for assets

**F11-B: Push subscription registration**
Register push subscription on hub page load (after user opts in).

- Component: `components/layout/PushPermissionBanner.tsx`
- API route: `POST /api/push/subscribe` → writes to `push_subscriptions`

---

## Priority order for next work sessions

| Priority | Feature | Why |
|---|---|---|
| 🔴 1 | **F2-A** Fix AI model | Everything downstream is broken without real extraction |
| 🔴 2 | **F2-B** Write to prescriptions table | Hub prescription list is always empty |
| 🟡 3 | **F3** Records & Timeline | Natural next vertical slice consuming upload data |
| 🟡 4 | **F1-A** users_profile creation | Settings + onboarding need it |
| 🟡 5 | **F4** Explanation page | Core product value prop |
| 🟢 6 | **F6-A/B/C** Profile editing | Quality of life, family sharing completeness |
| 🟢 7 | **F5-A/B** Medications | Enables reminders |
| ⬜ 8 | **F7** Share | Nice-to-have for MVP |
| ⬜ 9 | **F8** Lab trends | Needs enough lab data to be useful |
| ⬜ 10 | **F10** Token cleanup | Any time, low risk |
