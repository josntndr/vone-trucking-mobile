/**
 * Theme System Entry Point
 * Exports all theme tokens and utilities
 */

import { colors, lightTheme, darkTheme, ThemeColors } from './colors';
import { typography, fontSizes, fontWeights, lineHeights, letterSpacing } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  lineHeights: typeof lineHeights;
  letterSpacing: typeof letterSpacing;
}

export const createTheme = (mode: ThemeMode): Theme => ({
  mode,
  colors: mode === 'light' ? lightTheme : darkTheme,
  typography,
  spacing,
  borderRadius,
  shadows,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacing,
});

// Default themes
export const theme = {
  light: createTheme('light'),
  dark: createTheme('dark'),
};

// Export individual tokens
export { colors, lightTheme, darkTheme };
export { typography, fontSizes, fontWeights, lineHeights, letterSpacing };
export { spacing, borderRadius, shadows };

// Re-export types
export type { ThemeColors };
export type ColorTheme = ThemeColors;
