/**
 * SearchInput Component
 * Input field optimized for search with clear button
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
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
        <Text style={{ fontSize: theme.fontSizes.lg }}>🔍</Text>
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
                color: theme.colors.text.secondary,
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
