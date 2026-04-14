import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

export interface MedicationRecord {
  id: string
  user_id: string
  profile_id: string
  name: string
  dosage: string | null
  frequency: string | null
  start_date: string | null
  end_date: string | null
  status: 'active' | 'completed' | 'paused'
  source_document_id: string | null
  created_at: string
}

export const medicationsService = {
  async getMedications(
    userId: string,
    profileId?: string
  ): Promise<ApiResponse<MedicationRecord[]>> {
    const supabase = await createClient()

    let query = supabase
      .from('medications')
      .select('id, user_id, profile_id, name, dosage, frequency, start_date, end_date, status, source_document_id, created_at')
      .order('created_at', { ascending: false })

    if (profileId) {
      query = query.eq('profile_id', profileId)
    }

    const { data, error } = await query

    if (error) return { data: null, error: error.message, success: false }
    return { data: (data ?? []) as MedicationRecord[], error: null, success: true }
  },
}
