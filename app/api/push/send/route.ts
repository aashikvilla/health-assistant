// app/api/push/send/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

export async function GET(request: Request) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    // 1. Fetch due push notifications
    const { data: dueNotifications, error: notifError } = await supabase
      .from('notifications')
      .select('id, user_id, title, body, data')
      .eq('channel', 'push')
      .lte('scheduled_for', new Date().toISOString())
      .is('sent_at', null)
      .limit(100)

    if (notifError) {
      console.error('Error fetching due notifications:', notifError)
      return NextResponse.json({ error: notifError.message }, { status: 500 })
    }

    if (!dueNotifications || dueNotifications.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0 })
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

      if (!subscriptions || subscriptions.length === 0) {
        // No active subscriptions for this user — mark notifications as failed
        failedNotificationIds.push(...notifications.map((n) => n.id))
        continue
      }

      for (const notification of notifications) {
        const payload = JSON.stringify({
          title: notification.title,
          body: notification.body,
          icon: '/icons/icon-192.png',
          badge: '/icons/badge-72.png',
          data: notification.data,
        })

        let notificationSent = false

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
            notificationSent = true
            sentCount++
          } catch (error: any) {
            console.error('Push notification send error:', error)
            
            // Handle 410 Gone or 404 Not Found — subscription expired
            if (error.statusCode === 410 || error.statusCode === 404) {
              await supabase
                .from('push_subscriptions')
                .update({ is_active: false })
                .eq('id', sub.id)
            }
          }
        }

        // Mark notification as sent if at least one subscription succeeded
        if (notificationSent) {
          await supabase
            .from('notifications')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', notification.id)
        } else {
          failedNotificationIds.push(notification.id)
        }
      }
    }

    return NextResponse.json({ 
      sent: sentCount, 
      failed: failedNotificationIds.length 
    })
  } catch (error) {
    console.error('Error in push dispatcher:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
