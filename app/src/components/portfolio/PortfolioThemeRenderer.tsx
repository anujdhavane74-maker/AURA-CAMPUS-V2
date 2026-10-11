import React from 'react';
import {
  ExternalLink,
  Github,
  Sparkles,
  Terminal,
} from 'lucide-react';
import {
  Portfolio,
  PortfolioThemeId,
  Project,
  UserProfile,
} from '../../types';
import { profileService } from '../../services/profile';

interface PortfolioThemeRendererProps {
  themeId: PortfolioThemeId;
  portfolio: Portfolio;
  profile: UserProfile | null;
  projects: Project[];
  isPreview?: boolean;
}

export const PortfolioThemeRenderer: React.FC<PortfolioThemeRendererProps> = ({
  themeId,
  portfolio,
  profile,
  projects,
  isPreview: _isPreview = false,
}) => {
  const displayName = profile?.displayName || 'Student Developer';
  const handle = profile?.handle || 'student';
  const headline = profile?.headline || 'Building software and exploring new technologies';
  const bio = portfolio.data?.introduction as string || profile?.bio || 'Welcome to my engineering portfolio and project showcase.';
  const institution = profile?.institution || 'University';
  const program = profile?.program || 'Computer Science';
  const avatarUrl = profileService.getAvatarUrl(profile?.avatarPath);
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || handle.slice(0, 2).toUpperCase();

  // 1. STUDIO THEME — Clean Modern Product Studio
  if (themeId === 'studio') {
    return (
      <div className="bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-teal-500 selection:text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
          {/* Header */}
          <header className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-800 text-white font-bold text-2xl flex items-center justify-center shadow-md overflow-hidden shrink-0 border-2 border-white">
                {avatarUrl ? <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" /> : initials}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">{displayName}</h1>
                  <span className="text-xs font-mono text-teal-600 font-semibold">@{handle}</span>
                </div>
                <p className="text-sm text-slate-600 font-medium">{headline}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                  <span>{institution} • {program}</span>
                  {profile?.locationLabel && <span>• {profile.locationLabel}</span>}
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold shrink-0">
              <span className="h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Available for Roles</span>
            </div>
          </header>

          {/* Intro */}
          <section className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700">Introduction</h2>
            <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">{bio}</p>
          </section>

          {/* Projects Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Featured Case Studies</h2>
                <p className="text-xs text-slate-500">Selected engineering work and implementations.</p>
              </div>
              <span className="text-xs font-semibold text-slate-400 font-mono">{projects.length} Works</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-slate-900">{proj.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {proj.status}
                      </span>
                    </div>
                    {proj.summary && <p className="text-xs text-slate-600 leading-relaxed">{proj.summary}</p>}
                    {proj.problem && (
                      <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                        <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">Problem Statement</span>
                        <p className="text-slate-600">{proj.problem}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((t) => (
                        <span key={t} className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-lg">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs pt-1">
                      {proj.demoUrl && (
                        <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
                          <span>Live Demo</span> <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {proj.repositoryUrl && (
                        <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" className="font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1">
                          <Github className="h-3 w-3" /> <span>Source Code</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 2. NOIR THEME — Cinematic High-Contrast Monochromatic Dark
  if (themeId === 'noir') {
    return (
      <div className="bg-[#090a0f] text-neutral-100 min-h-screen font-sans selection:bg-white selection:text-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-16">
          <header className="border-b border-neutral-800 pb-12 space-y-4">
            <span className="text-[11px] font-mono tracking-widest text-neutral-500 uppercase">Portfolio // {handle}</span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">{displayName}</h1>
            <p className="text-base text-neutral-400 font-light max-w-2xl leading-relaxed">{headline}</p>
            <div className="flex items-center gap-4 text-xs font-mono text-neutral-500 pt-2">
              <span>{institution}</span>
              <span>/</span>
              <span>{program}</span>
            </div>
          </header>

          <section className="space-y-4">
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">// About</span>
            <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl font-light">{bio}</p>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Index of Works</span>
              <span className="text-xs font-mono text-neutral-600">{String(projects.length).padStart(2, '0')}</span>
            </div>

            <div className="space-y-6">
              {projects.map((proj, idx) => (
                <div key={proj.id} className="group border border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-900/80 p-7 rounded-2xl transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-neutral-600">0{idx + 1}</span>
                      <h3 className="text-lg font-bold text-white group-hover:text-neutral-200">{proj.title}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase border border-neutral-800 px-2 py-0.5 rounded">
                      {proj.status}
                    </span>
                  </div>

                  {proj.summary && <p className="text-xs text-neutral-400 font-light leading-relaxed">{proj.summary}</p>}

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-neutral-800/60">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((t) => (
                        <span key={t} className="text-[10px] font-mono bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      {proj.demoUrl && (
                        <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="text-white hover:underline inline-flex items-center gap-1">
                          Live <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {proj.repositoryUrl && (
                        <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white inline-flex items-center gap-1">
                          Source
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 3. BRUTALIST THEME — Bold Black Borders, Offset Drop Shadows & Raw Character
  if (themeId === 'brutalist') {
    return (
      <div className="bg-[#f4f3ef] text-black min-h-screen font-mono p-4 sm:p-8 selection:bg-yellow-300 selection:text-black">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="border-3 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <span className="bg-black text-white px-2 py-0.5 text-xs font-black uppercase">STUDENT_RECORD.EXE</span>
              <span className="text-xs font-bold uppercase">{institution}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">{displayName}</h1>
            <p className="text-sm font-bold bg-yellow-200 border-2 border-black p-3 shadow-[3px_3px_0px_0px_#000]">
              {headline}
            </p>
            <div className="text-xs font-bold pt-1">
              STATUS: [ACTIVE] // PROGRAM: {program} // HANDLE: @{handle}
            </div>
          </header>

          <section className="border-3 border-black bg-white p-6 shadow-[6px_6px_0px_0px_#000] space-y-2">
            <h2 className="text-xs font-black uppercase bg-black text-white inline-block px-2 py-0.5">BIO / STATEMENT</h2>
            <p className="text-xs leading-relaxed font-medium pt-2">{bio}</p>
          </section>

          <section className="space-y-4">
            <div className="border-3 border-black bg-yellow-300 p-3 shadow-[4px_4px_0px_0px_#000] font-black uppercase text-sm">
              PROJECT ARTIFACTS ({projects.length})
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="border-3 border-black bg-white p-5 shadow-[6px_6px_0px_0px_#000] space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 border-b-2 border-black pb-2">
                      <h3 className="font-black text-sm uppercase">{proj.title}</h3>
                      <span className="border border-black bg-slate-100 text-[10px] font-bold px-1.5 py-0.5">
                        {proj.status}
                      </span>
                    </div>
                    {proj.summary && <p className="text-xs font-medium">{proj.summary}</p>}
                    {proj.problem && (
                      <div className="border-2 border-black bg-slate-50 p-2 text-[11px]">
                        <span className="font-bold underline block">PROBLEM:</span>
                        <span>{proj.problem}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t-2 border-black">
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((t) => (
                        <span key={t} className="border border-black bg-yellow-100 text-[10px] font-bold px-1.5 py-0.5">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-xs">
                      {proj.demoUrl && (
                        <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="border-2 border-black bg-black text-white px-2.5 py-1 font-black hover:bg-yellow-300 hover:text-black transition-colors">
                          LIVE DEMO
                        </a>
                      )}
                      {proj.repositoryUrl && (
                        <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" className="border-2 border-black bg-white text-black px-2.5 py-1 font-bold hover:bg-slate-100">
                          REPO
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 4. RESUME THEME — Structured Printable Executive Curriculum Vitae
  if (themeId === 'resume') {
    return (
      <div className="bg-slate-100 text-slate-900 min-h-screen py-10 px-4 font-sans flex justify-center">
        <div className="w-full max-w-4xl bg-white border border-slate-300 shadow-md p-8 sm:p-12 space-y-8 rounded-sm">
          {/* Resume Header */}
          <header className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 uppercase">{displayName}</h1>
            <p className="text-sm font-semibold text-slate-700">{headline}</p>
            <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-mono pt-1">
              <span>{institution}</span>
              <span>•</span>
              <span>{program}</span>
              <span>•</span>
              <span>@{handle}</span>
            </div>
          </header>

          {/* Professional Summary */}
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-1">
              Professional Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">{bio}</p>
          </section>

          {/* Projects as Resume Work Entries */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-1">
              Technical Projects &amp; Implementations
            </h2>
            <div className="space-y-5">
              {projects.map((proj) => (
                <div key={proj.id} className="space-y-1.5 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-900 text-sm">{proj.title}</span>
                    <span className="font-mono text-slate-500 uppercase">{proj.status}</span>
                  </div>
                  {proj.summary && <p className="text-slate-700 leading-relaxed">{proj.summary}</p>}
                  {proj.problem && (
                    <p className="text-slate-600 pl-3 border-l-2 border-slate-300 italic">
                      Challenge addressed: {proj.problem}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      <strong className="text-slate-700">Technologies: </strong>
                      {proj.technologies.join(', ')}
                    </span>
                    <div className="flex items-center gap-3 font-semibold text-blue-700">
                      {proj.demoUrl && <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="hover:underline">Demo</a>}
                      {proj.repositoryUrl && <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" className="hover:underline">Repository</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 5. STICKER THEME — Playful College Collage with Rotated Badges
  if (themeId === 'sticker') {
    return (
      <div className="bg-[#faf6ee] text-slate-800 min-h-screen font-sans p-4 sm:p-8 selection:bg-purple-300">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="rounded-3xl border-2 border-teal-200 bg-white p-8 shadow-md space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block -rotate-2 rounded-full bg-yellow-200 px-3 py-1 text-xs font-bold text-yellow-900 border border-yellow-300 shadow-2xs mb-2">
                  👋 student portfolio
                </span>
                <h1 className="text-3xl font-black text-slate-900">{displayName}</h1>
                <p className="text-sm font-medium text-slate-600 pt-1">{headline}</p>
              </div>
              <div className="rotate-3 shrink-0 h-16 w-16 rounded-2xl bg-teal-500 text-white font-black text-xl flex items-center justify-center border-2 border-white shadow-md">
                {initials}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="rounded-full bg-teal-100 text-teal-800 px-3 py-0.5 text-xs font-bold border border-teal-200">
                🎓 {institution}
              </span>
              <span className="rounded-full bg-purple-100 text-purple-800 px-3 py-0.5 text-xs font-bold border border-purple-200">
                💻 {program}
              </span>
            </div>
          </header>

          <section className="space-y-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>🚀 Cool Stuff I Built</span>
              <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">{projects.length}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => {
                const rotation = idx % 2 === 0 ? '-rotate-1' : 'rotate-1';
                return (
                  <div
                    key={proj.id}
                    className={`rounded-3xl border-2 border-teal-100 bg-white p-6 shadow-md hover:rotate-0 transition-transform space-y-4 flex flex-col justify-between ${rotation}`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-slate-900">{proj.title}</h3>
                        <span className="text-[10px] font-bold bg-pink-100 text-pink-800 px-2.5 py-0.5 rounded-full">
                          {proj.status}
                        </span>
                      </div>
                      {proj.summary && <p className="text-xs text-slate-600 leading-relaxed">{proj.summary}</p>}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((t) => (
                          <span key={t} className="rounded-full bg-slate-100 text-slate-700 font-bold px-2 py-0.5 text-[10px] border border-slate-200">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs pt-1">
                        {proj.demoUrl && (
                          <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="rounded-full bg-teal-600 text-white px-3 py-1 font-bold shadow-2xs hover:bg-teal-700">
                            Play Demo
                          </a>
                        )}
                        {proj.repositoryUrl && (
                          <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 text-slate-800 px-3 py-1 font-bold hover:bg-slate-200">
                            Code
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 6. EDITORIAL THEME — Broadsheet Journalistic Magazine Layout
  if (themeId === 'editorial') {
    return (
      <div className="bg-[#faf8f5] text-[#2c2825] min-h-screen py-12 px-4 sm:px-6 font-serif selection:bg-[#6e260e] selection:text-white">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Broadsheet Masthead */}
          <header className="border-t-4 border-b-2 border-[#2c2825] py-6 text-center space-y-3">
            <span className="font-sans text-[10px] uppercase tracking-widest text-[#6e260e] font-bold">THE ACADEMIC &amp; ENGINEERING DISPATCH</span>
            <h1 className="text-4xl sm:text-5xl font-normal italic tracking-tight">{displayName}</h1>
            <p className="font-sans text-xs uppercase tracking-wider text-[#6e260e] font-semibold">{headline}</p>
            <div className="font-sans text-xs text-[#70685f] border-t border-[#ded7cd] pt-2 flex justify-center gap-6">
              <span>Institution: {institution}</span>
              <span>Discipline: {program}</span>
              <span>Correspondent: @{handle}</span>
            </div>
          </header>

          {/* Feature Introduction */}
          <section className="border-b border-[#ded7cd] pb-8 space-y-3">
            <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#6e260e]">DISPATCH INTRODUCTION</span>
            <p className="text-base text-[#4a4239] leading-relaxed max-w-3xl first-letter:float-left first-letter:text-5xl first-letter:pr-3 first-letter:font-bold first-letter:text-[#2c2825]">
              {bio}
            </p>
          </section>

          {/* Project Reports */}
          <section className="space-y-8">
            <h2 className="font-sans text-xs font-bold uppercase tracking-widest text-[#2c2825] border-b border-[#2c2825] pb-1">
              DOCUMENTED PROOF OF WORK ({projects.length})
            </h2>

            <div className="space-y-8 divide-y divide-[#ded7cd]">
              {projects.map((proj) => (
                <div key={proj.id} className="pt-6 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold tracking-tight text-[#2c2825]">{proj.title}</h3>
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#6e260e]">
                      Status: {proj.status}
                    </span>
                  </div>
                  {proj.summary && <p className="text-sm text-[#4a4239] leading-relaxed">{proj.summary}</p>}
                  {proj.problem && (
                    <blockquote className="border-l-2 border-[#6e260e] pl-4 italic text-sm text-[#70685f]">
                      &ldquo;{proj.problem}&rdquo;
                    </blockquote>
                  )}
                  <div className="font-sans flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                    <span className="text-[#70685f]">Tooling: {proj.technologies.join(' • ')}</span>
                    <div className="flex items-center gap-4 font-bold text-[#6e260e]">
                      {proj.demoUrl && <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="hover:underline">Exhibit Demo</a>}
                      {proj.repositoryUrl && <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" className="hover:underline">Repository</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 7. CANVAS THEME — Airy Art Gallery Exhibition
  if (themeId === 'canvas') {
    return (
      <div className="bg-[#fcfaf7] text-stone-900 min-h-screen font-serif py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <header className="p-8 border border-stone-200 bg-white rounded-xl shadow-xs space-y-3">
            <span className="font-sans text-[10px] uppercase tracking-widest text-stone-400">Exhibition Space</span>
            <h1 className="text-3xl font-light tracking-wide text-stone-900">{displayName}</h1>
            <p className="text-sm font-light text-stone-600 font-sans">{headline}</p>
            <div className="font-sans text-xs text-stone-500 pt-2 border-t border-stone-100 flex gap-4">
              <span>{institution}</span> • <span>{program}</span>
            </div>
          </header>

          <section className="space-y-6">
            <div className="font-sans text-xs tracking-widest uppercase text-stone-400 border-b border-stone-200 pb-2">
              Curated Works ({projects.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj, idx) => (
                <div key={proj.id} className="bg-white border border-stone-200 p-6 rounded-xl space-y-4 shadow-xs">
                  <span className="font-sans text-[10px] text-stone-400 tracking-wider">Plate {idx + 1}</span>
                  <h3 className="text-lg font-normal text-stone-900">{proj.title}</h3>
                  {proj.summary && <p className="font-sans text-xs text-stone-600 leading-relaxed">{proj.summary}</p>}
                  <div className="font-sans text-xs pt-2 border-t border-stone-100 flex justify-between items-center text-stone-500">
                    <span className="truncate max-w-[150px]">{proj.technologies.slice(0, 3).join(', ')}</span>
                    {proj.demoUrl && <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="text-stone-900 font-medium hover:underline">View</a>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 8. MIDNIGHT THEME — Developer Cyberpunk / Unix Terminal Dark
  if (themeId === 'midnight') {
    return (
      <div className="bg-[#0d1117] text-slate-100 min-h-screen font-mono p-4 sm:p-8 selection:bg-emerald-500 selection:text-black">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Terminal Window Header */}
          <div className="rounded-2xl border border-indigo-900/60 bg-slate-950/90 shadow-2xl shadow-indigo-950/50 overflow-hidden">
            <div className="bg-slate-900/90 border-b border-indigo-900/40 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-slate-400">user@{handle}: ~/portfolio</span>
              <span className="text-xs text-indigo-400 font-bold">[zsh]</span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-1 text-xs">
                <p className="text-slate-400">$ whoami</p>
                <h1 className="text-2xl font-bold text-white tracking-wide">{displayName}</h1>
                <p className="text-emerald-400">{headline}</p>
                <p className="text-indigo-300 pt-1">Academic origin: {institution} / {program}</p>
              </div>

              <div className="text-xs space-y-1 pt-3 border-t border-indigo-900/40">
                <p className="text-slate-400">$ cat about.txt</p>
                <p className="text-slate-300 leading-relaxed">{bio}</p>
              </div>
            </div>
          </div>

          {/* Terminal Project Entries */}
          <div className="space-y-4">
            <div className="text-xs text-emerald-400 font-bold flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span>$ ls -la ./projects/</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="rounded-xl border border-indigo-900/50 bg-slate-950/70 p-5 space-y-3 hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-bold">{proj.title}.ts</span>
                    <span className="text-[10px] text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded">
                      {proj.status}
                    </span>
                  </div>
                  {proj.summary && <p className="text-xs text-slate-400 leading-relaxed">{proj.summary}</p>}
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-indigo-950">
                    {proj.technologies.map((t) => (
                      <span key={t} className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs pt-1">
                    {proj.demoUrl && <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">./run_demo</a>}
                    {proj.repositoryUrl && <a href={proj.repositoryUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">git clone</a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 9. SUNSET THEME — Warm Dusk Atmosphere & Soft Rounded Curves
  if (themeId === 'sunset') {
    return (
      <div className="bg-gradient-to-br from-amber-50/60 via-rose-50/40 to-orange-50/60 text-slate-900 min-h-screen py-12 px-4 sm:px-6 font-sans">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="rounded-3xl border border-rose-200/60 bg-white/80 backdrop-blur-md p-8 shadow-sm space-y-3">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Sunset Creative Flow</span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{displayName}</h1>
            <p className="text-sm text-slate-700">{headline}</p>
            <div className="text-xs text-slate-500 pt-2 flex gap-3">
              <span>{institution}</span> • <span>{program}</span>
            </div>
          </header>

          <section className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Featured Endeavors ({projects.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="rounded-3xl border border-orange-200/50 bg-white/90 p-6 shadow-sm hover:border-orange-300 transition-all space-y-3">
                  <h3 className="font-bold text-base text-slate-900">{proj.title}</h3>
                  {proj.summary && <p className="text-xs text-slate-600 leading-relaxed">{proj.summary}</p>}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.technologies.map((t) => (
                      <span key={t} className="text-[11px] bg-orange-50 text-orange-800 font-medium px-2.5 py-0.5 rounded-full border border-orange-100">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 10. MINIMAL THEME — Pure Swiss Typographic Discipline & Hairline Grid
  if (themeId === 'minimal') {
    return (
      <div className="bg-white text-zinc-900 min-h-screen py-16 px-4 sm:px-8 font-sans selection:bg-zinc-900 selection:text-white">
        <div className="max-w-3xl mx-auto space-y-16">
          <header className="space-y-2 border-b border-zinc-200 pb-8">
            <h1 className="text-3xl font-semibold tracking-tight">{displayName}</h1>
            <p className="text-sm text-zinc-500">{headline}</p>
            <div className="text-xs text-zinc-400 pt-1">{institution} / {program}</div>
          </header>

          <section className="space-y-3">
            <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">About</h2>
            <p className="text-sm text-zinc-700 leading-relaxed">{bio}</p>
          </section>

          <section className="space-y-8">
            <h2 className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">Selected Work</h2>
            <div className="divide-y divide-zinc-200">
              {projects.map((proj) => (
                <div key={proj.id} className="py-6 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-base font-semibold text-zinc-900">{proj.title}</h3>
                    <span className="text-xs text-zinc-400 font-mono">{proj.status}</span>
                  </div>
                  {proj.summary && <p className="text-xs text-zinc-600 leading-relaxed">{proj.summary}</p>}
                  <div className="text-xs text-zinc-400 pt-1">{proj.technologies.join(' · ')}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 11. OCEAN THEME — Cool Maritime Azure & Translucent Surfaces
  if (themeId === 'ocean') {
    return (
      <div className="bg-[#071724] text-sky-100 min-h-screen py-12 px-4 sm:px-6 font-sans">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="rounded-2xl border border-sky-800/60 bg-sky-950/40 backdrop-blur-md p-8 shadow-xl space-y-3">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Maritime Portfolio</span>
            <h1 className="text-3xl font-bold tracking-tight text-white">{displayName}</h1>
            <p className="text-sm text-sky-200">{headline}</p>
            <div className="text-xs text-sky-400 pt-1">{institution} • {program}</div>
          </header>

          <section className="space-y-6">
            <h2 className="text-lg font-bold text-white">Project Fleet ({projects.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="rounded-2xl border border-sky-800/50 bg-sky-950/30 p-6 space-y-3">
                  <h3 className="font-bold text-base text-white">{proj.title}</h3>
                  {proj.summary && <p className="text-xs text-sky-200/80 leading-relaxed">{proj.summary}</p>}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.technologies.map((t) => (
                      <span key={t} className="text-[10px] bg-sky-900/60 text-cyan-200 px-2.5 py-0.5 rounded-md border border-sky-700/50">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  // 12. AURORA THEME — Nordic Polar Night & Luminous Neon Glow
  return (
    <div className="bg-[#050b14] text-slate-100 min-h-screen py-12 px-4 sm:px-6 font-sans selection:bg-teal-400 selection:text-black">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="rounded-3xl border border-teal-500/30 bg-slate-900/40 backdrop-blur-md p-8 shadow-[0_0_30px_rgba(20,184,166,0.12)] space-y-3">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Aurora Luminous
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white">{displayName}</h1>
          <p className="text-sm text-slate-300">{headline}</p>
          <div className="text-xs text-teal-300/80 pt-1">{institution} • {program}</div>
        </header>

        <section className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Aurora Highlights</span>
            <span className="text-xs font-mono text-teal-400">[{projects.length}]</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div key={proj.id} className="rounded-2xl border border-teal-500/20 bg-slate-900/50 p-6 space-y-3 hover:border-teal-400/50 transition-all">
                <h3 className="font-bold text-base text-white">{proj.title}</h3>
                {proj.summary && <p className="text-xs text-slate-300 leading-relaxed">{proj.summary}</p>}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {proj.technologies.map((t) => (
                    <span key={t} className="text-[10px] bg-teal-950/80 text-teal-300 px-2 py-0.5 rounded-full border border-teal-800/60">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
