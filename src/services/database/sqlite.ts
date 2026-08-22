/**
 * SQLite Database Configuration
 * Local database for offline data storage
 */

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'vone_trucking.db';

/**
 * Open database connection
 */
export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  return SQLite.openDatabaseAsync(DATABASE_NAME);
};

/**
 * Initialize database schema
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    const db = await openDatabase();

    // Create tables for offline data caching
    await db.execAsync(`
      -- User data cache
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        role TEXT,
        created_at TEXT,
        synced_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Offline queue for pending operations
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL,
        table_name TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        retry_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending'
      );

      -- App metadata
      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

/**
 * Clear all database tables
 */
export const clearDatabase = async (): Promise<void> => {
  try {
    const db = await openDatabase();
    
    await db.execAsync(`
      DELETE FROM users;
      DELETE FROM sync_queue;
      DELETE FROM app_metadata;
    `);

    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Failed to clear database:', error);
    throw error;
  }
};

/**
 * Drop all tables (for debugging)
 */
export const resetDatabase = async (): Promise<void> => {
  try {
    const db = await openDatabase();
    
    await db.execAsync(`
      DROP TABLE IF EXISTS users;
      DROP TABLE IF EXISTS sync_queue;
      DROP TABLE IF EXISTS app_metadata;
    `);

    console.log('Database reset successfully');
    await initializeDatabase();
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async (): Promise<{
  userCount: number;
  queueCount: number;
  pendingSync: number;
}> => {
  try {
    const db = await openDatabase();

    const userCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM users'
    );

    const queueCount = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM sync_queue'
    );

    const pendingSync = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'"
    );

    return {
      userCount: userCount?.count || 0,
      queueCount: queueCount?.count || 0,
      pendingSync: pendingSync?.count || 0,
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return { userCount: 0, queueCount: 0, pendingSync: 0 };
  }
};
