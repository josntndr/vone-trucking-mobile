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

export interface StatusChipProps {
  status?: StatusType; // Optional when color is provided
  label: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  color?: string; // Optional custom color override
  icon?: string; // Optional icon name (not rendered yet, reserved for future)
}

export default function StatusChip({ status, label, size = 'md', style, color, icon }: StatusChipProps) {
  const { colors, fontSizes, fontWeights, lineHeights, spacing, borderRadius  } = useTheme();

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
          fontSize: fontSizes.xs,
        };
      case 'lg':
        return {
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[2],
          fontSize: fontSizes.base,
        };
      case 'md':
      default:
        return {
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1],
          fontSize: fontSizes.sm,
        };
    }
  };

  const statusColors = status ? getStatusColors() : { background: colors.borderLight, text: colors.text };
  const sizeStyles = getSizeStyles();

  // Use custom color if provided, otherwise use status-based colors
  const backgroundColor = color ? color + '20' : statusColors.background;
  const textColor = color || statusColors.text;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
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
            color: textColor,
            fontSize: sizeStyles.fontSize,
            fontWeight: fontWeights.medium,
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
