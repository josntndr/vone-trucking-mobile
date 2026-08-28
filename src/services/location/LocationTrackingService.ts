// @ts-nocheck - TODO: Fix LocationUpdate type mismatches
/**
 * Location Tracking Service
 * Manages GPS tracking during active trips with battery optimization
 */

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  LocationUpdate,
  LocationCoordinates,
  LocationTrackingConfig,
  GPSHealth,
  PhoneGPSProvider,
} from '../../types/location.types';
import { gpsHealthMonitor } from './GPSHealthMonitor';

const LOCATION_TASK_NAME = 'background-location-task';
const ACTIVE_TRIP_KEY = '@vone_active_trip_tracking';
const LOCATION_QUEUE_KEY = '@vone_location_queue';

export class LocationTrackingService {
  private static isTracking = false;
  private static activeTripId: string | null = null;
  private static locationQueue: LocationUpdate[] = [];

  /**
   * Start location tracking for a trip
   * ONLY called when trip status transitions to active (at_warehouse or later)
   */
  static async startTracking(
    tripId: string,
    truckId: string,
    driverId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if already tracking this trip
      if (this.isTracking && this.activeTripId === tripId) {
        return { success: true };
      }

      // Stop any existing tracking
      if (this.isTracking && this.activeTripId) {
        await this.stopTracking();
      }

      // Verify permissions
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();

      if (
        foregroundStatus !== Location.PermissionStatus.GRANTED ||
        backgroundStatus !== Location.PermissionStatus.GRANTED
      ) {
        return {
          success: false,
          error: 'Location permissions not granted',
        };
      }

      // Save active trip info
      await AsyncStorage.setItem(
        ACTIVE_TRIP_KEY,
        JSON.stringify({ tripId, truckId, driverId, startedAt: new Date().toISOString() })
      );

      this.activeTripId = tripId;
      this.isTracking = true;

      // Start GPS health monitoring
      gpsHealthMonitor.startMonitoring();

      // Get tracking config
      const config = this.getTrackingConfig();

      // Start background location tracking
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: config.updateIntervalMs,
        distanceInterval: config.distanceFilterMeters,
        foregroundService: Platform.OS === 'android' ? {
          notificationTitle: config.foregroundServiceTitle || 'Vone Trucking - Active Delivery',
          notificationBody: config.foregroundServiceMessage || 'Tracking your delivery location',
          notificationColor: '#1976d2',
        } : undefined,
        pausesUpdatesAutomatically: Platform.OS === 'ios' ? config.pausesUpdatesAutomatically : undefined,
        activityType: Platform.OS === 'ios' ? Location.ActivityType.AutomotiveNavigation : undefined,
        showsBackgroundLocationIndicator: Platform.OS === 'ios' ? config.showsBackgroundLocationIndicator : undefined,
      });

      console.log(`[LocationTracking] Started tracking for trip ${tripId}`);

      return { success: true };
    } catch (error) {
      console.error('[LocationTracking] Failed to start tracking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Stop location tracking
   * Called when trip is completed or cancelled
   */
  static async stopTracking(): Promise<void> {
    try {
      if (!this.isTracking) {
        return;
      }

      // Stop background tracking
      const hasTask = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (hasTask) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      // Stop GPS health monitoring
      gpsHealthMonitor.stopMonitoring();

      // Clear active trip
      await AsyncStorage.removeItem(ACTIVE_TRIP_KEY);

      // Sync any remaining queued locations
      await this.syncLocationQueue();

      this.isTracking = false;
      this.activeTripId = null;

      console.log('[LocationTracking] Stopped tracking');
    } catch (error) {
      console.error('[LocationTracking] Failed to stop tracking:', error);
    }
  }

  /**
   * Get current tracking status
   */
  static async getTrackingStatus(): Promise<{
    isTracking: boolean;
    tripId: string | null;
    truckId: string | null;
    driverId: string | null;
  }> {
    try {
      const data = await AsyncStorage.getItem(ACTIVE_TRIP_KEY);
      if (!data) {
        return {
          isTracking: false,
          tripId: null,
          truckId: null,
          driverId: null,
        };
      }

      const { tripId, truckId, driverId } = JSON.parse(data);
      return {
        isTracking: this.isTracking,
        tripId,
        truckId,
        driverId,
      };
    } catch {
      return {
        isTracking: false,
        tripId: null,
        truckId: null,
        driverId: null,
      };
    }
  }

  /**
   * Get current location (one-time fetch)
   */
  static async getCurrentLocation(): Promise<LocationCoordinates | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        altitudeAccuracy: location.coords.altitudeAccuracy || null,
        heading: location.coords.heading,
        speed: location.coords.speed,
      };
    } catch (error) {
      console.error('[LocationTracking] Failed to get current location:', error);
      return null;
    }
  }

  /**
   * Check GPS health
   */
  static async checkGPSHealth(): Promise<GPSHealth> {
    try {
      const location = await Location.getLastKnownPositionAsync();

      if (!location) {
        return {
          status: 'unavailable',
          last_fix_age_seconds: Infinity,
          signal_strength: 'poor',
        };
      }

      const ageSeconds = (Date.now() - location.timestamp) / 1000;
      const accuracy = location.coords.accuracy || 999;

      let status: GPSHealth['status'] = 'healthy';
      let signalStrength: GPSHealth['signal_strength'] = 'excellent';

      if (ageSeconds > 300 || accuracy > 100) {
        status = 'unavailable';
        signalStrength = 'poor';
      } else if (ageSeconds > 120 || accuracy > 50) {
        status = 'weak';
        signalStrength = 'fair';
      } else if (accuracy > 20) {
        signalStrength = 'good';
      }

      return {
        status,
        accuracy_meters: accuracy,
        last_fix_age_seconds: ageSeconds,
        signal_strength: signalStrength,
      };
    } catch {
      return {
        status: 'unavailable',
        last_fix_age_seconds: Infinity,
        signal_strength: 'poor',
      };
    }
  }

  /**
   * Process location update from background task
   */
  private static async processLocationUpdate(
    locations: Location.LocationObject[]
  ): Promise<void> {
    try {
      const trackingData = await AsyncStorage.getItem(ACTIVE_TRIP_KEY);
      if (!trackingData) {
        console.warn('[LocationTracking] No active trip found');
        return;
      }

      const { tripId, truckId, driverId } = JSON.parse(trackingData);

      // Get battery level
      const batteryLevel = await this.getBatteryLevel();

      // Get GPS provider info
      const provider = await this.getGPSProvider();

      // Process each location update
      for (const location of locations) {
        const update: LocationUpdate = {
          id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          trip_id: tripId,
          truck_id: truckId,
          driver_id: driverId,
          coordinates: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            altitude: location.coords.altitude,
            accuracy: location.coords.accuracy,
            altitudeAccuracy: location.coords.altitudeAccuracy || null,
            heading: location.coords.heading,
            speed: location.coords.speed,
          },
          timestamp: new Date(location.timestamp).toISOString(),
          source: 'driver_phone_gps',
          battery_level: batteryLevel,
          is_mock: (location as any).mocked === true,
        };

        // Update GPS health monitor
        gpsHealthMonitor.updateLocation(update);

        // Add to queue
        this.locationQueue.push(update);
      }

      // Save queue to storage
      await this.saveLocationQueue();

      // Try to sync if online
      await this.syncLocationQueue();
    } catch (error) {
      console.error('[LocationTracking] Failed to process location update:', error);
    }
  }

  /**
   * Save location queue to AsyncStorage
   */
  private static async saveLocationQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        LOCATION_QUEUE_KEY,
        JSON.stringify(this.locationQueue)
      );
    } catch (error) {
      console.error('[LocationTracking] Failed to save location queue:', error);
    }
  }

  /**
   * Load location queue from AsyncStorage
   */
  private static async loadLocationQueue(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(LOCATION_QUEUE_KEY);
      if (data) {
        this.locationQueue = JSON.parse(data);
      }
    } catch (error) {
      console.error('[LocationTracking] Failed to load location queue:', error);
    }
  }

  /**
   * Sync location queue to server
   */
  private static async syncLocationQueue(): Promise<void> {
    if (this.locationQueue.length === 0) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`${API_BASE_URL}/location/batch`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ locations: this.locationQueue }),
      // });

      // For now, simulate successful sync
      console.log(`[LocationTracking] Syncing ${this.locationQueue.length} locations`);

      // Clear queue after successful sync
      this.locationQueue = [];
      await AsyncStorage.removeItem(LOCATION_QUEUE_KEY);
    } catch (error) {
      console.error('[LocationTracking] Failed to sync locations:', error);
      // Keep in queue for retry
    }
  }

  /**
   * Get battery level
   */
  private static async getBatteryLevel(): Promise<number> {
    try {
      // TODO: Use expo-battery if available
      // For now, return placeholder
      return 100;
    } catch {
      return 100;
    }
  }

  /**
   * Get GPS provider information
   */
  private static async getGPSProvider(): Promise<PhoneGPSProvider> {
    const deviceId = Device.osBuildId || Device.modelId || 'unknown';

    return {
      id: `phone_${deviceId}`,
      name: `${Device.manufacturer} ${Device.modelName}`,
      type: 'phone',
      isActive: true,
      deviceId,
      osType: Platform.OS as 'ios' | 'android',
      appVersion: '1.0.0', // TODO: Get from app.json
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Get tracking configuration
   */
  private static getTrackingConfig(): LocationTrackingConfig {
    return {
      // Update every 30 seconds while moving
      updateIntervalMs: 30000,
      
      // But not more frequently than every 10 seconds
      fastestUpdateIntervalMs: 10000,
      
      // Minimum 50 meters movement to trigger update
      distanceFilterMeters: 50,
      
      // Target 100m accuracy
      desiredAccuracyMeters: 100,
      
      // iOS optimizations
      pausesUpdatesAutomatically: true,
      showsBackgroundLocationIndicator: true,
      activityType: 'automotive',
      
      // Android foreground service
      foregroundServiceTitle: 'Vone Trucking - Active Delivery',
      foregroundServiceMessage: 'Tracking your delivery location',
    };
  }
}

/**
 * Define background location task
 * This runs even when app is closed or in background
 */
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('[BackgroundTask] Location update error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    await LocationTrackingService['processLocationUpdate'](locations);
  }
});
