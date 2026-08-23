/**
 * Theme System Entry Point
 * Exports all theme tokens and utilities
 */

import { lightTheme, darkTheme, ThemeColors, brandColors } from './colors';
import { typography, fontSizes, fontWeights, lineHeights, letterSpacing } from './typography';
import { spacing, borderRadius, shadows, touchTargets, layout } from './spacing';

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
  touchTargets: typeof touchTargets;
  layout: typeof layout;
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
  touchTargets,
  layout,
});

// Default themes
export const theme = {
  light: createTheme('light'),
  dark: createTheme('dark'),
};

// Export individual tokens
export { brandColors, lightTheme, darkTheme };
export { typography, fontSizes, fontWeights, lineHeights, letterSpacing };
export { spacing, borderRadius, shadows, touchTargets, layout };

// Re-export types
export type { ThemeColors };
export type ColorTheme = ThemeColors;
