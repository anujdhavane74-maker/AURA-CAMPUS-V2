import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import {
  Portfolio,
  PortfolioThemeId,
  Project,
  UserProfile,
  PortfolioVisibility,
  ProjectStatus,
  ProjectVisibility,
} from '../../types';
import { portfolioService } from '../../services/portfolio';
import { profileService } from '../../services/profile';
import { PortfolioThemeRenderer } from '../../components/portfolio/PortfolioThemeRenderer';
import { VisualThemePicker } from '../../components/portfolio/VisualThemePicker';
import { PORTFOLIO_THEMES } from '../../design/themes';
import {
  Layers,
  Palette,
  Eye,
  Check,
  Smartphone,
  Monitor,
  Save,
  Globe,
  Lock,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Loader2,
  ExternalLink,
  X,
  Sparkles,
  FolderGit2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
} from 'lucide-react';

export const PortfolioBuilderPage: React.FC = () => {
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Entities
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  // Editor Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<PortfolioThemeId>('studio');
  const [visibility, setVisibility] = useState<PortfolioVisibility>('private');

  // Preview & Workspace Layout Settings
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'content' | 'canvas' | 'theme'>('canvas');

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSlug, setProjectSlug] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [projectProblem, setProjectProblem] = useState('');
  const [projectApproach, setProjectApproach] = useState('');
  const [projectTechnologies, setProjectTechnologies] = useState('');
  const [projectRepoUrl, setProjectRepoUrl] = useState('');
  const [projectDemoUrl, setProjectDemoUrl] = useState('');
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('completed');
  const [projectVisibility, setProjectVisibility] = useState<ProjectVisibility>('public');
  const [projectModalError, setProjectModalError] = useState<string | null>(null);

  // Auto-collapse right panel on smaller laptop screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsRightCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcut to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsThemeModalOpen(false);
        setIsProjectModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load initial portfolio and projects
  const loadBuilderData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setErrorMessage(null);

    const [profileRes, portfolioRes, projectsRes] = await Promise.all([
      profileService.getProfile(user.id),
      portfolioService.fetchUserPortfolio(user.id),
      portfolioService.fetchUserProjects(user.id),
    ]);

    setLoading(false);

    if (profileRes.data) {
      setProfile(profileRes.data);
    }

    if (projectsRes.data) {
      setProjects(projectsRes.data);
    }

    if (portfolioRes.data) {
      const p = portfolioRes.data;
      setPortfolio(p);
      setTitle(p.title);
      setSlug(p.slug);
      setSelectedThemeId(p.theme);
      setVisibility(p.visibility);
      setIntroduction((p.data?.introduction as string) || '');
    } else {
      // Default new draft
      const defaultSlug = (profileRes.data?.handle || 'student') + '-portfolio';
      setTitle(`${profileRes.data?.displayName || 'My'} Portfolio`);
      setSlug(defaultSlug);
      setSelectedThemeId('studio');
      setVisibility('private');
      setIntroduction(profileRes.data?.bio || 'Building reliable software and thoughtful engineering solutions.');
    }
  }, [user?.id]);

  useEffect(() => {
    loadBuilderData();
  }, [loadBuilderData]);

  // Save Portfolio
  const handleSavePortfolio = async (publishAction?: boolean) => {
    if (!user?.id) return;

    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const targetVisibility =
      publishAction !== undefined
        ? publishAction
          ? 'public'
          : 'private'
        : visibility;

    const res = await portfolioService.upsertPortfolio(user.id, {
      id: portfolio?.id,
      title: title.trim() || 'My Portfolio',
      slug: slug.trim(),
      theme: selectedThemeId,
      visibility: targetVisibility,
      data: {
        ...(portfolio?.data || {}),
        introduction: introduction.trim(),
      },
      publishedAt:
        targetVisibility === 'public'
          ? portfolio?.publishedAt || new Date().toISOString()
          : null,
    });

    setSaving(false);

    if (res.error || !res.data) {
      setErrorMessage(res.error || 'Failed to save portfolio.');
    } else {
      setPortfolio(res.data);
      setVisibility(targetVisibility);
      setStatusMessage(
        targetVisibility === 'public'
          ? 'Portfolio published! Accessible via public canonical URL.'
          : 'Portfolio draft saved successfully.'
      );
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  // Open Project Modal for Create
  const handleOpenCreateProject = () => {
    setEditingProjectId(null);
    setProjectTitle('');
    setProjectSlug('');
    setProjectSummary('');
    setProjectProblem('');
    setProjectApproach('');
    setProjectTechnologies('');
    setProjectRepoUrl('');
    setProjectDemoUrl('');
    setProjectStatus('completed');
    setProjectVisibility('public');
    setProjectModalError(null);
    setIsProjectModalOpen(true);
  };

  // Open Project Modal for Edit
  const handleOpenEditProject = (p: Project) => {
    setEditingProjectId(p.id);
    setProjectTitle(p.title);
    setProjectSlug(p.slug);
    setProjectSummary(p.summary || '');
    setProjectProblem(p.problem || '');
    setProjectApproach(p.approach || '');
    setProjectTechnologies(p.technologies.join(', '));
    setProjectRepoUrl(p.repositoryUrl || '');
    setProjectDemoUrl(p.demoUrl || '');
    setProjectStatus(p.status);
    setProjectVisibility(p.visibility);
    setProjectModalError(null);
    setIsProjectModalOpen(true);
  };

  // Save Project from Modal
  const handleSaveProjectModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setProjectModalError(null);
    if (!projectTitle.trim()) {
      setProjectModalError('Project title is required.');
      return;
    }

    const techArray = projectTechnologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const generatedSlug =
      projectSlug.trim() ||
      projectTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    if (editingProjectId) {
      const res = await portfolioService.updateProject(user.id, editingProjectId, {
        title: projectTitle,
        slug: generatedSlug,
        summary: projectSummary,
        problem: projectProblem,
        approach: projectApproach,
        technologies: techArray,
        repositoryUrl: projectRepoUrl,
        demoUrl: projectDemoUrl,
        status: projectStatus,
        visibility: projectVisibility,
      });

      if (res.error || !res.data) {
        setProjectModalError(res.error || 'Failed to update project.');
      } else {
        setProjects(projects.map((it) => (it.id === editingProjectId ? res.data! : it)));
        setIsProjectModalOpen(false);
      }
    } else {
      const res = await portfolioService.createProject(user.id, {
        title: projectTitle,
        slug: generatedSlug,
        summary: projectSummary,
        problem: projectProblem,
        approach: projectApproach,
        technologies: techArray,
        repositoryUrl: projectRepoUrl,
        demoUrl: projectDemoUrl,
        status: projectStatus,
        visibility: projectVisibility,
      });

      if (res.error || !res.data) {
        setProjectModalError(res.error || 'Failed to create project.');
      } else {
        setProjects([res.data, ...projects]);
        setIsProjectModalOpen(false);
      }
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string) => {
    if (!user?.id) return;
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    const res = await portfolioService.deleteProject(user.id, projectId);
    if (res.success) {
      setProjects(projects.filter((p) => p.id !== projectId));
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white p-16 text-center space-y-4 shadow-xs">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold text-slate-600">Loading portfolio workspace...</p>
      </div>
    );
  }

  // Construct current dynamic portfolio for live preview
  const livePortfolio: Portfolio = {
    id: portfolio?.id || 'preview-id',
    userId: user?.id || '',
    slug: slug || 'portfolio',
    title: title || 'My Portfolio',
    theme: selectedThemeId,
    accent: portfolio?.accent || 'teal',
    data: {
      introduction,
    },
    visibility,
    publishedAt: portfolio?.publishedAt,
    createdAt: portfolio?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Studio Toolbar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio Studio</h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                visibility === 'public'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {visibility === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {visibility === 'public' ? 'Published' : 'Draft Mode'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Craft your public portfolio. Edit content on the left, watch live updates in the center canvas.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Viewport switch (Desktop / Mobile 375px) */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewportMode === 'desktop'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Desktop Viewport"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewportMode === 'mobile'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Mobile Viewport (375px)"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* Theme Gallery Button */}
          <button
            type="button"
            onClick={() => setIsThemeModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Open 12 Themes Gallery"
          >
            <Palette className="h-3.5 w-3.5 text-teal-600" />
            <span>Theme: {PORTFOLIO_THEMES[selectedThemeId]?.name}</span>
          </button>

          {/* View Live Link if published */}
          {visibility === 'public' && (
            <a
              href={`/p/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Eye className="h-3.5 w-3.5 text-teal-600" />
              <span>View Live</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </a>
          )}

          {/* Save Draft Button */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSavePortfolio()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Draft</span>
          </button>

          {/* Publish / Unpublish Button */}
          {visibility === 'public' ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSavePortfolio(false)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs disabled:opacity-50"
            >
              <span>Unpublish</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSavePortfolio(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-2xs transition-colors disabled:opacity-50"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Publish</span>
            </button>
          )}
        </div>
      </div>

      {/* Status & Error Alerts */}
      {statusMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-teal-50 border border-teal-200 p-3 text-xs text-teal-800">
          <Check className="h-4 w-4 text-teal-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Mobile Tab Selector (for screens < lg) */}
      <div className="lg:hidden flex rounded-2xl bg-slate-100 p-1 border border-slate-200">
        <button
          type="button"
          onClick={() => setMobileTab('content')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mobileTab === 'content' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Content &amp; Projects
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('canvas')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mobileTab === 'canvas' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Live Canvas
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('theme')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mobileTab === 'theme' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
          }`}
        >
          Themes &amp; Design
        </button>
      </div>

      {/* 2. Professional Balanced Workspace Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* LEFT PANEL: Compact Collapsible Settings & Projects (~270px) */}
        {!isLeftCollapsed && (
          <aside
            className={`w-full lg:w-72 xl:w-76 shrink-0 space-y-5 ${
              mobileTab !== 'content' ? 'hidden lg:block' : ''
            }`}
            aria-label="Portfolio Settings and Projects"
          >
            {/* Header with collapse button on desktop */}
            <div className="hidden lg:flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-teal-600" />
                <span>Settings &amp; Content</span>
              </span>
              <button
                type="button"
                onClick={() => setIsLeftCollapsed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                title="Collapse Settings Panel"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            {/* Metadata Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-xs">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Alex Chen Portfolio"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Slug</label>
                  <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500">
                    <span className="bg-slate-50 px-2 py-2 text-xs font-mono text-slate-500 border-r border-slate-200">
                      /p/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="my-portfolio"
                      className="w-full px-2 py-2 text-xs font-mono text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Intro Statement / Bio</label>
                  <textarea
                    rows={3}
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    placeholder="A short opening statement describing your focus..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Project Curation Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FolderGit2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>Projects ({projects.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={handleOpenCreateProject}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No projects added yet. Click &apos;Add&apos; to showcase your code and case studies.
                </p>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{proj.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {proj.technologies.slice(0, 3).join(', ') || 'No tech tags'}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProject(proj)}
                          className="p-1 text-slate-400 hover:text-teal-600 rounded-lg transition-colors"
                          title="Edit Project"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* CENTER PANEL: Dominant Live Canvas Workspace */}
        <main
          className={`flex-1 min-w-0 space-y-3.5 ${
            mobileTab !== 'canvas' ? 'hidden lg:block' : ''
          }`}
          aria-label="Live Portfolio Preview Canvas"
        >
          {/* Canvas Sub-Toolbar: Panel restoration and Viewport indicators */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              {isLeftCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsLeftCollapsed(false)}
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <PanelLeftOpen className="h-3.5 w-3.5 text-teal-600" />
                  <span>Show Settings</span>
                </button>
              )}
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                <span>Theme Architecture: {PORTFOLIO_THEMES[selectedThemeId]?.name}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                {viewportMode === 'desktop' ? 'Fluid Canvas' : '375px Mobile Frame'}
              </span>
              {isRightCollapsed && (
                <button
                  type="button"
                  onClick={() => setIsRightCollapsed(false)}
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <PanelRightOpen className="h-3.5 w-3.5 text-teal-600" />
                  <span>Themes</span>
                </button>
              )}
            </div>
          </div>

          {/* Realistic Canvas Preview Frame (NO trapped internal scrollbar) */}
          <div className="bg-slate-100/70 border border-slate-200/90 rounded-3xl p-4 sm:p-6 lg:p-8 flex justify-center items-start shadow-inner min-h-[680px]">
            <div
              className={`transition-all duration-300 ${
                viewportMode === 'mobile'
                  ? 'w-[375px] max-w-[375px] bg-white rounded-[36px] shadow-2xl border-8 border-slate-800 overflow-hidden ring-1 ring-slate-900/10'
                  : 'w-full max-w-4xl bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden'
              }`}
            >
              <PortfolioThemeRenderer
                themeId={selectedThemeId}
                portfolio={livePortfolio}
                profile={profile}
                projects={projects}
                isPreview
              />
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Compact Design & Themes Drawer (~280px) */}
        {!isRightCollapsed && (
          <aside
            className={`w-full lg:w-72 xl:w-76 shrink-0 space-y-4 ${
              mobileTab !== 'theme' ? 'hidden lg:block' : ''
            }`}
            aria-label="Theme Selection"
          >
            {/* Header with collapse button on desktop */}
            <div className="hidden lg:flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-teal-600" />
                <span>Design System</span>
              </span>
              <button
                type="button"
                onClick={() => setIsRightCollapsed(true)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                title="Collapse Theme Panel"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 space-y-3.5 shadow-xs">
              {/* Full Gallery Trigger Button */}
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Maximize2 className="h-3.5 w-3.5 text-teal-400" />
                <span>Browse Full Theme Gallery</span>
              </button>

              {/* Single Column Readable Theme Picker */}
              <VisualThemePicker
                selectedThemeId={selectedThemeId}
                onSelectTheme={(id) => setSelectedThemeId(id)}
                mode="sidebar"
                onOpenModal={() => setIsThemeModalOpen(true)}
              />
            </div>
          </aside>
        )}
      </div>

      {/* 3. DEDICATED THEME GALLERY MODAL (Inspired by Reference Templates Gallery) */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-6xl rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl my-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-teal-600" />
                  <span>Portfolio Theme Gallery</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose a distinct architectural archetype for your engineering portfolio. Every theme features unique typography, project cards, and structural layouts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                title="Close Theme Gallery"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Theme Grid */}
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <VisualThemePicker
                selectedThemeId={selectedThemeId}
                onSelectTheme={(id) => {
                  setSelectedThemeId(id);
                  setIsThemeModalOpen(false);
                }}
                mode="modal"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400 font-mono">
                Active Theme: {PORTFOLIO_THEMES[selectedThemeId]?.name}
              </span>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Project Case-Study Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingProjectId ? 'Edit Project Case Study' : 'Create Project Case Study'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProjectModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {projectModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {projectModalError}
              </div>
            )}

            <form onSubmit={handleSaveProjectModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="e.g. Distributed Task Scheduler"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Slug</label>
                <input
                  type="text"
                  value={projectSlug}
                  onChange={(e) =>
                    setProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  }
                  placeholder="task-scheduler (leave blank to auto-generate)"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Executive Summary</label>
                <textarea
                  rows={2}
                  value={projectSummary}
                  onChange={(e) => setProjectSummary(e.target.value)}
                  placeholder="One or two sentences highlighting the core achievement..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technologies Used (comma-separated)
                </label>
                <input
                  type="text"
                  value={projectTechnologies}
                  onChange={(e) => setProjectTechnologies(e.target.value)}
                  placeholder="Go, Raft Consensus, gRPC, Docker, PostgreSQL"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Problem or Motivation</label>
                  <textarea
                    rows={2}
                    value={projectProblem}
                    onChange={(e) => setProjectProblem(e.target.value)}
                    placeholder="What real problem does this address?"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Approach &amp; Solution</label>
                  <textarea
                    rows={2}
                    value={projectApproach}
                    onChange={(e) => setProjectApproach(e.target.value)}
                    placeholder="How did you implement it?"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={projectDemoUrl}
                    onChange={(e) => setProjectDemoUrl(e.target.value)}
                    placeholder="https://demo.example.com"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Repository URL</label>
                  <input
                    type="url"
                    value={projectRepoUrl}
                    onChange={(e) => setProjectRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="concept">Concept</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visibility</label>
                  <select
                    value={projectVisibility}
                    onChange={(e) => setProjectVisibility(e.target.value as ProjectVisibility)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    <option value="public">Public (Show on Portfolio)</option>
                    <option value="private">Private (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingProjectId ? 'Update Project' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
