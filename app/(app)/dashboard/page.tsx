import { redirect }                    from 'next/navigation'
import { createClient }               from '@/lib/supabase/server'
import { familyService }              from '@/services/family.service'
import { ProfileSectionWithEdit }      from '@/components/features/family/ProfileSectionWithEdit'
import { PrescriptionListItem }       from '@/components/features/family/PrescriptionListItem'
import { PrescriptionActions }        from '@/components/features/family/PrescriptionActions'
import { EmptyPrescriptions }         from '@/components/features/family/EmptyPrescriptions'
import { PendingUploadBanner }        from '@/components/features/upload/PendingUploadBanner'
import { ActiveMedicationsStrip }     from '@/components/features/hub/ActiveMedicationsStrip'
import { LabAlertCard }               from '@/components/features/hub/LabAlertCard'
import { Button }    from '@/components/ui'
import { APP_NAME } from '@/constants'
import { signOut }  from '@/app/actions'
import Link         from 'next/link'
import type { Medication } from '@/types/prescription'

// searchParams is async in Next.js 16
interface HubPageProps {
  searchParams: Promise<{ profile?: string }>
}

// ── Hub content types ──────────────────────────────────────────────────────────

interface OutOfRangeValue {
  name:   string
  result: string
  status: string
}

// ── Data fetching ──────────────────────────────────────────────────────────────

async function fetchActiveMedications(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string
): Promise<Medication[]> {
  const { data } = await supabase
    .from('medications')
    .select('name, dosage, frequency')
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (!data) return []

  return data.map((m) => ({
    name: m.name,
    dosage: m.dosage ?? '',
    duration: m.frequency ?? '',
    confidence: 'high' as const,
  }))
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

  const profiles = profilesResult.data

  const activeProfile =
    profiles.find((p) => p.id === profileIdParam) ?? profiles[0]

  if (!activeProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center py-12">
        <div className="space-y-2">
          <p className="text-lg font-semibold text-text-primary">Welcome! Let&apos;s get started</p>
          <p className="text-sm text-text-muted">Add your first profile to upload and track prescriptions.</p>
        </div>
        <Button href="/dashboard/add-member" size="lg">Add a Profile</Button>
      </div>
    )
  }

  // Parallel fetch: prescriptions + medications + lab alerts
  const [prescriptionsResult, activeMeds, labAlerts] = await Promise.all([
    familyService.getProfilePrescriptions(activeProfile.id),
    fetchActiveMedications(supabase, activeProfile.id),
    fetchLabAlerts(supabase, activeProfile.id),
  ])

  const prescriptions = prescriptionsResult.success ? (prescriptionsResult.data ?? []) : []
  const DASHBOARD_RX_LIMIT = 3
  const displayedPrescriptions = prescriptions.slice(0, DASHBOARD_RX_LIMIT)
  const selfProfile   = profiles.find((p) => p.is_self)
  const rawName       = selfProfile?.full_name ?? user.email?.split('@')[0] ?? 'there'
  const displayName   = rawName.split(' ')[0]
  const isEmpty       = prescriptions.length === 0

  const avatarLetter = displayName[0]?.toUpperCase() ?? 'U'

  return (
    <>
      <PendingUploadBanner />

      {/* ── Gradient Hero  full bleed, owns its own nav ────────── */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 gradient-hero">
        <div className="relative overflow-hidden">
          {/* Decorative radial overlays */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 80% 15%, rgba(168,85,247,.45) 0%, transparent 55%), radial-gradient(circle at 5% 85%, rgba(29,78,216,.35) 0%, transparent 50%)',
            }}
          />


          {/* ── Top nav bar ── */}
          <div className="relative flex items-center justify-between px-5 pt-safe h-14">
            <span
              className="font-display text-xl font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(90deg,#fff 0%,rgba(255,255,255,.75) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {APP_NAME}
            </span>
            {/* Sign-out  hidden on desktop where AppDrawerNav's hamburger takes over */}
            <form action={signOut} className="sm:hidden">
              <button
                type="submit"
                aria-label="Sign out"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </form>
          </div>

          {/* ── Greeting + avatar ── */}
          <div className="relative flex items-end justify-between px-5 pt-6 pb-0">
            <div>
              <p className="font-body text-[13px] font-medium mb-1" style={{ color: 'rgba(255,255,255,.65)' }}>Good day,</p>
              <h1 className="font-display text-[30px] font-extrabold text-white tracking-tight leading-none">
                {displayName}
              </h1>
            </div>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-display text-xl font-extrabold text-white shrink-0 mb-1 gradient-brand"
              style={{
                border: '2.5px solid rgba(255,255,255,.35)',
                boxShadow: '0 4px 20px rgba(0,0,0,.3)',
              }}
            >
              {avatarLetter}
            </div>
          </div>

          {/* ── Stat pills ── */}
          {/* pb-10 gives 40px of gradient below the pills before the white sheet overlaps */}
          <div className="relative flex gap-3 px-5 pt-5 pb-10">
            {[
              { num: activeMeds.length,        label: 'Active Meds' },
              { num: labAlerts.values.length,  label: 'Alerts' },
              { num: prescriptions.length,     label: 'Records' },
            ].map(({ num, label }) => (
              <div
                key={label}
                className="flex-1 rounded-xl px-3 py-3"
                style={{
                  background: 'rgba(255,255,255,.13)',
                  border: '1px solid rgba(255,255,255,.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="font-display text-[26px] font-extrabold text-white leading-none mb-0.5">{num}</div>
                <div className="font-body text-[11px] font-medium leading-tight" style={{ color: 'rgba(255,255,255,.65)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── White content sheet  overlaps gradient, full-bleed, px-5 matches hero ── */}
      {/* -mt-6 pulls the sheet up over the gradient's pb-10, creating a smooth overlap */}
      <div
        className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 relative z-10 bg-surface rounded-[28px_28px_0_0]"
        style={{
          boxShadow: '0 -4px 24px rgba(29,78,216,.12)',
        }}
      >
        <div className="px-5 pt-5 pb-6 flex flex-col gap-5">

          {/* ── Family profiles ────────────────────────────────────── */}
          <div className="rounded-2xl bg-white px-4 pt-4 pb-3 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest">Family</span>
            </div>
            <ProfileSectionWithEdit
              profiles={profiles}
              activeProfile={activeProfile}
              baseHref="/dashboard"
            />
          </div>

          {/* ── Lab Alerts ─────────────────────────────────────────── */}
          <LabAlertCard
            values={labAlerts.values}
            reportDate={labAlerts.reportDate}
            profileName={activeProfile.full_name}
            isSelf={activeProfile.is_self}
            documentId={labAlerts.documentId}
          />

          {/* ── Active Medications ─────────────────────────────────── */}
          <ActiveMedicationsStrip
            medications={activeMeds}
            profileName={activeProfile.full_name}
            isSelf={activeProfile.is_self}
          />

          {/* ── Recent Documents ───────────────────────────────────── */}
          <section aria-labelledby="prescriptions-heading">
            <div className="flex items-center justify-between mb-3">
              <h2
                id="prescriptions-heading"
                className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest"
              >
                {activeProfile.is_self ? 'Your' : `${activeProfile.full_name.split(' ')[0]}'s`} Records
              </h2>
              {!isEmpty && prescriptions.length > DASHBOARD_RX_LIMIT && (
                <Link href="/timeline" className="text-xs font-semibold text-primary hover:underline">
                  View all
                </Link>
              )}
            </div>

            {isEmpty ? (
              <EmptyPrescriptions
                profileId={activeProfile.id}
                profileName={activeProfile.full_name}
                isSelf={activeProfile.is_self}
              />
            ) : (
              <div className="flex flex-col gap-2">
                {displayedPrescriptions.map((rx) => (
                  <div key={rx.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <PrescriptionListItem prescription={rx} />
                    </div>
                    <PrescriptionActions prescription={rx} profiles={profiles} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Upload CTA ─────────────────────────────────────────── */}
          {!isEmpty && (
            <Button
              fullWidth
              size="lg"
              href={`/dashboard/upload/${activeProfile.id}`}
            >
              + Upload for {activeProfile.is_self ? 'yourself' : activeProfile.full_name.split(' ')[0]}
            </Button>
          )}

        </div>
      </div>
    </>
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
