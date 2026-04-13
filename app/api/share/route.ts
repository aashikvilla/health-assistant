// POST /api/share — create a new share link
// GET  /api/share?token=xxx — retrieve shared prescription (public)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { shareService } from '@/services/share.service'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { profileId, documentIds, includeMedications, includeTimeline, includeLabTrends, expiresInHours } = body

  if (!profileId) {
    return NextResponse.json({ error: 'profileId is required' }, { status: 400 })
  }

  const result = await shareService.createShareLink(user.id, {
    profileId,
    documentIds,
    includeMedications,
    includeTimeline,
    includeLabTrends,
    expiresInHours,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ data: result.data })
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 })
  }

  const result = await shareService.getSharedPrescription(token)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 })
  }

  return NextResponse.json({ data: result.data })
}
