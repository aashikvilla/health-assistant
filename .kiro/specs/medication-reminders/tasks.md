# Implementation Tasks — medication-reminders

> **Spec Status:** Ready for implementation  
> **Estimated Effort:** 8-12 hours  
> **Dependencies:** prescription-enrichment spec (for RxImage components)

---

## Task Overview

This spec implements automatic medication reminders with dual-channel delivery (in-app + push notifications). The implementation is divided into 8 sequential tasks, each building on the previous one. Tasks are designed to be completed in order, with each task producing a working, testable increment.

**Key deliverables:**
- M/A/N frequency parser and reminder time calculator
- Dual-channel notification scheduling (in_app + push)
- 4th bottom nav tab for Notifications
- Full `/notifications` page with expandable cards
- Medicine images and "Take now"/"Skip" actions
- Web Push infrastructure (VAPID, service worker, cron dispatcher)
- Push permission prompt after first prescription save

---

## Task 1: Frequency Parser and Core Service

**Goal:** Implement the M/A/N frequency parser and notifications service foundation.

**Acceptance Criteria:**
- `lib/frequency.ts` exports `parseFrequency`, `computeNextOccurrence`, `timesToFrequencyString`, `timeToSlotLabel`
- `parseFrequency('1-0-1')` returns `['08:00', '21:00']`
- `parseFrequency('1-1-1')` returns `['08:00', '13:00', '21:00']`
- `parseFrequency('0-1-0')` returns `['13:00']`
- `parseFrequency('invalid')` returns `[]`
- `parseFrequency('0-0-0')` returns `[]`
- `computeNextOccurrence('08:00')` returns a future Date (today if before 08:00, tomorrow if after)
- `timesToFrequencyString(['08:00', '21:00'])` returns `'1-0-1'`
- `timeToSlotLabel('08:00')` returns `'Morning'`
- `services/notifications.service.ts` exports `notificationsService` object with method stubs (no implementation yet)
- `types/notifications.ts` exports `NotificationRow` and `MedicationReminder` interfaces
- Types re-exported from `types/index.ts`

**Files to create:**
- `lib/frequency.ts`
- `services/notifications.service.ts` (stubs only)
- `types/notifications.ts`

**Files to modify:**
- `types/index.ts` (add re-export)

**Sanity check:**
```ts
// In Node REPL or quick script
import { parseFrequency, computeNextOccurrence, timesToFrequencyString, timeToSlotLabel } from '@/lib/frequency'

console.log(parseFrequency('1-0-1'))  // ['08:00', '21:00']
console.log(parseFrequency('twice daily'))  // []
console.log(computeNextOccurrence('08:00') > new Date())  // true
console.log(timesToFrequencyString(['08:00', '21:00']))  // '1-0-1'
console.log(timeToSlotLabel('08:00'))  // 'Morning'
```

---

## Task 2: Medication Writer Extension (Step 4)

**Goal:** Extend `documents.service.ts` step 4 to populate `reminder_enabled`, `timing`, and `reminder_times` fields.

**Acceptance Criteria:**
- `createFromExtraction` step 4 calls `parseFrequency(m.frequency)` for each medication
- When `parseFrequency` returns non-empty array, `reminder_enabled = true`, `timing = result`, `reminder_times = result`
- When `parseFrequency` returns empty array, `reminder_enabled = false`, `timing = null`, `reminder_times = null`
- Medications insert uses `.select('id, name, dosage, reminder_enabled, reminder_times')` to return inserted rows
- Step 4 failure is logged but does not throw (best-effort)

**Files to modify:**
- `services/documents.service.ts`

**Sanity check:**
Upload a prescription with a medicine that has frequency `"1-1-1"`. Check the `medications` table in Supabase:
- `reminder_enabled = true`
- `timing = ['08:00','13:00','21:00']`
- `reminder_times = ['08:00','13:00','21:00']`

---

## Task 3: Notification Scheduling (Step 5)

**Goal:** Implement `scheduleReminders` service method and add step 5 to `createFromExtraction`.

**Acceptance Criteria:**
- `notificationsService.scheduleReminders` creates TWO notification rows per reminder time: one `in_app`, one `push`
- Each notification has `type = 'medication_reminder'`, `title = "Time to take {name}"`, `body = "Time to take {name} {dosage} — {slot} dose"`
- `data` field contains `{ medication_id, profile_id, slot }`
- `scheduled_for` is set to `computeNextOccurrence(timeStr)`
- `createFromExtraction` step 5 calls `scheduleReminders` for each medication with `reminder_enabled = true`
- Step 5 failure is logged but does not throw (best-effort)

**Files to modify:**
- `services/notifications.service.ts` (implement `scheduleReminders`)
- `services/documents.service.ts` (add step 5)

**Sanity check:**
Upload a prescription with a medicine that has frequency `"1-0-1"`. Check the `notifications` table in Supabase:
- 4 rows exist (2 `in_app`, 2 `push`)
- All have `type = 'medication_reminder'`
- All have `scheduled_for` in the future
- `title` matches format
- `body` matches format
- `data` contains `medication_id`, `profile_id`, `slot`

---

## Task 4: RLS Migration and Notification Service Methods

**Goal:** Apply RLS migration for medications table and implement remaining notification service methods.

**Acceptance Criteria:**
- `docs/migrations/003_medications_rls.sql` applied to Supabase (idempotent)
- `notificationsService.getDueNotifications` returns `in_app` notifications where `scheduled_for <= now()`, `sent_at IS NULL`
- `notificationsService.markDelivered` sets `sent_at = now()` on provided IDs
- `notificationsService.markRead` sets `is_read = true` on a single notification
- `notificationsService.markAllRead` sets `is_read = true` on all unread `in_app` notifications for a user
- `notificationsService.getRecentNotifications` returns `in_app` notifications where `sent_at IS NOT NULL`, ordered by `scheduled_for DESC`, limit 50
- `notificationsService.getUnreadCount` returns count of unread `in_app` notifications

**Files to create:**
- `docs/migrations/003_medications_rls.sql`

**Files to modify:**
- `services/notifications.service.ts` (implement all methods)

**Sanity check:**
- Run migration in Supabase SQL editor
- Log in as a second account that shares a family group
- Confirm medications for the first account's profiles are visible
- Set a notification's `scheduled_for` to `now() - interval '1 minute'`
- Call `getDueNotifications` and confirm it returns the notification
- Call `markDelivered` and confirm `sent_at` is set
- Call `getUnreadCount` and confirm count is correct

---

## Task 5: Bottom Nav 4th Tab and Notifications Page

**Goal:** Add Notifications tab to BottomNav and create the `/notifications` page.

**Acceptance Criteria:**
- `BottomNav` has 4th tab with bell icon, label "Notifications", href `/notifications`
- Tab shows badge when `unreadCount > 0` (passed as prop)
- Badge shows `"99+"` when `unreadCount > 99`
- Badge is positioned `absolute top-1 right-1` over the icon
- `PRIMARY_PATHS` includes `/notifications`
- `app/(app)/layout.tsx` fetches `initialCount` via `notificationsService.getUnreadCount` and passes to `BottomNav`
- `/notifications` page is a Server Component that fetches notifications and renders `NotificationCard` components
- Page shows `EmptyState` when no notifications exist
- Page uses `PageHeader` with title "Notifications" and backHref "/dashboard"

**Files to create:**
- `app/(app)/notifications/page.tsx`

**Files to modify:**
- `components/layout/BottomNav.tsx` (add 4th tab, accept `unreadCount` prop)
- `app/(app)/layout.tsx` (fetch unread count, pass to BottomNav, remove any floating bell)

**Sanity check:**
- Navigate to `/dashboard`, `/timeline`, `/settings`, `/notifications`
- Confirm BottomNav is visible on all 4 pages
- Confirm Notifications tab is highlighted when on `/notifications`
- Manually insert an unread notification in Supabase
- Confirm badge appears on the Notifications tab
- Tap the tab and confirm navigation to `/notifications`
- Confirm page shows empty state when no notifications exist

---

## Task 6: Notification Card and Polling Hook

**Goal:** Implement expandable notification cards with RxImage and the polling hook.

**Acceptance Criteria:**
- `NotificationCard` component renders collapsed state by default (medicine name, slot badge, relative time, unread indicator)
- Tapping collapsed card expands it to show `RxImageSlot`, dosage, "Take now" and "Skip" buttons
- `useNotifications` hook polls every 60 seconds, fetches due notifications, calls `markDelivered`, increments `unreadCount`
- Hook provides `notifications`, `unreadCount`, `markRead`, `markAllRead`, `loading`, `error`
- `markRead` and `markAllRead` use optimistic updates
- `BottomNav` uses `useNotifications` hook to update badge in real-time

**Files to create:**
- `components/features/notifications/NotificationCard.tsx`
- `hooks/useNotifications.ts`

**Files to modify:**
- `components/layout/BottomNav.tsx` (use `useNotifications` hook)
- `app/(app)/notifications/page.tsx` (pass notifications to cards)

**Sanity check:**
- Set a notification's `scheduled_for` to `now() - interval '1 minute'`
- Open the app and wait up to 60 seconds
- Confirm `sent_at` is set on the notification
- Confirm BottomNav badge increments
- Navigate to `/notifications`
- Confirm notification card is rendered in collapsed state
- Tap the card and confirm it expands
- Confirm medicine image (or fallback) is shown
- Confirm dosage and slot are shown

---

## Task 7: Medication Logs and Server Actions

**Goal:** Implement "Take now"/"Skip" actions and all notification Server Actions.

**Acceptance Criteria:**
- `app/(app)/notifications/actions.ts` exports `logMedicationAction`, `markRead`, `markAllRead`, `markDelivered`
- `logMedicationAction` validates auth, inserts into `medication_logs` with `action`, `medication_id`, `user_id`, `scheduled_time`, `action_time = now()`
- `markRead` validates auth, sets `is_read = true` on a single notification
- `markAllRead` validates auth, sets `is_read = true` on all unread `in_app` notifications for the user
- `markDelivered` validates auth, sets `sent_at = now()` on provided IDs
- `NotificationCard` calls `logMedicationAction` when "Take now" or "Skip" is tapped
- After successful action, card calls `markRead` and sets `is_read = true` locally
- Action buttons show loading spinner during request
- Action failure shows inline error message

**Files to create:**
- `app/(app)/notifications/actions.ts`

**Files to modify:**
- `components/features/notifications/NotificationCard.tsx` (wire up action buttons)
- `hooks/useNotifications.ts` (call Server Actions)

**Sanity check:**
- Expand a notification card
- Tap "Take now"
- Confirm a row is inserted into `medication_logs` with `action = 'taken'`
- Confirm `medication_id` matches notification's `data.medication_id`
- Confirm `scheduled_time` matches notification's `scheduled_for`
- Confirm notification is marked `is_read = true`
- Confirm BottomNav badge decrements
- Tap "Skip" on another card
- Confirm a row is inserted with `action = 'skipped'`

---

## Task 8: Web Push Infrastructure

**Goal:** Implement push notification delivery via Web Push API, service worker, and cron dispatcher.

**Acceptance Criteria:**
- `public/sw.js` handles `push` events and calls `self.registration.showNotification`
- `public/sw.js` handles `notificationclick` events and navigates to `/notifications`
- `app/layout.tsx` registers service worker on mount
- `app/api/push/subscribe/route.ts` saves push subscriptions to `push_subscriptions` table
- `app/api/push/send/route.ts` queries due `push` notifications, fetches active subscriptions, dispatches via `web-push` library
- Cron route marks subscriptions `is_active = false` on 410/404 errors
- Cron route marks notifications `sent_at = now()` after successful dispatch
- `vercel.json` configures cron to run `/api/push/send` every minute
- `PushPermissionBanner` component prompts for permission after first prescription save
- Banner calls `Notification.requestPermission()`, subscribes via service worker, saves to `/api/push/subscribe`
- `app/(app)/dashboard/page.tsx` conditionally renders banner when `Notification.permission === 'default'` and prescription count > 0
- VAPID keys generated and added to `.env.local`
- `web-push` npm package installed

**Files to create:**
- `public/sw.js`
- `app/api/push/subscribe/route.ts`
- `app/api/push/send/route.ts`
- `components/features/notifications/PushPermissionBanner.tsx`
- `vercel.json` (or modify existing)

**Files to modify:**
- `app/layout.tsx` (register service worker)
- `app/(app)/dashboard/page.tsx` (render banner conditionally)
- `.env.local` (add VAPID keys and CRON_SECRET)
- `package.json` (add `web-push` dependency)

**Sanity check:**
- Generate VAPID keys: `npx web-push generate-vapid-keys`
- Add keys to `.env.local`
- Install `web-push`: `npm install web-push`
- Upload a prescription as a new user
- Confirm `PushPermissionBanner` appears on dashboard
- Tap "Enable" and grant permission
- Confirm a row is inserted into `push_subscriptions`
- Set a `push` notification's `scheduled_for` to `now() - interval '1 minute'`
- Trigger `/api/push/send` manually: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/push/send`
- Confirm `sent_at` is set on the notification
- Confirm push notification appears on device
- Tap the notification and confirm app opens to `/notifications`
- Manually set a subscription's `endpoint` to an invalid URL
- Trigger push dispatcher
- Confirm subscription is marked `is_active = false`

---

## Task 9: Reminder Toggle (Optional Enhancement)

**Goal:** Add per-medication reminder toggle to `MedicationList`.

**Acceptance Criteria:**
- `MedicationList` accepts optional `dbMedications` prop with `id`, `name`, `reminder_enabled`, `reminder_times`
- When `dbMedications` is provided, each medication row renders a toggle button
- Toggle calls `toggleMedicationReminder` Server Action
- Server Action updates `reminder_enabled` on the `medications` row
- When enabling, Server Action calls `scheduleReminders` to create new notification rows
- Toggle uses optimistic state (flips immediately, reverts on error)
- Error shows inline message below medication row

**Files to create:**
- `app/(app)/notifications/actions.ts` (add `toggleMedicationReminder` if not already created in Task 7)

**Files to modify:**
- `components/features/records/MedicationList.tsx` (add toggle UI)

**Sanity check:**
- Open a prescription's medication list
- Toggle a reminder off
- Confirm `reminder_enabled = false` in Supabase
- Toggle it back on
- Confirm `reminder_enabled = true`
- Confirm new notification rows (both `in_app` and `push`) are created

---

## Implementation Notes

### Dependency Order

Tasks must be completed in sequence:
1. Task 1 (parser) → Task 2 (medication writer) → Task 3 (scheduling)
2. Task 4 (service methods) → Task 5 (page) → Task 6 (cards + polling)
3. Task 7 (actions) can be done in parallel with Task 8 (push)
4. Task 9 (toggle) is optional and can be done last

### Testing Strategy

After each task, run the sanity check before proceeding. This ensures each increment is working before building on top of it.

**Build check after every task:**
```bash
npm run build
# or
tsc --noEmit
```

Confirm zero TypeScript errors before proceeding to the next task.

### Common Pitfalls

1. **Frequency parser edge cases:** Test with `"0-0-0"`, `"invalid"`, `""`, `"1-2-3"` (all should return `[]`)
2. **Dual-channel scheduling:** Ensure BOTH `in_app` and `push` rows are created for each reminder time
3. **Polling hook:** Use `useEffect` cleanup to clear the interval on unmount
4. **Optimistic updates:** Always revert state on error, never leave UI in inconsistent state
5. **VAPID keys:** Public key must be accessible client-side, private key must never be in client bundles
6. **Service worker:** Must be at `/sw.js` (public root), not in a subdirectory
7. **Cron auth:** Always verify `Authorization: Bearer ${CRON_SECRET}` header in `/api/push/send`

### Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BG...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:your-email@example.com
CRON_SECRET=random-secret-string
```

Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

### Dependencies

Install `web-push`:
```bash
npm install web-push
```

---

## Completion Checklist

- [x] Task 1: Frequency parser and service stubs
- [x] Task 2: Medication writer extension (step 4)
- [x] Task 3: Notification scheduling (step 5)
- [x] Task 4: RLS migration and service methods
- [x] Task 5: Bottom nav 4th tab and notifications page
- [x] Task 6: Notification card and polling hook
- [x] Task 7: Medication logs and server actions
- [x] Task 8: Web Push infrastructure
- [ ] Task 9: Reminder toggle (optional)
- [ ] All sanity checks passed
- [ ] Build check passed (`npm run build` or `tsc --noEmit`)
- [ ] Manual testing on mobile device (push notifications)
- [ ] Manual testing on desktop (in-app notifications)

---

## Next Steps

After completing all tasks:

1. **Test the full flow end-to-end:**
   - Upload a prescription with frequency `"1-0-1"`
   - Confirm medications and notifications are created
   - Wait for a notification to become due (or manually set `scheduled_for`)
   - Confirm in-app notification appears and badge updates
   - Confirm push notification appears on device
   - Tap push notification and confirm navigation to `/notifications`
   - Expand a card and tap "Take now"
   - Confirm medication log is created

2. **Verify RLS policies:**
   - Log in as a second account that shares a family group
   - Confirm medications and notifications are visible
   - Confirm notifications for the second account's own `user_id` are not visible to the first account

3. **Test error handling:**
   - Simulate network failures (offline mode)
   - Simulate Supabase errors (invalid IDs)
   - Confirm optimistic updates revert correctly
   - Confirm inline error messages appear

4. **Performance check:**
   - Insert 100 notifications for a user
   - Confirm page loads in < 2 seconds
   - Confirm polling does not cause UI jank
   - Confirm badge updates smoothly

5. **Accessibility check:**
   - Test with screen reader (VoiceOver on iOS, TalkBack on Android)
   - Confirm all interactive elements have 44×44px touch targets
   - Confirm badge has `aria-label` with unread count
   - Confirm notification cards have proper focus management

6. **Deploy to staging:**
   - Verify VAPID keys are set in Vercel environment variables
   - Verify `CRON_SECRET` is set
   - Verify cron job is configured in Vercel dashboard
   - Test push notifications on staging environment

7. **Monitor cron job:**
   - Check Vercel logs for `/api/push/send` executions
   - Confirm no errors in push dispatch
   - Confirm expired subscriptions are marked `is_active = false`

---

## Spec Complete

Once all tasks are complete and tested, the medication-reminders feature is ready for production deployment. The spec can be marked as **Implemented** in the `.config.kiro` file.
