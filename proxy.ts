import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

// Matcher excludes static assets and the OCR API route from session refresh.
// `/upload` IS run through the proxy so middleware can enforce auth  see
// `lib/supabase/middleware.ts` `protectedPrefixes`.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/ocr|api/explain).*)',
  ],
}
