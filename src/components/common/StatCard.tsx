/**
 * StatCard Component
 * Modern metric card with tinted icon capsule, trend pill, and sharp typography
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeContext } from '../../contexts/ThemeContext';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'teal';
  onPress?: () => void;
  style?: ViewStyle;
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  variant = 'default',
  onPress,
  style,
}: StatCardProps) {
  const { colors, isDarkMode } = useThemeContext();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { iconColor: '#0EA5E9', iconBg: 'rgba(14, 165, 233, 0.15)' };
      case 'success':
        return { iconColor: '#10B981', iconBg: 'rgba(16, 185, 129, 0.15)' };
      case 'warning':
        return { iconColor: '#F59E0B', iconBg: 'rgba(245, 158, 11, 0.15)' };
      case 'error':
        return { iconColor: '#EF4444', iconBg: 'rgba(239, 68, 68, 0.15)' };
      case 'teal':
        return { iconColor: '#0EA5E9', iconBg: 'rgba(14, 165, 233, 0.15)' };
      default:
        return { iconColor: '#38BDF8', iconBg: 'rgba(56, 189, 248, 0.12)' };
    }
  };

  const getTrendConfig = () => {
    switch (trend) {
      case 'up':
        return { icon: 'trending-up' as const, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'down':
        return { icon: 'trending-down' as const, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      default:
        return { icon: 'minus' as const, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.15)' };
    }
  };

  const Container = onPress ? TouchableOpacity : View;
  const { iconColor, iconBg } = getVariantStyles();
  const trendConfig = getTrendConfig();

  return (
    <Container
      style={[
        styles.card,
        {
          backgroundColor: colors.surface || (isDarkMode ? '#1E293B' : '#FFFFFF'),
          borderColor: colors.border || (isDarkMode ? '#334155' : '#E2E8F0'),
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={styles.topRow}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={iconColor}
            />
          </View>
        )}

        {trend && trendValue && (
          <View style={[styles.trendPill, { backgroundColor: trendConfig.bg }]}>
            <MaterialCommunityIcons
              name={trendConfig.icon}
              size={12}
              color={trendConfig.color}
            />
            <Text style={[styles.trendValue, { color: trendConfig.color }]}>
              {trendValue}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.value, { color: colors.text || (isDarkMode ? '#F8FAFC' : '#0F172A') }]}>
        {value}
      </Text>

      <Text style={[styles.label, { color: colors.textSecondary || (isDarkMode ? '#94A3B8' : '#64748B') }]}>
        {label}
      </Text>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 130,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 2,
  },
  trendValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  value: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
