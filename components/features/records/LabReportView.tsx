'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { AbnormalMarker, LabTest } from '@/types/lab-report'

interface LabReportViewProps {
  profileName:      string
  documentDate:     string | null
  doctorName:       string | null
  conditionTags:    string[]
  abnormalMarkers:  AbnormalMarker[]
  labTests:         LabTest[] | null
  recommendations:  string[]
  summary:          string | null
  connectionTags?:  string[]
  signedFileUrl:    string | null
  fileUrl:          string | null
  isOwnProfile:     boolean
  /** If provided, renders the back button as a button instead of a Link to /dashboard */
  onBack?:          () => void
}

// ── helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

type BarData = { pct: number; refLeft: number; refWidth: number; trackLo: number; trackHi: number; refLo: number; refHi: number }

function parseRangeBar(value: string, referenceRange: string): BarData | null {
  const match = referenceRange.match(/([\d.]+)\s*[-–]\s*([\d.]+)/)
  if (!match) return null
  const refLo = parseFloat(match[1])
  const refHi = parseFloat(match[2])
  const val   = parseFloat(value)
  if (isNaN(refLo) || isNaN(refHi) || isNaN(val)) return null
  const span    = refHi - refLo
  const trackLo = Math.max(0, refLo - span * 0.5)
  const trackHi = refHi + span * 0.5
  const range   = trackHi - trackLo
  return {
    pct:      Math.min(Math.max(((val - trackLo) / range) * 100, 2), 98),
    refLeft:  ((refLo - trackLo) / range) * 100,
    refWidth: (span / range) * 100,
    trackLo, trackHi, refLo, refHi,
  }
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Vitamins & nutrition':   ['vitamin', 'b12', 'folate', 'ferritin', 'serum iron', 'calcium', 'zinc', 'magnesium', '25-hydroxy'],
  'Blood & immunity':       ['haemoglobin', 'hemoglobin', 'wbc', 'rbc', 'platelet', 'esr', 'white blood', 'red blood', 'hematocrit', 'mcv', 'mch', 'mchc', 'pcv', 'total count', 'differential'],
  'Heart & cholesterol':    ['cholesterol', 'ldl', 'hdl', 'triglyceride', 'vldl', 'lipoprotein', 'lipid'],
  'Blood sugar & thyroid':  ['glucose', 'sugar', 'hba1c', 'hb a1c', 'insulin', 'tsh', 'thyroid', ' t3', ' t4', 'glycated'],
  'Liver health':           ['alt', 'ast', 'bilirubin', 'albumin', 'alp', 'ggt', 'sgot', 'sgpt', 'total protein', 'globulin'],
  'Kidney health':          ['creatinine', 'urea', 'bun', 'uric acid', 'sodium', 'potassium', 'chloride', 'electrolyte'],
  'Reproductive health':    ['pcod', 'pap', 'fsh', 'lh', 'testosterone', 'amh', 'progesterone', 'estrogen', 'follicle', 'prolactin'],
}

function getCategory(name: string): string {
  const lower = name.toLowerCase()
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some(k => lower.includes(k))) return cat
  }
  return 'Other tests'
}

function groupTests(tests: LabTest[]): Record<string, LabTest[]> {
  const out: Record<string, LabTest[]> = {}
  for (const t of tests) {
    const cat = getCategory(t.testName)
    ;(out[cat] ??= []).push(t)
  }
  return out
}

const STATUS_CFG = {
  critical: { label: 'Critical', color: 'var(--color-error)',   bg: 'var(--color-error-subtle)'   },
  high:     { label: 'High',     color: 'var(--color-warning)', bg: 'var(--color-warning-subtle)' },
  low:      { label: 'Low',      color: 'var(--color-warning)', bg: 'var(--color-warning-subtle)' },
  normal:   { label: 'Normal',   color: 'var(--color-teal)',    bg: 'var(--color-teal-subtle)'    },
  '':       { label: 'Normal',   color: 'var(--color-teal)',    bg: 'var(--color-teal-subtle)'    },
} as const

function sCfg(status: string) {
  return STATUS_CFG[status as keyof typeof STATUS_CFG] ?? STATUS_CFG.normal
}

// ── RangeBar ──────────────────────────────────────────────────────────────────

function RangeBar({ value, referenceRange, status, size = 'md' }: {
  value: string; referenceRange: string; status: string; size?: 'sm' | 'md'
}) {
  const bar = parseRangeBar(value, referenceRange)
  const { color } = sCfg(status)
  const h = size === 'sm' ? 6 : 10

  if (!bar) {
    return (
      <p className="text-xs font-body" style={{ color: 'var(--color-text-muted)' }}>
        Reference: <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{referenceRange}</span>
      </p>
    )
  }

  return (
    <div>
      <div className="relative rounded-full" style={{ height: h, background: '#E5E8F2' }}>
        <div className="absolute rounded-full" style={{ height: h, left: `${bar.refLeft}%`, width: `${bar.refWidth}%`, background: `${color}22` }} />
        <div className="absolute rounded-full border-2 border-white" style={{
          width: size === 'sm' ? 14 : 20, height: size === 'sm' ? 14 : 20,
          left: `${bar.pct}%`, top: '50%',
          transform: 'translate(-50%,-50%)',
          background: color, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 1,
        }} />
      </div>
      {size === 'md' && (
        <div className="flex justify-between text-[10px] mt-1 font-body" style={{ color: 'var(--color-text-muted)' }}>
          <span>{bar.trackLo}</span>
          <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Normal {bar.refLo}–{bar.refHi}</span>
          <span>{bar.trackHi}</span>
        </div>
      )}
    </div>
  )
}

// ── KeyFindingCard ────────────────────────────────────────────────────────────

function KeyFindingCard({ marker }: { marker: AbnormalMarker }) {
  const { label, color, bg } = sCfg(marker.status)

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}>
      <div className="h-[3px]" style={{ background: color }} />
      <div className="p-5">

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
              {marker.status === 'critical'
                ? <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/>
                : marker.status === 'high'
                  ? <path d="M12 5v14M5 12l7-7 7 7"/>
                  : <path d="M12 19V5M5 12l7 7 7-7"/>
              }
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-[15px] font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>{marker.name}</h3>
            <p className="font-body text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {marker.sub ?? [marker.referenceRange, marker.unit].filter(Boolean).join(' · ')}
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide text-white" style={{ background: color }}>
            {label}
          </span>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-display font-extrabold leading-none tracking-tight" style={{ fontSize: 48, color }}>{marker.value}</span>
          {marker.unit && <span className="font-body text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{marker.unit}</span>}
        </div>

        {/* Range bar */}
        {marker.referenceRange && (
          <div className="mb-4">
            <RangeBar value={marker.value} referenceRange={marker.referenceRange} status={marker.status} />
          </div>
        )}

        {/* Body systems chips */}
        {marker.bodySystems && marker.bodySystems.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {marker.bodySystems.map((s) => (
              <span key={s} className="font-body text-[11px] font-semibold px-2.5 py-1 rounded-full border" style={{ background: 'white', borderColor: '#D0DEFF', color: 'var(--color-primary)' }}>
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Explanation */}
        {marker.explanation && (
          <div className="rounded-xl p-3.5 flex gap-2.5 mb-4" style={{ background: 'var(--color-primary-subtle)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(29,78,216,0.15)' }}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2.2} strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
            </div>
            <div>
              <p className="font-display text-xs font-bold mb-1" style={{ color: 'var(--color-primary)' }}>What this means for you</p>
              <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{marker.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Recommended actions */}
      {marker.actions && marker.actions.length > 0 && (
        <>
          <div className="px-5 pb-2">
            <p className="font-body text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Recommended actions</p>
          </div>
          {marker.actions.map((action, i) => (
            <div key={i} className="flex gap-3 items-start px-5 py-2.5 border-t" style={{ borderColor: 'rgba(168,85,247,0.08)', background: action.urgent ? 'var(--color-primary-subtle)' : 'white' }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: action.urgent ? 'rgba(29,78,216,0.15)' : 'var(--color-surface-subtle)' }}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth={2} strokeLinecap="round">
                  {action.urgent
                    ? <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></>
                    : <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                  }
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-xs font-bold" style={{ color: action.urgent ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{action.title}</p>
                <p className="font-body text-[11px] leading-relaxed mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{action.detail}</p>
              </div>
            </div>
          ))}
          <div className="h-3" />
        </>
      )}
    </div>
  )
}

// ── ResultsAccordion ──────────────────────────────────────────────────────────

function ResultsAccordion({ tests }: { tests: LabTest[] }) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set())
  const [openRow,  setOpenRow]  = useState<string | null>(null)

  const groups = groupTests(tests)

  function toggleCat(cat: string) {
    setOpenCats(prev => {
      const n = new Set(prev)
      n.has(cat) ? n.delete(cat) : n.add(cat)
      return n
    })
  }

  function toggleRow(key: string) {
    setOpenRow(prev => (prev === key ? null : key))
  }

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', boxShadow: '0 2px 12px rgba(24,28,33,0.06)' }}>
      {Object.entries(groups).map(([cat, rows], ci) => {
        const isOpen = openCats.has(cat)
        return (
          <div key={cat} className="border-b last:border-b-0" style={{ borderColor: 'rgba(168,85,247,0.08)' }}>

            {/* Category header */}
            <button
              onClick={() => toggleCat(cat)}
              className="w-full flex items-center gap-3 px-[18px] py-3.5 text-left transition-colors"
              style={{ background: isOpen ? '#F8FAFF' : 'white' }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{cat}</p>
                <p className="font-body text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{rows.length} tests · tap to expand</p>
              </div>
              <div className="flex gap-1">
                {rows.map((t, i) => (
                  <div key={i} className="w-2 h-2 rounded-full" style={{ background: sCfg(t.status).color }} />
                ))}
              </div>
              <svg className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ color: 'var(--color-text-muted)' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Rows */}
            {isOpen && (
              <div className="border-t" style={{ borderColor: 'rgba(168,85,247,0.08)' }}>
                {rows.map((t, ti) => {
                  const rowKey  = `${ci}-${ti}`
                  const isRowOpen = openRow === rowKey
                  const { color, bg, label } = sCfg(t.status)
                  const bar = t.referenceRange ? parseRangeBar(t.result, t.referenceRange) : null
                  const isAbnormal = t.status === 'critical' || t.status === 'high' || t.status === 'low'

                  return (
                    <div key={ti}>
                      <div
                        className="flex items-stretch border-b last:border-b-0 cursor-pointer transition-colors"
                        style={{ borderColor: 'rgba(168,85,247,0.06)', background: isRowOpen ? '#F8FAFF' : 'white' }}
                        onClick={() => toggleRow(rowKey)}
                      >
                        {/* Side bar */}
                        <div className="w-[4px] shrink-0" style={{ background: color }} />

                        <div className="flex-1 px-3 py-3 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="font-display text-[13px] font-semibold flex-1" style={{ color: 'var(--color-text-primary)' }}>{t.testName}</p>
                            <div className="text-right shrink-0">
                              <p className="font-display font-bold leading-none" style={{ fontSize: 18, color }}>{t.result}</p>
                              {t.unit && <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t.unit}</p>}
                              {isAbnormal && (
                                <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: bg, color }}>{label}</span>
                              )}
                            </div>
                            <svg className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isRowOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ color: 'var(--color-text-muted)' }}>
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          </div>

                          {/* Mini slider */}
                          {!isRowOpen && bar && (
                            <div className="relative mt-1" style={{ height: 6 }}>
                              <div className="absolute inset-0 rounded-full" style={{ background: '#E5E8F2' }} />
                              <div className="absolute rounded-full" style={{ height: 6, left: `${bar.refLeft}%`, width: `${bar.refWidth}%`, background: `${color}28` }} />
                              <div className="absolute rounded-full border-2 border-white" style={{
                                width: 14, height: 14,
                                left: `${bar.pct}%`, top: '50%', transform: 'translate(-50%,-50%)',
                                background: color, boxShadow: '0 1px 4px rgba(0,0,0,0.22)', zIndex: 1,
                              }} />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isRowOpen && (
                        <div className="px-4 py-4 border-b" style={{ background: '#F8FAFF', borderColor: 'var(--color-border)' }}>
                          {bar ? (
                            <>
                              <div className="relative rounded-full mb-1" style={{ height: 10, background: '#E5E8F2' }}>
                                <div className="absolute rounded-full" style={{ height: 10, left: `${bar.refLeft}%`, width: `${bar.refWidth}%`, background: `${color}25` }} />
                                <div className="absolute rounded-full border-[3px] border-white" style={{
                                  width: 20, height: 20,
                                  left: `${bar.pct}%`, top: '50%', transform: 'translate(-50%,-50%)',
                                  background: color, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 1,
                                }} />
                              </div>
                              <div className="flex justify-between text-[10px] mb-3 font-body" style={{ color: 'var(--color-text-muted)' }}>
                                <span>{bar.trackLo}</span>
                                <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Normal {bar.refLo}–{bar.refHi}</span>
                                <span>{bar.trackHi}</span>
                              </div>
                            </>
                          ) : t.referenceRange && (
                            <p className="font-body text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                              Reference: <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{t.referenceRange}</span>
                            </p>
                          )}
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-display font-extrabold leading-none tracking-tight" style={{ fontSize: 34, color }}>{t.result}</span>
                            {t.unit && <span className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>{t.unit}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── LabReportView ─────────────────────────────────────────────────────────────

export function LabReportView({
  profileName, documentDate, doctorName, conditionTags,
  abnormalMarkers, labTests, recommendations, summary, connectionTags,
  signedFileUrl, fileUrl, isOwnProfile, onBack,
}: LabReportViewProps) {
  const tests        = labTests ?? []
  const criticalCnt  = tests.filter(t => t.status === 'critical').length
  const watchCnt     = tests.filter(t => t.status === 'high' || t.status === 'low').length
  const normalCnt    = tests.filter(t => t.status === 'normal' || t.status === '').length
  const normalTests  = tests.filter(t => t.status === 'normal' || t.status === '')
  const initials     = profileName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const isPdf        = fileUrl?.toLowerCase().endsWith('.pdf')
  const pageTitle    = isOwnProfile ? 'Your Lab Report' : `${profileName}'s Lab Report`

  return (
    <main className="min-h-screen" style={{ background: 'var(--color-surface-subtle)' }}>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-lg" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          {onBack ? (
            <button onClick={onBack} className="touch-target flex items-center justify-center -ml-2 p-2 rounded-xl transition-colors hover:bg-surface-subtle" aria-label="Back">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          ) : (
            <Link href="/dashboard" className="touch-target flex items-center justify-center -ml-2 p-2 rounded-xl transition-colors hover:bg-surface-subtle" aria-label="Back">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6"/>
              </svg>
            </Link>
          )}
          <h1 className="font-display text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>{pageTitle}</h1>
          <div className="w-10" aria-hidden="true"/>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 pb-16">

        {/* Patient header */}
        <div className="bg-white rounded-2xl border p-4 flex items-center gap-4 flex-wrap mb-4" style={{ borderColor: 'var(--color-border)', boxShadow: '0 2px 12px rgba(24,28,33,0.04)' }}>
          <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-display text-sm font-bold text-white" style={{ background: 'var(--color-primary)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold" style={{ fontSize: 17, color: 'var(--color-text-primary)' }}>{profileName}</p>
            <p className="font-body text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {[doctorName, formatDate(documentDate)].filter(Boolean).join(' · ')}
            </p>
          </div>
          {conditionTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {conditionTags.map(t => (
                <span key={t} className="font-body text-xs font-semibold px-3 py-1 rounded-full border" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>{t}</span>
              ))}
            </div>
          )}
          {tests.length > 0 && (
            <span className="font-body text-xs font-semibold px-3 py-1.5 rounded-full border shrink-0" style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
              {tests.length} tests
            </span>
          )}
        </div>

        {/* AI disclaimer */}
        <div className="flex gap-2.5 items-start rounded-xl p-3 mb-4 border font-body text-xs leading-relaxed" style={{ background: 'var(--color-warning-subtle)', borderColor: '#FDE68A', color: 'var(--color-warning)' }}>
          <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="1" fill="currentColor"/>
          </svg>
          AI-generated analysis for informational purposes only. Do not change any medication or treatment based on this. Always consult your doctor.
        </div>

        {/* Stats strip */}
        {tests.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {([
              { n: criticalCnt, label: 'Need attention', color: 'var(--color-error)',   bg: 'var(--color-error-subtle)'   },
              { n: watchCnt,    label: 'Watch closely',  color: 'var(--color-warning)', bg: 'var(--color-warning-subtle)' },
              { n: normalCnt,   label: 'Normal',         color: 'var(--color-teal)',    bg: 'var(--color-teal-subtle)'    },
            ] as const).map(({ n, label, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border p-3 flex items-center gap-2.5" style={{ borderColor: 'var(--color-border)', boxShadow: '0 1px 6px rgba(24,28,33,0.04)' }}>
                <div className="w-8 h-8 rounded-xl shrink-0" style={{ background: bg }} />
                <div>
                  <p className="font-display font-extrabold leading-none" style={{ fontSize: 22, color }}>{n}</p>
                  <p className="font-body text-[10px] font-semibold mt-0.5" style={{ color }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2-column grid */}
        <div className="flex flex-col md:flex-row gap-4 items-start">

          {/* LEFT sidebar */}
          <div className="flex flex-col gap-3 w-full md:w-[280px] shrink-0 md:sticky md:top-20">

            {/* Connection insight */}
            {summary && (
              <div className="rounded-2xl p-4" style={{ background: 'var(--color-primary)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)' }}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                    </svg>
                  </div>
                  <p className="font-display text-[13px] font-bold text-white">How these findings connect</p>
                </div>
                <p className="font-body text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{summary}</p>
                {connectionTags && connectionTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {connectionTags.map((tag) => (
                      <span key={tag} className="font-body text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.14)', color: 'white' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Normal results list */}
            {normalTests.length > 0 && (
              <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', boxShadow: '0 2px 12px rgba(24,28,33,0.04)' }}>
                <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ background: 'var(--color-teal-subtle)', borderColor: 'rgba(0,106,102,0.12)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,106,102,0.2)' }}>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth={2.5} strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-display text-xs font-bold" style={{ color: 'var(--color-teal)' }}>{normalTests.length} normal results</p>
                    <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>All within healthy range</p>
                  </div>
                </div>
                {normalTests.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 border-b last:border-b-0 font-body text-xs" style={{ borderColor: 'rgba(168,85,247,0.06)' }}>
                    <span className="flex-1" style={{ color: 'var(--color-text-secondary)' }}>{t.testName}</span>
                    <span className="font-bold" style={{ color: 'var(--color-teal)' }}>{t.result}</span>
                    {t.unit && <span style={{ color: 'var(--color-text-muted)' }}>{t.unit}</span>}
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--color-teal-subtle)', border: '1.5px solid rgba(0,106,102,0.25)' }}>
                      <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth={3} strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* Key findings */}
            {abnormalMarkers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="font-display text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>Key findings</h2>
                  {criticalCnt > 0 && <span className="font-body text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--color-error-subtle)', color: 'var(--color-error)' }}>{criticalCnt} critical</span>}
                  {watchCnt > 0   && <span className="font-body text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--color-warning-subtle)', color: 'var(--color-warning)' }}>{watchCnt} watch</span>}
                </div>
                <div className="flex flex-col gap-3">
                  {abnormalMarkers.map((m, i) => (
                    <KeyFindingCard key={m.id ?? i} marker={m} />
                  ))}
                </div>
              </div>
            )}

            {/* Doctor recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-2xl border p-4" style={{ borderColor: 'var(--color-border)', boxShadow: '0 2px 12px rgba(24,28,33,0.04)' }}>
                <p className="font-display text-[13px] font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Doctor's notes</p>
                <ul className="flex flex-col gap-2">
                  {recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2.5 items-start font-body text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-2" style={{ background: 'var(--color-primary)' }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* All results accordion */}
            {tests.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="font-display text-[13px] font-bold" style={{ color: 'var(--color-text-primary)' }}>All results by category</h2>
                  <span className="font-body text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}>Tap to expand</span>
                </div>
                <ResultsAccordion tests={tests} />
              </div>
            )}

            {/* All clear */}
            {tests.length === 0 && abnormalMarkers.length === 0 && (
              <div className="bg-white rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--color-border)' }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--color-teal-subtle)' }}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <p className="font-display text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>All Clear</p>
                <p className="font-body text-sm mt-1 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>All test results are within normal range.</p>
              </div>
            )}

            {/* View original */}
            {signedFileUrl && (
              <a href={signedFileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-2xl border px-4 py-3.5 transition-colors hover:bg-surface-subtle"
                style={{ borderColor: 'var(--color-border)', boxShadow: '0 2px 12px rgba(24,28,33,0.04)' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-primary-subtle)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="var(--color-primary)" viewBox="0 0 24 24" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>View original lab report →</p>
                  <p className="font-body text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{isPdf ? 'PDF' : 'Image'} · Opens in new tab</p>
                </div>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-text-muted)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </a>
            )}

          </div>
        </div>
      </div>
    </main>
  )
}
