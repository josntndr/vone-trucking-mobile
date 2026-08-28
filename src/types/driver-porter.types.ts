// @ts-nocheck
/**
 * Driver and Porter Specific Types
 * Types for mobile workflows, assignments, checklists, and reports
 */

import { type Trip, TripStatus, type TripAssignment } from './trip.types';
import type { Truck } from './truck.types';
import type { Employee } from './employee.types';

// Re-export TripStatus for convenience
export { TripStatus };

// Assignment status for driver/porter
export enum AssignmentStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  REJECTED = 'rejected',
}

// Driver/Porter assignment with trip details
/**
 * Trip assignment for driver or porter.
 * Tracks acknowledgment, rejection, and assigned resources.
 * 
 * @property id - Assignment identifier
 * @property trip_id - Associated trip
 * @property porter_id - Porter employee ID (for porter assignments)
 * @property trip - Full trip details
 * @property assignment_status - Current status (assigned, acknowledged, rejected, etc.)
 * @property acknowledged_at - When assignment was acknowledged
 * @property acknowledged_location - GPS location of acknowledgment
 * @property rejection_reason - Why assignment was rejected (if applicable)
 * @property truck - Assigned truck (populated for driver assignments)
 * @property driver - Assigned driver (populated when needed)
 * @property porters - List of assigned porters
 */
export interface Assignment {
  readonly id: string;
  readonly trip_id: string;
  readonly porter_id?: string; // Porter's employee ID (when assignment is for a porter)
  readonly trip: Trip;
  assignment_status: AssignmentStatus;
  acknowledged_at?: string;
  acknowledged_location?: {
    latitude: number;
    longitude: number;
  };
  rejection_reason?: string;
  
  // Related entities
  truck?: Truck;
  driver?: Employee;
  porters?: Employee[];
}

// Status update payload
export interface StatusUpdatePayload {
  trip_id: string;
  new_status: TripStatus;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  odometer_reading?: number;
  timestamp?: string;
}

// Delay report
export enum DelayReason {
  TRAFFIC = 'traffic',
  VEHICLE_PROBLEM = 'vehicle_problem',
  WEATHER = 'weather',
  LOADING_DELAY = 'loading_delay',
  CUSTOMER_REQUEST = 'customer_request',
  ROAD_CLOSURE = 'road_closure',
  OTHER = 'other',
}

export interface DelayReport {
  readonly id: string;
  readonly trip_id: string;
  readonly reported_by: string;
  readonly reported_by_name: string;
  readonly reported_at: string;
  delay_reason: DelayReason;
  estimated_delay_minutes: number;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  photos?: string[];
}

// Incident/Accident report
export enum IncidentType {
  ACCIDENT = 'accident',
  THEFT = 'theft',
  DAMAGE = 'damage',
  INJURY = 'injury',
  NEAR_MISS = 'near_miss',
  OTHER = 'other',
}

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface IncidentReport {
  readonly id: string;
  readonly trip_id: string;
  readonly reported_by: string;
  readonly reported_by_name: string;
  readonly reported_at: string;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  photos: string[];
  injuries_reported: boolean;
  police_notified: boolean;
  police_report_number?: string;
  other_parties_involved: boolean;
  other_parties_details?: string;
}

// Truck problem report
export enum TruckProblemType {
  ENGINE = 'engine',
  BRAKES = 'brakes',
  TIRES = 'tires',
  LIGHTS = 'lights',
  STEERING = 'steering',
  SUSPENSION = 'suspension',
  ELECTRICAL = 'electrical',
  FUEL = 'fuel',
  COOLING = 'cooling',
  OTHER = 'other',
}

export enum TruckProblemSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical',
}

export interface TruckProblemReport {
  id: string;
  trip_id?: string;
  truck_id: string;
  reported_by: string;
  reported_by_name: string;
  reported_at: string;
  problem_type: TruckProblemType;
  severity: TruckProblemSeverity;
  description: string;
  can_continue_trip: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  photos: string[];
  odometer_reading?: number;
}

// Fuel and receipts
export interface FuelEntry {
  id: string;
  trip_id: string;
  truck_id: string;
  driver_id: string;
  fuel_date: string;
  fuel_station: string;
  liters: number;
  cost: number;
  odometer_reading: number;
  receipt_photo: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
}

export interface Receipt {
  id: string;
  trip_id: string;
  receipt_type: 'fuel' | 'toll' | 'parking' | 'meal' | 'maintenance' | 'other';
  description: string;
  amount: number;
  receipt_date: string;
  receipt_photo: string;
  created_by: string;
  created_at: string;
}

// Odometer tracking
export interface OdometerReading {
  id: string;
  trip_id: string;
  truck_id: string;
  driver_id: string;
  reading_type: 'start' | 'end' | 'fuel' | 'checkpoint';
  reading: number;
  recorded_at: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  photo?: string;
}

// Proof of Delivery
export interface ProofOfDelivery {
  id: string;
  trip_id: string;
  delivered_at: string;
  delivered_to_name: string;
  delivered_to_position?: string;
  signature_image?: string;
  delivery_photos: string[];
  items_delivered: number;
  items_returned?: number;
  items_damaged?: number;
  delivery_notes?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  submitted_by: string;
  submitted_by_name: string;
}

// Porter checklist item
export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  notes?: string;
  photo?: string;
  checked_at?: string;
  checked_by?: string;
}

// Porter loading checklist
/**
 * Porter loading checklist for tracking items loaded onto truck.
 * Includes validation flags for quality control and photographic evidence.
 * 
 * @property id - Auto-generated unique identifier
 * @property trip_id - Associated trip identifier
 * @property porter_id - Porter performing the loading
 * @property started_at - Timestamp when loading began (auto-generated)
 * @property completed_at - Timestamp when loading completed
 * @property items - Detailed list of items being loaded
 * @property total_items_loaded - Count of items successfully loaded
 * @property discrepancy_reported - Whether any issues were found
 * @property loading_photos - Photo URLs of loaded cargo
 * @property all_items_loaded - Validation: all manifest items accounted for
 * @property items_match_manifest - Validation: items match expected manifest
 * @property items_properly_secured - Validation: cargo secured correctly
 * @property no_damage_observed - Validation: no damage during loading
 */
export interface LoadingChecklist {
  readonly id: string;
  readonly trip_id: string;
  readonly porter_id: string;
  readonly started_at: string;
  completed_at?: string;
  items: ChecklistItem[];
  total_items_loaded: number;
  discrepancy_reported: boolean;
  discrepancy_notes?: string;
  loading_photos: string[];
  
  // Checklist validation flags
  all_items_loaded?: boolean;
  truck_condition_checked?: boolean;
  items_secured?: boolean;
  items_match_manifest?: boolean;
  items_properly_secured?: boolean;
  no_damage_observed?: boolean;
  quantity_confirmed?: boolean;
  notes?: string;
  photo_urls?: string[]; // Alternative field name for photos
  
  location?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Submission payload for creating/updating loading checklist.
 * Omits auto-generated fields (id, started_at).
 * completed_at is set when checklist is finalized.
 */
export type LoadingChecklistSubmission = Omit<LoadingChecklist, 'id' | 'started_at'>;

/**
 * Porter delivery checklist for tracking delivery completion and customer acceptance.
 * Includes validation flags and signature/acceptance tracking.
 * 
 * @property id - Auto-generated unique identifier
 * @property trip_id - Associated trip identifier
 * @property porter_id - Porter performing the delivery
 * @property started_at - Timestamp when delivery began (auto-generated)
 * @property completed_at - Timestamp when delivery completed
 * @property total_items_delivered - Count of items successfully delivered
 * @property items_returned - Count of items returned/rejected
 * @property items_damaged - Count of items damaged during delivery
 * @property all_items_delivered - Validation: all items delivered successfully
 * @property customer_signature_obtained - Validation: customer signed acceptance
 * @property delivery_location_correct - Validation: delivered to correct location
 * @property no_damage_on_delivery - Validation: no damage at delivery point
 */
export interface DeliveryChecklist {
  readonly id: string;
  readonly trip_id: string;
  readonly porter_id: string;
  readonly started_at: string;
  completed_at?: string;
  items: ChecklistItem[];
  total_items_delivered: number;
  items_returned: number;
  items_damaged: number;
  discrepancy_reported: boolean;
  discrepancy_notes?: string;
  unloading_photos: string[];
  customer_notes?: string;
  delivery_notes?: string;
  photo_urls: string[];
  
  // Checklist validation flags
  all_items_delivered?: boolean;
  customer_signature_obtained?: boolean;
  delivery_location_correct?: boolean;
  no_damage_on_delivery?: boolean;
  quantity_delivered?: number;
  
  location?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Submission payload for creating/updating delivery checklist.
 * Omits auto-generated fields (id, started_at).
 * completed_at is set when checklist is finalized.
 */
export type DeliveryChecklistSubmission = Omit<DeliveryChecklist, 'id' | 'started_at'>;

// Porter time tracking
export interface PorterTimeEntry {
  id: string;
  trip_id: string;
  porter_id: string;
  time_in?: string;
  time_in_location?: {
    latitude: number;
    longitude: number;
  };
  time_out?: string;
  time_out_location?: {
    latitude: number;
    longitude: number;
  };
  total_hours?: number;
  notes?: string;
}

// Product discrepancy report
export enum DiscrepancyType {
  MISSING = 'missing',
  DAMAGED = 'damaged',
  REJECTED = 'rejected',
  EXCESS = 'excess',
}

export interface ProductDiscrepancy {
  readonly id: string;
  readonly trip_id: string;
  readonly reported_by: string;
  readonly reported_by_name: string;
  readonly reported_at: string;
  discrepancy_type: DiscrepancyType;
  product_name: string; // Name of the product
  product_description: string; // Description of the discrepancy
  expected_quantity?: number; // Expected quantity (for missing/rejected)
  actual_quantity?: number; // Actual quantity received
  quantity_difference?: number; // Difference in quantity
  quantity: number; // Final quantity (damaged, missing, or rejected)
  reason?: string;
  description?: string; // Additional description
  photos: string[];
  photo_urls?: string[]; // Alternative field name for photos
  location?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Submission payload for creating product discrepancy reports.
 * Omits fields that are generated by the backend (id, reported_at).
 * reported_by and reported_by_name should come from current user context.
 */
export type ProductDiscrepancySubmission = Omit<ProductDiscrepancy, 'id' | 'reported_at' | 'reported_by' | 'reported_by_name'> & {
  // These fields are optional in submission, will be populated from auth context
  reported_by?: string;
  reported_by_name?: string;
};

// Payslip
export interface Payslip {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  trip_incentives: number;
  overtime_pay: number;
  deductions: number;
  net_pay: number;
  status: 'draft' | 'approved' | 'paid';
  paid_at?: string;
  trip_count: number;
  created_at: string;
}

// Cash advance
export interface CashAdvance {
  id: string;
  employee_id: string;
  requested_at: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed';
  approved_at?: string;
  approved_by?: string;
  approved_amount?: number;
  disbursed_at?: string;
  rejection_reason?: string;
  deduction_schedule?: string;
}

// Notification
export enum NotificationType {
  NEW_ASSIGNMENT = 'new_assignment',
  ASSIGNMENT_CHANGED = 'assignment_changed',
  TRIP_CANCELLED = 'trip_cancelled',
  REMINDER = 'reminder',
  APPROVAL = 'approval',
  REJECTION = 'rejection',
  MESSAGE = 'message',
  ALERT = 'alert',
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  action_url?: string;
}

// Sync status for offline support
export enum SyncStatus {
  SYNCED = 'synced',
  PENDING = 'pending',
  SYNCING = 'syncing',
  FAILED = 'failed',
}

export interface SyncableItem {
  local_id: string;
  sync_status: SyncStatus;
  sync_error?: string;
  last_sync_attempt?: string;
  retry_count: number;
}

// Helper types for UI
export interface DashboardStats {
  today_trips: number;
  upcoming_trips: number;
  completed_trips: number;
  pending_acknowledgements: number;
}

// Navigation app preference
export type NavigationApp = 'google_maps' | 'waze';

// Helper functions for status validation
export const canTransitionStatus = (
  currentStatus: TripStatus,
  newStatus: TripStatus,
  userRole: 'driver' | 'porter'
): boolean => {
  // Define allowed transitions for drivers
  const driverTransitions: Record<TripStatus, TripStatus[]> = {
    [TripStatus.SCHEDULED]: [TripStatus.ACKNOWLEDGED],
    [TripStatus.ASSIGNED]: [TripStatus.ACKNOWLEDGED],
    [TripStatus.ACKNOWLEDGED]: [TripStatus.AT_WAREHOUSE],
    [TripStatus.AT_WAREHOUSE]: [TripStatus.LOADING, TripStatus.DELAYED],
    [TripStatus.LOADING]: [TripStatus.DISPATCHED, TripStatus.DELAYED],
    [TripStatus.DISPATCHED]: [TripStatus.IN_TRANSIT, TripStatus.DELAYED],
    [TripStatus.IN_TRANSIT]: [
      TripStatus.ARRIVED,
      TripStatus.DELAYED,
      TripStatus.INCIDENT_REPORTED,
    ],
    [TripStatus.ARRIVED]: [TripStatus.UNLOADING, TripStatus.DELAYED],
    [TripStatus.UNLOADING]: [TripStatus.DELIVERED, TripStatus.DELAYED],
    [TripStatus.DELIVERED]: [TripStatus.RETURNING],
    [TripStatus.RETURNING]: [TripStatus.COMPLETED],
    [TripStatus.DELAYED]: [
      TripStatus.AT_WAREHOUSE,
      TripStatus.LOADING,
      TripStatus.DISPATCHED,
      TripStatus.IN_TRANSIT,
      TripStatus.ARRIVED,
      TripStatus.UNLOADING,
    ],
    [TripStatus.INCIDENT_REPORTED]: [TripStatus.IN_TRANSIT, TripStatus.CANCELLED],
    [TripStatus.COMPLETED]: [],
    [TripStatus.CANCELLED]: [],
    [TripStatus.DRAFT]: [],
  };

  // Porters can assist with some transitions
  const porterTransitions: Record<TripStatus, TripStatus[]> = {
    [TripStatus.ACKNOWLEDGED]: [TripStatus.AT_WAREHOUSE],
    [TripStatus.AT_WAREHOUSE]: [TripStatus.LOADING],
    [TripStatus.LOADING]: [TripStatus.DISPATCHED],
    [TripStatus.ARRIVED]: [TripStatus.UNLOADING],
    [TripStatus.UNLOADING]: [TripStatus.DELIVERED],
    [TripStatus.DELIVERED]: [TripStatus.RETURNING],
  } as Partial<Record<TripStatus, TripStatus[]>>;

  const allowedTransitions =
    userRole === 'driver'
      ? driverTransitions[currentStatus] || []
      : porterTransitions[currentStatus] || [];

  return allowedTransitions.includes(newStatus);
};

// Check if status update requires location
export const requiresLocation = (status: TripStatus): boolean => {
  return [
    TripStatus.ACKNOWLEDGED,
    TripStatus.AT_WAREHOUSE,
    TripStatus.DISPATCHED,
    TripStatus.ARRIVED,
    TripStatus.DELIVERED,
    TripStatus.COMPLETED,
    TripStatus.INCIDENT_REPORTED,
  ].includes(status);
};

// Check if status update requires photo
export const requiresPhoto = (status: TripStatus): boolean => {
  return [TripStatus.DELIVERED, TripStatus.COMPLETED].includes(status);
};

// Get status display info
export const getStatusAction = (
  status: TripStatus
): { label: string; icon: string; color: string } => {
  const actions: Record<
    TripStatus,
    { label: string; icon: string; color: string }
  > = {
    [TripStatus.SCHEDULED]: {
      label: 'Acknowledge',
      icon: 'check-circle',
      color: '#4CAF50',
    },
    [TripStatus.ASSIGNED]: {
      label: 'Acknowledge',
      icon: 'check-circle',
      color: '#4CAF50',
    },
    [TripStatus.ACKNOWLEDGED]: {
      label: 'At Warehouse',
      icon: 'warehouse',
      color: '#2196F3',
    },
    [TripStatus.AT_WAREHOUSE]: {
      label: 'Start Loading',
      icon: 'dolly',
      color: '#FF9800',
    },
    [TripStatus.LOADING]: {
      label: 'Dispatch',
      icon: 'truck-delivery',
      color: '#9C27B0',
    },
    [TripStatus.DISPATCHED]: {
      label: 'In Transit',
      icon: 'road',
      color: '#3F51B5',
    },
    [TripStatus.IN_TRANSIT]: {
      label: 'Arrived',
      icon: 'map-marker-check',
      color: '#00BCD4',
    },
    [TripStatus.ARRIVED]: {
      label: 'Start Unloading',
      icon: 'package-down',
      color: '#FF9800',
    },
    [TripStatus.UNLOADING]: {
      label: 'Delivered',
      icon: 'check-all',
      color: '#4CAF50',
    },
    [TripStatus.DELIVERED]: {
      label: 'Return',
      icon: 'arrow-u-left-top',
      color: '#607D8B',
    },
    [TripStatus.RETURNING]: {
      label: 'Complete',
      icon: 'flag-checkered',
      color: '#4CAF50',
    },
    [TripStatus.DELAYED]: { label: 'Delayed', icon: 'clock-alert', color: '#FF5722' },
    [TripStatus.CANCELLED]: {
      label: 'Cancelled',
      icon: 'close-circle',
      color: '#F44336',
    },
    [TripStatus.INCIDENT_REPORTED]: {
      label: 'Incident',
      icon: 'alert',
      color: '#F44336',
    },
    [TripStatus.COMPLETED]: {
      label: 'Completed',
      icon: 'check-circle',
      color: '#4CAF50',
    },
    [TripStatus.DRAFT]: { label: 'Draft', icon: 'pencil', color: '#9E9E9E' },
  };

  return actions[status] || { label: status, icon: 'help', color: '#9E9E9E' };
};

