-- 1. Add avatar_url to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create avatars bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies
-- We'll use (storage.foldername(name))[1] to identify the user folder

-- Users can upload files to their own folder
DROP POLICY IF EXISTS "Allow users to upload avatars" ON storage.objects;
CREATE POLICY "Allow users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update/replace their own avatars
DROP POLICY IF EXISTS "Allow users to update own avatars" ON storage.objects;
CREATE POLICY "Allow users to update own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can select/read their own files (needed for generating signed URLs etc)
DROP POLICY IF EXISTS "Allow users to view own avatars" ON storage.objects;
CREATE POLICY "Allow users to view own avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatars
DROP POLICY IF EXISTS "Allow users to delete own avatars" ON storage.objects;
CREATE POLICY "Allow users to delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
