/**
 * StatusChip Component
 * Colored badge/chip for status display
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks';

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type ChipSize = 'sm' | 'md' | 'lg';

export interface StatusChipProps {
  label: string;
  type?: StatusType;
  size?: ChipSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  type = 'neutral',
  size = 'md',
  icon,
  style,
}) => {
  const theme = useTheme();

  const getTypeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (type) {
      case 'success':
        return {
          container: { backgroundColor: `${theme.colors.success}15` },
          text: { color: theme.colors.success },
        };
      case 'error':
        return {
          container: { backgroundColor: `${theme.colors.error}15` },
          text: { color: theme.colors.error },
        };
      case 'warning':
        return {
          container: { backgroundColor: `${theme.colors.warning}15` },
          text: { color: theme.colors.warning },
        };
      case 'info':
        return {
          container: { backgroundColor: `${theme.colors.primary}15` },
          text: { color: theme.colors.primary },
        };
      case 'neutral':
        return {
          container: { backgroundColor: theme.colors.backgroundSecondary },
          text: { color: theme.colors.textSecondary },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: theme.spacing[1],
            paddingHorizontal: theme.spacing[2],
            borderRadius: theme.borderRadius.sm,
          },
          text: { fontSize: theme.fontSizes.xs },
        };
      case 'md':
        return {
          container: {
            paddingVertical: theme.spacing[1],
            paddingHorizontal: theme.spacing[3],
            borderRadius: theme.borderRadius.base,
          },
          text: { fontSize: theme.fontSizes.sm },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: theme.spacing[2],
            paddingHorizontal: theme.spacing[4],
            borderRadius: theme.borderRadius.md,
          },
          text: { fontSize: theme.fontSizes.base },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const typeStyles = getTypeStyles();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        typeStyles.container,
        sizeStyles.container,
        style,
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          typeStyles.text,
          sizeStyles.text,
          { fontWeight: theme.fontWeights.medium },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  icon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '500',
  },
});
