/**
 * Theme Provider - Vone Trucking Design System
 * Provides theme values per specification
 */

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { lightTheme, darkTheme, brandColors } from './colors';
import { typography, fontSizes, fontWeights, lineHeights, letterSpacing } from './typography';
import { spacing, borderRadius, shadows, touchTargets, layout } from './spacing';
import type { Theme, ThemeMode } from './index';

const defaultTheme: Theme = {
  mode: 'light',
  colors: lightTheme,
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
};

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}>({
  theme: defaultTheme,
  toggleTheme: () => {},
  setThemeMode: () => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default theme if context is not available
    return defaultTheme;
  }
  return context.theme;
};

export const useThemeControl = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeControl must be used within ThemeProvider');
  }
  return {
    mode: context.theme.mode,
    toggleTheme: context.toggleTheme,
    setThemeMode: context.setThemeMode,
  };
};

interface ThemeProviderProps {
  children: ReactNode;
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children,
  initialMode = 'light',
}) => {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const theme: Theme = {
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
  };

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
