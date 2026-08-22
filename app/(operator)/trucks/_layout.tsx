/**
 * Trucks Layout - Stack Navigation
 */

import { Stack } from 'expo-router';

export default function TrucksLayout() {
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
          title: 'Trucks',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Truck Details',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Truck',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Truck',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

