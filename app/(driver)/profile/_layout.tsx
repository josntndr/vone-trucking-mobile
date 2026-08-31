/**
 * Driver Profile Layout
 */

import { Stack } from 'expo-router';
import { useThemeContext } from '../../../src/contexts/ThemeContext';

export default function DriverProfileLayout() {
  const { isDarkMode } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? '#0B1120' : '#FFFFFF',
        },
        headerTintColor: isDarkMode ? '#F8FAFC' : '#0F172A',
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          color: isDarkMode ? '#F8FAFC' : '#0F172A',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          headerStyle: {
            backgroundColor: isDarkMode ? '#0B1120' : '#FFFFFF',
          },
          headerTintColor: isDarkMode ? '#F8FAFC' : '#0F172A',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 18,
            color: isDarkMode ? '#F8FAFC' : '#0F172A',
          },
        }}
      />
      <Stack.Screen
        name="fuel"
        options={{
          title: 'Fuel & Receipts',
          headerBackTitle: 'Back',
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
