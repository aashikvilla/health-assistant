/**
 * Loading state for notifications page
 */

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 bg-surface border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="w-32 h-6 rounded bg-surface-subtle animate-pulse" />
          <div className="w-20 h-4 rounded bg-surface-subtle animate-pulse" />
        </div>
      </div>

      {/* Notification cards skeleton */}
      <div className="px-4 py-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="w-3/4 h-5 rounded bg-surface-subtle animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="w-16 h-5 rounded-full bg-surface-subtle animate-pulse" />
                  <div className="w-20 h-3 rounded bg-surface-subtle animate-pulse" />
                </div>
              </div>
              <div className="w-2 h-2 rounded-full bg-surface-subtle animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
