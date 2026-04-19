import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recordsService } from "@/services/records.service";
import { familyService } from "@/services/family.service";
import { TimelineView } from "@/components/features/records/TimelineView";
import { Button } from "@/components/ui";
import { signOut } from "@/app/actions";

export const metadata: Metadata = { title: "Timeline | Vitae" };

export default async function TimelinePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const [docsResult, profilesResult] = await Promise.all([
    recordsService.getAllDocumentsForUser(user.id),
    familyService.getProfiles(user.id),
  ]);

  const documents = docsResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  const count = documents.length

  return (
    <>
      {/* ── Gradient Hero  full bleed ─────────────────────────── */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 gradient-hero">
        <div className="px-5 pt-6 pb-8 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 70% 30%, rgba(168,85,247,.4) 0%, transparent 55%)' }}
          />
          {/* Nav bar */}
          <div className="relative flex items-center justify-between pt-safe h-14">
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
          <p className="font-body text-[11px] font-semibold text-white/60 uppercase tracking-widest relative mb-1 pt-2">
            Health Records
          </p>
          <h1 className="font-display text-[28px] font-extrabold text-white tracking-tight leading-none relative mb-4">
            Timeline
          </h1>
          <p className="font-body text-sm text-white/70 relative">
            {count > 0
              ? `${count} record${count === 1 ? '' : 's'} across your family`
              : "All your family's health records in one place"}
          </p>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="pt-5 pb-4">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center bg-accent-subtle border border-border">
              <svg className="w-7 h-7 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="font-display text-base font-semibold text-text-primary">No records yet</p>
              <p className="font-body text-sm text-text-muted mt-1 leading-relaxed max-w-xs">
                Upload a prescription or lab report from the dashboard to see your family&apos;s health history here.
              </p>
            </div>
            <Button href="/dashboard" size="md" variant="secondary">Go to Dashboard</Button>
          </div>
        ) : (
          <TimelineView documents={documents} profiles={profiles} />
        )}
      </div>
    </>
  );
}
