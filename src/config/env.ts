/**
 * Environment Configuration
 * Centralized access to environment variables with type safety
 */

import Constants from 'expo-constants';

interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  api: {
    url: string;
  };
  app: {
    env: 'development' | 'staging' | 'production';
  };
  features: {
    offlineMode: boolean;
    debugLogs: boolean;
  };
}

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key: string, fallback: string = ''): string => {
  return (Constants.expoConfig?.extra?.[key] as string) || fallback;
};

/**
 * Environment configuration object
 */
export const env: EnvConfig = {
  supabase: {
    url: getEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'https://your-project.supabase.co'),
    anonKey: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', ''),
  },
  api: {
    url: getEnvVar('EXPO_PUBLIC_API_URL', 'http://localhost:3000/api'),
  },
  app: {
    env: getEnvVar('EXPO_PUBLIC_APP_ENV', 'development') as EnvConfig['app']['env'],
  },
  features: {
    offlineMode: getEnvVar('EXPO_PUBLIC_ENABLE_OFFLINE_MODE', 'true') === 'true',
    debugLogs: getEnvVar('EXPO_PUBLIC_ENABLE_DEBUG_LOGS', 'false') === 'true',
  },
};

/**
 * Validate required environment variables
 */
export const validateEnv = (): boolean => {
  const required = [
    { key: 'SUPABASE_URL', value: env.supabase.url },
    { key: 'SUPABASE_ANON_KEY', value: env.supabase.anonKey },
  ];

  const missing = required.filter(({ value }) => !value || value === 'your-project.supabase.co' || value === '');

  if (missing.length > 0 && env.app.env === 'production') {
    console.error('Missing required environment variables:', missing.map(m => m.key).join(', '));
    return false;
  }

  return true;
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return env.app.env === 'development';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return env.app.env === 'production';
};
