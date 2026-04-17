import type { Metadata } from 'next'
import { redirect }              from 'next/navigation'
import { createClient }          from '@/lib/supabase/server'
import { recordsService }  from '@/services/records.service'
import { familyService }   from '@/services/family.service'
import { DocumentDetail }  from '@/components/features/records/DocumentDetail'
import type { RecordDetail } from '@/services/records.service'

export const metadata: Metadata = { title: 'Record  Vitae' }

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

  const record: RecordDetail = recordResult.data

  const profile = profilesResult.data?.find((p) => p.id === record.profileId)
  const profileName = profile?.full_name ?? 'Family Member'
  const isOwnProfile = profile?.is_self ?? false

  // Explanation is generated client-side after page load (see ExplanationLoader).
  // This avoids blocking the render on a 10-30s AI API call.
  const hasRichMedications = record.medications.some((m) => m.treats)
  const needsExplanation =
    record.documentType === 'prescription' &&
    !hasRichMedications &&
    !!record.documentId &&
    record.medications.length > 0

  // ── Signed URL for the original uploaded file (1-hour expiry) ───────────────
  let signedFileUrl: string | null = null
  if (record.fileUrl && record.fileUrl !== 'ocr-extracted') {
    const { data } = await supabase.storage
      .from('medical-documents')
      .createSignedUrl(record.fileUrl, 3600)
    signedFileUrl = data?.signedUrl ?? null
  }

  return (
    <DocumentDetail
      record={record}
      profileName={profileName}
      signedFileUrl={signedFileUrl}
      isOwnProfile={isOwnProfile}
      needsExplanation={needsExplanation}
    />
  )
}
