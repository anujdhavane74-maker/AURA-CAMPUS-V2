import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
  Calendar,
  Lock,
  Globe,
  X,
} from 'lucide-react';
import { EducationItem, ProfileVisibility } from '../../types';
import { educationSchema } from '../../schemas';
import { profileService } from '../../services/profile';

interface EducationManagerTabProps {
  userId: string;
  items: EducationItem[];
  onItemsChanged: (items: EducationItem[]) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const EducationManagerTab: React.FC<EducationManagerTabProps> = ({
  userId,
  items,
  onItemsChanged,
  onDirtyChange,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [institution, setInstitution] = useState('');
  const [qualification, setQualification] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<ProfileVisibility>('private');

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isDirty = isAdding || editingId !== null || institution.trim() !== '' || qualification.trim() !== '';

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const resetForm = () => {
    setInstitution('');
    setQualification('');
    setStartYear('');
    setEndYear('');
    setIsCurrent(false);
    setDescription('');
    setVisibility('private');
    setFormError(null);
    setValidationErrors({});
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (item: EducationItem) => {
    setInstitution(item.institution);
    setQualification(item.qualification || '');
    setDescription(item.description || '');
    setVisibility(item.visibility || 'private');

    // Parse dates if possible (e.g. "2022 - 2026" or "2023 - Present")
    if (item.dates) {
      if (item.dates.includes('Present')) {
        setIsCurrent(true);
        const parts = item.dates.split('-');
        setStartYear(parts[0]?.trim() || '');
        setEndYear('');
      } else {
        setIsCurrent(false);
        const parts = item.dates.split('-');
        setStartYear(parts[0]?.trim() || '');
        setEndYear(parts[1]?.trim() || '');
      }
    } else {
      setStartYear('');
      setEndYear('');
      setIsCurrent(false);
    }

    setEditingId(item.id);
    setIsAdding(false);
    setFormError(null);
    setValidationErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setValidationErrors({});

    // Date chronology validation
    let formattedDates = '';
    if (startYear.trim()) {
      const sY = parseInt(startYear.trim(), 10);
      if (isNaN(sY) || sY < 1970 || sY > 2050) {
        setValidationErrors({ startYear: 'Enter a valid 4-digit start year.' });
        return;
      }

      if (isCurrent) {
        formattedDates = `${startYear.trim()} - Present`;
      } else if (endYear.trim()) {
        const eY = parseInt(endYear.trim(), 10);
        if (isNaN(eY) || eY < 1970 || eY > 2050) {
          setValidationErrors({ endYear: 'Enter a valid 4-digit end year.' });
          return;
        }
        if (eY < sY) {
          setValidationErrors({ endYear: 'End year cannot be earlier than start year.' });
          return;
        }
        formattedDates = `${startYear.trim()} - ${endYear.trim()}`;
      } else {
        formattedDates = startYear.trim();
      }
    } else if (endYear.trim()) {
      formattedDates = endYear.trim();
    }

    const validation = educationSchema.safeParse({
      institution,
      qualification: qualification || undefined,
      dates: formattedDates || undefined,
      description: description || undefined,
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
      const res = await profileService.updateEducation(userId, editingId, {
        institution,
        qualification,
        dates: formattedDates,
        description,
        visibility,
      });

      setSaving(false);

      if (res.error || !res.data) {
        setFormError(res.error || 'Failed to update education entry.');
      } else {
        onItemsChanged(items.map((it) => (it.id === editingId ? res.data! : it)));
        resetForm();
      }
    } else {
      const res = await profileService.createEducation(userId, {
        institution,
        qualification,
        dates: formattedDates,
        description,
        visibility,
      });

      setSaving(false);

      if (res.error || !res.data) {
        setFormError(res.error || 'Failed to add education entry.');
      } else {
        onItemsChanged([res.data, ...items]);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    const res = await profileService.deleteEducation(userId, id);
    setSaving(false);
    setDeletingId(null);

    if (res.error) {
      setFormError(res.error || 'Failed to delete education entry.');
    } else {
      onItemsChanged(items.filter((it) => it.id !== id));
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Education &amp; Academics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Document your degrees, universities, high school, or ongoing coursework.
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
            <span>Add Education</span>
          </button>
        )}
      </div>

      {formError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Inline Form for Adding or Editing */}
      {(isAdding || editingId) && (
        <div className="rounded-2xl border border-teal-200/90 bg-teal-50/20 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-teal-100/70 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              {editingId ? 'Edit Education Entry' : 'Add New Education Entry'}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="edu-inst">
                  Institution Name *
                </label>
                <input
                  id="edu-inst"
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. University of California, Berkeley"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {validationErrors.institution && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.institution}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="edu-qual">
                  Degree / Qualification / Major
                </label>
                <input
                  id="edu-qual"
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. B.S. in Electrical Engineering & Computer Sciences"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            {/* Date Chronology Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="edu-startYear">
                  Start Year
                </label>
                <input
                  id="edu-startYear"
                  type="number"
                  placeholder="e.g. 2022"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {validationErrors.startYear && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.startYear}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="edu-endYear">
                  End Year
                </label>
                <input
                  id="edu-endYear"
                  type="number"
                  disabled={isCurrent}
                  placeholder={isCurrent ? 'Present' : 'e.g. 2026'}
                  value={isCurrent ? '' : endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                {validationErrors.endYear && (
                  <p className="text-[11px] text-rose-600 mt-1">{validationErrors.endYear}</p>
                )}
              </div>

              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCurrent}
                    onChange={(e) => {
                      setIsCurrent(e.target.checked);
                      if (e.target.checked) setEndYear('');
                    }}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Currently Studying Here</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="edu-desc">
                Academic Honors, Relevant Coursework, or Focus
              </label>
              <textarea
                id="edu-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Dean's Honor List, Coursework in Operating Systems, Database Internals, Algorithms."
                maxLength={1000}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {/* Visibility Toggle */}
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
                  <span>{editingId ? 'Update Entry' : 'Save Education'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Education List / Timeline */}
      {items.length === 0 && !isAdding ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800">No Education Entries Added</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your university, community college, or secondary school to show your academic foundation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add First Education Entry</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{item.institution}</h3>
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

                  {item.qualification && (
                    <p className="text-xs font-medium text-slate-700">{item.qualification}</p>
                  )}

                  {item.dates && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>{item.dates}</span>
                    </p>
                  )}

                  {item.description && (
                    <p className="text-xs text-slate-600 pt-1 leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions & Delete Confirmation */}
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                {deletingId === item.id ? (
                  <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
                    <span className="text-[11px] text-rose-700 font-semibold px-1.5">Delete?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={saving}
                      className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(null)}
                      className="px-2 py-1 rounded-lg bg-white text-slate-600 text-[11px] font-medium border border-slate-200 hover:bg-slate-50"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      aria-label="Edit education entry"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(item.id)}
                      aria-label="Delete education entry"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
