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

// Navigation Colors (matching screenshot)
const NAV_COLORS = {
  active: '#3A7D8C',         // Teal for active state
  activeBackground: '#E0F2F7', // Light teal background for active icon
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
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
          paddingHorizontal: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: focused ? NAV_COLORS.activeBackground : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons 
                name={focused ? "home" : "home-outline"} 
                size={24} 
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
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: focused ? NAV_COLORS.activeBackground : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons 
                name={focused ? "navigate" : "navigate-outline"} 
                size={24} 
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
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: focused ? NAV_COLORS.activeBackground : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons 
                name={focused ? "car" : "car-outline"} 
                size={24} 
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
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: focused ? NAV_COLORS.activeBackground : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons 
                name={focused ? "people" : "people-outline"} 
                size={24} 
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
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: focused ? NAV_COLORS.activeBackground : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Ionicons 
                name={focused ? "ellipsis-horizontal-circle" : "ellipsis-horizontal-circle-outline"} 
                size={24} 
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
