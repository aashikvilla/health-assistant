import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Skip Supabase auth when env vars are not configured (local dev without Supabase)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect app routes — unauthenticated users go to /auth.
  // /upload is NOT listed here — the public /upload page is intentionally unauthenticated.
  // Authenticated upload lives at /dashboard/upload/[profileId] (covered by the /dashboard prefix).
  const protectedPrefixes = ['/dashboard', '/timeline', '/settings', '/records', '/explanation']
  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix)
  )
  if (!user && isProtected && process.env.DEV_BYPASS_AUTH !== 'true') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth page
  if (user && request.nextUrl.pathname === '/auth') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
