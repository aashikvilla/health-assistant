# Vitae  Stage 5 Development Log

_Last updated: April 11, 2026 · Author: Gaurav (stage-5-family-hub)_

---

## Project Overview

**Repo:** https://github.com/aashikvilla/health-assistant
**Production:** https://health-assistant-snowy.vercel.app
**Buildathon deadline:** April 15, 2026 · 10:00 PM IST
**Stack:** Next.js 16.2.3 · React 19 · TypeScript · Tailwind CSS v4 · Supabase · Vercel

---

## Session Summary (April 11, 2026)

### What was accomplished

1. Pulled `types/database.ts` from `origin/develop`  auto-generated Supabase types for all 12 tables
2. Fixed `.env.local` location  copied to `health-assistant/` (Next.js root) where it's actually read
3. Diagnosed Google OAuth failure: `Database+error+saving+new+user`  missing `handle_new_user` trigger; escalated to aashikvilla
4. Added `DEV_BYPASS_AUTH` flag  allows local UI testing without a live Supabase session
5. Fixed `avatar_url` column error  removed from `family.service.ts` insert (column doesn't exist in DB)
6. Fixed RLS policy error  dev bypass in `actions.ts` skips the blocked INSERT
7. Fixed redirect loop  hub page no longer bounces to `/hub/add-member` in bypass mode
8. Auth trigger fixed by aashikvilla  live sign-in now works
9. Aligned `types/family.ts` with actual DB schema (`owner_id` → `user_id`, `name` → `full_name`, `dob` → `date_of_birth`)
10. Updated `types/database.ts` with Stage 5 DB additions (`is_self` on `family_profiles`, new `prescriptions` table)
11. Applied `design.md` Clinical Curator design system across all Stage 5 screens
12. Pushed 2 commits to `stage-5-family-hub`

---

## Session Summary (April 10, 2026)

### What was accomplished

1. Created wireframes and screen specifications for all 14 Vitae screens
2. Set up GitHub branch structure for the full team
3. Built and pushed Stage 5 (Family Hub)  3 screens, fully functional

---

## Part 1  Design Artifacts

All files live in `C:\Users\Gaurav Gupta\Documents\Projects\Rethink Buildathon\` (outside the repo).

| File                     | Purpose                                                                    |
| ------------------------ | -------------------------------------------------------------------------- |
| `nuskha-wireframes.html` | Low-fidelity wireframes of all 14 screens  open in browser                |
| `nuskha-screens.md`      | Full screen spec: purpose, elements, user actions, design notes per screen |
| `nuskha-product-plan.md` | Product decision record  all locked decisions                             |
| `nuskha-plan.html`       | Visual pitch deck                                                          |

### The 14 Screens (in flow order)

| Screen                       | Route                     | Stage                    |
| ---------------------------- | ------------------------- | ------------------------ |
| S01 Landing                  | `/`                       | Stage 1  Discovery      |
| S02 Upload Picker            | `/upload`                 | Stage 2  Upload         |
| S03 OCR Loading              | `/upload` (loading state) | Stage 2  Upload         |
| S04 Confirm & Review         | `/upload` (confirm state) | Stage 2  Upload         |
| S05 AI Explanation           | `/rx/:id/explain`         | Stage 3  Insight        |
| S06 Save Prompt (Auth Gate)  | Bottom sheet on S05       | Stage 4  Auth Gate      |
| S07 OTP Entry                | `/auth` (OTP variant)     | Stage 4  Auth Gate      |
| S08 Family Hub  Empty       | `/hub`                    | **Stage 5  Family Hub** |
| S09 Add Family Profile       | `/hub/add-member`         | **Stage 5  Family Hub** |
| S10 Family Hub  Populated   | `/hub?profile=<id>`       | **Stage 5  Family Hub** |
| S11 Prescription Detail      | `/records/:id`            | Stage 6  Records        |
| S12 Medical History Timeline | `/timeline`               | Stage 6  Records        |
| S13 Share + Doctor PDF       | `/records/:id/share`      | Stage 7  Share          |
| S14 Share Link (read-only)   | `/rx/:uuid`               | Stage 7  Share          |

---

## Part 2  GitHub Setup

### Repository

**URL:** https://github.com/aashikvilla/health-assistant
**Cloned to:** `C:\Users\Gaurav Gupta\Documents\Projects\Rethink Buildathon\health-assistant\`

### Branch Structure

All branches created from `develop` and pushed to remote:

| Branch               | Owner      | Status                                        |
| -------------------- | ---------- | --------------------------------------------- |
| `master`             |           | Production                                    |
| `develop`            |           | Integration base                              |
| `stage-1-discovery`  | Teammate   | Not started                                   |
| `stage-2-upload`     | Teammate   | Not started                                   |
| `stage-3-insight`    | Teammate   | Not started                                   |
| `stage-4-auth-gate`  | Teammate   | Not started                                   |
| `stage-5-family-hub` | **Gaurav** | **Done ✓  design updated + pushed (Apr 11)** |
| `stage-6-records`    | Teammate   | Not started                                   |
| `stage-7-share`      | Teammate   | Not started                                   |

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

## Part 3  Stage 5 Implementation (Done)

### Screens built

- **S08**  Family Hub (Empty state): post-signup landing, profile wheel with dashed "Add" chips, saved prescription card, upload CTA
- **S09**  Add Family Profile: name + relationship + DOB form, 5-profile limit enforcement with Pro teaser
- **S10**  Family Hub (Populated): profile switcher row, active profile's prescription list, context-aware upload button

### Files created/modified

```
app/hub/
  layout.tsx               Auth guard + BottomNav shell
  page.tsx                 S08/S10 hub page (server component, async searchParams)
  actions.ts               createProfile server action
  add-member/
    page.tsx               S09 add family profile page

components/features/family/
  ProfileChip.tsx          Individual profile avatar chip (client, Link)
  AddProfileChip.tsx       Dashed "+" add chip (client, Link)
  ProfileWheel.tsx         Horizontal profile switcher row (server)
  PrescriptionListItem.tsx  Prescription row card (server, Link to /records/:id)
  EmptyPrescriptions.tsx   Empty state with upload CTA (server)
  AddMemberForm.tsx        Form with useActionState (client)

components/layout/
  BottomNav.tsx            Mobile fixed bottom nav: Home / Timeline / Profile

services/
  family.service.ts        getProfiles, createProfile, ensureSelfProfile, getProfilePrescriptions

types/
  family.ts                FamilyProfile, HubPrescription, CreateProfileInput

components/ui/
  Button.tsx               MODIFIED: added href prop (renders as next/link)

lib/supabase/
  middleware.ts            MODIFIED: extended protection to /hub, /timeline, /settings, /records, /upload

constants/
  index.ts                 MODIFIED: added hub routes + FAMILY_LIMITS
```

### Key architectural decisions

- **Profile switching** via URL search param `?profile=<id>`  keeps it server-side, no client state needed
- **5-profile limit** enforced in service layer (not just UI)
- **`ensureSelfProfile()`**  called by Stage 4 team after OTP signup; idempotent, safe to call multiple times
- **`Button` `href` prop**  renders as `<Link>` without Radix/shadcn dependency
- **Prescriptions table**  lightweight stub with only the fields Stage 5 needs; Stage 2 team owns the full schema

### Build status

```
✓ Compiled successfully
✓ TypeScript  zero errors
✓ /hub  dynamic server route
✓ /hub/add-member  dynamic server route
```

---

## Part 4  Database Schema

> **Status (April 11):** All migrations have been run on the live Supabase project by aashikvilla. The full 12-table schema is in `docs/supabase_migration.sql` on `origin/develop`. TypeScript types are in `types/database.ts`.

### Stage 5 additions (run on top of the base migration)

```sql
-- Script 1  Add is_self column to existing family_profiles
alter table family_profiles
  add column if not exists is_self boolean default false;

create unique index if not exists family_profiles_one_self_per_owner
  on family_profiles (user_id)
  where is_self = true;

-- Script 2  Create prescriptions table
-- (documents table is missing medication_count so Stage 5 owns this)
create table prescriptions (
  id                uuid default gen_random_uuid() primary key,
  profile_id        uuid references family_profiles(id) on delete cascade not null,
  user_id           uuid references auth.users(id) not null,
  doctor_name       text,
  prescription_date date,
  condition_tags    text[] default '{}',
  medication_count  integer default 0,
  created_at        timestamptz default now()
);

alter table prescriptions enable row level security;

create policy "owner_access" on prescriptions
  for all using (auth.uid() = user_id);
```

> **Note:** `user_id` is used throughout (not `owner_id`) to be consistent with the rest of the schema.

---

## Part 5  Local Testing Setup

### Step 1  Create `.env.local`

Create at **`health-assistant/.env.local`** (must be inside the Next.js project root, not the parent folder):

```
NEXT_PUBLIC_SUPABASE_URL=https://lvtfgpujbyionrinapmr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<get from aashikvilla or Supabase dashboard>

# DEV ONLY  bypass auth for UI testing without a real session. Never set to true in production.
DEV_BYPASS_AUTH=false
```

### Step 2  Start the dev server

```bash
cd "C:/Users/Gaurav Gupta/Documents/Projects/Rethink Buildathon/health-assistant"
npm run dev
```

### Step 3  Test with a real account (recommended)

Sign in at `http://localhost:3000/auth` with Google. The Supabase auth trigger creates your `users_profile` and self `family_profile` automatically on first sign-in.

| URL                                      | Screen               | What to check                     |
| ---------------------------------------- | -------------------- | --------------------------------- |
| `http://localhost:3000/hub`              | Redirects to `/auth` | Auth protection working           |
| `http://localhost:3000/auth`             | Sign in with Google  | Auth trigger creates profiles     |
| `http://localhost:3000/hub`              | S08/S10  Hub        | Profile wheel, prescriptions list |
| `http://localhost:3000/hub/add-member`   | S09  Add Profile    | Fill form, save → returns to /hub |
| `http://localhost:3000/hub?profile=<id>` | S10  Profile switch | Different profile's prescriptions |

> **Note:** For `localhost` OAuth to work, `http://localhost:3000` must be in Supabase → Authentication → URL Configuration → Redirect URLs. Ask aashikvilla if it isn't.

### Dev bypass mode (UI-only testing, no real auth)

Set `DEV_BYPASS_AUTH=true` in `.env.local` and restart the server. This injects a mock user so all three screens are accessible without signing in. DB reads return empty (RLS blocks unauthenticated queries), so you'll see empty states  useful for layout/design checks only.

Screens accessible in bypass mode:

- `http://localhost:3000/hub`  shows empty hub (no profiles)
- `http://localhost:3000/hub/add-member`  shows form (submit skips DB, redirects to /hub)

---

## Part 6  Design System (Clinical Curator)

> Applied April 11, 2026. Reference doc: `C:\Users\Gaurav Gupta\Documents\Projects\Rethink Buildathon\design.md`

### Core principles

- **No-Line Rule**  no 1px borders for sectioning. Use background color shifts (tonal layering) instead.
- **Tonal Layering**  depth through stacked surface tiers, not shadows.
- **Glassmorphism**  sticky headers and bottom nav use `backdrop-blur` + semi-transparent surface.
- **Ambient Shadows**  diffused, tinted with `on-surface` (never standard drop shadows).

### Color tokens (updated in `app/globals.css`)

| Token                      | Value     | Usage                                        |
| -------------------------- | --------- | -------------------------------------------- |
| `primary`                  | `#0058bd` | CTAs, active states, links                   |
| `teal`                     | `#006a66` | Human health tracks, condition tags, success |
| `error`                    | `#ab2653` | Alerts, urgent health markers                |
| `surface`                  | `#f7f9ff` | Base background                              |
| `surface-subtle`           | `#f1f4fa` | Section grouping (surface-container-low)     |
| `surface-muted`            | `#e8edf5` | Chips, inactive elements                     |
| `surface-container-lowest` | `#ffffff` | Interactive cards  top visual layer         |
| `text-primary`             | `#181c21` | Body text (never pure black)                 |

### Typography

| Font              | Variable              | Usage                               |
| ----------------- | --------------------- | ----------------------------------- |
| Plus Jakarta Sans | `font-display`        | Headlines, app name, section titles |
| Manrope           | `font-sans` (default) | Body, labels, metadata              |

### Component changes (Stage 5)

| Component                    | Change                                                                  |
| ---------------------------- | ----------------------------------------------------------------------- |
| `BottomNav`                  | Glassmorphism  removed `border-t`                                      |
| `hub/page.tsx` header        | Glassmorphism  removed `border-b`                                      |
| `add-member/page.tsx` header | Glassmorphism                                                           |
| `ProfileChip`                | Blue gradient on active, tonal bg inactive  no borders                 |
| `AddProfileChip`             | Tonal bg  no dashed border                                             |
| `PrescriptionListItem`       | `surface-container-lowest` card + ambient shadow, teal tags  no border |
| `EmptyPrescriptions`         | Tonal bg  no dashed border                                             |
| `Input` (ui)                 | `surface-subtle` bg + ghost `ring-1` on focus  no border               |

---

## Part 7  What's Left (Other Stages)

Stage 5 is done. These are the remaining stages for the team:

### Stage 4  Auth Gate (`stage-4-auth-gate`)

- S06: "Save to Records" bottom sheet (not a full-page auth wall)
- S07: Phone number input + OTP flow (replace existing email/password auth)
- After OTP success: call `familyService.ensureSelfProfile(userId, name)` then redirect to `/hub`

### Stage 1  Discovery (`stage-1-discovery`)

- S01: Landing page  Vitae branding, "Upload a Prescription" CTA, feature list
- Update `app/page.tsx` (currently generic Health Assistant landing)

### Stage 2  Upload (`stage-2-upload`)

- S02: Upload picker (photo / PDF / manual)
- S03: OCR loading screen
- S04: Confirm & Review (extracted data table, low-confidence flagging)
- Google Vision API + Claude Haiku integration
- Creates rows in `prescriptions` table (extends the stub schema)

### Stage 3  Insight (`stage-3-insight`)

- S05: AI Explanation  medication cards, "Things to tell your doctor"
- Claude Sonnet integration for plain-language summaries

### Stage 6  Records (`stage-6-records`)

- S11: Prescription Detail (`/records/:id`)
- S12: Medical History Timeline (`/timeline`)

### Stage 7  Share (`stage-7-share`)

- S13: Share + Doctor PDF generation (`/records/:id/share`)
- S14: Read-only share link view (`/rx/:uuid`)  no login required

---

## Part 8  Integration Notes for Other Teams

### What Stage 5 exports that other teams need

**`familyService.ensureSelfProfile(userId, name)`**
Call this in Stage 4 after OTP signup. Creates the "You" self-profile. Idempotent.

```ts
import { familyService } from "@/services/family.service";
await familyService.ensureSelfProfile(
  user.id,
  user.email?.split("@")[0] ?? "You",
);
```

**`/hub` route**
After successful auth, redirect here instead of `/dashboard`.

**`prescriptions` table schema**
Stage 2 team should extend the stub table with full fields (OCR output, AI explanation, image URL, etc.). The Stage 5 service only reads: `id, profile_id, doctor_name, prescription_date, condition_tags, medication_count, created_at`.

**`BottomNav`**
Stage 6 should activate the Timeline tab. Stage 3/7 can add tabs if needed. File: `components/layout/BottomNav.tsx`.

---

_Stage 5 complete. Auth is live. Design system applied. Next: coordinate with team on remaining stages (1–4, 6–7) and test end-to-end on the deployed URL once Stage 4 OTP auth is built._
