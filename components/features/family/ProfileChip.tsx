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
      className="flex flex-col items-center gap-1.5 min-w-[60px]"
      aria-label={`Switch to ${profile.full_name}'s profile`}
    >
      {/* Gradient ring on active, plain on inactive */}
      <div
        className={`w-16 h-16 rounded-full transition-all ${isActive ? 'gradient-brand shadow-[0_4px_20px_rgba(124,58,237,.35)]' : 'bg-accent-subtle'}`}
        style={{ padding: isActive ? '3px' : '2px' }}
      >
        <div
          className={`w-full h-full rounded-full flex items-center justify-center font-display text-base font-bold overflow-hidden ${isActive ? 'bg-surface-container-lowest text-primary' : 'bg-surface-subtle text-text-muted'}`}
        >
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      </div>
      <span
        className={`font-body text-[11px] max-w-[64px] truncate text-center ${isActive ? 'font-bold text-primary' : 'font-medium text-text-muted'}`}
      >
        {profile.is_self ? 'Me' : profile.full_name.split(' ')[0]}
      </span>
    </Link>
  )
}
