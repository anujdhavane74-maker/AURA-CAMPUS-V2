import React, { useState, useEffect } from 'react';
import {
  Code2,
  Plus,
  X,
  AlertCircle,
  Loader2,
  Tag,
  Check,
} from 'lucide-react';
import { SkillItem } from '../../types';
import { skillSchema } from '../../schemas';
import { profileService } from '../../services/profile';

interface SkillsManagerTabProps {
  userId: string;
  items: SkillItem[];
  onItemsChanged: (items: SkillItem[]) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

const COMMON_SUGGESTIONS = [
  'TypeScript',
  'Python',
  'React',
  'SQL',
  'Node.js',
  'Git',
  'Tailwind CSS',
  'PostgreSQL',
  'Java',
  'C++',
  'Docker',
  'REST APIs',
  'Figma',
  'Machine Learning',
  'Data Structures',
];

const PROFICIENCY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
];

export const SkillsManagerTab: React.FC<SkillsManagerTabProps> = ({
  userId,
  items,
  onItemsChanged,
  onDirtyChange,
}) => {
  const [skillName, setSkillName] = useState('');
  const [proficiency, setProficiency] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDirty = skillName.trim() !== '';

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleAddSkill = async (candidateName?: string) => {
    const targetSkill = (candidateName || skillName).trim();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!targetSkill) {
      setErrorMessage('Please enter a skill name.');
      return;
    }

    // Check for duplicate locally
    const isDuplicate = items.some(
      (it) => it.skill.toLowerCase() === targetSkill.toLowerCase()
    );
    if (isDuplicate) {
      setErrorMessage(`"${targetSkill}" is already in your skills list.`);
      return;
    }

    const validation = skillSchema.safeParse({
      skill: targetSkill,
      proficiency: proficiency || undefined,
      sortOrder: items.length,
    });

    if (!validation.success) {
      setErrorMessage(validation.error.errors[0]?.message || 'Invalid skill input.');
      return;
    }

    setSaving(true);

    const res = await profileService.createSkill(userId, {
      skill: targetSkill,
      proficiency: proficiency || undefined,
      sortOrder: items.length,
    });

    setSaving(false);

    if (res.error || !res.data) {
      setErrorMessage(res.error || 'Failed to add skill.');
    } else {
      onItemsChanged([...items, res.data]);
      setSkillName('');
      setProficiency('');
      setSuccessMessage(`Added "${res.data.skill}" successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    setDeletingId(id);
    const res = await profileService.deleteSkill(userId, id);
    setSaving(false);
    setDeletingId(null);

    if (res.error) {
      setErrorMessage(res.error || 'Failed to remove skill.');
    } else {
      onItemsChanged(items.filter((it) => it.id !== id));
    }
  };

  // Filter suggestion list to exclude already added skills
  const availableSuggestions = COMMON_SUGGESTIONS.filter(
    (s) => !items.some((it) => it.skill.toLowerCase() === s.toLowerCase())
  ).slice(0, 8);

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">Skills &amp; Capabilities</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select your technical and professional capabilities. Adding at least 3 skills enhances your profile completeness.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 p-3 text-xs text-teal-800">
          <Check className="h-4 w-4 text-teal-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Add Skill Input Form */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 space-y-3">
        <label className="block text-xs font-semibold text-slate-700" htmlFor="skill-input">
          Add a Skill
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Tag className="h-4 w-4" />
            </span>
            <input
              id="skill-input"
              type="text"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. TypeScript, React, System Design, PyTorch..."
              maxLength={60}
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <select
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
          >
            <option value="">Proficiency (Optional)</option>
            {PROFICIENCY_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleAddSkill()}
            disabled={saving || !skillName.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-2xs"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            <span>Add Skill</span>
          </button>
        </div>

        {/* Quick Suggestions */}
        {availableSuggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-[11px] font-medium text-slate-400">Popular:</span>
            {availableSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddSkill(sug)}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200/90 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-teal-700 hover:border-teal-300 transition-colors"
              >
                <Plus className="h-2.5 w-2.5" />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Added Skills Chip Wall */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Your Skills ({items.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Skills are displayed on your profile and portfolio
          </span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Code2 className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-slate-700">No skills added yet</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Type in a skill above or click on one of the popular suggestions to build your toolkit.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="inline-flex items-center gap-2 rounded-xl border border-teal-200/80 bg-teal-50/60 pl-3 pr-2 py-1.5 text-xs text-teal-900 shadow-2xs group"
              >
                <span className="font-semibold">{it.skill}</span>
                {it.proficiency && (
                  <span className="rounded-md bg-teal-100 px-1.5 py-0.5 text-[10px] font-medium text-teal-800">
                    {it.proficiency}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(it.id)}
                  disabled={deletingId === it.id}
                  aria-label={`Remove skill ${it.skill}`}
                  className="p-1 rounded-md text-teal-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  {deletingId === it.id ? (
                    <Loader2 className="h-3 w-3 animate-spin text-teal-600" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
