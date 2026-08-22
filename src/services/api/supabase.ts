/**
 * Supabase Client Configuration
 * Initialized Supabase client with auth configuration
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../../config';

/**
 * Supabase client instance
 */
export const supabase = createClient(env.supabase.url, env.supabase.anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    env.supabase.url !== '' &&
    env.supabase.url !== 'https://your-project.supabase.co' &&
    env.supabase.anonKey !== ''
  );
};
