import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Globe,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfileShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onNavigatePrivacy: () => void;
}

export const ProfileShareModal: React.FC<ProfileShareModalProps> = ({
  isOpen,
  onClose,
  profile,
  onNavigatePrivacy,
}) => {
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  if (!isOpen) return null;

  const handle = profile?.handle || 'student';
  const isPublic = profile?.visibility === 'public';
  const publicUrl = `${window.location.origin}/u/${handle}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.displayName || 'Student'} on Aura Campus`,
          text: `Check out my student profile and projects on Aura Campus:`,
          url: publicUrl,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch {
        // User cancelled or share aborted
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-7 shadow-xl border border-slate-200/80 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Share2 className="h-4 w-4" />
            </span>
            <h2 id="share-modal-title" className="text-base font-bold text-slate-900">
              Share Public Profile
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share modal"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Visibility Status Badge */}
        {!isPublic ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-2 text-xs text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Your profile is currently Private</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Anyone clicking your public link will see a 404 / Private Profile screen until you change your profile visibility to Public.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigatePrivacy();
              }}
              className="mt-1 font-bold text-teal-700 hover:text-teal-800 underline text-left block"
            >
              Go to Privacy Settings to Publish &rarr;
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5 flex items-center gap-2.5 text-xs text-emerald-900">
            <Globe className="h-4 w-4 text-emerald-600 shrink-0" />
            <p className="leading-snug">
              Your profile is <span className="font-bold">Public</span> and ready to share with recruiters, mentors, and peers.
            </p>
          </div>
        )}

        {/* Canonical Link Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700" htmlFor="share-url">
            Public Profile URL
          </label>
          <div className="flex items-center gap-2">
            <input
              id="share-url"
              type="text"
              readOnly
              value={publicUrl}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleWebShare}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Share2 className="h-3.5 w-3.5 text-teal-600" />
            <span>{shareSuccess ? 'Shared!' : 'Native Device Share'}</span>
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>Open in Tab</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};
