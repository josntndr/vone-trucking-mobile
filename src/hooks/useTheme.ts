/**
 * Theme Hook
 * Provides access to current theme and theme switching
 */

import { useThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
  return useThemeContext();
};
