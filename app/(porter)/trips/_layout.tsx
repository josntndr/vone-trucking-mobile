/**
 * Porter Trips Stack Layout
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';

export default function PorterTripsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
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
        }}
      />
    </Stack>
  );
}

