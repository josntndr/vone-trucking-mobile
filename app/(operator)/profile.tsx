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
        { icon: 'person-outline', label: 'Personal Information', onPress: handlePersonalInfo },
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
            backgroundColor: colors.primary,
            width: 88,
            height: 88,
            borderRadius: 44,
            marginBottom: spacing[3],
            borderWidth: 3,
            borderColor: '#E07B2A',
            ...shadows.base,
          }]}>
            <Text style={[styles.avatarText, { 
              color: colors.textInverse,
              fontSize: fontSizes['3xl'],
              fontWeight: fontWeights.bold,
            }]}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </View>
          <Text style={[styles.name, { 
            color: colors.text,
            fontSize: fontSizes.xl,
            fontWeight: fontWeights.bold,
            marginBottom: spacing[1],
          }]}>
            {user?.email?.split('@')[0] || 'admin'}
          </Text>
          <Text style={[styles.email, { 
            color: '#E07B2A',
            fontSize: 13,
            marginBottom: spacing[3],
          }]}>
            {user?.email || 'admin@vonetrucking.com'}
          </Text>
          <View style={[styles.roleBadge, { 
            backgroundColor: '#1B2A4A',
            paddingHorizontal: spacing[4],
            paddingVertical: spacing[2],
            borderRadius: 6,
          }]}>
            <Text style={[styles.roleText, { 
              color: '#FFFFFF',
              fontSize: fontSizes.sm,
              fontWeight: fontWeights.semibold,
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
                color: colors.text,
                fontSize: fontSizes.base,
                fontWeight: fontWeights.semibold,
                marginBottom: spacing[3],
              }]}>
                {section.title}
              </Text>
              <Card style={{ 
                backgroundColor: colors.surface,
                borderRadius: 12,
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
                        padding: spacing[4],
                        minHeight: 56,
                      },
                      itemIndex < section.items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemContent}>
                      <View style={[styles.iconContainer, {
                        width: 40,
                        height: 40,
                        borderRadius: borderRadius.base,
                        backgroundColor: colors.background,
                        marginRight: spacing[3],
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
                        trackColor={{ false: colors.border, true: '#E07B2A' + '40' }}
                        thumbColor={item.switchValue ? '#E07B2A' : colors.textTertiary}
                        ios_backgroundColor={colors.border}
                      />
                    ) : (
                      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    )}
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          ))}

          {/* Logout Button */}
          <View style={[styles.section, { marginBottom: spacing[6] }]}>
            <TouchableOpacity
              style={[styles.logoutButton, {
                backgroundColor: '#D32F2F',
                borderRadius: 12,
                padding: spacing[4],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }]}
              onPress={() => setLogoutDialogVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={[styles.logoutText, {
                color: '#FFFFFF',
                fontSize: fontSizes.base,
                fontWeight: fontWeights.semibold,
                marginLeft: spacing[2],
              }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version Info */}
        <View style={[styles.versionContainer, { paddingVertical: spacing[5] }]}>
          <Text style={[styles.versionText, { 
            color: '#9E9E9E',
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

