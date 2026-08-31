// @ts-nocheck
/**
 * Operator Layout - Bottom Tab Navigation
 * 5 tabs: Home, Trips, Trucks, Employees, More
 * Redesigned to match screenshot with teal active state and clean icons
 */

import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeContext } from '../../src/contexts/ThemeContext';

export default function OperatorLayout() {
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useThemeContext();

  const navColors = {
    active: '#0EA5E9',
    activeBackground: isDarkMode ? '#1E293B' : '#F0F9FF',
    inactive: isDarkMode ? '#94A3B8' : '#64748B',
    background: colors.surface || (isDarkMode ? '#0B1120' : '#FFFFFF'),
    border: colors.border || (isDarkMode ? '#1E293B' : '#E2E8F0'),
  };
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: navColors.active,
        tabBarInactiveTintColor: navColors.inactive,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: navColors.background,
          borderTopWidth: 1,
          borderTopColor: navColors.border,
          height: Platform.OS === 'ios' ? 84 : 64 + (insets.bottom > 0 ? insets.bottom : 6),
          paddingBottom: Platform.OS === 'ios' ? 22 : (insets.bottom > 0 ? insets.bottom : 6),
          paddingTop: 6,
          paddingHorizontal: 4,
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
          fontSize: 11,
          fontWeight: '600',
          marginTop: 1,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 44,
              height: 28,
              borderRadius: 14,
              backgroundColor: focused ? navColors.activeBackground : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 44,
              height: 28,
              borderRadius: 14,
              backgroundColor: focused ? navColors.activeBackground : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons 
                name={focused ? "navigate" : "navigate-outline"} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="trucks"
        options={{
          title: 'Trucks',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 44,
              height: 28,
              borderRadius: 14,
              backgroundColor: focused ? navColors.activeBackground : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons 
                name={focused ? "car" : "car-outline"} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: 'Employees',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 44,
              height: 28,
              borderRadius: 14,
              backgroundColor: focused ? navColors.activeBackground : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons 
                name={focused ? "people" : "people-outline"} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 44,
              height: 28,
              borderRadius: 14,
              backgroundColor: focused ? navColors.activeBackground : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons 
                name={focused ? "ellipsis-horizontal-circle" : "ellipsis-horizontal-circle-outline"} 
                size={22} 
                color={color} 
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: null, // Hidden - accessed via More > Analytics
        }}
      />
      <Tabs.Screen
        name="import"
        options={{
          href: null, // Hidden - accessed via More
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          href: null, // Hidden - accessed via More > About
        }}
      />
      <Tabs.Screen
        name="change-password"
        options={{
          href: null, // Hidden - accessed via More > Change Password
        }}
      />
      <Tabs.Screen
        name="notification-settings"
        options={{
          href: null, // Hidden - accessed via More > Notification Settings
        }}
      />
    </Tabs>
  );
}
