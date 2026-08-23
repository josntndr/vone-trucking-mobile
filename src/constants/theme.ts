/**
 * Vone Trucking Theme Constants
 * Centralized theme values per specification
 */

// Exact color values from specification
export const THEME_COLORS = {
  // Primary Navy
  PRIMARY: '#192A4A',
  
  // Accent Orange
  ACCENT: '#D87532',
  
  // Backgrounds
  WARM_BACKGROUND: '#F7F4EF',
  SURFACE: '#FFFDFC',
  
  // Text
  TEXT_PRIMARY: '#24211F',
  TEXT_SECONDARY: '#746B63',
  
  // Border
  BORDER: '#E5DDD5',
  
  // Status
  SUCCESS: '#4F956E',
  WARNING: '#C68A24',
  ERROR: '#C44C47',
  INFO: '#4D728C',
  
  // Base
  WHITE: '#FFFFFF',
  BLACK: '#000000',
} as const;

// Spacing values from specification
export const THEME_SPACING = {
  SCREEN_PADDING: 16,
  ELEMENT_SPACING_RELATED: 12,
  ELEMENT_SPACING_SECTION: 24,
  CARD_PADDING: 16,
} as const;

// Border radius from specification (16-20px)
export const THEME_RADIUS = {
  CARD: 16,
  BUTTON: 12,
  INPUT: 12,
} as const;

// Typography from specification (at least 16px body text)
export const THEME_TYPOGRAPHY = {
  BODY_SIZE: 16,
  MIN_BODY_SIZE: 16,
} as const;

// Touch targets from specification (at least 44px)
export const THEME_TOUCH = {
  MINIMUM: 44,
} as const;

// Export all as default
export const THEME = {
  colors: THEME_COLORS,
  spacing: THEME_SPACING,
  radius: THEME_RADIUS,
  typography: THEME_TYPOGRAPHY,
  touch: THEME_TOUCH,
} as const;
