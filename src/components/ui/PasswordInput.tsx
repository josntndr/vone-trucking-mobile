/**
 * PasswordInput Component
 * Input component with show/hide password toggle
 */

import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Input, InputProps } from './Input';
import { useTheme } from '../../hooks';

export interface PasswordInputProps extends Omit<InputProps, 'secureTextEntry'> {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  showPasswordLabel = 'Show',
  hidePasswordLabel = 'Hide',
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const theme = useTheme();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <Input
      {...props}
      secureTextEntry={!isPasswordVisible}
      autoCapitalize="none"
      autoCorrect={false}
      rightIcon={
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isPasswordVisible ? hidePasswordLabel : showPasswordLabel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text
            style={{
              color: theme.colors.primary,
              fontSize: theme.fontSizes.sm,
              fontWeight: theme.fontWeights.semibold,
            }}
          >
            {isPasswordVisible ? hidePasswordLabel : showPasswordLabel}
          </Text>
        </TouchableOpacity>
      }
    />
  );
};
