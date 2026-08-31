/**
 * Porter Layout
 * Modern 5-tab navigation for porter/helper workflow: Dashboard, Assignments, Earnings, Alerts, Profile
 */

import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '../../src/contexts/ThemeContext';

export default function PorterLayout() {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useThemeContext();

  const porterNavColors = {
    active: '#0EA5E9',
    activeBg: isDarkMode ? '#1E293B' : '#F0F9FF',
    inactive: isDarkMode ? '#94A3B8' : '#64748B',
    bg: colors.surface || (isDarkMode ? '#0B1120' : '#FFFFFF'),
    border: colors.border || (isDarkMode ? '#1E293B' : '#E2E8F0'),
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: porterNavColors.active,
        tabBarInactiveTintColor: porterNavColors.inactive,
        tabBarStyle: {
          backgroundColor: porterNavColors.bg,
          borderTopWidth: 1,
          borderTopColor: porterNavColors.border,
          height: 64 + (insets.bottom > 0 ? insets.bottom : 6),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
          paddingTop: 6,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: isDarkMode ? 0.2 : 0.05,
          shadowRadius: 10,
          elevation: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 1,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: focused ? porterNavColors.activeBg : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons name="dolly" size={20} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="trips"
        options={{
          title: 'Assignments',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: focused ? porterNavColors.activeBg : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons
                name={focused ? 'clipboard-check' : 'clipboard-check-outline'}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="earnings"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: focused ? porterNavColors.activeBg : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons
                name={focused ? 'cash-multiple' : 'cash'}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: focused ? porterNavColors.activeBg : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons
                name={focused ? 'bell' : 'bell-outline'}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: focused ? porterNavColors.activeBg : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <MaterialCommunityIcons
                name={focused ? 'account-circle' : 'account-circle-outline'}
                size={20}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
