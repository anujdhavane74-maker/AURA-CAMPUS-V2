import React, { useState } from 'react';
import { PORTFOLIO_THEMES, ALL_THEME_IDS } from '../../design/themes';
import { PortfolioThemeId } from '../../types';
import { Check, Sparkles, Maximize2 } from 'lucide-react';

interface VisualThemePickerProps {
  selectedThemeId: PortfolioThemeId;
  onSelectTheme: (themeId: PortfolioThemeId) => void;
  mode?: 'sidebar' | 'modal' | 'grid';
  onOpenModal?: () => void;
}

export const VisualThemePicker: React.FC<VisualThemePickerProps> = ({
  selectedThemeId,
  onSelectTheme,
  mode = 'grid',
  onOpenModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'clean' | 'dark' | 'expressive'>('all');

  // Categorize themes for practical browsing
  const themeCategories: Record<string, PortfolioThemeId[]> = {
    clean: ['studio', 'canvas', 'minimal', 'resume'],
    dark: ['noir', 'midnight', 'ocean', 'aurora'],
    expressive: ['brutalist', 'sunset', 'sticker', 'editorial'],
  };

  const filteredThemeIds = ALL_THEME_IDS.filter((id) => {
    if (activeCategory === 'all') return true;
    return themeCategories[activeCategory]?.includes(id);
  });

  const renderMiniaturePreview = (themeId: PortfolioThemeId) => {
    switch (themeId) {
      case 'studio':
        return (
          <div className="h-full bg-slate-50 text-slate-800 p-2.5 flex flex-col justify-between rounded-xl font-sans border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 rounded-full bg-teal-600 shrink-0" />
                <div className="h-2 w-16 bg-slate-900 rounded font-bold" />
              </div>
              <span className="text-[8px] font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded border border-teal-200">
                Studio
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="h-10 bg-white border border-slate-200 rounded-lg p-1.5 shadow-2xs space-y-1">
                <div className="h-1.5 w-10 bg-slate-800 rounded" />
                <div className="h-1 w-6 bg-teal-500 rounded" />
              </div>
              <div className="h-10 bg-white border border-slate-200 rounded-lg p-1.5 shadow-2xs space-y-1">
                <div className="h-1.5 w-10 bg-slate-800 rounded" />
                <div className="h-1 w-6 bg-teal-500 rounded" />
              </div>
            </div>
          </div>
        );

      case 'noir':
        return (
          <div className="h-full bg-[#090a0f] text-neutral-100 p-2.5 flex flex-col justify-between rounded-xl font-sans border border-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
              <div className="text-[8px] text-neutral-400 font-mono tracking-widest">INDEX // 01</div>
              <div className="h-2 w-14 bg-white rounded font-bold" />
            </div>
            <div className="space-y-1">
              <div className="h-8 bg-neutral-900/90 border border-neutral-800 rounded-lg p-1.5 flex items-center justify-between">
                <div className="h-1.5 w-12 bg-neutral-200 rounded" />
                <span className="text-[7px] font-mono text-neutral-500">01</span>
              </div>
              <div className="h-8 bg-neutral-900/90 border border-neutral-800 rounded-lg p-1.5 flex items-center justify-between">
                <div className="h-1.5 w-12 bg-neutral-200 rounded" />
                <span className="text-[7px] font-mono text-neutral-500">02</span>
              </div>
            </div>
          </div>
        );

      case 'brutalist':
        return (
          <div className="h-full bg-[#f4f3ef] text-black p-2 flex flex-col justify-between font-mono border-2 border-black">
            <div className="flex justify-between items-center bg-black text-white px-1.5 py-0.5 text-[8px] font-black">
              <span>STUDENT_RECORD.EXE</span>
              <span>[#1]</span>
            </div>
            <div className="bg-yellow-300 border-2 border-black p-1.5 shadow-[3px_3px_0px_0px_#000] space-y-1">
              <div className="h-2 w-16 bg-black" />
              <div className="h-1.5 w-10 bg-black/60" />
            </div>
          </div>
        );

      case 'resume':
        return (
          <div className="h-full bg-slate-100 p-1.5 flex items-center justify-center font-sans">
            <div className="w-full h-full bg-white border border-slate-300 p-2 space-y-1.5 shadow-xs">
              <div className="text-center border-b border-slate-200 pb-1">
                <div className="h-2 w-14 bg-slate-900 mx-auto rounded" />
                <div className="h-1 w-20 bg-slate-400 mx-auto mt-0.5 rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-slate-700 rounded-sm" />
                <div className="h-1 w-4/5 bg-slate-300 rounded-sm" />
              </div>
            </div>
          </div>
        );

      case 'sticker':
        return (
          <div className="h-full bg-[#faf6ee] p-2 flex flex-col justify-between font-sans border border-amber-200/80 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[8px] font-bold text-amber-900 -rotate-2 border border-amber-300">
                student!
              </span>
              <div className="h-4 w-4 rounded-full bg-teal-500 text-white text-[8px] flex items-center justify-center rotate-6 shadow-2xs">
                ★
              </div>
            </div>
            <div className="bg-white border-2 border-slate-900 rounded-2xl p-2 shadow-[2px_2px_0px_#000] rotate-1 space-y-1">
              <div className="h-2 w-12 bg-slate-900 rounded-full" />
              <div className="h-1.5 w-8 bg-teal-500 rounded-full" />
            </div>
          </div>
        );

      case 'editorial':
        return (
          <div className="h-full bg-[#faf8f5] text-[#2c2825] p-2.5 flex flex-col justify-between font-serif border-t-2 border-b-2 border-[#2c2825] rounded-lg">
            <div className="text-[8px] uppercase tracking-widest text-[#6e260e] font-sans font-extrabold border-b border-[#2c2825]/30 pb-0.5">
              THE DISPATCH
            </div>
            <div className="space-y-1">
              <div className="h-2.5 w-20 bg-[#2c2825]" />
              <div className="h-1 w-full bg-[#ded7cd]" />
            </div>
          </div>
        );

      case 'canvas':
        return (
          <div className="h-full bg-[#fcfaf7] p-2.5 flex flex-col justify-between font-sans border border-stone-200 rounded-xl">
            <span className="text-[8px] text-stone-400 tracking-widest font-mono">GALLERY SPACE</span>
            <div className="bg-white border border-stone-200 p-2 rounded-lg space-y-1 shadow-2xs">
              <div className="h-2 w-14 bg-stone-900 rounded" />
              <div className="h-1.5 w-8 bg-stone-400 rounded" />
            </div>
          </div>
        );

      case 'midnight':
        return (
          <div className="h-full bg-[#0b0f19] text-slate-100 p-2 flex flex-col justify-between rounded-xl font-mono border border-indigo-900/70">
            <div className="flex items-center gap-1 border-b border-indigo-950 pb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[7px] text-indigo-400 ml-1">~/dev/portfolio</span>
            </div>
            <div className="space-y-1 text-[7px] text-emerald-400 bg-slate-950 p-1.5 rounded">
              <div>$ status: deploy</div>
              <div className="h-1.5 w-14 bg-indigo-500/50 rounded" />
            </div>
          </div>
        );

      case 'sunset':
        return (
          <div className="h-full bg-gradient-to-br from-amber-100/70 via-orange-50/50 to-rose-100/70 p-2.5 flex flex-col justify-between rounded-xl font-sans border border-orange-200/60">
            <div className="h-2 w-14 bg-orange-600 rounded-full" />
            <div className="bg-white/95 p-2 rounded-xl border border-orange-200/60 space-y-1 shadow-2xs">
              <div className="h-2 w-12 bg-slate-800 rounded" />
              <div className="h-1.5 w-6 bg-orange-400 rounded-full" />
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className="h-full bg-white p-2.5 flex flex-col justify-between font-sans border border-zinc-200 rounded-xl">
            <div className="h-2 w-12 bg-zinc-900 rounded-sm" />
            <div className="border-t border-zinc-200 pt-1.5 space-y-1">
              <div className="h-1.5 w-16 bg-zinc-700 rounded-sm" />
              <div className="h-1 w-8 bg-zinc-400 rounded-sm" />
            </div>
          </div>
        );

      case 'ocean':
        return (
          <div className="h-full bg-[#071724] p-2.5 flex flex-col justify-between rounded-xl font-sans border border-sky-800/70">
            <div className="h-2 w-12 bg-cyan-400 rounded-full" />
            <div className="bg-sky-950/80 border border-sky-700/60 p-2 rounded-lg space-y-1">
              <div className="h-2 w-14 bg-white rounded" />
              <div className="h-1.5 w-6 bg-cyan-300 rounded-full" />
            </div>
          </div>
        );

      case 'aurora':
        return (
          <div className="h-full bg-[#050b14] p-2.5 flex flex-col justify-between rounded-xl font-sans border border-teal-500/50 shadow-[0_0_12px_rgba(20,184,166,0.25)]">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <div className="h-2 w-12 bg-teal-400 rounded-full" />
            </div>
            <div className="bg-slate-900/80 border border-teal-500/40 p-2 rounded-xl space-y-1 backdrop-blur-xs">
              <div className="h-2 w-14 bg-white rounded" />
              <div className="h-1.5 w-6 bg-teal-400 rounded-full" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-teal-600" />
            <span>Theme Gallery (12 Distinct Visual Archetypes)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Select an architectural theme to transform typography, card structures, and visual identity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-teal-700 font-bold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Selected: {PORTFOLIO_THEMES[selectedThemeId]?.name}
          </span>
          {onOpenModal && mode === 'sidebar' && (
            <button
              type="button"
              onClick={onOpenModal}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              title="Expand Theme Gallery"
            >
              <Maximize2 className="h-3 w-3 text-teal-600" />
              <span>Browse All</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Pills (if modal or grid) */}
      {(mode === 'modal' || mode === 'grid') && (
        <div className="flex items-center gap-1.5 pb-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All 12 Themes
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('clean')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'clean'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Clean &amp; Minimal
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('dark')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'dark'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Dark &amp; Technical
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('expressive')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === 'expressive'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Expressive &amp; Editorial
          </button>
        </div>
      )}

      {/* Responsive Gallery Grid / Stack */}
      <div
        className={
          mode === 'sidebar'
            ? 'flex flex-col gap-3.5 max-h-[600px] overflow-y-auto pr-1'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
        }
      >
        {(mode === 'sidebar' ? ALL_THEME_IDS : filteredThemeIds).map((themeId) => {
          const theme = PORTFOLIO_THEMES[themeId];
          const isSelected = selectedThemeId === themeId;

          return (
            <button
              key={themeId}
              type="button"
              onClick={() => onSelectTheme(themeId)}
              className={`text-left rounded-2xl border-2 transition-all p-3 relative flex flex-col justify-between gap-2.5 group focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isSelected
                  ? 'border-teal-500 ring-2 ring-teal-500/30 bg-teal-50/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-2xs'
              }`}
            >
              {/* Selected Badge */}
              {isSelected && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white shadow-xs z-10">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
              )}

              {/* Realistic Visual Miniature Card */}
              <div
                className={`w-full rounded-xl overflow-hidden border border-slate-200/60 p-1 flex flex-col justify-between text-[9px] select-none pointer-events-none ${
                  mode === 'sidebar' ? 'h-24' : 'h-32'
                }`}
              >
                {renderMiniaturePreview(themeId)}
              </div>

              {/* Theme Name, Archetype Badge & Tagline */}
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-slate-900 group-hover:text-teal-700 transition-colors">
                    {theme.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    {theme.tagline.split('—')[0]?.trim() || themeId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-normal">
                  {theme.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
