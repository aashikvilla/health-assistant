'use client'

import { useState }    from 'react'
import { RecordCard }  from './RecordCard'
import type { TimelineDocument } from '@/services/records.service'
import type { FamilyProfile }    from '@/types/family'

interface TimelineViewProps {
  documents: TimelineDocument[]
  profiles:  FamilyProfile[]
}

function groupByMonth(docs: TimelineDocument[]): [string, TimelineDocument[]][] {
  const groups = new Map<string, TimelineDocument[]>()
  for (const doc of docs) {
    const raw = doc.document_date ?? doc.created_at
    let key = 'Unknown date'
    if (raw) {
      const d = new Date(raw)
      key = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    }
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(doc)
  }
  return Array.from(groups.entries())
}

const CHIP_BASE = 'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap shrink-0 min-h-[36px]'
const CHIP_ON   = 'bg-primary text-text-inverse'
const CHIP_OFF  = 'bg-surface-subtle text-text-secondary'

export function TimelineView({ documents, profiles }: TimelineViewProps) {
  const [profileFilter, setProfileFilter] = useState<string | null>(null)
  const [typeFilter,    setTypeFilter]    = useState<string | null>(null)

  const filtered = documents.filter((d) => {
    if (profileFilter && d.profile_id   !== profileFilter) return false
    if (typeFilter    && d.document_type !== typeFilter)    return false
    return true
  })

  const grouped      = groupByMonth(filtered)
  const multiProfile = profiles.length > 1

  return (
    <div className="flex flex-col gap-5">

      {/* ── Profile filter chips ───────────────────────────── */}
      {multiProfile && (
        <div
          className="flex gap-2 overflow-x-auto -mx-4 px-4"
          style={{ scrollbarWidth: 'none' }}
        >
          <button
            onClick={() => setProfileFilter(null)}
            className={[CHIP_BASE, profileFilter === null ? CHIP_ON : CHIP_OFF].join(' ')}
          >
            All
          </button>
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setProfileFilter(p.id)}
              className={[CHIP_BASE, profileFilter === p.id ? CHIP_ON : CHIP_OFF].join(' ')}
            >
              {p.full_name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {/* ── Type filter chips ──────────────────────────────── */}
      <div
        className="flex gap-2 overflow-x-auto -mx-4 px-4"
        style={{ scrollbarWidth: 'none' }}
      >
        <button
          onClick={() => setTypeFilter(null)}
          className={[CHIP_BASE, typeFilter === null ? CHIP_ON : CHIP_OFF].join(' ')}
        >
          All types
        </button>
        <button
          onClick={() => setTypeFilter('prescription')}
          className={[CHIP_BASE, typeFilter === 'prescription' ? CHIP_ON : CHIP_OFF].join(' ')}
        >
          Prescriptions
        </button>
        <button
          onClick={() => setTypeFilter('lab_report')}
          className={[CHIP_BASE, typeFilter === 'lab_report' ? CHIP_ON : CHIP_OFF].join(' ')}
        >
          Lab Reports
        </button>
      </div>

      {/* ── Records list ───────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center">
            <svg
              className="w-6 h-6 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">No records found</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-[240px]">
              {typeFilter || profileFilter
                ? 'Try a different filter'
                : 'Upload a prescription or lab report from the dashboard to get started'}
            </p>
          </div>
        </div>
      ) : (
        grouped.map(([month, docs]) => (
          <section key={month} className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {month}
            </h2>
            {docs.map((doc) => (
              <RecordCard key={doc.id} record={doc} />
            ))}
          </section>
        ))
      )}
    </div>
  )
}
