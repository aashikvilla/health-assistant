import type { MedicationExplanation } from '@/types/analysis'
 
interface MedicationListProps {
  medications: MedicationExplanation[]
  className?:  string
}
 
export function MedicationList({ medications, className }: MedicationListProps) {
  if (medications.length === 0) {
    return (
      <p className="text-sm text-text-muted py-4 text-center">
        No medication details available.
      </p>
    )
  }
 
  return (
    <ul className={['space-y-3', className].filter(Boolean).join(' ')}>
      {medications.map((med, i) => (
        <li
          key={i}
          className="bg-surface-container-lowest rounded-2xl p-4"
          style={{ boxShadow: '0 2px 12px 0 rgba(24,28,33,0.06)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-text-primary leading-snug">{med.name}</p>
            {med.dosage && (
              <span className="text-xs text-text-muted shrink-0 mt-0.5">{med.dosage}</span>
            )}
          </div>
          {med.frequency && (
            <p className="text-xs text-text-secondary mt-1">{med.frequency}</p>
          )}
          {med.treats && (
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              <span className="font-medium text-text-secondary">For: </span>
              {med.treats}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}