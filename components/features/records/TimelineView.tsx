'use client'

import { useState }    from 'react'
import { RecordCard }  from './RecordCard'
import { Button }      from '@/components/ui'
import { Input }       from '@/components/ui'
import type { TimelineDocument } from '@/services/records.service'
import type { FamilyProfile }    from '@/types/family'
import { toTitleCase }           from '@/lib/utils/string'

interface TimelineViewProps {
  documents: TimelineDocument[]
  profiles:  FamilyProfile[]
}

interface YearMonthGroups {
  multiYear: boolean
  /** year label → [ month label → docs ] */
  groups: [string, [string, TimelineDocument[]][]][]
}

function groupByYearMonth(docs: TimelineDocument[]): YearMonthGroups {
  // year → month → docs
  const yearMap = new Map<string, Map<string, TimelineDocument[]>>()

  for (const doc of docs) {
    const raw = doc.document_date ?? doc.created_at
    let year  = 'Unknown'
    let month = 'Unknown date'
    if (raw) {
      const d = new Date(raw)
      year  = String(d.getFullYear())
      month = d.toLocaleDateString('en-IN', { month: 'long' })
    }
    if (!yearMap.has(year)) yearMap.set(year, new Map())
    const monthMap = yearMap.get(year)!
    if (!monthMap.has(month)) monthMap.set(month, [])
    monthMap.get(month)!.push(doc)
  }

  const multiYear = yearMap.size > 1

  const groups: [string, [string, TimelineDocument[]][]][] = Array.from(yearMap.entries()).map(
    ([year, monthMap]) => [year, Array.from(monthMap.entries())]
  )

  return { multiYear, groups }
}

const CHIP_BASE = 'px-3.5 py-1.5 rounded-full font-body text-[12px] font-semibold transition-all whitespace-nowrap shrink-0 min-h-[34px]'
const CHIP_ON   = 'text-white'
const CHIP_OFF  = 'text-text-secondary bg-white'

export function TimelineView({ documents, profiles }: TimelineViewProps) {
  const [profileFilter, setProfileFilter] = useState<string | null>(null)
  const [typeFilter,    setTypeFilter]    = useState<string | null>(null)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [sortOrder,     setSortOrder]     = useState<'newest_first' | 'oldest_first' | 'by_type'>('newest_first')

  // ── 1. Search filter ──────────────────────────────────────
  const lowerQuery = searchQuery.toLowerCase().trim()
  const searchFiltered = lowerQuery === ''
    ? documents
    : documents.filter((d) => {
        if (d.doctor_name?.toLowerCase().includes(lowerQuery)) return true
        if (d.tags?.some((t) => t.toLowerCase().includes(lowerQuery))) return true
        if (d.summary?.toLowerCase().includes(lowerQuery)) return true
        return false
      })

  // ── 2. Profile + type filters ─────────────────────────────
  const filtered = searchFiltered.filter((d) => {
    if (profileFilter && d.profile_id    !== profileFilter) return false
    if (typeFilter    && d.document_type !== typeFilter)    return false
    return true
  })

  // ── 3. Sort ───────────────────────────────────────────────
  function compareDates(a: TimelineDocument, b: TimelineDocument): number {
    const da = a.document_date ?? a.created_at ?? ''
    const db = b.document_date ?? b.created_at ?? ''
    return da < db ? -1 : da > db ? 1 : 0
  }

  const sorted = (() => {
    if (sortOrder === 'oldest_first') return [...filtered].sort((a, b) => compareDates(a, b))
    if (sortOrder === 'by_type') {
      const rx  = filtered.filter((d) => d.document_type === 'prescription').sort((a, b) => compareDates(b, a))
      const lab = filtered.filter((d) => d.document_type !== 'prescription').sort((a, b) => compareDates(b, a))
      return [...rx, ...lab]
    }
    // newest_first (default)
    return [...filtered].sort((a, b) => compareDates(b, a))
  })()

  // ── 4. Group ──────────────────────────────────────────────
  const { multiYear, groups } = groupByYearMonth(sorted)

  const multiProfile = profiles.length > 1

  const chipStyle = (active: boolean) =>
    active
      ? { background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', border: '1px solid transparent', boxShadow: '0 2px 10px rgba(124,58,237,.3)' }
      : { border: '1px solid rgba(124,58,237,.15)', background: '#fff' }

  const SORT_OPTIONS: { key: 'newest_first' | 'oldest_first' | 'by_type'; label: string }[] = [
    { key: 'newest_first', label: 'Newest first' },
    { key: 'oldest_first', label: 'Oldest first' },
    { key: 'by_type',      label: 'By type' },
  ]

  return (
    <div className="flex flex-col gap-5">

      {/* ── Search ────────────────────────────────────────── */}
      <Input
        aria-label="Search records"
        placeholder="Search by doctor, condition, or medication…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* ── Sort control ──────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: 'none' }} aria-label="Sort records">
        {SORT_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSortOrder(key)}
            className={[CHIP_BASE, sortOrder === key ? CHIP_ON : CHIP_OFF].join(' ')}
            style={chipStyle(sortOrder === key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Profile filter chips ───────────────────────────── */}
      {multiProfile && (
        <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          <span className="text-xs font-semibold text-text-muted shrink-0">Who:</span>
          <button onClick={() => setProfileFilter(null)} className={[CHIP_BASE, profileFilter === null ? CHIP_ON : CHIP_OFF].join(' ')} style={chipStyle(profileFilter === null)}>
            All
          </button>
          {profiles.map((p) => (
            <button key={p.id} onClick={() => setProfileFilter(p.id)} className={[CHIP_BASE, profileFilter === p.id ? CHIP_ON : CHIP_OFF].join(' ')} style={chipStyle(profileFilter === p.id)}>
              <span className="md:hidden">{toTitleCase(p.full_name).split(' ')[0]}</span>
              <span className="hidden md:inline">{toTitleCase(p.full_name)}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Type filter chips ──────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
        <span className="text-xs font-semibold text-text-muted shrink-0">Type:</span>
        {[
          { key: null,           label: `All · ${filtered.length}` },
          { key: 'prescription', label: 'Prescriptions' },
          { key: 'lab_report',   label: 'Lab Reports' },
        ].map(({ key, label }) => (
          <button
            key={String(key)}
            onClick={() => setTypeFilter(key)}
            className={[CHIP_BASE, typeFilter === key ? CHIP_ON : CHIP_OFF].join(' ')}
            style={chipStyle(typeFilter === key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Records list ───────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(124,58,237,.08)', border: '1px solid rgba(124,58,237,.12)' }}
          >
            <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-text-primary">No records found</p>
            <p className="font-body text-xs text-text-muted mt-1 leading-relaxed max-w-[240px]">
              {typeFilter || profileFilter || lowerQuery ? 'Try a different filter or search term' : 'Upload a prescription or lab report from the dashboard to get started'}
            </p>
          </div>
        </div>
      ) : (
        <>
          {multiYear
            ? /* ── Multi-year: year header → month sub-groups ── */
              groups.map(([year, monthGroups]) => (
                <div key={year} className="flex flex-col gap-4">
                  {/* Year header */}
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-base font-bold text-text-primary whitespace-nowrap">
                      {year}
                    </h2>
                    <div className="flex-1 h-px" style={{ background: 'rgba(124,58,237,.18)' }} />
                  </div>
                  {monthGroups.map(([month, docs]) => (
                    <section key={month} className="flex flex-col gap-2 pl-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">
                          {month}
                        </h3>
                        <div className="flex-1 h-px" style={{ background: 'rgba(124,58,237,.10)' }} />
                      </div>
                      {docs.map((doc) => (
                        <RecordCard key={doc.id} record={doc} />
                      ))}
                    </section>
                  ))}
                </div>
              ))
            : /* ── Single year: flat month groups with "Month Year" header ── */
              groups.map(([_year, monthGroups]) =>
                monthGroups.map(([month, docs]) => {
                  // In single-year mode, show "Month Year" by appending the year
                  const year = _year !== 'Unknown' ? _year : ''
                  const header = year ? `${month} ${year}` : month
                  return (
                    <section key={month} className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <h2 className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">
                          {header}
                        </h2>
                        <div className="flex-1 h-px" style={{ background: 'rgba(124,58,237,.12)' }} />
                      </div>
                      {docs.map((doc) => (
                        <RecordCard key={doc.id} record={doc} />
                      ))}
                    </section>
                  )
                })
              )
          }

          {/* ── Add another record CTA ─────────────────────── */}
          <div className="pt-2 flex justify-center">
            <Button variant="secondary" href="/dashboard">
              Add another record →
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
