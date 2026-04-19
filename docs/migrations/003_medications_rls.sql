-- Migration 003: Family-membership RLS for medications table
--
-- Problem: medications table uses user_id = auth.uid() for all policies,
-- which prevents family members from seeing each other's medication records.
--
-- Fix: Replace the single FOR ALL policy with split SELECT (membership-gated)
-- and write (owner-only) policies, matching the pattern in 001_family_sharing_rls.sql.
--
-- Safe to run if 001 has already been applied — DROP IF EXISTS is idempotent.

-- ── medications ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can manage own medications" ON medications;
DROP POLICY IF EXISTS "Members can view medications in their family groups" ON medications;
DROP POLICY IF EXISTS "Owners can insert medications" ON medications;
DROP POLICY IF EXISTS "Owners can update medications" ON medications;
DROP POLICY IF EXISTS "Owners can delete medications" ON medications;

CREATE POLICY "Members can view medications in their family groups" ON medications
  FOR SELECT USING (
    profile_id IN (
      SELECT profile_id FROM profile_memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert medications" ON medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update medications" ON medications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete medications" ON medications
  FOR DELETE USING (auth.uid() = user_id);
