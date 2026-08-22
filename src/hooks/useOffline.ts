/**
 * Offline Hook
 * Manages offline state and sync operations
 */

import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { processSyncQueue, getPendingSyncItems } from '../services/database';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  /**
   * Update pending sync count
   */
  const updatePendingCount = useCallback(async () => {
    try {
      const items = await getPendingSyncItems();
      setPendingCount(items.length);
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }, []);

  /**
   * Sync pending operations
   */
  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) {
      return { success: false, message: 'Cannot sync while offline or already syncing' };
    }

    setIsSyncing(true);
    
    try {
      const result = await processSyncQueue();
      await updatePendingCount();
      
      return {
        success: true,
        processed: result.processed,
        failed: result.failed,
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return { success: false, message: 'Sync failed' };
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updatePendingCount]);

  /**
   * Monitor network connectivity
   */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? true;
      setIsOnline(online);

      // Auto-sync when coming back online
      if (online && !isSyncing && pendingCount > 0) {
        sync();
      }
    });

    // Initial check
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? true);
    });

    // Update pending count on mount
    updatePendingCount();

    return () => {
      unsubscribe();
    };
  }, [sync, isSyncing, pendingCount, updatePendingCount]);

  return {
    isOnline,
    isOffline: !isOnline,
    isSyncing,
    pendingCount,
    sync,
    updatePendingCount,
  };
};
