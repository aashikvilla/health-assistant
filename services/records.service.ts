// Records service — Stage 6
// Fetches document detail and timeline data.
// Accepts either a documents.id (primary, from timeline) or prescriptions.id
// (legacy fallback, from hub PrescriptionListItem links that have no document).

import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { MedicationExplanation } from '@/types/analysis'
import type { LabTest } from '@/types/lab-report'
import type { Tables } from '@/types/database'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface RecordDetail {
    profileId: string
    documentType: string
    doctorName: string | null
    documentDate: string | null
    // Prescription summary fields (from prescriptions table or derived)
    prescriptionId: string | null
    conditionTags: string[]
    medicationCount: number | null
    // Rich analysis fields (from document_analyses via documents table)
    documentId: string | null
    summary: string | null
    medications: MedicationExplanation[]
    recommendations: string[]
    labTests: LabTest[] | null
}

export interface TimelineDocument {
    id: string
    profile_id: string
    profile_name: string
    document_type: string
    document_date: string | null
    doctor_name: string | null
    tags: string[] | null
    summary: string | null
    created_at: string | null
}

// ─── Internal Supabase join shapes ────────────────────────────────────────────
// Supabase returns nested arrays for joined rows — typed here so we can cast
// from `unknown` without using `any`.

type DocWithAnalysis = {
    id: string
    profile_id: string
    document_type: string
    doctor_name: string | null
    document_date: string | null
    tags: string[] | null
    document_analyses: Array<{
        summary: string
        medications_found: unknown
        recommendations: unknown
        key_findings: unknown
    }>
}

type DocTimeline = {
    id: string
    profile_id: string
    document_type: string
    document_date: string | null
    doctor_name: string | null
    tags: string[] | null
    created_at: string | null
    document_analyses: Array<{ summary: string }>
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const recordsService = {
    /**
     * Fetch the full detail for a record page.
     *
     * Tries `id` as a documents.id first (the common case for timeline links
     * and all uploads after F2-B fix). Falls back to treating `id` as a
     * prescriptions.id (legacy hub links for prescriptions without a document).
     */
    async getRecord(
        id: string,
        userId: string
    ): Promise<ApiResponse<RecordDetail>> {
        const supabase = await createClient()

        // ── Strategy 1: treat as documents.id ─────────────────────────────────
        const { data: rawDoc } = await supabase
            .from('documents')
            .select(`
        id, profile_id, document_type, doctor_name, document_date, tags,
        document_analyses ( summary, medications_found, recommendations, key_findings )
      `)
            .eq('id', id)
            .eq('user_id', userId)
            .maybeSingle()

        if (rawDoc) {
            // Cast: shape is known from the select above
            const d = rawDoc as unknown as DocWithAnalysis
            const analysis = d.document_analyses?.[0] ?? null
            const meds = (analysis?.medications_found as MedicationExplanation[]) ?? []

            // Lab tests live in key_findings.tests (set by documents.service.ts for lab_report type)
            const keyFindings = analysis?.key_findings as Record<string, unknown> | null
            const labTests = keyFindings?.tests != null
                ? (keyFindings.tests as LabTest[])
                : null

            return {
                data: {
                    profileId: d.profile_id,
                    documentType: d.document_type,
                    doctorName: d.doctor_name,
                    documentDate: d.document_date,
                    prescriptionId: null,
                    conditionTags: d.tags ?? [],
                    medicationCount: meds.length > 0 ? meds.length : null,
                    documentId: d.id,
                    summary: analysis?.summary ?? null,
                    medications: meds,
                    recommendations: (analysis?.recommendations as string[]) ?? [],
                    labTests,
                },
                error: null,
                success: true,
            }
        }

        // ── Strategy 2: treat as prescriptions.id (legacy fallback) ───────────
        const { data: rx } = await supabase
            .from('prescriptions')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .maybeSingle()

        if (rx) {
            const p = rx as Tables<'prescriptions'>
            return {
                data: {
                    profileId: p.profile_id,
                    documentType: 'prescription',
                    doctorName: p.doctor_name,
                    documentDate: p.prescription_date,
                    prescriptionId: p.id,
                    conditionTags: p.condition_tags ?? [],
                    medicationCount: p.medication_count,
                    documentId: null,
                    summary: null,
                    medications: [],
                    recommendations: [],
                    labTests: null,
                },
                error: null,
                success: true,
            }
        }

        return { data: null, error: 'Record not found', success: false }
    },

    /**
     * All documents uploaded by this user, newest first.
     * Used by the /timeline page. Includes a profile_name lookup for display.
     */
    async getAllDocumentsForUser(
        userId: string
    ): Promise<ApiResponse<TimelineDocument[]>> {
        const supabase = await createClient()

        // Build profile-name map (RLS returns only profiles accessible to this user)
        const { data: profiles } = await supabase
            .from('family_profiles')
            .select('id, full_name')

        const profileMap = new Map(
            (profiles ?? []).map((p) => [p.id, p.full_name])
        )

        const { data: rawDocs, error } = await supabase
            .from('documents')
            .select(`
        id, profile_id, document_type, document_date,
        doctor_name, tags, created_at,
        document_analyses ( summary )
      `)
            .eq('user_id', userId)
            .order('document_date', { ascending: false, nullsFirst: false })
            .limit(100)

        if (error) return { data: null, error: error.message, success: false }

        // Cast: shape is known from the select above
        const docs = (rawDocs ?? []) as unknown as DocTimeline[]

        return {
            data: docs.map((d) => ({
                id: d.id,
                profile_id: d.profile_id,
                profile_name: profileMap.get(d.profile_id) ?? 'Unknown',
                document_type: d.document_type,
                document_date: d.document_date,
                doctor_name: d.doctor_name,
                tags: d.tags,
                summary: d.document_analyses?.[0]?.summary ?? null,
                created_at: d.created_at,
            })),
            error: null,
            success: true,
        }
    },
}