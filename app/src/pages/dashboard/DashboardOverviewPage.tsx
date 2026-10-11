import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  Shield,
  Layers,
  Briefcase,
  User,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  MailCheck,
  Compass,
  Sparkles,
} from 'lucide-react';
import { profileService } from '../../services/profile';
import { ProfileCompletenessResult, UserProfile } from '../../types';
import { CircularProgress } from '../../components/profile/CircularProgress';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompletenessResult | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      profileService.getFullProfile(user.id).then((res) => {
        if (!isMounted || !res.data) return;
        setProfile(res.data.profile);
        setCompleteness(res.data.completeness);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const displayName =
    profile?.displayName ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'Student';

  const avatarUrl = profileService.getAvatarUrl(profile?.avatarPath);
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w: string) => w.charAt(0).toUpperCase())
      .join('') || 'ST';

  const score = completeness?.score ?? 0;
  const isIncomplete = completeness && score < 100;

  return (
    <div className="space-y-6">
      {/* Overview Header with Avatar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-bold text-lg shadow-sm border-2 border-white ring-2 ring-teal-100 overflow-hidden">
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

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome, {displayName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  <Shield className="h-3 w-3 text-slate-500" />
                  {profile?.visibility === 'public' ? 'Public' : 'Private Account'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2">
                <span>Student Dashboard</span>
                {user?.email && (
                  <>
                    <span>&bull;</span>
                    <span className="inline-flex items-center gap-1 text-teal-700 font-mono text-xs">
                      <MailCheck className="h-3.5 w-3.5" />
                      {user.email}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/app/profile?tab=preview"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview as Visitor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Prominent Onboarding / Continue Setup Banner */}
      {isIncomplete && (
        <div className="rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-50/90 to-emerald-50/50 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <CircularProgress score={score} size={64} strokeWidth={6} />
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                  <span>Profile Onboarding</span>
                </span>
                <span className="rounded-full bg-teal-200/70 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                  {score}% Complete
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Continue setting up your student profile
              </h2>
              <p className="text-xs text-slate-600 max-w-lg">
                Complete your core education, skills, and links to unlock polished portfolio themes and verified sharing.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              to="/app/onboarding"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-xs"
            >
              <Compass className="h-4 w-4" />
              <span>Continue Setup</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Progress Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <User className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-teal-700">
                {completeness ? `${score}% Complete` : 'Profile'}
              </span>
            </div>
            <h2 className="font-semibold text-slate-900 text-sm">Student Profile</h2>
            <p className="text-xs text-slate-500">
              Personal bio, institution, skills, and credentials.
            </p>
          </div>
          <Link
            to="/app/profile"
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 pt-2 border-t border-slate-100"
          >
            <span>Edit Profile</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Portfolio Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Layers className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-purple-700">Theme: Studio</span>
            </div>
            <h2 className="font-semibold text-slate-900 text-sm">Portfolio Builder</h2>
            <p className="text-xs text-slate-500">
              Customize layouts, select from 12 themes, and publish.
            </p>
          </div>
          <Link
            to="/app/portfolio"
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 pt-2 border-t border-slate-100"
          >
            <span>Customize Portfolio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Projects Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Briefcase className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold text-blue-700">Proof of Work</span>
            </div>
            <h2 className="font-semibold text-slate-900 text-sm">Projects &amp; Case Studies</h2>
            <p className="text-xs text-slate-500">
              Document problems, approaches, and real outcomes.
            </p>
          </div>
          <Link
            to="/app/projects"
            className="mt-4 flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 pt-2 border-t border-slate-100"
          >
            <span>Manage Projects</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Security & Integrity Status */}
      <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 flex items-center gap-4">
        <CheckCircle2 className="h-6 w-6 text-teal-600 shrink-0" />
        <div className="text-xs text-teal-900 space-y-0.5">
          <p className="font-bold">Honest Persistence Rule</p>
          <p className="text-teal-800">
            Per the Aura Campus charter, no demo counters or fake success toasts are displayed. Every action is verified by the backend.
          </p>
        </div>
      </div>

      {/* Activity Timeline Shell */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <h2 className="font-semibold text-slate-900 text-sm">Recent Activity</h2>
        <div className="flex items-center gap-3 text-xs text-slate-500 py-3 border-b border-slate-100">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>Project workspace initialized in clean architecture baseline.</span>
        </div>
      </div>
    </div>
  );
};
