import Link from 'next/link'
import type { TimelineDocument } from '@/services/records.service'
import { Badge } from '@/components/ui'
 
interface RecordCardProps {
  record:     TimelineDocument
  className?: string
}
 
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
 
const TYPE_LABEL: Record<string, string> = {
  prescription: 'Prescription',
  lab_report:   'Lab Report',
}
 
export function RecordCard({ record, className }: RecordCardProps) {
  const { id, document_type, document_date, doctor_name, profile_name, tags } = record
  const isPrescription = document_type === 'prescription'

  const dateObj = document_date ? new Date(document_date) : null
  const dayNum  = dateObj ? dateObj.toLocaleDateString('en-IN', { day: '2-digit' }) : '—'
  const monthStr = dateObj ? dateObj.toLocaleDateString('en-IN', { month: 'short' }) : ''

  return (
    <Link
      href={`/records/${id}`}
      className={['flex overflow-hidden rounded-xl transition-all min-h-[44px]', className].filter(Boolean).join(' ')}
      style={{
        background: '#fff',
        border: '1px solid rgba(124,58,237,.12)',
        boxShadow: '0 2px 12px rgba(29,78,216,.07)',
      }}
    >
      {/* Colored left stripe */}
      <div
        className="w-1 flex-shrink-0"
        style={{
          background: isPrescription
            ? 'linear-gradient(180deg, #1d4ed8, #7c3aed)'
            : 'linear-gradient(180deg, #0d9488, #0891b2)',
        }}
      />

      {/* Icon */}
      <div className="flex items-center px-3 py-3 flex-shrink-0">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{ background: isPrescription ? 'rgba(29,78,216,.09)' : 'rgba(13,148,136,.09)' }}
          aria-hidden="true"
        >
          {isPrescription ? (
            <svg className="w-4.5 h-4.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          ) : (
            <svg className="w-4.5 h-4.5" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-3 pr-3">
        <p className="font-display text-[13px] font-bold text-text-primary truncate">
          {doctor_name ?? (isPrescription ? 'Prescription' : 'Lab Report')}
        </p>
        <p className="font-body text-[11px] text-text-muted mt-0.5">
          {isPrescription ? 'Prescription' : 'Lab Report'}{profile_name ? ` · ${profile_name}` : ''}
        </p>
        {tags && tags.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="font-body text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(13,148,136,.1)', color: '#0d9488' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {isPrescription && record.medication_count != null && record.medication_count > 0 && (
          <div className="mt-1.5">
            <Badge variant="primary" size="sm">
              {record.medication_count} medication{record.medication_count === 1 ? '' : 's'}
            </Badge>
          </div>
        )}
      </div>

      {/* Date block */}
      <div className="flex flex-col items-center justify-center px-3 flex-shrink-0 text-right">
        <span
          className="font-display text-[20px] font-extrabold leading-none"
          style={{ color: isPrescription ? '#1d4ed8' : '#0d9488' }}
        >
          {dayNum}
        </span>
        <span className="font-body text-[10px] font-semibold text-text-muted uppercase">{monthStr}</span>
      </div>
    </Link>
  )
}