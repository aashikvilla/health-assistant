/**
 * NotificationCard Component
 *
 * Expandable notification card for medication reminders.
 * - Collapsed state: medicine name, slot badge, relative time, unread indicator
 * - Expanded state: adds RxImageSlot, dosage, "Take now" and "Skip" buttons
 */

'use client'

import { useState } from 'react'
import type { NotificationRow } from '@/types'
import { Badge, Button } from '@/components/ui'
import { RxImageSlot } from '@/components/features/upload/RxImageSlot'
import { markRead, logMedicationAction } from '@/app/(app)/notifications/actions'

interface NotificationCardProps {
  notification: NotificationRow
  userId: string
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "Just now")
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

export function NotificationCard({ notification, userId }: NotificationCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [isRead, setIsRead] = useState(notification.is_read)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Extract medicine name from title: "Time to take <medicine_name>"
  const medicineName = notification.title.replace('Time to take ', '')
  
  // Extract slot from data or body
  const slot = notification.data?.slot || 'Morning'
  
  // Extract dosage from body if present
  // Body format: "Time to take {name} {dosage} — {slot} dose"
  const dosageMatch = notification.body.match(/Time to take .+? (.+?) — .+ dose/)
  const dosage = dosageMatch ? dosageMatch[1] : null

  const handleExpand = async () => {
    setExpanded(!expanded)
    
    // Mark as read when expanding (if not already read)
    if (!expanded && !isRead) {
      setIsRead(true)
      const result = await markRead(notification.id, userId)
      if (result.error) {
        // Revert optimistic update on error
        setIsRead(false)
      }
    }
  }

  const handleAction = async (action: 'taken' | 'skipped') => {
    if (!notification.data?.medication_id) {
      setError('Medication ID not found')
      return
    }

    setActionLoading(true)
    setError(null)

    const result = await logMedicationAction(
      notification.data.medication_id,
      action,
      notification.scheduled_for
    )

    setActionLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    // Mark as read after successful action
    if (!isRead) {
      setIsRead(true)
      await markRead(notification.id, userId)
    }
  }

  return (
    <button
      onClick={handleExpand}
      className={`w-full text-left p-4 rounded-2xl transition-all ${
        !isRead
          ? 'border-l-2 border-primary bg-accent-subtle'
          : 'bg-surface border border-border'
      }`}
    >
      {/* Collapsed state - always visible */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-text-primary">{medicineName}</div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info" size="sm">
              {slot}
            </Badge>
            <span className="text-xs text-text-muted">
              {formatRelativeTime(notification.scheduled_for)}
            </span>
          </div>
        </div>
        {!isRead && (
          <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" aria-label="Unread" />
        )}
      </div>

      {/* Expanded state - additional content */}
      {expanded && (
        <div className="mt-4 space-y-4" onClick={(e) => e.stopPropagation()}>
          {/* Medicine image */}
          <div className="flex justify-center">
            <RxImageSlot medicineName={medicineName} width={88} height={100} />
          </div>

          {/* Dosage and slot */}
          {dosage && (
            <div className="text-sm text-text-muted text-center">
              {dosage} — {slot} dose
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => handleAction('taken')}
              disabled={actionLoading}
              className="flex-1"
            >
              {actionLoading ? 'Logging...' : 'Take now'}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleAction('skipped')}
              disabled={actionLoading}
              className="flex-1"
            >
              Skip
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-error text-center">{error}</div>
          )}
        </div>
      )}
    </button>
  )
}
