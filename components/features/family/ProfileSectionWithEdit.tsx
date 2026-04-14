'use client'

import { useState } from 'react'
import { ProfileWheel } from './ProfileWheel'
import { EditProfileForm } from './EditProfileForm'
import type { FamilyProfile } from '@/types/family'

interface ProfileSectionWithEditProps {
  profiles: FamilyProfile[]
  activeProfile: FamilyProfile
  baseHref: string
}

export function ProfileSectionWithEdit({
  profiles,
  activeProfile,
  baseHref,
}: ProfileSectionWithEditProps) {
  const [editing, setEditing] = useState(false)

  return (
    <section aria-labelledby="profiles-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="profiles-heading" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Family Profiles
        </h2>
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-primary font-medium hover:underline"
          aria-label={`Edit ${activeProfile.full_name}'s profile`}
        >
          Edit profile
        </button>
      </div>

      <ProfileWheel
        profiles={profiles}
        activeProfileId={activeProfile.id}
        baseHref={baseHref}
      />

      {editing && (
        <EditProfileForm
          profile={activeProfile}
          onClose={() => setEditing(false)}
        />
      )}
    </section>
  )
}
