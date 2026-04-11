'use server'

import { redirect }         from 'next/navigation'
import { createClient }     from '@/lib/supabase/server'
import { familyService }    from '@/services/family.service'
import type { ProfileRelationship } from '@/types/family'

type FormState = { error: string | null }

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

  if (!name)         return { error: 'Name is required.' }
  if (!relationship) return { error: 'Relationship is required.' }

  if (process.env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development') {
    redirect('/hub')
  }

  const result = await familyService.createProfile(user.id, { name, relationship, dob })

  if (!result.success) return { error: result.error }

  redirect('/hub')
}
