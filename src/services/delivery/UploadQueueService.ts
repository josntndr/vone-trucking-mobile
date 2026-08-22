/**
 * Upload Queue Service
 * 
 * Manages offline photo/document upload queue with retry logic,
 * compression, and automatic sync when online.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Network from 'expo-network';
import type {
  UploadQueueItem,
  UploadQueueStats,
  UploadQueueConfig,
  DEFAULT_UPLOAD_CONFIG,
} from '../../types/delivery.types';

const QUEUE_STORAGE_KEY = '@vone_upload_queue';
const SYNC_INTERVAL_MS = 30000; // 30 seconds

export class UploadQueueService {
  private config: UploadQueueConfig;
  private processingQueue: boolean = false;
  private syncInterval?: NodeJS.Timeout;

  constructor(config?: Partial<UploadQueueConfig>) {
    this.config = { ...DEFAULT_UPLOAD_CONFIG, ...config };
  }

  /**
   * Add item to upload queue
   */
  async addToQueue(
    localUri: string,
    type: UploadQueueItem['type'],
    relatedType: 'pod' | 'incident',
    relatedId: string,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<UploadQueueItem> {
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    const item: UploadQueueItem = {
      id: this.generateQueueId(),
      type,
      local_uri: localUri,
      filename: this.extractFilename(localUri),
      mime_type: this.getMimeType(localUri),
      file_size: fileInfo.size || 0,
      related_type: relatedType,
      related_id: relatedId,
      status: 'pending',
      upload_progress: 0,
      retry_count: 0,
      max_retries: this.config.max_retries,
      priority,
      created_at: new Date().toISOString(),
    };

    // Compress if needed
    if (this.config.compress_photos && type === 'photo') {
      const compressed = await this.compressPhoto(item);
      if (compressed) {
        item.compressed_size = compressed.size;
        item.compression_ratio = compressed.size / item.file_size;
        item.local_uri = compressed.uri;
      }
    }

    // Add to queue
    await this.saveToQueue(item);

    // Try immediate upload if online
    if (await this.shouldAutoUpload()) {
      this.processQueue();
    }

    return item;
  }

  /**
   * Process upload queue
   */
  async processQueue(): Promise<void> {
    if (this.processingQueue) return;

    this.processingQueue = true;

    try {
      const queue = await this.getQueue();
      const pendingItems = queue
        .filter(item => item.status === 'pending' || item.status === 'failed')
        .sort((a, b) => {
          // Sort by priority then creation time
          const priorityOrder = { high: 0, normal: 1, low: 2 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

      const uploading = queue.filter(item => item.status === 'uploading').length;
      const available = this.config.max_concurrent_uploads - uploading;

      const itemsToProcess = pendingItems.slice(0, available);

      for (const item of itemsToProcess) {
        this.uploadItem(item);
      }
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Upload single item
   */
  private async uploadItem(item: UploadQueueItem): Promise<void> {
    try {
      // Update status
      await this.updateQueueItem(item.id, {
        status: 'uploading',
        started_at: new Date().toISOString(),
      });

      // TODO: Implement actual upload to cloud storage
      // For now, simulate upload
      const uploadedUrl = await this.simulateUpload(item);

      // Update as completed
      await this.updateQueueItem(item.id, {
        status: 'completed',
        upload_progress: 100,
        uploaded_url: uploadedUrl,
        completed_at: new Date().toISOString(),
      });

      console.log('[UploadQueue] Uploaded:', item.filename);
    } catch (error) {
      console.error('[UploadQueue] Upload failed:', error);

      // Update retry info
      const retryCount = item.retry_count + 1;
      const nextRetryAt = new Date(
        Date.now() + this.config.retry_delay_ms * Math.pow(2, retryCount)
      ).toISOString();

      await this.updateQueueItem(item.id, {
        status: retryCount >= item.max_retries ? 'failed' : 'pending',
        retry_count: retryCount,
        next_retry_at: nextRetryAt,
        error_message: error instanceof Error ? error.message : 'Upload failed',
        failed_at: retryCount >= item.max_retries ? new Date().toISOString() : undefined,
      });
    }
  }

  /**
   * Compress photo
   */
  private async compressPhoto(item: UploadQueueItem): Promise<{ uri: string; size: number } | null> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        item.local_uri,
        [{ resize: { width: this.config.max_photo_dimension } }],
        {
          compress: this.config.compression_quality,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const fileInfo = await FileSystem.getInfoAsync(result.uri);

      return {
        uri: result.uri,
        size: fileInfo.size || 0,
      };
    } catch (error) {
      console.error('[UploadQueue] Compression failed:', error);
      return null;
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<UploadQueueStats> {
    const queue = await this.getQueue();

    const totalSize = queue.reduce((sum, item) => sum + item.file_size, 0);
    const uploadedSize = queue
      .filter(item => item.status === 'completed')
      .reduce((sum, item) => sum + item.file_size, 0);

    return {
      total_items: queue.length,
      pending_items: queue.filter(i => i.status === 'pending').length,
      uploading_items: queue.filter(i => i.status === 'uploading').length,
      completed_items: queue.filter(i => i.status === 'completed').length,
      failed_items: queue.filter(i => i.status === 'failed').length,
      total_size_mb: totalSize / (1024 * 1024),
      uploaded_size_mb: uploadedSize / (1024 * 1024),
    };
  }

  /**
   * Start auto-sync
   */
  startAutoSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      this.processQueue();
    }, SYNC_INTERVAL_MS);

    console.log('[UploadQueue] Auto-sync started');
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
      console.log('[UploadQueue] Auto-sync stopped');
    }
  }

  /**
   * Clear completed items
   */
  async clearCompleted(): Promise<void> {
    const queue = await this.getQueue();
    const remaining = queue.filter(item => item.status !== 'completed');
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remaining));
  }

  /**
   * Check if should auto-upload
   */
  private async shouldAutoUpload(): Promise<boolean> {
    try {
      const networkState = await Network.getNetworkStateAsync();

      if (!networkState.isConnected) return false;

      if (networkState.type === Network.NetworkStateType.WIFI) {
        return this.config.auto_upload_on_wifi;
      }

      if (networkState.type === Network.NetworkStateType.CELLULAR) {
        return this.config.auto_upload_on_cellular;
      }

      return false;
    } catch (error) {
      console.error('[UploadQueue] Network check failed:', error);
      return false;
    }
  }

  /**
   * Get queue from storage
   */
  private async getQueue(): Promise<UploadQueueItem[]> {
    try {
      const queueJson = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return queueJson ? JSON.parse(queueJson) : [];
    } catch (error) {
      console.error('[UploadQueue] Failed to load queue:', error);
      return [];
    }
  }

  /**
   * Save item to queue
   */
  private async saveToQueue(item: UploadQueueItem): Promise<void> {
    const queue = await this.getQueue();
    queue.push(item);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }

  /**
   * Update queue item
   */
  private async updateQueueItem(
    itemId: string,
    updates: Partial<UploadQueueItem>
  ): Promise<void> {
    const queue = await this.getQueue();
    const index = queue.findIndex(item => item.id === itemId);

    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    }
  }

  /**
   * Simulate upload (TODO: Replace with actual cloud upload)
   */
  private async simulateUpload(item: UploadQueueItem): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return mock URL
    return `/uploads/${item.related_type}/${item.related_id}/${item.filename}`;
  }

  /**
   * Extract filename from URI
   */
  private extractFilename(uri: string): string {
    return uri.split('/').pop() || `file_${Date.now()}.jpg`;
  }

  /**
   * Get MIME type from URI
   */
  private getMimeType(uri: string): string {
    const ext = uri.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      pdf: 'application/pdf',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }

  /**
   * Generate queue item ID
   */
  private generateQueueId(): string {
    return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const uploadQueueService = new UploadQueueService();
