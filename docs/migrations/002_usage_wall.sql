-- ============================================================
-- 002 — Usage Wall
-- Tracks per-user upload counts and blocks abusive accounts.
-- Increments are handled via SECURITY DEFINER functions to
-- prevent clients from directly manipulating counters.
-- ============================================================

CREATE TABLE user_usage (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  successful_uploads integer     DEFAULT 0 NOT NULL,
  invalid_uploads    integer     DEFAULT 0 NOT NULL,
  is_blocked         boolean     DEFAULT false NOT NULL,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Users can only read their own row; writes go through functions below.
CREATE POLICY "Users can read own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_user_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────────────
-- Atomic increment functions (SECURITY DEFINER bypasses RLS)
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_successful_upload(p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO user_usage (user_id, successful_uploads)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET successful_uploads = user_usage.successful_uploads + 1,
        updated_at         = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_invalid_upload(p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO user_usage (user_id, invalid_uploads)
  VALUES (p_user_id, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET invalid_uploads = user_usage.invalid_uploads + 1,
        is_blocked      = CASE
                            WHEN user_usage.invalid_uploads + 1 >= 10 THEN true
                            ELSE user_usage.is_blocked
                          END,
        updated_at      = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
