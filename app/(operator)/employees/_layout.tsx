/**
 * Employees Layout - Stack Navigation
 */

import { Stack } from 'expo-router';

export default function EmployeesLayout() {
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
          title: 'Employees',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Employee Details',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Employee',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Employee',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
