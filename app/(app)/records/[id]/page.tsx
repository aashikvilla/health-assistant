import type { Metadata } from 'next'
import { redirect }              from 'next/navigation'
import { createClient }          from '@/lib/supabase/server'
import { recordsService }        from '@/services/records.service'
import { familyService }         from '@/services/family.service'
import { documentsService }      from '@/services/documents.service'
import { generateExplanation }   from '@/lib/explain'
import { DocumentDetail }        from '@/components/features/records/DocumentDetail'
import type { RecordDetail }     from '@/services/records.service'

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

  let record: RecordDetail = recordResult.data

  const profile = profilesResult.data?.find((p) => p.id === record.profileId)
  const profileName = profile?.full_name ?? 'Family Member'
  const isOwnProfile = profile?.is_self ?? false

  // ── On-demand explanation for prescriptions saved without rich AI data ──────
  // This mirrors what the old /explanation/[id] page did. Only fires when:
  //   1. It's a prescription
  //   2. No medication has AI-enriched fields (treats / how_to_take etc.)
  //   3. We have a documentId to look up raw OCR data
  const hasRichMedications = record.medications.some((m) => m.treats)

  if (record.documentType === 'prescription' && !hasRichMedications && record.documentId) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (apiKey) {
      const explResult = await recordsService.getDocumentWithExplanation(record.documentId, user.id)
      const rawData = explResult.data

      if (rawData && !rawData.hasExplanation && rawData.rawPrescriptionData) {
        const generated = await generateExplanation(rawData.rawPrescriptionData, apiKey)
        if (generated) {
          // Merge generated explanation into the record for rendering
          record = {
            ...record,
            medications: generated.medications,
            recommendations: generated.doctorNotes,
          }
          // Persist back so next view is instant (best-effort  non-fatal)
          documentsService.saveExplanationToAnalysis(
            record.documentId!,
            generated.medications.map(({ id: _id, ...m }) => m),
            generated.doctorNotes,
          ).catch(() => undefined)
        }
      }
    }
  }

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
    />
  )
}
