/**
 * Loading state for dashboard page
 */

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Gradient header skeleton */}
      <div className="gradient-hero h-48 animate-pulse" />
      
      <div className="px-4 -mt-20">
        {/* Profile wheel skeleton */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-16 h-16 rounded-full bg-surface-subtle animate-pulse" />
              <div className="w-12 h-3 rounded bg-surface-subtle animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="space-y-6">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="w-32 h-6 rounded bg-surface-subtle animate-pulse" />
            <div className="w-16 h-4 rounded bg-surface-subtle animate-pulse" />
          </div>

          {/* Cards */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="w-3/4 h-5 rounded bg-surface-subtle animate-pulse" />
                  <div className="w-1/2 h-4 rounded bg-surface-subtle animate-pulse" />
                </div>
                <div className="w-16 h-6 rounded-full bg-surface-subtle animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
