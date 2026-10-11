import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Compass,
  Info,
  Check,
} from 'lucide-react';
import { ProfileCompletenessResult } from '../../types';
import { CircularProgress } from './CircularProgress';

interface ProfileCompletenessCardProps {
  completeness: ProfileCompletenessResult;
  onNavigateTab: (tab: string) => void;
  onLaunchOnboarding?: () => void;
}

export const ProfileCompletenessCard: React.FC<ProfileCompletenessCardProps> = ({
  completeness,
  onNavigateTab,
  onLaunchOnboarding,
}) => {
  const isAllComplete = completeness.score === 100;

  // Motivational description based on score
  let statusBadge = { label: 'Getting Started', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  let statusSummary =
    'Build your professional presence. Complete the foundational criteria below to establish your student identity.';

  if (completeness.score === 100) {
    statusBadge = { label: 'Profile Ready', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    statusSummary =
      'Your student profile is fully documented and ready for portfolio presentation and verified public sharing.';
  } else if (completeness.score >= 80) {
    statusBadge = { label: 'Nearly Complete', color: 'bg-teal-50 text-teal-700 border-teal-200' };
    statusSummary =
      'Your core foundation is solid! Complete the remaining item to showcase a standout student profile.';
  } else if (completeness.score >= 40) {
    statusBadge = { label: 'Good Progress', color: 'bg-sky-50 text-sky-700 border-sky-200' };
    statusSummary =
      'You are halfway there. Add your core skills, education details, or project experiences to build credibility.';
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-8 shadow-xs space-y-6">
      {/* Prominent Score Visualization Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 border-b border-slate-100 pb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
          {/* Circular Gauge */}
          <CircularProgress
            score={completeness.score}
            size={76}
            strokeWidth={7}
            className="shadow-2xs rounded-full"
          />

          <div className="space-y-1.5 max-w-xl">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Profile Completeness
              </h2>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusBadge.color}`}
              >
                <Sparkles className="h-3 w-3" />
                {statusBadge.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{statusSummary}</p>
          </div>
        </div>

        {/* Guided Setup CTA Action */}
        <div className="shrink-0 flex items-center gap-2">
          {onLaunchOnboarding ? (
            <button
              type="button"
              onClick={onLaunchOnboarding}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-2xs"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{isAllComplete ? 'Review Setup Flow' : 'Guided Setup Flow'}</span>
            </button>
          ) : (
            <Link
              to="/app/onboarding"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-2xs"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{isAllComplete ? 'Review Setup Flow' : 'Guided Setup Flow'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Criteria Checklist Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">Improvement Checklist</span>
          <span>
            {completeness.criteria.filter((c) => c.isComplete).length} of{' '}
            {completeness.criteria.length} criteria completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {completeness.criteria.map((c) => {
            const isOptional = c.id === 'experience_or_credentials';

            return (
              <div
                key={c.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  c.isComplete
                    ? 'border-slate-200/60 bg-slate-50/50'
                    : 'border-amber-200/80 bg-amber-50/30 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  <div className="shrink-0 mt-0.5">
                    {c.isComplete ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <Circle className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          c.isComplete ? 'text-slate-800' : 'text-slate-900'
                        }`}
                      >
                        {c.label}
                      </span>
                      {isOptional && (
                        <span className="text-[10px] text-slate-400 font-medium">(Flexible)</span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">+{c.weight}%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{c.description}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  {c.isComplete ? (
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Done</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigateTab(c.actionTab)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs hover:border-teal-300 transition-colors"
                    >
                      <span>Add</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fairness & Early-Career Non-Penalization Note */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 flex items-start gap-3 text-xs text-slate-600">
        <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900">Designed for Every Stage of Learning</p>
          <p className="leading-relaxed text-[11px]">
            First-year students are not penalized for lacking formal internships. Projects, self-directed coursework, and extracurricular leadership fulfill experience requirements. Completing your profile establishes credibility without fabrications.
          </p>
        </div>
      </div>
    </div>
  );
};
