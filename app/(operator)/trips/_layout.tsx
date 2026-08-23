/**
 * Trips Layout - Stack Navigation
 */

import { Stack } from 'expo-router';

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerBackTitle: 'Back',
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
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Create Trip',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Trip',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="assign/[id]"
        options={{
          title: 'Assign Resources',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="calendar"
        options={{
          title: 'Trip Calendar',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="dispatch"
        options={{
          title: 'Dispatch View',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

