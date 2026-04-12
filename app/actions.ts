'use server'

import { redirect }         from 'next/navigation'
import { headers }          from 'next/headers'
import { createClient }     from '@/lib/supabase/server'
import { familyService }    from '@/services/family.service'

export async function signIn(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  // Idempotent — creates profile only if none exists yet (e.g., if user was
  // added as a family member by someone else before signing up themselves)
  if (data.user) {
    await familyService.ensureSelfProfile(data.user.id, data.user.email ?? email)
  }

  redirect('/dashboard')
}

export async function signUp(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }

  // Create self-profile immediately (works when email confirmation is disabled)
  // When confirmation is required the user won't have a session here, but the
  // auth/callback route will call ensureSelfProfile once they confirm.
  if (data.user && data.session) {
    await familyService.ensureSelfProfile(data.user.id, data.user.email ?? email)
  }

  redirect('/dashboard')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error || !data.url) redirect('/auth?error=google_auth_failed')
  redirect(data.url)
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
