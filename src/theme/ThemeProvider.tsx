/**
 * Theme Provider - Modern Vone Trucking Design System
 * Warm, sophisticated palette inspired by modern mobile apps
 * Deep ink navy, muted orange/clay accents, warm backgrounds
 */

import React, { createContext, useContext, ReactNode } from 'react';

// Warm, Modern Vone Trucking Color System
const colors = {
  // Brand Colors - Deep, sophisticated tones
  primary: '#1B2845',        // Deep ink navy (darker, warmer than pure navy)
  primaryLight: '#2E4057',   // Lighter navy with warmth
  primaryDark: '#0F1923',    // Very dark navy, almost black
  accent: '#D97638',         // Muted clay orange (warmer, less bright)
  accentLight: '#E89A5F',    // Lighter clay
  accentDark: '#B85E28',     // Deeper terracotta
  
  // Background Colors - Warm, inviting
  background: '#FAF9F7',     // Warm off-white (cream undertone)
  backgroundDark: '#F0EBE3', // Slightly darker warm background
  surface: '#FFFFFF',        // Pure white for cards
  surfaceElevated: '#FEFDFB', // Barely-there warm tint
  
  // Text Colors - Warm, readable
  text: '#2A2520',           // Deep warm charcoal (not pure black)
  textSecondary: '#6B5D52',  // Warm mid-gray with brown undertone
  textTertiary: '#9C8D80',   // Light warm gray
  textInverse: '#FFFFFF',    // Text on dark backgrounds
  
  // Border Colors - Soft, subtle
  border: '#E8E3DC',         // Soft warm border
  borderLight: '#F2EFE9',    // Very light warm border
  borderDark: '#CDC4B8',     // Darker warm border
  
  // Status Colors - Muted, sophisticated
  success: '#5C9F76',        // Muted sage green
  successLight: '#7DB795',
  successDark: '#478563',
  
  warning: '#D9A74A',        // Muted amber/gold
  warningLight: '#E6BD6D',
  warningDark: '#B8872F',
  
  error: '#C85C52',          // Muted terracotta red
  errorLight: '#D97E75',
  errorDark: '#A54139',
  
  info: '#5B8BA6',           // Muted steel blue
  infoLight: '#7BA5BB',
  infoDark: '#446E85',
  
  // Trip Status Colors - Consistent with muted palette
  statusScheduled: '#5B8BA6',    // Muted blue
  statusInProgress: '#D9A74A',   // Muted amber
  statusCompleted: '#5C9F76',    // Muted green
  statusCancelled: '#9C8D80',    // Warm gray
  statusDelayed: '#C85C52',      // Muted red
  
  // Overlay Colors
  overlay: 'rgba(27, 40, 69, 0.6)',      // Dark navy overlay
  overlayLight: 'rgba(27, 40, 69, 0.3)',
};

// Typography Scale - Strong, editorial-style headings
const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 17,        // Increased from 16 for better readability
    lg: 20,          // Increased for stronger hierarchy
    xl: 24,
    '2xl': 32,       // Large editorial headings
    '3xl': 38,       // Very large headings
    '4xl': 44,       // Hero text
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,    // More comfortable
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,  // For strong headlines
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

// Border Radius - Rounded, modern mobile surfaces
const borderRadius = {
  none: 0,
  sm: 8,
  base: 12,
  md: 18,         // Increased for more rounded cards
  lg: 24,         // Very rounded
  xl: 32,         // Extra rounded
  full: 9999,
};

// Shadows - Soft, subtle elevation
const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#1B2845',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  base: {
    shadowColor: '#1B2845',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#1B2845',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1B2845',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
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
