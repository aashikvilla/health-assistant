// Share service — Stage 7
// Creates, retrieves, and revokes shareable prescription links.

import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface CreateShareLinkInput {
  profileId: string
  documentIds?: string[]
  includeMedications?: boolean
  includeTimeline?: boolean
  includeLabTrends?: boolean
  /** Expiry in hours from now. Default 72h (3 days). */
  expiresInHours?: number
}

export interface ShareLinkData {
  id: string
  shareToken: string
  expiresAt: string
  createdAt: string | null
}

export interface SharedPrescriptionView {
  shareToken: string
  profileName: string
  doctorName: string | null
  documentDate: string | null
  tags: string[]
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    treats: string
    how_to_take: string
    side_effects: string
    avoid: string
  }>
  doctorNotes: string[]
  summary: string | null
  expiresAt: string
  isExpired: boolean
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const shareService = {
  /**
   * Create a new share link for a profile's prescriptions.
   * Generates a unique token and stores it in shared_links.
   */
  async createShareLink(
    userId: string,
    input: CreateShareLinkInput
  ): Promise<ApiResponse<ShareLinkData>> {
    const supabase = await createClient()

    const expiresInHours = input.expiresInHours ?? 72
    const expiresAt = new Date(
      Date.now() + expiresInHours * 60 * 60 * 1000
    ).toISOString()

    // Generate a random token (hex string)
    const tokenBytes = new Uint8Array(16)
    crypto.getRandomValues(tokenBytes)
    const shareToken = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const { data, error } = await supabase
      .from('shared_links')
      .insert({
        user_id: userId,
        profile_id: input.profileId,
        share_token: shareToken,
        expires_at: expiresAt,
        shared_document_ids: input.documentIds ?? [],
        include_medications: input.includeMedications ?? true,
        include_timeline: input.includeTimeline ?? false,
        include_lab_trends: input.includeLabTrends ?? false,
      })
      .select('id, share_token, expires_at, created_at')
      .single()

    if (error) return { data: null, error: error.message, success: false }

    return {
      data: {
        id: data.id,
        shareToken: data.share_token,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
      },
      error: null,
      success: true,
    }
  },

  /**
   * Retrieve shared prescription data via a public token.
   * No auth required — used by the public /share/[token] route.
   */
  async getSharedPrescription(
    token: string
  ): Promise<ApiResponse<SharedPrescriptionView>> {
    const supabase = await createClient()

    // Fetch the share link
    const { data: link, error: linkError } = await supabase
      .from('shared_links')
      .select('*')
      .eq('share_token', token)
      .eq('is_revoked', false)
      .maybeSingle()

    if (linkError) return { data: null, error: linkError.message, success: false }
    if (!link) return { data: null, error: 'Share link not found or has been revoked', success: false }

    // Check expiry
    const isExpired = new Date(link.expires_at) < new Date()
    if (isExpired) {
      return { data: null, error: 'This share link has expired', success: false }
    }

    // Increment view count
    await supabase
      .from('shared_links')
      .update({
        view_count: (link.view_count ?? 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', link.id)

    // Fetch profile name
    const { data: profile } = await supabase
      .from('family_profiles')
      .select('full_name')
      .eq('id', link.profile_id)
      .maybeSingle()

    const profileName = profile?.full_name ?? 'Family Member'

    // Fetch documents linked to this share
    const docIds = link.shared_document_ids ?? []

    let doctorName: string | null = null
    let documentDate: string | null = null
    let tags: string[] = []
    let medications: SharedPrescriptionView['medications'] = []
    let doctorNotes: string[] = []
    let summary: string | null = null

    if (docIds.length > 0) {
      // Fetch first document with analysis
      const { data: doc } = await supabase
        .from('documents')
        .select(`
          doctor_name, document_date, tags,
          document_analyses ( summary, medications_found, recommendations )
        `)
        .eq('id', docIds[0])
        .maybeSingle()

      if (doc) {
        const d = doc as unknown as {
          doctor_name: string | null
          document_date: string | null
          tags: string[] | null
          document_analyses: Array<{
            summary: string
            medications_found: unknown
            recommendations: unknown
          }>
        }
        doctorName = d.doctor_name
        documentDate = d.document_date
        tags = d.tags ?? []
        const analysis = d.document_analyses?.[0]
        if (analysis) {
          summary = analysis.summary
          medications = (analysis.medications_found as SharedPrescriptionView['medications']) ?? []
          doctorNotes = (analysis.recommendations as string[]) ?? []
        }
      }
    }

    return {
      data: {
        shareToken: token,
        profileName,
        doctorName,
        documentDate,
        tags,
        medications,
        doctorNotes,
        summary,
        expiresAt: link.expires_at,
        isExpired: false,
      },
      error: null,
      success: true,
    }
  },

  /**
   * Revoke an existing share link. Owner only.
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
}
