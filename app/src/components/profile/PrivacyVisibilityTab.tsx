import React, { useState } from 'react';
import {
  Shield,
  Globe,
  Compass,
  Check,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { UserProfile, ProfileVisibility } from '../../types';
import { profileService } from '../../services/profile';

interface PrivacyVisibilityTabProps {
  profile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
}

export const PrivacyVisibilityTab: React.FC<PrivacyVisibilityTabProps> = ({
  profile,
  onProfileUpdated,
}) => {
  const [visibility, setVisibility] = useState<ProfileVisibility>(
    profile?.visibility || 'private'
  );
  const [discoverable, setDiscoverable] = useState<boolean>(
    profile?.discoverable || false
  );
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSavePrivacy = async (newVis: ProfileVisibility, newDisc: boolean) => {
    if (!profile?.id) return;

    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    // Enforce database rule: discoverable requires public visibility
    const adjustedDisc = newVis === 'public' ? newDisc : false;

    const res = await profileService.updateProfile(profile.id, {
      visibility: newVis,
      discoverable: adjustedDisc,
    });

    setSaving(false);

    if (res.error || !res.data) {
      setErrorMessage(res.error || 'Failed to update privacy settings.');
    } else {
      setVisibility(newVis);
      setDiscoverable(adjustedDisc);
      onProfileUpdated(res.data);
      setStatusMessage(
        newVis === 'public'
          ? 'Profile is now Public. Visitors can access your profile via your canonical URL.'
          : 'Profile is now Private. Excluded from Explore directory and public routes.'
      );
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">Privacy &amp; Visibility Controls</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Control who can see your profile on Aura Campus and whether you appear in the public Explore directory.
        </p>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 p-3.5 text-xs text-teal-800">
          <Check className="h-4 w-4 text-teal-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Visibility Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Private Mode Card */}
        <div
          onClick={() => !saving && handleSavePrivacy('private', false)}
          className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between gap-4 ${
            visibility === 'private'
              ? 'border-teal-500 bg-teal-50/20 ring-2 ring-teal-500/20 shadow-xs'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                <Lock className="h-5 w-5" />
              </span>
              {visibility === 'private' && (
                <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                  Active Setting
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Private by Default</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Only you can view your profile information when signed in. Excluded from public queries, search engine indexing, and directory explorer.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Canonical route /u/{profile?.handle}: 404 barrier</span>
            {saving && visibility !== 'private' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
          </div>
        </div>

        {/* Public Mode Card */}
        <div
          onClick={() => !saving && handleSavePrivacy('public', discoverable)}
          className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between gap-4 ${
            visibility === 'public'
              ? 'border-teal-500 bg-teal-50/20 ring-2 ring-teal-500/20 shadow-xs'
              : 'border-slate-200/80 bg-white hover:border-slate-300'
          }`}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                <Globe className="h-5 w-5" />
              </span>
              {visibility === 'public' && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  Active Setting
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Public Profile</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anyone with your canonical handle URL (<code className="font-mono text-emerald-800 font-semibold">/u/{profile?.handle}</code>) can view your public-safe profile fields, public education, and public skills.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Secured via PostgreSQL RLS allowlist</span>
            {saving && visibility !== 'public' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : null}
          </div>
        </div>
      </div>

      {/* Directory Discoverability Sub-Setting */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0 mt-0.5">
              <Compass className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900">
                Explore Directory Discoverability
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Allow peers, campus recruiters, and student founders to discover your profile on the public <code className="font-mono font-medium">/explore</code> page.
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              disabled={visibility !== 'public' || saving}
              checked={discoverable && visibility === 'public'}
              onChange={(e) => handleSavePrivacy(visibility, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600 peer-disabled:opacity-40"></div>
          </label>
        </div>

        {visibility === 'private' && (
          <p className="text-[11px] text-amber-700 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
            Database integrity rule: You must set your profile visibility to <span className="font-semibold">Public</span> before you can enable Explore directory discoverability.
          </p>
        )}
      </div>

      {/* RLS Architecture Information */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 flex items-start gap-3 text-xs text-slate-600">
        <Shield className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-900">Database-Level Row Level Security (RLS)</p>
          <p className="leading-relaxed">
            Privacy on Aura Campus is enforced in the PostgreSQL database layer, not merely hidden in client-side React code. Private profile sections and draft case studies cannot be fetched by anonymous visitors or other authenticated students.
          </p>
        </div>
      </div>
    </div>
  );
};
