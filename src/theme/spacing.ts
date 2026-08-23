/**
 * Spacing and Layout Tokens
 * Consistent spacing per specification
 */

// Spacing Scale (in pixels)
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,    // Standard screen padding
  5: 20,
  6: 24,    // Section separation start
  7: 28,
  8: 32,    // Section separation end
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  
  // Named spacing for clarity
  xs: 4,
  sm: 8,
  md: 16,    // Standard screen padding
  lg: 24,    // Section separation
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border Radius (16-20px per spec)
export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  base: 12,
  md: 16,     // Standard card radius
  lg: 20,     // Large card radius
  xl: 24,
  '2xl': 32,
  full: 9999,
  
  // Named radius
  card: 16,
  button: 12,
  input: 12,
  badge: 12,
  pill: 9999,
} as const;

// Shadows (minimal per spec)
export const shadows = {
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
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Touch Targets (minimum 44x44px per spec)
export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
} as const;

// Common Layout Values
export const layout = {
  // Screen padding
  screenPadding: 16,
  
  // Element spacing
  elementSpacing: {
    related: 12,      // 12-16px between related elements
    section: 24,      // 24-32px between sections
  },
  
  // Card spacing
  cardPadding: 16,
  cardGap: 12,
  
  // Touch targets
  minTouchTarget: 44,
  
  // Border widths
  borderThin: 1,
  borderMedium: 2,
  borderThick: 3,
} as const;
