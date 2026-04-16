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
        className="w-16 h-16 rounded-full transition-all"
        style={
          isActive
            ? { padding: '3px', background: 'linear-gradient(135deg, #1d4ed8, #7c3aed, #c026d3)', boxShadow: '0 4px 20px rgba(124,58,237,.35)' }
            : { padding: '2px', background: 'rgba(124,58,237,.15)' }
        }
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center font-display text-base font-bold overflow-hidden"
          style={
            isActive
              ? { background: '#fff', color: '#1d4ed8' }
              : { background: '#f1f4fb', color: '#64748b' }
          }
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
        className="font-body text-[11px] max-w-[64px] truncate text-center"
        style={{ fontWeight: isActive ? 700 : 500, color: isActive ? '#1d4ed8' : '#64748b' }}
      >
        {profile.is_self ? 'Me' : profile.full_name.split(' ')[0]}
      </span>
    </Link>
  )
}
