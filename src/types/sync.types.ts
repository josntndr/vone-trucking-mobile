/**
 * Offline Synchronization Type Definitions
 * 
 * Types for offline queue management, sync status, and conflict resolution
 */

export type SyncEntityType =
  | 'trip'
  | 'fuel_record'
  | 'proof_of_delivery'
  | 'location_update'
  | 'expense'
  | 'payroll'
  | 'cash_advance'
  | 'photo'
  | 'receipt';

export type SyncOperation = 'create' | 'update' | 'delete';

export type SyncItemStatus = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';

export interface SyncQueueItem {
  id: string;
  entity_type: SyncEntityType;
  operation: SyncOperation;
  entity_id: string;
  
  // Data payload
  data: any;
  
  // Metadata
  created_locally_at: string;
  user_id: string;
  device_id: string;
  
  // Sync status
  status: SyncItemStatus;
  sync_attempts: number;
  last_sync_attempt_at?: string;
  synced_at?: string;
  
  // Error tracking
  error_message?: string;
  error_details?: any;
  
  // Conflict resolution
  conflict_data?: {
    server_version: any;
    local_version: any;
    resolved: boolean;
    resolution_strategy?: 'server_wins' | 'local_wins' | 'merge' | 'manual';
  };
  
  // Priority
  priority: number; // Higher number = higher priority
  
  // Dependencies
  depends_on?: string[]; // IDs of queue items that must sync first
}

export interface SyncResult {
  success: boolean;
  synced_count: number;
  failed_count: number;
  conflict_count: number;
  errors: Array<{
    item_id: string;
    error: string;
  }>;
}

export interface SyncStatus {
  is_online: boolean;
  is_syncing: boolean;
  pending_items_count: number;
  failed_items_count: number;
  last_sync_at?: string;
  next_sync_at?: string;
}

export interface PhotoUploadQueueItem {
  id: string;
  local_uri: string;
  entity_type: 'receipt' | 'delivery_photo' | 'incident_photo' | 'signature';
  entity_id: string;
  
  status: 'pending' | 'uploading' | 'uploaded' | 'failed';
  upload_attempts: number;
  uploaded_url?: string;
  
  created_at: string;
  uploaded_at?: string;
  error_message?: string;
}

export interface ConflictResolutionRule {
  entity_type: SyncEntityType;
  strategy: 'server_wins' | 'local_wins' | 'merge' | 'manual';
  merge_fields?: string[]; // Fields to merge if strategy is 'merge'
}

export interface SyncConfiguration {
  enabled: boolean;
  auto_sync_interval_minutes: number;
  sync_on_app_foreground: boolean;
  sync_on_network_change: boolean;
  max_sync_attempts: number;
  batch_size: number;
  wifi_only: boolean;
  
  conflict_resolution_rules: ConflictResolutionRule[];
  
  // Retry strategy
  retry_delay_seconds: number;
  exponential_backoff: boolean;
}

export const DEFAULT_SYNC_CONFIG: SyncConfiguration = {
  enabled: true,
  auto_sync_interval_minutes: 15,
  sync_on_app_foreground: true,
  sync_on_network_change: true,
  max_sync_attempts: 3,
  batch_size: 20,
  wifi_only: false,
  
  conflict_resolution_rules: [
    // Server wins for trip assignments
    { entity_type: 'trip', strategy: 'server_wins' },
    // Local wins for location updates
    { entity_type: 'location_update', strategy: 'local_wins' },
    // Merge for fuel records
    { entity_type: 'fuel_record', strategy: 'merge', merge_fields: ['notes', 'validation_issues'] },
    // Manual for payroll conflicts
    { entity_type: 'payroll', strategy: 'manual' },
  ],
  
  retry_delay_seconds: 30,
  exponential_backoff: true,
};

export interface DuplicateDetection {
  entity_type: SyncEntityType;
  entity_id: string;
  fingerprint: string; // Hash of critical fields
  created_at: string;
}
