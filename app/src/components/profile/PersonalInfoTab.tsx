import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Shield,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { profileSchema, RESERVED_HANDLES } from '../../schemas';
import { profileService } from '../../services/profile';
import { AvatarUploader } from './AvatarUploader';

interface PersonalInfoTabProps {
  profile: UserProfile | null;
  onProfileUpdated: (updated: UserProfile) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  profile,
  onProfileUpdated,
  onDirtyChange,
}) => {
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [handle, setHandle] = useState(profile?.handle || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [institution, setInstitution] = useState(profile?.institution || '');
  const [program, setProgram] = useState(profile?.program || '');
  const [graduationYear, setGraduationYear] = useState<string>(
    profile?.graduationYear ? String(profile?.graduationYear) : ''
  );
  const [locationLabel, setLocationLabel] = useState(profile?.locationLabel || '');

  // Handle availability state
  const [handleChecking, setHandleChecking] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(true);
  const [handleError, setHandleError] = useState<string | null>(null);

  // Form submission state
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Sync state when profile changes
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setHandle(profile.handle || '');
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setInstitution(profile.institution || '');
      setProgram(profile.program || '');
      setGraduationYear(profile.graduationYear ? String(profile.graduationYear) : '');
      setLocationLabel(profile.locationLabel || '');
    }
  }, [profile]);

  // Dirty state tracking
  const isDirty =
    (profile?.displayName || '') !== displayName ||
    (profile?.handle || '') !== handle ||
    (profile?.headline || '') !== headline ||
    (profile?.bio || '') !== bio ||
    (profile?.institution || '') !== institution ||
    (profile?.program || '') !== program ||
    (profile?.graduationYear ? String(profile.graduationYear) : '') !== graduationYear ||
    (profile?.locationLabel || '') !== locationLabel;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Debounced Handle Availability Check
  const checkHandle = useCallback(
    async (candidateHandle: string) => {
      const normalized = candidateHandle.toLowerCase().trim();

      // If unchanged from user's current handle, it's valid
      if (normalized === profile?.handle) {
        setHandleChecking(false);
        setHandleAvailable(true);
        setHandleError(null);
        return;
      }

      if (normalized.length < 3) {
        setHandleChecking(false);
        setHandleAvailable(false);
        setHandleError('Handle must be at least 3 characters.');
        return;
      }

      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
        setHandleChecking(false);
        setHandleAvailable(false);
        setHandleError('Letters, numbers, and single hyphens only.');
        return;
      }

      if (RESERVED_HANDLES.has(normalized)) {
        setHandleChecking(false);
        setHandleAvailable(false);
        setHandleError('This handle is reserved.');
        return;
      }

      setHandleChecking(true);
      setHandleError(null);

      const res = await profileService.checkHandleAvailability(normalized, profile?.id);
      setHandleChecking(false);

      if (res.error) {
        setHandleAvailable(false);
        setHandleError(res.error);
      } else {
        setHandleAvailable(res.available);
        if (!res.available) {
          setHandleError('This handle is already taken by another student.');
        }
      }
    },
    [profile?.handle, profile?.id]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (handle && handle !== profile?.handle) {
        checkHandle(handle);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [handle, profile?.handle, checkHandle]);

  const handleReset = () => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setHandle(profile.handle || '');
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setInstitution(profile.institution || '');
      setProgram(profile.program || '');
      setGraduationYear(profile.graduationYear ? String(profile.graduationYear) : '');
      setLocationLabel(profile.locationLabel || '');
    }
    setValidationErrors({});
    setStatusMessage(null);
    setFormError(null);
    setHandleError(null);
    setHandleAvailable(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setStatusMessage(null);
    setFormError(null);

    if (!profile?.id) {
      setFormError('No active authenticated student session found.');
      return;
    }

    if (handleAvailable === false) {
      setValidationErrors({ handle: handleError || 'Handle is not available.' });
      return;
    }

    const gradYearNum = graduationYear.trim() ? parseInt(graduationYear.trim(), 10) : null;

    const validationResult = profileSchema.safeParse({
      displayName,
      handle,
      headline: headline || undefined,
      bio: bio || undefined,
      institution: institution || undefined,
      program: program || undefined,
      graduationYear: gradYearNum,
      locationLabel: locationLabel || undefined,
      visibility: profile.visibility,
      discoverable: profile.discoverable,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setValidationErrors(fieldErrors);
      return;
    }

    setSaving(true);

    const updateRes = await profileService.updateProfile(profile.id, {
      displayName,
      handle,
      headline,
      bio,
      institution,
      program,
      graduationYear: gradYearNum || undefined,
      locationLabel,
    });

    setSaving(false);

    if (updateRes.error || !updateRes.data) {
      setFormError(updateRes.error || 'Failed to persist profile changes.');
    } else {
      onProfileUpdated(updateRes.data);
      setStatusMessage('Profile information saved and persisted successfully.');
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Document your professional identity. Changes are saved directly to your Supabase profile.
          </p>
        </div>

        {isDirty && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            Unsaved Changes
          </span>
        )}
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 p-3.5 text-xs text-teal-800">
          <Check className="h-4 w-4 text-teal-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {formError && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSave} noValidate className="space-y-5">
        {/* Profile Avatar Section */}
        {profile?.id && (
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Profile Avatar
            </label>
            <AvatarUploader
              userId={profile.id}
              currentAvatarPath={profile.avatarPath}
              displayName={displayName || profile.displayName}
              handle={handle || profile.handle}
              onAvatarUpdated={(newPath) => {
                onProfileUpdated({ ...profile, avatarPath: newPath });
              }}
            />
          </div>
        )}

        {/* Name and Handle Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="profile-displayName">
              Display Name *
            </label>
            <input
              id="profile-displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Maya Patel"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {validationErrors.displayName && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationErrors.displayName}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="profile-handle">
                Canonical Handle *
              </label>
              <div className="text-[11px] flex items-center gap-1">
                {handleChecking && (
                  <span className="text-slate-500 flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin text-teal-600" />
                    Checking availability...
                  </span>
                )}
                {!handleChecking && handleAvailable === true && handle.length >= 3 && (
                  <span className="text-emerald-700 flex items-center gap-0.5 font-medium">
                    <Check className="h-3 w-3" />
                    Available
                  </span>
                )}
                {!handleChecking && handleAvailable === false && (
                  <span className="text-rose-600 flex items-center gap-0.5 font-medium">
                    <AlertCircle className="h-3 w-3" />
                    Unavailable
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-slate-400 font-mono">@</span>
              <input
                id="profile-handle"
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().trim())}
                placeholder="mayapatel"
                className={`w-full rounded-xl border bg-white pl-8 pr-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  handleError || validationErrors.handle
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/20'
                }`}
              />
            </div>
            {(handleError || validationErrors.handle) && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {handleError || validationErrors.handle}
              </p>
            )}
            <p className="text-[10px] text-slate-400 mt-1">
              Used in public URL: aura.campus/u/{handle || 'yourhandle'}
            </p>
          </div>
        </div>

        {/* Headline */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="profile-headline">
            Professional Headline
          </label>
          <input
            id="profile-headline"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Computer Science Undergrad • Aspiring ML Systems Engineer"
            maxLength={120}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
            <span>A 1-line summary displayed under your name</span>
            <span>{headline.length} / 120</span>
          </div>
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700" htmlFor="profile-bio">
              Biography
            </label>
            <span className="text-[10px] text-slate-400">{bio.length} / 1000 characters</span>
          </div>
          <textarea
            id="profile-bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell your story: what are you studying, what have you built, and what kind of problems do you love solving?"
            maxLength={1000}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          {validationErrors.bio && (
            <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validationErrors.bio}
            </p>
          )}
        </div>

        {/* Institution & Program */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="profile-institution">
              Institution / University
            </label>
            <input
              id="profile-institution"
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Stanford University"
              maxLength={150}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="profile-program">
              Major / Degree Program
            </label>
            <input
              id="profile-program"
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              placeholder="e.g. B.S. in Computer Science"
              maxLength={150}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Grad Year & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="profile-gradYear">
              Expected Graduation Year
            </label>
            <input
              id="profile-gradYear"
              type="number"
              min="1970"
              max="2040"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="e.g. 2026"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="profile-location">
              Location Label
            </label>
            <input
              id="profile-location"
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
              maxLength={100}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Security & Storage Note */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
          <p>
            Avatar uploads are secured in user-isolated storage and protected by Row Level Security. Cropped WebP files ensure fast loading across portfolio themes and the public directory.
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-slate-400" />
            <span>Profile edits adhere to Row Level Security</span>
          </p>

          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Discard Changes</span>
              </button>
            )}

            <button
              type="submit"
              disabled={saving || (handleAvailable === false && handle !== profile?.handle)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5" />
                  <span>Save Personal Info</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
