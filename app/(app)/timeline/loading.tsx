/**
 * Loading state for timeline page
 */

export default function TimelineLoading() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Gradient header skeleton */}
      <div className="gradient-hero h-40 animate-pulse" />
      
      <div className="px-4 -mt-12">
        {/* Stats skeleton */}
        <div className="flex gap-4 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex-1 bg-surface border border-border rounded-xl p-4 space-y-2">
              <div className="w-12 h-8 rounded bg-surface-subtle animate-pulse" />
              <div className="w-20 h-3 rounded bg-surface-subtle animate-pulse" />
            </div>
          ))}
        </div>

        {/* Timeline items skeleton */}
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-surface-subtle animate-pulse" />
                <div className="w-px flex-1 bg-border" />
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="w-24 h-3 rounded bg-surface-subtle animate-pulse mb-2" />
                <div className="bg-surface border border-border rounded-2xl p-4 space-y-3">
                  <div className="w-3/4 h-5 rounded bg-surface-subtle animate-pulse" />
                  <div className="w-1/2 h-4 rounded bg-surface-subtle animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
