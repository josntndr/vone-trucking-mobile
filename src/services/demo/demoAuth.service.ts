/**
 * Demo Authentication Service
 * LOCAL DEVELOPMENT ONLY - Simulates authentication when Supabase is not configured
 * NEVER USE IN PRODUCTION
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, UserRole } from '../../types';
import { ApiResponse } from '../../types';

const DEMO_MODE_KEY = '@vone_demo_mode';
const DEMO_USER_KEY = '@vone_demo_user';

export interface DemoUser {
  id: string;
  email: string;
  profile: UserProfile;
}

// Initial Operator/Admin Account
// Username: vonetruckingadmin
// Password: VoneTrucking15
// NOTE: In production, this must be created via secure backend seed/migration
// Password must be stored as a hash, never in plaintext
const INITIAL_OPERATOR: DemoUser = {
  id: 'vone-admin-001',
  email: 'admin@vonetrucking.com',
  profile: {
    id: 'vone-admin-001',
    email: 'admin@vonetrucking.com',
    first_name: 'System',
    last_name: 'Administrator',
    phone: '+63 917 000 0000',
    role: 'operator' as UserRole,
    employee_number: 'ADMIN-001',
    hire_date: '2024-01-01',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2026-08-22T08:00:00Z',
  },
};

// Demo users for development testing
const DEMO_USERS: Record<string, DemoUser> = {
  operator: INITIAL_OPERATOR,
  driver: {
    id: 'demo-driver-001',
    email: 'driver@vonetrucking.demo',
    profile: {
      id: 'demo-driver-001',
      email: 'driver@vonetrucking.demo',
      first_name: 'Juan',
      last_name: 'Dela Cruz',
      phone: '+63 918 234 5678',
      role: 'driver' as UserRole,
      employee_number: 'DR-001',
      hire_date: '2024-03-10',
      license_number: 'N01-23-456789',
      license_expiry: '2028-03-10',
      is_active: true,
      created_at: '2024-03-10T08:00:00Z',
      updated_at: '2026-08-22T08:00:00Z',
    },
  },
  porter: {
    id: 'demo-porter-001',
    email: 'porter@vonetrucking.demo',
    profile: {
      id: 'demo-porter-001',
      email: 'porter@vonetrucking.demo',
      first_name: 'Pedro',
      last_name: 'Reyes',
      phone: '+63 919 345 6789',
      role: 'helper' as UserRole,
      employee_number: 'PT-001',
      hire_date: '2024-06-20',
      is_active: true,
      created_at: '2024-06-20T08:00:00Z',
      updated_at: '2026-08-22T08:00:00Z',
    },
  },
};

/**
 * Check if demo mode is enabled
 */
export const isDemoMode = async (): Promise<boolean> => {
  try {
    const mode = await AsyncStorage.getItem(DEMO_MODE_KEY);
    return mode === 'true';
  } catch {
    return false;
  }
};

/**
 * Enable demo mode
 */
export const enableDemoMode = async (): Promise<void> => {
  await AsyncStorage.setItem(DEMO_MODE_KEY, 'true');
};

/**
 * Disable demo mode
 */
export const disableDemoMode = async (): Promise<void> => {
  await AsyncStorage.removeItem(DEMO_MODE_KEY);
  await AsyncStorage.removeItem(DEMO_USER_KEY);
};

/**
 * Demo sign in - Select a role
 */
export const demoSignIn = async (role: 'operator' | 'driver' | 'porter'): Promise<ApiResponse<DemoUser>> => {
  try {
    const user = DEMO_USERS[role];
    if (!user) {
      return { error: 'Invalid demo role' };
    }

    // Store demo user
    await AsyncStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
    await enableDemoMode();

    return { data: user };
  } catch (error) {
    return { error: 'Failed to sign in with demo account' };
  }
};

/**
 * Get current demo user
 */
export const getDemoUser = async (): Promise<ApiResponse<DemoUser>> => {
  try {
    const userJson = await AsyncStorage.getItem(DEMO_USER_KEY);
    if (!userJson) {
      return { error: 'No demo user found' };
    }

    const user = JSON.parse(userJson) as DemoUser;
    return { data: user };
  } catch (error) {
    return { error: 'Failed to load demo user' };
  }
};

/**
 * Demo sign out
 */
export const demoSignOut = async (): Promise<ApiResponse<void>> => {
  try {
    await AsyncStorage.removeItem(DEMO_USER_KEY);
    await disableDemoMode();
    return { data: undefined };
  } catch (error) {
    return { error: 'Failed to sign out' };
  }
};

/**
 * Get initial operator account for authentication
 */
export const getInitialOperator = (): DemoUser => {
  return INITIAL_OPERATOR;
};
