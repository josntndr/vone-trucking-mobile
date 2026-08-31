/**
 * Porter Reports Stack Layout
 */

import { Stack } from 'expo-router';
import { useThemeContext } from '../../../src/contexts/ThemeContext';

export default function PorterReportsLayout() {
  const { isDarkMode } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? '#0B1120' : '#FFFFFF',
        },
        headerTintColor: isDarkMode ? '#F8FAFC' : '#0F172A',
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          color: isDarkMode ? '#F8FAFC' : '#0F172A',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Alerts & Reports',
        }}
      />
      <Stack.Screen
        name="missing"
        options={{
          title: 'Report Missing Product',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="damaged"
        options={{
          title: 'Report Damaged Product',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="rejected"
        options={{
          title: 'Report Rejected Product',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
