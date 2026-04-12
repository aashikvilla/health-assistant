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
  const { id, document_type, document_date, doctor_name, profile_name, tags, summary } = record
  const isPrescription = document_type === 'prescription'
  const label = TYPE_LABEL[document_type] ?? document_type
 
  return (
    <Link
      href={`/records/${id}`}
      className={[
        'flex items-start gap-3 px-4 py-4 bg-surface-container-lowest rounded-2xl',
        'transition-all min-h-[44px]',
        className,
      ].filter(Boolean).join(' ')}
      style={{ boxShadow: '0 2px 12px 0 rgba(24,28,33,0.06)' }}
    >
      {/* Type icon */}
      <div
        className={[
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          isPrescription ? 'bg-primary-subtle' : 'bg-info-subtle',
        ].join(' ')}
        aria-hidden="true"
      >
        {isPrescription ? (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )}
      </div>
 
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge variant={isPrescription ? 'primary' : 'info'} size="sm">{label}</Badge>
          <span className="text-xs text-text-muted truncate">{profile_name}</span>
        </div>
        <p className="text-sm font-semibold text-text-primary truncate">
          {doctor_name ?? 'Unknown Doctor'}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{formatDate(document_date)}</p>
        {summary && (
          <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 bg-teal-subtle text-teal rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
 
      <span className="text-text-muted text-base mt-1 shrink-0" aria-hidden="true">›</span>
    </Link>
  )
}