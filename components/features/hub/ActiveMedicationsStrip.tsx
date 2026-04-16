import type { Medication } from '@/types/prescription'

interface Props {
  medications: Medication[]
  profileName: string
  isSelf: boolean
}

export function ActiveMedicationsStrip({ medications, profileName, isSelf }: Props) {
  if (medications.length === 0) return null

  const label = isSelf ? 'Your' : `${profileName.split(' ')[0]}'s`
  const MAX_DISPLAY = 4
  const displayedMeds = medications.slice(0, MAX_DISPLAY)

  // Helper to detect generic frequency strings that add no information
  function isGenericFrequency(value: string): boolean {
    if (!value?.trim()) return false
    const normalized = value.toLowerCase().trim()
    const genericPatterns = [
      'as directed',
      'as advised', 
      'as prescribed',
      'per doctor',
      'as directed by',
      'as per doctor',
      'as recommended'
    ]
    return genericPatterns.some(pattern => normalized.includes(pattern))
  }

  const DOT_GRADIENTS = [
    'linear-gradient(135deg, #1d4ed8, #7c3aed)',
    'linear-gradient(135deg, #0d9488, #0891b2)',
    'linear-gradient(135deg, #7c3aed, #c026d3)',
    'linear-gradient(135deg, #d97706, #f59e0b)',
  ]
  const DOT_GLOW_COLORS = ['rgba(124,58,237,.2)', 'rgba(13,148,136,.2)', 'rgba(192,38,211,.2)', 'rgba(217,119,6,.2)']
  const FREQ_COLORS = [
    { color: '#7c3aed', bg: 'rgba(124,58,237,.1)' },
    { color: '#0d9488', bg: 'rgba(13,148,136,.1)' },
    { color: '#c026d3', bg: 'rgba(192,38,211,.1)' },
    { color: '#d97706', bg: 'rgba(217,119,6,.1)' },
  ]

  return (
    <section aria-labelledby="active-meds-heading">
      <div className="flex items-center justify-between mb-3">
        <h2
          id="active-meds-heading"
          className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest"
        >
          {label} Active Medications
        </h2>
      </div>

      <div
        className="rounded-2xl bg-white overflow-hidden"
        style={{ border: '1px solid rgba(124,58,237,.12)', boxShadow: '0 2px 12px rgba(29,78,216,.07)' }}
      >
        {/* Card header strip */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="font-display text-[13px] font-bold text-text-primary">This week</span>
          <span
            className="font-body text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
            style={{ background: 'rgba(29,78,216,.08)', color: '#1d4ed8' }}
          >
            {medications.length} active
          </span>
        </div>

        <div className="px-4 pb-3 flex flex-col">
          {displayedMeds.map((med, i) => {
            const dotGrad = DOT_GRADIENTS[i % DOT_GRADIENTS.length]
            const dotGlow = DOT_GLOW_COLORS[i % DOT_GLOW_COLORS.length]
            const freq = FREQ_COLORS[i % FREQ_COLORS.length]
            return (
              <div
                key={`${med.name}-${i}`}
                className="flex items-center gap-3 py-2.5"
                style={{ borderBottom: i < displayedMeds.length - 1 ? '1px solid rgba(124,58,237,.07)' : 'none' }}
              >
                {/* Dot with glow ring */}
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: dotGrad,
                    boxShadow: `0 0 0 4px ${dotGlow}`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[13px] font-semibold text-text-primary truncate">{med.name}</p>
                  {med.dosage && (
                    <p className="font-body text-[11px] text-text-muted mt-0.5">{med.dosage}</p>
                  )}
                </div>
                {med.duration && !isGenericFrequency(med.duration) && (
                  <span
                    className="font-body text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ color: freq.color, background: freq.bg }}
                  >
                    {med.duration}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* View all link when there are more than MAX_DISPLAY medications */}
        {medications.length > MAX_DISPLAY && (
          <div className="px-4 pb-3 pt-1">
            <a
              href="/timeline"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all {medications.length} →
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
