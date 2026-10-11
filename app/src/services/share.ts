import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ShareLinkItem,
  CreateShareLinkInput,
  ExploreProfileItem,
  Portfolio,
  Project,
  UserProfile,
} from '../types';

/**
 * Helper to compute SHA-256 hash of a string in browser or test environments
 */
export async function hashToken(rawToken: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawToken);

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js test environment fallback
  try {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  } catch {
    throw new Error('Cryptographic hashing is not supported in this runtime.');
  }
}

/**
 * Generate a cryptographically secure random token (48-character hex string)
 */
export function generateRawToken(): string {
  const bytes = new Uint8Array(24);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    // Node.js fallback
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    return crypto.randomBytes(24).toString('hex');
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

interface ShareLinkRow {
  id: string;
  owner_id: string;
  resource_type: 'portfolio' | 'project';
  resource_id: string;
  token_hash: string;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

function mapShareLinkRow(row: ShareLinkRow): ShareLinkItem {
  return {
    id: row.id,
    ownerId: row.owner_id,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    revokedAt: row.revoked_at,
    createdAt: row.created_at,
  };
}

export const shareService = {
  /**
   * Hashes a raw token
   */
  hashToken,

  /**
   * Generates a raw token
   */
  generateRawToken,

  /**
   * Create an unlisted share link for a portfolio or project
   * Note: The raw token is returned once and NEVER stored in plaintext in the database.
   */
  async createShareLink(
    ownerId: string,
    input: CreateShareLinkInput
  ): Promise<{
    data: {
      id: string;
      rawToken: string;
      tokenHash: string;
      expiresAt: string | null;
      shareUrl: string;
    } | null;
    error: string | null;
  }> {
    if (!isSupabaseConfigured) {
      // In-memory demo fallback when database is not configured
      const rawToken = generateRawToken();
      const tokenHash = await hashToken(rawToken);
      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 86400000).toISOString()
        : null;
      return {
        data: {
          id: 'demo-link-' + Date.now(),
          rawToken,
          tokenHash,
          expiresAt,
          shareUrl: `${window.location.origin}/s/${rawToken}`,
        },
        error: null,
      };
    }

    try {
      const rawToken = generateRawToken();
      const tokenHash = await hashToken(rawToken);

      const expiresAt = input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 86400000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('share_links')
        .insert({
          owner_id: ownerId,
          resource_type: input.resourceType,
          resource_id: input.resourceId,
          token_hash: tokenHash,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error || !data) {
        return { data: null, error: error?.message || 'Failed to create share link.' };
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return {
        data: {
          id: data.id,
          rawToken,
          tokenHash,
          expiresAt,
          shareUrl: `${origin}/s/${rawToken}`,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to create share link.' };
    }
  },

  /**
   * List all share links created by the user, optionally filtered by resource ID
   */
  async listShareLinks(
    ownerId: string,
    resourceId?: string
  ): Promise<{ data: ShareLinkItem[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    try {
      let query = supabase
        .from('share_links')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (resourceId) {
        query = query.eq('resource_id', resourceId);
      }

      const { data, error } = await query;

      if (error) {
        return { data: [], error: error.message };
      }

      return {
        data: (data as ShareLinkRow[] || []).map(mapShareLinkRow),
        error: null,
      };
    } catch (err) {
      return { data: [], error: (err as Error).message || 'Failed to list share links.' };
    }
  },

  /**
   * Revoke an active share link
   */
  async revokeShareLink(
    ownerId: string,
    linkId: string
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('share_links')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', linkId)
        .eq('owner_id', ownerId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: (err as Error).message || 'Failed to revoke link.' };
    }
  },

  /**
   * Resolve an unlisted portfolio from a raw token
   * Validates server-side against the stored SHA-256 hash
   */
  async resolveUnlistedPortfolio(
    rawToken: string
  ): Promise<{
    data: {
      portfolio: Portfolio;
      projects: Project[];
      owner: UserProfile | null;
    } | null;
    error: string | null;
  }> {
    if (!rawToken || rawToken.trim().length === 0) {
      return { data: null, error: 'Invalid or missing share token.' };
    }

    if (!isSupabaseConfigured) {
      return { data: null, error: 'Database is not configured.' };
    }

    try {
      const tokenHash = await hashToken(rawToken.trim());

      const { data, error } = await supabase.rpc('get_unlisted_portfolio', {
        p_token_hash: tokenHash,
      });

      if (error || !data) {
        return { data: null, error: error?.message || 'Link is invalid, expired, or revoked.' };
      }

      const payload = data as {
        portfolio: Portfolio;
        projects: Project[];
        owner: UserProfile | null;
      };

      return { data: payload, error: null };
    } catch (err) {
      return {
        data: null,
        error: (err as Error).message || 'Failed to resolve unlisted portfolio.',
      };
    }
  },

  /**
   * Query the public discoverable profiles directory via get_explore_profiles RPC
   */
  async getExploreProfiles(options?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{ data: ExploreProfileItem[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    try {
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      const search = options?.search?.trim() || null;

      const { data, error } = await supabase.rpc('get_explore_profiles', {
        p_limit: limit,
        p_offset: offset,
        p_search: search,
      });

      if (error) {
        return { data: [], error: error.message };
      }

      const items: ExploreProfileItem[] = ((data as Array<Record<string, unknown>>) || []).map(
        (row) => ({
          handle: String(row.handle || ''),
          displayName: String(row.display_name || ''),
          headline: row.headline ? String(row.headline) : null,
          avatarPath: row.avatar_path ? String(row.avatar_path) : null,
          institution: row.institution ? String(row.institution) : null,
          program: row.program ? String(row.program) : null,
          graduationYear: row.graduation_year ? Number(row.graduation_year) : null,
          updatedAt: String(row.updated_at || new Date().toISOString()),
        })
      );

      return { data: items, error: null };
    } catch (err) {
      return { data: [], error: (err as Error).message || 'Failed to load explore directory.' };
    }
  },
};
