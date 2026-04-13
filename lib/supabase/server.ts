import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

const DEV_MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'dev@localhost',
  app_metadata: {},
  user_metadata: { full_name: 'Dev User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from Server Component — middleware handles session refresh
          }
        },
      },
    }
  )

  if (process.env.DEV_BYPASS_AUTH === 'true' && process.env.NODE_ENV === 'development') {
    return new Proxy(client, {
      get(target, prop) {
        if (prop === 'auth') {
          return new Proxy(target.auth, {
            get(authTarget, authProp) {
              if (authProp === 'getUser') {
                return async () => ({ data: { user: DEV_MOCK_USER }, error: null })
              }
              return (authTarget as unknown as Record<string, unknown>)[authProp as string]
            },
          })
        }
        return (target as unknown as Record<string, unknown>)[prop as string]
      },
    }) as typeof client
  }

  return client
}
