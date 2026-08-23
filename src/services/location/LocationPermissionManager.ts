/**
 * Location Permission Manager
 * Handles requesting and checking location permissions with proper explanations
 */

import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';
import type { 
  LocationPermissions,
  LocationPermissionStatus,
  BackgroundLocationPermissionStatus 
} from '../../types/location.types';

export class LocationPermissionManager {
  /**
   * Check current permission status
   */
  static async getPermissionStatus(): Promise<LocationPermissions> {
    const foregroundStatus = await Location.getForegroundPermissionsAsync();
    const backgroundStatus = await Location.getBackgroundPermissionsAsync();

    return {
      foreground: this.mapPermissionStatus(foregroundStatus.status),
      background: this.mapBackgroundPermissionStatus(backgroundStatus.status),
      precisioLocation: foregroundStatus.accuracy === Location.Accuracy.High ||
                        foregroundStatus.accuracy === Location.Accuracy.Highest,
    };
  }

  /**
   * Request foreground location permission with explanation
   */
  static async requestForegroundPermission(): Promise<LocationPermissionStatus> {
    // Check current status
    const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
    
    if (currentStatus === Location.PermissionStatus.GRANTED) {
      return 'granted';
    }

    if (currentStatus === Location.PermissionStatus.DENIED) {
      // Permission previously denied - show explanation and guide to settings
      this.showPermissionDeniedAlert();
      return 'denied';
    }

    // Request permission with explanation
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    return this.mapPermissionStatus(status);
  }

  /**
   * Request background location permission with explanation
   * Only call this after foreground permission is granted
   */
  static async requestBackgroundPermission(): Promise<BackgroundLocationPermissionStatus> {
    // Check foreground first
    const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
    
    if (foregroundStatus !== Location.PermissionStatus.GRANTED) {
      Alert.alert(
        'Foreground Permission Required',
        'Please grant foreground location permission before enabling background tracking.'
      );
      return 'denied';
    }

    // Check current background status
    const { status: currentStatus } = await Location.getBackgroundPermissionsAsync();
    
    if (currentStatus === Location.PermissionStatus.GRANTED) {
      return 'granted';
    }

    if (currentStatus === Location.PermissionStatus.DENIED) {
      this.showBackgroundPermissionDeniedAlert();
      return 'denied';
    }

    // Show explanation before requesting
    const shouldRequest = await this.showBackgroundPermissionExplanation();
    
    if (!shouldRequest) {
      return 'denied';
    }

    // Request background permission
    const { status } = await Location.requestBackgroundPermissionsAsync();
    
    return this.mapBackgroundPermissionStatus(status);
  }

  /**
   * Show explanation for why location is needed
   */
  private static showBackgroundPermissionExplanation(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        'Background Location Access',
        Platform.select({
          ios: 'Vone Trucking needs "Always Allow" location access to:\n\n' +
               '• Track your truck during active deliveries\n' +
               '• Update dispatch on your location\n' +
               '• Calculate accurate arrival times\n' +
               '• Help with route optimization\n\n' +
               'Location is ONLY tracked during work trips and stops when the trip ends.\n\n' +
               'Your privacy is important: location is never tracked outside of work hours or assigned trips.',
          android: 'Vone Trucking needs "Allow all the time" location access to:\n\n' +
                  '• Track your truck during active deliveries\n' +
                  '• Update dispatch on your location\n' +
                  '• Calculate accurate arrival times\n' +
                  '• Help with route optimization\n\n' +
                  'Location is ONLY tracked during work trips and stops when the trip ends.\n\n' +
                  'Your privacy is important: location is never tracked outside of work hours or assigned trips.',
        }),
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Enable',
            onPress: () => resolve(true),
          },
        ]
      );
    });
  }

  /**
   * Show alert when foreground permission is denied
   */
  private static showPermissionDeniedAlert(): void {
    Alert.alert(
      'Location Permission Required',
      'Location access is required to track deliveries and update dispatch on your progress.\n\n' +
      'Please enable location permission in your device settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  /**
   * Show alert when background permission is denied
   */
  private static showBackgroundPermissionDeniedAlert(): void {
    Alert.alert(
      'Background Location Required',
      Platform.select({
        ios: 'To track deliveries when the app is in the background, please:\n\n' +
             '1. Open Settings\n' +
             '2. Go to Vone Trucking\n' +
             '3. Tap Location\n' +
             '4. Select "Always"\n\n' +
             'This allows accurate delivery tracking and dispatch updates.',
        android: 'To track deliveries when the app is in the background, please:\n\n' +
                '1. Open Settings\n' +
                '2. Go to Vone Trucking\n' +
                '3. Tap Permissions\n' +
                '4. Tap Location\n' +
                '5. Select "Allow all the time"\n\n' +
                'This allows accurate delivery tracking and dispatch updates.',
      }),
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ]
    );
  }

  /**
   * Check if we have all required permissions for tracking
   */
  static async hasRequiredPermissions(): Promise<boolean> {
    const permissions = await this.getPermissionStatus();
    return permissions.foreground === 'granted' && 
           permissions.background === 'granted';
  }

  /**
   * Request all required permissions with proper flow
   */
  static async requestAllPermissions(): Promise<LocationPermissions> {
    // First request foreground
    const foregroundStatus = await this.requestForegroundPermission();
    
    if (foregroundStatus !== 'granted') {
      return {
        foreground: foregroundStatus,
        background: 'denied',
        precisioLocation: false,
      };
    }

    // Then request background
    const backgroundStatus = await this.requestBackgroundPermission();
    
    return await this.getPermissionStatus();
  }

  /**
   * Show privacy explanation dialog
   */
  static showPrivacyExplanation(): void {
    Alert.alert(
      'Your Privacy Matters',
      'Location tracking during work trips:\n' +
      '• ONLY active during assigned deliveries\n' +
      '• Automatically stops when trip ends\n' +
      '• Never tracked during personal time\n' +
      '• Never tracked outside work hours\n\n' +
      'Your data is secure:\n' +
      '• Location sent over encrypted connection\n' +
      '• Only visible to authorized dispatch\n' +
      '• Used only for delivery coordination\n' +
      '• Automatically deleted after 90 days\n\n' +
      'Battery optimization:\n' +
      '• Smart tracking reduces battery use\n' +
      '• Updates only when moving\n' +
      '• Efficient background processing',
      [{ text: 'Understood' }]
    );
  }

  /**
   * Map expo-location status to our types
   */
  private static mapPermissionStatus(
    status: Location.PermissionStatus
  ): LocationPermissionStatus {
    switch (status) {
      case Location.PermissionStatus.GRANTED:
        return 'granted';
      case Location.PermissionStatus.DENIED:
        return 'denied';
      default:
        return 'undetermined';
    }
  }

  /**
   * Map expo-location background status
   */
  private static mapBackgroundPermissionStatus(
    status: Location.PermissionStatus
  ): BackgroundLocationPermissionStatus {
    switch (status) {
      case Location.PermissionStatus.GRANTED:
        return 'granted';
      case Location.PermissionStatus.DENIED:
        return 'denied';
      default:
        return 'undetermined';
    }
  }

  /**
   * Check if mock locations are enabled (Android)
   */
  static async isMockLocationEnabled(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Check if location is mocked (Android only)
      return (location as any).mocked === true;
    } catch {
      return false;
    }
  }

  /**
   * Show warning about mock locations
   */
  static showMockLocationWarning(): void {
    Alert.alert(
      'Mock Location Detected',
      'Your device appears to be using a mock location app. ' +
      'Please disable mock locations for accurate delivery tracking.',
      [{ text: 'OK' }]
    );
  }
}
