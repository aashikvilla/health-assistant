# Vercel Deployment Guide

## Cron Jobs Limitation (Hobby Plan)

### Current Configuration

The push notification dispatcher (`/api/push/send`) is configured to run **once per day at midnight UTC** due to Vercel Hobby plan limitations.

```json
{
  "crons": [
    {
      "path": "/api/push/send",
      "schedule": "0 0 * * *"
    }
  ]
}
```

### Hobby Plan Restrictions

- ❌ **Cannot run every minute** (ideal for real-time notifications)
- ❌ **Cannot run every hour**
- ✅ **Can only run once per day**
- ⚠️ **Timing precision: ±59 minutes** (e.g., midnight could trigger anywhere between 12:00 AM - 12:59 AM)

### Impact on Medication Reminders

**With Daily Cron (Current - Hobby Plan):**
- Push notifications sent in batch once per day
- Notifications may be delayed by up to 24 hours
- In-app notifications still work via polling (60-second intervals)
- Users will see notifications in the app immediately
- Push notifications arrive later (next cron run)

**With Per-Minute Cron (Requires Pro Plan):**
- Push notifications sent within 1 minute of scheduled time
- Real-time delivery to mobile devices
- Better user experience
- Costs $20/month

---

## Workarounds for Hobby Plan

### Option 1: Use In-App Notifications Only (Current)

The app already has a polling mechanism that checks for due notifications every 60 seconds when the app is open. This works perfectly for in-app notifications.

**Pros:**
- ✅ Free
- ✅ Works immediately when app is open
- ✅ No deployment issues

**Cons:**
- ❌ No push notifications when app is closed
- ❌ Users must open app to see reminders

### Option 2: Increase Polling Frequency

Update `hooks/useNotifications.ts` to poll more frequently:

```typescript
// Change from 60 seconds to 30 seconds
const interval = setInterval(poll, 30_000)
```

**Pros:**
- ✅ Faster in-app notifications
- ✅ Free

**Cons:**
- ❌ Higher battery usage
- ❌ More API calls
- ❌ Still no push when app is closed

### Option 3: Use Alternative Push Service

Integrate a third-party push notification service that doesn't rely on cron:

- **Firebase Cloud Messaging (FCM)** - Free
- **OneSignal** - Free tier available
- **Pusher** - Free tier available

These services can trigger push notifications immediately without cron jobs.

### Option 4: Upgrade to Vercel Pro ($20/month)

**Benefits:**
- ✅ Per-minute cron execution
- ✅ Real-time push notifications
- ✅ 1 TB Fast Data Transfer
- ✅ 10M Edge Requests
- ✅ Team collaboration features

**To upgrade:**
1. Go to Vercel Dashboard
2. Settings → Billing
3. Upgrade to Pro plan
4. Update `vercel.json`:
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

---

## Recommended Approach

### For Development/Testing (Current Setup)

Keep the daily cron and rely on in-app notifications via polling. This is sufficient for:
- Testing the notification system
- Demonstrating the feature
- MVP/prototype stage

### For Production (Recommended)

**Short-term:**
- Keep daily cron for push notifications
- Optimize polling for in-app notifications
- Add user education: "Open the app to see your reminders"

**Long-term:**
- Upgrade to Vercel Pro for real-time push notifications
- OR integrate Firebase Cloud Messaging (free alternative)
- OR use a hybrid approach (daily cron + FCM for urgent reminders)

---

## Deployment Checklist

Before deploying to Vercel:

- [x] Update `vercel.json` to use daily cron (`0 0 * * *`)
- [ ] Set environment variables in Vercel dashboard:
  - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `VAPID_SUBJECT`
  - `CRON_SECRET`
  - All Supabase environment variables
- [ ] Test in-app notifications work via polling
- [ ] Verify push notifications are queued (check database)
- [ ] Wait for next cron run (midnight UTC) to verify push delivery

---

## Testing Push Notifications

### Manual Trigger (Development)

You can manually trigger the push dispatcher:

```bash
curl -X GET https://your-app.vercel.app/api/push/send \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Verify Cron Execution

1. Go to Vercel Dashboard
2. Your Project → Deployments
3. Click on latest deployment
4. Functions → Cron Jobs
5. Check execution logs

---

## Alternative: Firebase Cloud Messaging

If you want real-time push notifications without upgrading to Pro, consider FCM:

### Setup Steps

1. Create Firebase project
2. Add FCM to your app
3. Update service worker to use FCM
4. Trigger notifications from Supabase Edge Functions (free)
5. Remove Vercel cron dependency

### Benefits
- ✅ Free
- ✅ Real-time delivery
- ✅ Works on Hobby plan
- ✅ Better mobile support

### Drawbacks
- ❌ More complex setup
- ❌ Additional dependency
- ❌ Requires code refactoring

---

## Current Status

✅ **Deployed with daily cron**
- In-app notifications: Working (60s polling)
- Push notifications: Queued, sent once per day at midnight UTC
- Deployment: Successful on Vercel Hobby plan

⚠️ **Known Limitations**
- Push notifications delayed by up to 24 hours
- Cron timing precision: ±59 minutes

🎯 **Recommended Next Steps**
1. Test current setup with daily cron
2. Gather user feedback on notification timing
3. Decide: Upgrade to Pro OR integrate FCM OR keep as-is

---

## Support

For questions about:
- **Vercel Cron Jobs**: https://vercel.com/docs/cron-jobs
- **Vercel Pro Pricing**: https://vercel.com/pricing
- **Firebase Cloud Messaging**: https://firebase.google.com/docs/cloud-messaging

