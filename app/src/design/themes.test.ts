import { describe, it, expect } from 'vitest';
import { PORTFOLIO_THEMES, ALL_THEME_IDS, getPortfolioTheme } from './themes';
import { APP_PALETTES, getPalette } from './palettes';
import { PortfolioThemeId, AppPaletteId } from '../types';

describe('Design Tokens & Themes Registry', () => {
  it('registers all 12 portfolio presentation themes per specification', () => {
    const expectedThemes: PortfolioThemeId[] = [
      'studio',
      'noir',
      'canvas',
      'midnight',
      'brutalist',
      'sunset',
      'minimal',
      'sticker',
      'resume',
      'ocean',
      'editorial',
      'aurora',
    ];

    expect(ALL_THEME_IDS).toHaveLength(12);
    expectedThemes.forEach((themeId) => {
      expect(PORTFOLIO_THEMES[themeId]).toBeDefined();
      const theme = getPortfolioTheme(themeId);
      expect(theme.name).toBeTruthy();
      expect(theme.tagline).toBeTruthy();
      expect(theme.containerClass).toBeTruthy();
      expect(theme.cardClass).toBeTruthy();
      expect(theme.badgeClass).toBeTruthy();
      expect(theme.buttonClass).toBeTruthy();
    });
  });

  it('registers all 5 application-wide color palettes', () => {
    const expectedPalettes: AppPaletteId[] = ['teal', 'ocean', 'indigo', 'emerald', 'coral'];

    expectedPalettes.forEach((paletteId) => {
      const palette = getPalette(paletteId);
      expect(palette).toBeDefined();
      expect(palette.name).toBeTruthy();
      expect(palette.primaryHex).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(palette.primaryLightHex).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(palette.primaryDarkHex).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    expect(Object.keys(APP_PALETTES)).toHaveLength(5);
  });
});
