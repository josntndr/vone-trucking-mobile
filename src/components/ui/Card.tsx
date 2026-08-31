// @ts-nocheck
/**
 * Card Component
 * Modern container with subtle border, elevation, and rounded corners
 */

import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: keyof typeof import('../../theme').spacing | number;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 4,
  children,
  style,
  ...props
}) => {
  const theme = useTheme();

  const getVariantStyles = (): ViewStyle => {
    const surfaceBg = typeof theme.colors.surface === 'string' ? theme.colors.surface : '#FFFFFF';
    const borderColor = theme.colors.border || '#E2E8F0';

    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: surfaceBg,
          borderWidth: 1,
          borderColor: borderColor,
          ...theme.shadows.base,
        };
      case 'outlined':
        return {
          backgroundColor: surfaceBg,
          borderWidth: 1.5,
          borderColor: borderColor,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.backgroundSecondary || '#F8FAFC',
          borderWidth: 1,
          borderColor: borderColor,
        };
      default:
        return {
          backgroundColor: surfaceBg,
        };
    }
  };

  const getPaddingValue = () => {
    if (typeof padding === 'number' && theme.spacing[padding] !== undefined) {
      return theme.spacing[padding];
    }
    if (typeof padding === 'number') {
      return padding;
    }
    return 16;
  };

  const cardStyles: ViewStyle[] = [
    styles.card,
    {
      borderRadius: theme.borderRadius.lg || 18,
      padding: getPaddingValue(),
    },
    getVariantStyles(),
    style,
  ].filter(Boolean) as ViewStyle[];

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});


