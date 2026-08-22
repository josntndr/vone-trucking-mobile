/**
 * Card Component
 * Container with elevation and rounded corners
 */

import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: keyof typeof import('../../theme').spacing;
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
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.surface.elevated,
          ...theme.shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.surface.primary,
          borderWidth: 1,
          borderColor: theme.colors.border.medium,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.surface.secondary,
        };
      default:
        return {};
    }
  };

  const cardStyles: ViewStyle[] = [
    styles.card,
    {
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing[padding],
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
