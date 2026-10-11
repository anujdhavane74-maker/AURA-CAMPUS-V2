-- ============================================================================
-- Migration: 20261011000001_core_schema.sql
-- Description: Core database tables for Aura Campus V2
-- Standards: Strict PostgreSQL schema adhering to 04-DATABASE-AND-RLS.md
-- All user tables are private by default.
-- ============================================================================

-- 1. Profiles Table
-- Primary student profile record linked 1:1 with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  headline TEXT,
  bio TEXT,
  avatar_path TEXT,
  cover_path TEXT,
  institution TEXT,
  program TEXT,
  graduation_year SMALLINT,
  location_label TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  discoverable BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Discovery requires profile to be public
  CONSTRAINT discoverable_requires_public CHECK (discoverable = FALSE OR visibility = 'public'),
  -- Handle format: 3-30 chars, lowercase alphanumeric and single hyphens
  CONSTRAINT valid_handle_format CHECK (handle ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(handle) >= 3 AND char_length(handle) <= 30)
);

-- 2. Profile Sections Table
-- Reorderable custom profile sections with individual section-level visibility
CREATE TABLE IF NOT EXISTS public.profile_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Portfolios Table
-- Presentation portfolios independent from profile visibility
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT 'studio',
  accent TEXT NOT NULL DEFAULT 'teal',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'unlisted_link')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT valid_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) >= 2)
);

-- 4. Projects Table
-- Case studies with problem, approach, outcome, and tech tags
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  problem TEXT,
  approach TEXT,
  outcome TEXT,
  technologies TEXT[] NOT NULL DEFAULT '{}'::text[],
  repository_url TEXT,
  demo_url TEXT,
  cover_path TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('planning', 'in_progress', 'completed', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'unlisted_link')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT unique_owner_project_slug UNIQUE (owner_id, slug),
  CONSTRAINT valid_project_slug CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) >= 2)
);

-- 5. Profile Skills Table
CREATE TABLE IF NOT EXISTS public.profile_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  proficiency TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Education Table
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  qualification TEXT,
  dates TEXT,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Experience Table
CREATE TABLE IF NOT EXISTS public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  dates TEXT,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Credentials Table
CREATE TABLE IF NOT EXISTS public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issued_at DATE,
  credential_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. External Links Table
CREATE TABLE IF NOT EXISTS public.external_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Share Links Table
-- High-entropy revocable token hashes for unlisted access
CREATE TABLE IF NOT EXISTS public.share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('portfolio', 'project')),
  resource_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Abuse Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT valid_report_resource_type CHECK (resource_type IN ('profile', 'portfolio', 'project')),
  CONSTRAINT valid_report_reason_length CHECK (char_length(reason) >= 10 AND char_length(reason) <= 2000)
);

-- Schema- and table-specific constraint verification for existing databases
DO $$
DECLARE
  v_invalid_resource_type_count INTEGER := 0;
  v_invalid_reason_count INTEGER := 0;
BEGIN
  -- 1. Ensure valid_report_resource_type exists on public.reports
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'reports'
      AND c.conname = 'valid_report_resource_type'
  ) THEN
    SELECT COUNT(*) INTO v_invalid_resource_type_count
    FROM public.reports
    WHERE resource_type NOT IN ('profile', 'portfolio', 'project');

    IF v_invalid_resource_type_count > 0 THEN
      RAISE WARNING 'public.reports contains % row(s) violating valid_report_resource_type. Adding as NOT VALID.', v_invalid_resource_type_count;
      ALTER TABLE public.reports
        ADD CONSTRAINT valid_report_resource_type
        CHECK (resource_type IN ('profile', 'portfolio', 'project')) NOT VALID;
    ELSE
      ALTER TABLE public.reports
        ADD CONSTRAINT valid_report_resource_type
        CHECK (resource_type IN ('profile', 'portfolio', 'project'));
    END IF;
  END IF;

  -- 2. Ensure valid_report_reason_length exists on public.reports
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'reports'
      AND c.conname = 'valid_report_reason_length'
  ) THEN
    SELECT COUNT(*) INTO v_invalid_reason_count
    FROM public.reports
    WHERE char_length(reason) < 10 OR char_length(reason) > 2000;

    IF v_invalid_reason_count > 0 THEN
      RAISE WARNING 'public.reports contains % row(s) violating valid_report_reason_length. Adding as NOT VALID.', v_invalid_reason_count;
      ALTER TABLE public.reports
        ADD CONSTRAINT valid_report_reason_length
        CHECK (char_length(reason) >= 10 AND char_length(reason) <= 2000) NOT VALID;
    ELSE
      ALTER TABLE public.reports
        ADD CONSTRAINT valid_report_reason_length
        CHECK (char_length(reason) >= 10 AND char_length(reason) <= 2000);
    END IF;
  END IF;
END $$;

-- 12. Audit Events Table (Safe telemetry with no private credentials or secrets)
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lookup and visibility filtering
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(handle);
CREATE INDEX IF NOT EXISTS idx_profiles_discovery ON public.profiles(visibility, discoverable, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_sections_user ON public.profile_sections(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON public.portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_share_links_hash ON public.share_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_share_links_owner ON public.share_links(owner_id);

-- Trigger: Automatically provision a private profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_handle text;
  final_handle text;
  num integer := 0;
BEGIN
  -- Generate initial handle from email or user metadata
  base_handle := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '', 'g'));
  IF char_length(base_handle) < 3 THEN
    base_handle := 'student' || substr(replace(new.id::text, '-', ''), 1, 6);
  END IF;

  final_handle := base_handle;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE handle = final_handle) LOOP
    num := num + 1;
    final_handle := base_handle || num::text;
  END LOOP;

  INSERT INTO public.profiles (
    id,
    handle,
    display_name,
    visibility,
    discoverable
  ) VALUES (
    new.id,
    final_handle,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'private',
    FALSE
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security Hardening: Revoke direct execution from public and client roles (executed only by system trigger)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

