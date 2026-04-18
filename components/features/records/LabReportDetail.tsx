import type { RecordDetail } from '@/services/records.service'
import type { LabTest } from '@/types/lab-report'
import { Badge, Accordion } from '@/components/ui'
import { AbnormalMarkerCard } from '@/components/features/explanation/AbnormalMarkerCard'
import { DoctorNotes } from '@/components/features/explanation/DoctorNotes'
import { DocumentLink } from '@/components/features/records/DocumentLink'

interface LabReportDetailProps {
  record:        RecordDetail
  profileName:   string
  signedFileUrl: string | null
}

const STATUS_ORDER: Record<string, number> = { critical: 0, high: 1, low: 2, normal: 3, '': 4 }

const STATUS_BADGE: Record<string, 'error' | 'warning' | 'success' | 'default'> = {
  critical: 'error',
  high:     'warning',
  low:      'warning',
  normal:   'success',
}

function LabTestRow({ test }: { test: LabTest }) {
  const variant    = STATUS_BADGE[test.status] ?? 'default'
  const isAbnormal = test.status === 'high' || test.status === 'low' || test.status === 'critical'
  return (
    <li className="flex items-center justify-between gap-2 py-3 border-b border-border-subtle last:border-0">
      <div className="min-w-0">
        <p className={['text-sm font-medium', isAbnormal ? 'text-text-primary' : 'text-text-secondary'].join(' ')}>
          {test.testName}
        </p>
        {test.referenceRange && (
          <p className="text-xs text-text-muted mt-0.5">Ref: {test.referenceRange}</p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-2">
        <span className={['text-sm font-semibold tabular-nums', isAbnormal ? 'text-text-primary' : 'text-text-muted'].join(' ')}>
          {test.result}{test.unit ? ` ${test.unit}` : ''}
        </span>
        {test.status !== 'normal' && test.status !== '' && (
          <Badge variant={variant} size="sm">{test.status}</Badge>
        )}
      </div>
    </li>
  )
}

export function LabReportDetail({ record, signedFileUrl }: LabReportDetailProps) {
  const { labTests, abnormalMarkers, recommendations, aiSummary, connectionTags, fileUrl, documentType } = record

  const criticalCount = abnormalMarkers.filter((m) => m.status === 'critical').length
  const watchCount    = abnormalMarkers.filter((m) => m.status === 'high' || m.status === 'low').length
  const totalTests    = labTests?.length ?? 0
  const normalCount   = Math.max(0, totalTests - abnormalMarkers.length)
  const hasTests      = totalTests > 0
  const hasMarkers    = abnormalMarkers.length > 0

  const sortedTests = hasTests
    ? [...labTests!].sort((a, b) => (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4))
    : []

  return (
    <div className="space-y-5">

      {/* ── Stats row ── */}
      {hasTests && (
        <div className="flex flex-wrap gap-2">
          {criticalCount > 0 && <Badge variant="error">{criticalCount} Critical</Badge>}
          {watchCount    > 0 && <Badge variant="warning">{watchCount} Watch</Badge>}
          {normalCount   > 0 && <Badge variant="success">{normalCount} Normal</Badge>}
        </div>
      )}

      {/* ── AI Insights ── */}
      {!!aiSummary && (
        <>
          <DoctorNotes notes={[aiSummary]} title="AI Insights" />
          {(connectionTags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 -mt-3">
              {connectionTags!.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'var(--color-primary)', color: '#fff' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Key Actions ── */}
      {recommendations.length > 0 && (
        <DoctorNotes notes={recommendations} title="Things to follow" />
      )}

      {/* ── Key Findings ── */}
      <section>
        {hasMarkers ? (
          <>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Key Findings · {abnormalMarkers.length}
            </h3>
            <div className="space-y-4">
              {abnormalMarkers.map((marker, i) => (
                <AbnormalMarkerCard key={marker.id ?? i} marker={marker} />
              ))}
            </div>
          </>
        ) : (
          <div className="bg-success-subtle rounded-2xl p-5 flex items-start gap-3">
            <svg className="w-6 h-6 text-success shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </section>

      {/* ── All Results accordion ── */}
      {hasTests && (
        <Accordion
          items={[
            {
              id: 'all-results',
              trigger: (
                <span className="font-display text-sm font-semibold text-text-primary">
                  All Results · {totalTests} tests
                </span>
              ),
              content: (
                <ul>
                  {sortedTests.map((test, i) => (
                    <LabTestRow key={i} test={test} />
                  ))}
                </ul>
              ),
            },
          ]}
        />
      )}

      {/* ── Document link ── */}
      {signedFileUrl && (
        <DocumentLink url={signedFileUrl} fileUrl={fileUrl} documentType={documentType} />
      )}

    </div>
  )
}
