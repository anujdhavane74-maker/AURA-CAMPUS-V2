import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ArrowRight, Compass, ShieldCheck, Sparkles } from 'lucide-react';

export const ClosingCtaSection: React.FC = () => {
  const { user } = useAuth();

  return (
    <section className="py-20 sm:py-28 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-8 sm:p-14 lg:p-20 text-white shadow-2xl">
          {/* Ambient lighting glows */}
          <div
            className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/40 bg-teal-950/70 px-3.5 py-1 text-xs font-semibold text-teal-300">
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              <span className="font-mono uppercase tracking-wider text-[11px]">
                GET STARTED IN MINUTES
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your next opportunity starts with what you build today.
            </h2>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Join ambitious students who use Aura Campus to transform classroom theory and side projects into verifiable career proof. Free for students. Private by default.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to={user ? '/app/onboarding' : '/auth/sign-up'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-teal-500 px-8 py-4 text-base font-semibold text-slate-950 hover:bg-teal-400 shadow-md transition-all hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <span>{user ? 'Continue Profile Setup' : 'Create Your Profile'}</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </Link>

              <Link
                to="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-7 py-4 text-base font-semibold text-white hover:bg-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <Compass className="h-4.5 w-4.5 text-teal-400" />
                <span>Explore Campus Directory</span>
              </Link>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                <span>Private by Default</span>
              </div>
              <div>&bull;</div>
              <div>100% Free for University Students</div>
              <div>&bull;</div>
              <div>No Credit Card Required</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
