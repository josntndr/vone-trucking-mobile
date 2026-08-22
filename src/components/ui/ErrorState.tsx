/**
 * ErrorState Component
 * Display error messages with retry option
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks';
import { Button, ButtonProps } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  icon?: React.ReactNode;
  retryProps?: Partial<ButtonProps>;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  retryLabel = 'Try Again',
  onRetry,
  icon,
  retryProps,
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
            color: theme.colors.error,
            fontSize: theme.fontSizes.xl,
            fontWeight: theme.fontWeights.semibold,
            marginTop: icon ? theme.spacing[4] : 0,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.message,
          {
            color: theme.colors.text.secondary,
            fontSize: theme.fontSizes.base,
            marginTop: theme.spacing[2],
          },
        ]}
      >
        {message}
      </Text>

      {onRetry && (
        <Button
          variant="primary"
          onPress={onRetry}
          style={{ marginTop: theme.spacing[6] }}
          {...retryProps}
        >
          {retryLabel}
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
  message: {
    textAlign: 'center',
    maxWidth: 320,
  },
});
