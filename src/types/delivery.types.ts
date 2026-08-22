/**
 * Proof of Delivery and Incident Reporting Types
 * 
 * Type definitions for digital POD submissions, incident reports,
 * photo/document uploads, and offline queue management.
 */

// ============================================================================
// Proof of Delivery (POD)
// ============================================================================

/**
 * Item status for delivery tracking
 */
export type ItemStatus = 'delivered' | 'missing' | 'damaged' | 'returned' | 'rejected';

/**
 * Delivery item with status
 */
export interface DeliveryItem {
  id: string;
  product_name: string;
  quantity_ordered: number;
  quantity_delivered: number;
  status: ItemStatus;
  notes?: string;
  photo_url?: string;  // Photo of damaged/missing item
}

/**
 * GPS coordinates
 */
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: string;
}

/**
 * Photo attachment
 */
export interface PhotoAttachment {
  id: string;
  url?: string;           // Cloud URL after upload
  local_uri: string;      // Local file URI
  filename: string;
  type: 'receipt' | 'product' | 'damage' | 'signature' | 'general';
  uploaded: boolean;
  upload_progress?: number;
  file_size?: number;
  mime_type?: string;
  thumbnail_url?: string;
  captured_at: string;
}

/**
 * Digital signature
 */
export interface DigitalSignature {
  id: string;
  signature_data: string;  // Base64 image data
  signature_url?: string;  // Cloud URL after upload
  signer_name: string;
  signed_at: string;
  uploaded: boolean;
}

/**
 * Proof of Delivery submission
 */
export interface ProofOfDelivery {
  id: string;
  trip_id: string;
  stop_id: string;
  driver_id: string;
  porter_id?: string;      // If porter involved
  
  // Receiver information
  receiver_name: string;
  receiver_title?: string;
  receiver_phone?: string;
  receiver_email?: string;
  
  // Timing
  arrival_time: string;    // ISO timestamp
  completion_time: string; // ISO timestamp
  
  // Location
  delivery_location: string;
  gps_coordinates?: GPSCoordinates;
  location_verified: boolean;
  
  // Attachments
  receipt_photo?: PhotoAttachment;
  signature?: DigitalSignature;
  product_photos: PhotoAttachment[];
  additional_photos: PhotoAttachment[];
  
  // Delivery details
  items: DeliveryItem[];
  delivery_notes?: string;
  special_instructions?: string;
  
  // Item summaries
  total_items: number;
  items_delivered: number;
  items_missing: number;
  items_damaged: number;
  items_returned: number;
  items_rejected: number;
  
  // Status
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'correction_required';
  is_draft: boolean;
  
  // Review
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  correction_comments?: string;
  
  // Submission tracking
  submitted_at?: string;
  submitted_from_location?: GPSCoordinates;
  submission_device?: string;
  
  // Offline handling
  created_offline: boolean;
  synced: boolean;
  sync_attempts: number;
  last_sync_attempt?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  draft_saved_at?: string;
}

/**
 * POD validation result
 */
export interface PODValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  missing_required: string[];
  can_save_draft: boolean;
  can_submit: boolean;
}

// ============================================================================
// Incident Reporting
// ============================================================================

/**
 * Incident types
 */
export type IncidentType =
  | 'delivery_delay'
  | 'truck_breakdown'
  | 'accident'
  | 'damaged_goods'
  | 'missing_goods'
  | 'rejected_delivery'
  | 'route_problem'
  | 'other';

/**
 * Incident severity
 */
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Incident resolution status
 */
export type IncidentStatus =
  | 'reported'
  | 'acknowledged'
  | 'investigating'
  | 'in_progress'
  | 'resolved'
  | 'closed';

/**
 * Involved employee
 */
export interface InvolvedEmployee {
  employee_id: string;
  name: string;
  role: 'driver' | 'porter' | 'supervisor' | 'other';
  involvement_description?: string;
}

/**
 * Document attachment
 */
export interface DocumentAttachment {
  id: string;
  url?: string;           // Cloud URL after upload
  local_uri: string;      // Local file URI
  filename: string;
  type: 'photo' | 'document' | 'video';
  uploaded: boolean;
  upload_progress?: number;
  file_size?: number;
  mime_type?: string;
  thumbnail_url?: string;
  description?: string;
  captured_at: string;
}

/**
 * Incident report
 */
export interface IncidentReport {
  id: string;
  
  // Classification
  incident_type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  
  // Description
  title: string;
  description: string;
  
  // Context
  incident_date: string;   // ISO timestamp
  reported_at: string;     // ISO timestamp
  reported_by: string;     // Employee ID
  
  // Location
  location_description?: string;
  gps_coordinates?: GPSCoordinates;
  
  // Related entities
  trip_id?: string;
  truck_id?: string;
  stop_id?: string;
  
  // Involved parties
  involved_employees: InvolvedEmployee[];
  
  // Evidence
  photos: DocumentAttachment[];
  documents: DocumentAttachment[];
  
  // Actions and resolution
  immediate_action_taken?: string;
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  
  // Follow-up
  follow_up_required: boolean;
  follow_up_notes?: string;
  follow_up_assigned_to?: string;
  
  // Operator review
  acknowledged_by?: string;
  acknowledged_at?: string;
  
  // Offline handling
  created_offline: boolean;
  synced: boolean;
  sync_attempts: number;
  last_sync_attempt?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Incident validation result
 */
export interface IncidentValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  missing_required: string[];
  can_submit: boolean;
}

// ============================================================================
// Offline Upload Queue
// ============================================================================

/**
 * Upload queue item
 */
export interface UploadQueueItem {
  id: string;
  type: 'photo' | 'document' | 'signature';
  local_uri: string;
  filename: string;
  mime_type: string;
  file_size: number;
  
  // Association
  related_type: 'pod' | 'incident';
  related_id: string;      // POD ID or Incident ID
  
  // Upload status
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  upload_progress: number;
  uploaded_url?: string;
  
  // Error handling
  error_message?: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  
  // Priority
  priority: 'low' | 'normal' | 'high';
  
  // Compression
  original_size?: number;
  compressed_size?: number;
  compression_ratio?: number;
  
  // Timestamps
  created_at: string;
  started_at?: string;
  completed_at?: string;
  failed_at?: string;
}

/**
 * Upload queue statistics
 */
export interface UploadQueueStats {
  total_items: number;
  pending_items: number;
  uploading_items: number;
  completed_items: number;
  failed_items: number;
  total_size_mb: number;
  uploaded_size_mb: number;
  estimated_time_remaining?: number;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Location verification result
 */
export interface LocationVerification {
  verified: boolean;
  distance_from_stop: number;  // meters
  within_acceptable_range: boolean;
  acceptable_range: number;    // meters
  verification_time: string;
}

/**
 * Duplicate check result
 */
export interface DuplicateCheckResult {
  is_duplicate: boolean;
  duplicate_id?: string;
  similarity_score?: number;
  reason?: string;
}

/**
 * Export format
 */
export type ExportFormat = 'pdf' | 'json' | 'csv';

/**
 * POD export options
 */
export interface PODExportOptions {
  format: ExportFormat;
  include_photos: boolean;
  include_signature: boolean;
  include_items: boolean;
  include_location_map: boolean;
}

/**
 * Incident export options
 */
export interface IncidentExportOptions {
  format: ExportFormat;
  include_photos: boolean;
  include_documents: boolean;
  include_location_map: boolean;
  include_timeline: boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  delivery_delay: 'Delivery Delay',
  truck_breakdown: 'Truck Breakdown',
  accident: 'Accident',
  damaged_goods: 'Damaged Goods',
  missing_goods: 'Missing Goods',
  rejected_delivery: 'Rejected Delivery',
  route_problem: 'Route Problem',
  other: 'Other Incident',
};

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  reported: 'Reported',
  acknowledged: 'Acknowledged',
  investigating: 'Investigating',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  delivered: 'Delivered',
  missing: 'Missing',
  damaged: 'Damaged',
  returned: 'Returned',
  rejected: 'Rejected',
};

export const INCIDENT_SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  low: '#10B981',      // Green
  medium: '#F59E0B',   // Amber
  high: '#EF4444',     // Red
  critical: '#DC2626', // Dark Red
};

export const ITEM_STATUS_COLORS: Record<ItemStatus, string> = {
  delivered: '#10B981',  // Green
  missing: '#F59E0B',    // Amber
  damaged: '#EF4444',    // Red
  returned: '#3B82F6',   // Blue
  rejected: '#DC2626',   // Dark Red
};

/**
 * Validation rules
 */
export interface PODValidationRules {
  require_receipt_photo: boolean;
  require_signature: boolean;
  require_product_photos: boolean;
  require_gps_coordinates: boolean;
  min_receiver_name_length: number;
  max_delivery_notes_length: number;
  max_photo_size_mb: number;
  acceptable_location_range_meters: number;
}

export interface IncidentValidationRules {
  require_photos: boolean;
  require_gps_coordinates: boolean;
  min_description_length: number;
  max_description_length: number;
  require_immediate_action: boolean;
  max_photo_size_mb: number;
  max_photos_count: number;
}

export const DEFAULT_POD_RULES: PODValidationRules = {
  require_receipt_photo: true,
  require_signature: false,        // Not always permitted
  require_product_photos: false,
  require_gps_coordinates: true,
  min_receiver_name_length: 2,
  max_delivery_notes_length: 1000,
  max_photo_size_mb: 10,
  acceptable_location_range_meters: 100,
};

export const DEFAULT_INCIDENT_RULES: IncidentValidationRules = {
  require_photos: false,
  require_gps_coordinates: true,
  min_description_length: 20,
  max_description_length: 2000,
  require_immediate_action: true,
  max_photo_size_mb: 10,
  max_photos_count: 10,
};

/**
 * Upload queue configuration
 */
export interface UploadQueueConfig {
  max_concurrent_uploads: number;
  retry_delay_ms: number;
  max_retries: number;
  compress_photos: boolean;
  compression_quality: number;     // 0-1
  max_photo_dimension: number;     // pixels
  auto_upload_on_wifi: boolean;
  auto_upload_on_cellular: boolean;
}

export const DEFAULT_UPLOAD_CONFIG: UploadQueueConfig = {
  max_concurrent_uploads: 3,
  retry_delay_ms: 5000,
  max_retries: 3,
  compress_photos: true,
  compression_quality: 0.8,
  max_photo_dimension: 1920,
  auto_upload_on_wifi: true,
  auto_upload_on_cellular: false,
};
