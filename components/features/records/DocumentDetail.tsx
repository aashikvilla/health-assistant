// Server component — renders client sub-components (MedicationCard, AbnormalMarkerCard, ShareButton)

import Link from 'next/link'
import type { RecordDetail } from '@/services/records.service'
import type { LabTest } from '@/types/lab-report'
import { Badge } from '@/components/ui'
import { MedicationCard } from '@/components/features/explanation/MedicationCard'
import { AbnormalMarkerCard } from '@/components/features/explanation/AbnormalMarkerCard'
import { DoctorNotes } from '@/components/features/explanation/DoctorNotes'
import { DisclaimerBanner } from '@/components/features/explanation/DisclaimerBanner'
import { ShareButton } from '@/components/features/share/ShareButton'

interface DocumentDetailProps {
  record:        RecordDetail
  profileName:   string
  signedFileUrl: string | null
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_BADGE: Record<string, 'error' | 'warning' | 'success' | 'default'> = {
  critical: 'error',
  high:     'warning',
  low:      'warning',
  normal:   'success',
}

function LabTestRow({ test }: { test: LabTest }) {
  const variant = STATUS_BADGE[test.status] ?? 'default'
  const isAbnormal = test.status === 'high' || test.status === 'low' || test.status === 'critical'
  return (
    <li className={[
      'flex items-center justify-between gap-2 py-3 border-b border-border-subtle last:border-0',
      isAbnormal ? 'bg-transparent' : '',
    ].join(' ')}>
      <div className="min-w-0">
        <p className={['text-sm font-medium', isAbnormal ? 'text-text-primary' : 'text-text-secondary'].join(' ')}>
          {test.testName}
        </p>
        {test.referenceRange && (
          <p className="text-xs text-text-muted mt-0.5">Ref: {test.referenceRange}</p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <span className={['text-sm font-semibold', isAbnormal ? 'text-text-primary' : 'text-text-muted'].join(' ')}>
          {test.result}{test.unit ? ` ${test.unit}` : ''}
        </span>
        {test.status && test.status !== 'normal' && (
          <Badge variant={variant} size="sm">{test.status}</Badge>
        )}
      </div>
    </li>
  )
}

export function DocumentDetail({ record, profileName, signedFileUrl }: DocumentDetailProps) {
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
        <div className="flex items-center justify-between px-4 h-14">
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
            {docTypeLabel}
          </h1>

          {/* WhatsApp share in nav — visible whenever there are medications */}
          {isPrescription && hasAnyMedications ? (
            <ShareButton
              doctorName={doctorName}
              patientName={profileName}
              date={documentDate ? formatDate(documentDate) : null}
              medications={medications}
              doctorNotes={recommendations}
            />
          ) : (
            <div className="w-10" aria-hidden="true" />
          )}
        </div>
      </nav>

      <div className="px-5 pt-4 pb-8 space-y-5 max-w-2xl mx-auto">

        {/* ── Meta header ── */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            {formatDate(documentDate)}
          </p>
          <h2 className="text-xl font-bold text-text-primary">
            {doctorName ?? (isPrescription ? 'Unknown Doctor' : 'Lab Report')}
          </h2>
          <p className="text-sm text-text-secondary mt-1">For {profileName}</p>

          {conditionTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {conditionTags.map((tag) => (
                <Badge key={tag} variant="info" size="sm">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* ── AI disclaimer ── */}
        {hasAI && (
          <DisclaimerBanner
            doctorName={doctorName ?? 'your doctor'}
          />
        )}

        {/* ══════════════ PRESCRIPTION ══════════════ */}
        {isPrescription && (
          <>
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
              <DocumentLink url={signedFileUrl} fileUrl={record.fileUrl} />
            )}

            {/* WhatsApp share — full button at bottom, always shown for prescriptions */}
            {hasAnyMedications && (
              <ShareButton
                doctorName={doctorName}
                patientName={profileName}
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
          <>
            {/* Abnormal markers */}
            {abnormalMarkers.length > 0 ? (
              <section>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Parameters Outside Normal Range · {abnormalMarkers.length}
                </h3>
                <div className="space-y-4">
                  {abnormalMarkers.map((marker, i) => (
                    <AbnormalMarkerCard key={marker.id ?? i} marker={marker} />
                  ))}
                </div>
              </section>
            ) : (
              <div className="bg-success-subtle rounded-2xl p-5 flex items-start gap-3">
                <svg className="w-6 h-6 text-success flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-display text-base font-semibold text-success">All Clear</p>
                  <p className="font-body text-sm text-text-secondary mt-1 leading-relaxed">
                    All test results are within normal range.
                  </p>
                </div>
              </div>
            )}

            {/* Full test results table */}
            {labTests && labTests.length > 0 && (
              <section>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  All Results · {labTests.length}
                </h3>
                <div
                  className="bg-surface-container-lowest rounded-2xl px-4"
                  style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}
                >
                  <ul>
                    {labTests.map((test, i) => (
                      <LabTestRow key={i} test={test} />
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Doctor notes */}
            {hasRecommendations && (
              <DoctorNotes notes={recommendations} title="Things to follow" />
            )}

            {/* Original document link */}
            {signedFileUrl && (
              <DocumentLink url={signedFileUrl} fileUrl={record.fileUrl} />
            )}
          </>
        )}

      </div>
    </main>
  )
}

// ── Subcomponent — original document link ────────────────────────────────────

function DocumentLink({ url, fileUrl }: { url: string; fileUrl: string | null }) {
  const isPdf = fileUrl?.toLowerCase().endsWith('.pdf')
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-surface-subtle hover:bg-surface-container-lowest rounded-2xl px-4 py-3.5 transition-colors"
      style={{ boxShadow: '0 2px 12px rgba(24,28,33,0.04)' }}
    >
      <div className="w-9 h-9 rounded-xl bg-primary-subtle flex items-center justify-center shrink-0">
        {isPdf ? (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">View original document</p>
        <p className="text-xs text-text-muted mt-0.5">{isPdf ? 'PDF' : 'Image'} · Opens in new tab</p>
      </div>
      <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  )
}
