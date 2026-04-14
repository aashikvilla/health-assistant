import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recordsService } from "@/services/records.service";
import { familyService } from "@/services/family.service";
import { TimelineView } from "@/components/features/records/TimelineView";
import { Button } from "@/components/ui";

export const metadata: Metadata = { title: "Timeline — Vitae" };

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

  return (
    <div className="py-5 flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Timeline
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {documents.length > 0
              ? `${documents.length} record${documents.length === 1 ? "" : "s"} across your family`
              : "All your family\u2019s health records in one place"}
          </p>
        </div>
      </div>

      {/* ── Empty — no records at all ───────────────────────── */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-subtle flex items-center justify-center">
            <svg
              className="w-7 h-7 text-text-muted"
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
            <p className="text-base font-semibold text-text-primary">
              No records yet
            </p>
            <p className="text-sm text-text-muted mt-1 leading-relaxed max-w-xs">
              Upload a prescription or lab report from the dashboard to see your
              family&apos;s health history here.
            </p>
          </div>
          <Button href="/dashboard" size="md" variant="secondary">
            Go to Dashboard
          </Button>
        </div>
      ) : (
        <TimelineView documents={documents} profiles={profiles} />
      )}
    </div>
  );
}
