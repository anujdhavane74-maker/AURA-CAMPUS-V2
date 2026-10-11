import React, { useState } from 'react';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  LinkIcon,
} from 'lucide-react';
import { ProfileSectionItem, ProfileVisibility } from '../../types';
import { profileService } from '../../services/profile';

interface ProfileSectionsOrganizerTabProps {
  userId: string;
  sections: ProfileSectionItem[];
  onSectionsChanged: (sections: ProfileSectionItem[]) => void;
}

const DEFAULT_SECTION_METAS: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  education: {
    label: 'Education & Academics',
    icon: GraduationCap,
    description: 'Degrees, qualifications, universities, and coursework timeline.',
  },
  experience: {
    label: 'Experience & Leadership',
    icon: Briefcase,
    description: 'Internships, student clubs, work, and community leadership.',
  },
  skills: {
    label: 'Skills & Toolkit',
    icon: Code2,
    description: 'Technical and professional skills chips with proficiency levels.',
  },
  credentials: {
    label: 'Credentials & Achievements',
    icon: Award,
    description: 'Certificates, scholarships, honors, and competition awards.',
  },
  links: {
    label: 'External Links & Profiles',
    icon: LinkIcon,
    description: 'GitHub repositories, LinkedIn, personal sites, and portfolios.',
  },
};

export const ProfileSectionsOrganizerTab: React.FC<ProfileSectionsOrganizerTabProps> = ({
  userId,
  sections,
  onSectionsChanged,
}) => {
  // If user has no section rows yet, initialize standard set
  const initialSections: ProfileSectionItem[] =
    sections.length > 0
      ? sections
      : Object.keys(DEFAULT_SECTION_METAS).map((key, idx) => ({
          id: `default-${key}`,
          userId,
          sectionType: key,
          title: DEFAULT_SECTION_METAS[key]?.label || key,
          content: {},
          sortOrder: idx,
          visibility: 'public' as ProfileVisibility,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

  const [items, setItems] = useState<ProfileSectionItem[]>(initialSections);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggleVisibility = async (index: number) => {
    const target = items[index];
    if (!target) return;

    const newVis: ProfileVisibility = target.visibility === 'public' ? 'private' : 'public';
    const updated = items.map((it, idx) => (idx === index ? { ...it, visibility: newVis } : it));
    setItems(updated);
    onSectionsChanged(updated);
    setErrorMessage(null);
    setStatusMessage('Updating visibility...');

    const res = await profileService.upsertProfileSections(userId, updated);
    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.data.length > 0) {
      setItems(res.data);
      onSectionsChanged(res.data);
      setStatusMessage('Section visibility updated.');
      setTimeout(() => setStatusMessage(null), 2500);
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

    const reordered = newItems.map((item, idx) => ({ ...item, sortOrder: idx }));
    setItems(reordered);
    onSectionsChanged(reordered);
    setErrorMessage(null);
    setStatusMessage('Saving section order...');

    const res = await profileService.upsertProfileSections(userId, reordered);
    if (res.error) {
      setErrorMessage(res.error);
    } else if (res.data.length > 0) {
      setItems(res.data);
      onSectionsChanged(res.data);
      setStatusMessage('Section display order updated.');
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">Profile Sections &amp; Organization</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Control the display order and public visibility of major sections across your public profile.
        </p>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 p-3 text-xs text-teal-800">
          <Check className="h-4 w-4 text-teal-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-3">
        {items.map((sec, idx) => {
          const meta = DEFAULT_SECTION_METAS[sec.sectionType] || {
            label: sec.title || sec.sectionType,
            icon: Layers,
            description: 'Custom profile section content',
          };
          const Icon = meta.icon;
          const isVisible = sec.visibility === 'public';

          return (
            <div
              key={sec.sectionType}
              className={`rounded-2xl border p-4 sm:p-5 flex items-center justify-between gap-4 transition-all shadow-2xs ${
                isVisible
                  ? 'border-slate-200/80 bg-white'
                  : 'border-slate-200/50 bg-slate-50/60 opacity-70'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    aria-label={`Move ${meta.label} section up`}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    aria-label={`Move ${meta.label} section down`}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isVisible ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{meta.label}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Position #{idx + 1}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{meta.description}</p>
                </div>
              </div>

              {/* Visibility Toggle Button */}
              <button
                type="button"
                onClick={() => handleToggleVisibility(idx)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors shrink-0 ${
                  isVisible
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isVisible ? (
                  <>
                    <Eye className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Visible</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
