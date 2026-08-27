-- Migration: 005_purge_junk_demo_data.sql
-- Description: Clean up junk demo data from remote database

DELETE FROM articles WHERE slug = 'dfsdgfh' OR title ILIKE '%dfsdgfh%';
