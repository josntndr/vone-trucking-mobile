/**
 * Auth Layout
 * Layout for authentication screens
 * Private login-only system - no public registration
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen 
        name="change-password"
        options={{
          // Prevent back navigation when temporary password flag is set
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}

