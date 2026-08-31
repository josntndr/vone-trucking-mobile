/**
 * Trips Layout - Stack Navigation
 */

import { Stack } from 'expo-router';

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#0B1120',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Trips',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Trip Details',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Create Trip',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Trip',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="assign/[id]"
        options={{
          title: 'Assign Resources',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calendar"
        options={{
          title: 'Trip Calendar',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="dispatch"
        options={{
          title: 'Dispatch View',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
