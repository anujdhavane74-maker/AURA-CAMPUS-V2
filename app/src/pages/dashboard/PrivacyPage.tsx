import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Globe, Lock, AlertTriangle } from 'lucide-react';
import { ProfileVisibility, PortfolioVisibility } from '../../types';

export const PrivacyPage: React.FC = () => {
  const [profileVis, setProfileVis] = useState<ProfileVisibility>('private');
  const [portfolioVis, setPortfolioVis] = useState<PortfolioVisibility>('private');
  const [discoverable, setDiscoverable] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900">Privacy &amp; Visibility Controls</h1>
        <p className="text-xs text-slate-500 mt-1">
          Aura Campus uses private-by-default architecture. You retain complete control over what is visible to the public.
        </p>
      </div>

      {/* Profile Visibility Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-900">Student Profile Visibility</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setProfileVis('private');
              setDiscoverable(false);
            }}
            className={`p-4 rounded-2xl border text-left transition-all ${
              profileVis === 'private'
                ? 'border-teal-500 ring-2 ring-teal-500 bg-teal-50/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Lock className="h-4 w-4 text-slate-600" />
              <span>Private (Default)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visible only to you in your authenticated dashboard. Completely excluded from Explore and public routes.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setProfileVis('public')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              profileVis === 'public'
                ? 'border-teal-500 ring-2 ring-teal-500 bg-teal-50/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Globe className="h-4 w-4 text-teal-600" />
              <span>Public</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Accessible via your canonical handle route (<code className="font-mono">/u/:handle</code>). Only allowlisted public fields are shared.
            </p>
          </button>
        </div>

        {/* Discoverable Checkbox */}
        <div className="pt-3 border-t border-slate-100">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={discoverable}
              disabled={profileVis === 'private'}
              onChange={(e) => setDiscoverable(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
            />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">
                List profile in the public Explore directory
              </span>
              <p className="text-slate-500">
                Requires public profile visibility. When unchecked, your profile is accessible via your direct handle link but will not appear in search or Explore.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Portfolio Visibility Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-teal-600" />
          <h2 className="text-sm font-bold text-slate-900">Portfolio Presentation Visibility</h2>
        </div>
        <p className="text-xs text-slate-500">
          Portfolio visibility operates independently from your student profile visibility.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'private', label: 'Private', desc: 'Owner only', icon: EyeOff },
            { id: 'unlisted_link', label: 'Unlisted Link', desc: 'Holder of random share token', icon: Shield },
            { id: 'public', label: 'Public', desc: 'Anyone with canonical URL', icon: Globe },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPortfolioVis(item.id as PortfolioVisibility)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                portfolioVis === item.id
                  ? 'border-teal-500 ring-2 ring-teal-500 bg-teal-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs text-slate-900">{item.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Warning Box */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
        <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong>Owner Control Principle:</strong> Per specification, no public change happens silently. Changing to public requires explicit confirmation.
        </p>
      </div>
    </div>
  );
};
