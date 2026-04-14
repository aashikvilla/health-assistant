'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MedicationRecord } from '@/services/medications.service'

export function useMedications(profileId?: string) {
  const [medications, setMedications] = useState<MedicationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    let query = supabase
      .from('medications')
      .select('id, user_id, profile_id, name, dosage, frequency, start_date, end_date, status, source_document_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data, error: err } = await query
    if (err) {
      setError(err.message)
    } else {
      setMedications((data ?? []) as MedicationRecord[])
    }
    setLoading(false)
  }, [profileId])

  useEffect(() => { fetch() }, [fetch])

  return { medications, loading, error, refetch: fetch }
}
