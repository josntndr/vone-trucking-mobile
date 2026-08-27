/**
 * Settings Storage Service
 * Manages user preferences and settings in AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_PREFIX = '@vone_trucking_settings_';

export interface NotificationPreferences {
  masterEnabled: boolean;
  tripAssignments: boolean;
  tripStatusUpdates: boolean;
  delaysAndIncidents: boolean;
  truckMaintenance: boolean;
  proofOfDelivery: boolean;
  payrollAndCashAdvances: boolean;
  generalAnnouncements: boolean;
}

export interface UserSettings {
  notifications: NotificationPreferences;
  pushToken?: string;
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  masterEnabled: true,
  tripAssignments: true,
  tripStatusUpdates: true,
  delaysAndIncidents: true,
  truckMaintenance: true,
  proofOfDelivery: true,
  payrollAndCashAdvances: true,
  generalAnnouncements: true,
};

/**
 * Get settings key for specific user
 */
const getSettingsKey = (userId: string): string => {
  return `${SETTINGS_PREFIX}${userId}`;
};

/**
 * Load user settings
 */
export const loadSettings = async (userId: string): Promise<UserSettings> => {
  try {
    const key = getSettingsKey(userId);
    const stored = await AsyncStorage.getItem(key);

    if (stored) {
      return JSON.parse(stored);
    }

    // Return defaults for new users
    return {
      notifications: DEFAULT_NOTIFICATION_PREFERENCES,
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      notifications: DEFAULT_NOTIFICATION_PREFERENCES,
    };
  }
};

/**
 * Save user settings
 */
export const saveSettings = async (
  userId: string,
  settings: UserSettings
): Promise<void> => {
  try {
    const key = getSettingsKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<void> => {
  try {
    const currentSettings = await loadSettings(userId);
    const updatedSettings: UserSettings = {
      ...currentSettings,
      notifications: {
        ...currentSettings.notifications,
        ...preferences,
      },
    };
    await saveSettings(userId, updatedSettings);
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    throw error;
  }
};

/**
 * Save push token
 */
export const savePushToken = async (
  userId: string,
  token: string
): Promise<void> => {
  try {
    const currentSettings = await loadSettings(userId);
    const updatedSettings: UserSettings = {
      ...currentSettings,
      pushToken: token,
    };
    await saveSettings(userId, updatedSettings);
  } catch (error) {
    console.error('Failed to save push token:', error);
    throw error;
  }
};

/**
 * Clear push token (on logout)
 */
export const clearPushToken = async (userId: string): Promise<void> => {
  try {
    const currentSettings = await loadSettings(userId);
    const updatedSettings: UserSettings = {
      ...currentSettings,
      pushToken: undefined,
    };
    await saveSettings(userId, updatedSettings);
  } catch (error) {
    console.error('Failed to clear push token:', error);
    throw error;
  }
};

/**
 * Clear all settings for user (on logout)
 */
export const clearSettings = async (userId: string): Promise<void> => {
  try {
    const key = getSettingsKey(userId);
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear settings:', error);
    throw error;
  }
};
