# Design Document — medication-reminders

## Overview

This feature wires together four existing database tables (`medications`, `notifications`, `documents`, `family_profiles`) to deliver automatic medication reminders via two channels: in-app polling and Web Push notifications. When a prescription is saved, the system parses the M/A/N frequency string for each medicine, writes enriched `medications` rows (including `reminder_enabled`, `timing`, and `reminder_times`), and schedules dual-channel `notifications` rows (`in_app` + `push`) for each upcoming dose. A polling hook running every 60 seconds marks due in-app notifications as delivered and updates the unread badge. Users interact with reminders through a dedicated Notifications tab (4th item in bottom navigation) that navigates to a full `/notifications` page showing expandable notification cards with medicine images and inline "Take now" / "Skip" actions that write to `medication_logs`. After saving their first prescription, users are prompted to enable push notifications; if granted, a Web Push subscription is registered via the service worker and stored in `push_subscriptions`. A scheduled API route dispatches push payloads to registered devices using VAPID authentication and the `web-push` npm library.

No new database tables are required — `push_subscriptions`, `medication_logs`, and `notifications` already exist.

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
        NS -->|INSERT notifications\nchannel=in_app + push| DB_NOTIF[(notifications)]
        SA -->|success + first prescription| BANNER[PushPermissionBanner]
    end

    subgraph Push Permission Flow
        BANNER -->|Enable button| REQ[Notification.requestPermission]
        REQ -->|granted| SW[Service Worker\nsubscribe]
        SW -->|subscription object| SUBSAVE[/api/push/subscribe]
        SUBSAVE -->|INSERT| DB_PUSH[(push_subscriptions)]
    end

    subgraph Client Polling
        LAYOUT[app/(app)/layout.tsx] -->|renders| NAVTAB[BottomNav\n4th tab: Notifications]
        NAVTAB -->|useNotifications hook| HOOK[useNotifications\nsetInterval 60s]
        HOOK -->|Supabase client read\nscheduled_for<=now, sent_at IS NULL| DB_NOTIF
        HOOK -->|Server Action\nmarkDelivered| SA2[notifications/actions.ts\nmarkDelivered]
        SA2 -->|UPDATE sent_at=now()| DB_NOTIF
        HOOK -->|unreadCount| NAVTAB
    end

    subgraph Notification Page
        NAVTAB -->|navigate| PAGE[/notifications\nNotificationPage]
        PAGE -->|renders| CARD[NotificationCard\nexpandable]
        CARD -->|useRxImage| RXAPI[RxImage API]
        RXAPI -->|imageUrl| CARD
        CARD -->|Take now / Skip| LOGACTION[logMedicationAction SA]
        LOGACTION -->|INSERT| DB_LOGS[(medication_logs)]
        CARD -->|markRead SA| SA3[notifications/actions.ts\nmarkRead / markAllRead]
        SA3 -->|UPDATE is_read=true| DB_NOTIF
    end

    subgraph Push Dispatch
        CRON[Vercel Cron\n/api/push/send] -->|query due push notifications| DB_NOTIF
        CRON -->|read subscriptions| DB_PUSH
        CRON -->|web-push.sendNotification| PUSHSVC[Push Service\nFCM/APNs]
        PUSHSVC -->|push event| SWPUSH[Service Worker\npush handler]
        SWPUSH -->|showNotification| DEVICE[Device Notification]
        DEVICE -->|click| SWCLICK[Service Worker\nnotificationclick]
        SWCLICK -->|navigate| PAGE
    end

    subgraph Reminder Toggle
        MEDLIST[MedicationList] -->|ReminderToggle| TOGGLE[toggle UI]
        TOGGLE -->|toggleMedicationReminder SA| SA4[notifications/actions.ts\ntoggleMedicationReminder]
        SA4 -->|UPDATE reminder_enabled| DB_MEDS
        SA4 -->|scheduleReminders if enabling| NS
    end
```

### Key Design Decisions

**Why extend step 4 rather than replace it?** `createFromExtraction` already has a partial medications write. Extending it in-place keeps the transaction boundary clear: document → analysis → prescriptions → medications → notifications, all best-effort after step 2.

**Why a Server Action for `markDelivered` but Supabase client for the read?** The read is a simple SELECT that benefits from the client-side Supabase realtime connection and avoids a round-trip through Next.js. The write (`sent_at = now()`) must be a Server Action to avoid exposing service-role logic client-side and to ensure auth is validated server-side.

**Why polling instead of Supabase Realtime?** Realtime requires a persistent WebSocket and subscription management. Polling at 60s is simpler, matches the requirement exactly, and avoids the complexity of channel lifecycle management in a Next.js App Router layout.

**Why a 4th bottom nav tab instead of a floating bell?** The floating bell approach required complex z-index management and overlapped with page content on small screens. A dedicated tab provides a consistent, predictable location that matches user expectations from other mobile apps (WhatsApp, Telegram, etc.). The tab is visible only on primary routes (dashboard, timeline, settings, notifications) where `BottomNav` is shown.

**Why dual-channel notifications (in_app + push)?** In-app notifications work only when the app is open. Push notifications reach users even when the app is closed or backgrounded. Creating both channels for each reminder ensures users never miss a dose regardless of app state. The `channel` column distinguishes delivery mechanisms while sharing the same notification content.

**Why VAPID instead of FCM/APNs directly?** VAPID (Voluntary Application Server Identification) is the Web Push standard that works across all browsers and platforms without vendor-specific SDKs. The browser's push service (FCM for Chrome, APNs for Safari, etc.) handles the platform-specific delivery automatically. We only need to provide VAPID keys and use the standard Web Push protocol.

**Why `web-push` npm library?** It's the de facto standard for Web Push in Node.js, handles VAPID signing and payload encryption automatically, and has 2M+ weekly downloads with active maintenance. Implementing the Web Push protocol manually would require complex cryptography and is error-prone.

**Why expandable cards instead of a drawer?** The drawer pattern (NotificationPanel) was designed for quick glances at notification titles. With the addition of medicine images, dosage details, and action buttons, each notification needs more vertical space. Expandable cards allow users to scan titles quickly (collapsed state) and dive into details only when needed (expanded state), reducing cognitive load and scroll distance.

**Why write to `medication_logs` from the client?** The "Take now" / "Skip" actions are user-initiated events that should be logged immediately with the client's local timestamp (`action_time = now()`). A Server Action provides the auth boundary and RLS enforcement while keeping the write path simple. The action is idempotent — tapping twice creates two log entries, which is correct (user took the medicine twice).

**Why prompt for push permission after first prescription save?** This is the moment of highest user intent — they've just uploaded a prescription and are most likely to want reminders. Prompting earlier (on login, on app install) has lower conversion rates because the user hasn't yet experienced the value. Prompting later (after multiple prescriptions) misses the opportunity to enable reminders for the first medication batch.

---

## Components and Interfaces

### New Files

| File | Purpose |
|------|---------|
| `lib/frequency.ts` | Pure M/A/N parser + next-occurrence calculator |
| `services/notifications.service.ts` | `scheduleReminders`, `getDueNotifications`, `markDelivered`, `markRead`, `markAllRead`, `toggleReminder` |
| `hooks/useNotifications.ts` | Polling hook, unread count, notifications list |
| `hooks/useRxImage.ts` | RxImage API fetch + session cache (from prescription-enrichment spec) |
| `components/features/notifications/NotificationCard.tsx` | Expandable notification card with medicine image and action buttons |
| `components/features/notifications/PushPermissionBanner.tsx` | Post-save push permission prompt |
| `components/features/upload/RxImageSlot.tsx` | Medicine image slot component (from prescription-enrichment spec) |
| `app/(app)/notifications/page.tsx` | Full authenticated page for notification list |
| `app/(app)/notifications/actions.ts` | Server Actions: `markRead`, `markAllRead`, `markDelivered`, `logMedicationAction` |
| `app/api/push/subscribe/route.ts` | POST endpoint to save push subscriptions |
| `app/api/push/send/route.ts` | Cron-triggered push dispatcher |
| `public/sw.js` | Service worker with `push` and `notificationclick` handlers |
| `docs/migrations/003_medications_rls.sql` | RLS migration for medications table |

### Modified Files

| File | Change |
|------|--------|
| `services/documents.service.ts` | Extend step 4 to add `reminder_enabled`, `timing`, `reminder_times`; add step 5 to call `scheduleReminders` |
| `components/layout/BottomNav.tsx` | Add 4th tab (bell icon) that navigates to `/notifications` with unread badge |
| `app/(app)/layout.tsx` | Remove floating `NotificationBell`; fetch initial unread count for `BottomNav` |
| `components/features/records/MedicationList.tsx` | Add `ReminderToggle` per medication row |
| `app/(app)/dashboard/page.tsx` | Conditionally render `PushPermissionBanner` after first prescription save |

### Component Tree

```
app/(app)/layout.tsx (Server Component)
├── BottomNav (Client Component — 'use client')
│   └── useNotifications() hook (unread count only)
│
app/(app)/notifications/page.tsx (Server Component)
└── NotificationCard[] (Client Component — 'use client')
    ├── useRxImage() hook
    ├── logMedicationAction Server Action
    └── markRead Server Action

app/(app)/dashboard/page.tsx (Server Component)
└── PushPermissionBanner (Client Component — 'use client')
    └── subscribeToPush() client function → /api/push/subscribe

public/sw.js (Service Worker)
├── push event handler → showNotification()
└── notificationclick event handler → navigate to /notifications
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
   * Insert TWO notifications rows per reminder time for a medication:
   * one with channel='in_app', one with channel='push'.
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
   * Fetch recent in_app notifications for the page (sent_at IS NOT NULL),
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
  /** Notifications to display on the page (sent_at IS NOT NULL, ordered by scheduled_for DESC) */
  notifications: NotificationRow[]
  /** Count of unread notifications (is_read = false, sent_at IS NOT NULL) */
  unreadCount: number
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

### `BottomNav` Component — 4th Tab Addition

The existing `BottomNav` component in `components/layout/BottomNav.tsx` is extended to add a 4th tab:

```tsx
// components/layout/BottomNav.tsx — additions only
const BellIcon = ({ active }: { active: boolean }) => (
  <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',          href: '/dashboard',      icon: (a) => <HomeIcon     active={a} /> },
  { label: 'Timeline',      href: '/timeline',       icon: (a) => <TimelineIcon active={a} /> },
  { label: 'Notifications', href: '/notifications',  icon: (a) => <BellIcon     active={a} /> },  // NEW
  { label: 'Profile',       href: '/settings',       icon: (a) => <ProfileIcon  active={a} /> },
]

const PRIMARY_PATHS = ['/dashboard', '/timeline', '/notifications', '/settings']  // added /notifications
```

**Badge rendering:**

The `BottomNav` component receives `unreadCount` as a prop from the layout. When rendering the Notifications tab, if `unreadCount > 0`, a badge `<span>` is rendered over the icon:

```tsx
// Inside the Link for the Notifications tab
{unreadCount > 0 && (
  <span
    className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-semibold flex items-center justify-center"
    aria-label={`${unreadCount} unread notifications`}
  >
    {unreadCount > 99 ? '99+' : unreadCount}
  </span>
)}
```

**Updated `app/(app)/layout.tsx`:**

```tsx
// app/(app)/layout.tsx — changes only
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // ... existing setup logic ...

  // Fetch initial unread count for BottomNav badge
  const { data: initialCount } = await notificationsService.getUnreadCount(user.id)

  return (
    <PageLayout header={null} footer={null} className="pb-20 sm:pb-0">
      {children}
      <BottomNav unreadCount={initialCount ?? 0} />  {/* NEW PROP */}
      <AppDrawerNav />
    </PageLayout>
  )
}
```

The floating bell element is removed entirely — no `<NotificationBell>` component in the layout.

### `NotificationPage` Component

```tsx
// app/(app)/notifications/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { notificationsService } from '@/services/notifications.service'
import { PageHeader, EmptyState } from '@/components/ui'
import { NotificationCard } from '@/components/features/notifications/NotificationCard'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: notifications } = await notificationsService.getRecentNotifications(user.id)

  return (
    <>
      <PageHeader title="Notifications" backHref="/dashboard" />
      <div className="px-4 py-5 flex flex-col gap-3">
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} userId={user.id} />
          ))
        ) : (
          <EmptyState
            icon={<BellIcon />}
            heading="No notifications yet"
            description="Medication reminders will appear here when it's time to take your medicines."
          />
        )}
      </div>
    </>
  )
}
```

The page is a Server Component that fetches notifications server-side and passes them to `NotificationCard` client components.

### `NotificationCard` Component

```tsx
// components/features/notifications/NotificationCard.tsx
'use client'

interface NotificationCardProps {
  notification: NotificationRow
  userId: string
}

export function NotificationCard({ notification, userId }: NotificationCardProps)
```

**State:**
- `expanded: boolean` — whether the card is expanded (default: false)
- `actionLoading: boolean` — whether a "Take now" / "Skip" action is in progress
- `error: string | null` — inline error from failed action

**Collapsed state renders:**
- Medicine name (from `notification.title`)
- Timing slot badge (e.g. "Morning dose")
- Relative time (e.g. "2 hours ago" from `notification.scheduled_for`)
- Unread indicator: `border-l-2 border-primary bg-accent-subtle` when `is_read = false`
- Tap handler: sets `expanded = true`

**Expanded state renders:**
- All of the above, plus:
- `<RxImageSlot medicineName={medicineName} width={88} height={100} />` (from prescription-enrichment spec)
- Dosage and timing slot (e.g. "500mg — Morning dose")
- Primary button: "Take now" → calls `logMedicationAction(notification.data.medication_id, 'taken', notification.scheduled_for)`
- Secondary button: "Skip" → calls `logMedicationAction(notification.data.medication_id, 'skipped', notification.scheduled_for)`
- After either action succeeds: calls `markRead(notification.id)` and sets `is_read = true` locally

**Medicine name extraction:**

The `notification.title` format is `"Time to take <medicine_name>"`. The component extracts the medicine name via:

```ts
const medicineName = notification.title.replace('Time to take ', '')
```

**Action buttons:**

Both buttons use the `logMedicationAction` Server Action from `app/(app)/notifications/actions.ts`:

```ts
// app/(app)/notifications/actions.ts
'use server'

export async function logMedicationAction(
  medicationId: string,
  action: 'taken' | 'skipped',
  scheduledTime: string
): Promise<{ error: string | null }>
```

The Server Action:
1. Validates auth via `supabase.auth.getUser()`
2. Inserts a row into `medication_logs` with `medication_id`, `user_id`, `action`, `scheduled_time`, `action_time = now()`
3. Returns `{ error: null }` on success or `{ error: message }` on failure

### `PushPermissionBanner` Component

```tsx
// components/features/notifications/PushPermissionBanner.tsx
'use client'

interface PushPermissionBannerProps {
  userId: string
  onDismiss: () => void
}

export function PushPermissionBanner({ userId, onDismiss }: PushPermissionBannerProps)
```

**Rendering:**

A banner with `bg-accent-subtle border border-accent-hover rounded-2xl p-4` containing:
- Bell icon
- Heading: "Enable medication reminders"
- Body: "Get notified when it's time to take your medicines, even when the app is closed."
- Primary button: "Enable" → calls `handleEnable()`
- Secondary button: "Not now" → calls `onDismiss()`

**`handleEnable()` logic:**

```ts
const handleEnable = async () => {
  // 1. Check if Notification API is supported
  if (!('Notification' in window)) {
    setError('Push notifications are not supported in this browser')
    return
  }

  // 2. Request permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    onDismiss()  // user denied or dismissed
    return
  }

  // 3. Register service worker if not already registered
  const registration = await navigator.serviceWorker.ready

  // 4. Subscribe to push
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
  })

  // 5. Send subscription to server
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      subscription: subscription.toJSON(),
      deviceInfo: navigator.userAgent,
    }),
  })

  if (!response.ok) {
    setError('Failed to save push subscription')
    return
  }

  onDismiss()  // success
}
```

**Placement in `app/(app)/dashboard/page.tsx`:**

The banner is conditionally rendered at the top of the dashboard content sheet when:
- `Notification.permission === 'default'` (not yet granted or denied)
- The user has at least one prescription (checked via a query to `documents` table with `document_type = 'prescription'`)
- The banner has not been dismissed in the current session (tracked via `useState` in the page component)

```tsx
// app/(app)/dashboard/page.tsx — additions only
const [showPushBanner, setShowPushBanner] = useState(false)

useEffect(() => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default' && prescriptionCount > 0) {
      setShowPushBanner(true)
    }
  }
}, [prescriptionCount])

// In the render:
{showPushBanner && (
  <PushPermissionBanner userId={user.id} onDismiss={() => setShowPushBanner(false)} />
)}
```

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

### `/api/push/subscribe` Route

```ts
// app/api/push/subscribe/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subscription, deviceInfo } = await request.json()

  const { error } = await supabase.from('push_subscriptions').insert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth_key: subscription.keys.auth,
    device_info: deviceInfo,
    is_active: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
```

**Request body:**
```json
{
  "userId": "uuid",
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "base64-encoded-key",
      "auth": "base64-encoded-key"
    }
  },
  "deviceInfo": "Mozilla/5.0 ..."
}
```

### `/api/push/send` Route

```ts
// app/api/push/send/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// Configure VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // 1. Fetch due push notifications
  const { data: dueNotifications } = await supabase
    .from('notifications')
    .select('id, user_id, title, body, data')
    .eq('channel', 'push')
    .lte('scheduled_for', new Date().toISOString())
    .is('sent_at', null)
    .limit(100)

  if (!dueNotifications || dueNotifications.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  // 2. Group by user_id
  const notificationsByUser = dueNotifications.reduce((acc, notif) => {
    if (!acc[notif.user_id]) acc[notif.user_id] = []
    acc[notif.user_id].push(notif)
    return acc
  }, {} as Record<string, typeof dueNotifications>)

  let sentCount = 0
  const failedNotificationIds: string[] = []

  // 3. For each user, fetch active subscriptions and send
  for (const [userId, notifications] of Object.entries(notificationsByUser)) {
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth_key')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (!subscriptions || subscriptions.length === 0) continue

    for (const notification of notifications) {
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        data: notification.data,
      })

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth_key,
              },
            },
            payload
          )
          sentCount++
        } catch (error: any) {
          // Handle 410 Gone or 404 Not Found — subscription expired
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .update({ is_active: false })
              .eq('id', sub.id)
          }
          failedNotificationIds.push(notification.id)
        }
      }

      // Mark notification as sent if at least one subscription succeeded
      if (!failedNotificationIds.includes(notification.id)) {
        await supabase
          .from('notifications')
          .update({ sent_at: new Date().toISOString() })
          .eq('id', notification.id)
      }
    }
  }

  return NextResponse.json({ sent: sentCount, failed: failedNotificationIds.length })
}
```

**Cron configuration in `vercel.json`:**

```json
{
  "crons": [
    {
      "path": "/api/push/send",
      "schedule": "* * * * *"
    }
  ]
}
```

This runs the push dispatcher every minute. The route queries for due notifications, groups them by user, fetches active subscriptions, and dispatches payloads using the `web-push` library.

### Service Worker (`public/sw.js`)

```js
// public/sw.js

// Install event — cache static assets (optional, not required for push)
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Activate event — clean up old caches (optional)
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Push event — show notification
self.addEventListener('push', (event) => {
  if (!event.data) return

  const payload = event.data.json()
  const { title, body, icon, badge, data } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icon-192.png',
      badge: badge || '/badge-72.png',
      data,
      tag: data?.medication_id || 'medication-reminder',
      requireInteraction: true,  // notification stays until user interacts
    })
  )
})

// Notification click event — open or focus app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/notifications') && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/notifications')
      }
    })
  )
})
```

**Service worker registration in `app/layout.tsx`:**

```tsx
// app/layout.tsx — add to the root layout
'use client'

useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service worker registration failed:', error)
    })
  }
}, [])
```

### VAPID Key Generation

Generate VAPID keys using the `web-push` CLI:

```bash
npx web-push generate-vapid-keys
```

Add to `.env.local`:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BG...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:your-email@example.com
CRON_SECRET=random-secret-string
```

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

After the medications insert succeeds, schedule dual-channel notifications (in_app + push) for each medication that has `reminder_enabled = true`:

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

**Dual-channel scheduling in `notificationsService.scheduleReminders`:**

For each reminder time, the service creates TWO notification rows:

```ts
// Inside scheduleReminders — pseudocode
for (const timeStr of reminderTimes) {
  const scheduledFor = computeNextOccurrence(timeStr)
  const title = `Time to take ${medicationName}`
  const body = `Time to take ${medicationName} ${dosage ?? ''} — ${timeToSlotLabel(timeStr)} dose`
  const data = { medication_id: medicationId, profile_id: profileId, slot: timeToSlotLabel(timeStr) }

  // Insert in_app notification
  await supabase.from('notifications').insert({
    user_id: userId,
    profile_id: profileId,
    type: 'medication_reminder',
    title,
    body,
    data,
    channel: 'in_app',
    scheduled_for: scheduledFor,
  })

  // Insert push notification
  await supabase.from('notifications').insert({
    user_id: userId,
    profile_id: profileId,
    type: 'medication_reminder',
    title,
    body,
    data,
    channel: 'push',
    scheduled_for: scheduledFor,
  })
}
```

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

### Property 17: Dual-channel scheduling creates exactly 2N notifications

*For any* medication with `N` reminder times, calling `scheduleReminders` SHALL create exactly `2N` notification rows: `N` with `channel = 'in_app'` and `N` with `channel = 'push'`.

**Validates: Requirements 10.1**

---

### Property 18: Push notification data contains required fields

*For any* push channel notification row, the `data` field SHALL contain `medication_id` and `slot` keys.

**Validates: Requirements 10.2**

---

### Property 19: Push payload matches notification row

*For any* push notification row, the Web Push payload sent to the device SHALL contain `title`, `body`, `icon`, and `data` fields matching the notification row's values.

**Validates: Requirements 10.3**

---

### Property 20: Expired subscriptions are marked inactive

*For any* push subscription that returns a `410 Gone` or `404 Not Found` HTTP status during dispatch, the corresponding `push_subscriptions` row SHALL have `is_active` set to `false`.

**Validates: Requirements 10.8**

---

### Property 21: Service worker shows notification on push event

*For any* valid push event received by the service worker, `self.registration.showNotification` SHALL be called with the `title` and `body` from the push payload.

**Validates: Requirements 10.9**

---

### Property 22: Notification click navigates to /notifications

*For any* notification click event in the service worker, the handler SHALL either focus an existing window at `/notifications` or open a new window at `/notifications`.

**Validates: Requirements 10.10**

---

### Property 23: BottomNav badge displays correct count

*For any* unread count `n` where `n > 0` and `n ≤ 99`, the Notifications tab in `BottomNav` SHALL render a badge element containing exactly the string representation of `n`. For any `n > 99`, the badge SHALL contain `"99+"`. For `n = 0`, no badge element SHALL be rendered.

**Validates: Requirements 11.2, 11.3, 11.4**

---

### Property 24: Expanded card shows RxImage

*For any* notification card in expanded state, the rendered output SHALL include an `<img>` element with `src` equal to the RxImage API result for the medicine name, or a `MedicinePacket` SVG fallback if no image is available.

**Validates: Requirements 12.3**

---

### Property 25: "Take now" writes to medication_logs with action='taken'

*For any* notification card where the user taps "Take now", a row SHALL be inserted into `medication_logs` with `action = 'taken'`, `medication_id` from the notification's `data` field, and `scheduled_time` equal to the notification's `scheduled_for` value.

**Validates: Requirements 12.4**

---

### Property 26: "Skip" writes to medication_logs with action='skipped'

*For any* notification card where the user taps "Skip", a row SHALL be inserted into `medication_logs` with `action = 'skipped'`, `medication_id` from the notification's `data` field, and `scheduled_time` equal to the notification's `scheduled_for` value.

**Validates: Requirements 12.5**

---

### Property 27: Dose action marks notification as read

*For any* notification card where the user taps "Take now" or "Skip" and the `medication_logs` insert succeeds, the notification's `is_read` field SHALL be set to `true`.

**Validates: Requirements 12.6**

---

### Property 28: Push permission prompt shows after first prescription

*For any* user who has saved exactly one prescription and has `Notification.permission === 'default'`, the `PushPermissionBanner` SHALL be rendered on the dashboard page.

**Validates: Requirements 13.1**

---

### Property 29: Push subscription saved after permission granted

*For any* user who taps "Enable" on the `PushPermissionBanner` and grants permission, a row SHALL be inserted into `push_subscriptions` with `user_id`, `endpoint`, `p256dh`, `auth_key`, and `device_info` populated.

**Validates: Requirements 13.4**

---

### Property 30: Push permission prompt not shown when already decided

*For any* user where `Notification.permission` is `'granted'` or `'denied'`, the `PushPermissionBanner` SHALL NOT be rendered.

**Validates: Requirements 13.7**

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
- Both `in_app` and `push` channel inserts are wrapped in the same try/catch — if either fails, both are skipped for that reminder time

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

### `logMedicationAction` Failure

When "Take now" or "Skip" fails:
1. The action button shows a loading spinner during the request
2. If the Server Action returns an error, the spinner is replaced with an inline error message below the buttons
3. The notification remains in its current `is_read` state (not marked as read)
4. The user can retry the action

### Push Subscription Save Failure

If `/api/push/subscribe` returns an error:
- The error is logged client-side via `console.error`
- The `PushPermissionBanner` shows an inline error message: "Failed to save push subscription. Please try again."
- The banner remains visible so the user can retry
- This is a non-fatal error — in-app notifications will still work

### Push Dispatch Failure

If `web-push.sendNotification` throws an error:
- The error is logged server-side in the `/api/push/send` route
- If the error is a `410 Gone` or `404 Not Found`, the subscription is marked `is_active = false`
- The notification row's `sent_at` is NOT updated (it will be retried on the next cron run)
- Other subscriptions for the same user are still attempted
- The cron response includes a `failed` count for monitoring

### Service Worker Registration Failure

If `navigator.serviceWorker.register('/sw.js')` fails:
- The error is logged client-side via `console.error`
- Push notifications will not work, but in-app notifications will still function
- No user-facing error is shown (silent degradation)

### RxImage Fetch Failure in NotificationCard

If `useRxImage` returns `{ imageUrl: null, error: true }`:
- The `NotificationCard` renders the `MedicinePacket` SVG fallback
- No error message is shown to the user
- The card remains fully functional (action buttons still work)

---

## Testing Strategy

### Sanity Checks (Manual)

Per the project convention (matching Spec 1), no automated test files are created. The following sanity checks verify the implementation:

1. **Frequency parser** — In a Node REPL or quick script, call `parseFrequency('1-0-1')` and confirm `['08:00', '21:00']` is returned. Call `parseFrequency('twice daily')` and confirm `[]` is returned.

2. **Medication write** — Upload a prescription with a medicine that has frequency `"1-1-1"`. Check the `medications` table in Supabase: confirm `reminder_enabled = true`, `timing = ['08:00','13:00','21:00']`, `reminder_times = ['08:00','13:00','21:00']`.

3. **Dual-channel notification scheduling** — After the same upload, check the `notifications` table: confirm 6 rows exist for that medication (3 with `channel = 'in_app'`, 3 with `channel = 'push'`), all with `type = 'medication_reminder'`, and `scheduled_for` values in the future.

4. **In-app polling** — Set an `in_app` notification's `scheduled_for` to `now() - interval '1 minute'` in Supabase. Open the app and wait up to 60 seconds. Confirm `sent_at` is set on that row and the BottomNav badge increments.

5. **Notifications page** — Navigate to `/notifications`. Confirm the page renders the notification list with expandable cards. Tap a card to expand it. Confirm the medicine image (or fallback) is shown, along with dosage and action buttons.

6. **Take now action** — Tap "Take now" on an expanded card. Confirm a row is inserted into `medication_logs` with `action = 'taken'`, `medication_id` matching the notification's `data.medication_id`, and `scheduled_time` matching the notification's `scheduled_for`. Confirm the notification is marked `is_read = true`.

7. **Skip action** — Tap "Skip" on an expanded card. Confirm a row is inserted into `medication_logs` with `action = 'skipped'`. Confirm the notification is marked `is_read = true`.

8. **Mark as read** — Tap a collapsed notification card. Confirm `is_read = true` in Supabase and the BottomNav badge decrements.

9. **Reminder toggle** — Open a prescription's medication list. Toggle a reminder off. Confirm `reminder_enabled = false` in Supabase. Toggle it back on. Confirm `reminder_enabled = true` and new notification rows (both `in_app` and `push`) are created.

10. **Push permission prompt** — Upload a prescription as a new user. Confirm the `PushPermissionBanner` appears on the dashboard. Tap "Enable". Confirm the browser's permission prompt appears. Grant permission. Confirm a row is inserted into `push_subscriptions` with `endpoint`, `p256dh`, `auth_key`, and `device_info` populated.

11. **Push notification dispatch** — Set a `push` notification's `scheduled_for` to `now() - interval '1 minute'` in Supabase. Trigger the `/api/push/send` cron route manually (or wait for the next cron run). Confirm `sent_at` is set on the notification row. Confirm a push notification appears on the device.

12. **Service worker notification click** — Tap a push notification on the device. Confirm the app opens (or focuses if already open) and navigates to `/notifications`.

13. **Expired subscription handling** — Manually set a `push_subscriptions` row's `endpoint` to an invalid URL. Trigger the push dispatcher. Confirm the subscription is marked `is_active = false` after the dispatch fails with a 410 or 404 status.

14. **RLS** — Log in as a second account that shares a family group. Confirm the medications and notifications for the first account's profiles are visible. Confirm notifications for the second account's own `user_id` are not visible to the first account.

15. **Badge cap** — Manually insert 100 unread notification rows for a user. Confirm the BottomNav badge shows `"99+"`.

16. **Build check** — Run `next build` or `tsc --noEmit` and confirm zero TypeScript errors.

17. **VAPID key validation** — Confirm `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` are set in `.env.local`. Confirm the public key is accessible client-side and the private key is never exposed in client bundles.
