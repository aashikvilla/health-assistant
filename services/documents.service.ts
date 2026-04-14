/**
 * Documents service — Stage 2
 *
 * Handles persisting extracted prescription/lab report data to the DB.
 * The documents table stores the raw file reference + metadata.
 * The document_analyses table stores the AI-extracted structured data.
 *
 * File storage: file_url is a Supabase Storage path in the medical-documents
 * bucket (e.g. '{userId}/{timestamp}.pdf'). Falls back to 'ocr-extracted' for
 * manual text entry or when the upload fails gracefully.
 */

import { createClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { Json } from '@/types'
import type { PrescriptionData, PrescriptionExplanation } from '@/types/prescription'
import type { LabReportData, LabReportExplanation } from '@/types/lab-report'
import type { MedicationExplanation } from '@/types/analysis'

export type DocumentType = 'prescription' | 'lab_report'

export interface SavedDocument {
  id: string
  profile_id: string
  created_at: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSummary(type: DocumentType, data: PrescriptionData | LabReportData): string {
  if (type === 'prescription') {
    const rx = data as PrescriptionData
    const med_count = rx.medications.length
    const doctor = rx.doctor || 'Unknown doctor'
    return `${med_count} medication${med_count !== 1 ? 's' : ''} prescribed by ${doctor}`
  }

  const lab = data as LabReportData
  const test_count = lab.tests.length
  const abnormal = lab.tests.filter((t) => t.status === 'high' || t.status === 'low' || t.status === 'critical').length
  return abnormal > 0
    ? `${test_count} test${test_count !== 1 ? 's' : ''} — ${abnormal} outside reference range`
    : `${test_count} test${test_count !== 1 ? 's' : ''} — all within reference range`
}

function buildDocDate(data: PrescriptionData | LabReportData, type: DocumentType): string | null {
  if (type === 'prescription') return (data as PrescriptionData).date || null
  return (data as LabReportData).testDate || null
}

function buildDoctorName(data: PrescriptionData | LabReportData, type: DocumentType): string | null {
  if (type === 'prescription') return (data as PrescriptionData).doctor || null
  return (data as LabReportData).doctorName || null
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const documentsService = {
  /**
   * Persist an already-extracted prescription or lab report to the DB.
   *
   * Creates both:
   *  - a `documents` row (file metadata + profile link)
   *  - a `document_analyses` row (structured AI output)
   *
   * @param userId    Authenticated user's UUID
   * @param profileId The family profile this document belongs to
   * @param type      'prescription' or 'lab_report'
   * @param data      Extracted data from /api/ocr
   * @param fileUrl   Storage path in `medical-documents` bucket (e.g.
   *                  '{userId}/{ts}.pdf'), or 'ocr-extracted' for text-only.
   */
  async createFromExtraction(
    userId: string,
    profileId: string,
    type: DocumentType,
    data: PrescriptionData | LabReportData,
    fileUrl: string = 'ocr-extracted',
    explanation?: PrescriptionExplanation,
    labExplanation?: LabReportExplanation
  ): Promise<ApiResponse<SavedDocument>> {
    const supabase = await createClient()

    // 1. Write the document row
    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        profile_id: profileId,
        document_type: type,
        file_type: 'text/plain',
        file_url: fileUrl,
        doctor_name: buildDoctorName(data, type),
        document_date: buildDocDate(data, type),
        tags: type === 'prescription'
          ? [(data as PrescriptionData).illness].filter(Boolean) as string[]
          : [],
        processing_status: 'complete',
        ocr_engine: 'openrouter',
      })
      .select('id, profile_id, created_at')
      .single()

    if (docError || !doc) {
      return { data: null, error: docError?.message ?? 'Failed to save document', success: false }
    }

    // 2. Write the analysis row
    const summary = buildSummary(type, data)

    // When an AI explanation is available (public upload flow), use its richer
    // medication data (treats, how_to_take, side_effects, avoid) and doctor notes.
    const prescriptionMeds: MedicationExplanation[] | null = explanation?.medications
      ? explanation.medications.map(({ id: _id, ...rest }) => rest)
      : null

    // Supabase JSON columns require the Json type — cast structured objects explicitly
    const analysisPayload =
      type === 'prescription'
        ? {
          medications_found: (prescriptionMeds ?? (data as PrescriptionData).medications) as unknown as Json,
          recommendations: (explanation?.doctorNotes ?? []) as Json,
          key_findings: null,
          risk_flags: null,
          terms_explained: null,
        }
        : {
          medications_found: [] as Json,
          recommendations: (labExplanation?.doctorNotes ?? []) as Json,
          key_findings: { tests: (data as LabReportData).tests } as unknown as Json,
          risk_flags: (data as LabReportData).tests
            .filter((t) => t.status === 'critical')
            .map((t) => `${t.testName} is critical`) as Json,
          values_out_of_range: (labExplanation?.abnormalMarkers
            ? labExplanation.abnormalMarkers.map((m) => ({ name: m.name, result: m.value, status: m.status }))
            : (data as LabReportData).tests
                .filter((t) => t.status !== 'normal' && t.status !== '')
                .map((t) => ({ name: t.testName, result: t.result, status: t.status }))
          ) as unknown as Json,
          terms_explained: null,
        }

    const { error: analysisError } = await supabase
      .from('document_analyses')
      .insert({
        document_id: doc.id,
        user_id: userId,
        document_type_detected: type,
        summary,
        llm_model_used: process.env.OPENROUTER_API_KEY ? 'openrouter' : 'mock',
        ...analysisPayload,
      })

    if (analysisError) {
      // Analysis write failed — roll back the document row to avoid orphan
      await supabase.from('documents').delete().eq('id', doc.id)
      return {
        data: null,
        error: `Document saved but analysis failed: ${analysisError.message}`,
        success: false,
      }
    }

    // 3. Write individual medication rows (best-effort — non-fatal)
    if (type === 'prescription') {
      const meds = prescriptionMeds ?? (data as PrescriptionData).medications
      if (meds && meds.length > 0) {
        await supabase.from('medications').insert(
          meds.map((m) => ({
            user_id: userId,
            profile_id: profileId,
            name: m.name,
            dosage: m.dosage ?? null,
            frequency: (m as { frequency?: string }).frequency ?? null,
            source_document_id: doc.id,
            status: 'active',
          }))
        )
      }
    }

    // 5. Write a timeline event (best-effort — non-fatal)

    const eventDate = buildDocDate(data, type) ?? new Date().toISOString().split('T')[0]
    const doctorLabel = buildDoctorName(data, type)
    await supabase.from('timeline_events').insert({
      user_id: userId,
      profile_id: profileId,
      event_type: type === 'prescription' ? 'document' : 'lab_report',
      event_date: eventDate,
      title: type === 'prescription'
        ? `Prescription from ${doctorLabel ?? 'Unknown Doctor'}`
        : `Lab report${doctorLabel ? ` from ${doctorLabel}` : ''}`,
      description: summary,
      source_document_id: doc.id,
    })

    return { data: doc, error: null, success: true }
  },

  /**
   * Persist a generated explanation back into document_analyses.
   * Called when the explanation page generates explanation on-demand for
   * an authenticated upload that was saved without an explanation.
   * Best-effort — caller should not fail if this does.
   */
  async saveExplanationToAnalysis(
    documentId: string,
    medications: MedicationExplanation[],
    doctorNotes: string[]
  ): Promise<void> {
    const supabase = await createClient()
    await supabase
      .from('document_analyses')
      .update({
        medications_found: medications as unknown as Json,
        recommendations: doctorNotes as Json,
      })
      .eq('document_id', documentId)
  },
}
