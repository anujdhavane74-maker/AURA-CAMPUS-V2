import { createContext } from 'react';
import { AppPalette, AppPaletteId } from '../types';

export interface ThemeContextType {
  paletteId: AppPaletteId;
  palette: AppPalette;
  setPaletteId: (id: AppPaletteId) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
