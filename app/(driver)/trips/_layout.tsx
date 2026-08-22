/**
 * Driver Trips Layout
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';

export default function DriverTripsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'My Trips',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Trip Details',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}

