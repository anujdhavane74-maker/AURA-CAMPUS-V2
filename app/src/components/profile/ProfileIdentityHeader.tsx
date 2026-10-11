import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Shield,
  Copy,
  Share2,
  ExternalLink,
  GraduationCap,
  MapPin,
  Check,
  Compass,
  Edit3,
} from 'lucide-react';
import { UserProfile, ProfileCompletenessResult } from '../../types';
import { CircularProgress } from './CircularProgress';
import { profileService } from '../../services/profile';

interface ProfileIdentityHeaderProps {
  profile: UserProfile | null;
  completeness: ProfileCompletenessResult;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onShareClick: () => void;
}

export const ProfileIdentityHeader: React.FC<ProfileIdentityHeaderProps> = ({
  profile,
  completeness,
  onTabChange,
  onShareClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const displayName = profile?.displayName || 'Student Profile';
  const handle = profile?.handle || 'student';
  const isPublic = profile?.visibility === 'public';
  const avatarUrl = profileService.getAvatarUrl(profile?.avatarPath);

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w.charAt(0).toUpperCase())
      .join('') || handle.slice(0, 2).toUpperCase();

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/u/${handle}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API unavailable
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Avatar & Identity Info */}
        <div className="flex items-start gap-4 sm:gap-5 min-w-0">
          <div
            className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-bold text-xl sm:text-2xl shadow-sm border-2 border-white ring-2 ring-teal-100 overflow-hidden"
            aria-label={`Avatar for ${displayName}`}
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

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {displayName}
              </h1>
              <span className="text-sm font-mono text-slate-500">@{handle}</span>
              {isPublic ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <Globe className="h-3 w-3" />
                  Public
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                  <Shield className="h-3 w-3 text-slate-500" />
                  Private
                </span>
              )}
            </div>

            {profile?.headline && (
              <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                {profile.headline}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
              {profile?.institution && (
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
                  <span>
                    {profile.institution}
                    {profile.program ? ` • ${profile.program}` : ''}
                    {profile.graduationYear ? ` ('${String(profile.graduationYear).slice(-2)})` : ''}
                  </span>
                </span>
              )}
              {profile?.locationLabel && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span>{profile.locationLabel}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => onTabChange('personal')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Edit3 className="h-3.5 w-3.5 text-slate-500" />
            <span>Edit Profile</span>
          </button>

          {isPublic ? (
            <Link
              to={`/u/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              <span>View Public</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onTabChange('privacy')}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Shield className="h-3.5 w-3.5 text-slate-500" />
              <span>Privacy</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy URL</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onShareClick}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-2xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Redesigned Circular Completeness Indicator & Next Step Guidance */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <CircularProgress score={completeness.score} size={44} strokeWidth={4} />

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {completeness.score}% Complete
              </span>
              <span className="text-[11px] text-slate-400">
                ({completeness.criteria.filter((c) => c.isComplete).length}/
                {completeness.criteria.length} items)
              </span>
            </div>

            {completeness.topSuggestions[0] ? (
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>Next:</span>
                <button
                  type="button"
                  onClick={() => onTabChange(completeness.topSuggestions[0]!.actionTab)}
                  className="font-medium text-teal-600 hover:text-teal-700 underline text-left"
                >
                  {completeness.topSuggestions[0]!.actionLabel}
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-emerald-700 font-medium">
                Profile foundation complete
              </p>
            )}
          </div>
        </div>

        <Link
          to="/app/onboarding"
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors w-fit"
        >
          <Compass className="h-3.5 w-3.5 text-teal-600" />
          <span>Launch Guided Onboarding</span>
        </Link>
      </div>
    </div>
  );
};
