-- Migration: membership-based SELECT RLS for family sharing
--
-- Problem: all data tables used `FOR ALL USING (auth.uid() = user_id)`, which
-- means only the document owner can read their own records. Family members who
-- share a group cannot see each other's documents.
--
-- Fix: split each policy into a SELECT policy (membership-gated) and a separate
-- write policy (owner-only). Read access flows through profile_memberships so
-- any user in the same family group can view, but only the owner can mutate.
--
-- Tables changed: documents, document_analyses, medications, lab_values
-- (timeline_events is intentionally excluded  writes removed in app code,
--  table kept for future use; no reads need to change)

-- ── documents ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can manage own documents" ON documents;

CREATE POLICY "Members can view documents in their family groups" ON documents
  FOR SELECT USING (
    profile_id IN (
      SELECT profile_id FROM profile_memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- ── document_analyses ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own analyses" ON document_analyses;

CREATE POLICY "Members can view analyses for shared documents" ON document_analyses
  FOR SELECT USING (
    document_id IN (
      SELECT d.id FROM documents d
      WHERE d.profile_id IN (
        SELECT profile_id FROM profile_memberships WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Owners can insert analyses" ON document_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update analyses" ON document_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete analyses" ON document_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- ── medications ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can manage own medications" ON medications;

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

-- ── lab_values ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can manage own lab values" ON lab_values;

CREATE POLICY "Members can view lab values in their family groups" ON lab_values
  FOR SELECT USING (
    profile_id IN (
      SELECT profile_id FROM profile_memberships WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert lab values" ON lab_values
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update lab values" ON lab_values
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete lab values" ON lab_values
  FOR DELETE USING (auth.uid() = user_id);
