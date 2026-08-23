/**
 * LoadingSpinner Component
 * Centered loading indicator with optional message
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks';

export interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
  color,
  fullScreen = false,
  style,
}) => {
  const theme = useTheme();
  const spinnerColor = color || theme.colors.primary;

  const containerStyle: ViewStyle[] = [
    styles.container,
    fullScreen && styles.fullScreen,
    style,
  ].filter(Boolean) as ViewStyle[];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <Text
          style={[
            styles.message,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.base,
              marginTop: theme.spacing[3],
            },
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  message: {
    textAlign: 'center',
  },
});
