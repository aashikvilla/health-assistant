/**
 * Notification Server Actions
 *
 * Server-side actions for notification management and medication logging.
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { notificationsService } from '@/services/notifications.service'

/**
 * Mark a single notification as read.
 * Uses optimistic updates on the client side.
 */
export async function markRead(
  id: string,
  userId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== userId) {
      return { error: 'Unauthorized' }
    }

    const result = await notificationsService.markRead(id, userId)
    
    if (!result.success) {
      return { error: result.error || 'Failed to mark notification as read' }
    }

    return { error: null }
  } catch (err) {
    console.error('markRead error:', err)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Mark all notifications as read for the current user.
 * Uses optimistic updates on the client side.
 */
export async function markAllRead(
  userId: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.id !== userId) {
      return { error: 'Unauthorized' }
    }

    const result = await notificationsService.markAllRead(userId)
    
    if (!result.success) {
      return { error: result.error || 'Failed to mark all notifications as read' }
    }

    return { error: null }
  } catch (err) {
    console.error('markAllRead error:', err)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Mark notifications as delivered (set sent_at = now()).
 * Called by the polling hook after fetching due notifications.
 */
export async function markDelivered(
  ids: string[]
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Unauthorized' }
    }

    const result = await notificationsService.markDelivered(ids)
    
    if (!result.success) {
      return { error: result.error || 'Failed to mark notifications as delivered' }
    }

    return { error: null }
  } catch (err) {
    console.error('markDelivered error:', err)
    return { error: 'An unexpected error occurred' }
  }
}

/**
 * Log a medication action (taken or skipped).
 * Inserts a row into medication_logs table.
 */
export async function logMedicationAction(
  medicationId: string,
  action: 'taken' | 'skipped',
  scheduledTime: string
): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Unauthorized' }
    }

    const { error } = await supabase.from('medication_logs').insert({
      medication_id: medicationId,
      user_id: user.id,
      action,
      scheduled_time: scheduledTime,
      action_time: new Date().toISOString(),
    })

    if (error) {
      console.error('logMedicationAction error:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('logMedicationAction exception:', err)
    return { error: 'An unexpected error occurred' }
  }
}
