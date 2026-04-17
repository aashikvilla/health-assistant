-- ============================================================
-- MEDASSIST AI  Complete Database Migration
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- 1. USERS PROFILE
-- ──────────────────────────────────────────────────────────────
CREATE TABLE users_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  timezone text DEFAULT 'Asia/Kolkata',
  notification_preferences jsonb DEFAULT '{"email": false, "push": true, "whatsapp": false}',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON users_profile
  FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 2. FAMILY PROFILES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE family_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  relationship text NOT NULL CHECK (relationship IN ('self', 'spouse', 'child', 'parent', 'sibling', 'other')),
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  blood_group text CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')),
  height_cm numeric,
  weight_kg numeric,
  known_conditions text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  emergency_contact_name text,
  emergency_contact_phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE family_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own family profiles" ON family_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Index covers the common "get active profiles for user" query
CREATE INDEX idx_family_profiles_user_active ON family_profiles(user_id, is_active);

-- Trigger: Max 8 active profiles per user
CREATE OR REPLACE FUNCTION check_family_profile_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM family_profiles WHERE user_id = NEW.user_id AND is_active = true) >= 8 THEN
    RAISE EXCEPTION 'Maximum 8 family profiles allowed per user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_family_profile_limit
  BEFORE INSERT ON family_profiles
  FOR EACH ROW EXECUTE FUNCTION check_family_profile_limit();

-- ──────────────────────────────────────────────────────────────
-- 3. DOCUMENTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES family_profiles(id) ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('prescription', 'lab_report', 'discharge', 'imaging', 'insurance', 'other')),
  title text,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size_bytes integer,
  ocr_text text,
  ocr_confidence numeric,
  ocr_engine text,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'ocr_processing', 'ocr_complete', 'analyzing', 'complete', 'failed')),
  document_date date,
  doctor_name text,
  hospital_name text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_documents_user_profile ON documents(user_id, profile_id, created_at DESC);
CREATE INDEX idx_documents_status ON documents(processing_status) WHERE processing_status != 'complete';

-- ──────────────────────────────────────────────────────────────
-- 4. DOCUMENT ANALYSES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE document_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  summary text NOT NULL,
  document_type_detected text,
  key_findings jsonb DEFAULT '[]',
  medications_found jsonb DEFAULT '[]',
  values_out_of_range jsonb DEFAULT '[]',
  risk_flags jsonb DEFAULT '[]',
  recommendations jsonb DEFAULT '[]',
  terms_explained jsonb DEFAULT '[]',
  follow_up_date date,
  raw_llm_response text,
  llm_model_used text,
  llm_tokens_used integer,
  analysis_version integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE document_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analyses" ON document_analyses
  FOR ALL USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 5. MEDICATIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES family_profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  dosage text,
  frequency text,
  timing text[] DEFAULT '{}',
  start_date date,
  end_date date,
  prescribing_doctor text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued', 'paused')),
  reminder_enabled boolean DEFAULT false,
  reminder_times time[] DEFAULT '{}',
  notes text,
  source_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own medications" ON medications
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_medications_active ON medications(profile_id, status) WHERE status = 'active';

-- ──────────────────────────────────────────────────────────────
-- 6. MEDICATION LOGS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE medication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid REFERENCES medications(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scheduled_time timestamptz NOT NULL,
  action text NOT NULL CHECK (action IN ('taken', 'missed', 'snoozed', 'skipped')),
  action_time timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own medication logs" ON medication_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_medication_logs_med ON medication_logs(medication_id, scheduled_time DESC);

-- ──────────────────────────────────────────────────────────────
-- 7. TIMELINE EVENTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES family_profiles(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('document', 'lab_report', 'doctor_visit', 'medication_start', 'medication_stop', 'vaccination', 'surgery', 'symptom')),
  event_date date NOT NULL,
  title text NOT NULL,
  description text,
  severity text CHECK (severity IN ('normal', 'attention', 'critical')),
  source_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  source_medication_id uuid REFERENCES medications(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own timeline" ON timeline_events
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_timeline_profile_date ON timeline_events(profile_id, event_date DESC);

-- ──────────────────────────────────────────────────────────────
-- 8. LAB VALUES (for trend tracking)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE lab_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES family_profiles(id) ON DELETE CASCADE NOT NULL,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  test_name text NOT NULL,
  test_category text,
  value numeric NOT NULL,
  unit text NOT NULL,
  reference_range_low numeric,
  reference_range_high numeric,
  status text CHECK (status IN ('normal', 'low', 'high', 'critical')),
  test_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, test_name)
);

ALTER TABLE lab_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own lab values" ON lab_values
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_lab_values_trend ON lab_values(profile_id, test_name, test_date DESC);

-- ──────────────────────────────────────────────────────────────
-- 9. SHARED LINKS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE shared_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES family_profiles(id) ON DELETE CASCADE NOT NULL,
  share_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  pin_hash text,
  shared_document_ids uuid[] DEFAULT '{}',
  include_medications boolean DEFAULT true,
  include_timeline boolean DEFAULT false,
  include_lab_trends boolean DEFAULT false,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  is_revoked boolean DEFAULT false,
  view_count integer DEFAULT 0,
  last_viewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shared_links ENABLE ROW LEVEL SECURITY;

-- Owners manage their own links
CREATE POLICY "Users can manage own shared links" ON shared_links
  FOR ALL USING (auth.uid() = user_id);

-- Public token lookup via RPC only  no direct table SELECT for anonymous users.
-- Use get_shared_link(token) function below instead of exposing table rows.

-- RPC: safe public lookup by token  returns nothing if expired/revoked
CREATE OR REPLACE FUNCTION get_shared_link(token text)
RETURNS SETOF shared_links
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM shared_links
  WHERE share_token = token
    AND NOT is_revoked
    AND expires_at > now();
$$;

-- ──────────────────────────────────────────────────────────────
-- 10. NOTIFICATIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES family_profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('medication_reminder', 'checkup_due', 'report_ready', 'system')),
  title text NOT NULL,
  body text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  scheduled_for timestamptz,
  sent_at timestamptz,
  channel text DEFAULT 'push' CHECK (channel IN ('push', 'email', 'in_app')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE sent_at IS NULL;

-- ──────────────────────────────────────────────────────────────
-- 11. PUSH SUBSCRIPTIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  device_info text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id) WHERE is_active = true;

-- ──────────────────────────────────────────────────────────────
-- 12. PREVENTIVE REMINDERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE preventive_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES family_profiles(id) ON DELETE CASCADE NOT NULL,
  reminder_type text NOT NULL CHECK (reminder_type IN ('annual_checkup', 'eye_exam', 'dental', 'blood_test', 'vaccination', 'custom')),
  title text NOT NULL,
  description text,
  due_date date NOT NULL,
  recurrence_months integer,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  linked_document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE preventive_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preventive reminders" ON preventive_reminders
  FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_preventive_due ON preventive_reminders(profile_id, due_date) WHERE is_completed = false;

-- ──────────────────────────────────────────────────────────────
-- SHARED UTILITIES
-- ──────────────────────────────────────────────────────────────

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON users_profile     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON family_profiles   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON documents         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON document_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON medications       FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────────────
-- STORAGE BUCKET
-- ──────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-documents', 'medical-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'medical-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'medical-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'medical-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ──────────────────────────────────────────────────────────────
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users_profile (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));

  INSERT INTO family_profiles (user_id, full_name, relationship)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 'self');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- MIGRATION COMPLETE
-- 12 tables, RLS on all, indexes, triggers, storage ready
-- Changes from original:
--   - shared_links: removed leaky public SELECT policy, added get_shared_link() RPC
--   - push_subscriptions: added UNIQUE(user_id, endpoint) + index
--   - family_profiles: index changed to (user_id, is_active)
--   - document_analyses: added updated_at + trigger
--   - storage bucket: uncommented and included in migration
-- ============================================================
