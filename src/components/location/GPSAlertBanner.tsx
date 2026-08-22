/**
 * GPS Alert Banner Component
 * 
 * Displays GPS health alerts to the driver with appropriate styling
 * based on severity (info, warning, error).
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GPSAlert, gpsHealthMonitor } from '../../services/location/GPSHealthMonitor';

interface GPSAlertBannerProps {
  autoHideDuration?: number; // Auto-hide after X ms (0 = no auto-hide)
  showHistory?: boolean;      // Show alert history button
  maxVisible?: number;        // Max alerts to show at once
}

export const GPSAlertBanner: React.FC<GPSAlertBannerProps> = ({
  autoHideDuration = 10000,
  showHistory = false,
  maxVisible = 3,
}) => {
  const [alerts, setAlerts] = useState<GPSAlert[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Subscribe to GPS alerts
    const unsubscribe = gpsHealthMonitor.onAlert((alert) => {
      setAlerts(prev => {
        // Add new alert
        const updated = [alert, ...prev].slice(0, maxVisible);
        
        // Auto-hide info alerts after duration
        if (autoHideDuration > 0 && alert.severity === 'info') {
          setTimeout(() => {
            setAlerts(current => current.filter(a => a !== alert));
          }, autoHideDuration);
        }
        
        return updated;
      });

      // Animate in
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });

    return unsubscribe;
  }, [autoHideDuration, maxVisible]);

  const dismissAlert = (alert: GPSAlert) => {
    setAlerts(prev => prev.filter(a => a !== alert));
  };

  const clearAll = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setAlerts([]);
    });
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {alerts.map((alert, index) => (
        <View
          key={`${alert.type}-${alert.timestamp.getTime()}`}
          style={[
            styles.alertCard,
            styles[`${alert.severity}Alert`],
            index > 0 && styles.alertSpacing,
          ]}
        >
          <View style={styles.alertIcon}>
            <Ionicons
              name={getIconName(alert.type, alert.severity)}
              size={24}
              color={getIconColor(alert.severity)}
            />
          </View>
          
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, styles[`${alert.severity}Text`]]}>
              {getAlertTitle(alert.type)}
            </Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <Text style={styles.alertTime}>
              {formatTime(alert.timestamp)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => dismissAlert(alert)}
            accessibilityLabel="Dismiss alert"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      ))}

      {alerts.length > 1 && (
        <TouchableOpacity
          style={styles.clearAllButton}
          onPress={clearAll}
          accessibilityLabel="Clear all alerts"
          accessibilityRole="button"
        >
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

function getIconName(
  type: GPSAlert['type'],
  severity: GPSAlert['severity']
): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'weak_signal':
      return 'cellular-outline';
    case 'poor_accuracy':
      return 'location-outline';
    case 'gps_unavailable':
      return 'warning-outline';
    case 'stale_location':
      return 'time-outline';
    case 'mock_location_detected':
      return 'alert-circle-outline';
    case 'signal_restored':
      return 'checkmark-circle-outline';
    case 'accuracy_improved':
      return 'checkmark-circle-outline';
    default:
      return severity === 'error' ? 'alert-circle-outline' : 'information-circle-outline';
  }
}

function getIconColor(severity: GPSAlert['severity']): string {
  switch (severity) {
    case 'error':
      return '#DC2626';
    case 'warning':
      return '#F59E0B';
    case 'info':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
}

function getAlertTitle(type: GPSAlert['type']): string {
  switch (type) {
    case 'weak_signal':
      return 'Weak GPS Signal';
    case 'poor_accuracy':
      return 'Poor GPS Accuracy';
    case 'gps_unavailable':
      return 'GPS Unavailable';
    case 'stale_location':
      return 'Location Update Delayed';
    case 'mock_location_detected':
      return 'Mock Location Detected';
    case 'signal_restored':
      return 'GPS Signal Restored';
    case 'accuracy_improved':
      return 'GPS Accuracy Improved';
    default:
      return 'GPS Alert';
  }
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
  },
  alertSpacing: {
    marginTop: 8,
  },
  infoAlert: {
    borderLeftColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  warningAlert: {
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  errorAlert: {
    borderLeftColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  alertIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    color: '#1E40AF',
  },
  warningText: {
    color: '#B45309',
  },
  errorText: {
    color: '#991B1B',
  },
  alertMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 20,
  },
  alertTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearAllButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});
