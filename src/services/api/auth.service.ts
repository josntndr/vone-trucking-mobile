/**
 * Authentication Service
 * Handles user authentication via Supabase
 */

import { supabase } from './supabase';
import { ApiResponse } from '../../types';
import type { UserProfile, UserRole } from '../../types';

export interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Fetch user profile from employee_profiles table
 */
const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('employee_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }

  return data as UserProfile;
};

/**
 * Sign in with email and password
 */
export const signIn = async (
  email: string,
  password: string
): Promise<ApiResponse<AuthSession>> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (!data.user || !data.session) {
      return { error: 'Authentication failed' };
    }

    // Fetch user profile
    const profile = await fetchUserProfile(data.user.id);
    
    if (!profile) {
      // Sign out if profile doesn't exist
      await supabase.auth.signOut();
      return { error: 'User profile not found. Please contact administrator.' };
    }

    if (!profile.is_active) {
      // Sign out if account is disabled
      await supabase.auth.signOut();
      return { error: 'Your account has been disabled. Please contact administrator.' };
    }

    return {
      data: {
        user: {
          id: data.user.id,
          email: data.user.email!,
          profile,
        },
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      },
    };
  } catch (error) {
    return { error: 'An unexpected error occurred during sign in' };
  }
};

/**
 * Sign up - DISABLED for public use
 * Only operators can create accounts via admin panel
 */
export const signUp = async (
  email: string,
  password: string,
  metadata?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }
): Promise<ApiResponse<AuthSession>> => {
  return { 
    error: 'Public registration is disabled. Please contact your administrator to create an account.' 
  };
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error: error.message };
    }

    return { data: undefined };
  } catch (error) {
    return { error: 'An unexpected error occurred during sign out' };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { error: error.message };
    }

    if (!user) {
      return { error: 'No authenticated user found' };
    }

    // Fetch user profile
    const profile = await fetchUserProfile(user.id);
    
    if (!profile) {
      return { error: 'User profile not found' };
    }

    if (!profile.is_active) {
      // Sign out if account is disabled
      await supabase.auth.signOut();
      return { error: 'Your account has been disabled' };
    }

    return {
      data: {
        id: user.id,
        email: user.email!,
        profile,
      },
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching user' };
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return { error: error.message };
    }

    return {
      data: undefined,
      message: 'Password reset email sent. Please check your inbox.',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while requesting password reset' };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (newPassword: string): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }

    return {
      data: undefined,
      message: 'Password updated successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while updating password' };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (updates: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}): Promise<ApiResponse<User>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('employee_profiles')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        address: updates.address,
        emergency_contact_name: updates.emergencyContactName,
        emergency_contact_phone: updates.emergencyContactPhone,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', user.id);

    if (error) {
      return { error: error.message };
    }

    // Fetch updated profile
    const profile = await fetchUserProfile(user.id);
    
    if (!profile) {
      return { error: 'Failed to fetch updated profile' };
    }

    return {
      data: {
        id: user.id,
        email: user.email!,
        profile,
      },
      message: 'Profile updated successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while updating profile' };
  }
};
