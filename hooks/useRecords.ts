'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface RecordSummary {
  id: string
  profile_id: string
  document_type: string
  doctor_name: string | null
  document_date: string | null
  processing_status: string
  created_at: string
}

export function useRecords(profileId?: string) {
  const [records, setRecords] = useState<RecordSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    let query = supabase
      .from('documents')
      .select('id, profile_id, document_type, doctor_name, document_date, processing_status, created_at')
      .order('created_at', { ascending: false })

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data, error: err } = await query
    if (err) {
      setError(err.message)
    } else {
      setRecords((data ?? []) as RecordSummary[])
    }
    setLoading(false)
  }, [profileId])

  useEffect(() => { fetch() }, [fetch])

  return { records, loading, error, refetch: fetch }
}
