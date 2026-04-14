'use client'

import Link from 'next/link'
import type { FamilyProfile } from '@/types/family'

interface ProfileChipProps {
  profile:   FamilyProfile
  isActive:  boolean
  href:      string
}

export function ProfileChip({ profile, isActive, href }: ProfileChipProps) {
  const initials = profile.full_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 min-w-[56px]"
      aria-label={`Switch to ${profile.full_name}'s profile`}
    >
      <div
        className={[
          'w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all',
          isActive
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-surface-subtle text-text-secondary hover:bg-surface-muted',
        ].join(' ')}
        style={undefined}
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <span
        className={[
          'text-xs max-w-[56px] truncate text-center',
          isActive ? 'font-semibold text-text-primary' : 'text-text-muted',
        ].join(' ')}
      >
        {profile.is_self ? 'You' : profile.full_name.split(' ')[0]}
      </span>
    </Link>
  )
}
