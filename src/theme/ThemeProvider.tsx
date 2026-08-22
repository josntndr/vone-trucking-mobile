/**
 * Theme Provider - Professional Vone Trucking Design System
 * Deep navy blue primary, orange accent, consistent spacing and typography
 */

import React, { createContext, useContext, ReactNode } from 'react';

// Professional Vone Trucking Color System
const colors = {
  // Brand Colors
  primary: '#1A237E',        // Deep navy blue
  primaryLight: '#3949AB',   // Lighter navy
  primaryDark: '#0D1642',    // Darker navy
  accent: '#FF6F00',         // Orange accent
  accentLight: '#FF9800',    // Lighter orange/amber
  accentDark: '#E65100',     // Darker orange
  
  // Background Colors
  background: '#F5F5F5',     // Soft off-white
  backgroundDark: '#E0E0E0', // Slightly darker background
  surface: '#FFFFFF',        // White cards/surfaces
  surfaceElevated: '#FAFAFA', // Slightly elevated surfaces
  
  // Text Colors
  text: '#212121',           // Primary text (dark gray, not pure black)
  textSecondary: '#757575',  // Secondary text
  textTertiary: '#9E9E9E',   // Tertiary text/disabled
  textInverse: '#FFFFFF',    // Text on dark backgrounds
  
  // Border Colors
  border: '#E0E0E0',         // Default borders
  borderLight: '#F5F5F5',    // Light borders
  borderDark: '#BDBDBD',     // Darker borders
  
  // Status Colors
  success: '#4CAF50',        // Green
  successLight: '#81C784',
  successDark: '#388E3C',
  
  warning: '#FF9800',        // Amber
  warningLight: '#FFB74D',
  warningDark: '#F57C00',
  
  error: '#F44336',          // Red
  errorLight: '#E57373',
  errorDark: '#D32F2F',
  
  info: '#2196F3',           // Blue
  infoLight: '#64B5F6',
  infoDark: '#1976D2',
  
  // Trip Status Colors
  statusScheduled: '#2196F3',    // Blue
  statusInProgress: '#FF9800',   // Orange
  statusCompleted: '#4CAF50',    // Green
  statusCancelled: '#9E9E9E',    // Gray
  statusDelayed: '#F44336',      // Red
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

// Typography Scale
const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Spacing Scale (4px base)
const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};

// Border Radius
const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows
const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  isDark: boolean;
}

const defaultTheme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  isDark: false,
};

const ThemeContext = createContext<Theme>(defaultTheme);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return defaultTheme;
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
