import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { KeyRound, ShieldAlert, ArrowLeft } from 'lucide-react';

export const SharedLinkPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>

      <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Unlisted Share Route</h1>
            <p className="text-xs text-slate-500 font-mono">Token: {token?.slice(0, 16)}...</p>
          </div>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4 text-amber-700" />
            <span>Cryptographic Server-Validated Token Gate</span>
          </div>
          <p className="leading-relaxed">
            In Phase 4, requests to <code className="font-mono">/s/:token</code> submit the token to the server to verify against the stored SHA-256 hash in <code className="font-mono">share_links</code>. If valid and unrevoked, read-only content is rendered. If revoked, an immediate 404 is returned.
          </p>
        </div>
      </div>
    </div>
  );
};
