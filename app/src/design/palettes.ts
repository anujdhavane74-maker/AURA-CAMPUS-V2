import { AppPalette, AppPaletteId } from '../types';

/**
 * 5 Application-wide Palettes: Teal, Ocean, Indigo, Emerald, Coral
 * Each palette is balanced for high contrast and WCAG 2.2 AA accessibility.
 */
export const APP_PALETTES: Record<AppPaletteId, AppPalette> = {
  teal: {
    id: 'teal',
    name: 'Teal',
    description: 'Calm, student-forward signature teal tone',
    primaryHex: '#0d9488',
    primaryLightHex: '#ccfbf1',
    primaryDarkHex: '#115e59',
    accentClass: 'bg-teal-600 hover:bg-teal-700 text-white',
    ringClass: 'focus-visible:ring-teal-500',
    bgLightClass: 'bg-teal-50 text-teal-800 border-teal-200',
    badgeClass: 'bg-teal-100 text-teal-800',
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep maritime blue, serene and focused',
    primaryHex: '#0284c7',
    primaryLightHex: '#e0f2fe',
    primaryDarkHex: '#075985',
    accentClass: 'bg-sky-600 hover:bg-sky-700 text-white',
    ringClass: 'focus-visible:ring-sky-500',
    bgLightClass: 'bg-sky-50 text-sky-800 border-sky-200',
    badgeClass: 'bg-sky-100 text-sky-800',
  },
  indigo: {
    id: 'indigo',
    name: 'Indigo',
    description: 'Academic, intellectual royal indigo',
    primaryHex: '#4f46e5',
    primaryLightHex: '#e0e7ff',
    primaryDarkHex: '#3730a3',
    accentClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    ringClass: 'focus-visible:ring-indigo-500',
    bgLightClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    badgeClass: 'bg-indigo-100 text-indigo-800',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    description: 'Vibrant organic green, growth-oriented',
    primaryHex: '#059669',
    primaryLightHex: '#d1fae5',
    primaryDarkHex: '#065f46',
    accentClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    ringClass: 'focus-visible:ring-emerald-500',
    bgLightClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  coral: {
    id: 'coral',
    name: 'Coral',
    description: 'Energetic warm coral, lively and creative',
    primaryHex: '#e11d48',
    primaryLightHex: '#ffe4e6',
    primaryDarkHex: '#9f1239',
    accentClass: 'bg-rose-600 hover:bg-rose-700 text-white',
    ringClass: 'focus-visible:ring-rose-500',
    bgLightClass: 'bg-rose-50 text-rose-800 border-rose-200',
    badgeClass: 'bg-rose-100 text-rose-800',
  },
};

export const DEFAULT_PALETTE_ID: AppPaletteId = 'teal';

export function getPalette(id: AppPaletteId): AppPalette {
  return APP_PALETTES[id] || APP_PALETTES.teal;
}
