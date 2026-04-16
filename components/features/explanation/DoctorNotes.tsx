interface DoctorNotesProps {
  notes: string[]
  title?: string
  className?: string
}

function DoctorNotes({ notes, title = 'Things to tell your doctor', className = '' }: DoctorNotesProps) {
  if (notes.length === 0) return null

  return (
    <div
      className={[
        'rounded-2xl p-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ background: 'var(--color-primary-subtle)', border: '1px solid rgba(29,78,216,0.12)' }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(29,78,216,0.1)' }}>
          <svg className="w-4 h-4" style={{ color: 'var(--color-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="font-display text-base font-semibold text-text-primary">
          {title}
        </h3>
      </div>
      <ul className="space-y-3">
        {notes.map((note, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: 'var(--color-primary)', marginTop: '6px' }}
              aria-hidden="true"
            />
            <p className="font-body text-sm text-text-secondary leading-relaxed">
              {note}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { DoctorNotes }
export type { DoctorNotesProps }
