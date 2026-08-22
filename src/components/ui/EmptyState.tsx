/**
 * EmptyState Component
 * Display when no data is available
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionProps?: Partial<ButtonProps>;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionProps,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text.primary,
            fontSize: theme.fontSizes.xl,
            fontWeight: theme.fontWeights.semibold,
            marginTop: icon ? theme.spacing[4] : 0,
          },
        ]}
      >
        {title}
      </Text>

      {description && (
        <Text
          style={[
            styles.description,
            {
              color: theme.colors.text.secondary,
              fontSize: theme.fontSizes.base,
              marginTop: theme.spacing[2],
            },
          ]}
        >
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button
          variant="primary"
          onPress={onAction}
          style={{ marginTop: theme.spacing[6] }}
          {...actionProps}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 320,
  },
});
