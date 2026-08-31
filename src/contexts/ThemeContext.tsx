/**
 * Theme Context
 * Provides theme management with persistent storage
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { theme, Theme, ThemeMode } from '../theme';

const THEME_STORAGE_KEY = '@vone_trucking_theme_mode';

interface ThemeContextValue extends Theme {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');
        setThemeModeState('dark');
      } catch (error) {
        setThemeModeState('dark');
      }
    };

    loadTheme();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, 'dark');
      setThemeModeState('dark');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    // Permanent dark mode
    setThemeModeState('dark');
  }, []);

  const currentTheme = theme.dark;

  const value: ThemeContextValue = {
    ...currentTheme,
    themeMode: 'dark',
    isDarkMode: true,
    setThemeMode,
    toggleTheme,
    isLoading: false,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
