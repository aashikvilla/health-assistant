/**
 * Test Notifications API Route
 * 
 * DEVELOPMENT ONLY - Creates test notifications that fire immediately
 * for testing the notification system without waiting for scheduled times.
 * 
 * Usage:
 *   POST /api/test-notifications
 *   Body: { userId: "uuid", profileId: "uuid", medicationName: "Aspirin", dosage: "500mg" }
 * 
 * This will create notifications scheduled 1 minute in the past so they
 * appear immediately when the polling hook runs.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      userId = user.id,
      profileId,
      medicationName = 'Test Medicine',
      dosage = '500mg',
      medicationId = crypto.randomUUID(),
    } = body

    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId is required' },
        { status: 400 }
      )
    }

    // Create test notifications scheduled 1 minute in the past
    // This ensures they're immediately picked up by the polling hook
    const scheduledFor = new Date()
    scheduledFor.setMinutes(scheduledFor.getMinutes() - 1)

    const testNotifications = [
      {
        user_id: userId,
        profile_id: profileId,
        type: 'medication_reminder',
        title: `Time to take ${medicationName}`,
        body: `Time to take ${medicationName} ${dosage} — Morning dose`,
        data: {
          medication_id: medicationId,
          profile_id: profileId,
          slot: 'Morning',
        },
        channel: 'in_app',
        scheduled_for: scheduledFor.toISOString(),
        is_read: false,
      },
      {
        user_id: userId,
        profile_id: profileId,
        type: 'medication_reminder',
        title: `Time to take ${medicationName}`,
        body: `Time to take ${medicationName} ${dosage} — Afternoon dose`,
        data: {
          medication_id: medicationId,
          profile_id: profileId,
          slot: 'Afternoon',
        },
        channel: 'in_app',
        scheduled_for: scheduledFor.toISOString(),
        is_read: false,
      },
      {
        user_id: userId,
        profile_id: profileId,
        type: 'medication_reminder',
        title: `Time to take ${medicationName}`,
        body: `Time to take ${medicationName} ${dosage} — Night dose`,
        data: {
          medication_id: medicationId,
          profile_id: profileId,
          slot: 'Night',
        },
        channel: 'in_app',
        scheduled_for: scheduledFor.toISOString(),
        is_read: false,
      },
    ]

    const { data, error } = await supabase
      .from('notifications')
      .insert(testNotifications)
      .select()

    if (error) {
      console.error('Error creating test notifications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test notifications created! They will appear within 60 seconds.',
      notifications: data,
      tip: 'Open the app and wait up to 60 seconds for the polling hook to pick them up.',
    })
  } catch (err) {
    console.error('Test notifications error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
