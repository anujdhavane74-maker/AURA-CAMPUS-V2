import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Page Not Available</h1>
      <p className="mt-2 text-xs text-slate-500 max-w-sm">
        This resource does not exist or its visibility is set to private. Aura Campus does not expose the existence of private records.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Aura Campus
        </Link>
      </div>
    </div>
  );
};
