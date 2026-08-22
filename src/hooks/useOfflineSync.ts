/**
 * Offline Sync Hook
 * 
 * Custom hook for easy integration with offline sync service
 */

import { useEffect, useState, useCallback } from 'react';
import { offlineSyncService } from '../services/sync';
import type { SyncEntityType, SyncOperation, SyncStatus, SyncQueueItem } from '../types/sync.types';

export const useOfflineSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    is_online: true,
    is_syncing: false,
    pending_items_count: 0,
    failed_items_count: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load sync status
  const loadStatus = useCallback(async () => {
    try {
      const status = await offlineSyncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('[useOfflineSync] Failed to load status:', error);
    }
  }, []);

  // Auto-refresh status every 5 seconds
  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, [loadStatus]);

  /**
   * Queue an item for sync
   */
  const queueForSync = useCallback(
    async (
      entityType: SyncEntityType,
      operation: SyncOperation,
      entityId: string,
      data: any,
      userId: string,
      priority?: number
    ): Promise<SyncQueueItem | null> => {
      try {
        setIsLoading(true);
        const queueItem = await offlineSyncService.queueForSync(
          entityType,
          operation,
          entityId,
          data,
          userId,
          priority
        );
        await loadStatus();
        return queueItem;
      } catch (error: any) {
        console.error('[useOfflineSync] Failed to queue item:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [loadStatus]
  );

  /**
   * Queue a photo for upload
   */
  const queuePhotoUpload = useCallback(
    async (
      localUri: string,
      entityType: 'receipt' | 'delivery_photo' | 'incident_photo' | 'signature',
      entityId: string
    ) => {
      try {
        setIsLoading(true);
        const photoItem = await offlineSyncService.queuePhotoUpload(
          localUri,
          entityType,
          entityId
        );
        await loadStatus();
        return photoItem;
      } catch (error) {
        console.error('[useOfflineSync] Failed to queue photo:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [loadStatus]
  );

  /**
   * Manually trigger sync
   */
  const syncNow = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await offlineSyncService.syncNow();
      await loadStatus();
      return result;
    } catch (error) {
      console.error('[useOfflineSync] Failed to sync:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadStatus]);

  /**
   * Get pending items
   */
  const getPendingItems = useCallback(async () => {
    try {
      return await offlineSyncService.getPendingItems();
    } catch (error) {
      console.error('[useOfflineSync] Failed to get pending items:', error);
      return [];
    }
  }, []);

  /**
   * Get failed items
   */
  const getFailedItems = useCallback(async () => {
    try {
      return await offlineSyncService.getFailedItems();
    } catch (error) {
      console.error('[useOfflineSync] Failed to get failed items:', error);
      return [];
    }
  }, []);

  /**
   * Retry a failed item
   */
  const retryFailedItem = useCallback(
    async (itemId: string) => {
      try {
        setIsLoading(true);
        await offlineSyncService.retryFailedItem(itemId);
        await loadStatus();
      } catch (error) {
        console.error('[useOfflineSync] Failed to retry item:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [loadStatus]
  );

  return {
    syncStatus,
    isLoading,
    queueForSync,
    queuePhotoUpload,
    syncNow,
    getPendingItems,
    getFailedItems,
    retryFailedItem,
    refresh: loadStatus,
  };
};

/**
 * Convenience hook for queuing trip data
 */
export const useTripSync = (userId: string) => {
  const { queueForSync } = useOfflineSync();

  const createTrip = useCallback(
    async (tripData: any) => {
      return await queueForSync('trip', 'create', tripData.id, tripData, userId, 8);
    },
    [queueForSync, userId]
  );

  const updateTrip = useCallback(
    async (tripId: string, tripData: any) => {
      return await queueForSync('trip', 'update', tripId, tripData, userId, 7);
    },
    [queueForSync, userId]
  );

  return { createTrip, updateTrip };
};

/**
 * Convenience hook for queuing fuel records
 */
export const useFuelSync = (userId: string) => {
  const { queueForSync } = useOfflineSync();

  const createFuelRecord = useCallback(
    async (fuelData: any) => {
      return await queueForSync('fuel_record', 'create', fuelData.id, fuelData, userId, 6);
    },
    [queueForSync, userId]
  );

  return { createFuelRecord };
};

/**
 * Convenience hook for queuing proof of delivery
 */
export const useDeliverySync = (userId: string) => {
  const { queueForSync, queuePhotoUpload } = useOfflineSync();

  const createProofOfDelivery = useCallback(
    async (podData: any) => {
      return await queueForSync(
        'proof_of_delivery',
        'create',
        podData.id,
        podData,
        userId,
        9 // High priority
      );
    },
    [queueForSync, userId]
  );

  const uploadDeliveryPhoto = useCallback(
    async (localUri: string, deliveryId: string) => {
      return await queuePhotoUpload(localUri, 'delivery_photo', deliveryId);
    },
    [queuePhotoUpload]
  );

  const uploadSignature = useCallback(
    async (localUri: string, deliveryId: string) => {
      return await queuePhotoUpload(localUri, 'signature', deliveryId);
    },
    [queuePhotoUpload]
  );

  return { createProofOfDelivery, uploadDeliveryPhoto, uploadSignature };
};

/**
 * Convenience hook for queuing location updates
 */
export const useLocationSync = (userId: string) => {
  const { queueForSync } = useOfflineSync();

  const updateLocation = useCallback(
    async (locationData: any) => {
      return await queueForSync(
        'location_update',
        'create',
        locationData.id,
        locationData,
        userId,
        4 // Lower priority
      );
    },
    [queueForSync, userId]
  );

  return { updateLocation };
};

/**
 * Convenience hook for queuing expenses
 */
export const useExpenseSync = (userId: string) => {
  const { queueForSync, queuePhotoUpload } = useOfflineSync();

  const createExpense = useCallback(
    async (expenseData: any) => {
      return await queueForSync('expense', 'create', expenseData.id, expenseData, userId, 6);
    },
    [queueForSync, userId]
  );

  const uploadReceipt = useCallback(
    async (localUri: string, expenseId: string) => {
      return await queuePhotoUpload(localUri, 'receipt', expenseId);
    },
    [queuePhotoUpload]
  );

  return { createExpense, uploadReceipt };
};
