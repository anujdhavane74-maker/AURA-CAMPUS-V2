import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Portfolio,
  Project,
  PortfolioThemeId,
  AppPaletteId,
  PortfolioVisibility,
  ProjectVisibility,
  ProjectStatus,
  UserProfile,
} from '../types';

interface PortfolioRow {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  theme: string;
  accent: string;
  data: Record<string, unknown>;
  visibility: 'private' | 'public' | 'unlisted_link';
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface ProjectRow {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  summary?: string | null;
  problem?: string | null;
  approach?: string | null;
  outcome?: string | null;
  technologies: string[];
  repository_url?: string | null;
  demo_url?: string | null;
  cover_path?: string | null;
  status: 'planning' | 'in_progress' | 'completed' | 'archived';
  visibility: 'private' | 'public' | 'unlisted_link';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

function mapPortfolioRow(row: PortfolioRow): Portfolio {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    title: row.title,
    theme: (row.theme as PortfolioThemeId) || 'studio',
    accent: (row.accent as AppPaletteId) || 'teal',
    data: row.data || {},
    visibility: row.visibility,
    publishedAt: row.published_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    title: row.title,
    summary: row.summary || undefined,
    problem: row.problem || undefined,
    approach: row.approach || undefined,
    outcome: row.outcome || undefined,
    technologies: Array.isArray(row.technologies) ? row.technologies : [],
    repositoryUrl: row.repository_url || undefined,
    demoUrl: row.demo_url || undefined,
    coverPath: row.cover_path || undefined,
    status: row.status,
    visibility: row.visibility,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const portfolioService = {
  /**
   * Fetch the active user's portfolio
   */
  async fetchUserPortfolio(userId: string): Promise<{ data: Portfolio | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Database connection is not configured.' };
    }

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return { data: null, error: error.message };
      }

      if (!data) {
        return { data: null, error: null };
      }

      return { data: mapPortfolioRow(data as PortfolioRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to fetch portfolio.' };
    }
  },

  /**
   * Create or update the user's portfolio
   */
  async upsertPortfolio(
    userId: string,
    input: {
      id?: string;
      slug: string;
      title: string;
      theme?: PortfolioThemeId;
      accent?: AppPaletteId;
      data?: Record<string, unknown>;
      visibility?: PortfolioVisibility;
      publishedAt?: string | null;
    }
  ): Promise<{ data: Portfolio | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Database connection is not configured.' };
    }

    try {
      const cleanSlug = input.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (cleanSlug.length < 2) {
        return { data: null, error: 'Portfolio slug must be at least 2 characters.' };
      }

      const payload: Partial<PortfolioRow> & { user_id: string; title: string; slug: string } = {
        user_id: userId,
        title: input.title.trim(),
        slug: cleanSlug,
        theme: input.theme || 'studio',
        accent: input.accent || 'teal',
        data: input.data || {},
        visibility: input.visibility || 'private',
        updated_at: new Date().toISOString(),
      };

      if (input.publishedAt !== undefined) {
        payload.published_at = input.publishedAt;
      }

      // Check if user already has a portfolio or id was provided
      let existingId = input.id;
      if (!existingId) {
        const { data: existing } = await supabase
          .from('portfolios')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        if (existing?.id) {
          existingId = existing.id;
        }
      }

      let resData: PortfolioRow;
      if (existingId) {
        const { data, error } = await supabase
          .from('portfolios')
          .update(payload)
          .eq('id', existingId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        resData = data as PortfolioRow;
      } else {
        const { data, error } = await supabase
          .from('portfolios')
          .insert(payload)
          .select()
          .single();

        if (error) return { data: null, error: error.message };
        resData = data as PortfolioRow;
      }

      return { data: mapPortfolioRow(resData), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to save portfolio.' };
    }
  },

  /**
   * Fetch all projects belonging to a user
   */
  async fetchUserProjects(userId: string): Promise<{ data: Project[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: [], error: 'Database connection is not configured.' };
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', userId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error: error.message };
      }

      return { data: (data as ProjectRow[]).map(mapProjectRow), error: null };
    } catch (err) {
      return { data: [], error: (err as Error).message || 'Failed to fetch projects.' };
    }
  },

  /**
   * Create a project
   */
  async createProject(
    userId: string,
    input: {
      title: string;
      slug: string;
      summary?: string;
      problem?: string;
      approach?: string;
      outcome?: string;
      technologies?: string[];
      repositoryUrl?: string;
      demoUrl?: string;
      coverPath?: string;
      status?: ProjectStatus;
      visibility?: ProjectVisibility;
      sortOrder?: number;
    }
  ): Promise<{ data: Project | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Database connection is not configured.' };
    }

    try {
      const cleanSlug = input.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      if (cleanSlug.length < 2) {
        return { data: null, error: 'Project slug must be at least 2 characters.' };
      }

      const payload = {
        owner_id: userId,
        title: input.title.trim(),
        slug: cleanSlug,
        summary: input.summary?.trim() || null,
        problem: input.problem?.trim() || null,
        approach: input.approach?.trim() || null,
        outcome: input.outcome?.trim() || null,
        technologies: input.technologies || [],
        repository_url: input.repositoryUrl?.trim() || null,
        demo_url: input.demoUrl?.trim() || null,
        cover_path: input.coverPath?.trim() || null,
        status: input.status || 'in_progress',
        visibility: input.visibility || 'private',
        sort_order: input.sortOrder ?? 0,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(payload)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapProjectRow(data as ProjectRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to create project.' };
    }
  },

  /**
   * Update a project
   */
  async updateProject(
    userId: string,
    projectId: string,
    input: Partial<{
      title: string;
      slug: string;
      summary: string;
      problem: string;
      approach: string;
      outcome: string;
      technologies: string[];
      repositoryUrl: string;
      demoUrl: string;
      coverPath: string;
      status: ProjectStatus;
      visibility: ProjectVisibility;
      sortOrder: number;
    }>
  ): Promise<{ data: Project | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Database connection is not configured.' };
    }

    try {
      const payload: Partial<ProjectRow> = {};
      if (input.title !== undefined) payload.title = input.title.trim();
      if (input.slug !== undefined) {
        payload.slug = input.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      }
      if (input.summary !== undefined) payload.summary = input.summary.trim() || null;
      if (input.problem !== undefined) payload.problem = input.problem.trim() || null;
      if (input.approach !== undefined) payload.approach = input.approach.trim() || null;
      if (input.outcome !== undefined) payload.outcome = input.outcome.trim() || null;
      if (input.technologies !== undefined) payload.technologies = input.technologies;
      if (input.repositoryUrl !== undefined) payload.repository_url = input.repositoryUrl.trim() || null;
      if (input.demoUrl !== undefined) payload.demo_url = input.demoUrl.trim() || null;
      if (input.coverPath !== undefined) payload.cover_path = input.coverPath.trim() || null;
      if (input.status !== undefined) payload.status = input.status;
      if (input.visibility !== undefined) payload.visibility = input.visibility;
      if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
      payload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', projectId)
        .eq('owner_id', userId)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapProjectRow(data as ProjectRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to update project.' };
    }
  },

  /**
   * Delete a project
   */
  async deleteProject(userId: string, projectId: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Database connection is not configured.' };
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('owner_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: (err as Error).message || 'Failed to delete project.' };
    }
  },

  /**
   * Fetch public portfolio and its related public projects + owner profile by slug
   */
  async getPublicPortfolioBySlug(
    slug: string
  ): Promise<{
    data: {
      portfolio: Portfolio;
      projects: Project[];
      owner: UserProfile | null;
    } | null;
    error: string | null;
  }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Database connection is not configured.' };
    }

    try {
      const cleanSlug = slug.toLowerCase().trim();
      const { data: portfolioRow, error: pError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('slug', cleanSlug)
        .eq('visibility', 'public')
        .maybeSingle();

      if (pError || !portfolioRow) {
        return { data: null, error: pError?.message || 'Portfolio not found or private.' };
      }

      const portfolio = mapPortfolioRow(portfolioRow as PortfolioRow);

      // Fetch owner profile
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', portfolio.userId)
        .maybeSingle();

      const owner: UserProfile | null = profileRow
        ? {
            id: profileRow.id,
            handle: profileRow.handle,
            displayName: profileRow.display_name,
            headline: profileRow.headline || undefined,
            bio: profileRow.bio || undefined,
            avatarPath: profileRow.avatar_path || undefined,
            coverPath: profileRow.cover_path || undefined,
            institution: profileRow.institution || undefined,
            program: profileRow.program || undefined,
            graduationYear: profileRow.graduation_year || undefined,
            locationLabel: profileRow.location_label || undefined,
            visibility: profileRow.visibility,
            discoverable: profileRow.discoverable,
            createdAt: profileRow.created_at,
            updatedAt: profileRow.updated_at,
          }
        : null;

      // Fetch public projects belonging to this user
      const { data: projectRows } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', portfolio.userId)
        .eq('visibility', 'public')
        .order('sort_order', { ascending: true });

      const projects = (projectRows as ProjectRow[] || []).map(mapProjectRow);

      return {
        data: {
          portfolio,
          projects,
          owner,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to fetch public portfolio.' };
    }
  },
};
