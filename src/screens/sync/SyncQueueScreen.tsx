/**
 * Sync Queue Screen
 * 
 * Displays pending and failed sync items with retry options
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { offlineSyncService } from '../../services/sync';
import type { SyncQueueItem, SyncStatus } from '../../types/sync.types';

export const SyncQueueScreen: React.FC = () => {
  const [pendingItems, setPendingItems] = useState<SyncQueueItem[]>([]);
  const [failedItems, setFailedItems] = useState<SyncQueueItem[]>([]);
  const [status, setStatus] = useState<SyncStatus>({
    is_online: true,
    is_syncing: false,
    pending_items_count: 0,
    failed_items_count: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'failed'>('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pending, failed, syncStatus] = await Promise.all([
        offlineSyncService.getPendingItems(),
        offlineSyncService.getFailedItems(),
        offlineSyncService.getSyncStatus(),
      ]);

      setPendingItems(pending);
      setFailedItems(failed);
      setStatus(syncStatus);
    } catch (error) {
      console.error('[SyncQueue] Failed to load data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSyncNow = async () => {
    try {
      if (!status.is_online) {
        Alert.alert('Offline', 'Cannot sync while offline. Please check your connection.');
        return;
      }

      Alert.alert(
        'Sync Now',
        'Start syncing all pending items?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sync',
            onPress: async () => {
              const result = await offlineSyncService.syncNow();
              Alert.alert(
                'Sync Complete',
                `Synced: ${result.synced_count}\nFailed: ${result.failed_count}\nConflicts: ${result.conflict_count}`
              );
              await loadData();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sync');
    }
  };

  const handleRetry = async (itemId: string) => {
    try {
      await offlineSyncService.retryFailedItem(itemId);
      Alert.alert('Success', 'Item queued for retry');
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to retry');
    }
  };

  const handleClearSynced = async () => {
    Alert.alert(
      'Clear Synced Items',
      'Remove all successfully synced items from the queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await offlineSyncService.clearSyncedItems();
            await loadData();
          },
        },
      ]
    );
  };

  const renderQueueItem = ({ item }: { item: SyncQueueItem }) => {
    const isActive = activeTab === 'pending';
    
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIcon}>
            <Ionicons
              name={getEntityIcon(item.entity_type)}
              size={24}
              color={isActive ? '#007AFF' : '#FF3B30'}
            />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{formatEntityType(item.entity_type)}</Text>
            <Text style={styles.itemSubtitle}>
              {item.operation.toUpperCase()} · Priority {item.priority}
            </Text>
          </View>
          <View style={styles.itemBadge}>
            <Text style={[styles.badgeText, { color: isActive ? '#007AFF' : '#FF3B30' }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.itemDetails}>
          <Text style={styles.detailText}>
            Entity ID: {item.entity_id}
          </Text>
          <Text style={styles.detailText}>
            Created: {formatDate(item.created_locally_at)}
          </Text>
          {item.last_sync_attempt_at && (
            <Text style={styles.detailText}>
              Last attempt: {formatDate(item.last_sync_attempt_at)} (Attempt {item.sync_attempts})
            </Text>
          )}
          {item.error_message && (
            <Text style={[styles.detailText, styles.errorText]}>
              Error: {item.error_message}
            </Text>
          )}
        </View>

        {item.status === 'failed' && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => handleRetry(item.id)}
          >
            <Ionicons name="refresh" size={16} color="#FFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const items = activeTab === 'pending' ? pendingItems : failedItems;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <Ionicons
            name={status.is_online ? 'cloud-done' : 'cloud-offline'}
            size={24}
            color={status.is_online ? '#34C759' : '#FF3B30'}
          />
          <Text style={styles.statusText}>
            {status.is_online ? 'Online' : 'Offline'}
          </Text>
          {status.is_syncing && (
            <Text style={styles.syncingText}> · Syncing...</Text>
          )}
        </View>

        <View style={styles.countsRow}>
          <View style={styles.countItem}>
            <Text style={styles.countValue}>{status.pending_items_count}</Text>
            <Text style={styles.countLabel}>Pending</Text>
          </View>
          <View style={styles.countItem}>
            <Text style={[styles.countValue, { color: '#FF3B30' }]}>
              {status.failed_items_count}
            </Text>
            <Text style={styles.countLabel}>Failed</Text>
          </View>
        </View>

        {status.last_sync_at && (
          <Text style={styles.lastSyncText}>
            Last sync: {formatDate(status.last_sync_at)}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleSyncNow}
          disabled={!status.is_online || status.is_syncing}
        >
          <Ionicons name="sync" size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>Sync Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleClearSynced}
        >
          <Ionicons name="trash-outline" size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Clear Synced</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending ({pendingItems.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'failed' && styles.activeTab]}
          onPress={() => setActiveTab('failed')}
        >
          <Text style={[styles.tabText, activeTab === 'failed' && styles.activeTabText]}>
            Failed ({failedItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Queue List */}
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={renderQueueItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={activeTab === 'pending' ? 'checkmark-circle' : 'alert-circle'}
              size={64}
              color="#C7C7CC"
            />
            <Text style={styles.emptyText}>
              {activeTab === 'pending'
                ? 'No pending items'
                : 'No failed items'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

// Helper functions
const getEntityIcon = (entityType: string): any => {
  const icons: Record<string, any> = {
    trip: 'car',
    fuel_record: 'water',
    proof_of_delivery: 'document-text',
    location_update: 'location',
    expense: 'cash',
    payroll: 'wallet',
    cash_advance: 'card',
    photo: 'image',
    receipt: 'receipt',
  };
  return icons[entityType] || 'document';
};

const formatEntityType = (entityType: string): string => {
  return entityType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  syncingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  countsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },
  countItem: {
    alignItems: 'center',
  },
  countValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  countLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#007AFF',
  },
  listContent: {
    padding: 16,
  },
  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  itemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  itemDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  detailText: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 4,
  },
  errorText: {
    color: '#FF3B30',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
});
