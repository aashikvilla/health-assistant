'use client'

import Link from 'next/link'
import type { FamilyProfile } from '@/types/family'

interface ProfileChipProps {
  profile:   FamilyProfile
  isActive:  boolean
  href:      string
}

export function ProfileChip({ profile, isActive, href }: ProfileChipProps) {
  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 min-w-[56px]"
      aria-label={`Switch to ${profile.name}'s profile`}
    >
      <div
        className={[
          'w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold transition-all',
          'border-2',
          isActive
            ? 'bg-primary text-primary-foreground border-primary shadow-md'
            : 'bg-surface-subtle text-text-secondary border-border hover:border-border-strong',
        ].join(' ')}
      >
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.name}
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
        {profile.is_self ? 'You' : profile.name.split(' ')[0]}
      </span>
    </Link>
  )
}
