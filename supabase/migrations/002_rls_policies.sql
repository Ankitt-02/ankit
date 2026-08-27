-- Migration: 002_rls_policies.sql
-- Description: Enable and enforce strict table-by-table Row Level Security policies with Admin Authorization

-- Enable RLS on all database tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE moment_images ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to drop policies cleanly if re-running
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 1. Profiles Table RLS
-- Public can view profiles
CREATE POLICY profiles_select_public ON profiles FOR SELECT USING (true);
-- Admin or profile owner can insert/update/delete profile
CREATE POLICY profiles_insert_admin ON profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY profiles_update_admin ON profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY profiles_delete_admin ON profiles FOR DELETE USING (public.is_admin());

-- 2. Articles Table RLS
-- Public users can only see published articles
CREATE POLICY articles_select_public ON articles FOR SELECT USING (published = true AND status = 'published');
-- Authorized Admin can read all articles (including drafts)
CREATE POLICY articles_select_admin ON articles FOR SELECT USING (public.is_admin());
-- Authorized Admin can create, update, delete articles
CREATE POLICY articles_insert_admin ON articles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY articles_update_admin ON articles FOR UPDATE USING (public.is_admin());
CREATE POLICY articles_delete_admin ON articles FOR DELETE USING (public.is_admin());

-- 3. Projects Table RLS
-- Public users can only see published projects
CREATE POLICY projects_select_public ON projects FOR SELECT USING (published = true AND status = 'published');
-- Authorized Admin can read all projects (including drafts)
CREATE POLICY projects_select_admin ON projects FOR SELECT USING (public.is_admin());
-- Authorized Admin can create, update, delete projects
CREATE POLICY projects_insert_admin ON projects FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY projects_update_admin ON projects FOR UPDATE USING (public.is_admin());
CREATE POLICY projects_delete_admin ON projects FOR DELETE USING (public.is_admin());

-- 4. Moments Table RLS
-- Public users can only see published moments
CREATE POLICY moments_select_public ON moments FOR SELECT USING (published = true);
-- Authorized Admin can read all moments (including drafts)
CREATE POLICY moments_select_admin ON moments FOR SELECT USING (public.is_admin());
-- Authorized Admin can create, update, delete moments
CREATE POLICY moments_insert_admin ON moments FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY moments_update_admin ON moments FOR UPDATE USING (public.is_admin());
CREATE POLICY moments_delete_admin ON moments FOR DELETE USING (public.is_admin());

-- 5. Tags Table RLS
CREATE POLICY tags_select_public ON tags FOR SELECT USING (true);
CREATE POLICY tags_insert_admin ON tags FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY tags_update_admin ON tags FOR UPDATE USING (public.is_admin());
CREATE POLICY tags_delete_admin ON tags FOR DELETE USING (public.is_admin());

-- 6. Technologies Table RLS
CREATE POLICY technologies_select_public ON technologies FOR SELECT USING (true);
CREATE POLICY technologies_insert_admin ON technologies FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY technologies_update_admin ON technologies FOR UPDATE USING (public.is_admin());
CREATE POLICY technologies_delete_admin ON technologies FOR DELETE USING (public.is_admin());

-- 7. Media Table RLS
CREATE POLICY media_select_public ON media FOR SELECT USING (true);
CREATE POLICY media_insert_admin ON media FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY media_update_admin ON media FOR UPDATE USING (public.is_admin());
CREATE POLICY media_delete_admin ON media FOR DELETE USING (public.is_admin());

-- 8. Junction Tables RLS (article_tags, project_tags, moment_tags, project_technologies)
CREATE POLICY article_tags_select_public ON article_tags FOR SELECT USING (true);
CREATE POLICY article_tags_insert_admin ON article_tags FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY article_tags_delete_admin ON article_tags FOR DELETE USING (public.is_admin());

CREATE POLICY project_tags_select_public ON project_tags FOR SELECT USING (true);
CREATE POLICY project_tags_insert_admin ON project_tags FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY project_tags_delete_admin ON project_tags FOR DELETE USING (public.is_admin());

CREATE POLICY moment_tags_select_public ON moment_tags FOR SELECT USING (true);
CREATE POLICY moment_tags_insert_admin ON moment_tags FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY moment_tags_delete_admin ON moment_tags FOR DELETE USING (public.is_admin());

CREATE POLICY project_technologies_select_public ON project_technologies FOR SELECT USING (true);
CREATE POLICY project_technologies_insert_admin ON project_technologies FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY project_technologies_delete_admin ON project_technologies FOR DELETE USING (public.is_admin());

-- 9. Image Tables RLS (article_images, project_images, moment_images)
CREATE POLICY article_images_select_public ON article_images FOR SELECT USING (true);
CREATE POLICY article_images_insert_admin ON article_images FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY article_images_delete_admin ON article_images FOR DELETE USING (public.is_admin());

CREATE POLICY project_images_select_public ON project_images FOR SELECT USING (true);
CREATE POLICY project_images_insert_admin ON project_images FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY project_images_delete_admin ON project_images FOR DELETE USING (public.is_admin());

CREATE POLICY moment_images_select_public ON moment_images FOR SELECT USING (true);
CREATE POLICY moment_images_insert_admin ON moment_images FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY moment_images_delete_admin ON moment_images FOR DELETE USING (public.is_admin());

-- 10. Storage Bucket Setup & RLS Policies for Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read objects in 'media' bucket
DROP POLICY IF EXISTS "Public Storage Select" ON storage.objects;
CREATE POLICY "Public Storage Select" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Authorized Admin can insert objects in 'media' bucket
DROP POLICY IF EXISTS "Admin Storage Insert" ON storage.objects;
CREATE POLICY "Admin Storage Insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND public.is_admin());

-- Authorized Admin can update objects in 'media' bucket
DROP POLICY IF EXISTS "Admin Storage Update" ON storage.objects;
CREATE POLICY "Admin Storage Update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND public.is_admin());

-- Authorized Admin can delete objects in 'media' bucket
DROP POLICY IF EXISTS "Admin Storage Delete" ON storage.objects;
CREATE POLICY "Admin Storage Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND public.is_admin());
