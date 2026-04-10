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
  const { id, doctor_name, prescription_date, condition_tags, medication_count } = prescription

  return (
    <Link
      href={`/records/${id}`}
      className="flex items-center gap-3 px-4 py-3.5 bg-surface border border-border rounded-xl hover:bg-surface-subtle transition-colors min-h-[44px]"
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
            className="text-xs px-2 py-0.5 bg-surface-muted text-text-secondary rounded-full border border-border-subtle"
          >
            {tag}
          </span>
        ))}
        <span className="text-text-muted text-base" aria-hidden>›</span>
      </div>
    </Link>
  )
}
