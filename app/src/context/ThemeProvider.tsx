import React, { useEffect, useState } from 'react';
import { AppPaletteId } from '../types';
import { APP_PALETTES, DEFAULT_PALETTE_ID } from '../design/palettes';
import { ThemeContext } from './ThemeContext';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paletteId, setPaletteIdState] = useState<AppPaletteId>(() => {
    try {
      const stored = localStorage.getItem('aura_palette') as AppPaletteId;
      if (stored && APP_PALETTES[stored]) {
        return stored;
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
    return DEFAULT_PALETTE_ID;
  });

  const palette = APP_PALETTES[paletteId] || APP_PALETTES[DEFAULT_PALETTE_ID];

  const setPaletteId = (id: AppPaletteId) => {
    if (APP_PALETTES[id]) {
      setPaletteIdState(id);
      try {
        localStorage.setItem('aura_palette', id);
      } catch {
        // Ignore storage errors
      }
    }
  };

  useEffect(() => {
    // Synchronize CSS custom property variables with current palette
    document.documentElement.style.setProperty('--palette-primary', palette.primaryHex);
    document.documentElement.style.setProperty('--palette-primary-light', palette.primaryLightHex);
    document.documentElement.style.setProperty('--palette-primary-dark', palette.primaryDarkHex);
  }, [palette]);

  return (
    <ThemeContext.Provider value={{ paletteId, palette, setPaletteId }}>
      {children}
    </ThemeContext.Provider>
  );
};
