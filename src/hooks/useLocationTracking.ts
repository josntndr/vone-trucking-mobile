/**
 * Location Tracking Hook
 * React hook for managing location tracking in components
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { LocationPermissionManager } from '../services/location/LocationPermissionManager';
import { LocationTrackingService } from '../services/location/LocationTrackingService';
import type {
  LocationPermissions,
  LocationCoordinates,
  GPSHealth,
} from '../types/location.types';

export interface UseLocationTrackingReturn {
  // Permissions
  permissions: LocationPermissions | null;
  hasRequiredPermissions: boolean;
  requestPermissions: () => Promise<void>;
  showPrivacyInfo: () => void;
  
  // Tracking status
  isTracking: boolean;
  activeTripId: string | null;
  
  // Actions
  startTracking: (tripId: string, truckId: string, driverId: string) => Promise<boolean>;
  stopTracking: () => Promise<void>;
  
  // Current location
  currentLocation: LocationCoordinates | null;
  refreshLocation: () => Promise<void>;
  
  // GPS health
  gpsHealth: GPSHealth | null;
  checkGPSHealth: () => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

export function useLocationTracking(): UseLocationTrackingReturn {
  const [permissions, setPermissions] = useState<LocationPermissions | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [gpsHealth, setGpsHealth] = useState<GPSHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial state
  useEffect(() => {
    loadInitialState();
  }, []);

  // Check GPS health periodically when tracking
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      checkGPSHealth();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isTracking]);

  const loadInitialState = async () => {
    try {
      // Check permissions
      const perms = await LocationPermissionManager.getPermissionStatus();
      setPermissions(perms);

      // Check tracking status
      const status = await LocationTrackingService.getTrackingStatus();
      setIsTracking(status.isTracking);
      setActiveTripId(status.tripId);

      // Get current location if permitted
      if (perms.foreground === 'granted') {
        const location = await LocationTrackingService.getCurrentLocation();
        setCurrentLocation(location);
      }

      // Check GPS health
      const health = await LocationTrackingService.checkGPSHealth();
      setGpsHealth(health);
    } catch (err) {
      console.error('[useLocationTracking] Failed to load initial state:', err);
    }
  };

  const requestPermissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const perms = await LocationPermissionManager.requestAllPermissions();
      setPermissions(perms);

      if (perms.foreground !== 'granted' || perms.background !== 'granted') {
        setError('Location permissions not granted');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request permissions';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const showPrivacyInfo = () => {
    LocationPermissionManager.showPrivacyExplanation();
  };

  const startTracking = async (
    tripId: string,
    truckId: string,
    driverId: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Check permissions first
      const hasPerms = await LocationPermissionManager.hasRequiredPermissions();
      if (!hasPerms) {
        Alert.alert(
          'Location Permission Required',
          'Please grant location permissions to start tracking.',
          [
            {
              text: 'Grant Permission',
              onPress: async () => {
                await requestPermissions();
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return false;
      }

      // Check for mock locations
      const isMock = await LocationPermissionManager.isMockLocationEnabled();
      if (isMock) {
        LocationPermissionManager.showMockLocationWarning();
        // Continue anyway but flag it
      }

      // Start tracking
      const result = await LocationTrackingService.startTracking(
        tripId,
        truckId,
        driverId
      );

      if (result.success) {
        setIsTracking(true);
        setActiveTripId(tripId);
        
        // Get initial location
        await refreshLocation();
        await checkGPSHealth();
        
        return true;
      } else {
        setError(result.error || 'Failed to start tracking');
        return false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start tracking';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const stopTracking = async () => {
    try {
      setLoading(true);
      setError(null);

      await LocationTrackingService.stopTracking();

      setIsTracking(false);
      setActiveTripId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop tracking';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    try {
      const location = await LocationTrackingService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (err) {
      console.error('[useLocationTracking] Failed to refresh location:', err);
    }
  };

  const checkGPSHealth = async () => {
    try {
      const health = await LocationTrackingService.checkGPSHealth();
      setGpsHealth(health);

      // Show warning if GPS is weak or unavailable
      if (health.status === 'weak' && isTracking) {
        // Don't spam alerts, just update state
        console.warn('[useLocationTracking] Weak GPS signal');
      } else if (health.status === 'unavailable' && isTracking) {
        console.error('[useLocationTracking] GPS unavailable');
      }
    } catch (err) {
      console.error('[useLocationTracking] Failed to check GPS health:', err);
    }
  };

  const hasRequiredPermissions = 
    permissions?.foreground === 'granted' && 
    permissions?.background === 'granted';

  return {
    permissions,
    hasRequiredPermissions,
    requestPermissions,
    showPrivacyInfo,
    
    isTracking,
    activeTripId,
    
    startTracking,
    stopTracking,
    
    currentLocation,
    refreshLocation,
    
    gpsHealth,
    checkGPSHealth,
    
    loading,
    error,
  };
}
