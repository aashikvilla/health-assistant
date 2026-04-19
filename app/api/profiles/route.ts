/**
 * Profiles API Route
 * 
 * Returns the authenticated user's family profiles.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get profiles the user has access to via profile_memberships
    const { data: memberships, error: membershipsError } = await supabase
      .from('profile_memberships')
      .select('profile_id')
      .eq('user_id', user.id)

    if (membershipsError) {
      console.error('Error fetching memberships:', membershipsError)
      return NextResponse.json({ error: membershipsError.message }, { status: 500 })
    }

    const profileIds = memberships?.map(m => m.profile_id) || []

    if (profileIds.length === 0) {
      return NextResponse.json([])
    }

    const { data: profiles, error } = await supabase
      .from('family_profiles')
      .select('id, full_name, date_of_birth')
      .in('id', profileIds)

    if (error) {
      console.error('Error fetching profiles:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(profiles || [])
  } catch (err) {
    console.error('Profiles API error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
