/**
 * Root Index - Entry Point with Authentication Check
 * Determines whether to show demo login or real auth based on configuration
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { isDemoMode } from '../src/services/demo/demoAuth.service';
import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;

// Check if Supabase is actually configured (not placeholder values)
const isSupabaseConfigured = () => {
  return SUPABASE_URL && 
         SUPABASE_URL !== 'https://your-project.supabase.co' &&
         !SUPABASE_URL.includes('your-project');
};

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      // Check if we're in demo mode
      const inDemoMode = await isDemoMode();
      
      if (inDemoMode) {
        // Already in demo mode, check if user is logged in
        // This will be handled by individual role screens
        router.replace('/demo-login');
        return;
      }

      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        // No Supabase - go to demo login
        router.replace('/demo-login');
        return;
      }

      // Supabase is configured - use real auth
      // This would check auth state and route accordingly
      // For now, redirect to auth welcome screen
      router.replace('/(auth)/welcome');
      
    } catch (error) {
      console.error('Auth check error:', error);
      // On error, default to demo mode
      router.replace('/demo-login');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1A237E" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

