import type { Metadata } from 'next'
import type { PrescriptionExplanation } from '@/types'
import { redirect } from 'next/navigation'
import {
  MedicationCard,
  DoctorNotes,
  DisclaimerBanner,
  ExplanationActions,
} from '@/components/features/explanation'

export const metadata: Metadata = {
  title: 'Your Prescription',
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// TODO: Replace with documentService.getExplanation(id, userId) once service is wired up
async function fetchPrescription(_id: string): Promise<PrescriptionExplanation | null> {
  return null
}

export default async function ExplanationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const prescription = await fetchPrescription(id)
  if (!prescription) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-surface">
      {/* ── Nav bar — glassmorphism ── */}
      <nav className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-lg pt-safe">
        <div className="flex items-center justify-between px-4 h-14">
          <button
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
          </button>

          <h1 className="font-display text-base font-semibold text-text-primary">
            Your Prescription
          </h1>

          <button
            className="touch-target flex items-center justify-center -mr-2 p-2 rounded-xl text-text-primary hover:bg-surface-subtle transition-colors"
            aria-label="Share prescription"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Context line ── */}
      <div className="px-5 pt-3 pb-2">
        <p className="font-body text-sm text-text-muted">
          {prescription.doctorName} &middot; {formatDate(prescription.date)} &middot; For{' '}
          {prescription.patientName}
        </p>
      </div>

      {/* ── Disclaimer — visible without scrolling ── */}
      <div className="px-5 pb-4">
        <DisclaimerBanner doctorName={prescription.disclaimerDoctorName} />
      </div>

      {/* ── Medication cards on tonal layer ── */}
      <section className="bg-surface-container-low rounded-t-3xl px-5 py-6 space-y-5">
        {prescription.medications.map((med) => (
          <MedicationCard key={med.id} medication={med} />
        ))}

        {/* ── Things to tell your doctor ── */}
        <DoctorNotes notes={prescription.doctorNotes} />
      </section>

      {/* ── Sticky bottom CTAs ── */}
      <div className="sticky bottom-0 z-30 bg-surface-container-lowest/80 backdrop-blur-lg px-5 py-4 pb-safe">
        <ExplanationActions prescriptionId={id} />
      </div>
    </main>
  )
}
