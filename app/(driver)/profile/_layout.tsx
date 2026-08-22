/**
 * Driver Profile Layout
 */

import { Stack } from 'expo-router';

export default function DriverProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#1A237E',
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

