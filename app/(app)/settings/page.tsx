import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";
import { familyService } from "@/services/family.service";

export const metadata: Metadata = { title: "Settings | Vitae" };

/**
 * Settings / Profile page  Stage 8 (User profile team)
 *
 * Will show: account info, notification preferences, medication reminders,
 * data export, account deletion.
 *
 * STATUS: Minimal  shows auth info and a sign-out option.
 * This exists so BottomNav's "Profile" tab doesn't 404.
 */
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayEmail = user?.email ?? ''
  const emailPrefix  = displayEmail.split('@')[0]

  let displayName = emailPrefix
  if (user) {
    const profilesResult = await familyService.getProfiles(user.id)
    const self = profilesResult.data?.find((p) => p.is_self)
    if (self?.full_name?.trim()) displayName = self.full_name.trim()
  }

  const avatarLetter = displayName[0]?.toUpperCase() ?? 'U'

  return (
    <>
      {/* ── Gradient Hero ───────────────────────────────────────── */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 gradient-hero">
        <div className="pb-10 flex flex-col items-center text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 60%, rgba(168,85,247,.45) 0%, transparent 60%)' }}
          />
          {/* Nav bar */}
          <div className="relative w-full flex items-center justify-between px-5 pt-safe h-14">
            <span
              className="font-display text-xl font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(90deg,#fff 0%,rgba(255,255,255,.75) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Vitae
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
          <div
            className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-display text-[26px] font-extrabold text-white relative mb-3 gradient-brand-full"
            style={{
              border: '3px solid rgba(255,255,255,.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,.3)',
            }}
          >
            {avatarLetter}
          </div>
          <h1 className="font-display text-[20px] font-extrabold text-white tracking-tight relative mb-1">
            {displayName}
          </h1>
          <p className="font-body text-sm text-white/60 relative">{displayEmail}</p>
        </div>
      </div>

      {/* ── Settings body  floats up from hero ─────────────────── */}
      <div className="-mt-6 rounded-t-[28px] relative z-10 -mx-4 sm:-mx-6 lg:-mx-8 bg-surface px-4 sm:px-6 lg:px-8 pb-8">
        <div className="pt-6 max-w-md mx-auto flex flex-col gap-5">

          {/* Account group */}
          <div>
            <p className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Account</p>
            <div className="rounded-2xl bg-white overflow-hidden border border-border shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-primary-subtle">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="text-primary">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-[13px] font-semibold text-text-primary">Profile</p>
                  <p className="font-body text-[11px] text-text-muted mt-0.5 truncate">{displayEmail}</p>
                </div>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-red-50"
                >
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-error-subtle">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" className="text-error">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </div>
                  <span className="font-display text-[13px] font-semibold text-error">Sign out</span>
                </button>
              </form>
            </div>
          </div>

          {/* Preferences group */}
          <div>
            <p className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Preferences</p>
            <div className="rounded-2xl bg-white overflow-hidden border border-border shadow-sm">
              {[
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="text-success"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
                  iconBg: 'bg-success-subtle',
                  label: 'Notifications',
                  sub: 'Medication reminders, reports',
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="text-teal"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
                  iconBg: 'bg-teal-subtle',
                  label: 'Export Data',
                  sub: 'Download all your records',
                },
              ].map(({ icon, iconBg, label, sub }, i, arr) => (
                <div
                  key={label}
                  className={`flex items-center gap-3 px-4 py-3.5${i < arr.length - 1 ? ' border-b border-border' : ''}`}
                >
                  <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-[13px] font-semibold text-text-primary">{label}</p>
                    <p className="font-body text-[11px] text-text-muted mt-0.5">{sub}</p>
                  </div>
                  <span className="font-body text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 bg-accent-subtle text-accent-hover">
                    Soon
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legal group */}
          <div>
            <p className="font-display text-[11px] font-bold text-text-muted uppercase tracking-widest mb-3">Legal</p>
            <div className="rounded-2xl bg-white overflow-hidden border border-border shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 bg-surface-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="text-text-muted">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-display text-[13px] font-semibold text-text-primary">Privacy Policy</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" className="text-text-muted">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
