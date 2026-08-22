/**
 * Import Module Layout
 * Navigation for Google Sheets import workflow
 */

import { Stack } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';

export default function ImportLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="connect"
        options={{
          title: 'Connect Google Sheets',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="spreadsheets"
        options={{
          title: 'Select Spreadsheet',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="mapping"
        options={{
          title: 'Map Columns',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          title: 'Preview Import',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          title: 'Import Results',
          headerBackTitle: 'Done',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'Import History',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}

