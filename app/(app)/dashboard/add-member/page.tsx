import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { familyService } from "@/services/family.service";
import { AddMemberForm } from "@/components/features/family/AddMemberForm";
import { FAMILY_LIMITS } from "@/constants";
import Link from "next/link";

export const metadata = {
  title: "Add Family Member — Vitae",
};

const MAX_PROFILES = FAMILY_LIMITS.maxProfiles;

export default async function AddMemberPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  // Check profile count before rendering form
  const profilesResult = await familyService.getProfiles(user.id);
  const profileCount = profilesResult.data?.length ?? 0;

  const atLimit = profileCount >= MAX_PROFILES;

  const slotPct = Math.round((profileCount / MAX_PROFILES) * 100)

  return (
    <>
      {/* ── Gradient Hero ───────────────────────────────────────── */}
      <div
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        style={{ background: 'linear-gradient(135deg, #0f0f2d 0%, #1d4ed8 45%, #7c3aed 80%, #c026d3 100%)' }}
      >
        <div className="px-4 pb-10 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 60% 40%, rgba(219,39,119,.4) 0%, transparent 55%)' }}
          />
          {/* Back nav */}
          <div className="relative flex items-center gap-2 pt-safe h-14">
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.25)' }}
              aria-label="Back to dashboard"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </Link>
            <span className="font-display text-[15px] font-bold text-white/90">Add Family Member</span>
          </div>
          <h1 className="font-display text-[22px] font-extrabold text-white tracking-tight leading-tight relative mb-1 pt-2">
            Who&apos;s this<br />profile for?
          </h1>
          <p className="font-body text-sm text-white/65 relative">
            You manage their records — they don&apos;t need to sign up.
          </p>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div
        className="-mt-6 rounded-t-[28px] -mx-4 sm:-mx-6 lg:-mx-8 bg-[#f7f9ff] px-4 sm:px-6 lg:px-8 pb-10 relative z-10"
      >
        <div className="pt-6 max-w-md mx-auto">

          {atLimit ? (
            /* ── Limit reached ─────────────────────────────── */
            <div className="flex flex-col items-center text-center gap-5 py-10">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(217,119,6,.1)', border: '1px solid rgba(217,119,6,.2)' }}
              >
                <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-display text-base font-bold text-text-primary">5-profile limit reached</p>
                <p className="font-body text-sm text-text-muted mt-1 leading-relaxed">
                  The free plan supports up to 5 family profiles. Upgrade to Pro for unlimited profiles.
                </p>
              </div>
              <div className="w-full flex flex-col gap-3">
                <button disabled className="w-full h-12 rounded-xl bg-surface-muted text-text-muted text-sm font-medium border border-border cursor-not-allowed">
                  Unlimited Profiles — Pro <span className="ml-1.5 text-[10px] font-bold bg-border text-text-secondary px-1.5 py-0.5 rounded">SOON</span>
                </button>
                <Link href="/dashboard" className="w-full h-12 rounded-xl border text-sm font-semibold text-text-primary text-center flex items-center justify-center hover:bg-surface-subtle transition-colors" style={{ borderColor: 'rgba(124,58,237,.2)' }}>
                  Back to Hub
                </Link>
              </div>
            </div>
          ) : (
            /* ── Add member form ───────────────────────────── */
            <div className="flex flex-col gap-5">

              {/* Slot progress */}
              <div
                className="rounded-2xl bg-white px-4 py-3.5"
                style={{ border: '1px solid rgba(124,58,237,.12)', boxShadow: '0 2px 12px rgba(29,78,216,.07)' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-sm font-medium text-text-primary">Profile slots</span>
                  <span className="font-display text-sm font-bold text-primary">{profileCount} / {MAX_PROFILES} used</span>
                </div>
                <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${slotPct}%`, background: 'linear-gradient(90deg, #1d4ed8, #7c3aed)' }}
                  />
                </div>
              </div>

              {/* Photo placeholder */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-[88px] h-[88px] rounded-full p-[3px]"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed, #c026d3)', boxShadow: '0 4px 24px rgba(124,58,237,.25)' }}
                >
                  <div
                    className="w-full h-full rounded-full flex flex-col items-center justify-center gap-0.5 cursor-pointer"
                    style={{ background: '#f1f4fb', border: '2px solid white' }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="font-body text-[9px] font-600 text-text-muted">Add photo</span>
                  </div>
                </div>
                <span className="font-body text-xs text-text-muted">Optional</span>
              </div>

              {/* Actual form */}
              <AddMemberForm />

            </div>
          )}
        </div>
      </div>
    </>
  );
}
