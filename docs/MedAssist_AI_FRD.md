# MEDASSIST AI — Functional Requirements Document & Engineering Plan

**Your AI-Powered Family Health Assistant**

Version 1.0 | April 2026 | CONFIDENTIAL

---

## 1. Product Overview

### 1.1 Vision

MedAssist AI is an AI-powered personal and family health assistant that helps patients understand their medical documents, track medications, manage health records, and receive proactive health recommendations. It transforms complex medical information into plain, actionable language.

### 1.2 Target User

- **Primary:** Patients managing their own health and their family members' health
- **Secondary:** Caregivers (children managing elderly parents' health)
- **Tertiary:** Health-conscious individuals proactively tracking wellness

### 1.3 Core Value Proposition

Upload any medical document (prescription, lab report, discharge summary, scan report) and instantly get a plain-language explanation, risk flags, actionable next steps, and automatic organization into a persistent health timeline.

### 1.4 Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Next.js / React (or Bolt/Lovable) | PWA-capable, mobile-first |
| Auth | Supabase Auth | Email + Google OAuth |
| Database | Supabase PostgreSQL | Row Level Security (RLS) enabled |
| Storage | Supabase Storage | For uploaded documents and images |
| OCR | Tesseract.js / Google Vision API (free tier) | Extract text from images/scanned PDFs |
| AI/LLM | Google Gemini Flash (free) / OpenRouter | Primary analysis engine |
| Fallback LLM | Groq (Llama 3) / Anthropic Claude | If primary is down or rate-limited |
| Notifications | Supabase Edge Functions + Web Push | Medication reminders, checkup alerts |
| Hosting | Vercel / Netlify | Free tier sufficient for MVP |

---

## 2. Feature Specification

---

### 2.1 [F1] Document Upload & OCR Processing

**Priority:** P0 (Must Have)
**Complexity:** Medium

**Description:** Users can upload medical documents (photos, PDFs, scanned images) and the system extracts text using OCR, then stores both the original file and extracted text.

#### User Flow

1. User taps "Upload Document" or uses camera capture
2. Selects document type: Prescription, Lab Report, Discharge Summary, Scan/Imaging Report, Insurance Document, Other
3. System uploads file to Supabase Storage
4. OCR engine extracts text (Tesseract.js for client-side, Google Vision for server-side fallback)
5. Extracted text is stored in `documents` table
6. AI analysis is triggered automatically (see F2)

#### Acceptance Criteria

- Supports JPEG, PNG, PDF (single and multi-page)
- Max file size: 10MB
- OCR accuracy >85% for printed English text
- Processing completes within 15 seconds
- Original file preserved in storage
- User can manually edit extracted text if OCR is imperfect

#### API Endpoints

```
POST /api/documents/upload    — Upload file, trigger OCR
GET  /api/documents/:id       — Get document with extracted text
PUT  /api/documents/:id/text  — Manual text correction
GET  /api/documents           — List user's documents (paginated)
```

---

### 2.2 [F2] AI-Powered Document Analysis

**Priority:** P0 (Must Have)
**Complexity:** High

**Description:** After OCR extraction, the AI analyzes the medical document and generates a structured, plain-language explanation with risk flags and actionable recommendations.

#### AI Output Structure

| Field | Type | Description |
|-------|------|-------------|
| `summary` | string | 2-3 sentence plain-language summary of the document |
| `document_type_detected` | enum | AI-detected type: prescription, lab_report, discharge, imaging, etc. |
| `key_findings` | array | List of important findings, each with severity (normal/attention/critical) |
| `medications_found` | array | Extracted medications with dosage, frequency, duration |
| `values_out_of_range` | array | Lab values outside normal range with explanation |
| `risk_flags` | array | Anything requiring immediate attention, flagged with severity |
| `recommendations` | array | Suggested next steps (follow-up, lifestyle, questions for doctor) |
| `terms_explained` | array | Medical jargon translated to plain language |
| `follow_up_date` | date / null | Extracted or suggested follow-up date |

#### LLM Integration Strategy

Use a tiered approach for cost and reliability:

- **Tier 1 (Default):** Google Gemini 1.5 Flash via free API — fast, free, good for most documents
- **Tier 2 (Fallback):** Groq (Llama 3.1 70B) — free tier, fast inference, good medical understanding
- **Tier 3 (Complex cases):** Claude Sonnet via Anthropic API — for documents with ambiguous or critical findings

#### Prompt Engineering

System prompt must include:

- **Role:** "You are a medical document analyst. You do NOT provide medical diagnoses. You explain medical documents in plain language."
- **Safety:** "Always include a disclaimer that this is not medical advice. Flag anything critical with URGENT."
- **Output format:** Enforce JSON schema output for consistent parsing
- **Context:** Include patient age/gender if available from profile for better reference range analysis

#### Disclaimer Requirement

> **EVERY AI analysis must include:** "This is an AI-generated explanation for educational purposes only. It is NOT a medical diagnosis or medical advice. Always consult your healthcare provider for medical decisions."

---

### 2.3 [F3] Health Profile & Family Management

**Priority:** P0 (Must Have)
**Complexity:** Medium

**Description:** Users create health profiles for themselves and family members. Each profile stores demographics, conditions, allergies, and active medications. All documents and analyses are linked to a profile.

#### Profile Fields

| Field | Required | Notes |
|-------|----------|-------|
| Full Name | Yes | Display name for the profile |
| Relationship | Yes | Self, Spouse, Child, Parent, Other |
| Date of Birth | Yes | Used for age-appropriate reference ranges |
| Gender | Yes | Male, Female, Other — affects lab reference ranges |
| Blood Group | No | A+, A-, B+, B-, O+, O-, AB+, AB- |
| Height / Weight | No | For BMI calculation and drug dosage context |
| Known Conditions | No | Diabetes, Hypertension, etc. — multi-select + free text |
| Allergies | No | Drug allergies, food allergies — CRITICAL for medication safety |
| Emergency Contact | No | Name + phone number |

#### Family Management Rules

- One user account can manage up to **8 family profiles**
- Each profile has its own document history and timeline
- Profile switcher in the app header for quick navigation
- All data is scoped to the profile — no cross-contamination

---

### 2.4 [F4] Medication Tracker & Reminders

**Priority:** P1 (Should Have)
**Complexity:** Medium

**Description:** Track active medications for each profile. Medications can be auto-extracted from prescriptions (via F2) or manually added. Push notification reminders for medication times.

#### Medication Record Fields

| Field | Type | Source |
|-------|------|--------|
| Medication Name | string | OCR + AI extraction or manual |
| Dosage | string | e.g., "500mg" |
| Frequency | string | e.g., "Twice daily", "Every 8 hours" |
| Timing | array\<string\> | "Morning", "Afternoon", "Night", "Before meals", "After meals" |
| Start Date | date | From prescription date or manual |
| End Date | date / null | Null = ongoing medication |
| Prescribing Doctor | string / null | Extracted from prescription |
| Status | enum | active, completed, discontinued, paused |
| Reminder Enabled | boolean | Opt-in per medication |
| Linked Document ID | uuid / null | References source prescription |

#### Reminder System

- Web Push notifications via Supabase Edge Functions + web-push library
- Reminder times derived from frequency + timing fields
- Snooze (15 min, 30 min, 1 hour) and "Mark as Taken" actions
- Adherence tracking: percentage of taken vs. scheduled doses
- Missed dose alert after 2 hours of no response

---

### 2.5 [F5] Health Timeline & Medical History

**Priority:** P1 (Should Have)
**Complexity:** Low-Medium

**Description:** A chronological view of all health events for a profile. Auto-generated from uploaded documents and manually addable events. This is the "memory" of the health assistant.

#### Timeline Event Types

- **Document Upload** — auto-created when a document is analyzed
- **Lab Report** — with trend visualization for repeated tests (e.g., HbA1c over time)
- **Doctor Visit** — manual entry with notes
- **Medication Started/Stopped** — auto-tracked from F4
- **Vaccination** — manual entry
- **Surgery/Procedure** — manual entry
- **Symptom Log** — manual entry (date + description)

#### Lab Value Trending

When the same lab test appears across multiple reports (e.g., Fasting Blood Sugar), automatically chart the trend over time. Highlight if the trend is improving or worsening. **This is a KEY differentiator.**

---

### 2.6 [F6] Share with Doctor / Export

**Priority:** P1 (Should Have)
**Complexity:** Low

**Description:** Generate a shareable link or PDF summary of a patient profile, selected documents, or the full timeline. Doctors can view without creating an account.

#### Share Options

- Shareable link (read-only, expires in 7 days, password-optional)
- PDF export of profile summary + selected documents
- WhatsApp / Email share of the link
- QR code generation for in-clinic sharing

#### Shared View Contains

- Patient profile basics (name, age, blood group, conditions, allergies)
- Selected document analyses with AI summaries
- Active medications list
- Lab value trends (if applicable)
- **No editing capability — read-only view**

#### Security

- Shared links are UUID-based, not guessable
- Optional PIN protection
- Auto-expire after 7 days (configurable)
- User can revoke any shared link at any time
- View count tracking

---

### 2.7 [F7] Preventive Health & Checkup Reminders

**Priority:** P2 (Nice to Have)
**Complexity:** Medium

**Description:** Based on age, gender, known conditions, and past reports, proactively suggest preventive health screenings and routine checkups.

#### Reminder Rules Engine

- **Age-based:** Annual health checkup after 30, eye exam every 2 years after 40, colonoscopy at 45+
- **Condition-based:** HbA1c every 3 months for diabetics, BP monitoring for hypertension
- **Time-based:** "You haven't uploaded a blood test in 6 months — consider a routine check"
- **Vaccination schedules** for children (if age < 18)

#### Implementation

Store reminder rules as a JSON config (not hardcoded). A Supabase cron job (pg_cron or Edge Function on schedule) checks profiles daily and creates notification records. This is a v2 feature but the DB schema should support it from day 1.

---

### 2.8 [F8] AI Health Chat (Contextual)

**Priority:** P2 (Nice to Have / v2)
**Complexity:** Medium

**Description:** A conversational AI interface where users can ask follow-up questions about their reports or general health queries. The AI has context of the user's profile and uploaded documents.

#### Context Strategy

- When user opens chat from a specific document, that document's analysis is pre-loaded as context
- Profile data (age, conditions, allergies) included in system prompt
- Chat history maintained per session (not persisted long-term to save costs)
- Same LLM tiering as F2 (Gemini Flash → Groq → Claude)
- Same medical disclaimer on every response

---

## 3. Database Schema (Supabase PostgreSQL)

All tables use UUID primary keys, `created_at`/`updated_at` timestamps, and Row Level Security (RLS). The `user_id` column references `auth.users` for RLS policies.

---

### 3.1 `users_profile`

> Extended user profile beyond Supabase Auth

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users, UNIQUE, NOT NULL | Supabase auth user |
| full_name | text | NOT NULL | Display name |
| phone | text | | Optional phone for notifications |
| avatar_url | text | | Profile picture URL |
| timezone | text | DEFAULT 'Asia/Kolkata' | For reminder scheduling |
| notification_preferences | jsonb | DEFAULT '{}' | {email: bool, push: bool, whatsapp: bool} |
| onboarding_completed | boolean | DEFAULT false | Track onboarding flow |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**RLS:** `users_profile.user_id = auth.uid()`

---

### 3.2 `family_profiles`

> Health profiles for user and family members

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL | Owner of this profile |
| full_name | text | NOT NULL | |
| relationship | text | NOT NULL | self, spouse, child, parent, sibling, other |
| date_of_birth | date | | For age-based reference ranges |
| gender | text | | male, female, other |
| blood_group | text | | A+, A-, B+, B-, O+, O-, AB+, AB- |
| height_cm | numeric | | |
| weight_kg | numeric | | |
| known_conditions | text[] | DEFAULT '{}' | Array of conditions |
| allergies | text[] | DEFAULT '{}' | CRITICAL for drug safety checks |
| emergency_contact_name | text | | |
| emergency_contact_phone | text | | |
| is_active | boolean | DEFAULT true | Soft delete |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**RLS:** `family_profiles.user_id = auth.uid()`
**CHECK:** Max 8 active profiles per user_id (enforced via `BEFORE INSERT` trigger)
**INDEX:** `(user_id, is_active)` — covers the common "get active profiles for user" query

---

### 3.3 `documents`

> Uploaded medical documents with OCR text

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| profile_id | uuid | FK → family_profiles, NOT NULL | Which family member |
| document_type | text | NOT NULL | prescription, lab_report, discharge, imaging, insurance, other |
| title | text | | User-editable title, auto-generated from AI |
| file_url | text | NOT NULL | Supabase Storage path |
| file_type | text | NOT NULL | image/jpeg, image/png, application/pdf |
| file_size_bytes | integer | | For storage tracking |
| ocr_text | text | | Raw extracted text from OCR |
| ocr_confidence | numeric | | 0.0 to 1.0 confidence score |
| ocr_engine | text | | tesseract, google_vision |
| processing_status | text | DEFAULT 'pending' | pending, ocr_processing, ocr_complete, analyzing, complete, failed |
| document_date | date | | Date on the document (extracted or manual) |
| doctor_name | text | | Extracted from document |
| hospital_name | text | | Extracted from document |
| tags | text[] | DEFAULT '{}' | User-defined tags |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**RLS:** `documents.user_id = auth.uid()`
**INDEX:** `(user_id, profile_id, created_at DESC)`

---

### 3.4 `document_analyses`

> AI-generated analysis of each document

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| document_id | uuid | FK → documents, UNIQUE, NOT NULL | One analysis per document |
| user_id | uuid | FK → auth.users, NOT NULL | For RLS |
| summary | text | NOT NULL | Plain-language summary |
| document_type_detected | text | | AI-detected type |
| key_findings | jsonb | DEFAULT '[]' | [{finding, severity, explanation}] |
| medications_found | jsonb | DEFAULT '[]' | [{name, dosage, frequency, duration}] |
| values_out_of_range | jsonb | DEFAULT '[]' | [{test, value, normal_range, status, explanation}] |
| risk_flags | jsonb | DEFAULT '[]' | [{flag, severity, recommendation}] |
| recommendations | jsonb | DEFAULT '[]' | [{recommendation, priority, type}] |
| terms_explained | jsonb | DEFAULT '[]' | [{term, explanation}] |
| follow_up_date | date | | Suggested or extracted follow-up |
| raw_llm_response | text | | Full LLM response for debugging |
| llm_model_used | text | | Which model generated this |
| llm_tokens_used | integer | | Token count for cost tracking |
| analysis_version | integer | DEFAULT 1 | For re-analysis tracking |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | Tracks when re-analysis last ran |

**RLS:** `document_analyses.user_id = auth.uid()`

---

### 3.5 `medications`

> Active and historical medications per profile

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL | For RLS |
| profile_id | uuid | FK → family_profiles, NOT NULL | |
| name | text | NOT NULL | Medication name |
| dosage | text | | e.g., "500mg" |
| frequency | text | | e.g., "twice_daily" |
| timing | text[] | DEFAULT '{}' | ['morning','night','before_meals'] |
| start_date | date | | |
| end_date | date | | Null = ongoing |
| prescribing_doctor | text | | |
| status | text | DEFAULT 'active' | active, completed, discontinued, paused |
| reminder_enabled | boolean | DEFAULT false | |
| reminder_times | time[] | DEFAULT '{}' | Specific times for reminders |
| notes | text | | |
| source_document_id | uuid | FK → documents | Which prescription |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

**RLS:** `medications.user_id = auth.uid()`
**INDEX:** `(profile_id, status) WHERE status = 'active'`

---

### 3.6 `medication_logs`

> Track medication adherence (taken/missed/snoozed)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| medication_id | uuid | FK → medications, NOT NULL | |
| user_id | uuid | FK → auth.users, NOT NULL | For RLS |
| scheduled_time | timestamptz | NOT NULL | When it was supposed to be taken |
| action | text | NOT NULL | taken, missed, snoozed, skipped |
| action_time | timestamptz | | When user responded |
| notes | text | | Optional note |
| created_at | timestamptz | DEFAULT now() | |

**RLS:** `medication_logs.user_id = auth.uid()`
**INDEX:** `(medication_id, scheduled_time DESC)`

---

### 3.7 `timeline_events`

> Chronological health events for each profile

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL | For RLS |
| profile_id | uuid | FK → family_profiles, NOT NULL | |
| event_type | text | NOT NULL | document, lab_report, doctor_visit, medication_start, medication_stop, vaccination, surgery, symptom |
| event_date | date | NOT NULL | |
| title | text | NOT NULL | Display title |
| description | text | | Details |
| severity | text | | normal, attention, critical |
| source_document_id | uuid | FK → documents | If auto-generated from doc |
| source_medication_id | uuid | FK → medications | If from medication change |
| metadata | jsonb | DEFAULT '{}' | Flexible extra data |
| created_at | timestamptz | DEFAULT now() | |

**RLS:** `timeline_events.user_id = auth.uid()`
**INDEX:** `(profile_id, event_date DESC)`

---

### 3.8 `lab_values`

> Normalized lab test results for trend tracking

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL | For RLS |
| profile_id | uuid | FK → family_profiles, NOT NULL | |
| document_id | uuid | FK → documents, NOT NULL | Source document |
| test_name | text | NOT NULL | Normalized name (e.g., "HbA1c") |
| test_category | text | | blood, urine, lipid, thyroid, liver, kidney, etc. |
| value | numeric | NOT NULL | Numeric result |
| unit | text | NOT NULL | mg/dL, mmol/L, etc. |
| reference_range_low | numeric | | Normal range lower bound |
| reference_range_high | numeric | | Normal range upper bound |
| status | text | | normal, low, high, critical |
| test_date | date | NOT NULL | When the test was done |
| created_at | timestamptz | DEFAULT now() | |

**RLS:** `lab_values.user_id = auth.uid()`
**INDEX:** `(profile_id, test_name, test_date DESC)` — For trend queries
**UNIQUE:** `(document_id, test_name)` — One value per test per document

---

### 3.9 `shared_links`

> Shareable links for doctors/family to view health data

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL | Creator |
| profile_id | uuid | FK → family_profiles, NOT NULL | Which profile is shared |
| share_token | text | UNIQUE, NOT NULL | 32 random bytes hex-encoded via pgcrypto |
| pin_hash | text | | Optional PIN protection (bcrypt) |
| shared_document_ids | uuid[] | DEFAULT '{}' | Specific docs, empty = all |
| include_medications | boolean | DEFAULT true | |
| include_timeline | boolean | DEFAULT false | |
| include_lab_trends | boolean | DEFAULT false | |
| expires_at | timestamptz | NOT NULL | Auto-expire |
| is_revoked | boolean | DEFAULT false | Manual revoke |
| view_count | integer | DEFAULT 0 | Track views |
| last_viewed_at | timestamptz | | |
| created_at | timestamptz | DEFAULT now() | |

**RLS (Owner):** `shared_links.user_id = auth.uid()` (for management)
**Public Read:** No direct table SELECT for unauthenticated users. Use the `get_shared_link(token text)` SECURITY DEFINER RPC — returns the row only if the token matches a valid, non-revoked, non-expired link. Direct table policies would expose all valid links to any anon query.

---

### 3.10 `notifications`

> All notifications (medication reminders, checkup alerts, system)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| profile_id | uuid | FK → family_profiles | Which family member |
| type | text | NOT NULL | medication_reminder, checkup_due, report_ready, system |
| title | text | NOT NULL | Notification title |
| body | text | NOT NULL | Notification body |
| data | jsonb | DEFAULT '{}' | Deep link info, medication_id, etc. |
| is_read | boolean | DEFAULT false | |
| scheduled_for | timestamptz | | Future notifications |
| sent_at | timestamptz | | When actually sent |
| channel | text | DEFAULT 'push' | push, email, in_app |
| created_at | timestamptz | DEFAULT now() | |

**INDEX:** `(user_id, is_read) WHERE is_read = false`
**INDEX:** `(scheduled_for) WHERE sent_at IS NULL`

---

### 3.11 `push_subscriptions`

> Web Push notification subscriptions per device

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| endpoint | text | NOT NULL | Push subscription endpoint |
| p256dh | text | NOT NULL | Public key |
| auth_key | text | NOT NULL | Auth secret |
| device_info | text | | Browser/device identifier |
| is_active | boolean | DEFAULT true | |
| created_at | timestamptz | DEFAULT now() | |

**RLS:** `push_subscriptions.user_id = auth.uid()`
**UNIQUE:** `(user_id, endpoint)` — prevents duplicate device registrations
**INDEX:** `(user_id) WHERE is_active = true`

---

### 3.12 `preventive_reminders`

> Proactive health screening/checkup reminders

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, DEFAULT gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| profile_id | uuid | FK → family_profiles, NOT NULL | |
| reminder_type | text | NOT NULL | annual_checkup, eye_exam, dental, blood_test, vaccination, custom |
| title | text | NOT NULL | |
| description | text | | |
| due_date | date | NOT NULL | When it's due |
| recurrence_months | integer | | How often (null = one-time) |
| is_completed | boolean | DEFAULT false | |
| completed_at | timestamptz | | |
| linked_document_id | uuid | FK → documents | If completed by uploading a report |
| created_at | timestamptz | DEFAULT now() | |

**INDEX:** `(profile_id, due_date) WHERE is_completed = false`

---

## 3.13 Schema Decisions & Rationale

Decisions made during initial migration (April 2026):

| Decision | Rationale |
|---|---|
| `shared_links` public access via RPC only (`get_shared_link`) | A direct SELECT policy with `NOT is_revoked AND expires_at > now()` exposes **all** valid links to any unauthenticated query — a full data leak. RPC enforces token lookup server-side. |
| `push_subscriptions` UNIQUE(user_id, endpoint) | Without this, re-registering a device (e.g. after browser reset) silently creates duplicates, causing double-delivery of push notifications. |
| `family_profiles` index on `(user_id, is_active)` | The app almost always queries active profiles for a user. A composite index avoids a filter scan over all profiles including soft-deleted ones. |
| `document_analyses` has `updated_at` | Analyses can be re-run (`analysis_version` increments). Without `updated_at` there is no way to know when a re-analysis last occurred. |
| Storage bucket included in migration | The original script had storage bucket creation commented out. Including it in the migration ensures it runs atomically with the schema. |
| `share_token` generated with `gen_random_bytes(32)` (256-bit) | A UUID has 122 bits of randomness. 32 random bytes = 256 bits = significantly harder to brute-force for a health data share link. |

---

## 4. Entity Relationship Overview

```
auth.users (Supabase managed)
  │
  ├── users_profile (1:1)
  │
  ├── family_profiles (1:many, max 8)
  │     │
  │     ├── documents (1:many)
  │     │     ├── document_analyses (1:1)
  │     │     └── lab_values (1:many)
  │     │
  │     ├── medications (1:many)
  │     │     └── medication_logs (1:many)
  │     │
  │     ├── timeline_events (1:many)
  │     ├── preventive_reminders (1:many)
  │     └── shared_links (1:many)
  │
  ├── notifications (1:many)
  └── push_subscriptions (1:many)
```

---

## 5. Implementation Guide for AI Coding Assistants

This section is specifically designed for AI coding tools (Cursor, Claude, Bolt, Lovable, Replit) to understand the project structure and implement features independently.

### 5.1 Project Structure (Recommended)

```
/src
  /app                        — Next.js App Router pages
    /dashboard                — Main dashboard
    /upload                   — Document upload flow
    /documents/[id]           — Document detail + analysis view
    /profile                  — Health profile management
    /medications              — Medication tracker
    /timeline                 — Health timeline view
    /share/[token]            — Public shared view (no auth required)
    /settings                 — User settings, notifications
  /components
    /ui                       — Shared UI components (Button, Card, Modal)
    /documents                — Document-specific components
    /profile                  — Profile components
    /medications              — Medication components
    /timeline                 — Timeline components
    /analysis                 — AI analysis display components
  /lib
    /supabase.ts              — Supabase client init
    /ocr.ts                   — OCR processing logic
    /ai.ts                    — LLM integration (prompt, parse, fallback)
    /ai-prompts.ts            — All system prompts in one file
    /notifications.ts         — Push notification helpers
    /utils.ts                 — Shared utilities
  /types
    /database.ts              — TypeScript types matching DB schema
    /ai-response.ts           — AI response type definitions
  /hooks
    /useProfile.ts            — Profile management hook
    /useDocuments.ts          — Document CRUD hook
    /useMedications.ts        — Medication management hook
```

### 5.2 Implementation Order (Dependency Chain)

Features must be built in this order due to dependencies:

| Phase | Feature | Depends On | Estimated Effort |
|-------|---------|-----------|-----------------|
| 1 | DB Schema + RLS setup | Supabase project | 1 hour |
| 2 | Auth + User Profile (F3 basic) | Phase 1 | 2 hours |
| 3 | Family Profiles (F3 full) | Phase 2 | 2 hours |
| 4 | Document Upload + OCR (F1) | Phase 3 (needs profile_id) | 3 hours |
| 5 | AI Analysis Engine (F2) | Phase 4 (needs OCR text) | 4 hours |
| 6 | Medication Tracker (F4) | Phase 3 | 3 hours (parallel with Phase 4-5) |
| 7 | Health Timeline (F5) | Phase 4, 5, 6 | 2 hours |
| 8 | Share with Doctor (F6) | Phase 7 | 2 hours |
| 9 | Notifications + Reminders | Phase 6 | 3 hours |
| 10 | Preventive Reminders (F7) | Phase 3, 7 | 2 hours |
| 11 | AI Chat (F8) | Phase 5 | 3 hours (v2) |

### 5.3 LLM Integration Blueprint

This is the exact pattern every AI coding tool should follow when implementing the LLM calls:

```typescript
// /src/lib/ai.ts

const LLM_PROVIDERS = {
  primary: {
    name: 'gemini-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    apiKey: process.env.GOOGLE_AI_API_KEY,  // Free tier
  },
  fallback: {
    name: 'groq-llama',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    apiKey: process.env.GROQ_API_KEY,  // Free tier
    model: 'llama-3.1-70b-versatile',
  },
};

async function analyzeDocument(ocrText: string, patientProfile: Profile) {
  const systemPrompt = buildMedicalAnalysisPrompt(patientProfile);
  try {
    return await callPrimaryLLM(systemPrompt, ocrText);
  } catch (e) {
    return await callFallbackLLM(systemPrompt, ocrText);
  }
}
```

### 5.4 OCR Implementation Notes

- Use **Tesseract.js** for client-side OCR (works offline, no API costs)
- For poor quality images, fall back to **Google Cloud Vision API** (300 free units/month)
- Pre-process images: auto-rotate, grayscale conversion, contrast enhancement
- For PDFs: extract text directly with **pdf.js** first; only OCR if text extraction returns empty
- Store both raw OCR text and cleaned/structured text

### 5.5 Security & Compliance Notes

**CRITICAL — This app handles sensitive health data. Follow these rules:**

- Never log or store raw medical data in application logs
- All Supabase tables must have RLS enabled — no exceptions
- LLM API calls should NOT include patient name or identifying info — only age, gender, and medical values
- Shared links must auto-expire and be revocable
- Display medical disclaimer on EVERY AI-generated analysis
- Do not claim to provide medical diagnoses — always frame as "educational explanation"
- Consider adding a Terms of Service acknowledgment on first use
- File uploads must be validated for type and size before storage

### 5.6 Free LLM Options Reference

| Provider | Model | Free Tier | Best For |
|----------|-------|-----------|----------|
| Google AI Studio | Gemini 1.5 Flash | 1500 req/day free | Primary analysis engine |
| Groq | Llama 3.1 70B | 14,400 req/day free | Fallback, fast inference |
| Groq | Llama 3.1 8B | 14,400 req/day free | Simple queries, chat |
| OpenRouter | Various | Some free models | Model routing/fallback |
| Hugging Face | Inference API | Rate-limited free | Specialized medical NER |
| Anthropic | Claude Sonnet | API credits needed | Complex/critical analysis |

---

## 6. Parallel Workstream Allocation

This section defines how multiple developers or AI assistants can work simultaneously without conflicts.

| Workstream | Scope | Can Start After | Independent? |
|-----------|-------|----------------|-------------|
| WS-1: DB & Auth | Schema migration, RLS, auth flow, user profile | Supabase project created | Yes — foundational |
| WS-2: Document Pipeline | Upload UI, OCR processing, document list/detail views | WS-1 complete | Yes after WS-1 |
| WS-3: AI Engine | LLM integration, prompt engineering, analysis parsing, analysis display | WS-1 complete (needs types) | Yes — can mock OCR input |
| WS-4: Profile & Family | Profile CRUD, family management, profile switcher | WS-1 complete | Yes — parallel with WS-2,3 |
| WS-5: Medications | Med tracker, adherence log, reminder setup | WS-1 + WS-4 complete | Yes — parallel with WS-2,3 |
| WS-6: Timeline & Trends | Timeline view, lab value charting, event aggregation | WS-2 + WS-3 + WS-5 | No — needs data from all |
| WS-7: Sharing | Share link generation, public view, QR code, PDF export | WS-4 + WS-6 | Mostly independent |
| WS-8: Notifications | Push subscription, reminder scheduling, notification center | WS-5 | Yes — backend-focused |

---

## 7. MVP vs V2 Feature Map

Use this to decide what to build now vs. later based on current build capacity and timeline.

| Feature | MVP (Week 1) | V2 (Post-Launch) |
|---------|-------------|-----------------|
| Document Upload | Single file upload, basic OCR | Multi-file, batch processing, drag-drop |
| AI Analysis | Single model (Gemini Flash), basic JSON output | Multi-model fallback, confidence scores, re-analysis |
| Health Profile | Self + 2 family members, basic fields | Full 8 profiles, detailed medical history import |
| Medication Tracker | Manual add + basic extraction, list view | Auto-extraction from prescriptions, interaction checker |
| Timeline | Simple chronological list from documents | Interactive timeline, lab trending charts, filtering |
| Share with Doctor | Basic shareable link with expiry | PIN protection, PDF export, QR code, selective sharing |
| Notifications | In-app only | Web Push, email digest, WhatsApp integration |
| Preventive Reminders | Not in MVP | Age/condition-based rules engine |
| AI Chat | Not in MVP | Contextual chat with document/profile awareness |
| Multi-language | English only | Hindi, Telugu, Tamil, regional languages |

---

*MedAssist AI — FRD v1.0 — April 2026*
