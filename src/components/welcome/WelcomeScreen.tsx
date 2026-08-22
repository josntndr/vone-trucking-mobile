/**
 * Modern Welcome Screen
 * Clean entry point after onboarding
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

interface WelcomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

export default function WelcomeScreen({ onLogin, onRegister }: WelcomeScreenProps) {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Section */}
      <View style={styles.topSection}>
        {/* Logo */}
        <View style={[styles.logoContainer, { marginTop: spacing[16] }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons 
              name="truck-fast-outline" 
              size={48} 
              color={colors.textInverse} 
            />
          </View>
          
          <Text
            style={[
              styles.brandName,
              {
                color: colors.primary,
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.heavy,
                marginTop: spacing[4],
              },
            ]}
          >
            Vone Trucking
          </Text>
          
          <Text
            style={[
              styles.tagline,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium,
                marginTop: spacing[2],
              },
            ]}
          >
            Track Every Trip. Manage Every Move.
          </Text>
        </View>

        {/* Hero Illustration Area */}
        <View style={[styles.illustrationContainer, { marginTop: spacing[12] }]}>
          {/* Abstract route visualization */}
          <View style={styles.routeVisualization}>
            <View style={[styles.routePoint, { backgroundColor: colors.success }]} />
            <View style={[styles.routePath, { backgroundColor: colors.border }]} />
            <View style={[styles.routePoint, { backgroundColor: colors.accent }]} />
          </View>
          
          <Text
            style={[
              styles.heroText,
              {
                color: colors.text,
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                marginTop: spacing[6],
                textAlign: 'center',
              },
            ]}
          >
            Professional fleet management for your trucking business
          </Text>
        </View>
      </View>

      {/* Bottom Section - Actions */}
      <View style={[styles.bottomSection, { paddingHorizontal: spacing[5], paddingBottom: spacing[10] }]}>
        {/* Primary Button - Log In */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: colors.primary,
              borderRadius: borderRadius.md,
              paddingVertical: spacing[5],
              ...shadows.base,
            },
          ]}
          onPress={onLogin}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.primaryButtonText,
              {
                color: colors.textInverse,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
              },
            ]}
          >
            Log In
          </Text>
        </TouchableOpacity>

        {/* Secondary Button - Register */}
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.md,
              paddingVertical: spacing[5],
              marginTop: spacing[3],
              borderWidth: 2,
              borderColor: colors.primary,
            },
          ]}
          onPress={onRegister}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.secondaryButtonText,
              {
                color: colors.primary,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
              },
            ]}
          >
            Register as Operator
          </Text>
        </TouchableOpacity>

        {/* Support Link */}
        <TouchableOpacity style={[styles.supportLink, { marginTop: spacing[6] }]}>
          <Text
            style={[
              styles.supportLinkText,
              {
                color: colors.textSecondary,
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
              },
            ]}
          >
            Need help? Contact support
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
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
  illustrationContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  routeVisualization: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routePoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  routePath: {
    width: 120,
    height: 3,
    marginHorizontal: 12,
    borderRadius: 2,
  },
  heroText: {
    maxWidth: 280,
  },
  bottomSection: {},
  primaryButton: {
    alignItems: 'center',
  },
  primaryButtonText: {},
  secondaryButton: {
    alignItems: 'center',
  },
  secondaryButtonText: {},
  supportLink: {
    alignItems: 'center',
  },
  supportLinkText: {},
});
