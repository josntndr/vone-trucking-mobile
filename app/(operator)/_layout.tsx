// @ts-nocheck
/**
 * Operator Layout - Bottom Tab Navigation
 * 5 tabs: Home, Trips, Fleet, Employees, More
 * Redesigned with proper icons, colors, and active state indicators
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Navigation Colors
const NAV_COLORS = {
  active: '#1B2A4A',        // Navy for active icon/label
  inactive: '#9E9E9E',       // Medium grey for inactive
  background: '#FFFFFF',     // Clean white background
  border: '#E0E0E0',         // Subtle top border
};

export default function OperatorLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: NAV_COLORS.active,
        tabBarInactiveTintColor: NAV_COLORS.inactive,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: NAV_COLORS.background,
          borderTopWidth: 1,
          borderTopColor: NAV_COLORS.border,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          textTransform: 'capitalize',
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        // Explicitly disable any indicator
        tabBarIndicatorStyle: {
          height: 0,
          width: 0,
          display: 'none',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "navigate" : "navigate-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trucks"
        options={{
          title: 'Fleet',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "car" : "car-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: 'Employees',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "people" : "people-outline"} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? "grid" : "grid-outline"} 
              size={24} 
              color={color} 
            />
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
