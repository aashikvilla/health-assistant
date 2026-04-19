/**
 * Test Notifications Page
 * 
 * DEVELOPMENT ONLY - UI for testing the notification system
 * Creates test notifications that appear immediately.
 */

'use client'

import { useState } from 'react'
import { PageHeader, Button } from '@/components/ui'

export default function TestNotificationsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createTestNotifications = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      // Get the first profile ID from the user's profiles
      const profilesResponse = await fetch('/api/profiles')
      if (!profilesResponse.ok) {
        throw new Error('Failed to fetch profiles')
      }
      const profiles = await profilesResponse.json()
      
      if (!profiles || profiles.length === 0) {
        throw new Error('No profiles found. Please create a profile first.')
      }

      const profileId = profiles[0].id

      const response = await fetch('/api/test-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          medicationName: 'Aspirin',
          dosage: '500mg',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test notifications')
      }

      setResult(
        `✅ Success! Created ${data.notifications.length} test notifications.\n\n` +
        `They will appear in the Notifications tab within 60 seconds.\n\n` +
        `Tip: Keep this page open and watch the badge on the Notifications tab update!`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <>
        <PageHeader title="Test Notifications" backHref="/dashboard" />
        <div className="px-4 py-5">
          <div className="p-4 rounded-2xl bg-surface border border-border">
            <p className="text-text-muted">
              This page is only available in development mode.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Test Notifications" backHref="/dashboard" />
      <div className="px-4 py-5 space-y-4">
        <div className="p-4 rounded-2xl bg-accent-subtle border border-accent-hover">
          <h2 className="font-display text-base font-bold text-text-primary mb-2">
            🧪 Development Testing Tool
          </h2>
          <p className="text-sm text-text-muted mb-4">
            This tool creates test medication reminder notifications that appear immediately,
            so you don't have to wait for scheduled times.
          </p>
          <ul className="text-sm text-text-muted space-y-1 mb-4">
            <li>• Creates 3 notifications (Morning, Afternoon, Night)</li>
            <li>• Scheduled 1 minute in the past (appears immediately)</li>
            <li>• Polling hook picks them up within 60 seconds</li>
            <li>• Badge updates automatically</li>
          </ul>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={createTestNotifications}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating Test Notifications...' : 'Create Test Notifications'}
        </Button>

        {result && (
          <div className="p-4 rounded-2xl bg-success/10 border border-success/20">
            <pre className="text-sm text-text-primary whitespace-pre-wrap font-mono">
              {result}
            </pre>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-error/10 border border-error/20">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-surface border border-border">
          <h3 className="font-display text-sm font-bold text-text-primary mb-2">
            How to Test
          </h3>
          <ol className="text-sm text-text-muted space-y-2">
            <li>1. Click "Create Test Notifications" above</li>
            <li>2. Wait up to 60 seconds (polling interval)</li>
            <li>3. Watch the badge on the Notifications tab update</li>
            <li>4. Navigate to Notifications tab to see the cards</li>
            <li>5. Tap a card to expand and test "Take now" / "Skip"</li>
          </ol>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border">
          <h3 className="font-display text-sm font-bold text-text-primary mb-2">
            Alternative: Manual Database Insert
          </h3>
          <p className="text-sm text-text-muted mb-2">
            You can also create test notifications directly in Supabase:
          </p>
          <pre className="text-xs text-text-muted bg-surface-subtle p-3 rounded-xl overflow-x-auto">
{`INSERT INTO notifications (
  user_id, profile_id, type, title, body,
  channel, scheduled_for, is_read, data
) VALUES (
  'your-user-id',
  'your-profile-id',
  'medication_reminder',
  'Time to take Aspirin',
  'Time to take Aspirin 500mg — Morning dose',
  'in_app',
  NOW() - INTERVAL '1 minute',
  false,
  '{"medication_id": "test-id", "slot": "Morning"}'::jsonb
);`}
          </pre>
        </div>
      </div>
    </>
  )
}
