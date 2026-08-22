/**
 * Offline Synchronization Service
 * 
 * Handles offline queue management, automatic syncing, conflict resolution,
 * and duplicate prevention for all data types
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import type {
  SyncQueueItem,
  SyncEntityType,
  SyncOperation,
  SyncResult,
  SyncStatus,
  PhotoUploadQueueItem,
  SyncConfiguration,
  DEFAULT_SYNC_CONFIG,
  DuplicateDetection,
} from '../../types/sync.types';

const SYNC_QUEUE_KEY = '@vone_sync_queue';
const PHOTO_QUEUE_KEY = '@vone_photo_queue';
const SYNC_STATUS_KEY = '@vone_sync_status';
const SYNC_CONFIG_KEY = '@vone_sync_config';
const DUPLICATE_DETECTION_KEY = '@vone_duplicate_detection';

export class OfflineSyncService {
  private config: SyncConfiguration;
  private isSyncing: boolean = false;
  private syncTimer: NodeJS.Timeout | null = null;
  private appStateSubscription: any = null;
  private netInfoSubscription: any = null;

  constructor() {
    this.config = DEFAULT_SYNC_CONFIG;
  }

  /**
   * Initialize sync service
   */
  async initialize(userId: string): Promise<void> {
    try {
      // Load configuration
      await this.loadConfiguration();

      // Setup app state listener
      this.setupAppStateListener();

      // Setup network listener
      this.setupNetworkListener();

      // Start auto-sync timer
      if (this.config.enabled) {
        this.startAutoSync();
      }

      // Perform initial sync
      await this.syncNow();

      console.log('[Sync] Initialized successfully');
    } catch (error) {
      console.error('[Sync] Failed to initialize:', error);
    }
  }

  /**
   * Cleanup on app close
   */
  cleanup(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    if (this.netInfoSubscription) {
      this.netInfoSubscription();
      this.netInfoSubscription = null;
    }
  }

  /**
   * Add item to sync queue
   */
  async queueForSync(
    entityType: SyncEntityType,
    operation: SyncOperation,
    entityId: string,
    data: any,
    userId: string,
    priority: number = 5
  ): Promise<SyncQueueItem> {
    try {
      // Check for duplicates
      const isDuplicate = await this.isDuplicate(entityType, entityId, data);
      if (isDuplicate) {
        console.log('[Sync] Duplicate detected, skipping:', entityType, entityId);
        throw new Error('Duplicate item detected');
      }

      const queueItem: SyncQueueItem = {
        id: this.generateId(),
        entity_type: entityType,
        operation,
        entity_id: entityId,
        data,
        created_locally_at: new Date().toISOString(),
        user_id: userId,
        device_id: await this.getDeviceId(),
        status: 'pending',
        sync_attempts: 0,
        priority,
      };

      // Save to queue
      const queue = await this.getQueue();
      queue.push(queueItem);
      await this.saveQueue(queue);

      // Record for duplicate detection
      await this.recordForDuplicateDetection(entityType, entityId, data);

      // Update status
      await this.updateSyncStatus();

      // Try to sync immediately if online
      if (await this.isOnline()) {
        this.syncNow(); // Fire and forget
      }

      return queueItem;
    } catch (error) {
      console.error('[Sync] Failed to queue item:', error);
      throw error;
    }
  }

  /**
   * Queue photo for upload
   */
  async queuePhotoUpload(
    localUri: string,
    entityType: PhotoUploadQueueItem['entity_type'],
    entityId: string
  ): Promise<PhotoUploadQueueItem> {
    try {
      const photoItem: PhotoUploadQueueItem = {
        id: this.generateId(),
        local_uri: localUri,
        entity_type: entityType,
        entity_id: entityId,
        status: 'pending',
        upload_attempts: 0,
        created_at: new Date().toISOString(),
      };

      const queue = await this.getPhotoQueue();
      queue.push(photoItem);
      await this.savePhotoQueue(queue);

      // Try to upload immediately if online
      if (await this.isOnline()) {
        this.syncPhotos(); // Fire and forget
      }

      return photoItem;
    } catch (error) {
      console.error('[Sync] Failed to queue photo:', error);
      throw error;
    }
  }

  /**
   * Perform sync now
   */
  async syncNow(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('[Sync] Already syncing, skipping');
      return {
        success: false,
        synced_count: 0,
        failed_count: 0,
        conflict_count: 0,
        errors: [{ item_id: 'n/a', error: 'Already syncing' }],
      };
    }

    if (!(await this.isOnline())) {
      console.log('[Sync] Offline, skipping sync');
      return {
        success: false,
        synced_count: 0,
        failed_count: 0,
        conflict_count: 0,
        errors: [{ item_id: 'n/a', error: 'Offline' }],
      };
    }

    try {
      this.isSyncing = true;
      await this.updateSyncStatus();

      const result: SyncResult = {
        success: true,
        synced_count: 0,
        failed_count: 0,
        conflict_count: 0,
        errors: [],
      };

      // Sync data queue
      const dataResult = await this.syncDataQueue();
      result.synced_count += dataResult.synced_count;
      result.failed_count += dataResult.failed_count;
      result.conflict_count += dataResult.conflict_count;
      result.errors.push(...dataResult.errors);

      // Sync photos
      const photoResult = await this.syncPhotos();
      result.synced_count += photoResult.synced_count;
      result.failed_count += photoResult.failed_count;
      result.errors.push(...photoResult.errors);

      result.success = result.failed_count === 0 && result.conflict_count === 0;

      console.log('[Sync] Sync completed:', result);

      return result;
    } catch (error) {
      console.error('[Sync] Sync failed:', error);
      return {
        success: false,
        synced_count: 0,
        failed_count: 0,
        conflict_count: 0,
        errors: [{ item_id: 'n/a', error: String(error) }],
      };
    } finally {
      this.isSyncing = false;
      await this.updateSyncStatus();
    }
  }

  /**
   * Sync data queue
   */
  private async syncDataQueue(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      synced_count: 0,
      failed_count: 0,
      conflict_count: 0,
      errors: [],
    };

    try {
      const queue = await this.getQueue();
      const pendingItems = queue
        .filter(item => item.status === 'pending' || item.status === 'failed')
        .filter(item => item.sync_attempts < this.config.max_sync_attempts)
        .sort((a, b) => b.priority - a.priority) // Higher priority first
        .slice(0, this.config.batch_size);

      for (const item of pendingItems) {
        try {
          // Check dependencies
          if (item.depends_on && item.depends_on.length > 0) {
            const dependenciesMet = await this.checkDependencies(item.depends_on);
            if (!dependenciesMet) {
              console.log('[Sync] Dependencies not met for:', item.id);
              continue;
            }
          }

          // Mark as syncing
          item.status = 'syncing';
          item.sync_attempts += 1;
          item.last_sync_attempt_at = new Date().toISOString();
          await this.updateQueueItem(item);

          // Perform sync (mock - replace with actual API call)
          const syncSuccess = await this.syncItem(item);

          if (syncSuccess) {
            item.status = 'synced';
            item.synced_at = new Date().toISOString();
            result.synced_count++;
          } else {
            item.status = 'failed';
            item.error_message = 'Sync failed';
            result.failed_count++;
            result.errors.push({ item_id: item.id, error: 'Sync failed' });
          }

          await this.updateQueueItem(item);
        } catch (error: any) {
          item.status = 'failed';
          item.error_message = error.message;
          result.failed_count++;
          result.errors.push({ item_id: item.id, error: error.message });
          await this.updateQueueItem(item);
        }
      }

      // Clean up synced items older than 7 days
      await this.cleanupOldItems();

      return result;
    } catch (error) {
      console.error('[Sync] Failed to sync data queue:', error);
      return result;
    }
  }

  /**
   * Sync photos
   */
  private async syncPhotos(): Promise<Omit<SyncResult, 'conflict_count'>> {
    const result = {
      success: true,
      synced_count: 0,
      failed_count: 0,
      errors: [] as Array<{ item_id: string; error: string }>,
    };

    try {
      const photoQueue = await this.getPhotoQueue();
      const pendingPhotos = photoQueue
        .filter(photo => photo.status === 'pending' || photo.status === 'failed')
        .filter(photo => photo.upload_attempts < this.config.max_sync_attempts)
        .slice(0, this.config.batch_size);

      for (const photo of pendingPhotos) {
        try {
          photo.status = 'uploading';
          photo.upload_attempts += 1;
          await this.updatePhotoQueueItem(photo);

          // Upload photo (mock - replace with actual upload)
          const uploadedUrl = await this.uploadPhoto(photo.local_uri);

          if (uploadedUrl) {
            photo.status = 'uploaded';
            photo.uploaded_url = uploadedUrl;
            photo.uploaded_at = new Date().toISOString();
            result.synced_count++;

            // Delete local file after successful upload
            try {
              await FileSystem.deleteAsync(photo.local_uri, { idempotent: true });
            } catch (deleteError) {
              console.warn('[Sync] Failed to delete local photo:', deleteError);
            }
          } else {
            photo.status = 'failed';
            photo.error_message = 'Upload failed';
            result.failed_count++;
            result.errors.push({ item_id: photo.id, error: 'Upload failed' });
          }

          await this.updatePhotoQueueItem(photo);
        } catch (error: any) {
          photo.status = 'failed';
          photo.error_message = error.message;
          result.failed_count++;
          result.errors.push({ item_id: photo.id, error: error.message });
          await this.updatePhotoQueueItem(photo);
        }
      }

      return result;
    } catch (error) {
      console.error('[Sync] Failed to sync photos:', error);
      return result;
    }
  }

  /**
   * Sync individual item (mock - replace with actual API)
   */
  private async syncItem(item: SyncQueueItem): Promise<boolean> {
    // Mock implementation
    // In production, make actual API call based on entity_type and operation
    console.log('[Sync] Syncing item:', item.entity_type, item.operation, item.entity_id);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate 90% success rate
    return Math.random() > 0.1;
  }

  /**
   * Upload photo (mock - replace with actual upload)
   */
  private async uploadPhoto(localUri: string): Promise<string | null> {
    // Mock implementation
    // In production, upload to cloud storage (S3, Firebase Storage, etc.)
    console.log('[Sync] Uploading photo:', localUri);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Return mock URL
    return `https://storage.example.com/${this.generateId()}.jpg`;
  }

  /**
   * Check if dependencies are met
   */
  private async checkDependencies(dependencyIds: string[]): Promise<boolean> {
    const queue = await this.getQueue();
    
    for (const depId of dependencyIds) {
      const depItem = queue.find(item => item.id === depId);
      if (!depItem || depItem.status !== 'synced') {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Duplicate detection
   */
  private async isDuplicate(
    entityType: SyncEntityType,
    entityId: string,
    data: any
  ): Promise<boolean> {
    try {
      const fingerprint = await this.generateFingerprint(data);
      const duplicates = await this.getDuplicateDetectionRecords();

      // Check for exact match in last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      return duplicates.some(dup => 
        dup.entity_type === entityType &&
        dup.entity_id === entityId &&
        dup.fingerprint === fingerprint &&
        new Date(dup.created_at) > oneDayAgo
      );
    } catch (error) {
      console.error('[Sync] Failed to check duplicate:', error);
      return false;
    }
  }

  private async recordForDuplicateDetection(
    entityType: SyncEntityType,
    entityId: string,
    data: any
  ): Promise<void> {
    try {
      const fingerprint = await this.generateFingerprint(data);
      const record: DuplicateDetection = {
        entity_type: entityType,
        entity_id: entityId,
        fingerprint,
        created_at: new Date().toISOString(),
      };

      const records = await this.getDuplicateDetectionRecords();
      records.push(record);

      // Keep only last 1000 records
      const recentRecords = records.slice(-1000);
      
      await AsyncStorage.setItem(DUPLICATE_DETECTION_KEY, JSON.stringify(recentRecords));
    } catch (error) {
      console.error('[Sync] Failed to record for duplicate detection:', error);
    }
  }

  private async generateFingerprint(data: any): Promise<string> {
    // Generate hash of critical fields
    const criticalData = JSON.stringify(data);
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      criticalData
    );
    return hash;
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const queue = await this.getQueue();
      const isOnline = await this.isOnline();

      const pendingItems = queue.filter(item => 
        item.status === 'pending' || item.status === 'syncing'
      ).length;

      const failedItems = queue.filter(item => 
        item.status === 'failed'
      ).length;

      const lastSyncedItem = queue
        .filter(item => item.status === 'synced')
        .sort((a, b) => 
          new Date(b.synced_at || 0).getTime() - new Date(a.synced_at || 0).getTime()
        )[0];

      return {
        is_online: isOnline,
        is_syncing: this.isSyncing,
        pending_items_count: pendingItems,
        failed_items_count: failedItems,
        last_sync_at: lastSyncedItem?.synced_at,
        next_sync_at: this.getNextSyncTime(),
      };
    } catch (error) {
      console.error('[Sync] Failed to get sync status:', error);
      return {
        is_online: false,
        is_syncing: false,
        pending_items_count: 0,
        failed_items_count: 0,
      };
    }
  }

  /**
   * Get pending items for display
   */
  async getPendingItems(): Promise<SyncQueueItem[]> {
    const queue = await this.getQueue();
    return queue
      .filter(item => item.status === 'pending' || item.status === 'syncing')
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get failed items
   */
  async getFailedItems(): Promise<SyncQueueItem[]> {
    const queue = await this.getQueue();
    return queue.filter(item => item.status === 'failed');
  }

  /**
   * Retry failed item
   */
  async retryFailedItem(itemId: string): Promise<void> {
    const queue = await this.getQueue();
    const item = queue.find(i => i.id === itemId);
    
    if (item && item.status === 'failed') {
      item.status = 'pending';
      item.sync_attempts = 0;
      item.error_message = undefined;
      await this.saveQueue(queue);
      
      // Try to sync immediately
      this.syncNow();
    }
  }

  /**
   * Clear all synced items
   */
  async clearSyncedItems(): Promise<void> {
    const queue = await this.getQueue();
    const unsynced = queue.filter(item => item.status !== 'synced');
    await this.saveQueue(unsynced);
  }

  /**
   * Network and app state listeners
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && this.config.sync_on_app_foreground) {
        console.log('[Sync] App became active, triggering sync');
        this.syncNow();
      }
    });
  }

  private setupNetworkListener(): void {
    this.netInfoSubscription = NetInfo.addEventListener(state => {
      if (state.isConnected && this.config.sync_on_network_change) {
        console.log('[Sync] Network connected, triggering sync');
        this.syncNow();
      }
    });
  }

  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    const intervalMs = this.config.auto_sync_interval_minutes * 60 * 1000;
    this.syncTimer = setInterval(() => {
      console.log('[Sync] Auto-sync timer triggered');
      this.syncNow();
    }, intervalMs);
  }

  /**
   * Helper methods
   */
  private async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      
      if (this.config.wifi_only) {
        return state.isConnected === true && state.type === 'wifi';
      }
      
      return state.isConnected === true;
    } catch (error) {
      console.error('[Sync] Failed to check online status:', error);
      return false;
    }
  }

  private async getDeviceId(): Promise<string> {
    // In production, use a proper device ID
    return 'device_' + Math.random().toString(36).substr(2, 9);
  }

  private getNextSyncTime(): string | undefined {
    if (!this.config.enabled) {
      return undefined;
    }
    
    const nextSync = new Date(Date.now() + this.config.auto_sync_interval_minutes * 60 * 1000);
    return nextSync.toISOString();
  }

  private async cleanupOldItems(): Promise<void> {
    try {
      const queue = await this.getQueue();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const recentItems = queue.filter(item => {
        if (item.status === 'synced' && item.synced_at) {
          return new Date(item.synced_at) > sevenDaysAgo;
        }
        return true; // Keep non-synced items
      });

      await this.saveQueue(recentItems);
    } catch (error) {
      console.error('[Sync] Failed to cleanup old items:', error);
    }
  }

  private async updateSyncStatus(): Promise<void> {
    const status = await this.getSyncStatus();
    await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
  }

  /**
   * Storage helpers
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(SYNC_CONFIG_KEY);
      if (data) {
        this.config = { ...DEFAULT_SYNC_CONFIG, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('[Sync] Failed to load configuration:', error);
    }
  }

  private async getQueue(): Promise<SyncQueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Sync] Failed to get queue:', error);
      return [];
    }
  }

  private async saveQueue(queue: SyncQueueItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('[Sync] Failed to save queue:', error);
    }
  }

  private async updateQueueItem(item: SyncQueueItem): Promise<void> {
    const queue = await this.getQueue();
    const index = queue.findIndex(i => i.id === item.id);
    if (index >= 0) {
      queue[index] = item;
      await this.saveQueue(queue);
    }
  }

  private async getPhotoQueue(): Promise<PhotoUploadQueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(PHOTO_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Sync] Failed to get photo queue:', error);
      return [];
    }
  }

  private async savePhotoQueue(queue: PhotoUploadQueueItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PHOTO_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('[Sync] Failed to save photo queue:', error);
    }
  }

  private async updatePhotoQueueItem(item: PhotoUploadQueueItem): Promise<void> {
    const queue = await this.getPhotoQueue();
    const index = queue.findIndex(i => i.id === item.id);
    if (index >= 0) {
      queue[index] = item;
      await this.savePhotoQueue(queue);
    }
  }

  private async getDuplicateDetectionRecords(): Promise<DuplicateDetection[]> {
    try {
      const data = await AsyncStorage.getItem(DUPLICATE_DETECTION_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Sync] Failed to get duplicate detection records:', error);
      return [];
    }
  }

  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncService();
