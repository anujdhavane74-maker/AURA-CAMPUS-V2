import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PORTFOLIO_THEMES } from '../../design/themes';
import { PortfolioThemeId } from '../../types';
import {
  UserCheck,
  FolderGit2,
  Palette,
  Shield,
  Search,
  Check,
  Copy,
  ExternalLink,
  Lock,
  Globe,
  Code,
  QrCode,
  Sparkles,
} from 'lucide-react';

export const ProductShowcaseSection: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<PortfolioThemeId>('noir');
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePrivacy, setActivePrivacy] = useState<'private' | 'public'>('private');

  const previewThemes: PortfolioThemeId[] = ['noir', 'studio', 'minimal', 'brutalist', 'midnight', 'aurora'];

  const handleCopy = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="features" className="py-20 sm:py-28 bg-white border-y border-slate-200/80 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-24">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3 py-1 text-xs font-semibold text-teal-800">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              PURPOSE-BUILT FOR STUDENTS
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Proof over promises.{' '}
            <span className="text-teal-600">Everything your career presence needs.</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Forget PDF resumes and algorithmic noise. Aura Campus provides high-signal, verifiable evidence of what you have built and learned.
          </p>
        </div>

        {/* Feature 1: Student Identity Profiles (Text Left, UI Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <UserCheck className="h-5 w-5" />
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              An authentic student identity that honors where you start
            </h3>

            <p className="text-slate-600 text-base leading-relaxed">
              Traditional platforms demand corporate experience that students don&apos;t have yet. Aura Campus celebrates coursework, open-source contributions, hackathons, and self-taught mastery alongside your university degree.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs">
                  ✓
                </span>
                <span>
                  <strong>Comprehensive profile fields:</strong> institution, major, graduation year, bio, and custom public handle.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs">
                  ✓
                </span>
                <span>
                  <strong>Flexible for all years:</strong> first-year students can focus on coursework and learning goals without penalty.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 text-xs">
                  ✓
                </span>
                <span>
                  <strong>Granular privacy toggles:</strong> choose exactly which sections are visible to visitors.
                </span>
              </li>
            </ul>

            <div className="pt-3">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                <span>Browse Student Profiles</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 shadow-md relative">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                      AL
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Alex Liu</h4>
                      <p className="text-xs text-slate-500">Sample University • EECS &apos;25</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 text-xs font-semibold">
                    Public Profile
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Academic Focus
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="block font-semibold text-slate-900">Operating Systems</span>
                      <span className="text-[11px] text-slate-500">CS 162 • Pintos Kernel</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="block font-semibold text-slate-900">Computer Security</span>
                      <span className="text-[11px] text-slate-500">CS 161 • Cryptography</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Sections: 4 Public • 1 Private</span>
                  <span className="font-mono text-teal-600 font-medium">@alexliu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Case-Study Projects (UI Left, Text Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 shadow-md">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/80">
                    <Code className="h-3.5 w-3.5" />
                    Case Study Format
                  </span>
                  <span className="text-xs text-slate-400 font-mono">MIT License</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    AeroSense: Edge AI Telemetry for Autonomous Drones
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Trained custom YOLOv8 models for real-time obstacle avoidance on Jetson Orin Nano, achieving 62 FPS at 12W power budget.
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 p-3.5 text-xs font-mono text-teal-300 overflow-x-auto">
                  <div className="text-slate-400">// Benchmark Results</div>
                  <div>Throughput: 62.4 FPS (TensorRT FP16)</div>
                  <div>Latency: 14.2ms end-to-end perception</div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['PyTorch', 'TensorRT', 'C++', 'ROS2', 'NVIDIA Jetson'].map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-xs font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
              <FolderGit2 className="h-5 w-5" />
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Case-study project documentation that proves real capability
            </h3>

            <p className="text-slate-600 text-base leading-relaxed">
              Anyone can paste a GitHub URL into a PDF. Aura Campus gives recruiters and collaborators the architectural context they care about: what problem did you tackle, what trade-offs did you make, and how did it perform?
            </p>

            <ul className="space-y-3 pt-2 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs">
                  ✓
                </span>
                <span>
                  <strong>Structured format:</strong> Problem statement, technical stack, architecture highlights, and deployment metrics.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs">
                  ✓
                </span>
                <span>
                  <strong>Verifiable outcomes:</strong> Link directly to live demonstrations, npm packages, or open-source repositories.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-xs">
                  ✓
                </span>
                <span>
                  <strong>Skill association:</strong> Connect technologies directly to the projects where you actually wrote code.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature 3: Interactive 12 Themes Showcase */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-8 sm:p-12 space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
              <Palette className="h-4 w-4" />
              <span>Theme Presentation System</span>
            </div>

            <h3 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              12 Validated themes designed for your discipline
            </h3>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Engineers, designers, researchers, and data scientists have distinct aesthetics. Switch between 12 curated portfolio themes and 5 accessible application palettes with zero CSS hassle.
            </p>
          </div>

          {/* Theme Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {previewThemes.map((themeId) => {
              const theme = PORTFOLIO_THEMES[themeId];
              const isSelected = selectedTheme === themeId;
              return (
                <button
                  key={themeId}
                  type="button"
                  onClick={() => setSelectedTheme(themeId)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm scale-105'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {theme.name}
                </button>
              );
            })}
          </div>

          {/* Interactive Live Theme Preview Box */}
          <div
            className={`rounded-2xl border p-6 sm:p-8 transition-all ${PORTFOLIO_THEMES[selectedTheme].containerClass}`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-current/10">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest opacity-70">
                  Live Theme Rendering
                </span>
                <h4 className="text-xl font-bold mt-0.5">{PORTFOLIO_THEMES[selectedTheme].name}</h4>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${PORTFOLIO_THEMES[selectedTheme].badgeClass}`}
              >
                Theme: {selectedTheme}
              </span>
            </div>

            <p className="text-xs sm:text-sm mt-4 opacity-80 leading-relaxed max-w-xl">
              {PORTFOLIO_THEMES[selectedTheme].tagline} — Designed for high-contrast clarity and responsive typography across all viewports.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              {['Distributed Consensus', 'Autonomous Robotics', 'Real-Time Telemetry'].map((proj) => (
                <div
                  key={proj}
                  className={`p-3.5 rounded-xl border ${PORTFOLIO_THEMES[selectedTheme].cardClass}`}
                >
                  <span className="font-semibold text-xs block">{proj}</span>
                  <span className="text-[10px] opacity-70 block mt-1">Project Case Study</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature 4: Privacy & Revocable Sharing (Text Left, UI Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Shield className="h-5 w-5" />
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Strict private-by-default architecture &amp; high-entropy share tokens
            </h3>

            <p className="text-slate-600 text-base leading-relaxed">
              Your profile is private by default. When applying for selective roles, share your unlisted portfolio with recruiters via high-entropy secret tokens that expire or can be revoked with a single click.
            </p>

            <ul className="space-y-3 pt-2 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">
                  ✓
                </span>
                <span>
                  <strong>PostgreSQL Row Level Security (RLS):</strong> Private data cannot be leaked by client-side bugs or web crawlers.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">
                  ✓
                </span>
                <span>
                  <strong>Instant Revocation:</strong> Revoke access to any shared link immediately from your security dashboard.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">
                  ✓
                </span>
                <span>
                  <strong>No indexing of private drafts:</strong> Search engine bots cannot access your work until you explicitly publish.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 shadow-md">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Live Share Token Simulator
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setActivePrivacy('private')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        activePrivacy === 'private'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Private
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePrivacy('public')}
                      className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                        activePrivacy === 'public'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Public
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-mono text-[11px] truncate max-w-[200px]">
                      https://auracampus.org/s/tok_8f93a1c0d4e5
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-teal-700 font-semibold hover:text-teal-800"
                    >
                      {copiedLink ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    {activePrivacy === 'private' ? (
                      <>
                        <Lock className="h-3.5 w-3.5 text-slate-500" />
                        <span>Token-only access</span>
                      </>
                    ) : (
                      <>
                        <Globe className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Public in directory</span>
                      </>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <QrCode className="h-3.5 w-3.5" />
                    <span>QR Active</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 5: Discovery banner */}
        <div className="rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-50/70 via-sky-50/50 to-white p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
              <Search className="h-4 w-4" />
              <span>Campus Discovery Directory</span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Explore exceptional student work from universities worldwide
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Discover verified student portfolios, filter by university, major, or technology stack, and find collaborators.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-teal-700 transition-all shrink-0"
          >
            <span>Open Student Directory</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
