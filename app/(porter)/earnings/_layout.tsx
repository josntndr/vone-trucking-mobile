/**
 * Porter Earnings Stack Layout
 */

import { Stack } from 'expo-router';
import { useThemeContext } from '../../../src/contexts/ThemeContext';

export default function PorterEarningsLayout() {
  const { colors, isDarkMode } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface || (isDarkMode ? '#1E293B' : '#FFFFFF'),
        },
        headerTintColor: colors.text || (isDarkMode ? '#F8FAFC' : '#0F172A'),
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Earnings',
        }}
      />
    </Stack>
  );
}
