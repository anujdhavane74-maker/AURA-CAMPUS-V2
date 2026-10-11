import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Lock,
  Globe,
  X,
  ArrowUp,
  ArrowDown,
  Github,
  Linkedin,
  Globe2,
} from 'lucide-react';
import { ExternalLinkItem, ProfileVisibility } from '../../types';
import { externalLinkSchema } from '../../schemas';
import { profileService } from '../../services/profile';

interface ExternalLinksManagerTabProps {
  userId: string;
  items: ExternalLinkItem[];
  onItemsChanged: (items: ExternalLinkItem[]) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

function detectPlatformIcon(url: string, label: string) {
  const combined = (url + ' ' + label).toLowerCase();
  if (combined.includes('github')) return Github;
  if (combined.includes('linkedin')) return Linkedin;
  return Globe2;
}

export const ExternalLinksManagerTab: React.FC<ExternalLinksManagerTabProps> = ({
  userId,
  items,
  onItemsChanged,
  onDirtyChange,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [visibility, setVisibility] = useState<ProfileVisibility>('public');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isDirty = isAdding || editingId !== null || label.trim() !== '' || url.trim() !== '';

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const resetForm = () => {
    setLabel('');
    setUrl('');
    setVisibility('public');
    setFormError(null);
    setValidationErrors({});
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (item: ExternalLinkItem) => {
    setLabel(item.label);
    setUrl(item.url);
    setVisibility(item.visibility || 'public');

    setEditingId(item.id);
    setIsAdding(false);
    setFormError(null);
    setValidationErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const normalizedUrl = url.trim();

    const validation = externalLinkSchema.safeParse({
      label: label.trim(),
      url: normalizedUrl,
      visibility,
      sortOrder: items.length,
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errors[String(err.path[0])] = err.message;
      });
      setValidationErrors(errors);
      return;
    }

    setSaving(true);

    if (editingId) {
      const res = await profileService.updateExternalLink(userId, editingId, {
        label: label.trim(),
        url: normalizedUrl,
        visibility,
      });

      setSaving(false);

      if (res.error || !res.data) {
        setFormError(res.error || 'Failed to update link.');
      } else {
        onItemsChanged(items.map((it) => (it.id === editingId ? res.data! : it)));
        resetForm();
      }
    } else {
      const res = await profileService.createExternalLink(userId, {
        label: label.trim(),
        url: normalizedUrl,
        visibility,
        sortOrder: items.length,
      });

      setSaving(false);

      if (res.error || !res.data) {
        setFormError(res.error || 'Failed to add external link.');
      } else {
        onItemsChanged([...items, res.data]);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    const res = await profileService.deleteExternalLink(userId, id);
    setSaving(false);
    setDeletingId(null);

    if (res.error) {
      setFormError(res.error || 'Failed to delete external link.');
    } else {
      onItemsChanged(items.filter((it) => it.id !== id));
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const current = items[index];
    const target = items[targetIndex];
    if (!current || !target) return;

    const newItems = [...items];
    newItems[index] = target;
    newItems[targetIndex] = current;

    // Update sortOrder values locally
    const updated = newItems.map((item, idx) => ({ ...item, sortOrder: idx }));
    onItemsChanged(updated);

    const first = updated[index];
    const second = updated[targetIndex];
    if (first && second) {
      await Promise.all([
        profileService.updateExternalLink(userId, first.id, { sortOrder: index }),
        profileService.updateExternalLink(userId, second.id, { sortOrder: targetIndex }),
      ]);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">External Links &amp; Profiles</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct visitors to your GitHub repositories, LinkedIn, personal domain, or blog.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add External Link</span>
          </button>
        )}
      </div>

      {formError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Inline Form */}
      {(isAdding || editingId) && (
        <div className="rounded-2xl border border-teal-200/90 bg-teal-50/20 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-teal-100/70 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              {editingId ? 'Edit External Link' : 'Add New External Link'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="link-label">
                  Link Label *
                </label>
                <input
                  id="link-label"
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. GitHub, LinkedIn, Personal Website"
                  maxLength={80}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {validationErrors.label && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.label}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="link-url">
                  Destination URL *
                </label>
                <input
                  id="link-url"
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {validationErrors.url && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.url}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-teal-100/60">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700">Visibility:</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as ProfileVisibility)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-teal-500 focus:outline-none"
                >
                  <option value="public">Public (Visible on Public Profile)</option>
                  <option value="private">Private (Only You)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingId ? 'Update Link' : 'Save Link'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Links List */}
      {items.length === 0 && !isAdding ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <LinkIcon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800">No External Links Added</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your code repositories, professional networks, or portfolio website to share your proof of work.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add First Link</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const PlatformIcon = detectPlatformIcon(item.url, item.label);
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Reordering Controls */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      aria-label="Move link up"
                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      aria-label="Move link down"
                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <PlatformIcon className="h-4.5 w-4.5" />
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {item.label}
                      </span>
                      {item.visibility === 'public' ? (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          <Globe className="h-2.5 w-2.5" />
                          Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                          <Lock className="h-2.5 w-2.5" />
                          Private
                        </span>
                      )}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-teal-600 hover:text-teal-700 truncate flex items-center gap-1 font-mono"
                    >
                      <span>{item.url}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* Actions & Deletion Confirmation */}
                <div className="flex items-center gap-1 shrink-0">
                  {deletingId === item.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={saving}
                        className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="px-1.5 py-0.5 rounded bg-white text-slate-600 text-[10px] border border-slate-200"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        aria-label="Edit link"
                        className="p-1 rounded text-slate-400 hover:text-slate-700"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(item.id)}
                        aria-label="Delete link"
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
