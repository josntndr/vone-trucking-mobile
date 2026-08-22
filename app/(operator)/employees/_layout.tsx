/**
 * Employees Layout - Stack Navigation
 */

import { Stack } from 'expo-router';

export default function EmployeesLayout() {
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
          title: 'Employees',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Employee Details',
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Employee',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Employee',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

