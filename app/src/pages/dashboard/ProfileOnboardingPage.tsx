import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  X,
  Compass,
  User,
  GraduationCap,
  Code2,
  Briefcase,
  Link as LinkIcon,
  Shield,
  Eye,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Globe,
  Info,
} from 'lucide-react';
import {
  UserProfile,
  EducationItem,
  ExperienceItem,
  SkillItem,
  CredentialItem,
  ExternalLinkItem,
  ProfileSectionItem,
  ProfileVisibility,
} from '../../types';
import { profileService, calculateProfileCompleteness } from '../../services/profile';
import { profileSchema, RESERVED_HANDLES } from '../../schemas';
import { AvatarUploader } from '../../components/profile/AvatarUploader';
import { CircularProgress } from '../../components/profile/CircularProgress';
import { ProfilePreviewTab } from '../../components/profile/ProfilePreviewTab';

const POPULAR_SKILLS = [
  'TypeScript',
  'React',
  'Python',
  'SQL',
  'Node.js',
  'Tailwind CSS',
  'UI/UX Design',
  'Data Structures',
  'Git',
  'Machine Learning',
  'REST APIs',
  'Problem Solving',
];

interface StepConfig {
  number: number;
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  optional?: boolean;
}

const STEPS: StepConfig[] = [
  {
    number: 1,
    id: 'welcome',
    title: 'Welcome',
    subtitle: 'Why student identity matters',
    icon: Sparkles,
  },
  {
    number: 2,
    id: 'personal',
    title: 'Personal Info',
    subtitle: 'Display name, handle & avatar',
    icon: User,
  },
  {
    number: 3,
    id: 'education',
    title: 'Education',
    subtitle: 'University & program details',
    icon: GraduationCap,
  },
  {
    number: 4,
    id: 'skills',
    title: 'Skills',
    subtitle: 'Core technical & design abilities',
    icon: Code2,
  },
  {
    number: 5,
    id: 'experience',
    title: 'Experience & Work',
    subtitle: 'Internships, projects & achievements',
    icon: Briefcase,
    optional: true,
  },
  {
    number: 6,
    id: 'links',
    title: 'External Links',
    subtitle: 'GitHub, LinkedIn & websites',
    icon: LinkIcon,
    optional: true,
  },
  {
    number: 7,
    id: 'visibility',
    title: 'Privacy & Sharing',
    subtitle: 'Control who can view your work',
    icon: Shield,
  },
  {
    number: 8,
    id: 'preview',
    title: 'Preview & Finish',
    subtitle: 'Review your complete profile',
    icon: Eye,
  },
];

export const ProfileOnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active step (1 to 8)
  const currentStepFromUrl = parseInt(searchParams.get('step') || '1', 10);
  const currentStep = Math.max(1, Math.min(8, isNaN(currentStepFromUrl) ? 1 : currentStepFromUrl));

  // Data Loading States
  const [loading, setLoading] = useState(true);
  const [savingStep, setSavingStep] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [stepSuccess, setStepSuccess] = useState<string | null>(null);

  // Profile Aggregate Data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLinkItem[]>([]);
  const [sections, setSections] = useState<ProfileSectionItem[]>([]);

  // Step 2 (Personal Info) Form State
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(true);
  const [handleError, setHandleError] = useState<string | null>(null);

  // Step 3 (Education) Form State
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduQualification, setEduQualification] = useState('');
  const [eduDates, setEduDates] = useState('');
  const [eduCurrentlyStudying, setEduCurrentlyStudying] = useState(true);

  // Step 4 (Skills) Input State
  const [newSkillText, setNewSkillText] = useState('');

  // Step 5 (Experience) Form State
  const [expRole, setExpRole] = useState('');
  const [expOrg, setExpOrg] = useState('');
  const [expDates, setExpDates] = useState('');
  const [expDescription, setExpDescription] = useState('');

  // Step 6 (External Links) Form State
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Step 7 (Visibility) Form State
  const [visibility, setVisibility] = useState<ProfileVisibility>('private');
  const [discoverable, setDiscoverable] = useState(false);

  // Load complete profile from Supabase
  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const res = await profileService.getFullProfile(user.id);
    setLoading(false);

    if (res.data) {
      const p = res.data.profile;
      setProfile(p);
      setEducation(res.data.education);
      setExperience(res.data.experience);
      setSkills(res.data.skills);
      setCredentials(res.data.credentials);
      setExternalLinks(res.data.externalLinks);
      setSections(res.data.sections);

      if (p) {
        setDisplayName(p.displayName || '');
        setHandle(p.handle || '');
        setHeadline(p.headline || '');
        setBio(p.bio || '');
        setLocationLabel(p.locationLabel || '');
        setVisibility(p.visibility || 'private');
        setDiscoverable(Boolean(p.discoverable));
      }

      // If user opened /app/onboarding with no step param, determine recommended step
      if (!searchParams.get('step')) {
        if (!p?.displayName || !p?.handle || p.displayName === 'Student') {
          setSearchParams({ step: '2' }, { replace: true });
        } else if (res.data.education.length === 0) {
          setSearchParams({ step: '3' }, { replace: true });
        } else if (res.data.skills.length < 3) {
          setSearchParams({ step: '4' }, { replace: true });
        } else {
          setSearchParams({ step: '1' }, { replace: true });
        }
      }
    }
  }, [user?.id, searchParams, setSearchParams]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Handle availability checking in Step 2
  useEffect(() => {
    const timer = setTimeout(async () => {
      const normalized = handle.toLowerCase().trim();
      if (!normalized || normalized === profile?.handle) {
        setHandleChecking(false);
        setHandleAvailable(true);
        setHandleError(null);
        return;
      }

      if (normalized.length < 3) {
        setHandleChecking(false);
        setHandleAvailable(false);
        setHandleError('Handle must be at least 3 characters.');
        return;
      }

      if (RESERVED_HANDLES.has(normalized)) {
        setHandleChecking(false);
        setHandleAvailable(false);
        setHandleError('This handle is reserved.');
        return;
      }

      setHandleChecking(true);
      const res = await profileService.checkHandleAvailability(normalized, profile?.id);
      setHandleChecking(false);
      setHandleAvailable(res.available);
      if (!res.available) {
        setHandleError(res.error || 'This handle is taken.');
      } else {
        setHandleError(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [handle, profile?.handle, profile?.id]);

  const goToStep = (targetStep: number) => {
    setStepError(null);
    setStepSuccess(null);
    setSearchParams({ step: String(targetStep) }, { replace: true });
  };

  // Completeness score
  const completeness = calculateProfileCompleteness(
    profile,
    education,
    experience,
    skills,
    credentials,
    externalLinks
  );

  // --------------------------------------------------------------------------
  // STEP ACTIONS & VALIDATION
  // --------------------------------------------------------------------------

  // Step 2: Save Personal Info
  const handleSaveStep2 = async (): Promise<boolean> => {
    if (!profile?.id) return false;
    setStepError(null);

    if (!displayName.trim()) {
      setStepError('Display Name is required.');
      return false;
    }

    if (!handle.trim()) {
      setStepError('Canonical Handle is required.');
      return false;
    }

    if (handleAvailable === false) {
      setStepError(handleError || 'Please choose an available handle.');
      return false;
    }

    const validation = profileSchema.safeParse({
      displayName,
      handle,
      headline: headline || undefined,
      bio: bio || undefined,
      locationLabel: locationLabel || undefined,
      visibility,
      discoverable,
    });

    if (!validation.success) {
      setStepError(validation.error.errors[0]?.message || 'Please check form input.');
      return false;
    }

    setSavingStep(true);
    const res = await profileService.updateProfile(profile.id, {
      displayName,
      handle,
      headline,
      bio,
      locationLabel,
    });
    setSavingStep(false);

    if (res.error || !res.data) {
      setStepError(res.error || 'Failed to update personal info.');
      return false;
    }

    setProfile(res.data);
    return true;
  };

  // Step 3: Save Education
  const handleSaveStep3 = async (): Promise<boolean> => {
    if (!profile?.id) return false;
    setStepError(null);

    // If form has input, save the entry
    if (eduInstitution.trim()) {
      setSavingStep(true);
      const res = await profileService.createEducation(profile.id, {
        institution: eduInstitution.trim(),
        qualification: eduQualification.trim() || undefined,
        dates: eduCurrentlyStudying
          ? `${eduDates.trim() ? eduDates.trim() + ' - ' : ''}Present`
          : eduDates.trim() || undefined,
        visibility: 'public',
      });
      setSavingStep(false);

      if (res.error || !res.data) {
        setStepError(res.error || 'Failed to save education entry.');
        return false;
      }

      setEducation((prev) => [...prev, res.data!]);
      setEduInstitution('');
      setEduQualification('');
      setEduDates('');
    }

    return true;
  };

  // Step 4: Add Skill
  const handleAddSkill = async (skillName: string) => {
    if (!profile?.id || !skillName.trim()) return;
    setStepError(null);

    const normalized = skillName.trim();
    if (skills.some((s) => s.skill.toLowerCase() === normalized.toLowerCase())) {
      setStepError(`'${normalized}' is already in your skill list.`);
      return;
    }

    setSavingStep(true);
    const res = await profileService.createSkill(profile.id, {
      skill: normalized,
      sortOrder: skills.length,
    });
    setSavingStep(false);

    if (res.error || !res.data) {
      setStepError(res.error || 'Failed to add skill.');
      return;
    }

    setSkills((prev) => [...prev, res.data!]);
    setNewSkillText('');
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (!profile?.id) return;
    const res = await profileService.deleteSkill(profile.id, skillId);
    if (!res.error) {
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
    }
  };

  // Step 5: Save Experience Entry
  const handleSaveStep5 = async (): Promise<boolean> => {
    if (!profile?.id) return false;
    setStepError(null);

    if (expRole.trim() && expOrg.trim()) {
      setSavingStep(true);
      const res = await profileService.createExperience(profile.id, {
        role: expRole.trim(),
        organization: expOrg.trim(),
        dates: expDates.trim() || undefined,
        description: expDescription.trim() || undefined,
        visibility: 'public',
      });
      setSavingStep(false);

      if (res.error || !res.data) {
        setStepError(res.error || 'Failed to save experience entry.');
        return false;
      }

      setExperience((prev) => [...prev, res.data!]);
      setExpRole('');
      setExpOrg('');
      setExpDates('');
      setExpDescription('');
    }

    return true;
  };

  // Step 6: Add External Link
  const handleAddExternalLink = async () => {
    if (!profile?.id || !newLinkLabel.trim() || !newLinkUrl.trim()) return;
    setStepError(null);

    let urlToSave = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(urlToSave)) {
      urlToSave = `https://${urlToSave}`;
    }

    setSavingStep(true);
    const res = await profileService.createExternalLink(profile.id, {
      label: newLinkLabel.trim(),
      url: urlToSave,
      visibility: 'public',
      sortOrder: externalLinks.length,
    });
    setSavingStep(false);

    if (res.error || !res.data) {
      setStepError(res.error || 'Failed to add link.');
      return;
    }

    setExternalLinks((prev) => [...prev, res.data!]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = async (linkId: string) => {
    if (!profile?.id) return;
    const res = await profileService.deleteExternalLink(profile.id, linkId);
    if (!res.error) {
      setExternalLinks((prev) => prev.filter((l) => l.id !== linkId));
    }
  };

  // Step 7: Save Visibility
  const handleSaveStep7 = async (): Promise<boolean> => {
    if (!profile?.id) return false;
    setStepError(null);

    const safeDiscoverable = visibility === 'public' ? discoverable : false;

    setSavingStep(true);
    const res = await profileService.updateProfile(profile.id, {
      visibility,
      discoverable: safeDiscoverable,
    });
    setSavingStep(false);

    if (res.error || !res.data) {
      setStepError(res.error || 'Failed to update visibility settings.');
      return false;
    }

    setProfile(res.data);
    return true;
  };

  // Continue Handler for each step
  const handleContinue = async () => {
    setStepError(null);

    if (currentStep === 1) {
      goToStep(2);
      return;
    }

    if (currentStep === 2) {
      const ok = await handleSaveStep2();
      if (ok) goToStep(3);
      return;
    }

    if (currentStep === 3) {
      const ok = await handleSaveStep3();
      if (ok) goToStep(4);
      return;
    }

    if (currentStep === 4) {
      goToStep(5);
      return;
    }

    if (currentStep === 5) {
      const ok = await handleSaveStep5();
      if (ok) goToStep(6);
      return;
    }

    if (currentStep === 6) {
      goToStep(7);
      return;
    }

    if (currentStep === 7) {
      const ok = await handleSaveStep7();
      if (ok) goToStep(8);
      return;
    }

    if (currentStep === 8) {
      navigate('/app/profile');
    }
  };

  // Skip Handler (for optional steps)
  const handleSkip = () => {
    setStepError(null);
    goToStep(currentStep + 1);
  };

  // Save & Exit to Profile Editor
  const handleSaveAndExit = async () => {
    if (currentStep === 2) await handleSaveStep2();
    if (currentStep === 3) await handleSaveStep3();
    if (currentStep === 5) await handleSaveStep5();
    if (currentStep === 7) await handleSaveStep7();
    navigate('/app/profile');
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white p-16 text-center space-y-4 shadow-xs">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold text-slate-600">
          Loading your student profile setup workspace...
        </p>
      </div>
    );
  }

  const currentStepConfig = STEPS[currentStep - 1]!;
  const StepIcon = currentStepConfig.icon;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Compass className="h-4 w-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Profile Setup Onboarding
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Step {currentStep} of {STEPS.length} &bull; {currentStepConfig.title} &bull;{' '}
              {currentStepConfig.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CircularProgress score={completeness.score} size={46} strokeWidth={4} />
            <button
              type="button"
              onClick={handleSaveAndExit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Save className="h-3.5 w-3.5 text-slate-400" />
              <span>Save &amp; Exit</span>
            </button>
          </div>
        </div>

        {/* Stepper Indicator Navigation */}
        <div className="overflow-x-auto pb-1">
          <nav className="flex items-center gap-2 min-w-max" aria-label="Onboarding Steps">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isCurrent = s.number === currentStep;
              const isPast = s.number < currentStep;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToStep(s.number)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : isPast
                      ? 'bg-teal-50 text-teal-800 hover:bg-teal-100/70'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-teal-800 text-teal-100'
                        : isPast
                        ? 'bg-teal-200 text-teal-900'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isPast ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : s.number}
                  </span>
                  <Icon className="h-3 w-3 shrink-0" />
                  <span>{s.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Messages */}
      {stepError && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{stepError}</span>
        </div>
      )}

      {stepSuccess && (
        <div className="flex items-center gap-2 rounded-2xl bg-teal-50 border border-teal-200 p-4 text-xs text-teal-800">
          <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
          <span>{stepSuccess}</span>
        </div>
      )}

      {/* Step Content Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Step Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-600">
            <StepIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{currentStepConfig.title}</h2>
            <p className="text-xs text-slate-500">{currentStepConfig.subtitle}</p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* STEP 1: WELCOME */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 1 && (
          <div className="space-y-6 py-2">
            <div className="max-w-2xl space-y-4 text-slate-700 text-sm leading-relaxed">
              <p>
                <strong>Welcome to Aura Campus V2!</strong> Your student profile is your living professional identity — not a generic social resume, but an honest, verifiable showcase of what you are learning, building, and accomplishing.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1">
                  <p className="font-bold text-slate-900 text-xs">Early-Career Fair</p>
                  <p className="text-xs text-slate-500">
                    Never penalized for lacking formal internships. Projects, coursework, and club involvement count.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1">
                  <p className="font-bold text-slate-900 text-xs">Privacy-First</p>
                  <p className="text-xs text-slate-500">
                    Profiles are completely private by default until you decide to share or publish.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1">
                  <p className="font-bold text-slate-900 text-xs">Portfolio Ready</p>
                  <p className="text-xs text-slate-500">
                    Your profile data powers the 12 portfolio presentation themes automatically.
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1">
                  <p className="font-bold text-slate-900 text-xs">Save &amp; Resume Anytime</p>
                  <p className="text-xs text-slate-500">
                    All progress saves directly to your authenticated Supabase backend.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 2: PERSONAL INTRODUCTION & AVATAR */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 2 && (
          <div className="space-y-5">
            {profile?.id && (
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Profile Avatar
                </label>
                <AvatarUploader
                  userId={profile.id}
                  currentAvatarPath={profile.avatarPath}
                  displayName={displayName || profile.displayName}
                  handle={handle || profile.handle}
                  onAvatarUpdated={(newPath) => {
                    setProfile((prev) => (prev ? { ...prev, avatarPath: newPath } : null));
                  }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-semibold text-slate-700 mb-1"
                  htmlFor="onboarding-name"
                >
                  Display Name *
                </label>
                <input
                  id="onboarding-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    className="block text-xs font-semibold text-slate-700"
                    htmlFor="onboarding-handle"
                  >
                    Public Handle *
                  </label>
                  {handleChecking ? (
                    <span className="text-[11px] text-slate-400">Checking...</span>
                  ) : handleAvailable === true && handle ? (
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <Check className="h-3 w-3" /> Available
                    </span>
                  ) : handleAvailable === false ? (
                    <span className="text-[11px] text-rose-600 font-semibold">Unavailable</span>
                  ) : null}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-slate-400 font-mono">@</span>
                  <input
                    id="onboarding-handle"
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="mayapatel"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1"
                htmlFor="onboarding-headline"
              >
                Professional Headline
              </label>
              <input
                id="onboarding-headline"
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={120}
                placeholder="e.g. Computer Science Undergrad • Aspiring ML Systems Engineer"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                A 1-line summary displayed under your name ({headline.length} / 120)
              </p>
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1"
                htmlFor="onboarding-bio"
              >
                Short Biography
              </label>
              <textarea
                id="onboarding-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={1000}
                placeholder="Briefly introduce your academic interests, what you enjoy building, and your career goals..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Share what motivates you ({bio.length} / 1000)
              </p>
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1"
                htmlFor="onboarding-location"
              >
                Location Label
              </label>
              <input
                id="onboarding-location"
                type="text"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="e.g. San Francisco, CA or Remote"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 3: EDUCATION */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Existing Education List */}
            {education.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Added Education</span>
                <div className="space-y-2">
                  {education.map((e) => (
                    <div
                      key={e.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{e.institution}</p>
                        <p className="text-[11px] text-slate-500">
                          {e.qualification} &bull; {e.dates}
                        </p>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Saved
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Education Form */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 space-y-4">
              <span className="text-xs font-bold text-slate-900 block">
                {education.length === 0 ? 'Add Your Current Education' : 'Add Another Education Entry'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    className="block text-xs font-semibold text-slate-700 mb-1"
                    htmlFor="edu-institution"
                  >
                    Institution / University *
                  </label>
                  <input
                    id="edu-institution"
                    type="text"
                    value={eduInstitution}
                    onChange={(e) => setEduInstitution(e.target.value)}
                    placeholder="e.g. UC Berkeley, MIT, Stanford"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold text-slate-700 mb-1"
                    htmlFor="edu-degree"
                  >
                    Degree or Program
                  </label>
                  <input
                    id="edu-degree"
                    type="text"
                    value={eduQualification}
                    onChange={(e) => setEduQualification(e.target.value)}
                    placeholder="e.g. B.S. in Computer Science"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    className="block text-xs font-semibold text-slate-700 mb-1"
                    htmlFor="edu-dates"
                  >
                    Year / Dates
                  </label>
                  <input
                    id="edu-dates"
                    type="text"
                    value={eduDates}
                    onChange={(e) => setEduDates(e.target.value)}
                    placeholder="e.g. 2023 - 2027 or Class of 2026"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={eduCurrentlyStudying}
                      onChange={(e) => setEduCurrentlyStudying(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                    />
                    <span>I am currently enrolled here</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 4: SKILLS */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1"
                htmlFor="new-skill-input"
              >
                Add Your Core Skills
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="new-skill-input"
                  type="text"
                  value={newSkillText}
                  onChange={(e) => setNewSkillText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(newSkillText);
                    }
                  }}
                  placeholder="Type a skill and press Enter (e.g. React, Python, UI Design)"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(newSkillText)}
                  disabled={!newSkillText.trim()}
                  className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Popular Suggestions Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Popular Suggestions</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.filter(
                  (ps) => !skills.some((s) => s.skill.toLowerCase() === ps.toLowerCase())
                ).map((ps) => (
                  <button
                    key={ps}
                    type="button"
                    onClick={() => handleAddSkill(ps)}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 px-2.5 py-1 text-xs font-medium transition-colors"
                  >
                    <Plus className="h-3 w-3 text-slate-400" />
                    <span>{ps}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Skills Chips */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Your Skills ({skills.length})
                </span>
                {skills.length >= 3 && (
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="h-3 w-3" /> Core criteria satisfied (min 3)
                  </span>
                )}
              </div>

              {skills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No skills added yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-900 shadow-2xs"
                    >
                      <span>{s.skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.id)}
                        className="text-teal-600 hover:text-rose-600"
                        aria-label={`Remove ${s.skill}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 5: EXPERIENCE & ACHIEVEMENTS */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex items-start gap-3 text-xs text-slate-600">
              <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">Early-Career Flexibility</p>
                <p className="leading-relaxed">
                  First-year students are not expected to have corporate internships. Document an open-source project, campus club role, hackathon build, or self-directed coursework. You can also skip this step!
                </p>
              </div>
            </div>

            {/* Existing Experience */}
            {experience.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700">Added Work &amp; Projects</span>
                <div className="space-y-2">
                  {experience.map((x) => (
                    <div
                      key={x.id}
                      className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{x.role}</p>
                        <p className="text-[11px] text-slate-500">
                          {x.organization} &bull; {x.dates || 'Ongoing'}
                        </p>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> Saved
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Experience Form */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 space-y-4">
              <span className="text-xs font-bold text-slate-900 block">
                {experience.length === 0 ? 'Document a Role or Project' : 'Add Another Experience'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    className="block text-xs font-semibold text-slate-700 mb-1"
                    htmlFor="exp-role"
                  >
                    Role / Project Title
                  </label>
                  <input
                    id="exp-role"
                    type="text"
                    value={expRole}
                    onChange={(e) => setExpRole(e.target.value)}
                    placeholder="e.g. Frontend Contributor, Lab Assistant, Club Lead"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold text-slate-700 mb-1"
                    htmlFor="exp-org"
                  >
                    Organization / Platform / Lab
                  </label>
                  <input
                    id="exp-org"
                    type="text"
                    value={expOrg}
                    onChange={(e) => setExpOrg(e.target.value)}
                    placeholder="e.g. Aura Lab, Open Source, ACM Chapter"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-slate-700 mb-1"
                  htmlFor="exp-dates"
                >
                  Dates / Period
                </label>
                <input
                  id="exp-dates"
                  type="text"
                  value={expDates}
                  onChange={(e) => setExpDates(e.target.value)}
                  placeholder="e.g. Summer 2025 or 2024 - Present"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label
                  className="block text-xs font-semibold text-slate-700 mb-1"
                  htmlFor="exp-desc"
                >
                  Description
                </label>
                <textarea
                  id="exp-desc"
                  rows={2}
                  value={expDescription}
                  onChange={(e) => setExpDescription(e.target.value)}
                  placeholder="What was your contribution and outcome?"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 6: EXTERNAL LINKS */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <p className="text-xs text-slate-500">
              Connect external links so peers and recruiters can find your real code, articles, or LinkedIn profile.
            </p>

            {/* Add Link Form */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label
                  className="block text-xs font-semibold text-slate-700 mb-1"
                  htmlFor="link-label"
                >
                  Platform Label
                </label>
                <input
                  id="link-label"
                  type="text"
                  value={newLinkLabel}
                  onChange={(e) => setNewLinkLabel(e.target.value)}
                  placeholder="e.g. GitHub, LinkedIn, Portfolio"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="sm:col-span-6">
                <label
                  className="block text-xs font-semibold text-slate-700 mb-1"
                  htmlFor="link-url"
                >
                  Destination URL
                </label>
                <input
                  id="link-url"
                  type="url"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="github.com/yourhandle"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddExternalLink}
                  disabled={!newLinkLabel.trim() || !newLinkUrl.trim() || savingStep}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Existing Links List */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900">
                Added Links ({externalLinks.length})
              </span>
              {externalLinks.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No external links added yet.</p>
              ) : (
                <div className="space-y-2">
                  {externalLinks.map((l) => (
                    <div
                      key={l.id}
                      className="p-3 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-3.5 w-3.5 text-teal-600" />
                        <span className="text-xs font-bold text-slate-900">{l.label}:</span>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-teal-600 hover:underline truncate max-w-xs"
                        >
                          {l.url}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(l.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        aria-label={`Remove ${l.label}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 7: PROFILE VISIBILITY & PRIVACY */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <p className="text-xs text-slate-600 leading-relaxed">
              Decide who can view your profile. Privacy is enforced at the database level using Supabase Row Level Security.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Private Option */}
              <div
                onClick={() => {
                  setVisibility('private');
                  setDiscoverable(false);
                }}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  visibility === 'private'
                    ? 'border-teal-600 bg-teal-50/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Shield className="h-4 w-4" />
                  </span>
                  {visibility === 'private' && (
                    <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Active
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">Private Profile (Default)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Only you can see your profile details. Anonymous visitors will see a private barrier screen.
                </p>
              </div>

              {/* Public Option */}
              <div
                onClick={() => setVisibility('public')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  visibility === 'public'
                    ? 'border-teal-600 bg-teal-50/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Globe className="h-4 w-4" />
                  </span>
                  {visibility === 'public' && (
                    <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Active
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900">Public Profile</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Anyone with your link (<code className="text-teal-700 font-mono">/u/{handle || 'you'}</code>) can view your public profile and verified achievements.
                </p>
              </div>
            </div>

            {/* Discoverable toggle if public */}
            {visibility === 'public' && (
              <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">Explore Directory Discoverability</p>
                  <p className="text-[11px] text-slate-500">
                    Allow other verified students to discover your profile in the Aura Campus search directory.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={discoverable}
                  onChange={(e) => setDiscoverable(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* STEP 8: PREVIEW & FINISH */}
        {/* ------------------------------------------------------------------ */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-900">
                  Ready to Complete Setup!
                </p>
                <p className="text-[11px] text-teal-700">
                  Profile Completeness Score: <strong>{completeness.score}%</strong>. You can return and update your profile at any time.
                </p>
              </div>
              <CircularProgress score={completeness.score} size={48} strokeWidth={5} />
            </div>

            {/* Summary Review Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                <span className="text-slate-400 font-medium">Identity</span>
                <p className="font-bold text-slate-900 truncate">{displayName || 'Student'}</p>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="text-[11px] text-teal-600 font-semibold hover:underline mt-1"
                >
                  Edit
                </button>
              </div>
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                <span className="text-slate-400 font-medium">Education</span>
                <p className="font-bold text-slate-900 truncate">
                  {education.length > 0 ? `${education.length} entries` : 'None added'}
                </p>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="text-[11px] text-teal-600 font-semibold hover:underline mt-1"
                >
                  Edit
                </button>
              </div>
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                <span className="text-slate-400 font-medium">Skills</span>
                <p className="font-bold text-slate-900 truncate">
                  {skills.length > 0 ? `${skills.length} skills` : 'None added'}
                </p>
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="text-[11px] text-teal-600 font-semibold hover:underline mt-1"
                >
                  Edit
                </button>
              </div>
              <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
                <span className="text-slate-400 font-medium">Visibility</span>
                <p className="font-bold text-slate-900 truncate capitalize">{visibility}</p>
                <button
                  type="button"
                  onClick={() => goToStep(7)}
                  className="text-[11px] text-teal-600 font-semibold hover:underline mt-1"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Embedded Live Preview */}
            <div className="border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-900 mb-3 block">
                Live Visitor Profile Preview
              </span>
              <ProfilePreviewTab
                profile={profile}
                education={education}
                experience={experience}
                skills={skills}
                credentials={credentials}
                externalLinks={externalLinks}
                sections={sections}
              />
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* FOOTER ACTIONS */}
        {/* ------------------------------------------------------------------ */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => goToStep(currentStep - 1)}
                disabled={savingStep}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Skip for now on optional steps */}
            {currentStepConfig.optional && currentStep < 8 && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={savingStep}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Skip for now
              </button>
            )}

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={handleContinue}
                disabled={savingStep}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-6 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-xs disabled:opacity-50"
              >
                {savingStep ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/app/profile')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-teal-700 shadow-xs"
              >
                <Check className="h-4 w-4" />
                <span>Finish Setup &amp; View Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
