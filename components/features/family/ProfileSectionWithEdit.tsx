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
    <section aria-label="Family profiles">
      <div className="flex items-center gap-3 justify-between">
        <ProfileWheel
          profiles={profiles}
          activeProfileId={activeProfile.id}
          baseHref={baseHref}
        />
        <button
          onClick={() => setEditing(true)}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 min-w-[60px]"
          aria-label={`Edit ${activeProfile.full_name}'s profile`}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.15)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <span className="font-body text-[10px] font-semibold" style={{ color: '#7c3aed' }}>Edit</span>
        </button>
      </div>

      {editing && (
        <EditProfileForm
          profile={activeProfile}
          onClose={() => setEditing(false)}
        />
      )}
    </section>
  )
}
