-- Adds onboarded_at to user_settings so we know whether a user has
-- completed the welcome wizard. Safe to run multiple times.
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;
