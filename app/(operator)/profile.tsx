/**
 * Operator Profile Screen
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Button, ConfirmDialog } from '../../src/components';
import { useAuth } from '../../src/hooks';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import { loadSettings } from '../../src/services/storage/settings.service';

export default function ProfileScreen() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius, shadows, isDarkMode, toggleTheme } = useThemeContext();
  const { user, signOut } = useAuth();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Load notification preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) {
        setLoadingSettings(false);
        return;
      }

      try {
        const settings = await loadSettings(user.id);
        setNotificationsEnabled(settings.notifications.masterEnabled);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadPreferences();
  }, [user?.id]);

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

  const handleChangePassword = () => {
    router.push('/(operator)/change-password');
  };

  const handleNotifications = () => {
    router.push('/(operator)/notification-settings');
  };

  const handleDarkModeToggle = async () => {
    try {
      await toggleTheme();
    } catch (error) {
      console.error('Failed to toggle theme:', error);
      Alert.alert('Error', 'Failed to change theme. Please try again.');
    }
  };

  const handleAbout = () => {
    router.push('/(operator)/about');
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { 
          icon: 'key-outline', 
          label: 'Change Password', 
          onPress: handleChangePassword,
          hasChevron: true,
        },
        { 
          icon: 'notifications-outline', 
          label: 'Notifications', 
          onPress: handleNotifications,
          hasSwitch: true,
          switchValue: notificationsEnabled,
          onSwitchChange: () => {
            // Switch is display-only, tapping opens settings
          },
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { 
          icon: 'moon-outline', 
          label: 'Dark Mode', 
          onPress: () => {}, // Handler on switch only
          hasSwitch: true,
          switchValue: isDarkMode,
          onSwitchChange: handleDarkModeToggle,
        },
        { 
          icon: 'information-circle-outline', 
          label: 'About', 
          onPress: handleAbout,
          hasChevron: true,
        },
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
            width: 72,
            height: 72,
            borderRadius: 36,
            marginBottom: spacing[3],
            borderWidth: 3,
            borderColor: colors.primary + '40',
            ...shadows.base,
          }]}>
            <Text style={[styles.avatarText, { 
              color: colors.white,
              fontSize: 32,
              fontWeight: fontWeights.bold,
            }]}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </View>
          <Text style={[styles.name, { 
            color: colors.text,
            fontSize: 18,
            fontWeight: fontWeights.bold,
            marginBottom: 8,
          }]}>
            {user?.email?.split('@')[0] || 'admin'}
          </Text>
          <View style={[styles.roleBadge, { 
            backgroundColor: colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 6,
          }]}>
            <Text style={[styles.roleText, { 
              color: colors.white,
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
                color: colors.textSecondary,
                fontSize: 12,
                fontWeight: fontWeights.bold,
                textTransform: 'uppercase',
                marginBottom: 12,
                marginLeft: 16,
              }]}>
                {section.title}
              </Text>
              <Card style={{ 
                backgroundColor: colors.surface,
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
                        borderBottomColor: colors.border + '40',
                      },
                    ]}
                    onPress={item.hasSwitch && !item.hasChevron ? undefined : item.onPress}
                    activeOpacity={item.hasSwitch && !item.hasChevron ? 1 : 0.7}
                    disabled={item.hasSwitch && !item.hasChevron}
                    accessibilityRole={item.hasSwitch ? 'none' : 'button'}
                    accessibilityLabel={item.label}
                    accessibilityHint={
                      item.hasChevron 
                        ? `Opens ${item.label} screen` 
                        : item.hasSwitch 
                        ? undefined 
                        : `Activates ${item.label}`
                    }
                  >
                    <View style={styles.menuItemContent}>
                      <View style={[styles.iconContainer, {
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: colors.primary + '10',
                        marginRight: 12,
                      }]}>
                        <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                      </View>
                      <Text style={[styles.menuItemText, { 
                        color: colors.text,
                        fontSize: fontSizes.base,
                        fontWeight: fontWeights.medium,
                        flex: 1,
                      }]}>
                        {item.label}
                      </Text>
                    </View>
                    {item.hasSwitch ? (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onSwitchChange}
                        trackColor={{ false: colors.border, true: colors.primary + '40' }}
                        thumbColor={item.switchValue ? colors.primary : colors.textTertiary}
                        ios_backgroundColor={colors.border}
                        accessibilityRole="switch"
                        accessibilityLabel={`${item.label} switch`}
                        accessibilityState={{ checked: item.switchValue }}
                      />
                    ) : item.hasChevron ? (
                      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          ))}

          {/* Logout Button */}
          <View style={[styles.section, { marginTop: 20, marginBottom: spacing[6] }]}>
            <TouchableOpacity
              style={[styles.logoutButton, {
                backgroundColor: colors.error,
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
              accessibilityRole="button"
              accessibilityLabel="Logout"
              accessibilityHint="Signs you out of the app"
            >
              <Ionicons name="log-out-outline" size={20} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={[styles.logoutText, {
                color: colors.white,
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
            color: colors.textTertiary,
            fontSize: 10,
          }]}>
            Vone Trucking v1.0.0 © {new Date().getFullYear()}
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

