/**
 * Employees Layout - Stack Navigation
 */

import { Stack } from 'expo-router';

export default function EmployeesLayout() {
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
          title: 'Employees',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Employee Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Employee',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Employee',
          presentation: 'modal',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

