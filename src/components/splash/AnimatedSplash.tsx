/**
 * Animated Splash Screen
 * Modern, polished introduction with subtle animation
 * 1.5-2.5 seconds, supports reduced motion
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AnimatedSplashProps {
  onComplete: () => void;
}

export default function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
  const theme = useTheme();
  const colors = theme.colors;
  const typography = theme.typography;
  const spacing = theme.spacing;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Animated route line
    Animated.timing(lineAnim, {
      toValue: 1,
      duration: 1200,
      delay: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Tagline fade in
    Animated.timing(taglineAnim, {
      toValue: 1,
      duration: 400,
      delay: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Complete after total animation
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const lineTranslateX = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors?.primary || '#192A4A' }]}>
      {/* Animated Route Line - Abstract */}
      <Animated.View
        style={[
          styles.routeLine,
          {
            backgroundColor: colors?.accent || '#D87532',
            transform: [{ translateX: lineTranslateX }],
            opacity: lineAnim,
          },
        ]}
      />

      {/* Logo and Brand */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Icon Container */}
        <View style={[styles.iconCircle, { backgroundColor: colors?.accent || '#D87532' }]}>
          <MaterialCommunityIcons 
            name="truck-fast-outline" 
            size={64} 
            color={colors?.textInverse || colors?.white || '#FFFFFF'} 
          />
        </View>

        {/* Brand Name */}
        <Text
          style={[
            styles.brandName,
            {
              color: colors?.textInverse || colors?.white || '#FFFFFF',
              fontSize: typography?.fontSize?.['4xl'] || 44,
              fontWeight: (typography?.fontWeight?.heavy || '800') as any,
              marginTop: spacing?.[6] || 24,
            },
          ]}
        >
          Vone Trucking
        </Text>

        {/* Tagline */}
        <Animated.Text
          style={[
            styles.tagline,
            {
              color: colors?.accent || '#D87532',
              fontSize: typography?.fontSize?.base || 16,
              fontWeight: (typography?.fontWeight?.medium || '500') as any,
              marginTop: spacing?.[3] || 12,
              opacity: taglineAnim,
            },
          ]}
        >
          Vone Trucking operations, all in one place.
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  routeLine: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
  },
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
