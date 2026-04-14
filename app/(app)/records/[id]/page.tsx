import type { Metadata } from 'next'
import { redirect }       from 'next/navigation'
import { createClient }   from '@/lib/supabase/server'
import { recordsService } from '@/services/records.service'
import { familyService }  from '@/services/family.service'
import { DocumentDetail } from '@/components/features/records/DocumentDetail'
 
export const metadata: Metadata = { title: 'Record — Vitae' }
 
export default async function RecordPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
 
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
 
  const [recordResult, profilesResult] = await Promise.all([
    recordsService.getRecord(id, user.id),
    familyService.getProfiles(user.id),
  ])
 
  if (!recordResult.success || !recordResult.data) redirect('/dashboard')
 
  const profile = profilesResult.data?.find(
    (p) => p.id === recordResult.data!.profileId
  )
  const profileName = profile?.full_name ?? 'Family Member'
 
  return <DocumentDetail record={recordResult.data} profileName={profileName} />
}