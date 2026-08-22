/**
 * Sync Status Indicator Component
 * 
 * Shows current sync status with pending/failed items count
 * Small indicator that can be displayed in header/toolbar
 */

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { offlineSyncService } from '../../services/sync';
import type { SyncStatus } from '../../types/sync.types';

interface SyncStatusIndicatorProps {
  onPress?: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ onPress }) => {
  const [status, setStatus] = useState<SyncStatus>({
    is_online: true,
    is_syncing: false,
    pending_items_count: 0,
    failed_items_count: 0,
  });

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const syncStatus = await offlineSyncService.getSyncStatus();
      setStatus(syncStatus);
    } catch (error) {
      console.error('[SyncStatusIndicator] Failed to load status:', error);
    }
  };

  const getStatusIcon = () => {
    if (status.is_syncing) {
      return <ActivityIndicator size="small" color="#007AFF" />;
    }

    if (!status.is_online) {
      return <Ionicons name="cloud-offline" size={20} color="#FF3B30" />;
    }

    if (status.failed_items_count > 0) {
      return <Ionicons name="warning" size={20} color="#FF9500" />;
    }

    if (status.pending_items_count > 0) {
      return <Ionicons name="sync" size={20} color="#007AFF" />;
    }

    return <Ionicons name="cloud-done" size={20} color="#34C759" />;
  };

  const getStatusText = () => {
    if (status.is_syncing) {
      return 'Syncing...';
    }

    if (!status.is_online) {
      return 'Offline';
    }

    if (status.failed_items_count > 0) {
      return `${status.failed_items_count} failed`;
    }

    if (status.pending_items_count > 0) {
      return `${status.pending_items_count} pending`;
    }

    return 'Synced';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.content}>
        {getStatusIcon()}
        <Text style={styles.text}>{getStatusText()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },
});
