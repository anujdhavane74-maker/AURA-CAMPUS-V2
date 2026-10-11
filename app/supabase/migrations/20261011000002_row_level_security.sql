-- ============================================================================
-- Migration: 20261011000002_row_level_security.sql
-- Description: Row Level Security (RLS) policies for Aura Campus V2
-- Standards: Adheres to 04-DATABASE-AND-RLS.md & 05-PROFILES-PRIVACY-AND-PERMISSIONS.md
-- Guarantees private-by-default isolation across anonymous and authenticated clients.
-- Fully idempotent: uses DROP POLICY IF EXISTS before each CREATE POLICY.
-- ============================================================================

-- Enable RLS on every table
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

-- ----------------------------------------------------------------------------
-- 1. Profiles Table Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_owner_or_public" ON public.profiles;
CREATE POLICY "profiles_select_owner_or_public"
  ON public.profiles FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = id)
    OR (visibility = 'public')
  );

DROP POLICY IF EXISTS "profiles_insert_owner" ON public.profiles;
CREATE POLICY "profiles_insert_owner"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_owner" ON public.profiles;
CREATE POLICY "profiles_update_owner"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_owner" ON public.profiles;
CREATE POLICY "profiles_delete_owner"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- 2. Profile Sections Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profile_sections_select_owner_or_public" ON public.profile_sections;
CREATE POLICY "profile_sections_select_owner_or_public"
  ON public.profile_sections FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      visibility = 'public'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = profile_sections.user_id AND profiles.visibility = 'public'
      )
    )
  );

DROP POLICY IF EXISTS "profile_sections_insert_owner" ON public.profile_sections;
CREATE POLICY "profile_sections_insert_owner"
  ON public.profile_sections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_sections_update_owner" ON public.profile_sections;
CREATE POLICY "profile_sections_update_owner"
  ON public.profile_sections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profile_sections_delete_owner" ON public.profile_sections;
CREATE POLICY "profile_sections_delete_owner"
  ON public.profile_sections FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. Portfolios Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "portfolios_select_owner_or_public" ON public.portfolios;
CREATE POLICY "portfolios_select_owner_or_public"
  ON public.portfolios FOR SELECT
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
CREATE POLICY "portfolios_insert_owner"
  ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolios_update_owner" ON public.portfolios;
CREATE POLICY "portfolios_update_owner"
  ON public.portfolios FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolios_delete_owner" ON public.portfolios;
CREATE POLICY "portfolios_delete_owner"
  ON public.portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 4. Projects Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "projects_select_owner_or_public" ON public.projects;
CREATE POLICY "projects_select_owner_or_public"
  ON public.projects FOR SELECT
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
CREATE POLICY "projects_insert_owner"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "projects_update_owner" ON public.projects;
CREATE POLICY "projects_update_owner"
  ON public.projects FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "projects_delete_owner" ON public.projects;
CREATE POLICY "projects_delete_owner"
  ON public.projects FOR DELETE
  USING (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 5. Child Tables (Skills, Education, Experience, Credentials, Links)
-- ----------------------------------------------------------------------------
-- Profile Skills
DROP POLICY IF EXISTS "profile_skills_select_owner_or_public" ON public.profile_skills;
CREATE POLICY "profile_skills_select_owner_or_public"
  ON public.profile_skills FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = profile_skills.user_id AND profiles.visibility = 'public'
    )
  );

DROP POLICY IF EXISTS "profile_skills_modify_owner" ON public.profile_skills;
CREATE POLICY "profile_skills_modify_owner"
  ON public.profile_skills FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Education
DROP POLICY IF EXISTS "education_select_owner_or_public" ON public.education;
CREATE POLICY "education_select_owner_or_public"
  ON public.education FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      visibility = 'public'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = education.user_id AND profiles.visibility = 'public'
      )
    )
  );

DROP POLICY IF EXISTS "education_modify_owner" ON public.education;
CREATE POLICY "education_modify_owner"
  ON public.education FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Experience
DROP POLICY IF EXISTS "experience_select_owner_or_public" ON public.experience;
CREATE POLICY "experience_select_owner_or_public"
  ON public.experience FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      visibility = 'public'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = experience.user_id AND profiles.visibility = 'public'
      )
    )
  );

DROP POLICY IF EXISTS "experience_modify_owner" ON public.experience;
CREATE POLICY "experience_modify_owner"
  ON public.experience FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Credentials
DROP POLICY IF EXISTS "credentials_select_owner_or_public" ON public.credentials;
CREATE POLICY "credentials_select_owner_or_public"
  ON public.credentials FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      visibility = 'public'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = credentials.user_id AND profiles.visibility = 'public'
      )
    )
  );

DROP POLICY IF EXISTS "credentials_modify_owner" ON public.credentials;
CREATE POLICY "credentials_modify_owner"
  ON public.credentials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- External Links
DROP POLICY IF EXISTS "external_links_select_owner_or_public" ON public.external_links;
CREATE POLICY "external_links_select_owner_or_public"
  ON public.external_links FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR (
      visibility = 'public'
      AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = external_links.user_id AND profiles.visibility = 'public'
      )
    )
  );

DROP POLICY IF EXISTS "external_links_modify_owner" ON public.external_links;
CREATE POLICY "external_links_modify_owner"
  ON public.external_links FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 6. Share Links Policies
-- Tokens are sensitive. Only the owner may view/modify their links.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "share_links_owner_all" ON public.share_links;
CREATE POLICY "share_links_owner_all"
  ON public.share_links FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 7. Abuse Reports Policies
-- Anyone (authenticated or anonymous) can submit an abuse report.
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "reports_insert_anyone" ON public.reports;
CREATE POLICY "reports_insert_anyone"
  ON public.reports FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = reporter_id)
    OR (reporter_id IS NULL)
  );

-- ----------------------------------------------------------------------------
-- 8. Audit Events Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "audit_events_select_owner" ON public.audit_events;
CREATE POLICY "audit_events_select_owner"
  ON public.audit_events FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = actor_id);
