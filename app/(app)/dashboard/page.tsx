import { redirect } from 'next/navigation'

// /dashboard was the original static landing page from early development.
// It has been merged into /hub — the canonical post-auth landing.
// This redirect preserves any external links, PWA shortcuts, or stale bookmarks.
// Safe to delete this file once the manifest shortcut and any external traffic
// have been verified to point at /hub directly.
export default function DashboardPage() {
  redirect('/hub')
}
