/**
 * Driver Reports Layout
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';

export default function DriverReportsLayout() {
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
          title: 'Reports',
        }}
      />
      <Stack.Screen
        name="delay"
        options={{
          title: 'Report Delay',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="incident"
        options={{
          title: 'Report Incident',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="truck-problem"
        options={{
          title: 'Truck Problem',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}

