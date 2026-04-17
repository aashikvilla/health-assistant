'use server'

import { createClient }       from '@/lib/supabase/server'
import { recordsService }     from '@/services/records.service'
import { documentsService }   from '@/services/documents.service'
import { generateExplanation } from '@/lib/explain'

/**
 * Generate and persist an AI explanation for a prescription document.
 * Called client-side after page load so it never blocks the initial render.
 */
export async function generateRecordExplanation(
  documentId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return { success: false }

  const explResult = await recordsService.getDocumentWithExplanation(documentId, user.id)
  const rawData = explResult.data

  if (!rawData || rawData.hasExplanation || !rawData.rawPrescriptionData) {
    return { success: true }
  }

  const generated = await generateExplanation(rawData.rawPrescriptionData, apiKey)
  if (!generated) return { success: false }

  await documentsService.saveExplanationToAnalysis(
    documentId,
    generated.medications.map(({ id: _id, ...m }) => m),
    generated.doctorNotes,
  )

  return { success: true }
}
