/**
 * StatusChip Component
 * Color-coded status indicator with text label
 * Accessible (uses both color and text)
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export type StatusType = 
  | 'scheduled' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled' 
  | 'delayed'
  | 'pending'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface StatusChipProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export default function StatusChip({ status, label, size = 'md', style }: StatusChipProps) {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getStatusColors = () => {
    switch (status) {
      case 'scheduled':
      case 'info':
        return { background: colors.info + '20', text: colors.infoDark };
      case 'in-progress':
      case 'pending':
      case 'warning':
        return { background: colors.warning + '20', text: colors.warningDark };
      case 'completed':
      case 'success':
        return { background: colors.success + '20', text: colors.successDark };
      case 'cancelled':
        return { background: colors.textTertiary + '20', text: colors.textSecondary };
      case 'delayed':
      case 'error':
        return { background: colors.error + '20', text: colors.errorDark };
      default:
        return { background: colors.borderLight, text: colors.text };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: spacing[2],
          paddingVertical: spacing[1],
          fontSize: typography.fontSize.xs,
        };
      case 'lg':
        return {
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[2],
          fontSize: typography.fontSize.base,
        };
      case 'md':
      default:
        return {
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1],
          fontSize: typography.fontSize.sm,
        };
    }
  };

  const statusColors = getStatusColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: statusColors.background,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: borderRadius.base,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: statusColors.text,
            fontSize: sizeStyles.fontSize,
            fontWeight: typography.fontWeight.medium,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  label: {
    textTransform: 'capitalize',
  },
});
