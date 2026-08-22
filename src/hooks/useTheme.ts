/**
 * Theme Hook
 * Provides access to current theme and theme switching
 */

import { useColorScheme } from 'react-native';
import { theme, Theme, ThemeMode } from '../theme';

export const useTheme = (): Theme & { toggleTheme: () => void } => {
  const systemColorScheme = useColorScheme() as ThemeMode;
  const currentTheme = systemColorScheme === 'dark' ? theme.dark : theme.light;

  const toggleTheme = () => {
    // This will be enhanced later with persistent storage
    console.log('Theme toggle requested');
  };

  return {
    ...currentTheme,
    toggleTheme,
  };
};
