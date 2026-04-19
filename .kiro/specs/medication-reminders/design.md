# Design Document — medication-reminders

## Overview

This feature wires together four existing database tables (`medications`, `notifications`, `documents`, `family_profiles`) to deliver automatic in-app medication reminders. When a prescription is saved, the system parses the M/A/N frequency string for each medicine, writes enriched `medications` rows (including `reminder_enabled`, `timing`, and `reminder_times`), and schedules `notifications` rows for each upcoming dose. A polling hook running every 60 seconds marks due notifications as delivered and updates the unread badge. Users interact with reminders through a `NotificationBell` in the app header and a `NotificationPanel` drawer, and can toggle reminders per medication from the medication list.

No new database tables are required. No push/web-push delivery is in scope — `in_app` channel only.

---

## Architecture

### Data Flow Diagram

```mermaid
flowchart TD
    subgraph Prescription Save
        OCR[OCR / Review Screen] -->|PrescriptionData| SA[Server Action\ncreateFromExtraction]
        SA --> MW[Medication_Writer\nstep 4 — extended]
        MW -->|parseFrequency| FP[lib/frequency.ts\nparseFrequency]
        FP -->|reminder_times| MW
        MW -->|INSERT medications\nreminder_enabled, timing, reminder_times| DB_MEDS[(medications)]
        MW -->|scheduleReminders| NS[notificationsService\n.scheduleReminders]
        NS -->|computeNextOccurrence| FP
        NS -->|INSERT notifications\nchannel=in_app| DB_NOTIF[(notifications)]
    end

    subgraph Client Polling
        LAYOUT[app/(app)/layout.tsx] -->|renders| BELL[NotificationBell\nclient component]
        BELL -->|useNotifications hook| HOOK[useNotifications\nsetInterval 60s]
        HOOK -->|Supabase client read\nscheduled_for<=now, sent_at IS NULL| DB_NOTIF
        HOOK -->|Server Action\nmarkDelivered| SA2[settings/actions.ts\nmarkDelivered]
        SA2 -->|UPDATE sent_at=now()| DB_NOTIF
        HOOK -->|unreadCount, notifications| BELL
    end

    subgraph Notification Panel
        BELL -->|tap| PANEL[NotificationPanel]
        PANEL -->|renders| ITEM[NotificationItem]
        PANEL -->|markRead SA| SA3[settings/actions.ts\nmarkRead / markAllRead]
        SA3 -->|UPDATE is_read=true| DB_NOTIF
    end

    subgraph Reminder Toggle
        MEDLIST[MedicationList] -->|ReminderToggle| TOGGLE[toggle UI]
        TOGGLE -->|toggleMedicationReminder SA| SA4[settings/actions.ts\ntoggleMedicationReminder]
        SA4 -->|UPDATE reminder_enabled| DB_MEDS
        SA4 -->|scheduleReminders if enabling| NS
    end
```

### Key Design Decisions

**Why extend step 4 rather than replace it?** `createFromExtraction` already has a partial medications write. Extending it in-place keeps the transaction boundary clear: document → analysis → prescriptions → medications → notifications, all best-effort after step 2.

**Why a Server Action for `markDelivered` but Supabase client for the read?** The read is a simple SELECT that benefits from the client-side Supabase realtime connection and avoids a round-trip through Next.js. The write (`sent_at = now()`) must be a Server Action to avoid exposing service-role logic client-side and to ensure auth is validated server-side.

**Why polling instead of Supabase Realtime?** Realtime requires a persistent WebSocket and subscription management. Polling at 60s is simpler, matches the requirement exactly, and avoids the complexity of channel lifecycle management in a Next.js App Router layout.

**Why `NotificationBell` in `app/(app)/layout.tsx` as a floating element?** The bell needs to be visible on all authenticated pages including sub-routes (records, explanation, upload) where `BottomNav` is hidden. Placing it as a `fixed` positioned client component in the layout is the only approach that satisfies this without modifying every page. On mobile it floats in the top-right corner; on desktop it sits alongside the hamburger trigger.

---

## Components and Interfaces

### New Files

| File | Purpose |
|------|---------|
| `lib/frequency.ts` | Pure M/A/N parser + next-occurrence calculator |
| `services/notifications.service.ts` | `scheduleReminders`, `getDueNotifications`, `markDelivered`, `markRead`, `markAllRead`, `toggleReminder` |
| `hooks/useNotifications.ts` | Polling hook, unread count, panel open/close state |
| `components/features/notifications/NotificationBell.tsx` | Bell icon + unread badge |
| `components/features/notifications/NotificationPanel.tsx` | Drawer/bottom sheet with notification list |
| `components/features/notifications/NotificationItem.tsx` | Single notification row |
| `app/(app)/settings/actions.ts` | Server Actions: `toggleMedicationReminder`, `markRead`, `markAllRead`, `markDelivered` |
| `docs/migrations/003_medications_rls.sql` | RLS migration for medications table |

### Modified Files

| File | Change |
|------|--------|
| `services/documents.service.ts` | Extend step 4 to add `reminder_enabled`, `timing`, `reminder_times`; add step 5 to call `scheduleReminders` |
| `app/(app)/layout.tsx` | Render `<NotificationBell>` as a fixed floating element |
| `components/features/records/MedicationList.tsx` | Add `ReminderToggle` per medication row |

### Component Tree

```
app/(app)/layout.tsx (Server Component)
└── NotificationBell (Client Component — 'use client')
    ├── useNotifications() hook
    │   ├── Supabase browser client (read)
    │   └── markDelivered Server Action (write)
    └── NotificationPanel (Client Component)
        └── NotificationItem[] (Client Component)
            └── markRead / markAllRead Server Actions
```

### `lib/frequency.ts` — Function Signatures

```ts
// lib/frequency.ts

/** The three default reminder time slots in HH:MM format (UTC). */
export const DEFAULT_TIMES = {
  morning:   '08:00',
  afternoon: '13:00',
  night:     '21:00',
} as const

export type TimeSlot = 'morning' | 'afternoon' | 'night'

/**
 * Parse an M/A/N frequency string into reminder times.
 *
 * @param frequency  e.g. "1-0-1" → ['08:00', '21:00']
 * @returns          Subset of ['08:00', '13:00', '21:00'] for non-zero positions.
 *                   Returns [] for non-matching or all-zero input.
 */
export function parseFrequency(frequency: string): string[]

/**
 * Given a reminder time string (HH:MM) and a reference Date (defaults to now),
 * return the next future Date at which that time occurs.
 *
 * If the time has already passed today (UTC), returns tomorrow at that time.
 * If the time is still in the future today (UTC), returns today at that time.
 *
 * @param timeStr   e.g. '08:00'
 * @param now       Reference point (default: new Date())
 * @returns         Next future Date for this time slot (UTC)
 */
export function computeNextOccurrence(timeStr: string, now?: Date): Date

/**
 * Derive the M/A/N string from a list of reminder times.
 * Inverse of parseFrequency — used for the round-trip property.
 *
 * @param times  e.g. ['08:00', '21:00'] → '1-0-1'
 * @returns      M/A/N string with 1 for each present slot, 0 for absent
 */
export function timesToFrequencyString(times: string[]): string

/**
 * Map a reminder time string to its human-readable slot label.
 *
 * @param timeStr  '08:00' | '13:00' | '21:00'
 * @returns        'Morning' | 'Afternoon' | 'Night'
 */
export function timeToSlotLabel(timeStr: string): string
```

### `services/notifications.service.ts` — Method Signatures

```ts
// services/notifications.service.ts
import type { ApiResponse } from '@/types'

export interface NotificationRow {
  id: string
  user_id: string
  profile_id: string | null
  type: string
  title: string
  body: string
  data: Record<string, unknown> | null
  is_read: boolean
  scheduled_for: string
  sent_at: string | null
  channel: string
  created_at: string
}

export interface ScheduleRemindersInput {
  userId: string
  profileId: string
  medicationId: string
  medicationName: string
  dosage: string | null
  reminderTimes: string[]   // e.g. ['08:00', '21:00']
}

export const notificationsService = {
  /**
   * Insert one notifications row per reminder time for a medication.
   * Called from createFromExtraction (step 5) and toggleMedicationReminder.
   * Best-effort — logs errors but does not throw.
   */
  async scheduleReminders(input: ScheduleRemindersInput): Promise<ApiResponse<null>>,

  /**
   * Fetch notifications where scheduled_for <= now(), sent_at IS NULL,
   * channel = 'in_app', user_id = userId.
   * Called by the polling hook every 60 seconds.
   */
  async getDueNotifications(userId: string): Promise<ApiResponse<NotificationRow[]>>,

  /**
   * Set sent_at = now() on a list of notification IDs.
   * Called by the polling hook after getDueNotifications returns rows.
   */
  async markDelivered(ids: string[]): Promise<ApiResponse<null>>,

  /**
   * Set is_read = true on a single notification.
   */
  async markRead(id: string, userId: string): Promise<ApiResponse<null>>,

  /**
   * Set is_read = true on all in_app notifications for a user where is_read = false.
   */
  async markAllRead(userId: string): Promise<ApiResponse<null>>,

  /**
   * Fetch recent in_app notifications for the panel (sent_at IS NOT NULL),
   * ordered by scheduled_for DESC, limit 50.
   */
  async getRecentNotifications(userId: string): Promise<ApiResponse<NotificationRow[]>>,

  /**
   * Get the count of unread in_app notifications (is_read = false, sent_at IS NOT NULL).
   * Used for the initial server-fetched count in the layout.
   */
  async getUnreadCount(userId: string): Promise<ApiResponse<number>>,
}
```

### `hooks/useNotifications.ts` — Hook Shape

```ts
// hooks/useNotifications.ts
'use client'

export interface UseNotificationsResult {
  /** Notifications to display in the panel (sent_at IS NOT NULL, ordered by scheduled_for DESC) */
  notifications: NotificationRow[]
  /** Count of unread notifications (is_read = false, sent_at IS NOT NULL) */
  unreadCount: number
  /** Whether the notification panel is open */
  panelOpen: boolean
  /** Open the notification panel */
  openPanel: () => void
  /** Close the notification panel */
  closePanel: () => void
  /** Mark a single notification as read (optimistic) */
  markRead: (id: string) => Promise<void>
  /** Mark all notifications as read (optimistic) */
  markAllRead: () => Promise<void>
  /** Whether the initial load is in progress */
  loading: boolean
  /** Error from the last failed operation */
  error: string | null
}

/**
 * @param userId         Authenticated user's UUID
 * @param initialCount   Server-fetched unread count (avoids flash of 0 on mount)
 */
export function useNotifications(
  userId: string,
  initialCount: number
): UseNotificationsResult
```

**Polling logic inside the hook:**

```
useEffect(() => {
  const poll = async () => {
    // 1. Fetch due notifications via Supabase browser client
    // 2. If any found, call markDelivered Server Action with their IDs
    // 3. Increment unreadCount by the number of newly delivered notifications
    // 4. Append newly delivered notifications to the local notifications list
  }

  poll()  // immediate first poll on mount
  const interval = setInterval(poll, 60_000)
  return () => clearInterval(interval)
}, [userId])
```

### `NotificationBell` Component

```tsx
// components/features/notifications/NotificationBell.tsx
'use client'

interface NotificationBellProps {
  userId: string
  initialUnreadCount: number
}

export function NotificationBell({ userId, initialUnreadCount }: NotificationBellProps)
```

Renders:
- A `<button>` with `aria-label="Notifications"` and `aria-haspopup="dialog"`
- A bell SVG icon (outline when count = 0, filled when count > 0)
- A badge `<span>` showing the count when `unreadCount > 0` (shows `"99+"` when > 99)
- The `<NotificationPanel>` (conditionally rendered when `panelOpen = true`)

The component calls `useNotifications(userId, initialUnreadCount)` internally.

**Placement in `app/(app)/layout.tsx`:**

```tsx
// Fetch initial unread count server-side to avoid badge flash
const { data: initialCount } = await notificationsService.getUnreadCount(user.id)

// Render as a fixed floating element — visible on all authenticated pages
<div className="fixed top-3 right-4 z-50 sm:top-[10px] sm:right-16">
  <NotificationBell userId={user.id} initialUnreadCount={initialCount ?? 0} />
</div>
```

On mobile (`sm:` breakpoint and below), the bell sits at `top-3 right-4` — top-right corner, clear of the `GradientHeroHeader` app name on the left. On desktop (`sm:` and above), it shifts to `right-16` to avoid overlapping the hamburger trigger at `right-5`.

### `NotificationPanel` Component

```tsx
// components/features/notifications/NotificationPanel.tsx
'use client'

interface NotificationPanelProps {
  notifications: NotificationRow[]
  loading: boolean
  onClose: () => void
  onMarkRead: (id: string) => Promise<void>
  onMarkAllRead: () => Promise<void>
  error: string | null
}

export function NotificationPanel(props: NotificationPanelProps)
```

Renders as a bottom sheet on mobile (slides up from bottom, `fixed bottom-0 inset-x-0 rounded-t-3xl`) and a right-side drawer on desktop (`fixed top-0 right-0 bottom-0 w-80`). Uses the same backdrop + scroll-lock pattern as `AppDrawerNav`.

Panel header: "Notifications" label + "Mark all as read" button (hidden when all are read).

Content: scrollable list of `<NotificationItem>` components, ordered by `scheduled_for` DESC. Empty state via `<EmptyState>` when `notifications.length === 0`.

### `NotificationItem` Component

```tsx
// components/features/notifications/NotificationItem.tsx
'use client'

interface NotificationItemProps {
  notification: NotificationRow
  onMarkRead: (id: string) => Promise<void>
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps)
```

Renders using `<ListItem>` from `@/components/ui` with:
- Icon: pill/bell SVG
- Title: `notification.title`
- Subtitle: `notification.body`
- Badge: relative time string (e.g. "2 hours ago") derived from `notification.scheduled_for`
- Unread indicator: left border `border-l-2 border-primary` + `bg-accent-subtle` background when `is_read = false`
- Tap handler: calls `onMarkRead(notification.id)` then navigates if `notification.data` contains a deep link

### `MedicationList` — `ReminderToggle` Addition

The existing `MedicationList` component receives `MedicationExplanation[]` which does not include `reminder_enabled` or `id`. The component needs to be extended to optionally accept `medications` from the `medications` DB table (which has `id` and `reminder_enabled`) when rendered in a context where reminders are available.

```tsx
// Extended props for MedicationList
interface MedicationListProps {
  medications: MedicationExplanation[]
  // Optional: DB medication rows for reminder toggle support
  dbMedications?: Array<{
    id: string
    name: string
    reminder_enabled: boolean
    reminder_times: string[] | null
  }>
  className?: string
}
```

When `dbMedications` is provided, each medication row renders a `ReminderToggle` — a `<button>` that calls the `toggleMedicationReminder` Server Action. The toggle uses optimistic state: it flips immediately in the UI and reverts on error with an inline error message.

---

## Data Models

### TypeScript Types — New File: `types/notifications.ts`

```ts
// types/notifications.ts

export interface NotificationRow {
  id: string
  user_id: string
  profile_id: string | null
  type: string
  title: string
  body: string
  data: {
    medication_id?: string
    profile_id?: string
    slot?: string
    [key: string]: unknown
  } | null
  is_read: boolean
  scheduled_for: string   // ISO 8601 timestamptz
  sent_at: string | null  // ISO 8601 timestamptz
  channel: string
  created_at: string
}

export interface MedicationReminder {
  id: string
  name: string
  dosage: string | null
  frequency: string | null
  reminder_enabled: boolean
  reminder_times: string[] | null  // e.g. ['08:00', '21:00']
  timing: string[] | null          // same as reminder_times (denormalised)
  profile_id: string
  status: string
}
```

Add to `types/index.ts`:
```ts
export type { NotificationRow, MedicationReminder } from './notifications'
```

### `documents.service.ts` — Step 4 Extension

The existing step 4 `medications` insert is extended to include three new fields:

```ts
// Inside the meds.map() callback — additions only:
const reminderTimes = parseFrequency(m.frequency ?? '')
return {
  // ... existing fields (user_id, profile_id, name, dosage, frequency, end_date, source_document_id, status) ...
  reminder_enabled: reminderTimes.length > 0,
  timing: reminderTimes.length > 0 ? reminderTimes : null,
  reminder_times: reminderTimes.length > 0 ? reminderTimes : null,
}
```

### `documents.service.ts` — Step 5 (New)

After the medications insert succeeds, schedule notifications for each medication that has `reminder_enabled = true`:

```ts
// Step 5: Schedule notifications for medications with reminders (best-effort)
if (type === 'prescription' && insertedMeds) {
  for (const med of insertedMeds) {
    if (med.reminder_enabled && med.reminder_times && med.reminder_times.length > 0) {
      await notificationsService.scheduleReminders({
        userId,
        profileId,
        medicationId: med.id,
        medicationName: med.name,
        dosage: med.dosage,
        reminderTimes: med.reminder_times,
      })
    }
  }
}
```

The medications insert must use `.select('id, name, dosage, reminder_enabled, reminder_times')` to get the inserted IDs back for step 5.

---

## SQL Migration: `docs/migrations/003_medications_rls.sql`

> **Note:** Migration 001 (`001_family_sharing_rls.sql`) already contains the correct family-membership RLS policies for the `medications` table. This migration is a no-op if 001 has already been applied. It is included here as a standalone migration for environments where 001 was not run, or where the medications policies were reverted.

```sql
-- Migration 003: Family-membership RLS for medications table
--
-- Problem: medications table uses user_id = auth.uid() for all policies,
-- which prevents family members from seeing each other's medication records.
--
-- Fix: Replace the single FOR ALL policy with split SELECT (membership-gated)
-- and write (owner-only) policies, matching the pattern in 001_family_sharing_rls.sql.
--
-- Safe to run if 001 has already been applied — DROP IF EXISTS is idempotent.

-- ── medications ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can manage own medications" ON medications;
DROP POLICY IF EXISTS "Members can view medications in their family groups" ON medications;
DROP POLICY IF EXISTS "Owners can insert medications" ON medications;
DROP POLICY IF EXISTS "Owners can update medications" ON medications;
DROP POLICY IF EXISTS "Owners can delete medications" ON medications;

CREATE POLICY "Members can view medications in their family groups" ON medications
  FOR SELECT USING (
    profile_id IN (
      SELECT profile_id FROM profile_memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert medications" ON medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update medications" ON medications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete medications" ON medications
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Frequency parser returns exactly the non-zero slot times

*For any* string of the form `"a-b-c"` where a, b, c are non-negative integers, `parseFrequency` SHALL return exactly the subset of `['08:00', '13:00', '21:00']` corresponding to the positions where the integer is non-zero (position 0 = morning, 1 = afternoon, 2 = night).

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

---

### Property 2: Frequency parser round-trip

*For any* valid M/A/N string `s` (matching `"<int>-<int>-<int>"`), calling `parseFrequency(s)` to get times and then `timesToFrequencyString(times)` SHALL produce a string that is semantically equivalent to `s` — i.e. the non-zero/zero pattern is preserved (though the exact integer values may normalise to 0 or 1).

**Validates: Requirements 2.8**

---

### Property 3: Invalid frequency strings return empty array

*For any* string that does not match the `"<int>-<int>-<int>"` pattern (including empty string, free text, wrong separators, too many/few segments, all-zero `"0-0-0"`), `parseFrequency` SHALL return an empty array `[]`.

**Validates: Requirements 2.5, 2.6**

---

### Property 4: Medication writer sets reminder_enabled based on parseability

*For any* medication with a frequency field, the inserted `medications` row SHALL have `reminder_enabled = true` if and only if `parseFrequency(frequency)` returns a non-empty array.

**Validates: Requirements 1.6, 1.7**

---

### Property 5: timing and reminder_times columns always match parseFrequency output

*For any* inserted `medications` row, the `timing` column and the `reminder_times` column SHALL both equal `parseFrequency(frequency)` — they are always identical to each other and to the parser output.

**Validates: Requirements 2.7**

---

### Property 6: Notification count equals reminder_times length

*For any* medication inserted with `reminder_enabled = true` and `N` entries in `reminder_times`, the Notification_Scheduler SHALL create exactly `N` `notifications` rows for that medication.

**Validates: Requirements 3.1**

---

### Property 7: All scheduled notifications are always in the future

*For any* reminder time string and any reference time `now`, `computeNextOccurrence(timeStr, now)` SHALL return a Date that is strictly greater than `now`.

**Validates: Requirements 3.4**

---

### Property 8: Notification field invariants

*For any* medication with reminders, every `notifications` row created by the Notification_Scheduler SHALL have `channel = 'in_app'`, `type = 'medication_reminder'`, `user_id` and `profile_id` matching the parent medication row, and `data` containing `medication_id`, `profile_id`, and `slot` fields.

**Validates: Requirements 3.2, 3.3, 3.7, 3.8**

---

### Property 9: Notification title and body follow the prescribed format

*For any* medication name and dosage, the `title` field SHALL equal `"Time to take {name}"` and the `body` field SHALL equal `"Time to take {name} {dosage} — {slot} dose"` where `{slot}` is `"Morning"`, `"Afternoon"`, or `"Night"`.

**Validates: Requirements 3.5, 3.6**

---

### Property 10: No notifications created when reminder_enabled = false

*For any* medication inserted with `reminder_enabled = false`, the Notification_Scheduler SHALL create zero `notifications` rows for that medication.

**Validates: Requirements 3.10, 9.5**

---

### Property 11: Notification bell badge displays correct count

*For any* unread count `n` where `n > 0` and `n ≤ 99`, the `NotificationBell` SHALL render a badge element containing exactly the string representation of `n`. For any `n > 99`, the badge SHALL contain `"99+"`. For `n = 0`, no badge element SHALL be rendered.

**Validates: Requirements 5.2, 5.3, 5.4**

---

### Property 12: Notification panel renders all required fields for every notification

*For any* list of `NotificationRow` objects passed to `NotificationPanel`, every notification's `title`, `body`, and a relative time string derived from `scheduled_for` SHALL appear in the rendered output.

**Validates: Requirements 6.2**

---

### Property 13: Notification panel respects the 50-item limit

*For any* list of more than 50 notifications, the `NotificationPanel` SHALL render at most 50 items.

**Validates: Requirements 6.5**

---

### Property 14: markAllRead sets is_read = true on all unread notifications

*For any* set of unread `in_app` notifications for a user, calling `markAllRead(userId)` SHALL result in all of those notifications having `is_read = true`.

**Validates: Requirements 8.1**

---

### Property 15: toggleReminder on creates notifications for any non-empty reminder_times

*For any* medication with `N ≥ 1` entries in `reminder_times`, calling `toggleMedicationReminder(id, true)` SHALL set `reminder_enabled = true` and create exactly `N` new `notifications` rows.

**Validates: Requirements 9.3**

---

### Property 16: end_date arithmetic is correct for any valid (date, duration) pair

*For any* prescription `document_date` string and positive integer `duration_days`, the computed `end_date` SHALL equal `document_date + duration_days` calendar days.

**Validates: Requirements 1.3**

---

## Error Handling

### Medications Insert Failure (Step 4)

The medications insert is wrapped in a try/catch. On failure:
- `console.error` logs the Supabase error with the document ID for traceability
- The function returns `{ data: doc, error: null, success: true }` — the parent document and analysis rows are not rolled back
- Step 5 (notification scheduling) is skipped if step 4 failed

### Notifications Insert Failure (Step 5)

`scheduleReminders` is called in a `for` loop per medication. Each call is independently try/caught:
- `console.error` logs the error with `medicationId`
- The loop continues to the next medication
- The medications row is not affected

### `markDelivered` Failure in Polling Hook

If the Server Action fails:
- The error is stored in `error` state
- `unreadCount` is not incremented (no false positives)
- The next poll (60s later) will retry — `getDueNotifications` will return the same rows again since `sent_at` was not set

### `markRead` / `markAllRead` Failure

Both operations use optimistic updates:
1. The UI updates immediately (badge decrements, notification styled as read)
2. If the Server Action returns an error, the optimistic state is rolled back
3. An inline error message is shown using `text-error` token
4. The badge count is restored to its pre-action value

### `toggleMedicationReminder` Failure

Uses optimistic state in `MedicationList`:
1. Toggle flips immediately in the UI
2. If the Server Action fails, the toggle reverts to its previous state
3. An inline error message appears below the medication row

---

## Testing Strategy

### Sanity Checks (Manual)

Per the project convention (matching Spec 1), no automated test files are created. The following sanity checks verify the implementation:

1. **Frequency parser** — In a Node REPL or quick script, call `parseFrequency('1-0-1')` and confirm `['08:00', '21:00']` is returned. Call `parseFrequency('twice daily')` and confirm `[]` is returned.

2. **Medication write** — Upload a prescription with a medicine that has frequency `"1-1-1"`. Check the `medications` table in Supabase: confirm `reminder_enabled = true`, `timing = ['08:00','13:00','21:00']`, `reminder_times = ['08:00','13:00','21:00']`.

3. **Notification scheduling** — After the same upload, check the `notifications` table: confirm 3 rows exist for that medication with `channel = 'in_app'`, `type = 'medication_reminder'`, and `scheduled_for` values in the future.

4. **Polling** — Set a notification's `scheduled_for` to `now() - interval '1 minute'` in Supabase. Open the app and wait up to 60 seconds. Confirm `sent_at` is set on that row and the bell badge increments.

5. **Mark as read** — Open the notification panel, tap a notification. Confirm `is_read = true` in Supabase and the unread badge decrements.

6. **Reminder toggle** — Open a prescription's medication list. Toggle a reminder off. Confirm `reminder_enabled = false` in Supabase. Toggle it back on. Confirm `reminder_enabled = true` and new notification rows are created.

7. **RLS** — Log in as a second account that shares a family group. Confirm the medications and notifications for the first account's profiles are visible. Confirm notifications for the second account's own `user_id` are not visible to the first account.

8. **Badge cap** — Manually insert 100 unread notification rows for a user. Confirm the bell badge shows `"99+"`.

9. **Build check** — Run `next build` or `tsc --noEmit` and confirm zero TypeScript errors.
