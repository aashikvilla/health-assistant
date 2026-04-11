// Stage 5 — Family Hub service
// Plain async functions. No React. No side effects.

import { createClient }            from '@/lib/supabase/server'
import type { ApiResponse }        from '@/types'
import type {
  FamilyProfile,
  HubPrescription,
  CreateProfileInput,
} from '@/types/family'

export const familyService = {
  // ─── Profiles ─────────────────────────────────────────────────────────────

  async getProfiles(userId: string): Promise<ApiResponse<FamilyProfile[]>> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('family_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('is_self', { ascending: false })   // "You" card always first
      .order('created_at', { ascending: true })

    if (error) return { data: null, error: error.message, success: false }
    return { data: data ?? [], error: null, success: true }
  },

  async createProfile(
    userId: string,
    input: CreateProfileInput
  ): Promise<ApiResponse<FamilyProfile>> {
    const supabase = await createClient()

    // Enforce 5-profile limit
    const { count } = await supabase
      .from('family_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if ((count ?? 0) >= 5) {
      return {
        data:    null,
        error:   'Profile limit reached. Upgrade to Pro for unlimited profiles.',
        success: false,
      }
    }

    const { data, error } = await supabase
      .from('family_profiles')
      .insert({
        user_id:      userId,
        full_name:    input.name,
        relationship: input.relationship,
        date_of_birth: input.dob ?? null,
        is_self:      false,
      })
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data, error: null, success: true }
  },

  // Ensures a "self" profile exists for a new user. Called after OTP signup.
  async ensureSelfProfile(
    userId: string,
    name: string
  ): Promise<ApiResponse<FamilyProfile>> {
    const supabase = await createClient()

    // Upsert — safe to call multiple times
    const { data, error } = await supabase
      .from('family_profiles')
      .upsert(
        {
          user_id:      userId,
          full_name:    name,
          relationship: 'self',
          is_self:      true,
        },
        { onConflict: 'user_id,is_self', ignoreDuplicates: true }
      )
      .select()
      .single()

    if (error) return { data: null, error: error.message, success: false }
    return { data, error: null, success: true }
  },

  // ─── Prescriptions ────────────────────────────────────────────────────────
  // Lightweight read — full prescription data lives in Stage 6 (records)

  async getProfilePrescriptions(
    profileId: string,
    limit = 10
  ): Promise<ApiResponse<HubPrescription[]>> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('prescriptions')
      .select(
        'id, profile_id, doctor_name, prescription_date, condition_tags, medication_count, created_at'
      )
      .eq('profile_id', profileId)
      .order('prescription_date', { ascending: false })
      .limit(limit)

    if (error) return { data: null, error: error.message, success: false }
    return { data: data ?? [], error: null, success: true }
  },
}
