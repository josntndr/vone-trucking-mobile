/**
 * Vone Trucking Color System
 * Brand Identity: Deep navy primary with orange/amber accent
 */

export const colors = {
  // Primary - Deep Navy
  primary: {
    50: '#E8EAF6',
    100: '#C5CAE9',
    200: '#9FA8DA',
    300: '#7986CB',
    400: '#5C6BC0',
    500: '#1A237E', // Main deep navy
    600: '#161F6E',
    700: '#12195E',
    800: '#0E144E',
    900: '#0A0F3E',
  },
  
  // Accent - Orange/Amber
  accent: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFA000', // Main orange/amber
    600: '#FF8F00',
    700: '#FF6F00',
    800: '#E65100',
    900: '#BF360C',
  },
  
  // Success - Green
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Main success
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  // Error/Warning - Red
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Main error
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  
  // Warning - Amber
  warning: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF9800', // Main warning
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  
  // Grayscale
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Theme-specific color mappings
export const lightTheme = {
  background: {
    primary: colors.white,
    secondary: colors.gray[50],
    tertiary: colors.gray[100],
  },
  surface: {
    primary: colors.white,
    secondary: colors.gray[50],
    elevated: colors.white,
  },
  text: {
    primary: colors.gray[900],
    secondary: colors.gray[600],
    tertiary: colors.gray[500],
    disabled: colors.gray[400],
    inverse: colors.white,
  },
  border: {
    light: colors.gray[200],
    medium: colors.gray[300],
    heavy: colors.gray[400],
  },
  primary: colors.primary[500],
  accent: colors.accent[500],
  success: colors.success[500],
  error: colors.error[500],
  warning: colors.warning[500],
} as const;

export const darkTheme = {
  background: {
    primary: '#121212',
    secondary: '#1E1E1E',
    tertiary: '#2C2C2C',
  },
  surface: {
    primary: '#1E1E1E',
    secondary: '#2C2C2C',
    elevated: '#383838',
  },
  text: {
    primary: colors.gray[50],
    secondary: colors.gray[300],
    tertiary: colors.gray[400],
    disabled: colors.gray[600],
    inverse: colors.gray[900],
  },
  border: {
    light: colors.gray[800],
    medium: colors.gray[700],
    heavy: colors.gray[600],
  },
  primary: colors.primary[300],
  accent: colors.accent[400],
  success: colors.success[400],
  error: colors.error[400],
  warning: colors.warning[400],
} as const;

export type ColorTheme = typeof lightTheme;

export type ThemeColors = typeof lightTheme | typeof darkTheme;
