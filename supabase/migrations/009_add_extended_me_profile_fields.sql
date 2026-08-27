-- Migration: 009_add_extended_me_profile_fields.sql
-- Description: Add education, detailed_bio, engineering_interests, personal_interests to profiles for dynamic /me page

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS education VARCHAR(255),
  ADD COLUMN IF NOT EXISTS detailed_bio TEXT,
  ADD COLUMN IF NOT EXISTS engineering_interests TEXT,
  ADD COLUMN IF NOT EXISTS personal_interests TEXT;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
