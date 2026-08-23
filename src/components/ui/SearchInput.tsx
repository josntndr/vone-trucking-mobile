/**
 * SearchInput Component
 * Input field optimized for search with clear button
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input, InputProps } from './Input';
import { useTheme } from '../../hooks';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onClear?: () => void;
  showClearButton?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onClear,
  showClearButton = true,
  value,
  placeholder = 'Search...',
  ...props
}) => {
  const theme = useTheme();

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  const shouldShowClear = showClearButton && value && value.length > 0;

  return (
    <Input
      {...props}
      value={value}
      placeholder={placeholder}
      autoCapitalize="none"
      autoCorrect={false}
      clearButtonMode="never"
      leftIcon={
        <Ionicons name="search" size={theme.fontSizes.lg} color={theme.colors.textSecondary} />
      }
      rightIcon={
        shouldShowClear ? (
          <TouchableOpacity
            onPress={handleClear}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.lg,
                fontWeight: theme.fontWeights.bold,
              }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        ) : undefined
      }
    />
  );
};
