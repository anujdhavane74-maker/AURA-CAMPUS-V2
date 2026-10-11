import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldAlert, Sparkles, User, ExternalLink } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800 border border-teal-200 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-teal-600" />
          <span>Public Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Explore Student Creators
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
          Discover students who have intentionally published public portfolios and verified work. Only profiles with <code className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded text-xs font-mono">visibility: &apos;public&apos;</code> and <code className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded text-xs font-mono">discoverable: true</code> appear here.
        </p>
      </div>

      {/* Privacy Notice Card */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
        <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong>Privacy Guarantee:</strong> Private student profiles and unpublished drafts never appear in search results, suggestion queries, or public directory counts.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, handle, or skill (e.g. React, Python)..."
            aria-label="Search discoverable students"
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          type="button"
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Explore Grid Placeholder */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
          <User className="h-6 w-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h2 className="text-base font-semibold text-slate-900">Directory Ready for Live Data</h2>
          <p className="text-xs text-slate-600">
            Once Phase 1 &amp; Phase 2 database migrations are connected, this directory queries the public-safe RPC.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/u/alex-chen"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
          >
            <span>Preview sample public handle route (/u/alex-chen)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
