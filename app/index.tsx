/**
 * Root Index - Application Entry Point
 * Routes to splash → onboarding → welcome flow
 * Or demo mode for development
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;

// Check if in development mode
const isDevelopment = __DEV__;

export default function Index() {
  const router = useRouter();
  const [showDevOptions, setShowDevOptions] = useState(false);

  useEffect(() => {
    // In development, show dev options briefly
    if (isDevelopment) {
      const timer = setTimeout(() => {
        setShowDevOptions(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // In production, go straight to entry flow
      router.replace('/entry');
    }
  }, []);

  const handleEntry = () => {
    router.replace('/entry');
  };

  const handleDemoMode = () => {
    router.replace('/demo-login');
  };

  if (!isDevelopment || !showDevOptions) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1B2845" />
      </View>
    );
  }

  // Development mode - show options
  return (
    <View style={styles.devContainer}>
      <Text style={styles.devTitle}>Development Mode</Text>
      
      <TouchableOpacity style={styles.devButton} onPress={handleEntry}>
        <Text style={styles.devButtonText}>Launch App (Normal Flow)</Text>
        <Text style={styles.devButtonSubtext}>Splash → Onboarding → Welcome</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.devButton, styles.devButtonSecondary]} onPress={handleDemoMode}>
        <Text style={[styles.devButtonText, styles.devButtonTextSecondary]}>Demo Mode (Testing)</Text>
        <Text style={[styles.devButtonSubtext, styles.devButtonTextSecondary]}>Quick role selection</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F7',
  },
  devContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF9F7',
    padding: 20,
  },
  devTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B2845',
    marginBottom: 32,
  },
  devButton: {
    backgroundColor: '#1B2845',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  devButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1B2845',
  },
  devButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  devButtonTextSecondary: {
    color: '#1B2845',
  },
  devButtonSubtext: {
    color: '#D97638',
    fontSize: 14,
  },
});

