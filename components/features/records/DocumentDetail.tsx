// Server component  renders client sub-components (MedicationCard, AbnormalMarkerCard, ShareButton)

import Link from 'next/link'
import type { RecordDetail } from '@/services/records.service'
import { Badge } from '@/components/ui'
import { MedicationCard } from '@/components/features/explanation/MedicationCard'
import { DoctorNotes } from '@/components/features/explanation/DoctorNotes'
import { ShareButton } from '@/components/features/share/ShareButton'
import { ExplanationLoader } from '@/components/features/records/ExplanationLoader'
import { LabReportDetail } from '@/components/features/records/LabReportDetail'
import { DocumentLink } from '@/components/features/records/DocumentLink'

interface DocumentDetailProps {
  record:           RecordDetail
  profileName:      string
  signedFileUrl:    string | null
  isOwnProfile:     boolean
  needsExplanation?: boolean
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}


export function DocumentDetail({ record, profileName, signedFileUrl, isOwnProfile, needsExplanation }: DocumentDetailProps) {
  const {
    documentType,
    doctorName,
    documentDate,
    conditionTags,
    medicationCount,
    documentId,
    medications,
    recommendations,
    labTests,
    abnormalMarkers,
  } = record

  const isPrescription = documentType === 'prescription'
  const docTypeLabel   = isPrescription ? 'Prescription' : 'Lab Report'
  const displayName    = profileName || 'Family Member'
  const navTitle       = isOwnProfile
    ? `Your ${docTypeLabel}`
    : `${displayName}'s ${docTypeLabel}`

  const hasAnyMedications  = medications.length > 0
  const hasRichMedications = medications.some((m) => m.treats)
  const hasRecommendations = recommendations.length > 0
  const hasAI              = hasAnyMedications || hasRecommendations || abnormalMarkers.length > 0

  // Add synthetic ids for MedicationCard (client component expects them)
  const medicationsWithId = medications.map((m, i) => ({ ...m, id: `med-${i}` }))

  return (
    <main className="min-h-screen bg-surface pb-10">

      {/* ── Sticky nav ── */}
      <nav className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-lg pt-safe">
        <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
          <Link
            href="/dashboard"
            className="touch-target flex items-center justify-center -ml-2 p-2 rounded-xl text-text-primary hover:bg-surface-subtle transition-colors"
            aria-label="Back to hub"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
            </svg>
          </Link>

          <h1 className="font-display text-base font-semibold text-text-primary">
            {navTitle}
          </h1>

          <div className="w-10" aria-hidden="true" />
        </div>
      </nav>

      <div className="px-5 pt-4 pb-8 space-y-5 max-w-2xl md:max-w-4xl mx-auto">

        {/* ── Meta header ── */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            {formatDate(documentDate)}
          </p>
          <h2 className="text-xl font-bold text-text-primary">
            {doctorName ?? (isPrescription ? 'Unknown Doctor' : 'Lab Report')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">For {displayName}</p>

          {conditionTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {conditionTags.map((tag) => (
                <Badge key={tag} variant="info" size="sm">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* ── AI disclaimer (compact badge  full banner stays in upload flow only) ── */}
        {hasAI && (
          <Badge variant="warning" dot>
            AI-generated summary  consult your doctor
          </Badge>
        )}

        {/* ══════════════ PRESCRIPTION ══════════════ */}
        {isPrescription && (
          <>
            {needsExplanation && record.documentId && (
              <ExplanationLoader documentId={record.documentId} />
            )}

            {/* Medications */}
            <section>
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                Medications · {medicationCount ?? medications.length}
              </h3>

              {medicationsWithId.length === 0 ? (
                <div className="bg-surface-subtle rounded-2xl p-4 text-center">
                  <p className="text-sm text-text-secondary">No medication details available.</p>
                </div>
              ) : hasRichMedications ? (
                <div className="space-y-4">
                  {medicationsWithId.map((med) => (
                    <MedicationCard key={med.id} medication={med} />
                  ))}
                </div>
              ) : (
                /* Fallback: plain list when only raw OCR data stored (legacy records) */
                <ul className="space-y-3">
                  {medicationsWithId.map((med) => (
                    <li
                      key={med.id}
                      className="bg-surface-container-lowest rounded-2xl p-4"
                      style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-text-primary">{med.name}</p>
                        {med.dosage && (
                          <span className="text-xs text-text-muted shrink-0 mt-0.5">{med.dosage}</span>
                        )}
                      </div>
                      {med.frequency && (
                        <p className="text-xs text-text-secondary mt-1">{med.frequency}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Doctor notes */}
            {hasRecommendations && (
              <DoctorNotes notes={recommendations} title="Things to tell your doctor" />
            )}

            {/* Original document link */}
            {signedFileUrl && (
              <DocumentLink url={signedFileUrl} fileUrl={record.fileUrl} documentType={documentType} />
            )}

            {/* WhatsApp share */}
            {hasAnyMedications && (
              <ShareButton
                doctorName={doctorName}
                patientName={displayName}
                date={documentDate ? formatDate(documentDate) : null}
                medications={medications}
                doctorNotes={recommendations}
                variant="full"
              />
            )}
          </>
        )}

        {/* ══════════════ LAB REPORT ══════════════ */}
        {!isPrescription && (
          <LabReportDetail
            record={record}
            profileName={displayName}
            signedFileUrl={signedFileUrl}
          />
        )}

      </div>
    </main>
  )
}

