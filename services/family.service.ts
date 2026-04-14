// Stage 5 — Family Hub service
// Plain async functions. No React. No side effects.

import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type {
  FamilyProfile,
  HubPrescription,
  CreateProfileInput,
} from '@/types/family'

// ─── Internal helpers ─────────────────────────────────────────────────────────

type MembershipRow = {
  relationship: string
  is_self: boolean
}

type ProfileRow = {
  id: string
  family_group_id: string
  full_name: string
  email: string | null
  date_of_birth: string | null
  avatar_url?: string | null
  created_at: string | null
  updated_at: string | null
  // nested memberships for the current user (0 or 1 rows)
  profile_memberships: MembershipRow[]
}

function rowToProfile(row: ProfileRow): FamilyProfile {
  const mem = row.profile_memberships?.[0]
  return {
    id: row.id,
    family_group_id: row.family_group_id,
    full_name: row.full_name,
    email: row.email ?? null,
    relationship: (mem?.relationship ?? 'other') as FamilyProfile['relationship'],
    date_of_birth: row.date_of_birth ?? null,
    avatar_url: row.avatar_url ?? null,
    is_self: mem?.is_self ?? false,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const familyService = {

  // ─── Profiles ───────────────────────────────────────────────────────────────

  async getProfiles(userId: string): Promise<ApiResponse<FamilyProfile[]>> {
    const supabase = await createClient()

    // RLS on family_profiles returns all profiles in the user's family groups.
    // Nested select on profile_memberships (also RLS-gated to user_id = auth.uid())
    // gives us the per-user relationship label.
    const { data, error } = await supabase
      .from('family_profiles')
      .select(`
        id, family_group_id, full_name, email,
        date_of_birth, avatar_url, created_at, updated_at,
        profile_memberships ( relationship, is_self )
      `)

    if (error) return { data: null, error: error.message, success: false }

    const profiles = (data as unknown as ProfileRow[])
      .map(rowToProfile)
      // self profile first, then by creation date
      .sort((a, b) => {
        if (a.is_self && !b.is_self) return -1
        if (!a.is_self && b.is_self) return 1
        return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime()
      })

    return { data: profiles, error: null, success: true }
  },

  async createProfile(
    userId: string,
    input: CreateProfileInput
  ): Promise<ApiResponse<FamilyProfile>> {
    const supabase = await createClient()

    // Get the user's family group from their existing self membership
    const { data: selfMem, error: memErr } = await supabase
      .from('profile_memberships')
      .select('family_group_id')
      .eq('user_id', userId)
      .eq('is_self', true)
      .maybeSingle()

    if (memErr) return { data: null, error: memErr.message, success: false }
    if (!selfMem) return { data: null, error: 'No family group found. Please complete your profile setup.', success: false }

    // Enforce 5-profile limit per user
    const { count } = await supabase
      .from('profile_memberships')
      .select('profile_id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if ((count ?? 0) >= 5) {
      return {
        data: null,
        error: 'Profile limit reached. Upgrade to Pro for unlimited profiles.',
        success: false,
      }
    }

    const familyGroupId = selfMem.family_group_id

    // Create the profile
    const { data: profile, error: profileErr } = await supabase
      .from('family_profiles')
      .insert({
        family_group_id: familyGroupId,
        full_name: input.name,
        date_of_birth: input.dob ?? null,
        email: input.email ?? null,
      })
      .select('id, family_group_id, full_name, email, date_of_birth, avatar_url, created_at, updated_at')
      .single()

    if (profileErr || !profile) {
      return { data: null, error: profileErr?.message ?? 'Failed to create profile', success: false }
    }

    // Create the membership for this user
    const { error: memberErr } = await supabase
      .from('profile_memberships')
      .insert({
        user_id: userId,
        profile_id: profile.id,
        family_group_id: familyGroupId,
        relationship: input.relationship,
        is_self: false,
      })

    if (memberErr) {
      // Roll back profile to avoid orphan
      await supabase.from('family_profiles').delete().eq('id', profile.id)
      return { data: null, error: memberErr.message, success: false }
    }

    const result: FamilyProfile = {
      ...profile,
      relationship: input.relationship,
      is_self: false,
    }

    return { data: result, error: null, success: true }
  },

  /**
   * Ensure a self-profile exists for a user.
   * Called after every sign-up and OAuth login. Idempotent.
   *
   * Three cases handled:
   *  1. Already has a self membership  → no-op, return existing profile
   *  2. A profile with matching email exists (added by a family member)
   *     → claim it, auto-join all profiles in the same family group
   *  3. Brand new user → create family_group + profile + membership
   */
  async ensureSelfProfile(
    userId: string,
    email: string
  ): Promise<ApiResponse<FamilyProfile>> {
    const supabase = await createClient()

    // ── Case 1: self membership already exists ──────────────────────────────
    const { data: existingMem } = await supabase
      .from('profile_memberships')
      .select('profile_id, family_group_id')
      .eq('user_id', userId)
      .eq('is_self', true)
      .maybeSingle()

    if (existingMem) {
      const { data: profile } = await supabase
        .from('family_profiles')
        .select('id, family_group_id, full_name, email, date_of_birth, avatar_url, created_at, updated_at')
        .eq('id', existingMem.profile_id)
        .single()

      if (profile) {
        return {
          data: { ...(profile as unknown as FamilyProfile), relationship: 'self', is_self: true },
          error: null,
          success: true,
        }
      }
    }

    // ── Case 2: claimable profile with matching email ───────────────────────
    const { data: claimable } = await supabase
      .from('family_profiles')
      .select('id, family_group_id, full_name, email, date_of_birth, avatar_url, created_at, updated_at')
      .eq('email', email)
      .maybeSingle()

    if (claimable) {
      // Guard: check if this profile is already claimed (has an is_self membership)
      const { data: alreadyClaimed } = await supabase
        .from('profile_memberships')
        .select('user_id')
        .eq('profile_id', claimable.id)
        .eq('is_self', true)
        .maybeSingle()

      if (!alreadyClaimed) {
        const familyGroupId = (claimable as unknown as { family_group_id: string }).family_group_id

        // Create self membership for this account
        await supabase.from('profile_memberships').insert({
          user_id: userId,
          profile_id: claimable.id,
          family_group_id: familyGroupId,
          relationship: 'self',
          is_self: true,
        })

        // Auto-join all other profiles in the same family group
        const { data: groupProfiles } = await supabase
          .from('family_profiles')
          .select('id')
          .eq('family_group_id', familyGroupId)
          .neq('id', claimable.id)

        if (groupProfiles && groupProfiles.length > 0) {
          const memberships = groupProfiles.map((p) => ({
            user_id: userId,
            profile_id: p.id,
            family_group_id: familyGroupId,
            relationship: 'other' as const,
            is_self: false,
          }))
          // Best-effort — don't block on errors
          try { await supabase.from('profile_memberships').insert(memberships) } catch { /* ignore */ }
        }

        // Ensure users_profile row exists for this account
        await supabase.from('users_profile').upsert(
          { user_id: userId, full_name: (claimable as unknown as FamilyProfile).full_name ?? email.split('@')[0], onboarding_completed: false },
          { onConflict: 'user_id', ignoreDuplicates: true }
        )

        return {
          data: {
            ...(claimable as unknown as FamilyProfile),
            relationship: 'self',
            is_self: true,
          },
          error: null,
          success: true,
        }
      }
    }

    // ── Case 3: brand new user — create group + profile + membership ────────
    //
    // Generate UUIDs client-side for family_group and family_profile.
    // Reason: Supabase's insert().select() uses PostgREST RETURNING which is
    // subject to RLS. The family_groups SELECT policy requires a membership row,
    // but the membership doesn't exist yet — chicken-and-egg. Generating the ID
    // client-side means we never need to SELECT the group back before adding the
    // membership, breaking the cycle.
    const { randomUUID } = await import('crypto')
    const groupId = randomUUID()
    const profileId = randomUUID()

    const { error: groupErr } = await supabase
      .from('family_groups')
      .insert({ id: groupId })

    if (groupErr) {
      return { data: null, error: groupErr.message, success: false }
    }

    const name = email.split('@')[0]

    const { error: profileErr } = await supabase
      .from('family_profiles')
      .insert({
        id: profileId,
        family_group_id: groupId,
        full_name: name,
        email,
      })

    if (profileErr) {
      await supabase.from('family_groups').delete().eq('id', groupId)
      return { data: null, error: profileErr.message, success: false }
    }

    const { error: memberErr } = await supabase
      .from('profile_memberships')
      .insert({
        user_id: userId,
        profile_id: profileId,
        family_group_id: groupId,
        relationship: 'self',
        is_self: true,
      })

    if (memberErr) {
      await supabase.from('family_profiles').delete().eq('id', profileId)
      await supabase.from('family_groups').delete().eq('id', groupId)
      return { data: null, error: memberErr.message, success: false }
    }

    // Ensure users_profile row exists for this new account (best-effort — non-fatal)
    await supabase.from('users_profile').upsert(
      { user_id: userId, full_name: name, onboarding_completed: false },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )

    // Fetch the created profile to return (now the membership exists, SELECT policy passes)
    const { data: profile } = await supabase
      .from('family_profiles')
      .select('id, family_group_id, full_name, email, date_of_birth, avatar_url, created_at, updated_at')
      .eq('id', profileId)
      .single()

    return {
      data: {
        ...(profile as unknown as FamilyProfile) ?? {
          id: profileId,
          family_group_id: groupId,
          full_name: name,
          email,
          date_of_birth: null,
          avatar_url: null,
          created_at: null,
          updated_at: null,
        },
        relationship: 'self' as const,
        is_self: true,
      },
      error: null,
      success: true,
    }
  },

  // ─── Prescriptions ────────────────────────────────────────────────────────
  // Lightweight read — full prescription data lives in Stage 6 (records)

  async getProfilePrescriptions(
    profileId: string,
    limit = 10
  ): Promise<ApiResponse<HubPrescription[]>> {
    const supabase = await createClient()
    // Fetch prescriptions + matching documents in parallel.
    // There is no FK between the two tables, so we match in JS using
    // (doctor_name + document_date) as a composite key.
    const [rxResult, docResult] = await Promise.all([
      supabase
        .from('prescriptions')
        .select('id, profile_id, doctor_name, prescription_date, condition_tags, medication_count, created_at')
        .eq('profile_id', profileId)
        .order('prescription_date', { ascending: false })
        .limit(limit),
      supabase
        .from('documents')
        .select('id, doctor_name, document_date')
        .eq('profile_id', profileId)
        .eq('document_type', 'prescription'),
    ])

    if (rxResult.error) return { data: null, error: rxResult.error.message, success: false }

    // Build lookup: "${doctor_name}::${document_date}" → documents.id
    const docLookup = new Map<string, string>()
    for (const d of docResult.data ?? []) {
      const key = `${d.doctor_name ?? ''}::${d.document_date ?? ''}`
      docLookup.set(key, d.id)
    }

    const prescriptions: HubPrescription[] = (rxResult.data ?? []).map((rx) => {
      const key = `${rx.doctor_name ?? ''}::${rx.prescription_date ?? ''}`
      return {
        ...(rx as HubPrescription),
        document_id: docLookup.get(key) ?? null,
      }
    })

    return { data: prescriptions, error: null, success: true }
  },
}
