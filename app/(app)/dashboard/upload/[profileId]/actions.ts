'use server'

import { redirect }            from 'next/navigation'
import { createClient }        from '@/lib/supabase/server'
import { documentsService }    from '@/services/documents.service'
import { familyService }       from '@/services/family.service'
import type { PrescriptionData, PrescriptionExplanation }  from '@/types/prescription'
import type { LabReportData, LabReportExplanation }     from '@/types/lab-report'

export type SaveUploadResult =
  | { success: true;  documentId: string }
  | { success: false; error: string }

/**
 * Persist an extracted prescription to the database.
 *
 * Called by the authenticated upload review screen when the user clicks
 * "Looks good — Save Prescription". Validates that the profile belongs to
 * the current user before writing.
 */
export async function savePrescription(
  profileId: string,
  data: PrescriptionData,
  fileUrl: string = 'ocr-extracted',
  explanation?: PrescriptionExplanation
): Promise<SaveUploadResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify the profile belongs to this user
  const profiles = await familyService.getProfiles(user.id)
  const profile = profiles.data?.find((p) => p.id === profileId)
  if (!profile) return { success: false, error: 'Profile not found' }

  const result = await documentsService.createFromExtraction(
    user.id,
    profileId,
    'prescription',
    data,
    fileUrl,
    explanation
  )

  if (!result.success) return { success: false, error: result.error ?? 'Save failed' }

  return { success: true, documentId: result.data!.id }
}

/**
 * Persist an extracted lab report to the database.
 */
export async function saveLabReport(
  profileId: string,
  data: LabReportData,
  fileUrl: string = 'ocr-extracted',
  labExplanation?: LabReportExplanation
): Promise<SaveUploadResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const profiles = await familyService.getProfiles(user.id)
  const profile = profiles.data?.find((p) => p.id === profileId)
  if (!profile) return { success: false, error: 'Profile not found' }

  const result = await documentsService.createFromExtraction(
    user.id,
    profileId,
    'lab_report',
    data,
    fileUrl,
    undefined,
    labExplanation
  )

  if (!result.success) return { success: false, error: result.error ?? 'Save failed' }

  return { success: true, documentId: result.data!.id }
}

/**
 * Save a pending upload that was captured before the user logged in.
 * Called by PendingUploadBanner after auth. Auto-assigns to the self profile.
 */
export async function savePendingUpload(
  type: 'prescription' | 'lab_report',
  data: PrescriptionData | LabReportData,
  explanation?: PrescriptionExplanation,
  labExplanation?: LabReportExplanation
): Promise<SaveUploadResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const profiles = await familyService.getProfiles(user.id)
  // Always save pending uploads to the "self" profile
  const selfProfile = profiles.data?.find((p) => p.is_self) ?? profiles.data?.[0]
  if (!selfProfile) return { success: false, error: 'No profile found. Please add yourself first.' }

  const result = await documentsService.createFromExtraction(
    user.id,
    selfProfile.id,
    type,
    data,
    'ocr-extracted',
    explanation,
    labExplanation
  )

  if (!result.success) return { success: false, error: result.error ?? 'Save failed' }

  return { success: true, documentId: result.data!.id }
}

/**
 * Redirect helper — centralises post-save navigation.
 * Use this after a successful save when you want to navigate from a server
 * action (redirect() cannot be called from client components).
 */
export async function redirectToHub(profileId: string) {
  redirect(`/dashboard?profile=${profileId}`)
}
