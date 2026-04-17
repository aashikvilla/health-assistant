import { NextResponse }      from 'next/server'
import { createClient }      from '@/lib/supabase/server'
import { familyService }     from '@/services/family.service'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure self-profile exists  handles first OAuth login, email confirmation,
      // and the case where a family member was pre-added before they signed up.
      const metaName = data.user.user_metadata?.full_name as string | undefined
      const result = await familyService.ensureSelfProfile(
        data.user.id,
        data.user.email ?? '',
        metaName
      )

      if (result.error === 'early_access_full') {
        await supabase.auth.signOut()
        return NextResponse.redirect(`${origin}/access-closed`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`)
}
