import type { Medication } from '@/types/prescription'

interface Props {
  medications: Medication[]
  profileName: string
  isSelf: boolean
}

export function ActiveMedicationsStrip({ medications, profileName, isSelf }: Props) {
  if (medications.length === 0) return null

  const label = isSelf ? 'Your' : `${profileName.split(' ')[0]}'s`

  return (
    <section aria-labelledby="active-meds-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="active-meds-heading" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {label} Active Medications
        </h2>
        <span className="text-xs text-text-muted">Active</span>
      </div>

      <div className="rounded-2xl bg-surface-subtle border border-border p-4 flex flex-col gap-3">
        {medications.map((med, i) => (
          <div key={`${med.name}-${i}`} className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Pill icon */}
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="text-primary" aria-hidden="true">
                  <path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3"/>
                  <circle cx="18" cy="18" r="3"/>
                  <path d="M22 22l-1.5-1.5"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{med.name}</p>
                {med.dosage && (
                  <p className="text-xs text-text-secondary mt-0.5">{med.dosage}</p>
                )}
              </div>
            </div>

            {med.duration && (
              <span className="text-xs text-text-muted whitespace-nowrap flex-shrink-0 mt-0.5">
                {med.duration}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
