/**
 * Sync Status Badge Component
 * Shows offline, pending sync, syncing, and failed sync states
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import type { SyncStatus } from '../../types/driver-porter.types';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  onRetry?: () => void;
  compact?: boolean;
}

export function SyncStatusBadge({ status, onRetry, compact = false }: SyncStatusBadgeProps) {
  const { colors } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: 'check-circle',
          color: colors.success,
          bgColor: colors.successLight,
          label: 'Synced',
        };
      case 'pending':
        return {
          icon: 'clock-outline',
          color: colors.warning,
          bgColor: colors.warningLight,
          label: 'Pending',
        };
      case 'syncing':
        return {
          icon: 'sync',
          color: colors.info,
          bgColor: colors.infoLight,
          label: 'Syncing',
        };
      case 'failed':
        return {
          icon: 'alert-circle',
          color: colors.error,
          bgColor: colors.errorLight,
          label: 'Failed',
        };
      case 'offline':
        return {
          icon: 'cloud-off-outline',
          color: colors.textSecondary,
          bgColor: colors.border,
          label: 'Offline',
        };
      default:
        return {
          icon: 'help-circle',
          color: colors.textSecondary,
          bgColor: colors.border,
          label: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();

  if (!config) {
    return null;
  }

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: config.bgColor }]}>
        <MaterialCommunityIcons name={config.icon as any} size={16} color={config.color} />
      </View>
    );
  }

  if (status === 'failed' && onRetry) {
    return (
      <TouchableOpacity
        style={[styles.badge, { backgroundColor: config.bgColor }]}
        onPress={onRetry}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name={config.icon as any} size={18} color={config.color} />
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
        <MaterialCommunityIcons name="refresh" size={16} color={config.color} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <MaterialCommunityIcons name={config.icon as any} size={18} color={config.color} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  compactBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
