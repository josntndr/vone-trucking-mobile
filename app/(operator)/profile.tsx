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
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Profile Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </Text>
            <View style={[styles.avatarOnlineBadge, { borderColor: colors.surface }]} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Admin Operator'}
          </Text>
          <Text style={[styles.emailText, { color: colors.textSecondary }]}>
            {user?.email || 'admin@vonetrucking.com'}
          </Text>
          <View style={[
            styles.roleBadge,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF',
              borderColor: isDarkMode ? '#334155' : '#BAE6FD',
            }
          ]}>
            <Ionicons name="shield-checkmark" size={13} color="#0EA5E9" style={{ marginRight: 4 }} />
            <Text style={[styles.roleText, { color: '#0EA5E9' }]}>
              Fleet Operations Admin
            </Text>
          </View>
        </View>

        {/* Profile Sections */}
        <View style={styles.sectionsContainer}>
          {profileSections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {section.title}
              </Text>
              <View style={[
                styles.cardGroup,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }
              ]}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex < section.items.length - 1 && [styles.menuItemDivider, { borderBottomColor: colors.border }],
                    ]}
                    onPress={item.hasSwitch && !item.hasChevron ? undefined : item.onPress}
                    activeOpacity={item.hasSwitch && !item.hasChevron ? 1 : 0.7}
                    disabled={item.hasSwitch && !item.hasChevron}
                  >
                    <View style={styles.menuItemContent}>
                      <View style={[
                        styles.iconContainer,
                        {
                          backgroundColor: isDarkMode ? '#334155' : '#F0F9FF',
                        }
                      ]}>
                        <Ionicons
                          name={item.icon as any}
                          size={19}
                          color={isDarkMode ? '#38BDF8' : '#0F1E36'}
                        />
                      </View>
                      <Text style={[styles.menuItemText, { color: colors.text }]}>
                        {item.label}
                      </Text>
                    </View>
                    {item.hasSwitch ? (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onSwitchChange}
                        trackColor={{ false: isDarkMode ? '#334155' : '#E2E8F0', true: '#0EA5E9' }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor={isDarkMode ? '#334155' : '#E2E8F0'}
                      />
                    ) : item.hasChevron ? (
                      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary || '#94A3B8'} />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <TouchableOpacity
              style={[
                styles.logoutButton,
                {
                  backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                  borderColor: isDarkMode ? 'rgba(239, 68, 68, 0.35)' : '#FECACA',
                }
              ]}
              onPress={() => setLogoutDialogVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>
                Log Out of Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version Info */}
        <View style={[styles.versionContainer, { paddingBottom: 20 }]}>
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>
            Vone Trucking v1.0.0 © {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutDialogVisible}
        onClose={() => setLogoutDialogVisible(false)}
        title="Sign Out"
        message="Are you sure you want to sign out of your Vone Trucking session?"
        onConfirm={handleLogout}
        confirmLabel="Sign Out"
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
    paddingTop: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: '#0F1E36',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#0F1E36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarOnlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 3,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  emailText: {
    fontSize: 13,
    marginBottom: 10,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionsContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  cardGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemDivider: {
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  logoutSection: {
    marginTop: 4,
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
