-- ============================================================================
-- AURA CAMPUS V2 — CONSOLIDATED INITIAL SETUP SCRIPT
-- Project: https://tzegnjmxkrwnwgrfflgn.supabase.co
-- Safely applies core schema, RLS policies, triggers, and public RPCs.
-- Run this script in the Supabase Dashboard -> SQL Editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SECTION 1: CORE SCHEMA
-- ----------------------------------------------------------------------------

-- 1. Profiles Table
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

  CONSTRAINT discoverable_requires_public CHECK (discoverable = FALSE OR visibility = 'public'),
  CONSTRAINT valid_handle_format CHECK (handle ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(handle) >= 3 AND char_length(handle) <= 30)
);

-- 2. Profile Sections Table
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

-- 11. Reports Table
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

-- 12. Audit Events Table
CREATE TABLE IF NOT EXISTS public.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON public.profiles(handle);
CREATE INDEX IF NOT EXISTS idx_profiles_discovery ON public.profiles(visibility, discoverable, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_sections_user ON public.profile_sections(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON public.portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_share_links_hash ON public.share_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_share_links_owner ON public.share_links(owner_id);

-- Trigger Function: Automatic Private Profile Provisioning
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

-- ----------------------------------------------------------------------------
-- SECTION 2: ROW LEVEL SECURITY POLICIES
-- ----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_owner_or_public" ON public.profiles;
CREATE POLICY "profiles_select_owner_or_public" ON public.profiles FOR SELECT
  USING ((auth.uid() IS NOT NULL AND auth.uid() = id) OR (visibility = 'public'));

DROP POLICY IF EXISTS "profiles_insert_owner" ON public.profiles;
CREATE POLICY "profiles_insert_owner" ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;
CREATE POLICY "profiles_update_owner" ON public.profiles FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_owner" ON public.profiles;
CREATE POLICY "profiles_delete_owner" ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Profile Sections Policies
DROP POLICY IF EXISTS "profile_sections_select_owner_or_public" ON public.profile_sections;
CREATE POLICY "profile_sections_select_owner_or_public" ON public.profile_sections FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      visibility = 'public'
      AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = profile_sections.user_id AND profiles.visibility = 'public')
    )
  );

DROP POLICY IF EXISTS "profile_sections_insert_owner" ON public.profile_sections;
CREATE POLICY "profile_sections_insert_owner" ON public.profile_sections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_sections_update_owner" ON public.profile_sections;
CREATE POLICY "profile_sections_update_owner" ON public.profile_sections FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_sections_delete_owner" ON public.profile_sections;
CREATE POLICY "profile_sections_delete_owner" ON public.profile_sections FOR DELETE
  USING (auth.uid() = user_id);

-- Portfolios Policies
DROP POLICY IF EXISTS "portfolios_select_owner_or_public" ON public.portfolios;
CREATE POLICY "portfolios_select_owner_or_public" ON public.portfolios FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      visibility = 'public'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = portfolios.user_id AND profiles.visibility = 'public'
      )
    )
  );

DROP POLICY IF EXISTS "portfolios_insert_owner" ON public.portfolios;
CREATE POLICY "portfolios_insert_owner" ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolios_update_owner" ON public.portfolios;
CREATE POLICY "portfolios_update_owner" ON public.portfolios FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolios_delete_owner" ON public.portfolios;
CREATE POLICY "portfolios_delete_owner" ON public.portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Projects Policies
DROP POLICY IF EXISTS "projects_select_owner_or_public" ON public.projects;
CREATE POLICY "projects_select_owner_or_public" ON public.projects FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = owner_id)
    OR (
      visibility = 'public'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = projects.owner_id AND profiles.visibility = 'public'
      )
    )
  );

DROP POLICY IF EXISTS "projects_insert_owner" ON public.projects;
CREATE POLICY "projects_insert_owner" ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "projects_update_owner" ON public.projects;
CREATE POLICY "projects_update_owner" ON public.projects FOR UPDATE
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "projects_delete_owner" ON public.projects;
CREATE POLICY "projects_delete_owner" ON public.projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Child Tables Policies
DROP POLICY IF EXISTS "profile_skills_select_owner_or_public" ON public.profile_skills;
CREATE POLICY "profile_skills_select_owner_or_public" ON public.profile_skills FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = profile_skills.user_id AND profiles.visibility = 'public')
  );

DROP POLICY IF EXISTS "profile_skills_modify_owner" ON public.profile_skills;
CREATE POLICY "profile_skills_modify_owner" ON public.profile_skills FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "education_select_owner_or_public" ON public.education;
CREATE POLICY "education_select_owner_or_public" ON public.education FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      visibility = 'public'
      AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = education.user_id AND profiles.visibility = 'public')
    )
  );

DROP POLICY IF EXISTS "education_modify_owner" ON public.education;
CREATE POLICY "education_modify_owner" ON public.education FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "experience_select_owner_or_public" ON public.experience;
CREATE POLICY "experience_select_owner_or_public" ON public.experience FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      visibility = 'public'
      AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = experience.user_id AND profiles.visibility = 'public')
    )
  );

DROP POLICY IF EXISTS "experience_modify_owner" ON public.experience;
CREATE POLICY "experience_modify_owner" ON public.experience FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "credentials_select_owner_or_public" ON public.credentials;
CREATE POLICY "credentials_select_owner_or_public" ON public.credentials FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      visibility = 'public'
      AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = credentials.user_id AND profiles.visibility = 'public')
    )
  );

DROP POLICY IF EXISTS "credentials_modify_owner" ON public.credentials;
CREATE POLICY "credentials_modify_owner" ON public.credentials FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "external_links_select_owner_or_public" ON public.external_links;
CREATE POLICY "external_links_select_owner_or_public" ON public.external_links FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      visibility = 'public'
      AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = external_links.user_id AND profiles.visibility = 'public')
    )
  );

DROP POLICY IF EXISTS "external_links_modify_owner" ON public.external_links;
CREATE POLICY "external_links_modify_owner" ON public.external_links FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Share Links Policies
DROP POLICY IF EXISTS "share_links_owner_all" ON public.share_links;
CREATE POLICY "share_links_owner_all" ON public.share_links FOR ALL
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Reports Policies
DROP POLICY IF EXISTS "reports_insert_anyone" ON public.reports;
CREATE POLICY "reports_insert_anyone" ON public.reports FOR INSERT
  WITH CHECK ((auth.uid() IS NOT NULL AND auth.uid() = reporter_id) OR (reporter_id IS NULL));

-- Audit Events Policies
DROP POLICY IF EXISTS "audit_events_select_owner" ON public.audit_events;
CREATE POLICY "audit_events_select_owner" ON public.audit_events FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = actor_id);

-- ----------------------------------------------------------------------------
-- SECTION 3: PUBLIC VIEWS & RPCs
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_public_profile(p_handle TEXT)
RETURNS TABLE (
  handle TEXT,
  display_name TEXT,
  headline TEXT,
  bio TEXT,
  avatar_path TEXT,
  cover_path TEXT,
  institution TEXT,
  program TEXT,
  graduation_year SMALLINT,
  location_label TEXT,
  discoverable BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.handle,
    p.display_name,
    p.headline,
    p.bio,
    p.avatar_path,
    p.cover_path,
    p.institution,
    p.program,
    p.graduation_year,
    p.location_label,
    p.discoverable,
    p.updated_at
  FROM public.profiles p
  WHERE lower(p.handle) = lower(p_handle)
    AND p.visibility = 'public';
END;
$$;

CREATE OR REPLACE FUNCTION public.get_explore_profiles(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  handle TEXT,
  display_name TEXT,
  headline TEXT,
  avatar_path TEXT,
  institution TEXT,
  program TEXT,
  graduation_year SMALLINT,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.handle,
    p.display_name,
    p.headline,
    p.avatar_path,
    p.institution,
    p.program,
    p.graduation_year,
    p.updated_at
  FROM public.profiles p
  WHERE p.visibility = 'public'
    AND p.discoverable = TRUE
    AND (
      p_search IS NULL
      OR p_search = ''
      OR p.display_name ILIKE ('%' || p_search || '%')
      OR p.handle ILIKE ('%' || p_search || '%')
      OR p.institution ILIKE ('%' || p_search || '%')
    )
  ORDER BY p.updated_at DESC
  LIMIT LEAST(p_limit, 50)
  OFFSET GREATEST(p_offset, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_share_token(
  p_token_hash TEXT,
  p_expected_resource_type TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  resource_id UUID,
  owner_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    TRUE AS is_valid,
    sl.resource_id,
    sl.owner_id
  FROM public.share_links sl
  WHERE sl.token_hash = p_token_hash
    AND sl.resource_type = p_expected_resource_type
    AND sl.revoked_at IS NULL
    AND (sl.expires_at IS NULL OR sl.expires_at > now())
  LIMIT 1;
END;
$$;

-- Security Hardening: Revoke default PUBLIC execution before explicit role grants
REVOKE EXECUTE ON FUNCTION public.get_public_profile(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_profile(TEXT) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_explore_profiles(INTEGER, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_explore_profiles(INTEGER, INTEGER, TEXT) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.verify_share_token(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_share_token(TEXT, TEXT) TO anon, authenticated;

-- 4. Unlisted Portfolio Resolution RPC
CREATE OR REPLACE FUNCTION public.get_unlisted_portfolio(p_token_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_link RECORD;
  v_portfolio RECORD;
  v_owner RECORD;
  v_projects JSONB;
BEGIN
  SELECT sl.id, sl.resource_id, sl.owner_id
  INTO v_link
  FROM public.share_links sl
  WHERE sl.token_hash = p_token_hash
    AND sl.resource_type = 'portfolio'
    AND sl.revoked_at IS NULL
    AND (sl.expires_at IS NULL OR sl.expires_at > now())
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT
    id, user_id, slug, title, theme, accent, data, visibility, published_at, created_at, updated_at
  INTO v_portfolio
  FROM public.portfolios
  WHERE id = v_link.resource_id AND user_id = v_link.owner_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT
    id, handle, display_name, headline, bio, avatar_path, cover_path,
    institution, program, graduation_year, location_label
  INTO v_owner
  FROM public.profiles
  WHERE id = v_portfolio.user_id;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'ownerId', p.owner_id,
      'slug', p.slug,
      'title', p.title,
      'summary', p.summary,
      'problem', p.problem,
      'approach', p.approach,
      'outcome', p.outcome,
      'technologies', p.technologies,
      'status', p.status,
      'repositoryUrl', p.repository_url,
      'demoUrl', p.demo_url,
      'coverPath', p.cover_path,
      'visibility', p.visibility,
      'sortOrder', p.sort_order,
      'createdAt', p.created_at,
      'updatedAt', p.updated_at
    ) ORDER BY p.sort_order ASC
  ), '[]'::jsonb)
  INTO v_projects
  FROM public.projects p
  WHERE p.owner_id = v_portfolio.user_id
    AND p.visibility IN ('public', 'unlisted_link');

  RETURN jsonb_build_object(
    'portfolio', jsonb_build_object(
      'id', v_portfolio.id,
      'userId', v_portfolio.user_id,
      'slug', v_portfolio.slug,
      'title', v_portfolio.title,
      'theme', v_portfolio.theme,
      'accent', v_portfolio.accent,
      'data', coalesce(v_portfolio.data, '{}'::jsonb),
      'visibility', v_portfolio.visibility,
      'publishedAt', v_portfolio.published_at,
      'createdAt', v_portfolio.created_at,
      'updatedAt', v_portfolio.updated_at
    ),
    'owner', jsonb_build_object(
      'id', v_owner.id,
      'handle', v_owner.handle,
      'displayName', v_owner.display_name,
      'headline', v_owner.headline,
      'bio', v_owner.bio,
      'avatarPath', v_owner.avatar_path,
      'coverPath', v_owner.cover_path,
      'institution', v_owner.institution,
      'program', v_owner.program,
      'graduationYear', v_owner.graduation_year,
      'locationLabel', v_owner.location_label,
      'visibility', 'unlisted_link',
      'discoverable', false,
      'createdAt', v_portfolio.created_at,
      'updatedAt', v_portfolio.updated_at
    ),
    'projects', v_projects
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_unlisted_portfolio(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_unlisted_portfolio(TEXT) TO anon, authenticated;

