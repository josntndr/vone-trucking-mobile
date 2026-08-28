// @ts-nocheck
/**
 * GPS Health Monitor Service
 * 
 * Monitors GPS signal health, detects issues, and triggers alerts
 * for both driver app and operator dashboard.
 * 
 * Features:
 * - Signal strength monitoring
 * - Accuracy degradation detection
 * - GPS unavailability alerts
 * - Stale location detection
 * - Mock location detection
 * - Alert throttling to prevent spam
 * - Historical health tracking
 */

import { LocationUpdate, GPSHealth } from '../../types/location.types';
import * as Location from 'expo-location';

export type GPSAlertType = 
  | 'weak_signal'
  | 'poor_accuracy'
  | 'gps_unavailable'
  | 'stale_location'
  | 'mock_location_detected'
  | 'signal_restored'
  | 'accuracy_improved';

export interface GPSAlert {
  type: GPSAlertType;
  severity: 'info' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  truckId?: string;
  driverId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface GPSHealthConfig {
  // Alert thresholds
  weakSignalThreshold: number;      // Below 3 satellites
  poorAccuracyThreshold: number;    // Above 50 meters
  staleLocationTimeout: number;     // 5 minutes without update
  
  // Alert throttling
  alertThrottleInterval: number;    // Min time between same alert (ms)
  maxAlertsPerHour: number;         // Rate limiting
  
  // Health check intervals
  healthCheckInterval: number;      // Check every 30 seconds
  historyRetentionHours: number;    // Keep 24 hours of history
}

interface GPSHealthState {
  lastLocation?: LocationUpdate;
  lastHealthCheck: Date;
  lastAlertByType: Map<GPSAlertType, Date>;
  alertCount: number;
  alertCountResetTime: Date;
  healthHistory: GPSHealth[];
}

const DEFAULT_CONFIG: GPSHealthConfig = {
  weakSignalThreshold: 3,
  poorAccuracyThreshold: 50,
  staleLocationTimeout: 5 * 60 * 1000, // 5 minutes
  alertThrottleInterval: 2 * 60 * 1000, // 2 minutes
  maxAlertsPerHour: 10,
  healthCheckInterval: 30 * 1000, // 30 seconds
  historyRetentionHours: 24,
};

export class GPSHealthMonitor {
  private config: GPSHealthConfig;
  private state: GPSHealthState;
  private healthCheckTimer?: ReturnType<typeof setInterval>;
  private alertCallbacks: Array<(alert: GPSAlert) => void> = [];
  private healthCallbacks: Array<(health: GPSHealth) => void> = [];

  constructor(config?: Partial<GPSHealthConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      lastHealthCheck: new Date(),
      lastAlertByType: new Map(),
      alertCount: 0,
      alertCountResetTime: new Date(),
      healthHistory: [],
    };
  }

  /**
   * Start monitoring GPS health
   */
  startMonitoring(): void {
    if (this.healthCheckTimer) {
      return; // Already monitoring
    }

    console.log('[GPSHealthMonitor] Starting GPS health monitoring');
    
    // Initial health check
    this.performHealthCheck();

    // Schedule periodic health checks
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Stop monitoring GPS health
   */
  stopMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
      console.log('[GPSHealthMonitor] Stopped GPS health monitoring');
    }
  }

  /**
   * Update with new location data
   */
  updateLocation(location: LocationUpdate): void {
    this.state.lastLocation = location;
    this.state.lastHealthCheck = new Date();

    // Calculate GPS health from location
    const health = this.calculateGPSHealth(location);
    
    // Add to history
    this.addToHistory(health);

    // Check for alerts
    this.checkForAlerts(location, health);

    // Notify health callbacks
    this.notifyHealthCallbacks(health);
  }

  /**
   * Calculate GPS health from location data
   */
  private calculateGPSHealth(location: LocationUpdate): GPSHealth {
    const signal_strength = this.calculateSignalStrength(location);
    const quality = this.determineQuality(location, signal_strength);

    return {
      status: 'healthy',
      signal_strength,
      accuracy_meters: location.accuracy || 0,
      last_fix_age_seconds: 0,
      satellite_count: location.satelliteCount || 0,
      quality,
      // Aliases for backward compatibility
      signalStrength: signal_strength,
      accuracy: location.accuracy || 0,
      lastUpdate: new Date(location.timestamp).toISOString(),
      isAvailable: true,
      satelliteCount: location.satelliteCount || 0,
    };
  }

  /**
   * Calculate signal strength (1-5 scale)
   */
  private calculateSignalStrength(location: LocationUpdate): number {
    const satellites = location.satelliteCount || 0;
    
    if (satellites >= 8) return 5; // Excellent
    if (satellites >= 6) return 4; // Good
    if (satellites >= 4) return 3; // Fair
    if (satellites >= 2) return 2; // Poor
    return 1; // Very poor
  }

  /**
   * Determine GPS quality
   */
  private determineQuality(
    location: LocationUpdate,
    signal_strength: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    const accuracy = location.accuracy || 999;

    if (signal_strength >= 4 && accuracy <= 10) return 'excellent';
    if (signal_strength >= 3 && accuracy <= 30) return 'good';
    if (signal_strength >= 2 && accuracy <= 100) return 'fair';
    return 'poor';
  }

  /**
   * Check for alert conditions
   */
  private checkForAlerts(location: LocationUpdate, health: GPSHealth): void {
    // Check for mock location
    if (location.is_mock || location.isMock) {
      this.triggerAlert({
        type: 'mock_location_detected',
        severity: 'error',
        message: 'Mock location detected. GPS data may be falsified.',
        timestamp: new Date(),
        location: location.latitude && location.longitude ? {
          latitude: location.latitude,
          longitude: location.longitude,
        } : undefined,
      });
    }

    // Check for weak signal
    const signalStrength = health.signal_strength || health.signalStrength || 0;
    const satelliteCount = health.satellite_count || health.satelliteCount || 0;
    const accuracy = health.accuracy_meters || health.accuracy || 0;

    if (signalStrength < this.config.weakSignalThreshold) {
      this.triggerAlert({
        type: 'weak_signal',
        severity: 'warning',
        message: `Weak GPS signal (${satelliteCount} satellites). Location accuracy may be reduced.`,
        timestamp: new Date(),
        location: location.latitude && location.longitude ? {
          latitude: location.latitude,
          longitude: location.longitude,
        } : undefined,
      });
    } else if (this.wasRecentlyWeak()) {
      // Signal restored
      this.triggerAlert({
        type: 'signal_restored',
        severity: 'info',
        message: 'GPS signal restored.',
        timestamp: new Date(),
        location: location.latitude && location.longitude ? {
          latitude: location.latitude,
          longitude: location.longitude,
        } : undefined,
      });
    }

    // Check for poor accuracy
    if (accuracy > this.config.poorAccuracyThreshold) {
      this.triggerAlert({
        type: 'poor_accuracy',
        severity: 'warning',
        message: `GPS accuracy is poor (±${Math.round(accuracy)}m). Location may be inaccurate.`,
        timestamp: new Date(),
        location: location.latitude && location.longitude ? {
          latitude: location.latitude,
          longitude: location.longitude,
        } : undefined,
      });
    }
  }

  /**
   * Perform periodic health check
   */
  private async performHealthCheck(): Promise<void> {
    const now = new Date();
    
    // Check for stale location
    if (this.state.lastLocation) {
      const locationAge = now.getTime() - new Date(this.state.lastLocation.timestamp).getTime();
      
      if (locationAge > this.config.staleLocationTimeout) {
        this.triggerAlert({
          type: 'stale_location',
          severity: 'warning',
          message: `No GPS update for ${Math.round(locationAge / 60000)} minutes.`,
          timestamp: now,
        });
      }
    }

    // Check if GPS is available
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        this.triggerAlert({
          type: 'gps_unavailable',
          severity: 'error',
          message: 'Location permission not granted. GPS tracking unavailable.',
          timestamp: now,
        });
        return;
      }

      const enabled = await Location.hasServicesEnabledAsync();
      
      if (!enabled) {
        this.triggerAlert({
          type: 'gps_unavailable',
          severity: 'error',
          message: 'Location services disabled. Please enable GPS in device settings.',
          timestamp: now,
        });
      }
    } catch (error) {
      console.error('[GPSHealthMonitor] Health check error:', error);
    }

    // Clean up old history
    this.cleanupHistory();

    // Reset alert count if hour has passed
    const hoursSinceReset = (now.getTime() - this.state.alertCountResetTime.getTime()) / (1000 * 60 * 60);
    if (hoursSinceReset >= 1) {
      this.state.alertCount = 0;
      this.state.alertCountResetTime = now;
    }
  }

  /**
   * Trigger an alert with throttling
   */
  private triggerAlert(alert: GPSAlert): void {
    // Check rate limiting
    if (this.state.alertCount >= this.config.maxAlertsPerHour) {
      console.log('[GPSHealthMonitor] Alert rate limit reached, skipping alert:', alert.type);
      return;
    }

    // Check throttling for this alert type
    const lastAlert = this.state.lastAlertByType.get(alert.type);
    if (lastAlert) {
      const timeSinceLastAlert = Date.now() - lastAlert.getTime();
      if (timeSinceLastAlert < this.config.alertThrottleInterval) {
        console.log('[GPSHealthMonitor] Alert throttled:', alert.type);
        return;
      }
    }

    // Record alert
    this.state.lastAlertByType.set(alert.type, alert.timestamp);
    this.state.alertCount++;

    console.log('[GPSHealthMonitor] Triggering alert:', alert);

    // Notify callbacks
    this.notifyAlertCallbacks(alert);
  }

  /**
   * Check if signal was recently weak
   */
  private wasRecentlyWeak(): boolean {
    const lastWeakSignal = this.state.lastAlertByType.get('weak_signal');
    if (!lastWeakSignal) return false;

    const timeSinceWeak = Date.now() - lastWeakSignal.getTime();
    return timeSinceWeak < 5 * 60 * 1000; // Within last 5 minutes
  }

  /**
   * Add health data to history
   */
  private addToHistory(health: GPSHealth): void {
    this.state.healthHistory.push(health);

    // Limit history size (keep recent entries)
    const maxEntries = (this.config.historyRetentionHours * 60 * 60) / 
                      (this.config.healthCheckInterval / 1000);
    
    if (this.state.healthHistory.length > maxEntries) {
      this.state.healthHistory = this.state.healthHistory.slice(-maxEntries);
    }
  }

  /**
   * Clean up old history entries
   */
  private cleanupHistory(): void {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - this.config.historyRetentionHours);
    const cutoffISO = cutoffTime.toISOString();

    this.state.healthHistory = this.state.healthHistory.filter(h => {
      if (!h.lastUpdate) return false;
      const updateTime = typeof h.lastUpdate === 'string' ? h.lastUpdate : h.lastUpdate.toISOString();
      return updateTime > cutoffISO;
    });
  }

  /**
   * Get current GPS health
   */
  getCurrentHealth(): GPSHealth | null {
    if (!this.state.lastLocation) {
      return {
        status: 'unavailable',
        signal_strength: 0,
        accuracy_meters: 0,
        last_fix_age_seconds: 0,
        satellite_count: 0,
        quality: 'poor',
        // Aliases
        signalStrength: 0,
        accuracy: 0,
        lastUpdate: new Date().toISOString(),
        isAvailable: false,
        satelliteCount: 0,
      };
    }

    return this.calculateGPSHealth(this.state.lastLocation);
  }

  /**
   * Get health history
   */
  getHealthHistory(hours: number = 1): GPSHealth[] {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);
    const cutoffISO = cutoffTime.toISOString();

    return this.state.healthHistory.filter(h => {
      if (!h.lastUpdate) return false;
      const updateTime = typeof h.lastUpdate === 'string' ? h.lastUpdate : h.lastUpdate.toISOString();
      return updateTime > cutoffISO;
    });
  }

  /**
   * Get average signal strength over time
   */
  getAverageSignalStrength(hours: number = 1): number {
    const history = this.getHealthHistory(hours);
    if (history.length === 0) return 0;

    const sum = history.reduce((acc, h) => acc + (h.signal_strength || h.signalStrength || 0), 0);
    return sum / history.length;
  }

  /**
   * Get average accuracy over time
   */
  getAverageAccuracy(hours: number = 1): number {
    const history = this.getHealthHistory(hours);
    if (history.length === 0) return 0;

    const sum = history.reduce((acc, h) => acc + (h.accuracy_meters || h.accuracy || 0), 0);
    return sum / history.length;
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (alert: GPSAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.alertCallbacks = this.alertCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Register health update callback
   */
  onHealthUpdate(callback: (health: GPSHealth) => void): () => void {
    this.healthCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.healthCallbacks = this.healthCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify alert callbacks
   */
  private notifyAlertCallbacks(alert: GPSAlert): void {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('[GPSHealthMonitor] Alert callback error:', error);
      }
    });
  }

  /**
   * Notify health callbacks
   */
  private notifyHealthCallbacks(health: GPSHealth): void {
    this.healthCallbacks.forEach(callback => {
      try {
        callback(health);
      } catch (error) {
        console.error('[GPSHealthMonitor] Health callback error:', error);
      }
    });
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.state = {
      lastHealthCheck: new Date(),
      lastAlertByType: new Map(),
      alertCount: 0,
      alertCountResetTime: new Date(),
      healthHistory: [],
    };
  }
}

// Export singleton instance
export const gpsHealthMonitor = new GPSHealthMonitor();

