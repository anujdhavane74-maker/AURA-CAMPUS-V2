import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 text-base">
                Aura <span className="text-teal-600">Campus</span>
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-sm">
              The student identity and career-presence platform. Build proof of work, publish honest portfolios, and discover peers with strict privacy by default.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Shield className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />
              <span>Private-by-default architecture &amp; verified server controls</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/explore" className="hover:text-slate-900 transition-colors">
                  Explore Directory
                </Link>
              </li>
              <li>
                <Link to="/app" className="hover:text-slate-900 transition-colors">
                  Portfolio Builder
                </Link>
              </li>
              <li>
                <Link to="/app/privacy" className="hover:text-slate-900 transition-colors">
                  Privacy Settings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Platform</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/auth/sign-in" className="hover:text-slate-900 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/auth/sign-up" className="hover:text-slate-900 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-500">v2.0 Greenfield Architecture</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} Aura Campus. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with privacy &amp; transparency.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
