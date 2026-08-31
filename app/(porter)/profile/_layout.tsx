/**
 * Porter Profile Stack Layout
 */

import { Stack } from 'expo-router';
import { useThemeContext } from '../../../src/contexts/ThemeContext';

export default function PorterProfileLayout() {
  const { colors, isDarkMode } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface || (isDarkMode ? '#1E293B' : '#FFFFFF'),
        },
        headerTintColor: colors.text || (isDarkMode ? '#F8FAFC' : '#0F172A'),
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Trip History',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="payslips"
        options={{
          title: 'Payslips',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="cash-advance"
        options={{
          title: 'Cash Advance',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
