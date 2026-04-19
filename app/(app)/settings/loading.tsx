/**
 * Loading state for settings page
 */

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header skeleton */}
      <div className="sticky top-0 z-10 bg-surface border-b border-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-6 h-6 rounded bg-surface-subtle animate-pulse" />
          <div className="w-24 h-6 rounded bg-surface-subtle animate-pulse" />
        </div>
      </div>

      {/* Settings sections skeleton */}
      <div className="px-4 py-6 space-y-6">
        {[1, 2, 3].map((section) => (
          <div key={section} className="space-y-3">
            <div className="w-32 h-5 rounded bg-surface-subtle animate-pulse mb-3" />
            
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="w-40 h-5 rounded bg-surface-subtle animate-pulse" />
                    <div className="w-56 h-3 rounded bg-surface-subtle animate-pulse" />
                  </div>
                  <div className="w-10 h-6 rounded-full bg-surface-subtle animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
