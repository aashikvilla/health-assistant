# Vitae — User Flows

Complete end-to-end flows with all paths, states, and screenshot references.
Screenshots live in `/screenshots/`.

---

## Screenshot Index

| File | Screen | Route | Notes |
|---|---|---|---|
| `01-landing-home.png` | Marketing homepage | `/` | Public |
| `02-pub-upload-s1-file-picker.png` | Upload — file picker | `/upload` | Public, Step 1/3 |
| `03-pub-upload-s2a-ocr-processing.png` | Upload — OCR in-flight | `/upload` | Public, Step 2a |
| `04-pub-upload-s2b-prescription-review.png` | Upload — prescription review | `/upload` | Public, Step 2b |
| `05-pub-upload-s3a-ai-explanation-loading.png` | Upload — AI generating | `/upload` | Public, Step 3a |
| `06-pub-upload-s3b-prescription-explanation.png` | Upload — explanation result | `/upload` | Public, Step 3b |
| `07-auth-upload-s2-lab-report-review.png` | Upload — lab report review | `/dashboard/upload/[profileId]` | Auth, Step 2/3 |
| `07b-auth-upload-s2-lab-report-review-alt.png` | Upload — lab report review (alt) | `/dashboard/upload/[profileId]` | Duplicate of 07 |
| `08-auth-upload-s3-lab-report-analysis.png` | Upload — lab analysis result | `/dashboard/upload/[profileId]` | Auth, Step 3/3 |
| `09-dashboard-hub-empty-state.png` | Dashboard — no records yet | `/dashboard` | Auth |
| `10-auth-signin-signup.png` | Sign in / Sign up | `/auth` | Public |
| `11-dashboard-add-family-member.png` | Add family member | `/dashboard/add-member` | Auth |
| `12-dashboard-hub-with-records.png` | Dashboard — with records | `/dashboard` | Auth |
| `13-timeline-all-records.png` | Timeline — all family records | `/timeline` | Auth |
| `14-record-detail-rx-meta-and-meds.png` | Record detail — header + med list | `/records/[id]` | Auth, top section |
| `15-record-detail-rx-ai-cards-and-share.png` | Record detail — AI cards + share | `/records/[id]` | Auth, bottom section |
| `source-doc-prescription-sample.avif` | Sample prescription image | — | Input document, not UI |
| `source-doc-lab-report-sample.pdf` | Sample lab report PDF | — | Input document, not UI |
| `source-doc-lab-report-sample2.pdf` | Sample lab report PDF (alt) | — | Input document, not UI |

---

## Flow 1 — Public "Try Before Sign Up" (Prescription)

No account required. User gets full AI explanation, then is prompted to save.

```
[01] Landing homepage  /
  ↓  "Try Free Upload" CTA
[02] File picker  /upload  (Step 1/3)
  ↓  Upload photo / PDF / enter manually
[03] OCR processing  (Step 2a — spinner, "Reading your prescription…")
  ↓  OCR resolves → document_type = prescription
[04] Prescription review  (Step 2b — "Check the Details")
     User can edit any field before confirming
  ↓  "Yes, This Looks Right →"
[05] AI explanation loading  (Step 3a — "Preparing your explanation…")
  ↓  /api/explain returns PrescriptionExplanation
[06] Prescription explanation  (Step 3b — MedicationCards + DoctorNotes)
  ↓  "Save to My Account — Free"  →  saves to localStorage as nuskha_pending_upload
  ↓  redirect → /auth?mode=signup&return=/dashboard

[10] Auth — sign up  /auth
  ↓  email+password or Google OAuth
[Onboarding] Enter full name  /onboarding
  ↓  submit
[12] Dashboard  /dashboard
     PendingUploadBanner fires automatically:
       reads localStorage → calls savePendingUpload() → saves to DB with explanation
       shows success toast → localStorage cleared
```

**Error paths:**
- OCR returns "not a medical document" → modal overlay → user tries again (stays on Step 1)
- AI explanation API fails → error screen with "Try Again" + "Go back to check details"
- User closes browser before saving → localStorage persists, banner fires on next login

---

## Flow 2 — Public "Try Before Sign Up" (Lab Report)

Same entry as Flow 1, but lab report takes a different path — skips review screen.

```
[02] File picker  /upload  (Step 1/3)
  ↓  Upload lab report PDF
[03] OCR processing  (Step 2a)
     document_type = lab_report
     → skips review, jumps straight to AI analysis in-flight
[05] AI analysis loading  ("Analysing your report…")
  ↓  /api/analyse returns LabReportExplanation
     AbnormalMarkerCard(s) or "All Clear" card + DoctorNotes
  ↓  "Save to My Account — Free" → localStorage → /auth?mode=signup
```

> Lab reports skip the review step because the test values need no human correction — they're numeric and the user can't meaningfully edit them.

---

## Flow 3 — Authenticated Upload (Prescription)

User is signed in. Document saved with full AI explanation in one flow.

```
[12] Dashboard  /dashboard
  ↓  "+ Upload for yourself" or "Upload a Prescription" (empty state)
  ↓  → /dashboard/upload/[profileId]

[02] File picker  (same component as public)
  ↓  Upload photo / PDF / enter manually
[03] OCR processing
  ↓  document_type = prescription
[04] Prescription review  (editable fields)
  ↓  confirm
[05] AI explanation loading  (/api/explain)
  ↓  explanation ready
     MedicationCards + DoctorNotes + "Save Prescription" button
  ↓  save:
       1. Upload file → Supabase Storage  medical-documents/{userId}/{ts}.ext
       2. savePrescription() → documents row + document_analyses row (with rich explanation)
          + prescriptions row + medications rows
  ↓  redirect → /dashboard?profile=[profileId]
```

**Error paths:**
- File storage upload fails gracefully → file_url = 'ocr-extracted', save still proceeds
- savePrescription() fails → saveError shown inline, stays on explanation screen
- Explanation API fails → error screen with retry + go-back

---

## Flow 4 — Authenticated Upload (Lab Report)

```
[12] Dashboard  /dashboard
  ↓  → /dashboard/upload/[profileId]

[02] File picker
  ↓  Upload lab report
[03] OCR processing
  ↓  document_type = lab_report
[07] Lab report review  (all test values with reference ranges, editable)
  ↓  confirm
[05] AI analysis loading  (/api/analyse)
  ↓  analysis ready
[08] Lab analysis result  (AbnormalMarkerCards + full test table + DoctorNotes)
     "Save Lab Report" button
  ↓  saveLabReport() → documents + document_analyses (abnormalMarkers stored in key_findings)
  ↓  redirect → /records/[documentId]
```

> Lab report AI explanations (per-marker plain-language text) are stored in
> `document_analyses.key_findings.abnormalMarkers`. The `values_out_of_range`
> column only holds `{name, result, status}` for the dashboard Lab Alert card.

---

## Flow 5 — Sign Up (Direct, No Upload)

```
[01] Landing homepage
  ↓  "Create Account"
[10] Auth page  /auth?mode=signup
  ↓  email + password  or  Google OAuth
[Onboarding] Enter full name  /onboarding
  ↓  submit → onboarding_completed = true
[09] Dashboard — empty state  /dashboard
  ↓  "Add a Profile" or "Upload a Prescription"
```

---

## Flow 6 — Sign In (Returning User)

```
[10] Auth page  /auth  (default: sign-in tab)
  ↓  email + password  or  Google OAuth
     returnTo param respected (e.g. came from /upload → goes back to /dashboard)
[12] Dashboard  /dashboard
```

---

## Flow 7 — View a Saved Record

Single unified page. Explanation and share are inline — no secondary navigation.

```
[12] Dashboard  (or [13] Timeline)
  ↓  tap a document row

[14+15] Record detail  /records/[id]
  ┌─ PRESCRIPTION ─────────────────────────────────────────────────────┐
  │  Nav bar: ← back | "Prescription" | WhatsApp icon (top-right)      │
  │  Meta: date · doctor name · "For [patient]" · diagnosis tags       │
  │  Disclaimer banner (AI-generated, consult doctor)                  │
  │  Medications section:                                               │
  │    → Rich: MedicationCard × n  (colored box, expandable details)   │
  │      Each card: name, dosage, frequency pill, "View details" →     │
  │        Treats / How to take / Side effects / Avoid                  │
  │    → Fallback: plain name+dosage list  (legacy records)            │
  │  "Things to tell your doctor"  (DoctorNotes)                       │
  │  "View original document" link  (if file stored, not OCR-only)     │
  │  "Share via WhatsApp" full-width green button                      │
  └────────────────────────────────────────────────────────────────────┘
  ┌─ LAB REPORT ───────────────────────────────────────────────────────┐
  │  Nav bar: ← back | "Lab Report" | (no share)                      │
  │  Meta: date · lab name / doctor · "For [patient]"                  │
  │  Disclaimer banner                                                  │
  │  Parameters Outside Normal Range:                                  │
  │    → AbnormalMarkerCard × n  (colored, with AI explanation)        │
  │    → "All Clear" card  (if all normal)                             │
  │  All Results table  (every test with value, unit, ref range)       │
  │  "Things to follow"  (DoctorNotes)                                 │
  │  "View original document" link  (if file stored)                   │
  └────────────────────────────────────────────────────────────────────┘
```

**On-demand explanation fallback:**
If a prescription record was saved without rich AI data (legacy records or edge cases),
the page calls `generateExplanation()` on first view, shows the rich cards, and saves
the result back to DB so subsequent views are instant. No LLM call after that.

> `/explanation/[id]` redirects to `/records/[id]` — both URLs reach the same page.

---

## Flow 8 — Family Hub

```
[12] Dashboard  /dashboard?profile=[profileId]

Profile wheel (top):
  [You]  [Member 1]  [Member 2]  [+ Add]
  Tap any chip → URL updates → page reloads with that profile's data

Active Medications strip:
  Shows all active medications for selected profile
  sourced from medications table (status = 'active')

Lab Alert card:
  Most recent lab report for selected profile
  Shows out-of-range values (values_out_of_range from document_analyses)
  Tap → /records/[documentId]

Documents section:
  Lists prescriptions for selected profile
  Each row → /records/[documentId]
  "View all" → /timeline

"+ Upload" button → /dashboard/upload/[profileId]
```

---

## Flow 9 — Add Family Member

```
[12] Dashboard  → tap "+" chip in profile wheel  →  /dashboard/add-member
[11] Add Family Member form
     Full name (required)
     Relationship (select)
     Date of birth (optional)
     Their email (optional — if they sign up with same email they get access)
  ↓  "Save Profile"
     createProfile() → family_profiles row  +  profile_memberships row
  ↓  redirect → /dashboard
     Profile wheel now includes new member
     Upload for them → /dashboard/upload/[newProfileId]
```

**Limit:** 5 profiles per account (free plan). At limit → shows upgrade prompt.

---

## Flow 10 — Timeline

```
[12] Dashboard  → "View all" link  →  /timeline
[13] Timeline page
     Filter chips: All / Prescriptions / Lab Reports
     Profile filter: All / [individual names]
     Records sorted newest-first, grouped by month
     Each row → /records/[id]
     Empty state → "Go to Dashboard" CTA
```

---

## Flow 11 — Settings

```
Bottom nav → Profile tab  →  /settings
     Account card: email address + user ID
     "Sign out" → clears session → redirects to /auth
     "More settings coming soon" placeholder
       (planned: notifications, reminders, data export, account deletion)
```

---

## State Machine — Upload Flow (both public and authenticated)

```
pick
 ├─ file selected ──────────────────────────→ processing
 │    └─ OCR error ─────────────────────────→ pick  (error banner)
 │    └─ "not a medical doc" ───────────────→ pick  (modal overlay)
 │    └─ prescription ──────────────────────→ review
 │    └─ lab_report (public) ──────────────→ processing (AI analysis)
 │    └─ lab_report (auth) ────────────────→ review
 └─ manual entry ───────────────────────────→ review (prescription only)

review
 ├─ confirm ────────────────────────────────→ explaining  (AI fetch)
 └─ "upload different" ─────────────────────→ pick

explaining
 ├─ loading ────────────────────────────────→ (wait)
 ├─ AI ready ───────────────────────────────→ explaining  (shows result)
 ├─ AI error ───────────────────────────────→ explaining  (error + retry)
 ├─ retry ──────────────────────────────────→ explaining  (re-fetches)
 └─ "go back" ──────────────────────────────→ review

explaining (result shown)
 ├─ public: "Save to My Account" ──────────→ localStorage → /auth?mode=signup
 └─ auth: "Save Prescription / Lab Report" → saving → /records/[id] or /dashboard
```

---

## Data Written Per Upload

| Table | Prescription | Lab Report |
|---|---|---|
| `documents` | ✓ (file_url, doctor_name, date, tags) | ✓ (file_url, doctor_name, date) |
| `document_analyses` | ✓ medications_found (rich MedicationExplanation[]), recommendations | ✓ key_findings.tests + key_findings.abnormalMarkers, recommendations, values_out_of_range |
| `prescriptions` | ✓ (best-effort, legacy support) | — |
| `medications` | ✓ one row per medication (status=active) | — |

---

## Route Map

```
/                           → Landing (public)
/upload                     → Public upload flow (public)
/auth                       → Sign in / sign up (public)
/onboarding                 → Name setup, first login only (semi-public)
/dashboard                  → Family hub (auth)
/dashboard/upload/[profileId] → Authenticated upload flow (auth)
/dashboard/add-member       → Add family profile (auth)
/records/[id]               → Unified record detail (auth)
/explanation/[id]           → Redirects → /records/[id]
/timeline                   → All records list (auth)
/settings                   → Account settings (auth)
```
