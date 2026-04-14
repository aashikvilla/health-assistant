# Vitae — Database Schema Reference

> **Last updated:** 2026-04-12
> Source of truth for all Supabase tables, column shapes, and RLS policies.
> Update this file whenever a migration runs.

---

## Tables at a glance

| Table                  | Purpose                                         | RLS                              |
| ---------------------- | ----------------------------------------------- | -------------------------------- |
| `users_profile`        | Account-level settings (1 row per auth user)    | `user_id = auth.uid()`           |
| `family_groups`        | Scopes who can see whose profiles               | membership                       |
| `family_profiles`      | Family member health profiles                   | membership                       |
| `profile_memberships`  | User ↔ Profile join table (relationship labels) | `user_id = auth.uid()`           |
| `documents`            | Uploaded files + metadata                       | membership                       |
| `document_analyses`    | AI-extracted structured data                    | membership (via document)        |
| `prescriptions`        | Denormalized prescription index                 | membership                       |
| `medications`          | Active medication records + reminders           | membership                       |
| `medication_logs`      | Taken / skipped / snoozed events                | `user_id = auth.uid()`           |
| `lab_values`           | Normalised numeric lab results                  | membership                       |
| `timeline_events`      | Ordered health event stream                     | membership                       |
| `notifications`        | In-app + push notification queue                | `user_id = auth.uid()`           |
| `push_subscriptions`   | Web Push endpoint registrations                 | `user_id = auth.uid()`           |
| `preventive_reminders` | Scheduled checkup / vaccination reminders       | membership                       |
| `shared_links`         | Signed share tokens for external access         | `user_id = auth.uid()` (creator) |

> **"membership"** = accessible when the caller has a `profile_memberships` row
> for a profile whose `family_group_id` matches.

---

## Detailed Schemas

### `users_profile`

Account-level settings. One row per `auth.users` row. Created on first login.

| Column                      | Type          | Notes                                      |
| --------------------------- | ------------- | ------------------------------------------ |
| `id`                        | uuid PK       |                                            |
| `user_id`                   | uuid NOT NULL | FK → auth.users                            |
| `full_name`                 | text NOT NULL | Display name (not the family profile name) |
| `phone`                     | text          |                                            |
| `avatar_url`                | text          |                                            |
| `timezone`                  | text          | Default: `'Asia/Kolkata'`                  |
| `notification_preferences`  | jsonb         | `{push, email, whatsapp}` booleans         |
| `onboarding_completed`      | boolean       | Default: false                             |
| `created_at` / `updated_at` | timestamptz   |                                            |

---

### `family_groups`

Boundary of "who sees what". All profiles in a group are visible to all accounts linked to any profile in the group.

| Column       | Type                 | Notes |
| ------------ | -------------------- | ----- |
| `id`         | uuid PK              |       |
| `created_at` | timestamptz NOT NULL |       |

---

### `family_profiles`

One row per family member. Health-focused — not an auth user.

| Column                      | Type          | Notes                                |
| --------------------------- | ------------- | ------------------------------------ |
| `id`                        | uuid PK       |                                      |
| `family_group_id`           | uuid NOT NULL | FK → family_groups                   |
| `full_name`                 | text NOT NULL |                                      |
| `email`                     | text          | Optional — used for account claiming |
| `date_of_birth`             | date          |                                      |
| `gender`                    | text          |                                      |
| `blood_group`               | text          |                                      |
| `height_cm`                 | numeric       |                                      |
| `weight_kg`                 | numeric       |                                      |
| `known_conditions`          | text[]        | Default: `{}`                        |
| `allergies`                 | text[]        | Default: `{}`                        |
| `emergency_contact_name`    | text          |                                      |
| `emergency_contact_phone`   | text          |                                      |
| `is_active`                 | boolean       | Default: true                        |
| `created_at` / `updated_at` | timestamptz   |                                      |

**RLS** (SELECT / UPDATE): `family_group_id IN (SELECT family_group_id FROM profile_memberships WHERE user_id = auth.uid())`
**RLS** (SELECT extra): also visible if `email = auth.jwt()->>'email'` (for claiming before membership exists)
**RLS** (INSERT): any authenticated user

**Trigger**: `trg_auto_add_family_memberships` — after INSERT, creates `'other'` memberships for all existing group members.

---

### `profile_memberships`

Join table between `auth.users` and `family_profiles`. Per-user relationship label.

| Column            | Type                 | Notes                                                |
| ----------------- | -------------------- | ---------------------------------------------------- |
| `user_id`         | uuid NOT NULL        | FK → auth.users, PK part                             |
| `profile_id`      | uuid NOT NULL        | FK → family_profiles, PK part                        |
| `family_group_id` | uuid NOT NULL        | FK → family_groups (denormalised for fast RLS)       |
| `relationship`    | text NOT NULL        | `'self'│'parent'│'spouse'│'child'│'sibling'│'other'` |
| `is_self`         | boolean NOT NULL     | True for the profile that represents this account    |
| `created_at`      | timestamptz NOT NULL |                                                      |

**RLS**: `user_id = auth.uid()` (users manage only their own rows)

---

### `documents`

Every uploaded file (prescription image, PDF, lab report).

| Column                      | Type          | Notes                                                            |
| --------------------------- | ------------- | ---------------------------------------------------------------- |
| `id`                        | uuid PK       |                                                                  |
| `user_id`                   | uuid NOT NULL | Uploader (kept for audit trail)                                  |
| `profile_id`                | uuid NOT NULL | FK → family_profiles                                             |
| `document_type`             | text NOT NULL | `'prescription'│'lab_report'`                                    |
| `title`                     | text          | Optional display title                                           |
| `file_url`                  | text NOT NULL | Storage path in `medical-documents` bucket, or `'ocr-extracted'` |
| `file_type`                 | text NOT NULL | MIME type                                                        |
| `file_size_bytes`           | int           |                                                                  |
| `ocr_text`                  | text          | Raw OCR output                                                   |
| `ocr_confidence`            | numeric       |                                                                  |
| `ocr_engine`                | text          |                                                                  |
| `processing_status`         | text          | `'pending'│'done'│'failed'`                                      |
| `document_date`             | date          | Date on the document (not upload date)                           |
| `doctor_name`               | text          |                                                                  |
| `hospital_name`             | text          |                                                                  |
| `tags`                      | text[]        | Condition / illness tags                                         |
| `created_at` / `updated_at` | timestamptz   |                                                                  |

**RLS**: EXISTS check via `family_profiles` → `profile_memberships`

---

### `document_analyses`

AI-extracted structured data. One row per document.

| Column                      | Type          | Notes                                           |
| --------------------------- | ------------- | ----------------------------------------------- |
| `id`                        | uuid PK       |                                                 |
| `document_id`               | uuid NOT NULL | FK → documents                                  |
| `user_id`                   | uuid NOT NULL | Audit trail                                     |
| `summary`                   | text NOT NULL | Human-readable one-line summary                 |
| `document_type_detected`    | text          |                                                 |
| `key_findings`              | jsonb         | Lab report: `{tests:[…]}`                       |
| `medications_found`         | jsonb         | Array of `{name, dosage, duration, confidence}` |
| `values_out_of_range`       | jsonb         | Array of `{name, result, status}`               |
| `risk_flags`                | jsonb         | Array of strings                                |
| `recommendations`           | jsonb         | Array of strings                                |
| `terms_explained`           | jsonb         | Dict of `{term: plain_language_explanation}`    |
| `follow_up_date`            | date          |                                                 |
| `raw_llm_response`          | text          |                                                 |
| `llm_model_used`            | text          |                                                 |
| `llm_tokens_used`           | int           |                                                 |
| `analysis_version`          | int           | Default: 1                                      |
| `created_at` / `updated_at` | timestamptz   |                                                 |

**RLS**: EXISTS check via `documents` → `family_profiles` → `profile_memberships`

---

### `prescriptions`

Denormalized summary index used by hub list views. Created alongside a `document` row.

| Column              | Type          | Notes                |
| ------------------- | ------------- | -------------------- |
| `id`                | uuid PK       |                      |
| `profile_id`        | uuid NOT NULL | FK → family_profiles |
| `user_id`           | uuid NOT NULL | Uploader             |
| `doctor_name`       | text          |                      |
| `prescription_date` | date          |                      |
| `condition_tags`    | text[]        |                      |
| `medication_count`  | int           | Default: 0           |
| `created_at`        | timestamptz   |                      |

> ⚠ **Gap**: `documentsService.createFromExtraction` does NOT write to this table.
> The hub's `getProfilePrescriptions()` queries this table — it will always return empty
> until the write path is fixed. See Feature 4 (Records) in `docs/plan.md`.

**RLS**: EXISTS check via `family_profiles` → `profile_memberships`

---

### `medications`

Active medication records, enriched from prescription analyses. Enables reminders.

| Column                      | Type          | Notes                                               |
| --------------------------- | ------------- | --------------------------------------------------- |
| `id`                        | uuid PK       |                                                     |
| `user_id`                   | uuid NOT NULL |                                                     |
| `profile_id`                | uuid NOT NULL |                                                     |
| `name`                      | text NOT NULL |                                                     |
| `dosage`                    | text          |                                                     |
| `frequency`                 | text          | e.g. `'twice daily'`                                |
| `timing`                    | text[]        | e.g. `['08:00','20:00']`                            |
| `start_date`                | date          |                                                     |
| `end_date`                  | date          |                                                     |
| `prescribing_doctor`        | text          |                                                     |
| `status`                    | text          | `'active'│'completed'│'paused'` Default: `'active'` |
| `reminder_enabled`          | boolean       | Default: false                                      |
| `reminder_times`            | time[]        |                                                     |
| `notes`                     | text          |                                                     |
| `source_document_id`        | uuid          | FK → documents                                      |
| `created_at` / `updated_at` | timestamptz   |                                                     |

**RLS**: ⚠ Currently `user_id = auth.uid()` — needs updating to family membership. See plan.

---

### `medication_logs`

Taken / skipped / snoozed events per medication dose.

| Column           | Type                 | Notes                             |
| ---------------- | -------------------- | --------------------------------- |
| `id`             | uuid PK              |                                   |
| `medication_id`  | uuid NOT NULL        | FK → medications                  |
| `user_id`        | uuid NOT NULL        | Who logged the action             |
| `scheduled_time` | timestamptz NOT NULL |                                   |
| `action`         | text NOT NULL        | `'taken'│'skipped'│'snoozed'`     |
| `action_time`    | timestamptz          | When user actually took / skipped |
| `notes`          | text                 |                                   |
| `created_at`     | timestamptz          |                                   |

**RLS**: `user_id = auth.uid()` (personal action log — correct, not family-scoped)

---

### `lab_values`

Normalised numeric lab results. One row per test per report.

| Column                 | Type             | Notes                              |
| ---------------------- | ---------------- | ---------------------------------- |
| `id`                   | uuid PK          |                                    |
| `user_id`              | uuid NOT NULL    |                                    |
| `profile_id`           | uuid NOT NULL    |                                    |
| `document_id`          | uuid NOT NULL    | FK → documents                     |
| `test_name`            | text NOT NULL    |                                    |
| `test_category`        | text             | e.g. `'haematology'`               |
| `value`                | numeric NOT NULL |                                    |
| `unit`                 | text NOT NULL    |                                    |
| `reference_range_low`  | numeric          |                                    |
| `reference_range_high` | numeric          |                                    |
| `status`               | text             | `'normal'│'low'│'high'│'critical'` |
| `test_date`            | date NOT NULL    |                                    |
| `created_at`           | timestamptz      |                                    |

**RLS**: ⚠ `user_id = auth.uid()` — needs updating to family membership. See plan.

---

### `timeline_events`

Ordered stream of health events (document uploads, medications, reminders).

| Column                 | Type          | Notes                                                        |
| ---------------------- | ------------- | ------------------------------------------------------------ |
| `id`                   | uuid PK       |                                                              |
| `user_id`              | uuid NOT NULL |                                                              |
| `profile_id`           | uuid NOT NULL |                                                              |
| `event_type`           | text NOT NULL | `'prescription'│'lab_report'│'medication_start'│'reminder'`… |
| `event_date`           | date NOT NULL |                                                              |
| `title`                | text NOT NULL |                                                              |
| `description`          | text          |                                                              |
| `severity`             | text          | `'info'│'warning'│'critical'`                                |
| `source_document_id`   | uuid          | FK → documents                                               |
| `source_medication_id` | uuid          | FK → medications                                             |
| `metadata`             | jsonb         | Arbitrary event payload                                      |
| `created_at`           | timestamptz   |                                                              |

**RLS**: ⚠ `user_id = auth.uid()` — needs updating to family membership. See plan.

---

### `notifications`

In-app and push notification queue.

| Column          | Type          | Notes                                             |
| --------------- | ------------- | ------------------------------------------------- |
| `id`            | uuid PK       |                                                   |
| `user_id`       | uuid NOT NULL | Recipient account                                 |
| `profile_id`    | uuid          | Optional — which profile this is about            |
| `type`          | text NOT NULL | `'medication_reminder'│'lab_alert'│'refill_due'`… |
| `title`         | text NOT NULL |                                                   |
| `body`          | text NOT NULL |                                                   |
| `data`          | jsonb         | Tap-action payload (deep link, etc.)              |
| `is_read`       | boolean       | Default: false                                    |
| `scheduled_for` | timestamptz   | For scheduled sends                               |
| `sent_at`       | timestamptz   |                                                   |
| `channel`       | text          | `'push'│'in_app'` Default: `'push'`               |
| `created_at`    | timestamptz   |                                                   |

**RLS**: `user_id = auth.uid()` (correct — per-account)

---

### `push_subscriptions`

Web Push API endpoint registrations.

| Column        | Type          | Notes             |
| ------------- | ------------- | ----------------- |
| `id`          | uuid PK       |                   |
| `user_id`     | uuid NOT NULL |                   |
| `endpoint`    | text NOT NULL |                   |
| `p256dh`      | text NOT NULL | Encryption key    |
| `auth_key`    | text NOT NULL |                   |
| `device_info` | text          | User agent string |
| `is_active`   | boolean       | Default: true     |
| `created_at`  | timestamptz   |                   |

**RLS**: `user_id = auth.uid()`

---

### `preventive_reminders`

Scheduled checkup / vaccination / screening reminders.

| Column               | Type          | Notes                                  |
| -------------------- | ------------- | -------------------------------------- |
| `id`                 | uuid PK       |                                        |
| `user_id`            | uuid NOT NULL |                                        |
| `profile_id`         | uuid NOT NULL |                                        |
| `reminder_type`      | text NOT NULL | `'checkup'│'vaccination'│'screening'`… |
| `title`              | text NOT NULL |                                        |
| `description`        | text          |                                        |
| `due_date`           | date NOT NULL |                                        |
| `recurrence_months`  | int           | e.g. 12 for annual                     |
| `is_completed`       | boolean       | Default: false                         |
| `completed_at`       | timestamptz   |                                        |
| `linked_document_id` | uuid          | FK → documents                         |
| `created_at`         | timestamptz   |                                        |

**RLS**: ⚠ `user_id = auth.uid()` — needs updating to family membership. See plan.

---

### `shared_links`

Signed tokens for sharing health summaries externally (no login required).

| Column                | Type                 | Notes                                    |
| --------------------- | -------------------- | ---------------------------------------- |
| `id`                  | uuid PK              |                                          |
| `user_id`             | uuid NOT NULL        | Creator                                  |
| `profile_id`          | uuid NOT NULL        | Whose data is shared                     |
| `share_token`         | text NOT NULL        | Random hex, used in URL `/share/[token]` |
| `pin_hash`            | text                 | Optional PIN protection                  |
| `shared_document_ids` | uuid[]               | Which documents to include               |
| `include_medications` | boolean              | Default: true                            |
| `include_timeline`    | boolean              | Default: false                           |
| `include_lab_trends`  | boolean              | Default: false                           |
| `expires_at`          | timestamptz NOT NULL | Default: 7 days                          |
| `is_revoked`          | boolean              | Default: false                           |
| `view_count`          | int                  | Default: 0                               |
| `last_viewed_at`      | timestamptz          |                                          |
| `created_at`          | timestamptz          |                                          |

**RLS**: Creator access via `user_id = auth.uid()`. Public read (no auth) needs a separate anon policy on `share_token` for the `/share/[token]` route.

---

## Storage

**Bucket**: `medical-documents` (private, 50 MB limit)
**MIME types**: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`, `image/heic`, `image/heif`
**Path format**: `{userId}/{timestamp}.{ext}`
**RLS**: Users can read/write/delete under their own `{userId}/` prefix

---

## Known RLS Gaps (to fix per-feature)

| Table                  | Current RLS            | Should be             |
| ---------------------- | ---------------------- | --------------------- |
| `medications`          | `user_id = auth.uid()` | family membership     |
| `lab_values`           | `user_id = auth.uid()` | family membership     |
| `timeline_events`      | `user_id = auth.uid()` | family membership     |
| `preventive_reminders` | `user_id = auth.uid()` | family membership     |
| `shared_links`         | creator only           | + anon read via token |

Fix these as part of the feature that first writes to each table (see `docs/plan.md`).
