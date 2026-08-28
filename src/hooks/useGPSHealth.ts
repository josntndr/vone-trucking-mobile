/**
 * useGPSHealth Hook
 * 
 * React hook for accessing GPS health monitoring in components
 */

import { useState, useEffect, useCallback } from 'react';
import { GPSHealth } from '../types/location.types';
import { GPSAlert, gpsHealthMonitor } from '../services/location/GPSHealthMonitor';

interface UseGPSHealthResult {
  // Current health
  health: GPSHealth | null;
  
  // Recent alerts
  recentAlerts: GPSAlert[];
  
  // Statistics
  averageSignalStrength: number;
  averageAccuracy: number;
  
  // Status flags
  hasWeakSignal: boolean;
  hasPoorAccuracy: boolean;
  isHealthy: boolean;
  
  // Methods
  clearAlerts: () => void;
  getHistory: (hours: number) => GPSHealth[];
}

interface UseGPSHealthOptions {
  enableAlerts?: boolean;
  maxAlerts?: number;
  historyHours?: number;
}

export function useGPSHealth(options: UseGPSHealthOptions = {}): UseGPSHealthResult {
  const {
    enableAlerts = true,
    maxAlerts = 5,
    historyHours = 1,
  } = options;

  const [health, setHealth] = useState<GPSHealth | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<GPSAlert[]>([]);
  const [avgSignalStrength, setAvgSignalStrength] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);

  // Subscribe to health updates
  useEffect(() => {
    // Get initial health
    const initialHealth = gpsHealthMonitor.getCurrentHealth();
    setHealth(initialHealth);

    // Subscribe to updates
    const unsubscribeHealth = gpsHealthMonitor.onHealthUpdate((newHealth) => {
      setHealth(newHealth);
    });

    // Update statistics periodically
    const statsInterval = setInterval(() => {
      const signal = gpsHealthMonitor.getAverageSignalStrength(historyHours);
      const accuracy = gpsHealthMonitor.getAverageAccuracy(historyHours);
      setAvgSignalStrength(signal);
      setAvgAccuracy(accuracy);
    }, 30000); // Every 30 seconds

    return () => {
      unsubscribeHealth();
      clearInterval(statsInterval);
    };
  }, [historyHours]);

  // Subscribe to alerts
  useEffect(() => {
    if (!enableAlerts) return;

    const unsubscribeAlerts = gpsHealthMonitor.onAlert((alert) => {
      setRecentAlerts(prev => {
        // Add new alert
        const updated = [alert, ...prev];
        // Keep only recent alerts
        return updated.slice(0, maxAlerts);
      });
    });

    return unsubscribeAlerts;
  }, [enableAlerts, maxAlerts]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setRecentAlerts([]);
  }, []);

  // Get history
  const getHistory = useCallback((hours: number) => {
    return gpsHealthMonitor.getHealthHistory(hours);
  }, []);

  // Derived status flags
  const hasWeakSignal = health ? (health.signal_strength || health.signalStrength || 0) < 3 : false;
  const hasPoorAccuracy = health ? (health.accuracy_meters || health.accuracy || 0) > 50 : false;
  const isHealthy = health ? 
    (health.isAvailable ?? true) && 
    (health.signal_strength || health.signalStrength || 0) >= 3 && 
    (health.accuracy_meters || health.accuracy || 0) <= 50 : 
    false;

  return {
    health,
    recentAlerts,
    averageSignalStrength: avgSignalStrength,
    averageAccuracy: avgAccuracy,
    hasWeakSignal,
    hasPoorAccuracy,
    isHealthy,
    clearAlerts,
    getHistory,
  };
}
