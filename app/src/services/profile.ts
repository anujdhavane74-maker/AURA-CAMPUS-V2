import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  UserProfile,
  EducationItem,
  ExperienceItem,
  SkillItem,
  CredentialItem,
  ExternalLinkItem,
  ProfileSectionItem,
  StudentProfileAggregate,
  ProfileCompletenessResult,
  CompletenessCriterion,
} from '../types';
import { RESERVED_HANDLES } from '../schemas';

// Database row representations
interface ProfileRow {
  id: string;
  handle: string;
  display_name: string;
  headline?: string | null;
  bio?: string | null;
  avatar_path?: string | null;
  cover_path?: string | null;
  institution?: string | null;
  program?: string | null;
  graduation_year?: number | null;
  location_label?: string | null;
  visibility: 'private' | 'public';
  discoverable: boolean;
  created_at: string;
  updated_at: string;
}

interface EducationRow {
  id: string;
  user_id: string;
  institution: string;
  qualification?: string | null;
  dates?: string | null;
  description?: string | null;
  visibility: 'private' | 'public';
  created_at: string;
}

interface ExperienceRow {
  id: string;
  user_id: string;
  organization: string;
  role: string;
  dates?: string | null;
  description?: string | null;
  visibility: 'private' | 'public';
  created_at: string;
}

interface SkillRow {
  id: string;
  user_id: string;
  skill: string;
  proficiency?: string | null;
  sort_order: number;
  created_at: string;
}

interface CredentialRow {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  issuer: string;
  issued_at?: string | null;
  credential_url?: string | null;
  visibility: 'private' | 'public';
  created_at: string;
}

interface ExternalLinkRow {
  id: string;
  user_id: string;
  label: string;
  url: string;
  visibility: 'private' | 'public';
  sort_order: number;
  created_at: string;
}

interface ProfileSectionRow {
  id: string;
  user_id: string;
  section_type: string;
  title?: string | null;
  content: Record<string, unknown>;
  sort_order: number;
  visibility: 'private' | 'public';
  created_at: string;
  updated_at: string;
}

function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.display_name,
    headline: row.headline || undefined,
    bio: row.bio || undefined,
    avatarPath: row.avatar_path || undefined,
    coverPath: row.cover_path || undefined,
    institution: row.institution || undefined,
    program: row.program || undefined,
    graduationYear: row.graduation_year || undefined,
    locationLabel: row.location_label || undefined,
    visibility: row.visibility,
    discoverable: row.discoverable,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEducationRow(row: EducationRow): EducationItem {
  return {
    id: row.id,
    userId: row.user_id,
    institution: row.institution,
    qualification: row.qualification || undefined,
    dates: row.dates || undefined,
    description: row.description || undefined,
    visibility: row.visibility,
    createdAt: row.created_at,
  };
}

function mapExperienceRow(row: ExperienceRow): ExperienceItem {
  return {
    id: row.id,
    userId: row.user_id,
    organization: row.organization,
    role: row.role,
    dates: row.dates || undefined,
    description: row.description || undefined,
    visibility: row.visibility,
    createdAt: row.created_at,
  };
}

function mapSkillRow(row: SkillRow): SkillItem {
  return {
    id: row.id,
    userId: row.user_id,
    skill: row.skill,
    proficiency: row.proficiency || undefined,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function mapCredentialRow(row: CredentialRow): CredentialItem {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    title: row.title,
    issuer: row.issuer,
    issuedAt: row.issued_at || undefined,
    credentialUrl: row.credential_url || undefined,
    visibility: row.visibility,
    createdAt: row.created_at,
  };
}

function mapExternalLinkRow(row: ExternalLinkRow): ExternalLinkItem {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    url: row.url,
    visibility: row.visibility,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

function mapProfileSectionRow(row: ProfileSectionRow): ProfileSectionItem {
  return {
    id: row.id,
    userId: row.user_id,
    sectionType: row.section_type,
    title: row.title || undefined,
    content: row.content || {},
    sortOrder: row.sort_order,
    visibility: row.visibility,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function calculateProfileCompleteness(
  profile: UserProfile | null,
  education: EducationItem[],
  experience: ExperienceItem[],
  skills: SkillItem[],
  credentials: CredentialItem[],
  externalLinks: ExternalLinkItem[]
): ProfileCompletenessResult {
  const criteria: CompletenessCriterion[] = [
    {
      id: 'display_name',
      label: 'Display Name',
      description: 'Your visible name on Aura Campus',
      weight: 15,
      isComplete: Boolean(profile?.displayName && profile.displayName.trim().length > 0),
      actionTab: 'personal',
      actionLabel: 'Set Display Name',
    },
    {
      id: 'handle',
      label: 'Public Handle',
      description: 'Your unique identifier (e.g. @yourname)',
      weight: 10,
      isComplete: Boolean(profile?.handle && profile.handle.trim().length >= 3),
      actionTab: 'personal',
      actionLabel: 'Choose Handle',
    },
    {
      id: 'headline',
      label: 'Professional Headline',
      description: 'A concise summary of what you do or study',
      weight: 10,
      isComplete: Boolean(profile?.headline && profile.headline.trim().length >= 5),
      actionTab: 'personal',
      actionLabel: 'Add Headline',
    },
    {
      id: 'bio',
      label: 'Biography',
      description: 'A short overview of your background and interests',
      weight: 15,
      isComplete: Boolean(profile?.bio && profile.bio.trim().length >= 20),
      actionTab: 'personal',
      actionLabel: 'Write Bio',
    },
    {
      id: 'education',
      label: 'Academic Background',
      description: 'Add your university, college, or school',
      weight: 15,
      isComplete: education.length > 0,
      actionTab: 'education',
      actionLabel: 'Add Education',
    },
    {
      id: 'skills',
      label: 'Core Skills',
      description: 'Add at least 3 skills or technical tools',
      weight: 15,
      isComplete: skills.length >= 3,
      actionTab: 'skills',
      actionLabel: 'Add Skills (min 3)',
    },
    {
      id: 'links',
      label: 'External Links',
      description: 'Add at least one link (GitHub, LinkedIn, or Website)',
      weight: 10,
      isComplete: externalLinks.length > 0,
      actionTab: 'links',
      actionLabel: 'Add External Link',
    },
    {
      id: 'experience_or_credentials',
      label: 'Experience or Credentials',
      description: 'Document an internship, project, certificate, or achievement',
      weight: 10,
      isComplete: experience.length > 0 || credentials.length > 0,
      actionTab: experience.length > 0 ? 'experience' : 'credentials',
      actionLabel: 'Add Experience or Credential',
    },
  ];

  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const completedWeight = criteria.reduce((sum, c) => sum + (c.isComplete ? c.weight : 0), 0);
  const score = Math.round((completedWeight / totalWeight) * 100);
  const missing = criteria.filter((c) => !c.isComplete);

  return {
    score,
    completedWeight,
    totalWeight,
    criteria,
    missingCount: missing.length,
    topSuggestions: missing.slice(0, 3),
  };
}

export const profileService = {
  /**
   * Fetches the current user's profile
   */
  async getProfile(userId: string): Promise<{ data: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Database is not configured.' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: data ? mapProfileRow(data as ProfileRow) : null, error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to fetch profile.' };
    }
  },

  /**
   * Updates fields on the user's profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<{ data: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Database is not configured.' };
    }

    try {
      const dbPayload: Partial<ProfileRow> = {};
      if (updates.displayName !== undefined) dbPayload.display_name = updates.displayName.trim();
      if (updates.handle !== undefined) dbPayload.handle = updates.handle.toLowerCase().trim();
      if (updates.headline !== undefined) dbPayload.headline = updates.headline?.trim() || null;
      if (updates.bio !== undefined) dbPayload.bio = updates.bio?.trim() || null;
      if (updates.institution !== undefined) dbPayload.institution = updates.institution?.trim() || null;
      if (updates.program !== undefined) dbPayload.program = updates.program?.trim() || null;
      if (updates.graduationYear !== undefined) dbPayload.graduation_year = updates.graduationYear;
      if (updates.locationLabel !== undefined) dbPayload.location_label = updates.locationLabel?.trim() || null;
      if (updates.avatarPath !== undefined) dbPayload.avatar_path = updates.avatarPath;
      if (updates.coverPath !== undefined) dbPayload.cover_path = updates.coverPath;
      if (updates.visibility !== undefined) dbPayload.visibility = updates.visibility;
      if (updates.discoverable !== undefined) dbPayload.discoverable = updates.discoverable;
      dbPayload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('profiles')
        .update(dbPayload)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('profiles_handle_key')) {
          return { data: null, error: 'This handle is already taken by another student.' };
        }
        return { data: null, error: error.message };
      }

      return { data: mapProfileRow(data as ProfileRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to update profile.' };
    }
  },

  /**
   * Checks if a public handle is available
   */
  async checkHandleAvailability(
    handle: string,
    currentUserId?: string
  ): Promise<{ available: boolean; error: string | null }> {
    const normalized = handle.toLowerCase().trim();

    if (RESERVED_HANDLES.has(normalized)) {
      return { available: false, error: 'This handle is reserved and cannot be registered.' };
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized) || normalized.length < 3 || normalized.length > 30) {
      return { available: false, error: 'Handle must be 3-30 lowercase characters with hyphens only.' };
    }

    if (!isSupabaseConfigured) {
      return { available: true, error: null };
    }

    try {
      let query = supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('handle', normalized);
      if (currentUserId) {
        query = query.neq('id', currentUserId);
      }

      const { count, error } = await query;
      if (error) {
        return { available: false, error: error.message };
      }

      return { available: count === 0, error: null };
    } catch (err) {
      return { available: false, error: (err as Error).message || 'Failed to check handle.' };
    }
  },

  /**
   * Education CRUD
   */
  async getEducation(userId: string): Promise<{ data: EducationItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return { data: [], error: error.message };
      return { data: (data as EducationRow[]).map(mapEducationRow), error: null };
    } catch (err) {
      return { data: [], error: (err as Error).message || 'Failed to fetch education.' };
    }
  },

  async createEducation(
    userId: string,
    input: Omit<EducationItem, 'id' | 'userId' | 'createdAt'>
  ): Promise<{ data: EducationItem | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('education')
        .insert({
          user_id: userId,
          institution: input.institution.trim(),
          qualification: input.qualification?.trim() || null,
          dates: input.dates?.trim() || null,
          description: input.description?.trim() || null,
          visibility: input.visibility || 'private',
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: mapEducationRow(data as EducationRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to create education.' };
    }
  },

  async updateEducation(
    userId: string,
    id: string,
    input: Partial<EducationItem>
  ): Promise<{ data: EducationItem | null; error: string | null }> {
    try {
      const payload: Partial<EducationRow> = {};
      if (input.institution !== undefined) payload.institution = input.institution.trim();
      if (input.qualification !== undefined) payload.qualification = input.qualification?.trim() || null;
      if (input.dates !== undefined) payload.dates = input.dates?.trim() || null;
      if (input.description !== undefined) payload.description = input.description?.trim() || null;
      if (input.visibility !== undefined) payload.visibility = input.visibility;

      const { data, error } = await supabase
        .from('education')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: mapEducationRow(data as EducationRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to update education.' };
    }
  },

  async deleteEducation(userId: string, id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: (err as Error).message || 'Failed to delete education.' };
    }
  },

  /**
   * Experience CRUD
   */
  async getExperience(userId: string): Promise<{ data: ExperienceItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('experience')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return { data: [], error: error.message };
      return { data: (data as ExperienceRow[]).map(mapExperienceRow), error: null };
    } catch (err) {
      return { data: [], error: (err as Error).message || 'Failed to fetch experience.' };
    }
  },

  async createExperience(
    userId: string,
    input: Omit<ExperienceItem, 'id' | 'userId' | 'createdAt'>
  ): Promise<{ data: ExperienceItem | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('experience')
        .insert({
          user_id: userId,
          organization: input.organization.trim(),
          role: input.role.trim(),
          dates: input.dates?.trim() || null,
          description: input.description?.trim() || null,
          visibility: input.visibility || 'private',
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: mapExperienceRow(data as ExperienceRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to create experience.' };
    }
  },

  async updateExperience(
    userId: string,
    id: string,
    input: Partial<ExperienceItem>
  ): Promise<{ data: ExperienceItem | null; error: string | null }> {
    try {
      const payload: Partial<ExperienceRow> = {};
      if (input.organization !== undefined) payload.organization = input.organization.trim();
      if (input.role !== undefined) payload.role = input.role.trim();
      if (input.dates !== undefined) payload.dates = input.dates?.trim() || null;
      if (input.description !== undefined) payload.description = input.description?.trim() || null;
      if (input.visibility !== undefined) payload.visibility = input.visibility;

      const { data, error } = await supabase
        .from('experience')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: mapExperienceRow(data as ExperienceRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to update experience.' };
    }
  },

  async deleteExperience(userId: string, id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('experience')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: (err as Error).message || 'Failed to delete experience.' };
    }
  },

  /**
   * Skills CRUD
   */
  async getSkills(userId: string): Promise<{ data: SkillItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profile_skills')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) return { data: [], error: error.message };
      return { data: (data as SkillRow[]).map(mapSkillRow), error: null };
    } catch (err) {
      return { data: [], error: (err as Error).message || 'Failed to fetch skills.' };
    }
  },

  async createSkill(
    userId: string,
    input: Omit<SkillItem, 'id' | 'userId' | 'createdAt'>
  ): Promise<{ data: SkillItem | null; error: string | null }> {
    try {
      const normalizedSkill = input.skill.trim();
      // Check for duplicate skill within user's existing skills
      const { data: existing } = await supabase
        .from('profile_skills')
        .select('id')
        .eq('user_id', userId)
        .ilike('skill', normalizedSkill)
        .maybeSingle();

      if (existing) {
        return { data: null, error: 'You have already added this skill.' };
      }

      const { data, error } = await supabase
        .from('profile_skills')
        .insert({
          user_id: userId,
          skill: normalizedSkill,
          proficiency: input.proficiency?.trim() || null,
          sort_order: input.sortOrder || 0,
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: mapSkillRow(data as SkillRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to add skill.' };
    }
  },

  async deleteSkill(userId: string, id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('profile_skills')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: (err as Error).message || 'Failed to delete skill.' };
    }
  },

  /**
   * Credentials CRUD
   */
  async getCredentials(userId: string): Promise<{ data: CredentialItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return { data: [], error: error.message };
      return { data: (data as CredentialRow[]).map(mapCredentialRow), error: null };
    } catch (err) {
      return { data: [], error: (err as Error).message || 'Failed to fetch credentials.' };
    }
  },

  async createCredential(
    userId: string,
    input: Omit<CredentialItem, 'id' | 'userId' | 'createdAt'>
  ): Promise<{ data: CredentialItem | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('credentials')
        .insert({
          user_id: userId,
          kind: input.kind.trim(),
          title: input.title.trim(),
          issuer: input.issuer.trim(),
          issued_at: input.issuedAt?.trim() || null,
          credential_url: input.credentialUrl?.trim() || null,
          visibility: input.visibility || 'private',
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: mapCredentialRow(data as CredentialRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to add credential.' };
    }
  },

  async updateCredential(
    userId: string,
    id: string,
    input: Partial<CredentialItem>
  ): Promise<{ data: CredentialItem | null; error: string | null }> {
    try {
      const payload: Partial<CredentialRow> = {};
      if (input.kind !== undefined) payload.kind = input.kind.trim();
      if (input.title !== undefined) payload.title = input.title.trim();
      if (input.issuer !== undefined) payload.issuer = input.issuer.trim();
      if (input.issuedAt !== undefined) payload.issued_at = input.issuedAt?.trim() || null;
      if (input.credentialUrl !== undefined) payload.credential_url = input.credentialUrl?.trim() || null;
      if (input.visibility !== undefined) payload.visibility = input.visibility;

      const { data, error } = await supabase
        .from('credentials')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: mapCredentialRow(data as CredentialRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to update credential.' };
    }
  },

  async deleteCredential(userId: string, id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: (err as Error).message || 'Failed to delete credential.' };
    }
  },

  /**
   * External Links CRUD
   */
  async getExternalLinks(userId: string): Promise<{ data: ExternalLinkItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('external_links')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) return { data: [], error: error.message };
      return { data: (data as ExternalLinkRow[]).map(mapExternalLinkRow), error: null };
    } catch (err) {
      return { data: [], error: (err as Error).message || 'Failed to fetch external links.' };
    }
  },

  async createExternalLink(
    userId: string,
    input: Omit<ExternalLinkItem, 'id' | 'userId' | 'createdAt'>
  ): Promise<{ data: ExternalLinkItem | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('external_links')
        .insert({
          user_id: userId,
          label: input.label.trim(),
          url: input.url.trim(),
          visibility: input.visibility || 'private',
          sort_order: input.sortOrder || 0,
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: mapExternalLinkRow(data as ExternalLinkRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to create external link.' };
    }
  },

  async updateExternalLink(
    userId: string,
    id: string,
    input: Partial<ExternalLinkItem>
  ): Promise<{ data: ExternalLinkItem | null; error: string | null }> {
    try {
      const payload: Partial<ExternalLinkRow> = {};
      if (input.label !== undefined) payload.label = input.label.trim();
      if (input.url !== undefined) payload.url = input.url.trim();
      if (input.visibility !== undefined) payload.visibility = input.visibility;
      if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;

      const { data, error } = await supabase
        .from('external_links')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: mapExternalLinkRow(data as ExternalLinkRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to update external link.' };
    }
  },

  async deleteExternalLink(userId: string, id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('external_links')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err) {
      return { success: false, error: (err as Error).message || 'Failed to delete external link.' };
    }
  },

  /**
   * Profile Sections Management
   */
  async getProfileSections(userId: string): Promise<{ data: ProfileSectionItem[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profile_sections')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) return { data: [], error: error.message };
      return { data: (data as ProfileSectionRow[]).map(mapProfileSectionRow), error: null };
    } catch (err) {
      return { data: [], error: (err as Error).message || 'Failed to fetch sections.' };
    }
  },

  async updateProfileSection(
    userId: string,
    id: string,
    input: Partial<ProfileSectionItem>
  ): Promise<{ data: ProfileSectionItem | null; error: string | null }> {
    try {
      const payload: Partial<ProfileSectionRow> = {};
      if (input.title !== undefined) payload.title = input.title?.trim() || null;
      if (input.sortOrder !== undefined) payload.sort_order = input.sortOrder;
      if (input.visibility !== undefined) payload.visibility = input.visibility;
      if (input.content !== undefined) payload.content = input.content;
      payload.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('profile_sections')
        .update(payload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data: mapProfileSectionRow(data as ProfileSectionRow), error: null };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to update section.' };
    }
  },

  async upsertProfileSections(
    userId: string,
    sections: ProfileSectionItem[]
  ): Promise<{ data: ProfileSectionItem[]; error: string | null }> {
    try {
      const { data: existingRows } = await supabase
        .from('profile_sections')
        .select('id, section_type')
        .eq('user_id', userId);

      const existingMap = new Map<string, string>();
      if (existingRows) {
        existingRows.forEach((row: { id: string; section_type: string }) => {
          existingMap.set(row.section_type, row.id);
        });
      }

      const operations = sections.map(async (sec, idx) => {
        const existingId = (!sec.id.startsWith('default-') && sec.id) || existingMap.get(sec.sectionType);
        const payload = {
          user_id: userId,
          section_type: sec.sectionType,
          title: sec.title?.trim() || null,
          content: sec.content || {},
          sort_order: sec.sortOrder !== undefined ? sec.sortOrder : idx,
          visibility: sec.visibility || 'public',
          updated_at: new Date().toISOString(),
        };

        if (existingId) {
          return supabase
            .from('profile_sections')
            .update(payload)
            .eq('id', existingId)
            .eq('user_id', userId);
        } else {
          return supabase
            .from('profile_sections')
            .insert(payload);
        }
      });

      await Promise.all(operations);
      return await this.getProfileSections(userId);
    } catch (err) {
      return { data: [], error: (err as Error).message || 'Failed to save sections.' };
    }
  },


  /**
   * Full aggregate loader
   */
  async getFullProfile(userId: string): Promise<{ data: StudentProfileAggregate | null; error: string | null }> {
    try {
      const [
        profileRes,
        educationRes,
        experienceRes,
        skillsRes,
        credentialsRes,
        linksRes,
        sectionsRes,
      ] = await Promise.all([
        this.getProfile(userId),
        this.getEducation(userId),
        this.getExperience(userId),
        this.getSkills(userId),
        this.getCredentials(userId),
        this.getExternalLinks(userId),
        this.getProfileSections(userId),
      ]);

      if (profileRes.error) {
        return { data: null, error: profileRes.error };
      }

      const completeness = calculateProfileCompleteness(
        profileRes.data,
        educationRes.data,
        experienceRes.data,
        skillsRes.data,
        credentialsRes.data,
        linksRes.data
      );

      return {
        data: {
          profile: profileRes.data,
          education: educationRes.data,
          experience: experienceRes.data,
          skills: skillsRes.data,
          credentials: credentialsRes.data,
          externalLinks: linksRes.data,
          sections: sectionsRes.data,
          completeness,
        },
        error: null,
      };
    } catch (err) {
      return { data: null, error: (err as Error).message || 'Failed to load profile data.' };
    }
  },

  /**
   * Validates avatar file size and authentic image header magic bytes
   */
  async validateAvatarFile(
    file: File
  ): Promise<{ valid: boolean; error: string | null; detectedType?: string }> {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'Avatar image must be smaller than 5MB.' };
    }

    if (file.size === 0) {
      return { valid: false, error: 'Selected file is empty.' };
    }

    try {
      let bytes: Uint8Array;
      if (typeof file.arrayBuffer === 'function') {
        const buffer = await file.arrayBuffer();
        bytes = new Uint8Array(buffer.slice(0, 12));
      } else {
        bytes = await new Promise<Uint8Array>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
              resolve(new Uint8Array(reader.result.slice(0, 12)));
            } else {
              reject(new Error('Failed to read image buffer'));
            }
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsArrayBuffer(file);
        });
      }

      // Check JPEG (FF D8 FF)
      if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
        return { valid: true, error: null, detectedType: 'image/jpeg' };
      }

      // Check PNG (89 50 4E 47 0D 0A 1A 0A)
      if (
        bytes[0] === 0x89 &&
        bytes[1] === 0x50 &&
        bytes[2] === 0x4e &&
        bytes[3] === 0x47
      ) {
        return { valid: true, error: null, detectedType: 'image/png' };
      }

      // Check WebP (RIFF .... WEBP)
      if (
        bytes[0] === 0x52 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x46 &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
      ) {
        return { valid: true, error: null, detectedType: 'image/webp' };
      }

      // Check GIF (47 49 46 38)
      if (
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38
      ) {
        return { valid: true, error: null, detectedType: 'image/gif' };
      }

      return {
        valid: false,
        error: 'Invalid file format. Please upload an authentic JPEG, PNG, or WebP image.',
      };
    } catch {
      return {
        valid: false,
        error: 'Unable to read image header. Please choose a valid image file.',
      };
    }
  },

  /**
   * Resolves the displayable URL for an avatar path
   */
  getAvatarUrl(avatarPath?: string | null): string | null {
    if (!avatarPath) return null;

    // Direct web or data URI
    if (
      avatarPath.startsWith('http://') ||
      avatarPath.startsWith('https://') ||
      avatarPath.startsWith('data:') ||
      avatarPath.startsWith('blob:')
    ) {
      return avatarPath;
    }

    if (!isSupabaseConfigured) {
      return null;
    }

    try {
      const { data } = supabase.storage.from('avatars').getPublicUrl(avatarPath);
      return data?.publicUrl || null;
    } catch {
      return null;
    }
  },

  /**
   * Uploads a cropped avatar image to Supabase Storage and updates the student profile
   */
  async uploadAvatar(
    userId: string,
    file: Blob | File
  ): Promise<{ data: { path: string; publicUrl: string } | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Database and storage are not configured.' };
    }

    try {
      const fileExt = file.type === 'image/png' ? 'png' : 'webp';
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type || 'image/webp',
        });

      if (uploadError) {
        if (
          uploadError.message.includes('Bucket not found') ||
          uploadError.message.includes('not found') ||
          uploadError.message.includes('404')
        ) {
          return {
            data: null,
            error:
              "The Supabase Storage bucket 'avatars' has not been provisioned yet. Run the avatar bucket setup SQL in your Supabase SQL Editor.",
          };
        }
        return { data: null, error: uploadError.message };
      }

      const publicUrl = this.getAvatarUrl(filePath) || '';

      // Update profiles record
      const updateRes = await this.updateProfile(userId, { avatarPath: filePath });
      if (updateRes.error) {
        return { data: null, error: updateRes.error };
      }

      return { data: { path: filePath, publicUrl }, error: null };
    } catch (err) {
      return {
        data: null,
        error: (err as Error).message || 'Failed to upload avatar image.',
      };
    }
  },

  /**
   * Removes an existing avatar from storage and updates the student profile
   */
  async deleteAvatar(
    userId: string,
    currentPath?: string | null
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Database and storage are not configured.' };
    }

    try {
      // Remove from storage if it's a storage path
      if (
        currentPath &&
        !currentPath.startsWith('http') &&
        !currentPath.startsWith('data:') &&
        !currentPath.startsWith('blob:')
      ) {
        await supabase.storage.from('avatars').remove([currentPath]);
      }

      // Clear profile avatar_path
      const updateRes = await this.updateProfile(userId, { avatarPath: null });
      if (updateRes.error) {
        return { success: false, error: updateRes.error };
      }

      return { success: true, error: null };
    } catch (err) {
      return {
        success: false,
        error: (err as Error).message || 'Failed to remove avatar image.',
      };
    }
  },
};
