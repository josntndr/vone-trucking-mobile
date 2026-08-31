/**
 * Vone Trucking Color System
 * Consistent colors per specification
 */

// Brand Colors - Modern Executive Fleet Theme
export const brandColors = {
  // Primary Navy: #0F1E36 (Executive Deep Navy)
  primary: '#0F1E36',
  primaryLight: '#1E293B',
  primaryDark: '#0A1220',
  
  // Accent Teal / Electric Cyan: #0EA5E9
  accent: '#0EA5E9',
  accentLight: '#38BDF8',
  accentDark: '#0284C7',

  // Secondary Warm Amber: #F59E0B
  accentOrange: '#F59E0B',
  accentOrangeLight: '#FBBF24',
  accentOrangeDark: '#D97706',
  
  // Ultra-Clean Background: #F8FAFC
  warmBackground: '#F8FAFC',
  
  // Main Surface: #FFFFFF
  surface: '#FFFFFF',
  
  // Text Colors
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  
  // Border: #E2E8F0
  border: '#E2E8F0',
  
  // Status Colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',
  
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',
  
  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',
  
  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Light Theme
export const lightTheme = {
  // Backgrounds
  background: brandColors.warmBackground,
  backgroundSecondary: '#F1F5F9',
  
  // Surfaces
  surface: brandColors.surface,
  surfaceElevated: brandColors.white,
  
  // Text
  text: brandColors.textPrimary,
  textSecondary: brandColors.textSecondary,
  textTertiary: brandColors.textTertiary,
  textInverse: brandColors.white,
  textDisabled: '#CBD5E1',
  
  // Brand
  primary: brandColors.primary,
  primaryLight: brandColors.primaryLight,
  primaryDark: brandColors.primaryDark,
  
  accent: brandColors.accent,
  accentLight: brandColors.accentLight,
  accentDark: brandColors.accentDark,
  
  // Status
  success: brandColors.success,
  successLight: brandColors.successLight,
  successDark: brandColors.successDark,
  
  warning: brandColors.warning,
  warningLight: brandColors.warningLight,
  warningDark: brandColors.warningDark,
  
  error: brandColors.error,
  errorLight: brandColors.errorLight,
  errorDark: brandColors.errorDark,
  
  info: brandColors.info,
  infoLight: brandColors.infoLight,
  infoDark: brandColors.infoDark,
  
  // Borders
  border: brandColors.border,
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  
  // Overlay
  overlay: 'rgba(15, 23, 42, 0.6)',
  overlayLight: 'rgba(15, 23, 42, 0.3)',
  
  // Base
  white: brandColors.white,
  black: brandColors.black,
  transparent: brandColors.transparent,
  
  // Card surface variants for elevated/flat distinction
  elevated: brandColors.white,
  light: '#F8FAFC',
  
  // Modern refined shadow properties
  shadow: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

// Dark Theme (if needed)
export const darkTheme = {
  // Backgrounds
  background: '#0B1120',
  backgroundSecondary: '#111827',
  
  // Surfaces
  surface: '#1E293B',
  surfaceElevated: '#334155',
  
  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textInverse: '#0F172A',
  textDisabled: '#475569',
  
  // Brand (adjusted for dark mode)
  primary: '#38BDF8',
  primaryLight: '#7DD3FC',
  primaryDark: '#0284C7',
  
  accent: '#38BDF8',
  accentLight: '#7DD3FC',
  accentDark: '#0284C7',
  
  // Status
  success: '#34D399',
  successLight: '#6EE7B7',
  successDark: '#10B981',
  
  warning: '#FBBF24',
  warningLight: '#FCD34D',
  warningDark: '#F59E0B',
  
  error: '#F87171',
  errorLight: '#FCA5A5',
  errorDark: '#EF4444',
  
  info: '#60A5FA',
  infoLight: '#93C5FD',
  infoDark: '#3B82F6',
  
  // Borders
  border: '#334155',
  borderLight: '#475569',
  borderDark: '#1E293B',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.6)',
  
  // Base
  white: brandColors.white,
  black: brandColors.black,
  transparent: brandColors.transparent,
  
  // Card surface variants for elevated/flat distinction
  elevated: '#334155',
  light: '#1E293B',
  
  // Shadow properties
  shadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export type ColorTheme = typeof lightTheme;
export type ThemeColors = typeof lightTheme | typeof darkTheme;

// Legacy support - map old color structure to new
export const colors = {
  primary: brandColors.primary,
  accent: brandColors.accent,
  success: brandColors.success,
  warning: brandColors.warning,
  error: brandColors.error,
  info: brandColors.info,
  white: brandColors.white,
  black: brandColors.black,
  transparent: brandColors.transparent,
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
} as const;
