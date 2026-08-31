/**
 * Trucks Layout - Stack Navigation
 */

import { Stack } from 'expo-router';

export default function TrucksLayout() {
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
          title: 'Trucks',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Truck Details',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Truck',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Truck',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
