/**
 * Location Tracking Card Component
 * Shows tracking status and GPS health in driver app
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../common/Card';
import type { GPSHealth, LocationCoordinates } from '../../types/location.types';

interface LocationTrackingCardProps {
  isTracking: boolean;
  gpsHealth: GPSHealth | null;
  currentLocation: LocationCoordinates | null;
  onRequestPermissions?: () => void;
  onShowPrivacyInfo?: () => void;
  hasRequiredPermissions: boolean;
}

export function LocationTrackingCard({
  isTracking,
  gpsHealth,
  currentLocation,
  onRequestPermissions,
  onShowPrivacyInfo,
  hasRequiredPermissions,
}: LocationTrackingCardProps) {
  const { colors } = useTheme();

  const getStatusIcon = () => {
    if (!hasRequiredPermissions) {
      return { name: 'map-marker-off', color: colors.error };
    }
    if (!isTracking) {
      return { name: 'map-marker-outline', color: colors.textSecondary };
    }
    if (gpsHealth?.status === 'unavailable') {
      return { name: 'map-marker-alert', color: colors.error };
    }
    if (gpsHealth?.status === 'weak') {
      return { name: 'map-marker-alert', color: colors.warning };
    }
    return { name: 'map-marker-check', color: colors.success };
  };

  const getStatusText = () => {
    if (!hasRequiredPermissions) {
      return 'Location permission required';
    }
    if (!isTracking) {
      return 'Tracking inactive';
    }
    if (gpsHealth?.status === 'unavailable') {
      return 'GPS unavailable';
    }
    if (gpsHealth?.status === 'weak') {
      return 'Weak GPS signal';
    }
    return 'Tracking active';
  };

  const getStatusColor = () => {
    if (!hasRequiredPermissions || gpsHealth?.status === 'unavailable') {
      return colors.error;
    }
    if (!isTracking) {
      return colors.textSecondary;
    }
    if (gpsHealth?.status === 'weak') {
      return colors.warning;
    }
    return colors.success;
  };

  const statusIcon = getStatusIcon();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name={statusIcon.name as any}
            size={24}
            color={statusIcon.color}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>
              Location Tracking
            </Text>
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          {isTracking && (
            <ActivityIndicator size="small" color={colors.success} />
          )}
        </View>
      </View>

      {/* GPS Health Details */}
      {isTracking && gpsHealth && (
        <View style={styles.healthSection}>
          <View style={styles.healthRow}>
            <MaterialCommunityIcons
              name="signal"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>
              Signal:
            </Text>
            <Text style={[styles.healthValue, { color: colors.text }]}>
              {gpsHealth.signal_strength || 'Unknown'}
            </Text>
          </View>

          {gpsHealth.accuracy_meters !== undefined && (
            <View style={styles.healthRow}>
              <MaterialCommunityIcons
                name="crosshairs-gps"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>
                Accuracy:
              </Text>
              <Text style={[styles.healthValue, { color: colors.text }]}>
                ±{Math.round(gpsHealth.accuracy_meters)}m
              </Text>
            </View>
          )}

          {currentLocation && (
            <View style={styles.healthRow}>
              <MaterialCommunityIcons
                name="speedometer"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.healthLabel, { color: colors.textSecondary }]}>
                Speed:
              </Text>
              <Text style={[styles.healthValue, { color: colors.text }]}>
                {currentLocation.speed
                  ? `${Math.round((currentLocation.speed * 3.6))} km/h`
                  : '0 km/h'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Permission Required */}
      {!hasRequiredPermissions && (
        <View style={styles.permissionSection}>
          <Text style={[styles.permissionText, { color: colors.text }]}>
            Location tracking is required for active deliveries. This helps dispatch
            monitor your progress and provide accurate ETAs.
          </Text>

          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={onRequestPermissions}
          >
            <MaterialCommunityIcons name="map-marker-check" size={20} color="#fff" />
            <Text style={styles.permissionButtonText}>Enable Location</Text>
          </TouchableOpacity>

          {onShowPrivacyInfo && (
            <TouchableOpacity
              style={styles.privacyLink}
              onPress={onShowPrivacyInfo}
            >
              <MaterialCommunityIcons
                name="shield-check"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.privacyLinkText, { color: colors.primary }]}>
                Your privacy is protected
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* GPS Issues Warning */}
      {isTracking && gpsHealth?.status !== 'healthy' && (
        <View
          style={[
            styles.warningBox,
            {
              backgroundColor:
                gpsHealth?.status === 'unavailable'
                  ? colors.errorLight
                  : colors.warningLight,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="alert"
            size={20}
            color={
              gpsHealth?.status === 'unavailable' ? colors.error : colors.warning
            }
          />
          <Text
            style={[
              styles.warningText,
              {
                color:
                  gpsHealth?.status === 'unavailable'
                    ? colors.error
                    : colors.warning,
              },
            ]}
          >
            {gpsHealth?.status === 'unavailable'
              ? 'GPS signal lost. Move to an open area for better signal.'
              : 'Weak GPS signal. Location updates may be delayed.'}
          </Text>
        </View>
      )}

      {/* Tracking Info */}
      {isTracking && (
        <View style={styles.infoSection}>
          <MaterialCommunityIcons
            name="information"
            size={14}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Tracking will stop automatically when trip is completed
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  status: {
    fontSize: 13,
    fontWeight: '500',
  },
  healthSection: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthLabel: {
    fontSize: 13,
  },
  healthValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  permissionSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  permissionText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  privacyLinkText: {
    fontSize: 13,
    fontWeight: '500',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    gap: 10,
    marginTop: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
});
