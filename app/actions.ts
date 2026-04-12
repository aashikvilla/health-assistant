'use server'

import { redirect }         from 'next/navigation'
import { headers }          from 'next/headers'
import { createClient }     from '@/lib/supabase/server'
import { familyService }    from '@/services/family.service'

export async function signIn(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()

  const email    = formData.get('email')    as string
  const password = formData.get('password') as string
  const returnTo = formData.get('returnTo') as string | null

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  if (data.user) {
    await familyService.ensureSelfProfile(data.user.id, data.user.email ?? email)
  }

  redirect(returnTo ?? '/dashboard')
}

export async function signUp(_prevState: unknown, formData: FormData) {
  const supabase = await createClient()
  const origin   = (await headers()).get('origin') ?? ''

  const email    = formData.get('email')    as string
  const password = formData.get('password') as string
  const returnTo = formData.get('returnTo') as string | null

  // Point email confirmation link back to our callback so ensureSelfProfile runs
  const callbackUrl = `${origin}/auth/callback?next=${encodeURIComponent(returnTo ?? '/dashboard')}`

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: callbackUrl },
  })

  if (error) return { error: error.message }

  if (data.user && data.session) {
    // Email confirmation disabled — session available immediately
    await familyService.ensureSelfProfile(data.user.id, data.user.email ?? email)
    redirect(returnTo ?? '/dashboard')
  }

  // Email confirmation required — tell the user to check their inbox
  return { info: 'Check your email! We sent you a confirmation link to finish signing up.' }
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
