-- Migration: 007_add_resume_url_to_profiles.sql
-- Description: Add resume_url column to profiles for admin resume management

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS resume_url VARCHAR(1024);
