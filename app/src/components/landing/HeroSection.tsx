import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  ArrowRight,
  Compass,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  MapPin,
  ExternalLink,
  Code2,
  Layers,
  Palette,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24">
      {/* Background radial glow accents */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-teal-100/40 via-sky-50/30 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-32 -z-10 h-[360px] w-[450px] rounded-full bg-gradient-to-bl from-teal-50/50 via-slate-100/30 to-transparent blur-2xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Balanced Headline, Supporting Copy, and CTAs */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-6 text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-teal-800 shadow-2xs backdrop-blur-xs">
              <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-pulse-subtle" />
              <span className="tracking-wider uppercase font-mono text-[11px]">
                YOUR JOURNEY. YOUR PROOF.
              </span>
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            </div>

            {/* Main Headline with deliberate line breaks */}
            <h1 className="font-display text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-slate-900 leading-[1.14]">
              Build your future.{' '}
              <span className="text-teal-600 block sm:inline mt-1 sm:mt-0">
                Show what you&apos;re capable of.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="max-w-xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Turn the things you learn, build and achieve into a student profile that grows with you—from your first project to your first opportunity.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to={user ? '/app/onboarding' : '/auth/sign-up'}
                className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-teal-600 px-6.5 py-3.5 text-sm sm:text-base font-semibold text-white shadow-xs hover:bg-teal-700 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <span>{user ? 'Continue Profile Setup' : 'Build Your Profile'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5.5 py-3.5 text-sm sm:text-base font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-2xs focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <Compass className="h-4 w-4 text-slate-500" />
                <span>Explore Student Portfolios</span>
              </Link>
            </div>

            {/* Trust and factual supporting line */}
            <div className="pt-2 space-y-2.5 border-t border-slate-200/70">
              <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-600 shrink-0" />
                <span>
                  Free for students • Private by default with strict PostgreSQL RLS • No fabricated metrics
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>12 Portfolio Themes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>High-Entropy Share Links</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                  <span>Real Project Proof</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: One Coherent, Beautiful Product Showcase Card */}
          <div className="lg:col-span-6 xl:col-span-5 relative">
            {/* Subtle background glow */}
            <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-tr from-teal-100/40 via-sky-50/30 to-slate-100/20 -z-10 blur-xl" />

            {/* Showcase container */}
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Product Window Frame */}
              <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/50 overflow-hidden space-y-0">
                {/* Window Title Bar */}
                <div className="bg-slate-50/90 border-b border-slate-100 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
                    <span>Interactive Demo Portfolio</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">preview.auracampus.dev</span>
                </div>

                {/* Card Body: Student Identity */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Identity Header */}
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white font-bold text-base shadow-xs">
                      MP
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">Maya Patel</span>
                        <span className="text-xs font-mono text-slate-400">@mayapatel</span>
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200">
                          Demo Profile
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1">
                        Building distributed storage engines and fault-tolerant software systems.
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 pt-0.5">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
                          Computer Science • B.S. Candidate &apos;26
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          San Francisco, CA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Featured Case Study Project Card */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-teal-600" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          Sample Project Case Study
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                        <ExternalLink className="h-2.5 w-2.5" />
                        Demo Available
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        NexusDB: Distributed Key-Value Store
                      </h3>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Implemented Raft consensus algorithm with memory-mapped LSM trees and sub-3ms p99 latency under write contention.
                      </p>
                    </div>

                    {/* Tech stack chips */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {['Go', 'Raft Consensus', 'gRPC', 'Docker'].map((tech) => (
                        <span
                          key={tech}
                          className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-2xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Focus Areas & Technologies */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Focus Areas &amp; Technologies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Distributed Systems', 'PyTorch', 'Rust', 'TypeScript', 'PostgreSQL'].map(
                        (skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-teal-50 text-teal-800 border border-teal-200/80 px-2.5 py-0.5 text-xs font-medium"
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Meta Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-teal-600" />
                      <span className="font-medium text-slate-700 text-[11px]">Theme: Studio</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Sample data for demonstration
                    </span>
                  </div>
                </div>
              </div>

              {/* Single Tasteful Floating Badge */}
              <div className="absolute -bottom-4 -left-3 sm:-left-5 z-20 rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2 shadow-md backdrop-blur-xs flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-tight">
                    12 Distinct Themes
                  </span>
                  <span className="text-[10px] text-slate-500">Real visual architectures</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
