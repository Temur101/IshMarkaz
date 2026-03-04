-- =====================================================
-- MIGRATION: Add personal profile fields to profiles table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- =====================================================

-- 1. Add missing columns to the profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name   TEXT,
  ADD COLUMN IF NOT EXISTS last_name    TEXT,
  ADD COLUMN IF NOT EXISTS full_name    TEXT,          -- kept for backwards compat (MyJobs uses it)
  ADD COLUMN IF NOT EXISTS occupation   TEXT,          -- kept for backwards compat
  ADD COLUMN IF NOT EXISTS role         TEXT,          -- mirrors user_metadata.role
  ADD COLUMN IF NOT EXISTS location     TEXT,
  ADD COLUMN IF NOT EXISTS phone        TEXT,
  ADD COLUMN IF NOT EXISTS skills       TEXT,          -- comma-separated string
  ADD COLUMN IF NOT EXISTS about        TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ DEFAULT NOW();

-- 2. Sync all existing user_metadata into profiles rows
--    (Safe to run multiple times — uses ON CONFLICT DO UPDATE)
INSERT INTO public.profiles (
  id,
  first_name,
  last_name,
  full_name,
  role,
  occupation,
  location,
  phone,
  skills,
  about,
  social_links
)
SELECT
  au.id,
  au.raw_user_meta_data->>'first_name'                                  AS first_name,
  au.raw_user_meta_data->>'last_name'                                   AS last_name,
  CONCAT_WS(' ',
    au.raw_user_meta_data->>'first_name',
    au.raw_user_meta_data->>'last_name'
  )                                                                       AS full_name,
  au.raw_user_meta_data->>'role'                                        AS role,
  au.raw_user_meta_data->>'role'                                        AS occupation,
  au.raw_user_meta_data->>'location'                                    AS location,
  au.raw_user_meta_data->>'phone'                                       AS phone,
  au.raw_user_meta_data->>'skills'                                      AS skills,
  au.raw_user_meta_data->>'about'                                       AS about,
  COALESCE(
    (au.raw_user_meta_data->'social_links'),
    '[]'::jsonb
  )                                                                       AS social_links
FROM auth.users au
ON CONFLICT (id) DO UPDATE SET
  first_name   = EXCLUDED.first_name,
  last_name    = EXCLUDED.last_name,
  full_name    = EXCLUDED.full_name,
  role         = EXCLUDED.role,
  occupation   = EXCLUDED.occupation,
  location     = EXCLUDED.location,
  phone        = EXCLUDED.phone,
  skills       = EXCLUDED.skills,
  about        = EXCLUDED.about,
  social_links = EXCLUDED.social_links,
  updated_at   = NOW();

-- 3. Create (or replace) a function + trigger that automatically syncs
--    user_metadata → profiles whenever auth.users is updated
CREATE OR REPLACE FUNCTION public.sync_user_metadata_to_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    full_name,
    role,
    occupation,
    location,
    phone,
    skills,
    about,
    social_links,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    CONCAT_WS(' ',
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name'
    ),
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'role',
    NEW.raw_user_meta_data->>'location',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'skills',
    NEW.raw_user_meta_data->>'about',
    COALESCE(NEW.raw_user_meta_data->'social_links', '[]'::jsonb),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name   = EXCLUDED.first_name,
    last_name    = EXCLUDED.last_name,
    full_name    = EXCLUDED.full_name,
    role         = EXCLUDED.role,
    occupation   = EXCLUDED.occupation,
    location     = EXCLUDED.location,
    phone        = EXCLUDED.phone,
    skills       = EXCLUDED.skills,
    about        = EXCLUDED.about,
    social_links = EXCLUDED.social_links,
    updated_at   = NOW();
  RETURN NEW;
END;
$$;

-- Drop old trigger if it exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_metadata_to_profile();

-- 4. Make sure RLS allows authenticated users to read ANY profile
--    (needed so the UserProfileModal can load other users' data)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow everyone who is logged in to READ all profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to UPDATE only their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to INSERT their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
