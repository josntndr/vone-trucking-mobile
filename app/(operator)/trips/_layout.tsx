/**
 * Trips Layout - Stack Navigation
 */

import { Stack } from 'expo-router';

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Trips',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Trip Details',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Create Trip',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Trip',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="assign/[id]"
        options={{
          title: 'Assign Resources',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="calendar"
        options={{
          title: 'Trip Calendar',
        }}
      />
      <Stack.Screen
        name="dispatch"
        options={{
          title: 'Dispatch View',
        }}
      />
    </Stack>
  );
}

