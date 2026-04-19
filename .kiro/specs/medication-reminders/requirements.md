# Requirements Document

## Introduction

This feature adds in-app medication reminders derived automatically from uploaded prescriptions. When a prescription is saved to the database, the system creates `medications` rows for each medicine extracted from the prescription, converts the M/A/N (Morning/Afternoon/Night) frequency format into concrete reminder times, schedules `notifications` rows for each upcoming dose, and surfaces those notifications to the user via an in-app notification panel. Users can mark notifications as read and toggle reminders on or off per medication. No push/web-push delivery is in scope — this spec covers the `in_app` channel only.

---

## Glossary

- **Frequency_Parser**: The module responsible for converting M/A/N frequency strings (e.g. `"1-0-1"`) into a list of reminder time slots.
- **Medication_Writer**: The part of `documentsService.createFromExtraction` responsible for inserting rows into the `medications` table.
- **Notification_Scheduler**: The module responsible for creating `notifications` rows with `scheduled_for` set to the next occurrence of each reminder time.
- **Notification_Poller**: The client-side mechanism that periodically checks for due notifications and surfaces them to the user.
- **Notification_Panel**: The UI drawer/sheet that displays the list of recent in-app notifications.
- **Notification_Bell**: The header/nav icon that shows the unread notification count badge.
- **Reminder_Toggle**: The per-medication UI control that sets `reminder_enabled` on a `medications` row.
- **M/A/N format**: A hyphen-separated string of three integers representing tablet counts for Morning, Afternoon, and Night slots respectively (e.g. `"1-0-1"` = 1 tablet morning, 0 afternoon, 1 night).
- **Default_Reminder_Times**: The fixed clock times used for each slot — Morning = `08:00`, Afternoon = `13:00`, Night = `21:00`.
- **Due notification**: A `notifications` row where `scheduled_for <= now()`, `sent_at IS NULL`, and `channel = 'in_app'`.
- **System**: The Vitae Next.js/Supabase application.

---

## Requirements

### Requirement 1: Medication Row Creation on Prescription Save

**User Story:** As a user, I want medication records to be created automatically when I save a prescription, so that I don't have to enter my medicines manually.

#### Acceptance Criteria

1. WHEN `createFromExtraction` is called with `type = 'prescription'`, THE Medication_Writer SHALL insert one row into the `medications` table for each medicine in the extracted prescription data.
2. THE Medication_Writer SHALL populate `user_id`, `profile_id`, `name`, `dosage`, `frequency`, `source_document_id`, and `status = 'active'` on each inserted `medications` row.
3. WHEN a medicine has a parseable `duration` field and the prescription has a `document_date`, THE Medication_Writer SHALL calculate and set `end_date` as `document_date + duration_days`.
4. WHEN a medicine does not have a parseable `duration` field or the prescription has no `document_date`, THE Medication_Writer SHALL leave `end_date` as `NULL`.
5. IF the `medications` insert fails, THEN THE Medication_Writer SHALL log the error and continue without rolling back the parent document or analysis rows (best-effort, non-fatal).
6. THE Medication_Writer SHALL set `reminder_enabled = true` on each inserted `medications` row when the medicine's frequency field contains a parseable M/A/N string.
7. THE Medication_Writer SHALL set `reminder_enabled = false` on each inserted `medications` row when the medicine's frequency field does not contain a parseable M/A/N string.

---

### Requirement 2: M/A/N Frequency Parsing

**User Story:** As a user, I want the app to understand my prescription's dosage schedule, so that reminders fire at the right times of day.

#### Acceptance Criteria

1. WHEN the Frequency_Parser receives a string matching the pattern `"<int>-<int>-<int>"`, THE Frequency_Parser SHALL return the subset of `['08:00', '13:00', '21:00']` corresponding to the non-zero positions (position 0 = Morning, position 1 = Afternoon, position 2 = Night).
2. WHEN the Frequency_Parser receives `"1-0-1"`, THE Frequency_Parser SHALL return `['08:00', '21:00']`.
3. WHEN the Frequency_Parser receives `"1-1-1"`, THE Frequency_Parser SHALL return `['08:00', '13:00', '21:00']`.
4. WHEN the Frequency_Parser receives `"0-1-0"`, THE Frequency_Parser SHALL return `['13:00']`.
5. WHEN the Frequency_Parser receives a string that does not match the `"<int>-<int>-<int>"` pattern, THE Frequency_Parser SHALL return an empty array.
6. WHEN the Frequency_Parser receives a string where all three integers are zero (e.g. `"0-0-0"`), THE Frequency_Parser SHALL return an empty array.
7. THE Medication_Writer SHALL store the result of the Frequency_Parser in both the `timing` column and the `reminder_times` column of the `medications` row.
8. FOR ALL valid M/A/N strings `s`, parsing `s` with the Frequency_Parser and re-deriving the M/A/N string from the result SHALL produce a string equivalent to `s` (round-trip property).

---

### Requirement 3: Notification Scheduling on Medication Save

**User Story:** As a user, I want reminder notifications to be scheduled automatically when my medications are saved, so that I receive timely reminders without any extra setup.

#### Acceptance Criteria

1. WHEN a `medications` row is inserted with `reminder_enabled = true`, THE Notification_Scheduler SHALL insert one `notifications` row per reminder time in `reminder_times`.
2. THE Notification_Scheduler SHALL set `channel = 'in_app'` on every notification row it creates.
3. THE Notification_Scheduler SHALL set `type = 'medication_reminder'` on every notification row it creates.
4. THE Notification_Scheduler SHALL set `scheduled_for` to the next future occurrence of the reminder time on the current calendar date (e.g. if it is 09:00 and the reminder time is `08:00`, `scheduled_for` is set to `08:00` the following day).
5. THE Notification_Scheduler SHALL set `title` to `"Time to take <medicine_name>"` on each notification row.
6. THE Notification_Scheduler SHALL set `body` to `"Time to take <medicine_name> <dosage> — <slot> dose"` where `<slot>` is `"Morning"`, `"Afternoon"`, or `"Night"` corresponding to the reminder time.
7. THE Notification_Scheduler SHALL set `data` to a JSON object containing `{ medication_id, profile_id, slot }` on each notification row.
8. THE Notification_Scheduler SHALL set `user_id` and `profile_id` on each notification row to match the values from the parent `medications` row.
9. IF the `notifications` insert fails, THEN THE Notification_Scheduler SHALL log the error and continue without affecting the `medications` row (best-effort, non-fatal).
10. WHEN a `medications` row has `reminder_enabled = false`, THE Notification_Scheduler SHALL NOT create any `notifications` rows for that medication.

---

### Requirement 4: RLS Policy Update for Medications Table

**User Story:** As a family account user, I want all family members' medication reminders to be accessible to me, so that I can manage health for my whole family.

#### Acceptance Criteria

1. THE System SHALL update the RLS SELECT policy on the `medications` table from `user_id = auth.uid()` to a family-membership check: the row is accessible when a `profile_memberships` row exists for `auth.uid()` with a matching `profile_id`.
2. THE System SHALL update the RLS INSERT policy on the `medications` table to permit inserts when the caller's `user_id = auth.uid()` and the `profile_id` belongs to a profile in the caller's family group.
3. THE System SHALL update the RLS UPDATE policy on the `medications` table to permit updates when a `profile_memberships` row exists for `auth.uid()` with a matching `profile_id`.
4. WHILE the `notifications` table RLS policy is `user_id = auth.uid()`, THE System SHALL retain that policy unchanged (notifications are per-account, not per-profile).

---

### Requirement 5: Notification Bell and Unread Count

**User Story:** As a user, I want to see a notification badge in the app header or navigation, so that I know at a glance when I have unread reminders.

#### Acceptance Criteria

1. THE Notification_Bell SHALL be visible in the app header or bottom navigation bar on all authenticated pages.
2. WHEN the authenticated user has one or more unread `in_app` notifications (`is_read = false`, `sent_at IS NOT NULL`), THE Notification_Bell SHALL display a numeric badge showing the unread count.
3. WHEN the unread count is zero, THE Notification_Bell SHALL display no badge.
4. WHEN the unread count exceeds 99, THE Notification_Bell SHALL display `"99+"` in the badge.
5. THE Notification_Bell SHALL update its badge count within 60 seconds of new notifications being delivered.

---

### Requirement 6: Notification Panel

**User Story:** As a user, I want to open a notification panel to see my recent medication reminders, so that I can review what I've been reminded about.

#### Acceptance Criteria

1. WHEN the user taps the Notification_Bell, THE Notification_Panel SHALL open as a drawer or bottom sheet displaying the user's recent `in_app` notifications ordered by `scheduled_for` descending.
2. THE Notification_Panel SHALL display each notification's `title`, `body`, and a human-readable relative time derived from `scheduled_for` (e.g. "2 hours ago").
3. THE Notification_Panel SHALL visually distinguish unread notifications (`is_read = false`) from read notifications (`is_read = true`).
4. WHEN the Notification_Panel contains no notifications, THE Notification_Panel SHALL display an empty state with the message "No notifications yet".
5. THE Notification_Panel SHALL display a maximum of 50 recent notifications per load.
6. WHEN the user taps a notification in the Notification_Panel, THE System SHALL mark that notification as read (`is_read = true`) and navigate to the relevant medication or record if a deep-link is available in `data`.

---

### Requirement 7: Notification Delivery via Polling

**User Story:** As a user, I want due medication reminders to appear automatically while I'm using the app, so that I don't miss a dose.

#### Acceptance Criteria

1. WHILE the user is on an authenticated page, THE Notification_Poller SHALL query for due notifications every 60 seconds.
2. THE Notification_Poller SHALL query for rows where `scheduled_for <= now()`, `sent_at IS NULL`, and `channel = 'in_app'` and `user_id = <current user>`.
3. WHEN the Notification_Poller finds one or more due notifications, THE System SHALL update `sent_at = now()` on each due notification row.
4. WHEN `sent_at` is set on a notification, THE Notification_Bell badge count SHALL increment to reflect the newly delivered notification.
5. THE Notification_Poller SHALL NOT re-deliver a notification that already has `sent_at IS NOT NULL`.

---

### Requirement 8: Mark as Read

**User Story:** As a user, I want to mark notifications as read individually or all at once, so that I can keep my notification panel tidy.

#### Acceptance Criteria

1. WHEN the user taps "Mark all as read" in the Notification_Panel, THE System SHALL set `is_read = true` on all `in_app` notifications for the current user where `is_read = false`.
2. WHEN the user taps an individual notification, THE System SHALL set `is_read = true` on that notification row.
3. WHEN all notifications are marked as read, THE Notification_Bell badge SHALL disappear (count = 0).
4. IF a mark-as-read operation fails, THEN THE System SHALL display an inline error and leave the notification's `is_read` state unchanged in the UI.

---

### Requirement 9: Per-Medication Reminder Toggle

**User Story:** As a user, I want to turn reminders on or off for individual medications, so that I only receive reminders for the medicines I want to be reminded about.

#### Acceptance Criteria

1. THE Reminder_Toggle SHALL be accessible from the medication list on the records or explanation page for each active medication.
2. WHEN the user sets the Reminder_Toggle to off for a medication, THE System SHALL update `reminder_enabled = false` on that `medications` row.
3. WHEN the user sets the Reminder_Toggle to on for a medication that has `reminder_times` populated, THE System SHALL update `reminder_enabled = true` on that `medications` row and schedule the next occurrence of each reminder time as a new `notifications` row.
4. WHEN the user sets the Reminder_Toggle to on for a medication that has no `reminder_times`, THE System SHALL update `reminder_enabled = true` but SHALL NOT create any `notifications` rows.
5. WHEN `reminder_enabled = false` on a `medications` row, THE Notification_Scheduler SHALL NOT create new `notifications` rows for that medication during any future scheduling operations.
6. IF the toggle update fails, THEN THE System SHALL display an inline error and revert the toggle to its previous state in the UI.
