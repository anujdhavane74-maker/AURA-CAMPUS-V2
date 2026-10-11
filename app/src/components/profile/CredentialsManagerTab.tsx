import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  Calendar,
  ExternalLink,
  Lock,
  Globe,
  X,
  ShieldAlert,
} from 'lucide-react';
import { CredentialItem, ProfileVisibility } from '../../types';
import { credentialSchema } from '../../schemas';
import { profileService } from '../../services/profile';

interface CredentialsManagerTabProps {
  userId: string;
  items: CredentialItem[];
  onItemsChanged: (items: CredentialItem[]) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

const CREDENTIAL_KINDS = [
  'Certificate',
  'Award / Competition',
  'Honor / Scholarship',
  'License',
  'Course Completion',
];

export const CredentialsManagerTab: React.FC<CredentialsManagerTabProps> = ({
  userId,
  items,
  onItemsChanged,
  onDirtyChange,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [kind, setKind] = useState('Certificate');
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [visibility, setVisibility] = useState<ProfileVisibility>('private');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isDirty = isAdding || editingId !== null || title.trim() !== '' || issuer.trim() !== '';

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const resetForm = () => {
    setKind('Certificate');
    setTitle('');
    setIssuer('');
    setIssuedAt('');
    setCredentialUrl('');
    setVisibility('private');
    setFormError(null);
    setValidationErrors({});
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (item: CredentialItem) => {
    setKind(item.kind);
    setTitle(item.title);
    setIssuer(item.issuer);
    setIssuedAt(item.issuedAt || '');
    setCredentialUrl(item.credentialUrl || '');
    setVisibility(item.visibility || 'private');

    setEditingId(item.id);
    setIsAdding(false);
    setFormError(null);
    setValidationErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    const validation = credentialSchema.safeParse({
      kind,
      title,
      issuer,
      issuedAt: issuedAt.trim() || undefined,
      credentialUrl: credentialUrl.trim() || undefined,
      visibility,
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
      const res = await profileService.updateCredential(userId, editingId, {
        kind,
        title,
        issuer,
        issuedAt: issuedAt.trim() || undefined,
        credentialUrl: credentialUrl.trim() || undefined,
        visibility,
      });

      setSaving(false);

      if (res.error || !res.data) {
        setFormError(res.error || 'Failed to update credential.');
      } else {
        onItemsChanged(items.map((it) => (it.id === editingId ? res.data! : it)));
        resetForm();
      }
    } else {
      const res = await profileService.createCredential(userId, {
        kind,
        title,
        issuer,
        issuedAt: issuedAt.trim() || undefined,
        credentialUrl: credentialUrl.trim() || undefined,
        visibility,
      });

      setSaving(false);

      if (res.error || !res.data) {
        setFormError(res.error || 'Failed to add credential.');
      } else {
        onItemsChanged([res.data, ...items]);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    const res = await profileService.deleteCredential(userId, id);
    setSaving(false);
    setDeletingId(null);

    if (res.error) {
      setFormError(res.error || 'Failed to delete credential.');
    } else {
      onItemsChanged(items.filter((it) => it.id !== id));
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Credentials &amp; Achievements</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Certifications, competition wins, hackathon awards, honors, and verified course completions.
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
            <span>Add Credential</span>
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
              {editingId ? 'Edit Credential' : 'Add New Credential'}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cred-kind">
                  Type of Credential *
                </label>
                <select
                  id="cred-kind"
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {CREDENTIAL_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cred-title">
                  Credential / Award Title *
                </label>
                <input
                  id="cred-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AWS Certified Cloud Practitioner or 1st Place CalHacks"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {validationErrors.title && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.title}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cred-issuer">
                  Issuing Organization *
                </label>
                <input
                  id="cred-issuer"
                  type="text"
                  required
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  placeholder="e.g. Amazon Web Services, MLH, Coursera"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {validationErrors.issuer && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.issuer}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cred-date">
                  Issue Date (YYYY-MM-DD)
                </label>
                <input
                  id="cred-date"
                  type="date"
                  value={issuedAt}
                  onChange={(e) => setIssuedAt(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {validationErrors.issuedAt && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.issuedAt}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="cred-url">
                Verification / Certificate Link
              </label>
              <input
                id="cred-url"
                type="url"
                value={credentialUrl}
                onChange={(e) => setCredentialUrl(e.target.value)}
                placeholder="https://credly.com/badges/..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              {validationErrors.credentialUrl && (
                <p className="text-[11px] text-rose-600 mt-1">{validationErrors.credentialUrl}</p>
              )}
            </div>

            {/* Visibility & Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-teal-100/60">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700">Section Visibility:</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as ProfileVisibility)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-teal-500 focus:outline-none"
                >
                  <option value="private">Private (Only You)</option>
                  <option value="public">Public (Visible on Public Profile)</option>
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
                  <span>{editingId ? 'Update Credential' : 'Save Credential'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Integrity Transparency Notice */}
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p>
          Credentials listed here are student-documented achievements. Aura Campus clearly marks student-reported certificates as self-documented unless audited by an institutional verification partner.
        </p>
      </div>

      {/* Credential Cards List */}
      {items.length === 0 && !isAdding ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Award className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800">No Credentials Added</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add cloud certificates, coding contest badges, honor societies, or university scholarships.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add First Credential</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4.5 flex flex-col justify-between gap-3 hover:border-slate-300 transition-colors shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200">
                    {item.kind}
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

                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{item.issuer}</p>
                </div>

                {item.issuedAt && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>Issued: {item.issuedAt}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {item.credentialUrl ? (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400">Self-documented</span>
                )}

                <div className="flex items-center gap-1">
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
                        className="p-1 rounded text-slate-400 hover:text-slate-700"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
