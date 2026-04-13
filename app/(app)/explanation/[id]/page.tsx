import type { Metadata } from 'next'
import type { PrescriptionExplanation } from '@/types'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { recordsService } from '@/services/records.service'
import { documentsService } from '@/services/documents.service'
import { generateExplanation } from '@/lib/explain'
import {
  MedicationCard,
  DoctorNotes,
  DisclaimerBanner,
  ExplanationActions,
} from '@/components/features/explanation'

export const metadata: Metadata = {
  title: 'Your Prescription',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr // OCR-extracted dates may not be ISO — return as-is
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function ExplanationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const result = await recordsService.getDocumentWithExplanation(id, user.id)
  if (!result.data) redirect('/dashboard')

  let { medications, doctorNotes } = result.data
  const { documentId, doctorName, documentDate, patientName, hasExplanation } = result.data

  // On-demand explanation: generate and persist if this document was saved without one
  if (!hasExplanation && result.data.rawPrescriptionData) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (apiKey) {
      const generated = await generateExplanation(result.data.rawPrescriptionData, apiKey)
      if (generated) {
        medications = generated.medications
        doctorNotes = generated.doctorNotes
        // Save back so next view is instant (best-effort — non-fatal)
        await documentsService.saveExplanationToAnalysis(
          documentId,
          generated.medications.map(({ id: _id, ...m }) => m),
          generated.doctorNotes
        ).catch(() => undefined)
      }
    }
  }

  const prescription: PrescriptionExplanation = {
    id,
    doctorName: doctorName ?? 'Your Doctor',
    date: documentDate ?? '',
    patientName,
    disclaimerDoctorName: doctorName ?? 'your doctor',
    medications,
    doctorNotes,
  }

  return (
    <main className="min-h-screen bg-surface">
      {/* ── Nav bar — glassmorphism ── */}
      <nav className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-lg pt-safe">
        <div className="flex items-center justify-between px-4 h-14">
          <a
            href="/dashboard"
            className="touch-target flex items-center justify-center -ml-2 p-2 rounded-xl text-text-primary hover:bg-surface-subtle transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </a>

          <h1 className="font-display text-base font-semibold text-text-primary">
            Your Prescription
          </h1>

          <div className="w-10" aria-hidden="true" />
        </div>
      </nav>

      {/* ── Context line ── */}
      <div className="px-5 pt-3 pb-2">
        <p className="font-body text-sm text-text-muted">
          {prescription.doctorName}
          {prescription.date ? <> &middot; {formatDate(prescription.date)}</> : null}
          {' '}&middot; For {prescription.patientName}
        </p>
      </div>

      {/* ── Disclaimer — visible without scrolling ── */}
      <div className="px-5 pb-4">
        <DisclaimerBanner doctorName={prescription.disclaimerDoctorName} />
      </div>

      {/* ── Medication cards ── */}
      <section className="bg-surface-container-low rounded-t-3xl px-5 pt-6 pb-28 space-y-5">
        {prescription.medications.length > 0 ? (
          prescription.medications.map((med) => (
            <MedicationCard key={med.id} medication={med} />
          ))
        ) : (
          <div className="py-12 text-center">
            <p className="font-body text-sm text-text-muted">
              No medication details available for this prescription.
            </p>
          </div>
        )}

        {prescription.doctorNotes.length > 0 && (
          <DoctorNotes notes={prescription.doctorNotes} />
        )}
      </section>

      {/* ── Sticky bottom CTAs ── */}
      <div className="sticky bottom-0 z-30 bg-surface-container-lowest/80 backdrop-blur-lg px-5 py-4 pb-safe">
        <ExplanationActions prescriptionId={id} />
      </div>
    </main>
  )
}
