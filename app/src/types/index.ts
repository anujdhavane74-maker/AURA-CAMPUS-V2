/**
 * Aura Campus V2 — Core TypeScript Definitions
 */

// Visibility & Access Levels
export type ProfileVisibility = 'private' | 'public';
export type PortfolioVisibility = 'private' | 'unlisted_link' | 'public';
export type ProjectVisibility = 'private' | 'unlisted_link' | 'public';

// Application-wide Color Palettes
export type AppPaletteId = 'teal' | 'ocean' | 'indigo' | 'emerald' | 'coral';

export interface AppPalette {
  id: AppPaletteId;
  name: string;
  description: string;
  primaryHex: string;
  primaryLightHex: string;
  primaryDarkHex: string;
  accentClass: string;
  ringClass: string;
  bgLightClass: string;
  badgeClass: string;
}

// Portfolio Presentation Themes (12 themes)
export type PortfolioThemeId =
  | 'studio'
  | 'noir'
  | 'canvas'
  | 'midnight'
  | 'brutalist'
  | 'sunset'
  | 'minimal'
  | 'sticker'
  | 'resume'
  | 'ocean'
  | 'editorial'
  | 'aurora';

export interface PortfolioTheme {
  id: PortfolioThemeId;
  name: string;
  tagline: string;
  fontFamily: string;
  containerClass: string;
  cardClass: string;
  headerClass: string;
  accentTextClass: string;
  badgeClass: string;
  buttonClass: string;
}

// User Profile Entity
export interface UserProfile {
  id: string;
  handle: string;
  displayName: string;
  headline?: string;
  bio?: string;
  avatarPath?: string | null;
  coverPath?: string;
  institution?: string;
  program?: string;
  graduationYear?: number;
  locationLabel?: string;
  visibility: ProfileVisibility;
  discoverable: boolean;
  createdAt: string;
  updatedAt: string;
}

// Project Entity
export type ProjectStatus = 'planning' | 'in_progress' | 'completed' | 'archived';

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  summary?: string;
  problem?: string;
  approach?: string;
  outcome?: string;
  technologies: string[];
  status: ProjectStatus;
  repositoryUrl?: string;
  demoUrl?: string;
  coverPath?: string;
  visibility: ProjectVisibility;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Portfolio Entity
export interface Portfolio {
  id: string;
  userId: string;
  slug: string;
  title: string;
  theme: PortfolioThemeId;
  accent: AppPaletteId;
  data?: Record<string, unknown>;
  visibility: PortfolioVisibility;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Education Entry Entity
export interface EducationItem {
  id: string;
  userId: string;
  institution: string;
  qualification?: string;
  dates?: string;
  description?: string;
  visibility: ProfileVisibility;
  createdAt: string;
}

// Experience Entry Entity
export interface ExperienceItem {
  id: string;
  userId: string;
  organization: string;
  role: string;
  dates?: string;
  description?: string;
  visibility: ProfileVisibility;
  createdAt: string;
}

// Profile Skill Entity
export interface SkillItem {
  id: string;
  userId: string;
  skill: string;
  proficiency?: string;
  sortOrder: number;
  createdAt: string;
}

// Credential / Achievement Entity
export interface CredentialItem {
  id: string;
  userId: string;
  kind: string;
  title: string;
  issuer: string;
  issuedAt?: string;
  credentialUrl?: string;
  visibility: ProfileVisibility;
  createdAt: string;
}

// External Link Entity
export interface ExternalLinkItem {
  id: string;
  userId: string;
  label: string;
  url: string;
  visibility: ProfileVisibility;
  sortOrder: number;
  createdAt: string;
}

// Profile Section Configuration Entity
export interface ProfileSectionItem {
  id: string;
  userId: string;
  sectionType: string;
  title?: string;
  content: Record<string, unknown>;
  sortOrder: number;
  visibility: ProfileVisibility;
  createdAt: string;
  updatedAt: string;
}

// Profile Completeness Criterion
export interface CompletenessCriterion {
  id: string;
  label: string;
  description: string;
  weight: number;
  isComplete: boolean;
  actionTab: string;
  actionLabel: string;
}

// Overall Completeness Evaluation
export interface ProfileCompletenessResult {
  score: number;
  completedWeight: number;
  totalWeight: number;
  criteria: CompletenessCriterion[];
  missingCount: number;
  topSuggestions: CompletenessCriterion[];
}

// Full Profile Aggregate Data
export interface StudentProfileAggregate {
  profile: UserProfile | null;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillItem[];
  credentials: CredentialItem[];
  externalLinks: ExternalLinkItem[];
  sections: ProfileSectionItem[];
  completeness: ProfileCompletenessResult;
}

// Share Link Item
export interface ShareLinkItem {
  id: string;
  ownerId: string;
  resourceType: 'portfolio' | 'project';
  resourceId: string;
  tokenHash: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
}

export interface CreateShareLinkInput {
  resourceType: 'portfolio' | 'project';
  resourceId: string;
  expiresInDays?: number | null;
}

// Explore Directory Profile Item
export interface ExploreProfileItem {
  handle: string;
  displayName: string;
  headline?: string | null;
  avatarPath?: string | null;
  institution?: string | null;
  program?: string | null;
  graduationYear?: number | null;
  updatedAt: string;
}


