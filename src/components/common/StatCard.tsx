/**
 * StatCard Component
 * Display numerical statistics with label and optional icon
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
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
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
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();

  const getVariantColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.text;
    }
  };

  const getTrendConfig = () => {
    switch (trend) {
      case 'up':
        return { icon: 'trending-up' as const, color: colors.success };
      case 'down':
        return { icon: 'trending-down' as const, color: colors.error };
      default:
        return { icon: 'minus' as const, color: colors.textSecondary };
    }
  };

  const Container = onPress ? TouchableOpacity : View;
  const valueColor = getVariantColor();
  const trendConfig = getTrendConfig();

  return (
    <Container
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          padding: spacing[4],
          ...shadows.base,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {icon && (
        <View style={[styles.iconContainer, { marginBottom: spacing[3] }]}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={valueColor}
          />
        </View>
      )}

      <Text
        style={[
          styles.value,
          {
            color: valueColor,
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
          },
        ]}
      >
        {value}
      </Text>

      <View style={styles.footer}>
        <Text
          style={[
            styles.label,
            {
              color: colors.textSecondary,
              fontSize: typography.fontSize.sm,
              marginTop: spacing[1],
            },
          ]}
        >
          {label}
        </Text>

        {trend && trendValue && (
          <View style={[styles.trendContainer, { marginTop: spacing[1] }]}>
            <MaterialCommunityIcons
              name={trendConfig.icon}
              size={14}
              color={trendConfig.color}
            />
            <Text
              style={[
                styles.trendValue,
                {
                  color: trendConfig.color,
                  fontSize: typography.fontSize.xs,
                  marginLeft: 2,
                },
              ]}
            >
              {trendValue}
            </Text>
          </View>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 120,
  },
  iconContainer: {},
  value: {},
  footer: {},
  label: {},
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendValue: {},
});
