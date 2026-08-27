-- Migration: 004_add_cover_image_foreign_keys.sql
-- Description: Add cover_image column and foreign keys to articles and projects

ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image UUID REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image UUID REFERENCES media(id) ON DELETE SET NULL;
