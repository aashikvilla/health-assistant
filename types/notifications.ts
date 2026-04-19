// types/notifications.ts
// Notification and medication reminder types

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
