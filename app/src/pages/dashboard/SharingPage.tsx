import React, { useState } from 'react';
import { Share2, Copy, Check, QrCode, KeyRound, Trash2 } from 'lucide-react';

export const SharingPage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const sampleUrl = window.location.origin + '/u/alex-chen';

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900">Sharing &amp; Share Links</h1>
        <p className="text-xs text-slate-500 mt-1">
          Distribute your verified profile and portfolio with copy-links, native share, and QR codes.
        </p>
      </div>

      {/* Canonical Share Link Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-900">Canonical Profile URL</h2>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={sampleUrl}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono text-slate-700"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Unlisted Tokens Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-purple-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Unlisted Share Tokens</h2>
              <p className="text-xs text-slate-500">
                High-entropy revocable tokens for sharing private drafts with recruiters.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Create Unlisted Link
          </button>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <span className="font-mono text-slate-800">/s/d8f7e2a9... (Active)</span>
            <p className="text-[11px] text-slate-500">Created 2 days ago &bull; SHA-256 hashed in database</p>
          </div>
          <button
            type="button"
            className="text-xs text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            Revoke
          </button>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs flex items-center gap-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200">
          <QrCode className="h-12 w-12 text-slate-600" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-slate-900">QR Code Generator</h3>
          <p className="text-xs text-slate-500">
            Encodes your canonical profile URL for in-person campus career fairs and business card prints.
          </p>
        </div>
      </div>
    </div>
  );
};
