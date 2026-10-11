-- ============================================================================
-- Migration: 20261011000004_unlisted_shares_and_discovery.sql
-- Description: Unlisted Share Resolution & Enhanced Discovery RPCs
-- Standards: Adheres to 04-DATABASE-AND-RLS.md & 07-DISCOVERY-SHARING.md
-- ============================================================================

-- Function: get_unlisted_portfolio
-- Resolves an unlisted portfolio securely by verifying SHA-256 token hash server-side.
-- Only returns data if token is active, unrevoked, and unexpired.
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
  -- 1. Validate token existence, expiry, and revocation
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

  -- 2. Fetch portfolio record
  SELECT
    id, user_id, slug, title, theme, accent, data, visibility, published_at, created_at, updated_at
  INTO v_portfolio
  FROM public.portfolios
  WHERE id = v_link.resource_id AND user_id = v_link.owner_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- 3. Fetch owner public-safe profile record (omits private auth data & email)
  SELECT
    id, handle, display_name, headline, bio, avatar_path, cover_path,
    institution, program, graduation_year, location_label
  INTO v_owner
  FROM public.profiles
  WHERE id = v_portfolio.user_id;

  -- 4. Fetch associated projects (visible as public or unlisted_link)
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

  -- 5. Return assembled read-only payload
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

-- Security Hardening: Revoke default execution, then grant to anon & authenticated
REVOKE EXECUTE ON FUNCTION public.get_unlisted_portfolio(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_unlisted_portfolio(TEXT) TO anon, authenticated;
