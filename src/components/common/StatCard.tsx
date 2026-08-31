/**
 * StatCard Component
 * Modern metric card with tinted icon capsule, trend pill, and sharp typography
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

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
  const { colors, shadows } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return { iconColor: '#0EA5E9', iconBg: '#F0F9FF', textColor: '#0F172A' };
      case 'success':
        return { iconColor: '#10B981', iconBg: '#ECFDF5', textColor: '#0F172A' };
      case 'warning':
        return { iconColor: '#F59E0B', iconBg: '#FFFBEB', textColor: '#0F172A' };
      case 'error':
        return { iconColor: '#EF4444', iconBg: '#FEF2F2', textColor: '#0F172A' };
      case 'teal':
        return { iconColor: '#0EA5E9', iconBg: '#F0F9FF', textColor: '#0F172A' };
      default:
        return { iconColor: '#0F1E36', iconBg: '#F1F5F9', textColor: '#0F172A' };
    }
  };

  const getTrendConfig = () => {
    switch (trend) {
      case 'up':
        return { icon: 'trending-up' as const, color: '#10B981', bg: '#ECFDF5' };
      case 'down':
        return { icon: 'trending-down' as const, color: '#EF4444', bg: '#FEF2F2' };
      default:
        return { icon: 'minus' as const, color: '#64748B', bg: '#F1F5F9' };
    }
  };

  const Container = onPress ? TouchableOpacity : View;
  const { iconColor, iconBg, textColor } = getVariantStyles();
  const trendConfig = getTrendConfig();

  return (
    <Container
      style={[
        styles.card,
        {
          backgroundColor: '#FFFFFF',
          ...shadows.sm,
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

      <Text style={[styles.value, { color: textColor }]}>
        {value}
      </Text>

      <Text style={styles.label}>
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
    borderColor: '#E2E8F0',
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
    color: '#64748B',
    letterSpacing: 0.1,
  },
});

