/**
 * Root Index - Application Entry Point
 * Private login-only system for Vone Trucking
 * Routes directly to splash → auth check → login or dashboard
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Go straight to entry flow (splash → auth check)
    router.replace('/entry');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1B2845" />
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
});

