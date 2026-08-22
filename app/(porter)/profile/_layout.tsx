/**
 * Porter Profile Stack Layout
 */

import { Stack } from 'expo-router';

export default function PorterProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#1A237E',
        headerTitleStyle: {
          fontWeight: '600',
        },
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
        }}
      />
      <Stack.Screen
        name="payslips"
        options={{
          title: 'Payslips',
        }}
      />
      <Stack.Screen
        name="cash-advance"
        options={{
          title: 'Cash Advance',
        }}
      />
    </Stack>
  );
}

