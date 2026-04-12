import { redirect }                    from 'next/navigation'
import { createClient }               from '@/lib/supabase/server'
import { familyService }              from '@/services/family.service'
import { ProfileWheel }               from '@/components/features/family/ProfileWheel'
import { PrescriptionListItem }       from '@/components/features/family/PrescriptionListItem'
import { EmptyPrescriptions }         from '@/components/features/family/EmptyPrescriptions'
import { PendingUploadBanner }        from '@/components/features/upload/PendingUploadBanner'
import { ActiveMedicationsStrip }     from '@/components/features/hub/ActiveMedicationsStrip'
import { LabAlertCard }               from '@/components/features/hub/LabAlertCard'
import { AppHeader }                  from '@/components/layout/AppHeader'
import { LogoutButton }               from '@/components/layout/LogoutButton'
import { Button }                     from '@/components/ui'
import Link                           from 'next/link'
import type { Medication }            from '@/types/prescription'

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
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const since = thirtyDaysAgo.toISOString().split('T')[0]

  const { data } = await supabase
    .from('documents')
    .select('document_analyses ( medications_found )')
    .eq('profile_id', profileId)
    .eq('document_type', 'prescription')
    .gte('document_date', since)
    .order('document_date', { ascending: false })
    .limit(3)

  if (!data) return []

  // Flatten medications from all recent prescriptions, deduplicate by name
  const seen = new Set<string>()
  const meds: Medication[] = []

  for (const doc of data) {
    const analyses = (doc as unknown as { document_analyses: { medications_found: Medication[] | null }[] }).document_analyses
    for (const analysis of analyses ?? []) {
      for (const med of analysis.medications_found ?? []) {
        const key = med.name.toLowerCase()
        if (!seen.has(key)) {
          seen.add(key)
          meds.push(med)
        }
      }
    }
  }

  return meds
}

async function fetchLabAlerts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profileId: string
): Promise<{ values: OutOfRangeValue[]; reportDate: string | null }> {
  const { data } = await supabase
    .from('documents')
    .select('document_date, document_analyses ( values_out_of_range )')
    .eq('profile_id', profileId)
    .eq('document_type', 'lab_report')
    .not('document_date', 'is', null)
    .order('document_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return { values: [], reportDate: null }

  const doc = data as unknown as {
    document_date: string | null
    document_analyses: { values_out_of_range: OutOfRangeValue[] | null }[]
  }

  const values = doc.document_analyses?.[0]?.values_out_of_range ?? []
  return { values, reportDate: doc.document_date }
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
      <>
        <AppHeader variant="brand" rightSlot={<LogoutButton />} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 gap-6 text-center">
          <div className="space-y-2">
            <p className="text-lg font-semibold text-text-primary">Welcome! Let&apos;s get started</p>
            <p className="text-sm text-text-muted">Add your first profile to upload and track prescriptions.</p>
          </div>
          <Button href="/dashboard/add-member" size="lg">Add a Profile</Button>
        </div>
      </>
    )
  }

  // Parallel fetch: prescriptions + medications + lab alerts
  const [prescriptionsResult, activeMeds, labAlerts] = await Promise.all([
    familyService.getProfilePrescriptions(activeProfile.id),
    fetchActiveMedications(supabase, activeProfile.id),
    fetchLabAlerts(supabase, activeProfile.id),
  ])

  const prescriptions = prescriptionsResult.success ? (prescriptionsResult.data ?? []) : []
  const displayName   = user.email?.split('@')[0] ?? 'there'
  const isEmpty       = prescriptions.length === 0

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader
        variant="brand"
        rightSlot={
          <>
            <button
              type="button"
              className="touch-target flex items-center justify-center rounded-xl text-text-muted hover:bg-surface-subtle transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <LogoutButton />
          </>
        }
      />

      <PendingUploadBanner />

      <div className="px-4 py-5 flex flex-col gap-6">

        {/* ── Welcome ────────────────────────────────────────────── */}
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Hi {displayName} 👋
          </h1>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">
            Your family&apos;s health records, all in one place
          </p>
        </div>

        {/* ── Profile Wheel ──────────────────────────────────────── */}
        <section aria-labelledby="profiles-heading">
          <h2 id="profiles-heading" className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
            Family Profiles
          </h2>
          <ProfileWheel
            profiles={profiles}
            activeProfileId={activeProfile.id}
            baseHref="/dashboard"
          />
        </section>

        {/* ── Active Medications ─────────────────────────────────── */}
        <ActiveMedicationsStrip
          medications={activeMeds}
          profileName={activeProfile.full_name}
          isSelf={activeProfile.is_self}
        />

        {/* ── Lab Alerts ─────────────────────────────────────────── */}
        <LabAlertCard
          values={labAlerts.values}
          reportDate={labAlerts.reportDate}
          profileName={activeProfile.full_name}
          isSelf={activeProfile.is_self}
        />

        {/* ── Prescriptions ──────────────────────────────────────── */}
        <section aria-labelledby="prescriptions-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="prescriptions-heading" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {activeProfile.is_self ? 'Your' : `${activeProfile.full_name.split(' ')[0]}'s`} Prescriptions
            </h2>
            {!isEmpty && (
              <Link
                href="/timeline"
                className="text-xs text-primary font-medium hover:underline"
              >
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
              {prescriptions.map((rx) => (
                <PrescriptionListItem key={rx.id} prescription={rx} />
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
