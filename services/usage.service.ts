import { createClient } from '@/lib/supabase/server'

const SUCCESSFUL_CAP = 6
const INVALID_CAP    = 10

export const usageService = {
  async checkLimit(userId: string): Promise<{ allowed: boolean; reason: 'blocked' | 'cap' | null }> {
    const supabase = await createClient()
    const { data } = await supabase
      .from('user_usage')
      .select('successful_uploads, is_blocked')
      .eq('user_id', userId)
      .single()

    if (!data) return { allowed: true, reason: null }
    if (data.is_blocked) return { allowed: false, reason: 'blocked' }
    if (data.successful_uploads >= SUCCESSFUL_CAP) return { allowed: false, reason: 'cap' }
    return { allowed: true, reason: null }
  },

  async incrementSuccessful(userId: string): Promise<void> {
    const supabase = await createClient()
    await supabase.rpc('increment_successful_upload', { p_user_id: userId })
  },

  async incrementInvalid(userId: string): Promise<void> {
    const supabase = await createClient()
    await supabase.rpc('increment_invalid_upload', { p_user_id: userId })
  },
}

export { SUCCESSFUL_CAP, INVALID_CAP }
