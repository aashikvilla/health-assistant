# Web Push Notifications Setup Guide

This guide explains how to set up Web Push notifications for medication reminders in Vitae.

---

## What are VAPID Keys?

**VAPID** (Voluntary Application Server Identification) keys are used to authenticate your server when sending Web Push notifications. They consist of:

- **Public Key**: Shared with the browser when subscribing to push notifications
- **Private Key**: Kept secret on your server, used to sign push messages
- **Subject**: A contact email (mailto:) or URL identifying your application

---

## How to Generate VAPID Keys

### Option 1: Using web-push CLI (Recommended)

```bash
npx web-push generate-vapid-keys
```

This will output:
```
=======================================

Public Key:
BBWarwAlN1f4aXMr8O8smjMlKr_HbMXuG-xy1ANiXMzmLFqvVYGtZlDWCKWlOXDzDp_wE9QAnkRKwatcRfA5ZhM

Private Key:
35i6MMRn31NfXzOLMdMQdFrnDW7i8ISgSwC2Fe88vPI

=======================================
```

### Option 2: Using Node.js

```javascript
const webpush = require('web-push');
const vapidKeys = webpush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

---

## How to Generate Cron Secret

The cron secret should be a cryptographically secure random string. Generate it using:

### Using Node.js (Recommended)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

This generates a 32-byte random value encoded as base64, like:
```
IupL/1qkF7p2XAor9WVl7AMaeyUNeAJpYQjL3W7MPP0=
```

### Using OpenSSL

```bash
openssl rand -base64 32
```

### Using PowerShell (Windows)

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## Environment Variables

Add these to your `.env.local` file:

```env
# Web Push VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BBWarwAlN1f4aXMr8O8smjMlKr_HbMXuG-xy1ANiXMzmLFqvVYGtZlDWCKWlOXDzDp_wE9QAnkRKwatcRfA5ZhM
VAPID_PRIVATE_KEY=35i6MMRn31NfXzOLMdMQdFrnDW7i8ISgSwC2Fe88vPI
VAPID_SUBJECT=mailto:your-email@example.com

# Cron Secret for push notification dispatcher
CRON_SECRET=your_random_secret_string
```

### Variable Descriptions

| Variable | Purpose | Visibility |
|----------|---------|------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Used by the browser to subscribe to push notifications | Public (client-side) |
| `VAPID_PRIVATE_KEY` | Used by the server to sign push messages | Private (server-side only) |
| `VAPID_SUBJECT` | Contact email for push service providers | Private (server-side only) |
| `CRON_SECRET` | Authenticates cron job requests to `/api/push/send` | Private (server-side only) |

---

## Current Configuration

✅ **Your VAPID keys have been generated and added to `.env.local`**

- **Public Key**: `BBWarwAlN1f4aXMr8O8smjMlKr_HbMXuG-xy1ANiXMzmLFqvVYGtZlDWCKWlOXDzDp_wE9QAnkRKwatcRfA5ZhM`
- **Private Key**: `35i6MMRn31NfXzOLMdMQdFrnDW7i8ISgSwC2Fe88vPI`
- **Subject**: `mailto:aashikvilla99@gmail.com`
- **Cron Secret**: `IupL/1qkF7p2XAor9WVl7AMaeyUNeAJpYQjL3W7MPP0=` (32-byte random, base64-encoded)

---

## Deployment to Vercel

When deploying to Vercel, add these environment variables in the Vercel dashboard:

1. Go to your project → Settings → Environment Variables
2. Add each variable:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (Production, Preview, Development)
   - `VAPID_PRIVATE_KEY` (Production, Preview, Development)
   - `VAPID_SUBJECT` (Production, Preview, Development)
   - `CRON_SECRET` (Production, Preview, Development)

**Important**: The `NEXT_PUBLIC_` prefix makes the variable accessible client-side. Only use this prefix for the public key!

---

## Cron Job Configuration

The push notification dispatcher runs as a cron job that checks for due notifications.

### Vercel Configuration

The `vercel.json` file includes the cron configuration:

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

**⚠️ Hobby Plan Limitation:**
- Vercel Hobby plan only allows cron jobs that run **once per day**
- Current schedule: `0 0 * * *` (midnight UTC daily)
- Timing precision: ±59 minutes (could trigger 12:00 AM - 12:59 AM)

**Impact:**
- Push notifications are sent in batch once per day
- In-app notifications still work via 60-second polling
- For per-minute execution, upgrade to Vercel Pro ($20/month)

**For Real-Time Push Notifications:**
- Upgrade to Vercel Pro plan
- Change schedule to `* * * * *` (every minute)
- OR integrate Firebase Cloud Messaging (free alternative)

See `VERCEL_DEPLOYMENT.md` for detailed workarounds and alternatives.

### Manual Testing

To test the push dispatcher locally:

```bash
curl -H "Authorization: Bearer vitae-cron-secret-2024-medication-reminders-push-dispatcher" \
     http://localhost:3000/api/push/send
```

---

## How Web Push Works

1. **User grants permission**: When the user taps "Enable" on the `PushPermissionBanner`, the browser requests notification permission
2. **Service worker subscribes**: The service worker (`/sw.js`) subscribes to push notifications using the VAPID public key
3. **Subscription saved**: The subscription (endpoint, p256dh, auth_key) is saved to the `push_subscriptions` table
4. **Notifications scheduled**: When a prescription is uploaded, dual-channel notifications are created (in_app + push)
5. **Cron dispatcher**: Every minute, the `/api/push/send` route queries for due push notifications
6. **Push sent**: For each due notification, the server sends a push message to all active subscriptions using the VAPID private key
7. **Service worker receives**: The service worker receives the push event and displays a notification
8. **User taps**: When the user taps the notification, the app opens to `/notifications`

---

## Browser Support

Web Push notifications are supported on:

- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari (macOS 13+, iOS 16.4+)
- ✅ Opera (Desktop & Android)
- ❌ iOS Safari (< 16.4)

---

## Security Best Practices

1. **Never commit private keys**: The `.env.local` file is in `.gitignore` - keep it that way!
2. **Rotate keys periodically**: Generate new VAPID keys every 6-12 months
3. **Use different keys per environment**: Use separate keys for development, staging, and production
4. **Protect the cron secret**: Only the cron job should know this secret
5. **Validate subscriptions**: The `/api/push/send` route marks expired subscriptions as inactive (410/404 errors)

---

## Troubleshooting

### Issue: Push notifications not working

**Check:**
1. VAPID keys are set correctly in environment variables
2. Service worker is registered (DevTools → Application → Service Workers)
3. Push subscription is saved in `push_subscriptions` table
4. Cron job is running (check Vercel logs)
5. Notification permission is granted (check browser settings)

**Test:**
```bash
# Check if service worker is registered
# Open DevTools → Console
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs))

# Check if push subscription exists
# Open DevTools → Console
navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription()).then(sub => console.log(sub))
```

### Issue: "Invalid VAPID key" error

**Cause**: The public key is not in the correct format or doesn't match the private key.

**Fix**: Regenerate both keys together using `npx web-push generate-vapid-keys` and update both environment variables.

### Issue: Cron job not running

**Cause**: Cron jobs only work on Vercel's paid plans (Hobby plan and above).

**Fix**: Upgrade to a paid Vercel plan or use an alternative cron service (e.g., GitHub Actions, Render Cron Jobs).

---

## Testing Checklist

- [ ] VAPID keys generated and added to `.env.local`
- [ ] Environment variables set in Vercel dashboard
- [ ] Service worker registered at `/sw.js`
- [ ] Push permission prompt appears after first prescription upload
- [ ] Push subscription saved to `push_subscriptions` table
- [ ] Cron job configured in `vercel.json`
- [ ] Manual test of `/api/push/send` endpoint successful
- [ ] Push notification appears on device
- [ ] Tapping notification opens app to `/notifications`

---

## Additional Resources

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push npm package](https://www.npmjs.com/package/web-push)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
