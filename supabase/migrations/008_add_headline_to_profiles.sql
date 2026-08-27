-- Migration: 008_add_headline_to_profiles.sql
-- Description: Add headline column to profiles table if missing

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS headline VARCHAR(255);
