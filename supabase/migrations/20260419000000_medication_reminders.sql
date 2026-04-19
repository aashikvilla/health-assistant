-- Migration: Medication Reminders Feature
-- Adds reminder columns to medications table and updates RLS policies for family sharing

-- ── Add reminder columns to medications table (if not exists) ────────────────

-- Add reminder_enabled column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'medications' 
    AND column_name = 'reminder_enabled'
  ) THEN
    ALTER TABLE medications ADD COLUMN reminder_enabled boolean DEFAULT false;
  END IF;
END $$;

-- Add timing column (text array for reminder times like ['08:00', '21:00'])
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'medications' 
    AND column_name = 'timing'
  ) THEN
    ALTER TABLE medications ADD COLUMN timing text[];
  END IF;
END $$;

-- Add reminder_times column (time array)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'medications' 
    AND column_name = 'reminder_times'
  ) THEN
    ALTER TABLE medications ADD COLUMN reminder_times time[];
  END IF;
END $$;

-- ── Update RLS policies for family-membership access ─────────────────────────

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage own medications" ON medications;
DROP POLICY IF EXISTS "Members can view medications in their family groups" ON medications;
DROP POLICY IF EXISTS "Owners can insert medications" ON medications;
DROP POLICY IF EXISTS "Owners can update medications" ON medications;
DROP POLICY IF EXISTS "Owners can delete medications" ON medications;

-- Create new family-membership policies
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
