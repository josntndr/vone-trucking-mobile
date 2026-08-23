/**
 * Input Component
 * Accessible text input with label, error state, and icons
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../hooks';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  required = false,
  editable = true,
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = (): string => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: getBorderColor(),
    borderRadius: theme.borderRadius.base,
    backgroundColor: editable ? theme.colors.surface : theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing[3],
    minHeight: 48,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text,
              fontSize: theme.fontSizes.sm,
              fontWeight: theme.fontWeights.medium,
              marginBottom: theme.spacing[1],
            },
          ]}
        >
          {label}
          {required && (
            <Text style={{ color: theme.colors.error }}> *</Text>
          )}
        </Text>
      )}

      <View style={inputContainerStyle}>
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: theme.fontSizes.base,
            },
          ]}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={hint}
          accessibilityState={{ disabled: !editable }}
          {...props}
        />

        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </View>

      {error && (
        <Text
          style={[
            styles.helperText,
            {
              color: theme.colors.error,
              fontSize: theme.fontSizes.sm,
              marginTop: theme.spacing[1],
            },
          ]}
          accessible={true}
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}

      {hint && !error && (
        <Text
          style={[
            styles.helperText,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes.sm,
              marginTop: theme.spacing[1],
            },
          ]}
        >
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontWeight: '500',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
  },
  icon: {
    marginHorizontal: 4,
  },
  helperText: {
    marginTop: 4,
  },
});
