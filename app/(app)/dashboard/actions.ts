'use server'

import { revalidatePath }   from 'next/cache'
import { redirect }         from 'next/navigation'
import { createClient }     from '@/lib/supabase/server'
import { familyService }    from '@/services/family.service'
import type { ProfileRelationship } from '@/types/family'

type FormState = { error: string | null; success?: boolean }

export async function createProfile(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to add a family member.' }

  const name         = (formData.get('name') as string | null)?.trim()
  const relationship = formData.get('relationship') as ProfileRelationship | null
  const dob          = (formData.get('dob') as string | null) || undefined
  const email        = (formData.get('email') as string | null)?.trim().toLowerCase() || undefined

  if (!name)         return { error: 'Name is required.' }
  if (!relationship) return { error: 'Relationship is required.' }

  if (process.env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development') {
    redirect('/dashboard')
  }

  const result = await familyService.createProfile(user.id, { name, relationship, dob, email })

  if (!result.success) return { error: result.error }

  redirect('/dashboard')
}

export async function updateProfile(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to edit a profile.' }

  const profileId = (formData.get('profile_id') as string | null)?.trim()
  if (!profileId) return { error: 'Profile ID is missing.' }

  const full_name        = (formData.get('full_name') as string | null)?.trim()
  const date_of_birth    = (formData.get('date_of_birth') as string | null) || null
  const blood_group      = (formData.get('blood_group') as string | null)?.trim() || null
  const height_cm        = formData.get('height_cm') ? Number(formData.get('height_cm')) : null
  const weight_kg        = formData.get('weight_kg') ? Number(formData.get('weight_kg')) : null
  const known_conditions = (formData.get('known_conditions') as string | null)
    ?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
  const allergies        = (formData.get('allergies') as string | null)
    ?.split(',').map((s) => s.trim()).filter(Boolean) ?? []

  if (!full_name) return { error: 'Name is required.' }

  // RLS ensures user can only update profiles in their family group
  const { error } = await supabase
    .from('family_profiles')
    .update({ full_name, date_of_birth, blood_group, height_cm, weight_kg, known_conditions, allergies })
    .eq('id', profileId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { error: null, success: true }
}

export async function deleteDocument(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const documentId = formData.get('document_id') as string | null

  // Delete document row (document_analyses cascade-deletes via FK)
  if (documentId) {
    await supabase.from('medications').delete().eq('source_document_id', documentId)
    await supabase.from('timeline_events').delete().eq('source_document_id', documentId)
    await supabase.from('document_analyses').delete().eq('document_id', documentId)
    await supabase.from('documents').delete().eq('id', documentId).eq('user_id', user.id)
  }

  revalidatePath('/dashboard')
  return { error: null, success: true }
}

export async function reassignDocument(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const documentId   = formData.get('document_id') as string | null
  const newProfileId = formData.get('new_profile_id') as string | null
  if (!newProfileId) return { error: 'Select a profile to move this to.' }

  // Verify new profile belongs to user
  const { data: membership } = await supabase
    .from('profile_memberships')
    .select('profile_id')
    .eq('user_id', user.id)
    .eq('profile_id', newProfileId)
    .maybeSingle()
  if (!membership) return { error: 'Profile not found.' }

  if (documentId) {
    await supabase.from('documents').update({ profile_id: newProfileId }).eq('id', documentId).eq('user_id', user.id)
    await supabase.from('medications').update({ profile_id: newProfileId }).eq('source_document_id', documentId)
    await supabase.from('timeline_events').update({ profile_id: newProfileId }).eq('source_document_id', documentId)
  }

  revalidatePath('/dashboard')
  return { error: null, success: true }
}
