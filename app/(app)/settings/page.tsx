import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

export const metadata: Metadata = { title: "Settings — Vitae" };

/**
 * Settings / Profile page — Stage 8 (User profile team)
 *
 * Will show: account info, notification preferences, medication reminders,
 * data export, account deletion.
 *
 * STATUS: Minimal — shows auth info and a sign-out option.
 * This exists so BottomNav's "Profile" tab doesn't 404.
 */
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-md mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-muted mt-1">Account and preferences</p>
      </div>

      {/* Account card */}
      <div className="bg-surface-container-lowest rounded-2xl divide-y divide-border-subtle">
        {user && (
          <div className="px-4 py-3 space-y-1">
            <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
              Account
            </p>
            <p className="text-sm font-medium text-text-primary">
              {user.email}
            </p>
            <p className="text-xs text-text-muted font-mono">{user.id}</p>
          </div>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full text-left px-4 py-3 text-sm font-medium text-error hover:bg-error-subtle transition-colors rounded-b-2xl"
          >
            Sign out
          </button>
        </form>
      </div>

      {/* Coming soon */}
      <div className="rounded-2xl border border-dashed border-border px-4 py-5 space-y-2 text-center">
        <p className="text-sm font-semibold text-text-primary">
          More settings coming soon
        </p>
        <p className="text-xs text-text-muted leading-relaxed">
          Notification preferences, medication reminders, data export, and
          account management.
        </p>
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-warning-subtle text-warning">
          Coming soon
        </span>
      </div>
    </div>
  );
}
