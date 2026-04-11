// Server component — empty state for a profile with no prescriptions

import { Button } from '@/components/ui'

interface EmptyPrescriptionsProps {
  profileId:   string
  profileName: string
  isSelf:      boolean
}

export function EmptyPrescriptions({ profileId, profileName, isSelf }: EmptyPrescriptionsProps) {
  const label = isSelf ? 'your' : `${profileName.split(' ')[0]}'s`

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center">
        <svg
          className="w-7 h-7 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">No prescriptions yet</p>
        <p className="text-xs text-text-muted mt-1">
          Upload {label} first prescription to get started.
        </p>
      </div>
      <Button size="md" href={`/hub/upload/${profileId}`}>Upload a Prescription</Button>
    </div>
  )
}
