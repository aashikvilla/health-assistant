// Records service  Stage 6
// Fetches document detail and timeline data.
// Accepts either a documents.id (primary, from timeline) or prescriptions.id
// (legacy fallback, from hub PrescriptionListItem links that have no document).

import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { MedicationExplanation } from '@/types/analysis'
import type { Medication, PrescriptionData } from '@/types/prescription'
import type { LabTest, AbnormalMarker } from '@/types/lab-report'
import type { Tables } from '@/types/database'

// ─── Public types ─────────────────────────────────────────────────────────────

export interface DocumentExplanationData {
    documentId: string
    profileId: string
    doctorName: string | null
    documentDate: string | null
    patientName: string
    tags: string[]
    medications: (MedicationExplanation & { id: string })[]
    doctorNotes: string[]
    /** true = rich explanation is already in DB; false = only raw OCR data stored */
    hasExplanation: boolean
    /** Present only when hasExplanation is false  use to call generateExplanation() */
    rawPrescriptionData: PrescriptionData | null
}

export interface RecordDetail {
    profileId: string
    documentType: string
    doctorName: string | null
    documentDate: string | null
    fileUrl: string | null
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
    /** AI-explained out-of-range markers with plain-language explanation text */
    abnormalMarkers: AbnormalMarker[]
    /** AI-generated holistic narrative (stored in key_findings, not the summary column) */
    aiSummary?: string | null
    /** Short connection chips e.g. "TSH worsens LDL & energy" */
    connectionTags?: string[]
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
    /** Number of medications in a prescription; null for lab reports or empty prescriptions */
    medication_count: number | null
}

// ─── Internal Supabase join shapes ────────────────────────────────────────────
// Supabase returns nested arrays for joined rows  typed here so we can cast
// from `unknown` without using `any`.

type DocWithAnalysis = {
    id: string
    profile_id: string
    document_type: string
    doctor_name: string | null
    document_date: string | null
    file_url: string | null
    tags: string[] | null
    document_analyses: Array<{
        summary: string
        medications_found: unknown
        recommendations: unknown
        key_findings: unknown
    }>
}

type DocWithAnalysisOnly = {
    id: string
    doctor_name: string | null
    document_date: string | null
    tags: string[] | null
    profile_id: string
    document_analyses: Array<{
        medications_found: unknown
        recommendations: unknown
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
    document_analyses: Array<{ summary: string; medications_found: unknown }>
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
        id, profile_id, document_type, doctor_name, document_date, file_url, tags,
        document_analyses ( summary, medications_found, recommendations, key_findings )
      `)
            .eq('id', id)
            .maybeSingle()

        if (rawDoc) {
            // Cast: shape is known from the select above
            const d = rawDoc as unknown as DocWithAnalysis
            const analysis = d.document_analyses?.[0] ?? null
            const storedMeds = (analysis?.medications_found as unknown[]) ?? []

            // Detect rich MedicationExplanation[] vs raw OCR Medication[]:
            // rich format has 'treats'; raw OCR format has 'duration'/'confidence'.
            // Use .some() so a single medication with empty treats doesn't fool the check.
            const isRichExplanation =
                storedMeds.length > 0 &&
                (storedMeds as { treats?: string }[]).some((m) => !!m.treats)

            let meds: MedicationExplanation[] = isRichExplanation
                ? (storedMeds as MedicationExplanation[])
                : []

            // Fall back to medications table when JSONB is empty or raw OCR format
            if (meds.length === 0 && d.document_type === 'prescription') {
                const { data: medRows } = await supabase
                    .from('medications')
                    .select('name, dosage, frequency')
                    .eq('source_document_id', d.id)

                meds = (medRows ?? []).map((m) => ({
                    name: m.name,
                    dosage: m.dosage ?? '',
                    frequency: m.frequency ?? '',
                    treats: '',
                    how_to_take: '',
                    side_effects: '',
                    avoid: '',
                }))
            }

            // Lab tests + abnormal markers live in key_findings (set by documents.service.ts)
            const keyFindings = analysis?.key_findings as Record<string, unknown> | null
            const labTests = keyFindings?.tests != null
                ? (keyFindings.tests as LabTest[])
                : null

            // abnormalMarkers: prefer stored AI-explained version; fall back to deriving from raw tests
            const storedAbnormal = keyFindings?.abnormalMarkers as AbnormalMarker[] | null
            const abnormalMarkers: AbnormalMarker[] = storedAbnormal?.length
                ? storedAbnormal
                : (labTests ?? [])
                    .filter((t) => t.status !== 'normal' && t.status !== '')
                    .map((t, i) => ({
                        id: `marker-${i}`,
                        name: t.testName,
                        value: t.result,
                        unit: t.unit,
                        status: t.status as 'low' | 'high' | 'critical',
                        referenceRange: t.referenceRange,
                        explanation: '',
                    }))

            const aiSummary      = (keyFindings?.aiSummary as string | null) ?? null
            const connectionTags = (keyFindings?.connectionTags as string[] | null) ?? []

            return {
                data: {
                    profileId: d.profile_id,
                    documentType: d.document_type,
                    doctorName: d.doctor_name,
                    documentDate: d.document_date,
                    fileUrl: d.file_url,
                    prescriptionId: null,
                    conditionTags: d.tags ?? [],
                    medicationCount: meds.length > 0 ? meds.length : null,
                    documentId: d.id,
                    summary: analysis?.summary ?? null,
                    medications: meds,
                    recommendations: (analysis?.recommendations as string[]) ?? [],
                    labTests,
                    abnormalMarkers,
                    aiSummary,
                    connectionTags,
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
            .maybeSingle()

        if (rx) {
            const p = rx as Tables<'prescriptions'>

            // Try to find the linked document via profile + doctor + date so we
            // can show medications even for prescriptions without a direct document_id.
            let medications: MedicationExplanation[] = []
            let recommendations: string[] = []
            let summary: string | null = null
            let resolvedDocumentId: string | null = null

            if (p.profile_id && (p.doctor_name || p.prescription_date)) {
                let docQuery = supabase
                    .from('documents')
                    .select('id, document_analyses ( summary, medications_found, recommendations )')
                    .eq('profile_id', p.profile_id)
                    .eq('document_type', 'prescription')

                if (p.doctor_name)      docQuery = docQuery.eq('doctor_name', p.doctor_name)
                if (p.prescription_date) docQuery = docQuery.eq('document_date', p.prescription_date)

                const { data: docs } = await docQuery.limit(1).maybeSingle()

                if (docs) {
                    const linked = docs as unknown as DocWithAnalysisOnly
                    const analysis = linked.document_analyses?.[0] ?? null
                    resolvedDocumentId = linked.id
                    medications = (analysis?.medications_found as MedicationExplanation[]) ?? []
                    recommendations = (analysis?.recommendations as string[]) ?? []
                    summary = (analysis as unknown as { summary?: string })?.summary ?? null
                }
            }

            return {
                data: {
                    profileId: p.profile_id,
                    documentType: 'prescription',
                    doctorName: p.doctor_name,
                    documentDate: p.prescription_date,
                    fileUrl: null,
                    prescriptionId: p.id,
                    conditionTags: p.condition_tags ?? [],
                    medicationCount: p.medication_count,
                    documentId: resolvedDocumentId,
                    summary,
                    medications,
                    recommendations,
                    labTests: null,
                    abnormalMarkers: [],
                },
                error: null,
                success: true,
            }
        }

        return { data: null, error: 'Record not found', success: false }
    },

    /**
     * Fetch a prescription document with its AI explanation for the /explanation/[id] page.
     *
     * Detects whether stored medications_found is a rich MedicationExplanation[]
     * (has 'treats' field) or raw OCR Medication[] (has 'duration' field).
     * When raw, returns rawPrescriptionData so the caller can generate on-demand.
     */
    async getDocumentWithExplanation(
        id: string,
        userId: string
    ): Promise<ApiResponse<DocumentExplanationData>> {
        const supabase = await createClient()

        const { data: rawDoc } = await supabase
            .from('documents')
            .select(`
                id, doctor_name, document_date, tags, profile_id,
                document_analyses ( medications_found, recommendations )
            `)
            .eq('id', id)
            .eq('document_type', 'prescription')
            .maybeSingle()

        if (!rawDoc) return { data: null, error: 'Record not found', success: false }

        const d = rawDoc as unknown as DocWithAnalysisOnly
        const analysis = d.document_analyses?.[0] ?? null
        const storedMeds = (analysis?.medications_found as unknown[]) ?? []

        // Detect rich vs raw: MedicationExplanation has a non-empty 'treats' value.
        // Use .some() so a single medication with empty treats doesn't fool the check.
        const hasExplanation =
            storedMeds.length > 0 &&
            (storedMeds as { treats?: string }[]).some((m) => !!m.treats)

        // Fetch profile name for the "For <name>" context line
        const { data: profile } = await supabase
            .from('family_profiles')
            .select('full_name')
            .eq('id', d.profile_id)
            .maybeSingle()

        const patientName = profile?.full_name ?? 'Family Member'

        if (hasExplanation) {
            const meds = (storedMeds as MedicationExplanation[]).map((m, i) => ({
                ...m,
                id: `med-${i}`,
            }))
            return {
                data: {
                    documentId: d.id,
                    profileId: d.profile_id,
                    doctorName: d.doctor_name,
                    documentDate: d.document_date,
                    patientName,
                    tags: d.tags ?? [],
                    medications: meds,
                    doctorNotes: (analysis?.recommendations as string[]) ?? [],
                    hasExplanation: true,
                    rawPrescriptionData: null,
                },
                error: null,
                success: true,
            }
        }

        // Build minimal PrescriptionData from stored OCR fields for on-demand generation
        let rawMeds = (storedMeds as Partial<Medication>[]).filter(
            (m): m is Medication => typeof m.name === 'string'
        )

        // If JSONB has no usable medication data, fall back to medications table
        if (rawMeds.length === 0) {
            const { data: medRows } = await supabase
                .from('medications')
                .select('name, dosage, frequency')
                .eq('source_document_id', d.id)

            rawMeds = (medRows ?? []).map((m) => ({
                name: m.name,
                dosage: m.dosage ?? '',
                frequency: m.frequency ?? '',
                duration: m.frequency ?? '',
                confidence: 'high' as const,
            }))
        }

        const rawPrescriptionData: PrescriptionData = {
            doctor: d.doctor_name ?? '',
            doctorConfidence: 'high',
            date: d.document_date ?? '',
            dateConfidence: 'high',
            illness: d.tags?.[0] ?? '',
            illnessConfidence: 'high',
            medications: rawMeds.map((m) => ({
                name: m.name,
                dosage: m.dosage ?? '',
                frequency: m.frequency ?? '',
                duration: m.duration ?? '',
                confidence: 'high' as const,
            })),
        }

        return {
            data: {
                documentId: d.id,
                profileId: d.profile_id,
                doctorName: d.doctor_name,
                documentDate: d.document_date,
                patientName,
                tags: d.tags ?? [],
                medications: [],
                doctorNotes: [],
                hasExplanation: false,
                rawPrescriptionData,
            },
            error: null,
            success: true,
        }
    },

    /**
     * All documents for a single profile, newest first.
     * Used by the dashboard hub for the "Your Records" section.
     */
    async getDocumentsForProfile(
        profileId: string,
        limit = 50
    ): Promise<ApiResponse<TimelineDocument[]>> {
        const supabase = await createClient()

        const { data: profileRow } = await supabase
            .from('family_profiles')
            .select('full_name')
            .eq('id', profileId)
            .maybeSingle()

        const profileName = profileRow?.full_name ?? 'Unknown'

        const { data: rawDocs, error } = await supabase
            .from('documents')
            .select(`
        id, profile_id, document_type, document_date,
        doctor_name, tags, created_at,
        document_analyses ( summary, medications_found )
      `)
            .eq('profile_id', profileId)
            .order('document_date', { ascending: false, nullsFirst: false })
            .limit(limit)

        if (error) return { data: null, error: error.message, success: false }

        const docs = (rawDocs ?? []) as unknown as DocTimeline[]

        return {
            data: docs.map((d) => ({
                id: d.id,
                profile_id: d.profile_id,
                profile_name: profileName,
                document_type: d.document_type,
                document_date: d.document_date,
                doctor_name: d.doctor_name,
                tags: d.tags,
                summary: d.document_analyses?.[0]?.summary ?? null,
                created_at: d.created_at,
                medication_count: (() => {
                    const medsFound = d.document_analyses?.[0]?.medications_found
                    return d.document_type === 'prescription' && Array.isArray(medsFound) && medsFound.length > 0
                        ? medsFound.length
                        : null
                })(),
            })),
            error: null,
            success: true,
        }
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
        document_analyses ( summary, medications_found )
      `)
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
                medication_count: (() => {
                    const medsFound = d.document_analyses?.[0]?.medications_found
                    return d.document_type === 'prescription' && Array.isArray(medsFound) && medsFound.length > 0
                        ? medsFound.length
                        : null
                })(),
            })),
            error: null,
            success: true,
        }
    },
}