/**
 * Container Component
 * Consistent content container with padding
 */

import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks';

export interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  padding?: keyof typeof import('../../theme').spacing;
  center?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  padding = 4,
  center = false,
  style,
  ...props
}) => {
  const theme = useTheme();

  const containerStyle: ViewStyle = {
    flex: 1,
    padding: theme.spacing[padding],
    ...(center && {
      justifyContent: 'center',
      alignItems: 'center',
    }),
  };

  return (
    <View style={[containerStyle, style]} {...props}>
      {children}
    </View>
  );
};
