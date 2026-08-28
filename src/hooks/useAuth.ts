/**
 * Authentication Hook
 * Manages authentication state and provides auth methods
 * Supports both Supabase auth and demo mode
 */

import { useState, useEffect, useCallback } from 'react';
import * as AuthService from '../services/api/auth.service';
import { supabase, isSupabaseConfigured } from '../services/api/supabase';
import * as DemoAuth from '../services/demo/demoAuth.service';

export const useAuth = () => {
  const [user, setUser] = useState<AuthService.User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inDemoMode, setInDemoMode] = useState(false);

  /**
   * Load current user session
   */
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if in demo mode
      const demoMode = await DemoAuth.isDemoMode();
      setInDemoMode(demoMode);

      if (demoMode) {
        // Load demo user and normalize the structure
        const demoResponse = await DemoAuth.getDemoUser();
        if (demoResponse.data) {
          // Normalize demo user to match Supabase user structure
          const normalizedUser = {
            ...demoResponse.data,
            user_metadata: {
              first_name: demoResponse.data.profile.first_name,
              last_name: demoResponse.data.profile.last_name,
              phone: demoResponse.data.profile.phone,
            },
          };
          setUser(normalizedUser as any);
        } else {
          setUser(null);
        }
      } else if (isSupabaseConfigured()) {
        // Load real user
        const response = await AuthService.getCurrentUser();
        if (response.error) {
          setUser(null);
          setError(response.error);
        } else if (response.data) {
          setUser(response.data);
        }
      } else {
        // No auth configured
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      setError('Failed to load user');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign in
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    const response = await AuthService.signIn(email, password);

    if (response.error) {
      setError(response.error);
      setLoading(false);
      return { success: false, error: response.error };
    }

    if (response.data) {
      setUser(response.data.user);
    }

    setLoading(false);
    return { success: true };
  }, []);

  /**
   * Sign up
   */
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
      }
    ) => {
      setLoading(true);
      setError(null);

      const response = await AuthService.signUp(email, password, metadata);

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return { success: false, error: response.error };
      }

      if (response.data) {
        setUser(response.data.user);
      }

      setLoading(false);
      return { success: true };
    },
    []
  );

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check if demo mode
    const demoMode = await DemoAuth.isDemoMode();
    
    if (demoMode) {
      await DemoAuth.demoSignOut();
    } else {
      const response = await AuthService.signOut();
      if (response.error) {
        setError(response.error);
        setLoading(false);
        return { success: false, error: response.error };
      }
    }

    setUser(null);
    setLoading(false);
    return { success: true };
  }, []);

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);

    const response = await AuthService.requestPasswordReset(email);

    if (response.error) {
      setError(response.error);
      setLoading(false);
      return { success: false, error: response.error };
    }

    setLoading(false);
    return { success: true, message: response.message };
  }, []);

  /**
   * Update password
   */
  const updatePassword = useCallback(async (newPassword: string) => {
    setLoading(true);
    setError(null);

    const response = await AuthService.updatePassword(newPassword);

    if (response.error) {
      setError(response.error);
      setLoading(false);
      return { success: false, error: response.error };
    }

    setLoading(false);
    return { success: true, message: response.message };
  }, []);

  /**
   * Update profile
   */
  const updateProfile = useCallback(
    async (updates: { firstName?: string; lastName?: string; phone?: string }) => {
      setLoading(true);
      setError(null);

      const response = await AuthService.updateProfile(updates);

      if (response.error) {
        setError(response.error);
        setLoading(false);
        return { success: false, error: response.error };
      }

      if (response.data) {
        setUser(response.data);
      }

      setLoading(false);
      return { success: true, message: response.message };
    },
    []
  );

  /**
   * Initialize auth state and listen for changes
   */
  useEffect(() => {
    loadUser();

    // Only listen for Supabase auth changes if configured
    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const response = await AuthService.getCurrentUser();
            if (response.data) {
              setUser(response.data);
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isDemoMode: inDemoMode,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    updatePassword,
    updateProfile,
    refreshUser: loadUser,
  };
};
