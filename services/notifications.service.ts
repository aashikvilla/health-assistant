// services/notifications.service.ts
// Notification scheduling and management service

import type { ApiResponse } from '@/types'
import type { NotificationRow } from '@/types/notifications'

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
  async scheduleReminders(input: ScheduleRemindersInput): Promise<ApiResponse<null>> {
    const { userId, profileId, medicationId, medicationName, dosage, reminderTimes } = input

    if (!reminderTimes || reminderTimes.length === 0) {
      return { data: null, error: null, success: true }
    }

    try {
      const { createClient } = await import('@/lib/supabase/server')
      const { computeNextOccurrence, timeToSlotLabel } = await import('@/lib/frequency')
      const supabase = await createClient()

      const notificationsToInsert = []

      for (const timeStr of reminderTimes) {
        const scheduledFor = computeNextOccurrence(timeStr)
        const slot = timeToSlotLabel(timeStr)
        const title = `Time to take ${medicationName}`
        const body = `Time to take ${medicationName} ${dosage ?? ''} — ${slot} dose`
        const data = {
          medication_id: medicationId,
          profile_id: profileId,
          slot,
        }

        // Create in_app notification
        notificationsToInsert.push({
          user_id: userId,
          profile_id: profileId,
          type: 'medication_reminder',
          title,
          body,
          data,
          channel: 'in_app',
          scheduled_for: scheduledFor.toISOString(),
        })

        // Create push notification
        notificationsToInsert.push({
          user_id: userId,
          profile_id: profileId,
          type: 'medication_reminder',
          title,
          body,
          data,
          channel: 'push',
          scheduled_for: scheduledFor.toISOString(),
        })
      }

      const { error } = await supabase.from('notifications').insert(notificationsToInsert)

      if (error) {
        console.error('scheduleReminders error:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: null, error: null, success: true }
    } catch (err) {
      console.error('scheduleReminders exception:', err)
      return { data: null, error: String(err), success: false }
    }
  },

  /**
   * Fetch notifications where scheduled_for <= now(), sent_at IS NULL,
   * channel = 'in_app', user_id = userId.
   * Called by the polling hook every 60 seconds.
   */
  async getDueNotifications(userId: string): Promise<ApiResponse<NotificationRow[]>> {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('channel', 'in_app')
        .lte('scheduled_for', new Date().toISOString())
        .is('sent_at', null)
        .order('scheduled_for', { ascending: true })

      if (error) {
        console.error('getDueNotifications error:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: (data as NotificationRow[]) || [], error: null, success: true }
    } catch (err) {
      console.error('getDueNotifications exception:', err)
      return { data: null, error: String(err), success: false }
    }
  },

  /**
   * Set sent_at = now() on a list of notification IDs.
   * Called by the polling hook after getDueNotifications returns rows.
   */
  async markDelivered(ids: string[]): Promise<ApiResponse<null>> {
    if (!ids || ids.length === 0) {
      return { data: null, error: null, success: true }
    }

    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      const { error } = await supabase
        .from('notifications')
        .update({ sent_at: new Date().toISOString() })
        .in('id', ids)

      if (error) {
        console.error('markDelivered error:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: null, error: null, success: true }
    } catch (err) {
      console.error('markDelivered exception:', err)
      return { data: null, error: String(err), success: false }
    }
  },

  /**
   * Set is_read = true on a single notification.
   */
  async markRead(id: string, userId: string): Promise<ApiResponse<null>> {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('markRead error:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: null, error: null, success: true }
    } catch (err) {
      console.error('markRead exception:', err)
      return { data: null, error: String(err), success: false }
    }
  },

  /**
   * Set is_read = true on all in_app notifications for a user where is_read = false.
   */
  async markAllRead(userId: string): Promise<ApiResponse<null>> {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('channel', 'in_app')
        .eq('is_read', false)

      if (error) {
        console.error('markAllRead error:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: null, error: null, success: true }
    } catch (err) {
      console.error('markAllRead exception:', err)
      return { data: null, error: String(err), success: false }
    }
  },

  /**
   * Fetch recent in_app notifications for the page (sent_at IS NOT NULL),
   * ordered by scheduled_for DESC, limit 50.
   */
  async getRecentNotifications(userId: string): Promise<ApiResponse<NotificationRow[]>> {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('channel', 'in_app')
        .not('sent_at', 'is', null)
        .order('scheduled_for', { ascending: false })
        .limit(50)

      if (error) {
        console.error('getRecentNotifications error:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: (data as NotificationRow[]) || [], error: null, success: true }
    } catch (err) {
      console.error('getRecentNotifications exception:', err)
      return { data: null, error: String(err), success: false }
    }
  },

  /**
   * Get the count of unread in_app notifications (is_read = false, sent_at IS NOT NULL).
   * Used for the initial server-fetched count in the layout.
   */
  async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('channel', 'in_app')
        .eq('is_read', false)
        .not('sent_at', 'is', null)

      if (error) {
        console.error('getUnreadCount error:', error)
        return { data: null, error: error.message, success: false }
      }

      return { data: count ?? 0, error: null, success: true }
    } catch (err) {
      console.error('getUnreadCount exception:', err)
      return { data: null, error: String(err), success: false }
    }
  },
}
