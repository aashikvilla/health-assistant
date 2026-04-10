# Nuskha — Stage 5 Development Log

*Last updated: April 10, 2026 · Author: Gaurav (stage-5-family-hub)*

---

## Project Overview

**Repo:** https://github.com/aashikvilla/health-assistant
**Production:** https://health-assistant-snowy.vercel.app
**Buildathon deadline:** April 15, 2026 · 10:00 PM IST
**Stack:** Next.js 16.2.3 · React 19 · TypeScript · Tailwind CSS v4 · Supabase · Vercel

---

## Session Summary (April 10, 2026)

### What was accomplished

1. Created wireframes and screen specifications for all 14 Nuskha screens
2. Set up GitHub branch structure for the full team
3. Built and pushed Stage 5 (Family Hub) — 3 screens, fully functional

---

## Part 1 — Design Artifacts

All files live in `C:\Users\Gaurav Gupta\Documents\Projects\Rethink Buildathon\` (outside the repo).

| File | Purpose |
|------|---------|
| `nuskha-wireframes.html` | Low-fidelity wireframes of all 14 screens — open in browser |
| `nuskha-screens.md` | Full screen spec: purpose, elements, user actions, design notes per screen |
| `nuskha-product-plan.md` | Product decision record — all locked decisions |
| `nuskha-plan.html` | Visual pitch deck |

### The 14 Screens (in flow order)

| Screen | Route | Stage |
|--------|-------|-------|
| S01 Landing | `/` | Stage 1 — Discovery |
| S02 Upload Picker | `/upload` | Stage 2 — Upload |
| S03 OCR Loading | `/upload` (loading state) | Stage 2 — Upload |
| S04 Confirm & Review | `/upload` (confirm state) | Stage 2 — Upload |
| S05 AI Explanation | `/rx/:id/explain` | Stage 3 — Insight |
| S06 Save Prompt (Auth Gate) | Bottom sheet on S05 | Stage 4 — Auth Gate |
| S07 OTP Entry | `/auth` (OTP variant) | Stage 4 — Auth Gate |
| S08 Family Hub — Empty | `/hub` | **Stage 5 — Family Hub** |
| S09 Add Family Profile | `/hub/add-member` | **Stage 5 — Family Hub** |
| S10 Family Hub — Populated | `/hub?profile=<id>` | **Stage 5 — Family Hub** |
| S11 Prescription Detail | `/records/:id` | Stage 6 — Records |
| S12 Medical History Timeline | `/timeline` | Stage 6 — Records |
| S13 Share + Doctor PDF | `/records/:id/share` | Stage 7 — Share |
| S14 Share Link (read-only) | `/rx/:uuid` | Stage 7 — Share |

---

## Part 2 — GitHub Setup

### Repository

**URL:** https://github.com/aashikvilla/health-assistant
**Cloned to:** `C:\Users\Gaurav Gupta\Documents\Projects\Rethink Buildathon\health-assistant\`

### Branch Structure

All branches created from `develop` and pushed to remote:

| Branch | Owner | Status |
|--------|-------|--------|
| `master` | — | Production |
| `develop` | — | Integration base |
| `stage-1-discovery` | Teammate | Not started |
| `stage-2-upload` | Teammate | Not started |
| `stage-3-insight` | Teammate | Not started |
| `stage-4-auth-gate` | Teammate | Not started |
| `stage-5-family-hub` | **Gaurav** | **Done ✓ — pushed** |
| `stage-6-records` | Teammate | Not started |
| `stage-7-share` | Teammate | Not started |

### Git Commands Reference

```bash
# Navigate to project
cd "C:/Users/Gaurav Gupta/Documents/Projects/Rethink Buildathon/health-assistant"

# Switch to your branch
git checkout stage-5-family-hub

# Pull latest from develop (before starting new work)
git fetch origin
git merge origin/develop

# Push your changes
git push
```

---

## Part 3 — Stage 5 Implementation (Done)

### Screens built

- **S08** — Family Hub (Empty state): post-signup landing, profile wheel with dashed "Add" chips, saved prescription card, upload CTA
- **S09** — Add Family Profile: name + relationship + DOB form, 5-profile limit enforcement with Pro teaser
- **S10** — Family Hub (Populated): profile switcher row, active profile's prescription list, context-aware upload button

### Files created/modified

```
app/hub/
  layout.tsx              — Auth guard + BottomNav shell
  page.tsx                — S08/S10 hub page (server component, async searchParams)
  actions.ts              — createProfile server action
  add-member/
    page.tsx              — S09 add family profile page

components/features/family/
  ProfileChip.tsx         — Individual profile avatar chip (client, Link)
  AddProfileChip.tsx      — Dashed "+" add chip (client, Link)
  ProfileWheel.tsx        — Horizontal profile switcher row (server)
  PrescriptionListItem.tsx — Prescription row card (server, Link to /records/:id)
  EmptyPrescriptions.tsx  — Empty state with upload CTA (server)
  AddMemberForm.tsx       — Form with useActionState (client)

components/layout/
  BottomNav.tsx           — Mobile fixed bottom nav: Home / Timeline / Profile

services/
  family.service.ts       — getProfiles, createProfile, ensureSelfProfile, getProfilePrescriptions

types/
  family.ts               — FamilyProfile, HubPrescription, CreateProfileInput

components/ui/
  Button.tsx              — MODIFIED: added href prop (renders as next/link)

lib/supabase/
  middleware.ts           — MODIFIED: extended protection to /hub, /timeline, /settings, /records, /upload

constants/
  index.ts                — MODIFIED: added hub routes + FAMILY_LIMITS
```

### Key architectural decisions

- **Profile switching** via URL search param `?profile=<id>` — keeps it server-side, no client state needed
- **5-profile limit** enforced in service layer (not just UI)
- **`ensureSelfProfile()`** — called by Stage 4 team after OTP signup; idempotent, safe to call multiple times
- **`Button` `href` prop** — renders as `<Link>` without Radix/shadcn dependency
- **Prescriptions table** — lightweight stub with only the fields Stage 5 needs; Stage 2 team owns the full schema

### Build status

```
✓ Compiled successfully
✓ TypeScript — zero errors
✓ /hub — dynamic server route
✓ /hub/add-member — dynamic server route
```

---

## Part 4 — Database Schema (Run in Supabase SQL Editor)

> **Must be run before local testing.** Go to your Supabase project → SQL Editor → paste and run.

```sql
-- ── Family Profiles ────────────────────────────────────────────────────────
create table family_profiles (
  id           uuid default gen_random_uuid() primary key,
  owner_id     uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  relationship text not null,  -- 'self' | 'father' | 'mother' | 'spouse' | 'sibling' | 'other'
  dob          date,
  avatar_url   text,
  is_self      boolean default false,
  created_at   timestamptz default now(),
  unique (owner_id, is_self)   -- prevents duplicate self-profiles
);

alter table family_profiles enable row level security;

create policy "owner_access" on family_profiles
  for all using (auth.uid() = owner_id);

-- ── Prescriptions (stub — full schema owned by Stage 2 team) ───────────────
create table prescriptions (
  id                uuid default gen_random_uuid() primary key,
  profile_id        uuid references family_profiles(id) on delete cascade not null,
  owner_id          uuid references auth.users(id) not null,
  doctor_name       text,
  prescription_date date,
  condition_tags    text[] default '{}',
  medication_count  integer default 0,
  created_at        timestamptz default now()
);

alter table prescriptions enable row level security;

create policy "owner_access" on prescriptions
  for all using (auth.uid() = owner_id);
```

---

## Part 5 — Local Testing Setup

### Step 1 — Create `.env.local`

Create this file at:
`C:\Users\Gaurav Gupta\Documents\Projects\Rethink Buildathon\health-assistant\.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get the values from: **Supabase dashboard → your project → Settings → API**

### Step 2 — Run the SQL migration

Run the SQL in Part 4 above in **Supabase → SQL Editor**.

### Step 3 — Start the dev server

```bash
cd "C:/Users/Gaurav Gupta/Documents/Projects/Rethink Buildathon/health-assistant"
npm run dev
```

### Step 4 — Test the screens

| URL | Screen | What to check |
|-----|--------|---------------|
| `http://localhost:3000/hub` | Redirects to `/auth` | Auth protection working |
| `http://localhost:3000/auth` | Sign up / sign in | Create an account |
| `http://localhost:3000/hub` | S08 — Empty Hub | Profile wheel, "Add family member" CTA |
| `http://localhost:3000/hub/add-member` | S09 — Add Profile | Fill form, save → returns to /hub |
| `http://localhost:3000/hub` | S10 — Populated Hub | Profile chips, prescription list |
| `http://localhost:3000/hub?profile=<id>` | S10 — Profile switch | Different profile's prescriptions |

### Bypassing Stage 4 for testing (Stage 4 not built yet)

Stage 4 (OTP auth) isn't built. The existing `/auth` page uses email + Google OAuth. After signing in, manually seed a self-profile so the hub works:

```sql
-- Replace <your-user-id> with your actual Supabase user ID
-- Find it in: Supabase → Authentication → Users
insert into family_profiles (owner_id, name, relationship, is_self)
values ('<your-user-id>', 'Gaurav', 'self', true);
```

---

## Part 6 — What's Left (Other Stages)

Stage 5 is done. These are the remaining stages for the team:

### Stage 4 — Auth Gate (`stage-4-auth-gate`)
- S06: "Save to Records" bottom sheet (not a full-page auth wall)
- S07: Phone number input + OTP flow (replace existing email/password auth)
- After OTP success: call `familyService.ensureSelfProfile(userId, name)` then redirect to `/hub`

### Stage 1 — Discovery (`stage-1-discovery`)
- S01: Landing page — Nuskha branding, "Upload a Prescription" CTA, feature list
- Update `app/page.tsx` (currently generic Health Assistant landing)

### Stage 2 — Upload (`stage-2-upload`)
- S02: Upload picker (photo / PDF / manual)
- S03: OCR loading screen
- S04: Confirm & Review (extracted data table, low-confidence flagging)
- Google Vision API + Claude Haiku integration
- Creates rows in `prescriptions` table (extends the stub schema)

### Stage 3 — Insight (`stage-3-insight`)
- S05: AI Explanation — medication cards, "Things to tell your doctor"
- Claude Sonnet integration for plain-language summaries

### Stage 6 — Records (`stage-6-records`)
- S11: Prescription Detail (`/records/:id`)
- S12: Medical History Timeline (`/timeline`)

### Stage 7 — Share (`stage-7-share`)
- S13: Share + Doctor PDF generation (`/records/:id/share`)
- S14: Read-only share link view (`/rx/:uuid`) — no login required

---

## Part 7 — Integration Notes for Other Teams

### What Stage 5 exports that other teams need

**`familyService.ensureSelfProfile(userId, name)`**
Call this in Stage 4 after OTP signup. Creates the "You" self-profile. Idempotent.

```ts
import { familyService } from '@/services/family.service'
await familyService.ensureSelfProfile(user.id, user.email?.split('@')[0] ?? 'You')
```

**`/hub` route**
After successful auth, redirect here instead of `/dashboard`.

**`prescriptions` table schema**
Stage 2 team should extend the stub table with full fields (OCR output, AI explanation, image URL, etc.). The Stage 5 service only reads: `id, profile_id, doctor_name, prescription_date, condition_tags, medication_count, created_at`.

**`BottomNav`**
Stage 6 should activate the Timeline tab. Stage 3/7 can add tabs if needed. File: `components/layout/BottomNav.tsx`.

---

*Resume tomorrow: pick up from local testing → verify hub screens → coordinate with team on Stage 4 (auth) to unblock end-to-end flow.*
