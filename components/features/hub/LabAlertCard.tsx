import Link from 'next/link'

interface OutOfRangeValue {
  name:   string
  result: string
  status: 'high' | 'low' | 'critical' | string
}

interface Props {
  values:      OutOfRangeValue[]
  reportDate:  string | null
  profileName: string
  isSelf:      boolean
  documentId?: string | null
}

const STATUS_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-error-subtle', text: 'text-error',      dot: 'bg-error' },
  high:     { label: 'High',     bg: 'bg-warning-subtle', text: 'text-warning',  dot: 'bg-warning' },
  low:      { label: 'Low',      bg: 'bg-warning-subtle', text: 'text-warning',  dot: 'bg-warning' },
} as const

function statusConfig(status: string) {
  if (status === 'critical') return STATUS_CONFIG.critical
  if (status === 'high')     return STATUS_CONFIG.high
  if (status === 'low')      return STATUS_CONFIG.low
  return STATUS_CONFIG.low
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function LabAlertCard({ values, reportDate, profileName, isSelf, documentId }: Props) {
  if (values.length === 0) return null

  const label    = isSelf ? 'Your' : `${profileName.split(' ')[0]}'s`
  const critical = values.filter((v) => v.status === 'critical')
  const others   = values.filter((v) => v.status !== 'critical')

  return (
    <section aria-labelledby="lab-alerts-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="lab-alerts-heading" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {label} Lab Alerts
        </h2>
        {reportDate && (
          <span className="text-xs text-text-muted">{formatDate(reportDate)}</span>
        )}
      </div>

      <div className="rounded-2xl bg-surface-subtle border border-border overflow-hidden">
        {/* Summary banner */}
        <div className={`px-4 py-3 flex items-center gap-2.5 ${critical.length > 0 ? 'bg-error-subtle border-b border-error/15' : 'bg-warning-subtle border-b border-warning/15'}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={critical.length > 0 ? 'text-error' : 'text-warning'} aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className={`text-xs font-semibold ${critical.length > 0 ? 'text-error' : 'text-warning'}`}>
            {values.length} value{values.length !== 1 ? 's' : ''} outside reference range
            {critical.length > 0 && ` — ${critical.length} critical`}
          </p>
        </div>

        {/* Value rows */}
        <div className="divide-y divide-border">
          {[...critical, ...others].slice(0, 5).map((v, i) => {
            const cfg = statusConfig(v.status)
            return (
              <div key={`${v.name}-${i}`} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} aria-hidden="true" />
                  <span className="text-sm text-text-primary truncate">{v.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-medium text-text-primary">{v.result}</span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            )
          })}
          {values.length > 5 && (
            <div className="px-4 py-2.5 text-xs text-text-muted text-center">
              +{values.length - 5} more
            </div>
          )}
        </div>

        {/* View full report link */}
        {documentId && (
          <Link
            href={`/records/${documentId}`}
            className="flex items-center justify-center gap-1.5 px-4 py-3 text-sm font-semibold text-primary hover:bg-surface-muted transition-colors border-t border-border"
          >
            View full report
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </section>
  )
}
