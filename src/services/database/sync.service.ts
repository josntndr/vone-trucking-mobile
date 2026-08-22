/**
 * Sync Service
 * Handles synchronization between local SQLite and remote Supabase
 */

import { openDatabase } from './sqlite';

export interface SyncQueueItem {
  id: number;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  tableName: string;
  data: string;
  createdAt: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

/**
 * Add operation to sync queue
 */
export const addToSyncQueue = async (
  operation: SyncQueueItem['operation'],
  tableName: string,
  data: any
): Promise<void> => {
  try {
    const db = await openDatabase();
    
    await db.runAsync(
      `INSERT INTO sync_queue (operation, table_name, data) VALUES (?, ?, ?)`,
      [operation, tableName, JSON.stringify(data)]
    );

    console.log(`Added ${operation} operation for ${tableName} to sync queue`);
  } catch (error) {
    console.error('Failed to add to sync queue:', error);
    throw error;
  }
};

/**
 * Get pending sync items
 */
export const getPendingSyncItems = async (): Promise<SyncQueueItem[]> => {
  try {
    const db = await openDatabase();
    
    const items = await db.getAllAsync<SyncQueueItem>(
      `SELECT * FROM sync_queue WHERE status = 'pending' ORDER BY created_at ASC`
    );

    return items;
  } catch (error) {
    console.error('Failed to get pending sync items:', error);
    return [];
  }
};

/**
 * Mark sync item as completed
 */
export const markSyncCompleted = async (id: number): Promise<void> => {
  try {
    const db = await openDatabase();
    
    await db.runAsync(
      `UPDATE sync_queue SET status = 'completed' WHERE id = ?`,
      [id]
    );
  } catch (error) {
    console.error('Failed to mark sync completed:', error);
    throw error;
  }
};

/**
 * Mark sync item as failed
 */
export const markSyncFailed = async (id: number): Promise<void> => {
  try {
    const db = await openDatabase();
    
    await db.runAsync(
      `UPDATE sync_queue SET status = 'failed', retry_count = retry_count + 1 WHERE id = ?`,
      [id]
    );
  } catch (error) {
    console.error('Failed to mark sync failed:', error);
    throw error;
  }
};

/**
 * Clear completed sync items
 */
export const clearCompletedSyncItems = async (): Promise<void> => {
  try {
    const db = await openDatabase();
    
    await db.runAsync(`DELETE FROM sync_queue WHERE status = 'completed'`);
    
    console.log('Cleared completed sync items');
  } catch (error) {
    console.error('Failed to clear completed sync items:', error);
    throw error;
  }
};

/**
 * Process sync queue (to be called when online)
 */
export const processSyncQueue = async (): Promise<{
  processed: number;
  failed: number;
}> => {
  try {
    const pendingItems = await getPendingSyncItems();
    let processed = 0;
    let failed = 0;

    for (const item of pendingItems) {
      try {
        // TODO: Implement actual sync logic with Supabase
        // This is a placeholder for future implementation
        console.log(`Processing sync item: ${item.operation} on ${item.tableName}`);
        
        await markSyncCompleted(item.id);
        processed++;
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        await markSyncFailed(item.id);
        failed++;
      }
    }

    return { processed, failed };
  } catch (error) {
    console.error('Failed to process sync queue:', error);
    return { processed: 0, failed: 0 };
  }
};

/**
 * Get metadata value
 */
export const getMetadata = async (key: string): Promise<string | null> => {
  try {
    const db = await openDatabase();
    
    const result = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM app_metadata WHERE key = ?`,
      [key]
    );

    return result?.value || null;
  } catch (error) {
    console.error('Failed to get metadata:', error);
    return null;
  }
};

/**
 * Set metadata value
 */
export const setMetadata = async (key: string, value: string): Promise<void> => {
  try {
    const db = await openDatabase();
    
    await db.runAsync(
      `INSERT OR REPLACE INTO app_metadata (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [key, value]
    );
  } catch (error) {
    console.error('Failed to set metadata:', error);
    throw error;
  }
};
