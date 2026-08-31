/**
 * Theme Provider - Vone Trucking Design System
 * Bridges design system hooks with global ThemeContext
 */

import React, { ReactNode } from 'react';
import { useThemeContext, ThemeProvider as BaseThemeProvider } from '../contexts/ThemeContext';
import type { ThemeMode } from './index';

export const useTheme = () => {
  return useThemeContext();
};

export const useThemeControl = () => {
  const context = useThemeContext();
  return {
    mode: context.themeMode,
    toggleTheme: context.toggleTheme,
    setThemeMode: context.setThemeMode,
  };
};

export const ThemeProvider: React.FC<{ children: ReactNode; initialMode?: ThemeMode }> = BaseThemeProvider;
export default ThemeProvider;
