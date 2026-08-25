/**
 * Operator Profile Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Button, ConfirmDialog } from '../../src/components';
import { useTheme, useAuth } from '../../src/hooks';

export default function ProfileScreen() {
  // Force light theme for operator/admin
  const themeObj = useTheme();
  const colors = {
    background: '#F7F4EF',
    surface: '#FFFDFC',
    text: '#24211F',
    textSecondary: '#746B63',
    textTertiary: '#9D9690',
    border: '#E5DDD5',
    primary: '#192A4A',
    error: '#C44C47',
    white: '#FFFFFF',
  };
  const { spacing, fontSizes, fontWeights, borderRadius, shadows } = themeObj;
  const { user, signOut } = useAuth();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    setLogoutDialogVisible(false);
    
    try {
      const { error } = await signOut();
      if (error) {
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      } else {
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'An unexpected error occurred during logout');
    }
  };

  const handlePersonalInfo = () => {
    Alert.alert(
      'Personal Information',
      `Email: ${user?.email || 'admin@vonetrucking.com'}\nRole: Operator/Admin\nAccount Status: Active`,
      [{ text: 'OK' }]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Password change functionality will redirect you to a secure form.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => Alert.alert('Info', 'This feature will be available soon.') },
      ]
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notification Settings',
      `Notifications are currently ${notificationsEnabled ? 'enabled' : 'disabled'}.\n\nYou can toggle them using the switch.`,
      [{ text: 'OK' }]
    );
  };

  const handleDarkMode = () => {
    Alert.alert(
      'Dark Mode',
      'Dark mode is currently disabled for operator accounts to maintain consistency across the admin interface.',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Vone Trucking',
      'Version: 1.0.0\nBuild: 2026.01\n\nVone Trucking is a comprehensive fleet management solution for trucking operations.\n\n© 2026 Vone Trucking. All rights reserved.',
      [{ text: 'OK' }]
    );
  };

  const handleAnalytics = () => {
    // Navigate to analytics dashboard
    router.push('/(operator)/analytics');
  };

  const handleReports = () => {
    Alert.alert(
      'Reports',
      'View and export detailed reports:\n\n• Trip Reports\n• Driver Performance\n• Fuel Consumption\n• Maintenance Records\n• Financial Summaries',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Reports', onPress: () => Alert.alert('Info', 'Reports dashboard coming soon.') },
      ]
    );
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: 'key-outline', label: 'Change Password', onPress: handleChangePassword },
        { 
          icon: 'notifications-outline', 
          label: 'Notifications', 
          onPress: handleNotifications,
          hasSwitch: true,
          switchValue: notificationsEnabled,
          onSwitchChange: setNotificationsEnabled,
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { 
          icon: 'moon-outline', 
          label: 'Dark Mode', 
          onPress: handleDarkMode,
          hasSwitch: true,
          switchValue: darkModeEnabled,
          onSwitchChange: setDarkModeEnabled,
        },
        { icon: 'information-circle-outline', label: 'About', onPress: handleAbout },
      ],
    },
  ];

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ paddingBottom: spacing[8] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.header, { 
          paddingHorizontal: spacing[4], 
          paddingTop: spacing[6],
          paddingBottom: spacing[5],
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }]}>
          <View style={[styles.avatarContainer, { 
            backgroundColor: '#1B2A4A',
            width: 72,
            height: 72,
            borderRadius: 36,
            marginBottom: spacing[3],
            borderWidth: 3,
            borderColor: '#E07B2A',
            ...shadows.base,
          }]}>
            <Text style={[styles.avatarText, { 
              color: '#FFFFFF',
              fontSize: 32,
              fontWeight: fontWeights.bold,
            }]}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </View>
          <Text style={[styles.name, { 
            color: '#1B2A4A',
            fontSize: 18,
            fontWeight: fontWeights.bold,
            marginBottom: 8,
          }]}>
            {user?.email?.split('@')[0] || 'admin'}
          </Text>
          <View style={[styles.roleBadge, { 
            backgroundColor: '#1B2A4A',
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 6,
          }]}>
            <Text style={[styles.roleText, { 
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: fontWeights.semibold,
              letterSpacing: 0.4,
            }]}>
              Operator / Admin
            </Text>
          </View>
        </View>

        {/* Profile Sections */}
        <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[5] }}>
          {profileSections.map((section, index) => (
            <View key={index} style={[styles.section, { marginBottom: spacing[5] }]}>
              <Text style={[styles.sectionTitle, { 
                color: '#9E9E9E',
                fontSize: 12,
                fontWeight: fontWeights.bold,
                textTransform: 'uppercase',
                marginBottom: 12,
                marginLeft: 16,
              }]}>
                {section.title}
              </Text>
              <Card style={{ 
                backgroundColor: colors.white,
                borderRadius: 14,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      { 
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        minHeight: 52,
                      },
                      itemIndex < section.items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: '#F0F0F0',
                      },
                    ]}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemContent}>
                      <View style={[styles.iconContainer, {
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: '#F5F5F5',
                        marginRight: 12,
                      }]}>
                        <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
                      </View>
                      <Text style={[styles.menuItemText, { 
                        color: colors.text,
                        fontSize: fontSizes.base,
                        fontWeight: fontWeights.normal,
                        flex: 1,
                      }]}>
                        {item.label}
                      </Text>
                    </View>
                    {item.hasSwitch ? (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onSwitchChange}
                        trackColor={{ false: '#E0E0E0', true: '#E07B2A40' }}
                        thumbColor={item.switchValue ? '#E07B2A' : '#9E9E9E'}
                        ios_backgroundColor="#E0E0E0"
                      />
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color="#BDBDBD" />
                    )}
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          ))}

          {/* Logout Button */}
          <View style={[styles.section, { marginTop: 20, marginBottom: spacing[6] }]}>
            <TouchableOpacity
              style={[styles.logoutButton, {
                backgroundColor: '#D32F2F',
                borderRadius: 14,
                paddingVertical: 16,
                paddingHorizontal: 20,
                minHeight: 52,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }]}
              onPress={() => setLogoutDialogVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={[styles.logoutText, {
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: fontWeights.bold,
              }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version Info */}
        <View style={[styles.versionContainer, { paddingBottom: spacing[5] }]}>
          <Text style={[styles.versionText, { 
            color: '#BDBDBD',
            fontSize: 10,
          }]}>
            Vone Trucking v1.0.0 © 2026
          </Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        isOpen={logoutDialogVisible}
        onClose={() => setLogoutDialogVisible(false)}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={handleLogout}
        confirmLabel="Logout"
        isDestructive={true}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {},
  name: {
    textAlign: 'center',
  },
  email: {
    textAlign: 'center',
  },
  roleBadge: {},
  roleText: {},
  section: {},
  sectionTitle: {},
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {},
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {},
  versionContainer: {
    alignItems: 'center',
  },
  versionText: {
    textAlign: 'center',
  },
});

