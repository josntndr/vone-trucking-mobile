/**
 * Porter Reports Stack Layout
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';

export default function PorterReportsLayout() {
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
        name="missing"
        options={{
          title: 'Report Missing Product',
        }}
      />
      <Stack.Screen
        name="damaged"
        options={{
          title: 'Report Damaged Product',
        }}
      />
      <Stack.Screen
        name="rejected"
        options={{
          title: 'Report Rejected Product',
        }}
      />
    </Stack>
  );
}

