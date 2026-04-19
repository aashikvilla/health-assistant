/**
 * useNotifications Hook
 *
 * Polling hook that fetches due notifications every 60 seconds,
 * marks them as delivered, and maintains unread count.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NotificationRow } from '@/types'
import { markDelivered, markRead as markReadAction, markAllRead as markAllReadAction } from '@/app/(app)/notifications/actions'

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
  initialCount: number = 0
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [unreadCount, setUnreadCount] = useState(initialCount)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  /**
   * Fetch notifications that have been delivered (sent_at IS NOT NULL)
   * for display on the notifications page.
   */
  const fetchDeliveredNotifications = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('channel', 'in_app')
        .not('sent_at', 'is', null)
        .order('scheduled_for', { ascending: false })
        .limit(50)

      if (fetchError) {
        console.error('fetchDeliveredNotifications error:', fetchError)
        setError(fetchError.message)
        return
      }

      setNotifications(data as NotificationRow[] || [])
      
      // Update unread count based on fetched notifications
      const unread = (data || []).filter(n => !n.is_read).length
      setUnreadCount(unread)
    } catch (err) {
      console.error('fetchDeliveredNotifications exception:', err)
      setError(String(err))
    }
  }, [userId, supabase])

  /**
   * Poll for due notifications and mark them as delivered.
   * This runs every 60 seconds.
   */
  const pollDueNotifications = useCallback(async () => {
    try {
      // 1. Fetch due notifications (scheduled_for <= now, sent_at IS NULL)
      const { data: dueNotifications, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('channel', 'in_app')
        .lte('scheduled_for', new Date().toISOString())
        .is('sent_at', null)
        .order('scheduled_for', { ascending: true })

      if (fetchError) {
        console.error('pollDueNotifications fetch error:', fetchError)
        return
      }

      if (!dueNotifications || dueNotifications.length === 0) {
        return
      }

      // 2. Mark them as delivered via Server Action
      const ids = dueNotifications.map(n => n.id)
      const result = await markDelivered(ids)

      if (result.error) {
        console.error('markDelivered error:', result.error)
        return
      }

      // 3. Increment unread count and add to notifications list
      setUnreadCount(prev => prev + dueNotifications.length)
      
      // 4. Refresh the delivered notifications list
      await fetchDeliveredNotifications()
    } catch (err) {
      console.error('pollDueNotifications exception:', err)
    }
  }, [userId, supabase, fetchDeliveredNotifications])

  /**
   * Mark a single notification as read (optimistic update)
   */
  const markRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    const result = await markReadAction(id, userId)

    if (result.error) {
      // Revert optimistic update on error
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: false } : n))
      )
      setUnreadCount(prev => prev + 1)
      setError(result.error)
    }
  }, [userId])

  /**
   * Mark all notifications as read (optimistic update)
   */
  const markAllRead = useCallback(async () => {
    const previousNotifications = notifications
    const previousUnreadCount = unreadCount

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)

    const result = await markAllReadAction(userId)

    if (result.error) {
      // Revert optimistic update on error
      setNotifications(previousNotifications)
      setUnreadCount(previousUnreadCount)
      setError(result.error)
    }
  }, [userId, notifications, unreadCount])

  // Initial load and polling setup
  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      if (!mounted) return
      
      setLoading(true)
      await fetchDeliveredNotifications()
      await pollDueNotifications()
      setLoading(false)
    }

    initialize()

    // Set up polling interval (60 seconds)
    const interval = setInterval(() => {
      if (mounted) {
        pollDueNotifications()
      }
    }, 60_000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [fetchDeliveredNotifications, pollDueNotifications])

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    loading,
    error,
  }
}
