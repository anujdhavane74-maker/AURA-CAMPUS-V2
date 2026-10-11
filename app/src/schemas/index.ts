import { z } from 'zod';

/**
 * Reserved handles that cannot be registered
 */
export const RESERVED_HANDLES = new Set([
  'admin',
  'api',
  'app',
  'auth',
  'aura',
  'campus',
  'dashboard',
  'discovery',
  'explore',
  'help',
  'privacy',
  'settings',
  'share',
  'support',
  'terms',
  'u',
  'p',
  's',
]);

/**
 * Handle Validation Schema
 * Normalized lowercase, 3-30 chars, alphanumeric and hyphens, no consecutive hyphens
 */
export const handleSchema = z
  .string()
  .min(3, 'Handle must be at least 3 characters')
  .max(30, 'Handle cannot exceed 30 characters')
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Handle can only contain lowercase letters, numbers, and single hyphens'
  )
  .refine((val) => !RESERVED_HANDLES.has(val.toLowerCase()), {
    message: 'This handle is reserved and cannot be claimed',
  });

/**
 * Profile Visibility Schema
 */
export const profileVisibilitySchema = z.enum(['private', 'public']);

/**
 * Resource (Portfolio/Project) Visibility Schema
 */
export const resourceVisibilitySchema = z.enum(['private', 'unlisted_link', 'public']);

/**
 * Profile Edit Schema
 */
export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, 'Display name is required')
    .max(80, 'Display name cannot exceed 80 characters'),
  handle: handleSchema,
  headline: z.string().trim().max(120, 'Headline cannot exceed 120 characters').optional(),
  bio: z.string().trim().max(1000, 'Bio cannot exceed 1000 characters').optional(),
  institution: z.string().trim().max(150, 'Institution cannot exceed 150 characters').optional(),
  program: z.string().trim().max(150, 'Program cannot exceed 150 characters').optional(),
  graduationYear: z
    .number()
    .int()
    .min(1970)
    .max(2040)
    .optional()
    .nullable(),
  locationLabel: z.string().trim().max(100, 'Location cannot exceed 100 characters').optional(),
  visibility: profileVisibilitySchema.default('private'),
  discoverable: z.boolean().default(false),
});

/**
 * Project Creation / Update Schema
 */
export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Project title is required')
    .max(120, 'Title cannot exceed 120 characters'),
  summary: z.string().trim().max(300, 'Summary cannot exceed 300 characters').optional(),
  problem: z.string().trim().max(2000, 'Problem description cannot exceed 2000 characters').optional(),
  approach: z.string().trim().max(2000, 'Approach description cannot exceed 2000 characters').optional(),
  outcome: z.string().trim().max(2000, 'Outcome description cannot exceed 2000 characters').optional(),
  technologies: z.array(z.string().trim().max(40)).max(25, 'Maximum 25 technologies allowed'),
  status: z.enum(['planning', 'in_progress', 'completed', 'archived']).default('in_progress'),
  repositoryUrl: z
    .string()
    .url('Must be a valid URL')
    .startsWith('https://', 'Secure https URL required')
    .optional()
    .or(z.literal('')),
  demoUrl: z
    .string()
    .url('Must be a valid URL')
    .startsWith('https://', 'Secure https URL required')
    .optional()
    .or(z.literal('')),
  visibility: resourceVisibilitySchema.default('private'),
});

/**
 * Safe URL validation helper preventing javascript:, data:, and vbscript: schemes
 */
export const safeUrlSchema = z
  .string()
  .trim()
  .url('Must be a valid URL')
  .refine(
    (val) => {
      const lower = val.toLowerCase();
      return lower.startsWith('http://') || lower.startsWith('https://');
    },
    { message: 'Only secure web URLs (http:// or https://) are allowed' }
  );

/**
 * Education Entry Schema
 */
export const educationSchema = z.object({
  institution: z
    .string()
    .trim()
    .min(1, 'Institution name is required')
    .max(200, 'Institution name cannot exceed 200 characters'),
  qualification: z.string().trim().max(150, 'Qualification cannot exceed 150 characters').optional().or(z.literal('')),
  dates: z.string().trim().max(100, 'Dates description cannot exceed 100 characters').optional().or(z.literal('')),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional().or(z.literal('')),
  visibility: profileVisibilitySchema.default('private'),
});

/**
 * Experience Entry Schema
 */
export const experienceSchema = z.object({
  organization: z
    .string()
    .trim()
    .min(1, 'Organization or company name is required')
    .max(200, 'Organization name cannot exceed 200 characters'),
  role: z
    .string()
    .trim()
    .min(1, 'Role or title is required')
    .max(150, 'Role cannot exceed 150 characters'),
  dates: z.string().trim().max(100, 'Dates description cannot exceed 100 characters').optional().or(z.literal('')),
  description: z.string().trim().max(1500, 'Description cannot exceed 1500 characters').optional().or(z.literal('')),
  visibility: profileVisibilitySchema.default('private'),
});

/**
 * Skill Entry Schema
 */
export const skillSchema = z.object({
  skill: z
    .string()
    .trim()
    .min(1, 'Skill name is required')
    .max(60, 'Skill name cannot exceed 60 characters'),
  proficiency: z
    .string()
    .trim()
    .max(40, 'Proficiency label cannot exceed 40 characters')
    .optional()
    .or(z.literal('')),
  sortOrder: z.number().int().default(0),
});

/**
 * Credential / Achievement Schema
 */
export const credentialSchema = z.object({
  kind: z
    .string()
    .trim()
    .min(1, 'Kind of credential is required')
    .max(50, 'Kind cannot exceed 50 characters'),
  title: z
    .string()
    .trim()
    .min(1, 'Credential title is required')
    .max(150, 'Title cannot exceed 150 characters'),
  issuer: z
    .string()
    .trim()
    .min(1, 'Issuing organization is required')
    .max(150, 'Issuer cannot exceed 150 characters'),
  issuedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .optional()
    .or(z.literal('')),
  credentialUrl: safeUrlSchema.optional().or(z.literal('')),
  visibility: profileVisibilitySchema.default('private'),
});

/**
 * External Link Schema
 */
export const externalLinkSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Link label is required')
    .max(80, 'Label cannot exceed 80 characters'),
  url: safeUrlSchema,
  visibility: profileVisibilitySchema.default('private'),
  sortOrder: z.number().int().default(0),
});

/**
 * Profile Section Schema
 */
export const profileSectionSchema = z.object({
  sectionType: z
    .string()
    .trim()
    .min(1, 'Section type is required')
    .max(50, 'Section type cannot exceed 50 characters'),
  title: z.string().trim().max(100, 'Title cannot exceed 100 characters').optional().or(z.literal('')),
  content: z.record(z.unknown()).default({}),
  sortOrder: z.number().int().default(0),
  visibility: profileVisibilitySchema.default('private'),
});

