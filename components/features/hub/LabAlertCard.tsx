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

  const hasCritical = critical.length > 0

  return (
    <section aria-labelledby="lab-alerts-heading">
      <h2
        id="lab-alerts-heading"
        className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3"
      >
        {label} Lab Alerts
      </h2>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: hasCritical ? '1px solid rgba(190,18,60,.18)' : '1px solid rgba(217,119,6,.2)',
          boxShadow: hasCritical ? '0 4px 20px rgba(190,18,60,.10)' : '0 4px 20px rgba(217,119,6,.08)',
        }}
      >
        {/* Gradient header */}
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{
            background: hasCritical
              ? 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)'
              : 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,.2)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <p className="font-display text-[13px] font-bold text-white leading-tight">
              {values.length} value{values.length !== 1 ? 's' : ''} need{values.length === 1 ? 's' : ''} attention
              {hasCritical && `  ${critical.length} critical`}
            </p>
            {reportDate && (
              <p className="font-body text-[11px] text-white/70 mt-0.5">
                Last report · {formatDate(reportDate)}
              </p>
            )}
          </div>
        </div>

        {/* Value rows */}
        <div className="bg-white divide-y" style={{ borderColor: hasCritical ? 'rgba(254,202,202,.6)' : 'rgba(254,243,199,.8)' }}>
          {[...critical, ...others].slice(0, 5).map((v, i) => {
            const cfg = statusConfig(v.status)
            const isHigh = v.status === 'high' || v.status === 'critical'
            return (
              <div key={`${v.name}-${i}`} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-display text-[13px] font-semibold text-text-primary block truncate">{v.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`font-display text-[13px] font-bold ${hasCritical ? 'text-error' : 'text-warning'}`}
                  >
                    {v.result} {isHigh ? '↑' : '↓'}
                  </span>
                  <span className={`font-body text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            )
          })}
          {values.length > 5 && (
            <div className="px-4 py-2.5 font-body text-xs text-text-muted text-center">
              +{values.length - 5} more
            </div>
          )}
        </div>

        {/* View full report */}
        {documentId && (
          <Link
            href={`/records/${documentId}`}
            className="flex items-center justify-center gap-1.5 px-4 py-3 font-display text-sm font-semibold text-primary hover:bg-primary-subtle transition-colors bg-white border-t"
            style={{ borderColor: 'rgba(124,58,237,.12)' }}
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
