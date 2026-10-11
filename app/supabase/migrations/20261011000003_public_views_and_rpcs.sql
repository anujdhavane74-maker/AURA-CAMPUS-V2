-- ============================================================================
-- Migration: 20261011000003_public_views_and_rpcs.sql
-- Description: Public-safe Views and RPCs for Aura Campus V2
-- Standards: Adheres to 04-DATABASE-AND-RLS.md section 3 & 07-DISCOVERY-SHARING.md
-- Explicit field allowlist preventing accidental exposure of private data.
-- ============================================================================

-- 1. Public-Safe Profile Resolution Function
-- Returns public profile data ONLY when visibility = 'public'
-- Omits auth ID, email, private notes, and internal metadata.
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

-- 2. Public Directory Explorer Function
-- Returns paginated public profiles where discoverable = true and visibility = 'public'
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

-- 3. Share-Token Verification Function
-- Verifies high-entropy token hash server-side without exposing plaintext tokens
-- Returns zero rows for expired, revoked, or mismatched tokens to prevent metadata leakage.
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
