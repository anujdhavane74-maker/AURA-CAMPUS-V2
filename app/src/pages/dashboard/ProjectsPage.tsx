import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/useAuth';
import { Project, ProjectStatus, ProjectVisibility } from '../../types';
import { portfolioService } from '../../services/portfolio';
import {
  FolderGit2,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Github,
  Lock,
  Globe,
  Loader2,
  AlertCircle,
  X,
  Check,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [problem, setProblem] = useState('');
  const [approach, setApproach] = useState('');
  const [outcome, setOutcome] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('completed');
  const [visibility, setVisibility] = useState<ProjectVisibility>('public');

  const loadProjects = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setErrorMessage(null);
    const res = await portfolioService.fetchUserProjects(user.id);
    setLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setProjects(res.data);
    }
  }, [user?.id]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setSummary('');
    setProblem('');
    setApproach('');
    setOutcome('');
    setTechnologies('');
    setRepositoryUrl('');
    setDemoUrl('');
    setStatus('completed');
    setVisibility('public');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setSummary(p.summary || '');
    setProblem(p.problem || '');
    setApproach(p.approach || '');
    setOutcome(p.outcome || '');
    setTechnologies(p.technologies.join(', '));
    setRepositoryUrl(p.repositoryUrl || '');
    setDemoUrl(p.demoUrl || '');
    setStatus(p.status);
    setVisibility(p.visibility);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!title.trim()) {
      setModalError('Project title is required.');
      return;
    }

    setSaving(true);
    setModalError(null);

    const techArray = technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const cleanSlug = slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    if (editingId) {
      const res = await portfolioService.updateProject(user.id, editingId, {
        title,
        slug: cleanSlug,
        summary,
        problem,
        approach,
        outcome,
        technologies: techArray,
        repositoryUrl,
        demoUrl,
        status,
        visibility,
      });

      setSaving(false);

      if (res.error || !res.data) {
        setModalError(res.error || 'Failed to update project.');
      } else {
        setProjects(projects.map((it) => (it.id === editingId ? res.data! : it)));
        setIsModalOpen(false);
        setStatusMessage('Project updated successfully.');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } else {
      const res = await portfolioService.createProject(user.id, {
        title,
        slug: cleanSlug,
        summary,
        problem,
        approach,
        outcome,
        technologies: techArray,
        repositoryUrl,
        demoUrl,
        status,
        visibility,
      });

      setSaving(false);

      if (res.error || !res.data) {
        setModalError(res.error || 'Failed to create project.');
      } else {
        setProjects([res.data, ...projects]);
        setIsModalOpen(false);
        setStatusMessage('Project created successfully.');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    const res = await portfolioService.deleteProject(user.id, id);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setProjects(projects.filter((p) => p.id !== id));
      setStatusMessage('Project deleted.');
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Projects &amp; Proof of Work</h1>
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200 font-mono">
                {projects.length} Entries
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Document genuine proof of work with problem motivation, implementation approach, and live demo links.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-2xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-teal-50 border border-teal-200 p-3.5 text-xs text-teal-800">
          <Check className="h-4 w-4 text-teal-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center space-y-3">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-teal-600" />
          <p className="text-xs text-slate-500 font-medium">Loading verified student projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <FolderGit2 className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900">No Projects Added Yet</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Showcase what you build. First-year coursework, hackathons, and personal tools all count!
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Your First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-base text-slate-900">{proj.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span>slug: {proj.slug}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-0.5">
                        {proj.visibility === 'public' ? (
                          <span className="text-emerald-700 flex items-center gap-0.5">
                            <Globe className="h-3 w-3" /> Public
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-0.5">
                            <Lock className="h-3 w-3" /> Private
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Edit Project"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {proj.summary && (
                  <p className="text-xs text-slate-600 leading-relaxed">{proj.summary}</p>
                )}

                {proj.problem && (
                  <div className="text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-700 text-[11px] block uppercase tracking-wider">Problem</span>
                    <p className="text-slate-600">{proj.problem}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs pt-1">
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700"
                    >
                      <span>Live Demo</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {proj.repositoryUrl && (
                    <a
                      href={proj.repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                    >
                      <Github className="h-3 w-3" />
                      <span>Code Repository</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? 'Edit Project' : 'Create Project'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Task Scheduler"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Slug (optional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="auto-generated from title"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Summary</label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Short description of the system or application..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Problem Statement</label>
                <textarea
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder="What problem were you solving?"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies (comma separated)</label>
                <input
                  type="text"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="Go, Redis, Docker, PostgreSQL"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Repository URL</label>
                  <input
                    type="url"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as ProjectVisibility)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="public">Public (Visible in Portfolio)</option>
                    <option value="private">Private (Only You)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="planning">Planning</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 shadow-2xs transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingId ? 'Save Changes' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
