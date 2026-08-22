/**
 * Theme Provider - Temporary Stub for Testing
 * Returns basic colors to allow app to run
 */

import React, { createContext, useContext, ReactNode } from 'react';

// Simple color scheme
const colors = {
  primary: '#1A237E',
  secondary: '#4CAF50',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e0e0e0',
  error: '#f44336',
  warning: '#ff9800',
  success: '#4caf50',
  info: '#2196f3',
};

interface ThemeContextType {
  colors: typeof colors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colors,
  isDark: false,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return default theme if no provider
    return { colors, isDark: false };
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
