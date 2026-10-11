import React, { useState } from 'react';
import {
  Eye,
  Shield,
  Globe,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  ExternalLink,
  MapPin,
  Lock,
  AlertTriangle,
  FolderGit2,
  Github,
  Sparkles,
  Plus,
} from 'lucide-react';
import {
  UserProfile,
  EducationItem,
  ExperienceItem,
  SkillItem,
  CredentialItem,
  ExternalLinkItem,
  ProfileSectionItem,
  Project,
} from '../../types';
import { profileService } from '../../services/profile';

interface ProfilePreviewTabProps {
  profile: UserProfile | null;
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: SkillItem[];
  credentials: CredentialItem[];
  externalLinks: ExternalLinkItem[];
  sections: ProfileSectionItem[];
  projects?: Project[];
  onNavigateTab?: (tab: string) => void;
}

export const ProfilePreviewTab: React.FC<ProfilePreviewTabProps> = ({
  profile,
  education,
  experience,
  skills,
  credentials,
  externalLinks,
  sections,
  projects = [],
  onNavigateTab,
}) => {
  const [viewMode, setViewMode] = useState<'owner' | 'visitor'>('visitor');
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const isPublic = profile?.visibility === 'public';
  const displayName = profile?.displayName || 'Student';
  const handle = profile?.handle || 'student';
  const avatarUrl = profileService.getAvatarUrl(profile?.avatarPath);
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w.charAt(0).toUpperCase())
      .join('') || handle.slice(0, 2).toUpperCase();

  // In visitor view: filter out private items
  const visibleEducation =
    viewMode === 'owner' ? education : education.filter((e) => e.visibility === 'public');
  const visibleExperience =
    viewMode === 'owner' ? experience : experience.filter((e) => e.visibility === 'public');
  const visibleSkills = skills;
  const visibleCredentials =
    viewMode === 'owner' ? credentials : credentials.filter((c) => c.visibility === 'public');
  const visibleLinks =
    viewMode === 'owner' ? externalLinks : externalLinks.filter((l) => l.visibility === 'public');
  const visibleProjects =
    viewMode === 'owner' ? projects : projects.filter((p) => p.visibility === 'public');

  // Section visibility overrides from sections organizer
  const sectionVisibilityMap = new Map(
    sections.map((s) => [s.sectionType, s.visibility === 'public'])
  );

  const showEducationSection =
    viewMode === 'owner' || (sectionVisibilityMap.get('education') ?? true);
  const showExperienceSection =
    viewMode === 'owner' || (sectionVisibilityMap.get('experience') ?? true);
  const showSkillsSection =
    viewMode === 'owner' || (sectionVisibilityMap.get('skills') ?? true);
  const showCredentialsSection =
    viewMode === 'owner' || (sectionVisibilityMap.get('credentials') ?? true);
  const showLinksSection =
    viewMode === 'owner' || (sectionVisibilityMap.get('links') ?? true);

  return (
    <div className="space-y-6">
      {/* View Mode Switcher Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Eye className="h-4 w-4 text-teal-600" />
            <span>Profile Preview</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Switch between public visitor preview and owner perspective.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('visitor')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'visitor'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Public Visitor View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('owner')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'owner'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Owner View (All Data)
          </button>
        </div>
      </div>

      {/* Visitor Warning if Profile is Private */}
      {viewMode === 'visitor' && !isPublic && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 flex items-start gap-3.5 text-xs text-amber-900 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">Profile is Currently Private</h3>
            <p className="text-amber-800 leading-relaxed">
              Because your profile visibility is set to <span className="font-semibold">Private</span>, public visitors navigating to{' '}
              <code className="font-mono text-amber-950 font-semibold bg-amber-100/70 px-1 py-0.5 rounded">/u/{handle}</code>{' '}
              will receive a privacy barrier. Below is a simulation of how your profile will appear once published.
            </p>
          </div>
        </div>
      )}

      {/* High-Fidelity Profile Canvas */}
      <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
        {/* Cover Pattern & Identity Header */}
        <div className="relative bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div
              className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white font-bold text-3xl shadow-lg border-2 border-white/20 ring-4 ring-white/10 overflow-hidden"
              aria-label="Profile Avatar"
            >
              {avatarUrl && !avatarLoadError ? (
                <img
                  src={avatarUrl}
                  alt={`${displayName}'s avatar`}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            {/* Core Info */}
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{displayName}</h1>
                <span className="text-sm font-mono text-teal-300">@{handle}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-teal-200 border border-teal-400/30">
                  <Sparkles className="h-3 w-3" />
                  Verified Student
                </span>
                {viewMode === 'owner' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/90">
                    {isPublic ? <Globe className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                )}
              </div>

              {profile?.headline ? (
                <p className="text-sm text-slate-200 leading-relaxed max-w-2xl">{profile.headline}</p>
              ) : viewMode === 'owner' ? (
                <p className="text-xs text-slate-400 italic">No headline set. Add one in Personal Info.</p>
              ) : null}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1">
                {profile?.institution && (
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-teal-400" />
                    <span>
                      {profile.institution}
                      {profile.program ? ` • ${profile.program}` : ''}
                      {profile.graduationYear ? ` ('${String(profile.graduationYear).slice(-2)})` : ''}
                    </span>
                  </span>
                )}
                {profile?.locationLabel && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{profile.locationLabel}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* 1. About / Biography */}
          {profile?.bio ? (
            <div className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">About</h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                {profile.bio}
              </p>
            </div>
          ) : viewMode === 'owner' ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4 text-xs text-slate-500 flex items-center justify-between">
              <span>Tell your story with a short biography in your profile.</span>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('personal')}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Bio
                </button>
              )}
            </div>
          ) : null}

          {/* 2. Skills & Technologies */}
          {showSkillsSection && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-teal-600" />
                <span>Skills &amp; Technologies</span>
              </h2>
              {visibleSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {visibleSkills.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-800"
                    >
                      <span>{s.skill}</span>
                      {s.proficiency && (
                        <span className="text-[10px] text-teal-700 font-semibold">• {s.proficiency}</span>
                      )}
                    </span>
                  ))}
                </div>
              ) : viewMode === 'owner' ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4 text-xs text-slate-500 flex items-center justify-between">
                  <span>Highlight your technical toolkit, programming languages, and frameworks.</span>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('skills')}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Skills
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* 3. Featured Projects & Proof of Work */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FolderGit2 className="h-3.5 w-3.5 text-teal-600" />
              <span>Projects &amp; Proof of Work</span>
            </h2>
            {visibleProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleProjects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                        {viewMode === 'owner' && p.visibility === 'private' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium shrink-0">
                            <Lock className="h-2.5 w-2.5" />
                            Private
                          </span>
                        )}
                      </div>

                      {p.summary && (
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {p.summary}
                        </p>
                      )}

                      {p.problem && (
                        <div className="text-[11px] text-slate-500 border-l-2 border-teal-500 pl-2">
                          <span className="font-semibold text-slate-700">Problem: </span>
                          <span className="line-clamp-2">{p.problem}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      {p.technologies && p.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                          {p.technologies.length > 4 && (
                            <span className="text-[10px] text-slate-400">+{p.technologies.length - 4}</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs">
                        {p.demoUrl && (
                          <a
                            href={p.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {p.repositoryUrl && (
                          <a
                            href={p.repositoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                          >
                            <Github className="h-3 w-3" />
                            <span>Repository</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'owner' ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-5 text-center text-xs text-slate-500 space-y-2">
                <p>No project case studies added yet. Projects make your portfolio stand out to recruiters.</p>
                <a
                  href="/app/projects"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Your First Project</span>
                </a>
              </div>
            ) : null}
          </div>

          {/* 4. Education Timeline */}
          {showEducationSection && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
                <span>Education</span>
              </h2>
              {visibleEducation.length > 0 ? (
                <div className="space-y-3">
                  {visibleEducation.map((e) => (
                    <div key={e.id} className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{e.institution}</h3>
                        {viewMode === 'owner' && e.visibility === 'private' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                            <Lock className="h-2.5 w-2.5" />
                            Private
                          </span>
                        )}
                      </div>
                      {e.qualification && (
                        <p className="text-xs font-medium text-slate-700">{e.qualification}</p>
                      )}
                      {e.dates && <p className="text-xs text-slate-500 font-mono">{e.dates}</p>}
                      {e.description && (
                        <p className="text-xs text-slate-600 pt-1 leading-relaxed">{e.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : viewMode === 'owner' ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4 text-xs text-slate-500 flex items-center justify-between">
                  <span>Add your university, degree, or coursework.</span>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('education')}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Education
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* 5. Experience Timeline */}
          {showExperienceSection && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-teal-600" />
                <span>Experience &amp; Leadership</span>
              </h2>
              {visibleExperience.length > 0 ? (
                <div className="space-y-3">
                  {visibleExperience.map((exp) => (
                    <div key={exp.id} className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{exp.role}</h3>
                          <p className="text-xs text-slate-600 font-medium">at {exp.organization}</p>
                        </div>
                        {viewMode === 'owner' && exp.visibility === 'private' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                            <Lock className="h-2.5 w-2.5" />
                            Private
                          </span>
                        )}
                      </div>
                      {exp.dates && <p className="text-xs text-slate-500 font-mono">{exp.dates}</p>}
                      {exp.description && (
                        <p className="text-xs text-slate-600 pt-1 leading-relaxed whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : viewMode === 'owner' ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4 text-xs text-slate-500 flex items-center justify-between">
                  <span>Share internships, research, student clubs, or freelance roles.</span>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('experience')}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Experience
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* 6. Credentials & Achievements */}
          {showCredentialsSection && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-teal-600" />
                <span>Credentials &amp; Achievements</span>
              </h2>
              {visibleCredentials.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {visibleCredentials.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-slate-100 bg-slate-50/40 p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          {c.kind}
                        </span>
                        {viewMode === 'owner' && c.visibility === 'private' && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                            <Lock className="h-2.5 w-2.5" />
                            Private
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                      <p className="text-xs text-slate-600">{c.issuer}</p>
                      {c.credentialUrl && (
                        <a
                          href={c.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 pt-1"
                        >
                          <span>Verification Link</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : viewMode === 'owner' ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4 text-xs text-slate-500 flex items-center justify-between">
                  <span>Add certificates, scholarships, hackathon awards, and licenses.</span>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('credentials')}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Credential
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {/* 7. External Links */}
          {showLinksSection && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">External Links &amp; Profiles</h2>
              {visibleLinks.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {visibleLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
                    >
                      <span>{link.label}</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </a>
                  ))}
                </div>
              ) : viewMode === 'owner' ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4 text-xs text-slate-500 flex items-center justify-between">
                  <span>Connect your GitHub, LinkedIn, Substack, or personal blog.</span>
                  {onNavigateTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab('links')}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Links
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
