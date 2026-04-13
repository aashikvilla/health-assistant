interface DoctorNotesProps {
  notes: string[]
  className?: string
}

function DoctorNotes({ notes, className = '' }: DoctorNotesProps) {
  if (notes.length === 0) return null

  return (
    <div
      className={[
        'border-2 border-dashed border-on-surface/15 rounded-2xl p-5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h3 className="font-display text-base font-semibold text-text-primary mb-4">
        Things to tell your doctor
      </h3>
      <ul className="space-y-3">
        {notes.map((note, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="mt-1.5 w-2 h-2 rounded-full bg-secondary shrink-0"
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
