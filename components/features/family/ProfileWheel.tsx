// Server component — receives data as props, no fetching

import { ProfileChip }    from '@/components/features/family/ProfileChip'
import { AddProfileChip } from '@/components/features/family/AddProfileChip'
import type { FamilyProfile } from '@/types/family'

const MAX_PROFILES = 5

interface ProfileWheelProps {
  profiles:        FamilyProfile[]
  activeProfileId: string
  baseHref:        string   // e.g. '/dashboard' — ?profile=id appended per chip
}

export function ProfileWheel({ profiles, activeProfileId, baseHref }: ProfileWheelProps) {
  const atLimit = profiles.length >= MAX_PROFILES

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none">
      {profiles.map((profile) => (
        <ProfileChip
          key={profile.id}
          profile={profile}
          isActive={profile.id === activeProfileId}
          href={`${baseHref}?profile=${profile.id}`}
        />
      ))}

      {/* Show remaining add-slots up to max */}
      {!atLimit && (
        <AddProfileChip label="Add" />
      )}
    </div>
  )
}
