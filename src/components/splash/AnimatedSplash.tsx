/**
 * Application Loading Screen - Vone Trucking
 * Clean, fast, executive loader that initializes the application
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AnimatedSplashProps {
  onComplete: () => void;
}

export default function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in loader smoothly
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    // Automatically transition to application after brief initial load
    const timer = setTimeout(() => {
      onComplete();
    }, 900);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1120" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Emblem Container */}
        <View style={styles.emblemContainer}>
          <MaterialCommunityIcons
            name="truck-fast"
            size={48}
            color="#0EA5E9"
          />
        </View>

        {/* Brand Title */}
        <Text style={styles.brandTitle}>VONE TRUCKING</Text>

        {/* Status Pill */}
        <View style={styles.statusPill}>
          <View style={styles.statusLiveDot} />
          <Text style={styles.statusText}>Fleet & Logistics Operations</Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#0EA5E9" style={styles.spinner} />
          <Text style={styles.loadingText}>Loading application...</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emblemContainer: {
    width: 88,
    height: 88,
    backgroundColor: '#0A1220',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 36,
  },
  statusLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.2,
  },
  loaderContainer: {
    alignItems: 'center',
    gap: 12,
  },
  spinner: {
    transform: [{ scale: 1.1 }],
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    letterSpacing: 0.3,
  },
});
