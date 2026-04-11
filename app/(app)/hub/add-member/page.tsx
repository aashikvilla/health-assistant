import { redirect }       from 'next/navigation'
import { createClient }   from '@/lib/supabase/server'
import { familyService }  from '@/services/family.service'
import { AddMemberForm }  from '@/components/features/family/AddMemberForm'
import { AppHeader }      from '@/components/layout/AppHeader'
import { FAMILY_LIMITS }  from '@/constants'
import Link               from 'next/link'

export const metadata = {
  title: 'Add Family Member — Nuskha',
}

const MAX_PROFILES = FAMILY_LIMITS.maxProfiles

export default async function AddMemberPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  // Check profile count before rendering form
  const profilesResult = await familyService.getProfiles(user.id)
  const profileCount = profilesResult.data?.length ?? 0

  const atLimit = profileCount >= MAX_PROFILES

  return (
    <div className="flex flex-col min-h-full">
      <AppHeader variant="page" title="Add Family Member" backHref="/hub" />

      <div className="px-4 py-6 flex flex-col gap-6 max-w-md mx-auto w-full">

        {atLimit ? (
          /* ── Profile limit reached ─────────────────────────── */
          <div className="flex flex-col items-center text-center gap-5 py-10">
            <div className="w-14 h-14 rounded-2xl bg-warning-subtle flex items-center justify-center">
              <svg className="w-7 h-7 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">5-profile limit reached</p>
              <p className="text-sm text-text-muted mt-1 leading-relaxed">
                The free plan supports up to 5 family profiles. Upgrade to Pro for unlimited profiles.
              </p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <button
                disabled
                className="w-full py-3 rounded-xl bg-surface-muted text-text-muted text-sm font-medium border border-border cursor-not-allowed"
              >
                Unlimited Profiles — Pro
                <span className="ml-2 text-xs font-bold bg-border text-text-secondary px-1.5 py-0.5 rounded">
                  SOON
                </span>
              </button>
              <Link
                href="/hub"
                className="w-full py-3 rounded-xl border border-border text-sm font-medium text-text-primary text-center hover:bg-surface-subtle transition-colors"
              >
                Back to Hub
              </Link>
            </div>
          </div>
        ) : (
          /* ── Add member form ───────────────────────────────── */
          <>
            <div>
              <p className="text-sm text-text-secondary leading-relaxed">
                You manage their prescriptions — they don&apos;t need to sign up.
              </p>
              <p className="text-xs text-text-muted mt-1">
                {profileCount} of {MAX_PROFILES} profiles used
              </p>
            </div>

            {/* Optional photo area — placeholder for Stage 6/media team */}
            <div className="flex items-center gap-4 p-4 border-2 border-dashed border-border rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-surface-subtle border-2 border-dashed border-border flex items-center justify-center text-text-muted shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">Add a photo</p>
                <p className="text-xs text-text-muted">Optional — helps identify profiles quickly</p>
              </div>
            </div>

            <AddMemberForm />
          </>
        )}
      </div>
    </div>
  )
}
