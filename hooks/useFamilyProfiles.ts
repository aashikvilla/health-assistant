'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { FamilyProfile } from '@/types/family'

export function useFamilyProfiles() {
  const [profiles, setProfiles] = useState<FamilyProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    // Get all profile IDs this user has memberships for
    const { data: memberships, error: memErr } = await supabase
      .from('profile_memberships')
      .select('profile_id, relationship, is_self')
      .eq('user_id', user.id)

    if (memErr || !memberships) {
      setError(memErr?.message ?? 'Failed to load profiles')
      setLoading(false)
      return
    }

    const profileIds = memberships.map((m) => m.profile_id)
    if (profileIds.length === 0) {
      setProfiles([])
      setLoading(false)
      return
    }

    const { data: profileRows, error: profErr } = await supabase
      .from('family_profiles')
      .select('id, family_group_id, full_name, email, date_of_birth, avatar_url, created_at, updated_at')
      .in('id', profileIds)

    if (profErr || !profileRows) {
      setError(profErr?.message ?? 'Failed to load profiles')
      setLoading(false)
      return
    }

    const membershipMap = new Map(memberships.map((m) => [m.profile_id, m]))
    const result: FamilyProfile[] = profileRows.map((p) => {
      const mem = membershipMap.get(p.id)
      return {
        ...(p as unknown as FamilyProfile),
        relationship: (mem?.relationship ?? 'other') as FamilyProfile['relationship'],
        is_self: mem?.is_self ?? false,
      }
    })

    // Self profile first
    result.sort((a, b) => (b.is_self ? 1 : 0) - (a.is_self ? 1 : 0))
    setProfiles(result)
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { profiles, loading, error, refetch: fetch }
}
