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
  const systemColorScheme = useColorScheme() as ThemeMode | null;
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load stored theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedMode === 'light' || storedMode === 'dark') {
          setThemeModeState(storedMode);
        } else {
          // Default to light mode for new users
          setThemeModeState('light');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setThemeModeState('light');
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      throw error;
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    await setThemeMode(newMode);
  }, [themeMode, setThemeMode]);

  const currentTheme = themeMode === 'dark' ? theme.dark : theme.light;

  const value: ThemeContextValue = {
    ...currentTheme,
    themeMode,
    isDarkMode: themeMode === 'dark',
    setThemeMode,
    toggleTheme,
    isLoading,
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
