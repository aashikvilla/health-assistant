# Testing Medication Reminders - Quick Guide

This guide shows you how to test the medication reminders feature without waiting hours for scheduled notifications.

---

## 🎯 Quick Test (Recommended)

### Option 1: Use the Test Page (Easiest)

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Navigate to the test page**:
   ```
   http://localhost:3000/test-notifications
   ```

3. **Click "Create Test Notifications"**

4. **Wait up to 60 seconds** (polling interval)

5. **Check the Notifications tab** - you should see 3 new notifications with a badge!

6. **Test the full flow**:
   - Tap a notification to expand it
   - See the medicine image (placeholder for now)
   - Tap "Take now" or "Skip"
   - Check that the notification is marked as read
   - Verify the badge count decreases

---

## 🔧 Option 2: Manual Database Insert

If you prefer to work directly with the database:

1. **Open Supabase Dashboard** → SQL Editor

2. **Get your user_id and profile_id**:
   ```sql
   SELECT 
     u.id as user_id,
     p.id as profile_id,
     p.full_name
   FROM auth.users u
   JOIN profile_memberships pm ON pm.user_id = u.id
   JOIN family_profiles p ON p.id = pm.profile_id
   WHERE u.email = 'your-email@example.com';
   ```

3. **Insert a test notification** (scheduled 1 minute ago):
   ```sql
   INSERT INTO notifications (
     user_id,
     profile_id,
     type,
     title,
     body,
     channel,
     scheduled_for,
     is_read,
     data
   ) VALUES (
     'your-user-id-here',
     'your-profile-id-here',
     'medication_reminder',
     'Time to take Aspirin',
     'Time to take Aspirin 500mg — Morning dose',
     'in_app',
     NOW() - INTERVAL '1 minute',
     false,
     '{"medication_id": "test-med-id", "profile_id": "your-profile-id-here", "slot": "Morning"}'::jsonb
   );
   ```

4. **Open the app** and wait up to 60 seconds

5. **Check the Notifications tab** - your test notification should appear!

---

## 📋 Full Workflow Test (Real Prescription Upload)

To test the complete end-to-end flow:

### Step 1: Upload a Prescription

1. Navigate to `/dashboard/upload/[profileId]`
2. Upload a prescription image or enter text manually
3. Make sure the medicine has a frequency like:
   - `"1-0-1"` (morning and night)
   - `"1-1-1"` (morning, afternoon, night)
   - `"0-1-0"` (afternoon only)

### Step 2: Check Database

Open Supabase and verify:

**Medications table:**
```sql
SELECT 
  id,
  name,
  frequency,
  reminder_enabled,
  timing,
  reminder_times
FROM medications
ORDER BY created_at DESC
LIMIT 5;
```

You should see:
- ✅ `reminder_enabled = true`
- ✅ `timing = ['08:00', '21:00']` (or similar)
- ✅ `reminder_times = ['08:00', '21:00']` (same as timing)

**Notifications table:**
```sql
SELECT 
  id,
  type,
  title,
  body,
  channel,
  scheduled_for,
  sent_at,
  is_read
FROM notifications
WHERE type = 'medication_reminder'
ORDER BY created_at DESC
LIMIT 10;
```

You should see:
- ✅ 2 rows per reminder time (one `in_app`, one `push`)
- ✅ `scheduled_for` is in the future
- ✅ `sent_at IS NULL` (not delivered yet)

### Step 3: Trigger Immediate Delivery (Hack)

To test without waiting, update the `scheduled_for` to the past:

```sql
UPDATE notifications
SET scheduled_for = NOW() - INTERVAL '1 minute'
WHERE type = 'medication_reminder'
  AND sent_at IS NULL
  AND channel = 'in_app'
LIMIT 3;
```

### Step 4: Wait for Polling

- Open the app
- Wait up to 60 seconds
- Watch the Notifications tab badge update
- Navigate to `/notifications` to see the cards

---

## 🐛 Troubleshooting

### Issue: Notifications not appearing after 60 seconds

**Check:**
1. Open browser DevTools → Console
2. Look for polling logs: `"pollDueNotifications called"`
3. Check for errors in the console

**Verify in database:**
```sql
-- Check if notifications were marked as delivered
SELECT 
  id,
  title,
  scheduled_for,
  sent_at,
  is_read
FROM notifications
WHERE type = 'medication_reminder'
  AND channel = 'in_app'
ORDER BY created_at DESC
LIMIT 5;
```

If `sent_at` is still NULL, the polling hook isn't running or there's an error.

### Issue: Badge not updating

**Check:**
1. Verify `useNotifications` hook is initialized in `BottomNav`
2. Check that `userId` is passed correctly
3. Look for errors in browser console

**Test the hook directly:**
```javascript
// In browser console
const { unreadCount } = useNotifications('your-user-id', 0)
console.log('Unread count:', unreadCount)
```

### Issue: "Take now" button doesn't work

**Check:**
1. Open browser DevTools → Network tab
2. Click "Take now"
3. Look for POST request to `/api/notifications/actions`
4. Check the response for errors

**Verify in database:**
```sql
-- Check if medication log was created
SELECT 
  id,
  medication_id,
  action,
  scheduled_time,
  action_time
FROM medication_logs
ORDER BY created_at DESC
LIMIT 5;
```

### Issue: Polling seems slow

The polling interval is 60 seconds by default. To speed it up for testing:

1. Open `hooks/useNotifications.ts`
2. Find the line: `const interval = setInterval(poll, 60_000)`
3. Change to: `const interval = setInterval(poll, 5_000)` (5 seconds)
4. **Remember to change it back before deploying!**

---

## 📊 Expected Behavior

### Timeline

1. **T+0s**: Upload prescription with frequency "1-0-1"
2. **T+0s**: Medications created with `reminder_enabled = true`
3. **T+0s**: 4 notifications created (2 in_app, 2 push) scheduled for future
4. **T+0s**: [HACK] Update `scheduled_for` to past in database
5. **T+0-60s**: Polling hook finds due notifications
6. **T+0-60s**: Notifications marked as delivered (`sent_at = now()`)
7. **T+0-60s**: Badge updates to show unread count
8. **T+0-60s**: Notifications appear in `/notifications` page

### Database State Changes

**Before polling:**
```
notifications table:
- scheduled_for: 2026-04-19 08:00:00 (future)
- sent_at: NULL
- is_read: false
```

**After polling:**
```
notifications table:
- scheduled_for: 2026-04-19 08:00:00 (unchanged)
- sent_at: 2026-04-19 15:30:00 (now)
- is_read: false
```

**After "Take now":**
```
notifications table:
- is_read: true

medication_logs table:
- action: 'taken'
- scheduled_time: 2026-04-19 08:00:00
- action_time: 2026-04-19 15:31:00
```

---

## 🎬 Video Walkthrough Script

If you want to record a demo:

1. **Start**: "Let me show you the medication reminders feature"
2. **Navigate**: Go to `/test-notifications`
3. **Create**: Click "Create Test Notifications"
4. **Wait**: "The polling hook runs every 60 seconds, so let's wait..."
5. **Show**: Point to the badge appearing on the Notifications tab
6. **Navigate**: Tap the Notifications tab
7. **Expand**: Tap a notification card to expand it
8. **Action**: Tap "Take now"
9. **Verify**: Show the notification marked as read and badge decremented
10. **Database**: Show the `medication_logs` table with the new entry

---

## 🚀 Production Testing

Once deployed to Vercel:

1. **Upload a real prescription** with a medicine that has frequency
2. **Wait for the scheduled time** (e.g., 8 AM the next day)
3. **Check push notifications** on your mobile device
4. **Tap the push notification** - should open app to `/notifications`
5. **Verify cron job** in Vercel logs

---

## 📝 Test Checklist

- [ ] Test page creates notifications successfully
- [ ] Polling hook picks up notifications within 60 seconds
- [ ] Badge updates automatically
- [ ] Notifications appear in `/notifications` page
- [ ] Cards expand when tapped
- [ ] Medicine image (placeholder) is shown
- [ ] "Take now" creates medication log entry
- [ ] "Skip" creates medication log entry
- [ ] Notification marked as read after action
- [ ] Badge count decrements after marking as read
- [ ] Real prescription upload creates notifications
- [ ] Frequency parser works correctly (1-0-1, 1-1-1, etc.)
- [ ] Dual-channel notifications created (in_app + push)
- [ ] Push notifications work on mobile (requires deployment)

---

## 🎉 Success Criteria

You'll know it's working when:

1. ✅ Test page creates notifications without errors
2. ✅ Badge appears on Notifications tab within 60 seconds
3. ✅ Tapping the tab shows notification cards
4. ✅ Expanding a card shows medicine details
5. ✅ "Take now" / "Skip" actions work and create logs
6. ✅ Notifications are marked as read after action
7. ✅ Badge count updates correctly

**Happy Testing! 🚀**
