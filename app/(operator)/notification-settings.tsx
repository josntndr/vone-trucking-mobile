/**
 * Notification Settings Screen
 * Manages notification preferences and permissions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Screen, Button } from '../../src/components';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/hooks';
import {
  loadSettings,
  updateNotificationPreferences,
  NotificationPreferences,
} from '../../src/services/storage/settings.service';

type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export default function NotificationSettingsScreen() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useThemeContext();
  const { user, isDemoMode } = useAuth();

  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    masterEnabled: true,
    tripAssignments: true,
    tripStatusUpdates: true,
    delaysAndIncidents: true,
    truckMaintenance: true,
    proofOfDelivery: true,
    payrollAndCashAdvances: true,
    generalAnnouncements: true,
  });

  useEffect(() => {
    loadPreferences();
    checkPermissionStatus();
  }, []);

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      const settings = await loadSettings(user.id);
      setPreferences(settings.notifications);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissionStatus = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);
    } catch (error) {
      console.error('Failed to check permission status:', error);
      setPermissionStatus('undetermined');
    }
  };

  const requestPermission = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      if (existingStatus === 'granted') {
        setPermissionStatus('granted');
        return true;
      }

      if (existingStatus === 'denied') {
        // Permission permanently denied - direct to settings
        Alert.alert(
          'Notifications Blocked',
          'Notifications are blocked for this app. To enable them, please open your device settings and allow notifications for Vone Trucking.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openDeviceSettings },
          ]
        );
        return false;
      }

      // Show explanation before requesting
      Alert.alert(
        'Enable Notifications',
        'Vone Trucking would like to send you notifications for:\n\n• Trip assignments and updates\n• Delays and incidents\n• Truck maintenance alerts\n• Payroll and cash advances\n\nYou can customize which notifications you receive after enabling.',
        [
          { text: 'Not Now', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              const { status: newStatus } = await Notifications.requestPermissionsAsync();
              setPermissionStatus(newStatus as PermissionStatus);

              if (newStatus === 'granted') {
                Alert.alert('Success', 'Notifications enabled successfully.');
              }
            },
          },
        ]
      );

      return false;
    } catch (error) {
      console.error('Failed to request permission:', error);
      Alert.alert('Error', 'Failed to request notification permission.');
      return false;
    }
  };

  const openDeviceSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('app-settings:');
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Failed to open settings:', error);
      Alert.alert('Error', 'Unable to open device settings.');
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user?.id) return;

    // If enabling master switch and permission not granted, request it
    if (key === 'masterEnabled' && value && permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        return; // Don't update preference if permission denied
      }
    }

    const newPreferences = {
      ...preferences,
      [key]: value,
    };

    // If disabling master, disable all categories
    if (key === 'masterEnabled' && !value) {
      newPreferences.tripAssignments = false;
      newPreferences.tripStatusUpdates = false;
      newPreferences.delaysAndIncidents = false;
      newPreferences.truckMaintenance = false;
      newPreferences.proofOfDelivery = false;
      newPreferences.payrollAndCashAdvances = false;
      newPreferences.generalAnnouncements = false;
    }

    setPreferences(newPreferences);

    // Save to storage
    try {
      setSaving(true);
      await updateNotificationPreferences(user.id, newPreferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      Alert.alert('Error', 'Failed to save notification preferences.');
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  const notificationCategories = [
    {
      key: 'tripAssignments' as const,
      label: 'Trip Assignments',
      description: 'New trips assigned to drivers',
      icon: 'car-outline',
    },
    {
      key: 'tripStatusUpdates' as const,
      label: 'Trip Status Updates',
      description: 'Updates on trip progress and completion',
      icon: 'checkmark-circle-outline',
    },
    {
      key: 'delaysAndIncidents' as const,
      label: 'Delays and Incidents',
      description: 'Reported delays and incidents',
      icon: 'warning-outline',
    },
    {
      key: 'truckMaintenance' as const,
      label: 'Truck Maintenance',
      description: 'Maintenance schedules and issues',
      icon: 'build-outline',
    },
    {
      key: 'proofOfDelivery' as const,
      label: 'Proof of Delivery',
      description: 'POD submissions and confirmations',
      icon: 'document-text-outline',
    },
    {
      key: 'payrollAndCashAdvances' as const,
      label: 'Payroll and Cash Advances',
      description: 'Payment processing updates',
      icon: 'cash-outline',
    },
    {
      key: 'generalAnnouncements' as const,
      label: 'General Announcements',
      description: 'Company-wide announcements',
      icon: 'megaphone-outline',
    },
  ];

  const isMasterEnabled = preferences.masterEnabled && permissionStatus === 'granted';

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: spacing[8] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: spacing[4],
              paddingTop: spacing[4],
              paddingBottom: spacing[5],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                marginBottom: spacing[4],
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to More screen"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: 28,
                fontWeight: fontWeights.bold,
                marginBottom: spacing[2],
              },
            ]}
          >
            Notification Settings
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontSize: fontSizes.sm,
                lineHeight: 20,
              },
            ]}
          >
            Manage your notification preferences and permissions.
          </Text>
        </View>

        {/* Permission Status Banner */}
        {permissionStatus === 'denied' && (
          <View
            style={[
              styles.banner,
              {
                marginHorizontal: spacing[4],
                marginBottom: spacing[4],
                padding: spacing[3],
                backgroundColor: colors.warning + '10',
                borderRadius: borderRadius.md,
                borderLeftWidth: 4,
                borderLeftColor: colors.warning,
              },
            ]}
          >
            <Ionicons
              name="alert-circle"
              size={20}
              color={colors.warning}
              style={{ marginRight: spacing[2] }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.bannerText,
                  {
                    color: colors.text,
                    fontSize: fontSizes.sm,
                    marginBottom: spacing[1],
                    fontWeight: fontWeights.semibold,
                  },
                ]}
              >
                Notifications Blocked
              </Text>
              <Text
                style={[
                  styles.bannerDescription,
                  {
                    color: colors.textSecondary,
                    fontSize: fontSizes.xs,
                    marginBottom: spacing[2],
                  },
                ]}
              >
                Enable notifications in your device settings to receive alerts.
              </Text>
              <TouchableOpacity
                onPress={openDeviceSettings}
                style={[
                  styles.bannerButton,
                  {
                    backgroundColor: colors.warning,
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[2],
                    borderRadius: borderRadius.sm,
                    alignSelf: 'flex-start',
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Open device settings"
              >
                <Text
                  style={[
                    styles.bannerButtonText,
                    {
                      color: colors.white,
                      fontSize: fontSizes.xs,
                      fontWeight: fontWeights.semibold,
                    },
                  ]}
                >
                  Open Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Master Switch */}
        <View style={[styles.section, { paddingHorizontal: spacing[4], marginBottom: spacing[4] }]}>
          <View
            style={[
              styles.masterCard,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing[4],
              },
            ]}
          >
            <View style={styles.masterContent}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.masterLabel,
                    {
                      color: colors.text,
                      fontSize: fontSizes.base,
                      fontWeight: fontWeights.semibold,
                      marginBottom: spacing[1],
                    },
                  ]}
                >
                  Master Notifications
                </Text>
                <Text
                  style={[
                    styles.masterDescription,
                    {
                      color: colors.textSecondary,
                      fontSize: fontSizes.sm,
                    },
                  ]}
                >
                  {permissionStatus === 'denied'
                    ? 'Enable in device settings first'
                    : 'Enable or disable all notifications'}
                </Text>
              </View>
              <Switch
                value={preferences.masterEnabled && permissionStatus === 'granted'}
                onValueChange={(value) => updatePreference('masterEnabled', value)}
                trackColor={{ false: colors.border, true: colors.primary + '40' }}
                thumbColor={isMasterEnabled ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.border}
                disabled={saving || permissionStatus === 'denied'}
                accessibilityRole="switch"
                accessibilityLabel="Master notifications"
                accessibilityState={{
                  checked: isMasterEnabled,
                  disabled: saving || permissionStatus === 'denied',
                }}
              />
            </View>
          </View>
        </View>

        {/* Notification Categories */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.textSecondary,
                fontSize: fontSizes.xs,
                fontWeight: fontWeights.bold,
                textTransform: 'uppercase',
                marginBottom: spacing[3],
                marginLeft: spacing[1],
              },
            ]}
          >
            Categories
          </Text>

          <View
            style={[
              styles.categoriesCard,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            {notificationCategories.map((category, index) => (
              <View
                key={category.key}
                style={[
                  styles.categoryItem,
                  {
                    paddingVertical: spacing[3],
                    paddingHorizontal: spacing[4],
                    minHeight: 64,
                  },
                  index < notificationCategories.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.categoryIcon,
                    {
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isMasterEnabled ? colors.primary + '10' : colors.border,
                      marginRight: spacing[3],
                    },
                  ]}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={isMasterEnabled ? colors.primary : colors.textTertiary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.categoryLabel,
                      {
                        color: isMasterEnabled ? colors.text : colors.textTertiary,
                        fontSize: fontSizes.base,
                        fontWeight: fontWeights.medium,
                        marginBottom: 2,
                      },
                    ]}
                  >
                    {category.label}
                  </Text>
                  <Text
                    style={[
                      styles.categoryDescription,
                      {
                        color: colors.textSecondary,
                        fontSize: fontSizes.sm,
                      },
                    ]}
                  >
                    {category.description}
                  </Text>
                </View>
                <Switch
                  value={preferences[category.key]}
                  onValueChange={(value) => updatePreference(category.key, value)}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={preferences[category.key] ? colors.primary : colors.textTertiary}
                  ios_backgroundColor={colors.border}
                  disabled={saving || !isMasterEnabled}
                  accessibilityRole="switch"
                  accessibilityLabel={`${category.label} notifications`}
                  accessibilityState={{
                    checked: preferences[category.key],
                    disabled: saving || !isMasterEnabled,
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {},
  subtitle: {},
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bannerText: {},
  bannerDescription: {},
  bannerButton: {},
  bannerButtonText: {},
  section: {},
  masterCard: {},
  masterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterLabel: {},
  masterDescription: {},
  sectionTitle: {},
  categoriesCard: {},
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {},
  categoryDescription: {},
});
