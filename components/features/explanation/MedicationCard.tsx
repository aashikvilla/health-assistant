import type { Medication } from '@/types'

interface MedicationCardProps {
  medication: Medication
  className?: string
}

const ROW_LABELS = [
  { key: 'treats', label: 'Treats' },
  { key: 'howToTake', label: 'How to take' },
  { key: 'sideEffects', label: 'Side effects' },
  { key: 'avoid', label: 'Avoid' },
] as const

function MedicationCard({ medication, className = '' }: MedicationCardProps) {
  return (
    <div
      className={[
        'bg-surface-container-lowest rounded-3xl p-5 shadow-ambient',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h3 className="font-display text-lg font-semibold text-text-primary">
            {medication.name} {medication.dosage}
          </h3>
          <p className="font-body text-sm text-text-muted mt-0.5">
            {medication.frequency}
          </p>
        </div>
      </div>

      {/* Info rows — separated by whitespace, no dividers */}
      <div className="space-y-4">
        {ROW_LABELS.map(({ key, label }) => {
          const value = medication[key]
          if (!value) return null

          const isSideEffects = key === 'sideEffects'

          return (
            <div
              key={key}
              className={[
                'rounded-2xl p-3',
                isSideEffects
                  ? 'bg-warning-subtle/40'
                  : 'bg-surface-container-low',
              ].join(' ')}
            >
              <p className="font-body text-xs font-medium uppercase tracking-wider text-text-muted mb-1">
                {label}
              </p>
              <p className="font-body text-sm text-text-primary leading-relaxed">
                {value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { MedicationCard }
export type { MedicationCardProps }
