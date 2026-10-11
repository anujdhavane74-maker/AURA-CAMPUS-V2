import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  User,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Link as LinkIcon,
  Layers,
  Eye,
  Shield,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import {
  UserProfile,
  EducationItem,
  ExperienceItem,
  SkillItem,
  CredentialItem,
  ExternalLinkItem,
  ProfileSectionItem,
  ProfileCompletenessResult,
  Project,
} from '../../types';
import { profileService, calculateProfileCompleteness } from '../../services/profile';
import { portfolioService } from '../../services/portfolio';
import { ProfileIdentityHeader } from '../../components/profile/ProfileIdentityHeader';
import { ProfileCompletenessCard } from '../../components/profile/ProfileCompletenessCard';
import { PersonalInfoTab } from '../../components/profile/PersonalInfoTab';
import { EducationManagerTab } from '../../components/profile/EducationManagerTab';
import { ExperienceManagerTab } from '../../components/profile/ExperienceManagerTab';
import { SkillsManagerTab } from '../../components/profile/SkillsManagerTab';
import { CredentialsManagerTab } from '../../components/profile/CredentialsManagerTab';
import { ExternalLinksManagerTab } from '../../components/profile/ExternalLinksManagerTab';
import { ProfileSectionsOrganizerTab } from '../../components/profile/ProfileSectionsOrganizerTab';
import { ProfilePreviewTab } from '../../components/profile/ProfilePreviewTab';
import { PrivacyVisibilityTab } from '../../components/profile/PrivacyVisibilityTab';
import { ProfileShareModal } from '../../components/profile/ProfileShareModal';

type ProfileTab =
  | 'overview'
  | 'personal'
  | 'education'
  | 'experience'
  | 'skills'
  | 'credentials'
  | 'links'
  | 'sections'
  | 'preview'
  | 'privacy';

interface TabConfig {
  id: ProfileTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const ProfileEditorPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab State (synced with URL ?tab=...)
  const initialTab = (searchParams.get('tab') as ProfileTab) || 'overview';
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  // Profile Data State
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLinkItem[]>([]);
  const [sections, setSections] = useState<ProfileSectionItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Dirty State Tracking across all editor tabs
  const [personalDirty, setPersonalDirty] = useState(false);
  const [educationDirty, setEducationDirty] = useState(false);
  const [experienceDirty, setExperienceDirty] = useState(false);
  const [skillsDirty, setSkillsDirty] = useState(false);
  const [credentialsDirty, setCredentialsDirty] = useState(false);
  const [linksDirty, setLinksDirty] = useState(false);

  const isFormDirty =
    personalDirty || educationDirty || experienceDirty || skillsDirty || credentialsDirty || linksDirty;

  // Share Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Sync active tab with URL query parameter
  const handleTabChange = useCallback(
    (newTab: string) => {
      setActiveTab(newTab as ProfileTab);
      setSearchParams({ tab: newTab }, { replace: true });
    },
    [setSearchParams]
  );

  // Warn on browser tab close when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

  // Load complete profile aggregate
  const loadProfileData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setFetchError(null);

    const [profileRes, projectsRes] = await Promise.all([
      profileService.getFullProfile(user.id),
      portfolioService.fetchUserProjects(user.id),
    ]);

    setLoading(false);

    if (profileRes.error || !profileRes.data) {
      setFetchError(profileRes.error || 'Failed to load profile from Supabase.');
    } else {
      setProfile(profileRes.data.profile);
      setEducation(profileRes.data.education);
      setExperience(profileRes.data.experience);
      setSkills(profileRes.data.skills);
      setCredentials(profileRes.data.credentials);
      setExternalLinks(profileRes.data.externalLinks);
      setSections(profileRes.data.sections);
      setProjects(projectsRes.data || []);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  // Dynamic Completeness Calculation
  const completeness: ProfileCompletenessResult = calculateProfileCompleteness(
    profile,
    education,
    experience,
    skills,
    credentials,
    externalLinks
  );

  // Navigation tab configurations
  const TABS: TabConfig[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap, badge: education.length },
    { id: 'experience', label: 'Experience', icon: Briefcase, badge: experience.length },
    { id: 'skills', label: 'Skills', icon: Code2, badge: skills.length },
    { id: 'credentials', label: 'Credentials', icon: Award, badge: credentials.length },
    { id: 'links', label: 'External Links', icon: LinkIcon, badge: externalLinks.length },
    { id: 'sections', label: 'Sections', icon: Layers },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center space-y-4 shadow-xs">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold text-slate-600">
          Loading student identity &amp; verified profile data...
        </p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-center space-y-4 shadow-xs">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900">Unable to Load Student Profile</h2>
          <p className="text-xs text-rose-700 max-w-md mx-auto">{fetchError}</p>
        </div>
        <button
          type="button"
          onClick={loadProfileData}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
        >
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Profile Identity Header */}
      <ProfileIdentityHeader
        profile={profile}
        completeness={completeness}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onShareClick={() => setIsShareModalOpen(true)}
      />

      {/* 2. Workspace Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-2xs overflow-x-auto">
        <nav className="flex items-center gap-1 min-w-max" aria-label="Profile workspace tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Unsaved Drafts Notification Banner */}
      {isFormDirty && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4.5 py-3 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="font-semibold shrink-0">Unsaved edits detected:</span>
            <span className="text-amber-800 truncate">
              Your edits are safely retained in memory across tabs. Remember to click &quot;Save Changes&quot; to persist to Supabase.
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full shrink-0">
            Draft In Progress
          </span>
        </div>
      )}

      {/* 3. Active Workspace Tab Content */}
      <div className="transition-opacity duration-200">
        <div role="tabpanel" hidden={activeTab !== 'overview'} className={activeTab === 'overview' ? 'block' : 'hidden'}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ProfileCompletenessCard
                completeness={completeness}
                onNavigateTab={handleTabChange}
                onLaunchOnboarding={() => navigate('/app/onboarding')}
              />

              {/* Quick Snapshots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Education Summary */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 text-teal-600" />
                      <span>Education ({education.length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleTabChange('education')}
                      className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
                    >
                      Manage
                    </button>
                  </div>
                  {education.length === 0 ? (
                    <p className="text-xs text-slate-400">No education entries added yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {education.slice(0, 2).map((e) => (
                        <div key={e.id} className="text-xs border-l-2 border-teal-500 pl-2.5 py-0.5">
                          <p className="font-bold text-slate-900">{e.institution}</p>
                          <p className="text-slate-500">{e.qualification || e.dates}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skills Summary */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Code2 className="h-4 w-4 text-teal-600" />
                      <span>Skills ({skills.length})</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleTabChange('skills')}
                      className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
                    >
                      Manage
                    </button>
                  </div>
                  {skills.length === 0 ? (
                    <p className="text-xs text-slate-400">No skills added yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.slice(0, 6).map((s) => (
                        <span
                          key={s.id}
                          className="rounded-lg bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800 border border-teal-100"
                        >
                          {s.skill}
                        </span>
                      ))}
                      {skills.length > 6 && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          +{skills.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Preview Callout */}
              <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                    <span>Check Public Visitor Perspective</span>
                  </p>
                  <p className="text-xs text-teal-800">
                    Verify how your profile appears to recruiters and visitors before publishing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('preview')}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-2xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Open Preview</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div role="tabpanel" hidden={activeTab !== 'personal'} className={activeTab === 'personal' ? 'block' : 'hidden'}>
          <PersonalInfoTab
            profile={profile}
            onProfileUpdated={(updated) => {
              setProfile(updated);
              setPersonalDirty(false);
            }}
            onDirtyChange={setPersonalDirty}
          />
        </div>

        <div role="tabpanel" hidden={activeTab !== 'education'} className={activeTab === 'education' ? 'block' : 'hidden'}>
          {user?.id && (
            <EducationManagerTab
              userId={user.id}
              items={education}
              onItemsChanged={setEducation}
              onDirtyChange={setEducationDirty}
            />
          )}
        </div>

        <div role="tabpanel" hidden={activeTab !== 'experience'} className={activeTab === 'experience' ? 'block' : 'hidden'}>
          {user?.id && (
            <ExperienceManagerTab
              userId={user.id}
              items={experience}
              onItemsChanged={setExperience}
              onDirtyChange={setExperienceDirty}
            />
          )}
        </div>

        <div role="tabpanel" hidden={activeTab !== 'skills'} className={activeTab === 'skills' ? 'block' : 'hidden'}>
          {user?.id && (
            <SkillsManagerTab
              userId={user.id}
              items={skills}
              onItemsChanged={setSkills}
              onDirtyChange={setSkillsDirty}
            />
          )}
        </div>

        <div role="tabpanel" hidden={activeTab !== 'credentials'} className={activeTab === 'credentials' ? 'block' : 'hidden'}>
          {user?.id && (
            <CredentialsManagerTab
              userId={user.id}
              items={credentials}
              onItemsChanged={setCredentials}
              onDirtyChange={setCredentialsDirty}
            />
          )}
        </div>

        <div role="tabpanel" hidden={activeTab !== 'links'} className={activeTab === 'links' ? 'block' : 'hidden'}>
          {user?.id && (
            <ExternalLinksManagerTab
              userId={user.id}
              items={externalLinks}
              onItemsChanged={setExternalLinks}
              onDirtyChange={setLinksDirty}
            />
          )}
        </div>

        <div role="tabpanel" hidden={activeTab !== 'sections'} className={activeTab === 'sections' ? 'block' : 'hidden'}>
          {user?.id && (
            <ProfileSectionsOrganizerTab
              userId={user.id}
              sections={sections}
              onSectionsChanged={setSections}
            />
          )}
        </div>

        <div role="tabpanel" hidden={activeTab !== 'preview'} className={activeTab === 'preview' ? 'block' : 'hidden'}>
          <ProfilePreviewTab
            profile={profile}
            education={education}
            experience={experience}
            skills={skills}
            credentials={credentials}
            externalLinks={externalLinks}
            sections={sections}
            projects={projects}
            onNavigateTab={handleTabChange}
          />
        </div>

        <div role="tabpanel" hidden={activeTab !== 'privacy'} className={activeTab === 'privacy' ? 'block' : 'hidden'}>
          <PrivacyVisibilityTab
            profile={profile}
            onProfileUpdated={(updated) => setProfile(updated)}
          />
        </div>
      </div>

      {/* 4. Profile Share Modal */}
      <ProfileShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        onNavigatePrivacy={() => handleTabChange('privacy')}
      />
    </div>
  );
};
