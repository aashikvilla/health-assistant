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

// Mock query builder that returns empty results for all DB calls in dev bypass mode.
// This prevents Supabase API errors when running with placeholder keys.
function createMockQueryBuilder() {
  const builder: Record<string, unknown> = {}
  const chainMethods = [
    'select', 'insert', 'update', 'delete', 'upsert',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
    'is', 'in', 'contains', 'containedBy', 'not',
    'or', 'and', 'filter', 'match',
    'order', 'limit', 'range', 'single', 'maybeSingle',
    'csv', 'returns',
  ]
  for (const method of chainMethods) {
    builder[method] = () => builder
  }
  // Terminal — return empty success
  builder.then = (resolve: (val: unknown) => void) =>
    resolve({ data: [], error: null, count: 0 })

  // Make it thenable so `await supabase.from(...).select(...)` works
  Object.defineProperty(builder, 'then', {
    value: (
      onFulfilled?: (value: { data: unknown[]; error: null; count: number }) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => {
      const result = { data: [], error: null, count: 0 }
      return Promise.resolve(result).then(onFulfilled, onRejected)
    },
    configurable: true,
    writable: true,
  })

  return builder
}

function createDevMockClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: DEV_MOCK_USER }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from: () => createMockQueryBuilder(),
    rpc: () => Promise.resolve({ data: [], error: null }),
    storage: { from: () => ({}) },
  }
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
    // Return a fully mocked client that never hits Supabase API.
    // All DB queries return empty arrays; auth returns the mock user.
    return createDevMockClient() as unknown as typeof client
  }

  return client
}
