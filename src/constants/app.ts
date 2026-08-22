/**
 * Application-wide constants
 */

export const APP_NAME = 'Vone Trucking';
export const APP_TAGLINE = 'Track Every Trip. Manage Every Move.';

// API Configuration
export const API_TIMEOUT = 30000; // 30 seconds

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Touch targets (for accessibility)
export const MIN_TOUCH_TARGET = 44;

// Animation durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
} as const;
