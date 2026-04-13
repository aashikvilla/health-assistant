// Server component

import Link from 'next/link'
import type { RecordDetail } from '@/services/records.service'
import type { LabTest }      from '@/types/lab-report'
import { Badge }             from '@/components/ui'
import { MedicationList }    from './MedicationList'
import { ShareButton }       from '@/components/features/share'
 
interface DocumentDetailProps {
  record:      RecordDetail
  profileName: string
}
 
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
 
const STATUS_BADGE: Record<string, 'error' | 'warning' | 'success' | 'default'> = {
  critical: 'error',
  high:     'warning',
  low:      'warning',
  normal:   'success',
}
 
function LabTestRow({ test }: { test: LabTest }) {
  const variant = STATUS_BADGE[test.status] ?? 'default'
  return (
    <li className="flex items-center justify-between gap-2 py-3 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary">{test.testName}</p>
        {test.referenceRange && (
          <p className="text-xs text-text-muted mt-0.5">Ref: {test.referenceRange}</p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <span className="text-sm font-semibold text-text-primary">
          {test.result} {test.unit}
        </span>
        {test.status && (
          <Badge variant={variant} size="sm">{test.status}</Badge>
        )}
      </div>
    </li>
  )
}
 
export function DocumentDetail({ record, profileName }: DocumentDetailProps) {
  const {
    profileId,
    documentType,
    doctorName,
    documentDate,
    conditionTags,
    medicationCount,
    documentId,
    summary,
    medications,
    recommendations,
    labTests,
  } = record
 
  const isPrescription  = documentType === 'prescription'
  const hasMedications  = medications.length > 0
  const hasRecommendations = recommendations.length > 0
  const hasLabTests     = labTests != null && labTests.length > 0
  const docTypeLabel    = isPrescription ? 'Prescription' : 'Lab Report'
 
  return (
    <main className="min-h-screen bg-surface pb-safe">
 
      {/* ── Sticky nav bar ── */}
      <nav className="sticky top-0 z-40 bg-surface-container-lowest/80 backdrop-blur-lg pt-safe">
        <div className="flex items-center justify-between px-4 h-14">
          <Link
            href="/hub"
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

          {documentId ? (
            <ShareButton
              documentId={documentId}
              profileId={profileId}
              doctorName={doctorName}
              patientName={profileName}
            />
          ) : (
            <div className="w-10" aria-hidden="true" />
          )}
        </div>
      </nav>
 
      <div className="px-5 pt-4 pb-8 space-y-5">
 
        {/* ── Meta ── */}
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            {formatDate(documentDate)}
          </p>
          <h2 className="text-xl font-bold text-text-primary">
            {doctorName ?? 'Unknown Doctor'}
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
 
        {/* ── AI summary ── */}
        {summary && (
          <div className="bg-surface-subtle rounded-2xl p-4">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Summary
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">{summary}</p>
          </div>
        )}
 
        {/* ── Medications (prescription) ── */}
        {isPrescription && (
          <section>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Medications · {medicationCount ?? medications.length}
            </h3>
            <MedicationList medications={medications} />
          </section>
        )}
 
        {/* ── Lab tests (lab report) ── */}
        {!isPrescription && hasLabTests && (
          <section>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Test Results
            </h3>
            <div
              className="bg-surface-container-lowest rounded-2xl px-4"
              style={{ boxShadow: '0 2px 12px 0 rgba(24,28,33,0.06)' }}
            >
              <ul>
                {labTests!.map((test, i) => (
                  <LabTestRow key={i} test={test} />
                ))}
              </ul>
            </div>
          </section>
        )}
 
        {/* ── Doctor notes ── */}
        {hasRecommendations && (
          <section>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Things to tell your doctor
            </h3>
            <ul
              className="bg-surface-container-lowest rounded-2xl p-4 space-y-2"
              style={{ boxShadow: '0 2px 12px 0 rgba(24,28,33,0.06)' }}
            >
              {recommendations.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="text-text-muted mt-0.5" aria-hidden="true">·</span>
                  {note}
                </li>
              ))}
            </ul>
          </section>
        )}
 
        {/* ── Plain-language explanation CTA (prescription with analysis only) ── */}
        {isPrescription && documentId && (hasMedications || hasRecommendations) && (
          <Link
            href={`/explanation/${documentId}`}
            className="flex items-center justify-between w-full bg-primary text-white rounded-2xl px-5 py-4 min-h-[44px] font-semibold text-sm transition-opacity hover:opacity-90"
          >
            <span>Read plain-language explanation</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
 
      </div>
    </main>
  )
}