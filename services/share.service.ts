// Share service — Stage 7
// Manages shared link generation, validation, and data retrieval for S13/S14.

import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { MedicationExplanation } from '@/types/analysis'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface SharedLinkData {
  id: string
  shareToken: string
  documentIds: string[]
  expiresAt: string
  isRevoked: boolean
  viewCount: number
  createdAt: string
}

export interface SharedPrescriptionView {
  shareToken: string
  sharerName: string
  patientName: string
  doctorName: string | null
  documentDate: string | null
  tags: string[]
  medications: (MedicationExplanation & { id: string })[]
  doctorNotes: string[]
  isExpired: boolean
  isRevoked: boolean
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const shareService = {
  /**
   * Create a share link for a specific document.
   * Generates a UUID token, inserts a shared_links row, returns the link data.
   */
  async createShareLink(
    documentId: string,
    userId: string
  ): Promise<ApiResponse<SharedLinkData>> {
    const supabase = await createClient()

    // Verify the document belongs to this user
    const { data: doc } = await supabase
      .from('documents')
      .select('id, profile_id')
      .eq('id', documentId)
      .eq('user_id', userId)
      .maybeSingle()

    if (!doc) return { data: null, error: 'Document not found', success: false }

    // Check if an active share link already exists for this document
    const { data: existing } = await supabase
      .from('shared_links')
      .select('*')
      .eq('user_id', userId)
      .contains('shared_document_ids', [documentId])
      .eq('is_revoked', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (existing) {
      return {
        data: {
          id: existing.id,
          shareToken: existing.share_token,
          documentIds: existing.shared_document_ids ?? [],
          expiresAt: existing.expires_at,
          isRevoked: existing.is_revoked ?? false,
          viewCount: existing.view_count ?? 0,
          createdAt: existing.created_at ?? '',
        },
        error: null,
        success: true,
      }
    }

    // Create a new shared link — expires in 30 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { data: link, error } = await supabase
      .from('shared_links')
      .insert({
        user_id: userId,
        profile_id: doc.profile_id,
        shared_document_ids: [documentId],
        expires_at: expiresAt.toISOString(),
        include_medications: true,
        include_lab_trends: false,
        include_timeline: false,
      })
      .select()
      .single()

    if (error || !link) {
      return { data: null, error: error?.message ?? 'Failed to create share link', success: false }
    }

    return {
      data: {
        id: link.id,
        shareToken: link.share_token,
        documentIds: link.shared_document_ids ?? [],
        expiresAt: link.expires_at,
        isRevoked: link.is_revoked ?? false,
        viewCount: link.view_count ?? 0,
        createdAt: link.created_at ?? '',
      },
      error: null,
      success: true,
    }
  },

  /**
   * Fetch shared prescription data by token — used by S14 public view.
   * No auth required. Uses the get_shared_link RPC to bypass RLS.
   */
  async getSharedPrescription(
    token: string
  ): Promise<ApiResponse<SharedPrescriptionView>> {
    const supabase = await createClient()

    // Use the RPC function that bypasses RLS for public access
    const { data: links, error: linkError } = await supabase
      .rpc('get_shared_link', { token })

    if (linkError || !links || links.length === 0) {
      return { data: null, error: 'Share link not found', success: false }
    }

    const link = links[0]

    // Check if revoked
    if (link.is_revoked) {
      return {
        data: {
          shareToken: token,
          sharerName: '',
          patientName: '',
          doctorName: null,
          documentDate: null,
          tags: [],
          medications: [],
          doctorNotes: [],
          isExpired: false,
          isRevoked: true,
        },
        error: null,
        success: true,
      }
    }

    // Check if expired
    if (new Date(link.expires_at) < new Date()) {
      return {
        data: {
          shareToken: token,
          sharerName: '',
          patientName: '',
          doctorName: null,
          documentDate: null,
          tags: [],
          medications: [],
          doctorNotes: [],
          isExpired: true,
          isRevoked: false,
        },
        error: null,
        success: true,
      }
    }

    const documentIds = link.shared_document_ids ?? []
    if (documentIds.length === 0) {
      return { data: null, error: 'No documents in this share link', success: false }
    }

    // Fetch documents + analyses (using service role via RPC context)
    const { data: rawDocs } = await supabase
      .from('documents')
      .select(`
        id, doctor_name, document_date, tags,
        document_analyses ( medications_found, recommendations )
      `)
      .in('id', documentIds)
      .limit(1)

    const doc = (rawDocs as unknown as Array<{
      id: string
      doctor_name: string | null
      document_date: string | null
      tags: string[] | null
      document_analyses: Array<{
        medications_found: unknown
        recommendations: unknown
      }>
    }>)?.[0]

    if (!doc) {
      return { data: null, error: 'Shared document not found', success: false }
    }

    const analysis = doc.document_analyses?.[0] ?? null
    const storedMeds = (analysis?.medications_found as MedicationExplanation[]) ?? []
    const medications = storedMeds.map((m, i) => ({ ...m, id: `med-${i}` }))
    const doctorNotes = (analysis?.recommendations as string[]) ?? []

    // Fetch profile name for patient context
    const { data: profile } = await supabase
      .from('family_profiles')
      .select('full_name')
      .eq('id', link.profile_id)
      .maybeSingle()

    const patientName = profile?.full_name ?? 'Patient'

    // Fetch sharer name
    const { data: sharerProfile } = await supabase
      .from('family_profiles')
      .select('full_name')
      .eq('id', link.profile_id)
      .maybeSingle()

    const sharerName = sharerProfile?.full_name ?? 'A Nuskha user'

    // Update view count (best-effort)
    supabase
      .from('shared_links')
      .update({
        view_count: (link.view_count ?? 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', link.id)
      .then(() => undefined)
      .catch(() => undefined)

    return {
      data: {
        shareToken: token,
        sharerName,
        patientName,
        doctorName: doc.doctor_name,
        documentDate: doc.document_date,
        tags: doc.tags ?? [],
        medications,
        doctorNotes,
        isExpired: false,
        isRevoked: false,
      },
      error: null,
      success: true,
    }
  },

  /**
   * Revoke a share link — used by the owner to disable sharing.
   */
  async revokeShareLink(
    linkId: string,
    userId: string
  ): Promise<ApiResponse<null>> {
    const supabase = await createClient()

    const { error } = await supabase
      .from('shared_links')
      .update({ is_revoked: true })
      .eq('id', linkId)
      .eq('user_id', userId)

    if (error) return { data: null, error: error.message, success: false }
    return { data: null, error: null, success: true }
  },

  /**
   * Get existing share link for a document (if any).
   */
  async getShareLinkForDocument(
    documentId: string,
    userId: string
  ): Promise<ApiResponse<SharedLinkData | null>> {
    const supabase = await createClient()

    const { data: link } = await supabase
      .from('shared_links')
      .select('*')
      .eq('user_id', userId)
      .contains('shared_document_ids', [documentId])
      .eq('is_revoked', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (!link) return { data: null, error: null, success: true }

    return {
      data: {
        id: link.id,
        shareToken: link.share_token,
        documentIds: link.shared_document_ids ?? [],
        expiresAt: link.expires_at,
        isRevoked: link.is_revoked ?? false,
        viewCount: link.view_count ?? 0,
        createdAt: link.created_at ?? '',
      },
      error: null,
      success: true,
    }
  },
}
