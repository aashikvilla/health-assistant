// Server component

import Link from 'next/link'
import type { HubPrescription } from '@/types/family'

interface PrescriptionListItemProps {
  prescription: HubPrescription
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
  })
}

export function PrescriptionListItem({ prescription }: PrescriptionListItemProps) {
  const { id, doctor_name, prescription_date, condition_tags, medication_count, document_id } = prescription
  // Prefer document_id (rich analysis view); fall back to prescription_id for older records
  const recordHref = `/records/${document_id ?? id}`
  return (
    <Link
      href={recordHref}
      className="flex items-center gap-3 px-4 py-4 bg-surface-container-lowest rounded-2xl transition-all min-h-[44px]"
      style={{ boxShadow: '0 2px 12px 0 rgba(24,28,33,0.06)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {doctor_name ?? 'Unknown Doctor'}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {formatDate(prescription_date)} · {medication_count}{' '}
          {medication_count === 1 ? 'medication' : 'medications'}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {condition_tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2.5 py-0.5 bg-teal-subtle text-teal rounded-full font-medium"
          >
            {tag}
          </span>
        ))}
        <span className="text-text-muted text-base" aria-hidden>›</span>
      </div>
    </Link>
  )
}
