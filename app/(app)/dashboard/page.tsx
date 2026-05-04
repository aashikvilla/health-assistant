import { redirect }                    from 'next/navigation'
import { createClient }               from '@/lib/supabase/server'
import { familyService }              from '@/services/family.service'
import { recordsService }             from '@/services/records.service'
import { ProfileSectionWithEdit }      from '@/components/features/family/ProfileSectionWithEdit'
import { PrescriptionActions }        from '@/components/features/family/PrescriptionActions'
import { EmptyPrescriptions }         from '@/components/features/family/EmptyPrescriptions'
import { RecordCard }                 from '@/components/features/records/RecordCard'
import { PendingUploadBanner }        from '@/components/features/upload/PendingUploadBanner'
import { PushPermissionBannerWrapper } from '@/components/features/notifications/PushPermissionBannerWrapper'
import { ActiveMedicationsStrip }     from '@/components/features/hub/ActiveMedicationsStrip'
import { LabAlertCard }               from '@/components/features/hub/LabAlertCard'
import { Button }    from '@/components/ui'
import { APP_NAME } from '@/constants'
import { signOut }  from '@/app/actions'
import Link         from 'next/link'
import type { Medication } from '@/types/prescription'

interface HubPageProps {
  searchParams: Promise<{ profile?: string }>
}

interface OutOfRangeValue {
  name:   string
  result: string
  status: string
}

// ── Medication active-status helpers ──────────────────────────────────────────

function parseDurationDays(frequency: string | null): number | null {
  if (!frequency) return null
  const f = frequency.toLowerCase()
  const dayMatch   = f.match(/(\d+)\s*day/)
  if (dayMatch) return parseInt(dayMatch[1], 10)
  const weekMatch  = f.match(/(\d+)\s*week/)
  if (weekMatch) return parseInt(weekMatch[1], 10) * 7
  const monthMatch = f.match(/(\d+)\s*month/)
  if (monthMatch) return parseInt(monthMatch[1], 10) * 30
  if (/\bone\s+week\b/.test(f) || f.includes('a week'))       return 7
  if (/\btwo\s+weeks?\b/.test(f) || f.includes('fortnight')) return 14
  if (/\bone\s+month\b/.test(f) || f.includes('a month'))     return 30
  return null
}

function isMedicationActive(
  med: { end_date: string | null; start_date: string | null; frequency: string | null; created_at: string | null },
  today: Date
): boolean {
  if (med.end_date) return new Date(med.end_date) >= today
  const startStr = med.start_date ?? med.created_at
  if (!startStr) return true
  const durationDays = parseDurationDays(med.frequency)
  if (durationDays === null) return true
  const endDate = new Date(startStr)
  endDate.setDate(endDate.getDate() + durationDays)
  return endDate >= today
}

// ── Data fetching ──────────────────────────────────────────────────────────────

async function fetchActiveMedications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string
): Promise<Medication[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data } = await supabase
    .from('medications')
    .select('name, dosage, frequency, start_date, end_date, created_at, source_document_id')
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (!data || data.length === 0) return []

  const docIds = [...new Set(data.map((m) => m.source_document_id).filter((id): id is string => id !== null))]
  const docDateMap = new Map<string, string | null>()
  if (docIds.length > 0) {
    const { data: docs } = await supabase.from('documents').select('id, document_date').in('id', docIds)
    for (const doc of docs ?? []) docDateMap.set(doc.id, doc.document_date)
  }

  return data
    .filter((m) => {
      const prescriptionDate = m.source_document_id ? (docDateMap.get(m.source_document_id) ?? null) : null
      return isMedicationActive({ end_date: m.end_date, start_date: m.start_date ?? prescriptionDate, frequency: m.frequency, created_at: m.created_at }, today)
    })
    .map((m) => ({ name: m.name, dosage: m.dosage ?? '', frequency: m.frequency ?? '', duration: m.frequency ?? '', confidence: 'high' as const }))
}

async function fetchLabAlerts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string
): Promise<{ values: OutOfRangeValue[]; reportDate: string | null; documentId: string | null }> {
  const { data } = await supabase
    .from('documents')
    .select('id, document_date, document_analyses ( values_out_of_range )')
    .eq('profile_id', profileId)
    .eq('document_type', 'lab_report')
    .not('document_date', 'is', null)
    .order('document_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return { values: [], reportDate: null, documentId: null }

  const doc = data as unknown as {
    id: string
    document_date: string | null
    document_analyses: { values_out_of_range: OutOfRangeValue[] | null }[]
  }

  const values = doc.document_analyses?.[0]?.values_out_of_range ?? []
  return { values, reportDate: doc.document_date, documentId: doc.id }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function HubPage({ searchParams }: HubPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { profile: profileIdParam } = await searchParams
  const profilesResult = await familyService.getProfiles(user.id)

  if (!profilesResult.success || !profilesResult.data) {
    return <HubError message={profilesResult.error ?? 'Could not load profiles.'} />
  }

  const profiles      = profilesResult.data
  const activeProfile = profiles.find((p) => p.id === profileIdParam) ?? profiles[0]

  if (!activeProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center py-12">
        <p className="text-lg font-semibold text-text-primary">Welcome! Let&apos;s get started</p>
        <p className="text-sm text-text-muted">Add your first profile to upload and track records.</p>
        <Button href="/dashboard/add-member" size="lg">Add a Profile</Button>
      </div>
    )
  }

  const [documentsResult, activeMeds, labAlerts] = await Promise.all([
    recordsService.getDocumentsForProfile(activeProfile.id),
    fetchActiveMedications(supabase, activeProfile.id),
    fetchLabAlerts(supabase, activeProfile.id),
  ])

  const documents          = documentsResult.success ? (documentsResult.data ?? []) : []
  const DASHBOARD_RX_LIMIT = 3
  const featuredDoc        = documents[0] ?? null
  const remainingDocs      = documents.slice(1, DASHBOARD_RX_LIMIT + 1)
  const selfProfile        = profiles.find((p) => p.is_self)
  const rawName            = selfProfile?.full_name ?? user.email?.split('@')[0] ?? 'there'
  const displayName        = rawName.split(' ')[0]
  const isEmpty            = documents.length === 0
  const avatarLetter       = displayName[0]?.toUpperCase() ?? 'U'

  const now      = new Date()
  const hour     = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Age from DOB
  const dob = activeProfile.date_of_birth
  const age = dob
    ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null

  // Doctor name from most recent document
  const recentDoctor = documents.find((d) => d.doctor_name)?.doctor_name ?? null

  const profileFirstName = activeProfile.full_name.split(' ')[0]
  const isSelf           = activeProfile.is_self

  // Featured doc display helpers
  const isPrescription   = featuredDoc?.document_type === 'prescription'
  const featuredDocDate  = featuredDoc?.document_date
    ? new Date(featuredDoc.document_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-surface-subtle">
      <PendingUploadBanner />
      <PushPermissionBannerWrapper userId={user.id} prescriptionCount={documents.length} />

      {/* ── Sticky nav ─────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40 bg-white border-b border-border"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between h-[52px] px-5 max-w-[1140px] mx-auto gap-3">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--color-primary)' }}
            >
              <svg width="14" height="14" viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <path d="M4 15L8.5 15L10.5 10L15 21L19.5 10L21.5 15L26 15"
                  stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span className="font-display text-[15px] font-extrabold text-text-primary tracking-tight">{APP_NAME}</span>
          </div>

          {/* Nav links — desktop */}
          <div className="hidden sm:flex items-center gap-0.5">
            {[
              { label: 'Home',     href: '/dashboard', active: true  },
              { label: 'Timeline', href: '/timeline',  active: false },
              { label: 'Profile',  href: '/settings',  active: false },
            ].map(({ label, href, active }) => (
              <Link
                key={href}
                href={href}
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold font-body transition-colors"
                style={active
                  ? { background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }
                  : { color: 'var(--color-text-muted)' }
                }
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Avatar + sign out */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-display text-[12px] font-extrabold shrink-0"
              style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
              aria-hidden="true"
            >
              {avatarLetter}
            </div>
            <form action={signOut} className="hidden sm:block">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-[12px] font-semibold font-body transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Sign out
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* ── Greeting + Profile selector ────────────────────────────────── */}
      <div className="bg-white border-b border-border">
        <div className="max-w-[1140px] mx-auto px-5 py-5 flex flex-col items-center gap-4">

          {/* Greeting */}
          <h1 className="font-display text-[26px] sm:text-[30px] font-extrabold text-text-primary tracking-tight leading-none text-center">
            {greeting}, {displayName}
          </h1>

          {/* Profile chips — centered, impactful */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {profiles.map((p) => {
              const isActive   = p.id === activeProfile.id
              const chipLetter = p.full_name[0]?.toUpperCase() ?? '?'
              const chipLabel  = p.is_self ? 'Me' : p.full_name.split(' ')[0]
              return (
                <Link
                  key={p.id}
                  href={`/dashboard?profile=${p.id}`}
                  className="flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full transition-all"
                  style={isActive
                    ? { background: 'var(--color-primary)', color: '#ffffff', boxShadow: '0 2px 12px rgba(29,78,216,.25)' }
                    : { background: 'var(--color-surface-subtle)', border: '1.5px solid var(--color-border)', color: 'var(--color-text-secondary)' }
                  }
                  aria-current={isActive ? 'true' : undefined}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-display text-[12px] font-extrabold shrink-0"
                    style={isActive
                      ? { background: 'rgba(255,255,255,.22)', color: '#fff' }
                      : { background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }
                    }
                  >
                    {chipLetter}
                  </div>
                  <span className="font-body text-[13px] font-bold">{chipLabel}</span>
                </Link>
              )
            })}
            <Link
              href="/dashboard/add-member"
              className="w-10 h-10 rounded-full flex items-center justify-center font-body text-[18px] font-bold transition-colors"
              style={{ border: '1.5px dashed var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-surface-subtle)' }}
              aria-label="Add family member"
            >
              +
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat strip ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border">
        <div className="max-w-[1140px] mx-auto px-5 flex flex-wrap sm:flex-nowrap">

          <Link href="/timeline" className="flex items-center gap-3 flex-1 min-w-[50%] sm:min-w-0 px-0 sm:px-5 py-3 sm:border-r border-b sm:border-b-0 border-border transition-colors hover:bg-surface-subtle">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'var(--color-primary-subtle)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <div>
              <div className="font-display text-[22px] font-extrabold text-text-primary leading-none">{activeMeds.length}</div>
              <div className="font-body text-[11px] text-text-muted mt-0.5">Active Meds</div>
            </div>
          </Link>

          <Link href="/timeline" className="flex items-center gap-3 flex-1 min-w-[50%] sm:min-w-0 px-5 py-3 sm:border-r border-b sm:border-b-0 border-border transition-colors hover:bg-surface-subtle">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'var(--color-warning-subtle)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <div className="font-display text-[22px] font-extrabold leading-none" style={{ color: 'var(--color-warning)' }}>{labAlerts.values.length}</div>
              <div className="font-body text-[11px] text-text-muted mt-0.5">Lab Alerts</div>
            </div>
          </Link>

          <Link href="/timeline" className="flex items-center gap-3 flex-1 min-w-[50%] sm:min-w-0 px-0 sm:px-5 py-3 sm:border-r border-border transition-colors hover:bg-surface-subtle">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'var(--color-teal-subtle)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <div className="font-display text-[22px] font-extrabold text-text-primary leading-none">{documents.length}</div>
              <div className="font-body text-[11px] text-text-muted mt-0.5">Records</div>
            </div>
          </Link>

          <Link href="/settings" className="flex items-center gap-3 flex-1 min-w-[50%] sm:min-w-0 px-5 py-3 transition-colors hover:bg-surface-subtle">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'var(--color-error-subtle)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2C9.5 6 6 9.5 6 13a6 6 0 0012 0c0-3.5-3.5-7-6-11z"/>
              </svg>
            </div>
            <div>
              <div className="font-display text-[22px] font-extrabold leading-none" style={{ color: 'var(--color-error)' }}>
                {age ? `${age}y` : '—'}
              </div>
              <div className="font-body text-[11px] text-text-muted mt-0.5">{age ? 'Age' : 'Health Profile'}</div>
            </div>
          </Link>

        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div className="max-w-[1140px] mx-auto px-5 py-4 pb-10">
        <div className="flex flex-col sm:flex-row gap-3 items-start">

          {/* ── Left column ── */}
          <div className="w-full sm:flex-1 min-w-0 flex flex-col gap-3">

            {/* Lab alerts — mobile top */}
            {labAlerts.values.length > 0 && (
              <div className="sm:hidden">
                <LabAlertCard
                  values={labAlerts.values}
                  reportDate={labAlerts.reportDate}
                  profileName={activeProfile.full_name}
                  isSelf={activeProfile.is_self}
                  documentId={labAlerts.documentId}
                />
              </div>
            )}

            {/* Featured record card */}
            {isEmpty ? (
              <EmptyPrescriptions
                profileId={activeProfile.id}
                profileName={activeProfile.full_name}
                isSelf={activeProfile.is_self}
              />
            ) : (
              <section aria-label="Most recent record">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest">
                    Most Recent Record
                  </span>
                </div>

                <Link
                  href={`/records/${featuredDoc!.id}`}
                  className="block rounded-2xl bg-white border border-border shadow-sm overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div className="flex min-h-[140px]">

                    {/* Content */}
                    <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col justify-between">
                      <div>
                        {/* Type + date badge row */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <span
                            className="font-body text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide"
                            style={isPrescription
                              ? { background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }
                              : { background: 'var(--color-teal-subtle)', color: 'var(--color-teal)' }
                            }
                          >
                            {isPrescription ? 'Prescription' : 'Lab Report'}
                          </span>
                          {featuredDocDate && (
                            <span className="font-body text-[11px] text-text-muted">{featuredDocDate}</span>
                          )}
                          {!isSelf && (
                            <span className="font-body text-[11px] text-text-muted">· {profileFirstName}</span>
                          )}
                        </div>

                        {/* Doctor / source */}
                        <h3 className="font-display text-[18px] sm:text-[20px] font-extrabold text-text-primary tracking-tight leading-tight">
                          {featuredDoc!.doctor_name ?? (isPrescription ? 'Prescription' : 'Lab Report')}
                        </h3>

                        {/* Tags */}
                        {featuredDoc!.tags && featuredDoc!.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {featuredDoc!.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="font-body text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'var(--color-teal-subtle)', color: 'var(--color-teal)' }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Medications footer */}
                      {isPrescription && activeMeds.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="font-body text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                            Current medications
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {activeMeds.slice(0, 4).map((med) => (
                              <span
                                key={med.name}
                                className="font-body text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
                              >
                                {med.name}{med.dosage ? ` ${med.dosage}` : ''}
                              </span>
                            ))}
                            {activeMeds.length > 4 && (
                              <span
                                className="font-body text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-primary)' }}
                              >
                                +{activeMeds.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Visual panel */}
                    <div
                      className="w-[100px] sm:w-[140px] shrink-0 flex flex-col items-center justify-center gap-3 relative overflow-hidden"
                      style={isPrescription
                        ? { background: 'linear-gradient(160deg, var(--color-primary-subtle) 0%, #c7d7fc 100%)' }
                        : { background: 'linear-gradient(160deg, var(--color-teal-subtle) 0%, #a7e3e0 100%)' }
                      }
                    >
                      {/* Big number / icon */}
                      {isPrescription && featuredDoc!.medication_count != null && featuredDoc!.medication_count > 0 ? (
                        <>
                          <div
                            className="font-display text-[44px] sm:text-[52px] font-extrabold leading-none"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {featuredDoc!.medication_count}
                          </div>
                          <div className="font-body text-[11px] font-bold text-center leading-tight" style={{ color: 'var(--color-primary)' }}>
                            medication{featuredDoc!.medication_count === 1 ? '' : 's'}
                          </div>
                        </>
                      ) : (
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={isPrescription
                            ? { background: 'var(--color-primary)', opacity: 0.15 }
                            : { background: 'var(--color-teal)', opacity: 0.15 }
                          }
                        >
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"
                            stroke={isPrescription ? 'var(--color-primary)' : 'var(--color-teal)'}
                            style={{ opacity: 1 / 0.15 }}
                          >
                            {isPrescription
                              ? <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>
                              : <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            }
                          </svg>
                        </div>
                      )}

                      {/* View link */}
                      <span
                        className="font-body text-[10px] font-bold"
                        style={{ color: isPrescription ? 'var(--color-primary)' : 'var(--color-teal)' }}
                      >
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              </section>
            )}

            {/* Remaining records */}
            {!isEmpty && remainingDocs.length > 0 && (
              <section aria-labelledby="records-heading">
                <div className="flex items-center justify-between mb-3">
                  <h2
                    id="records-heading"
                    className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest"
                  >
                    {isSelf ? 'Your' : `${profileFirstName}'s`} Records
                  </h2>
                  {documents.length > DASHBOARD_RX_LIMIT + 1 && (
                    <Link href="/timeline" className="text-xs font-semibold text-primary hover:underline">
                      View all →
                    </Link>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {remainingDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <RecordCard record={doc} />
                      </div>
                      <PrescriptionActions document={doc} profiles={profiles} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Upload CTA */}
            <Button fullWidth size="lg" href={`/dashboard/upload/${activeProfile.id}`} className="mt-1">
              + Upload for {isSelf ? 'yourself' : profileFirstName}
            </Button>
          </div>

          {/* ── Right column ── */}
          <div className="w-full sm:w-[300px] shrink-0 flex flex-col gap-3">

            {/* Health Profile snapshot */}
            <div className="rounded-2xl bg-white border border-border shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-3.5 pb-0">
                <span className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  Health Profile
                </span>
                <Link
                  href="/settings"
                  className="flex items-center gap-1 font-body text-[11px] font-bold transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </Link>
              </div>

              <div className="flex flex-col divide-y divide-border px-4 pb-1 mt-2">
                {[
                  { dot: 'var(--color-error)',   key: 'Blood group', val: null,                           muted: true  },
                  { dot: 'var(--color-primary)',  key: 'Age',         val: age ? `${age} years` : null,   muted: !age  },
                  { dot: 'var(--color-warning)',  key: 'Allergies',   val: null,                           muted: true  },
                  { dot: 'var(--color-violet)',   key: 'Conditions',  val: null,                           muted: true  },
                  { dot: 'var(--color-teal)',     key: 'Doctor',      val: recentDoctor,                   muted: !recentDoctor, small: true },
                ].map(({ dot, key, val, muted, small }) => (
                  <div key={key} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: muted && !val ? '#d1d5db' : dot }} />
                      <span className="font-body text-[12px] text-text-muted">{key}</span>
                    </div>
                    <span
                      className="font-display font-bold shrink-0"
                      style={{
                        fontSize: small ? '11px' : '13px',
                        color: val ? (key === 'Blood group' ? 'var(--color-error)' : 'var(--color-text-primary)') : 'var(--color-text-muted)',
                        fontWeight: val ? 700 : 500,
                      }}
                    >
                      {val ?? 'Not added'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab alerts — desktop sidebar */}
            {labAlerts.values.length > 0 && (
              <div className="hidden sm:block">
                <LabAlertCard
                  values={labAlerts.values}
                  reportDate={labAlerts.reportDate}
                  profileName={activeProfile.full_name}
                  isSelf={activeProfile.is_self}
                  documentId={labAlerts.documentId}
                />
              </div>
            )}

            {/* Health story CTA card */}
            <div
              className="rounded-2xl overflow-hidden border border-border"
              style={{ background: 'linear-gradient(155deg, var(--color-surface-subtle) 0%, var(--color-primary-subtle) 100%)' }}
            >
              <div className="px-4 pt-4 pb-5">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--color-primary)', boxShadow: '0 3px 10px rgba(29,78,216,.25)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                </div>

                <h3 className="font-display text-[14px] font-extrabold text-text-primary tracking-tight mb-1.5">
                  Tell us your health story
                </h3>
                <p className="font-body text-[12px] text-text-muted leading-relaxed mb-4">
                  Add your health history, lifestyle habits, and conditions so we can give you more personalised insights.
                </p>

                <Button
                  href="/settings"
                  size="sm"
                  fullWidth
                >
                  Complete health profile
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Error state ───────────────────────────────────────────────────────────────

function HubError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-error-subtle flex items-center justify-center">
        <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">Something went wrong</p>
        <p className="text-xs text-text-muted mt-1">{message}</p>
      </div>
      <Button variant="secondary" size="md" href="/dashboard">Try again</Button>
    </div>
  )
}
