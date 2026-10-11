import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  GraduationCap,
  MapPin,
  Lock,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { profileService } from '../services/profile';

interface PublicProfileData {
  handle: string;
  display_name: string;
  headline?: string | null;
  bio?: string | null;
  avatar_path?: string | null;
  cover_path?: string | null;
  institution?: string | null;
  program?: string | null;
  graduation_year?: number | null;
  location_label?: string | null;
  discoverable: boolean;
  updated_at: string;
}

export const PublicProfilePage: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadPublicProfile() {
      if (!handle) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);

      if (!isSupabaseConfigured) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_public_profile', {
          p_handle: handle.toLowerCase(),
        });

        if (!isMounted) return;

        if (error || !data || data.length === 0) {
          // Zero rows returned -> Private profile or does not exist
          setNotFound(true);
          setProfile(null);
        } else {
          setProfile(data[0] as PublicProfileData);
          setNotFound(false);
        }
      } catch {
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPublicProfile();

    return () => {
      isMounted = false;
    };
  }, [handle]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-3">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-teal-600" />
        <p className="text-xs font-semibold text-slate-500">Resolving public profile...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">Profile is Private or Unavailable</h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            This student profile is either private or does not exist. Per our privacy-preserving security model, private accounts are completely isolated from public requests.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 shadow-2xs"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Discover Public Students</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span>Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const initials = profile.display_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w.charAt(0).toUpperCase())
    .join('') || profile.handle.slice(0, 2).toUpperCase();

  const avatarUrl = profileService.getAvatarUrl(profile.avatar_path);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      <Link
        to="/explore"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Explore Directory</span>
      </Link>

      {/* Public Profile Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-5 min-w-0">
            <div
              className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-bold text-xl sm:text-2xl shadow-sm border-2 border-white ring-2 ring-teal-100 overflow-hidden"
              aria-label={`Avatar for ${profile.display_name}`}
            >
              {avatarUrl && !avatarLoadError ? (
                <img
                  src={avatarUrl}
                  alt={`${profile.display_name}'s avatar`}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {profile.display_name}
                </h1>
                <span className="text-sm font-mono text-slate-500">@{profile.handle}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <Globe className="h-3 w-3" />
                  Public Profile
                </span>
              </div>

              {profile.headline && (
                <p className="text-xs sm:text-sm text-slate-600">{profile.headline}</p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                {profile.institution && (
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
                    <span>
                      {profile.institution}
                      {profile.program ? ` • ${profile.program}` : ''}
                      {profile.graduation_year ? ` ('${String(profile.graduation_year).slice(-2)})` : ''}
                    </span>
                  </span>
                )}
                {profile.location_label && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{profile.location_label}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <Link
              to={`/p/${profile.handle}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-2xs"
            >
              <span>Portfolio</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">About</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
