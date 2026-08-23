/**
 * Trucks Layout - Stack Navigation
 */

import { Stack } from 'expo-router';

export default function TrucksLayout() {
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
          title: 'Trucks',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Truck Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Truck',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Truck',
          presentation: 'modal',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

