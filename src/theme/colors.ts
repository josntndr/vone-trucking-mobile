/**
 * Vone Trucking Color System
 * Consistent colors per specification
 */

// Brand Colors
export const brandColors = {
  // Primary Navy: #192A4A
  primary: '#192A4A',
  primaryLight: '#2D4166',
  primaryDark: '#0F1A2E',
  
  // Accent Orange: #D87532
  accent: '#D87532',
  accentLight: '#E89358',
  accentDark: '#B65E23',
  
  // Warm Background: #F7F4EF
  warmBackground: '#F7F4EF',
  
  // Main Surface: #FFFDFC
  surface: '#FFFDFC',
  
  // Text Colors
  textPrimary: '#24211F',
  textSecondary: '#746B63',
  
  // Border: #E5DDD5
  border: '#E5DDD5',
  
  // Status Colors
  success: '#4F956E',
  successLight: '#6BAA85',
  successDark: '#3A7053',
  
  warning: '#C68A24',
  warningLight: '#D4A450',
  warningDark: '#9A6B1B',
  
  error: '#C44C47',
  errorLight: '#D37169',
  errorDark: '#9B3A36',
  
  info: '#4D728C',
  infoLight: '#6B8EA4',
  infoDark: '#3A5669',
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// Light Theme
export const lightTheme = {
  // Backgrounds
  background: brandColors.warmBackground,
  backgroundSecondary: brandColors.surface,
  
  // Surfaces
  surface: brandColors.surface,
  surfaceElevated: brandColors.white,
  
  // Text
  text: brandColors.textPrimary,
  textSecondary: brandColors.textSecondary,
  textTertiary: '#B4ADA5',
  textInverse: brandColors.white,
  textDisabled: '#B4ADA5',
  
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
  borderLight: '#EFE9E3',
  borderDark: '#D0C7BD',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
  
  // Base
  white: brandColors.white,
  black: brandColors.black,
  transparent: brandColors.transparent,
  
  // Card surface variants for elevated/flat distinction
  elevated: brandColors.white,
  light: '#EFE9E3',
  
  // Legacy/common style properties
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
} as const;

// Dark Theme (if needed later)
export const darkTheme = {
  // Backgrounds
  background: '#1A1614',
  backgroundSecondary: '#242220',
  
  // Surfaces
  surface: '#2A2826',
  surfaceElevated: '#342F2D',
  
  // Text
  text: '#F7F4EF',
  textSecondary: '#B4ADA5',
  textTertiary: '#746B63',
  textInverse: '#24211F',
  textDisabled: '#746B63',
  
  // Brand (adjusted for dark mode)
  primary: '#4D6B99',
  primaryLight: '#6685B3',
  primaryDark: '#3A5273',
  
  accent: '#E89358',
  accentLight: '#F0A976',
  accentDark: '#D87532',
  
  // Status
  success: '#6BAA85',
  successLight: '#88BFA0',
  successDark: '#4F956E',
  
  warning: '#D4A450',
  warningLight: '#E0B86F',
  warningDark: '#C68A24',
  
  error: '#D37169',
  errorLight: '#E0918A',
  errorDark: '#C44C47',
  
  info: '#6B8EA4',
  infoLight: '#88A5B8',
  infoDark: '#4D728C',
  
  // Borders
  border: '#3E3935',
  borderLight: '#4A443F',
  borderDark: '#32302D',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Base
  white: brandColors.white,
  black: brandColors.black,
  transparent: brandColors.transparent,
  
  // Card surface variants for elevated/flat distinction
  elevated: '#342F2D',
  light: '#4A443F',
  
  // Legacy/common style properties
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
    50: '#FAF9F7',
    100: '#F7F4EF',
    200: '#E5DDD5',
    300: '#D0C7BD',
    400: '#B4ADA5',
    500: '#8A827A',
    600: '#746B63',
    700: '#5A534D',
    800: '#3E3935',
    900: '#24211F',
  },
} as const;
