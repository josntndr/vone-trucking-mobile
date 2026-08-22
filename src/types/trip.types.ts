/**
 * Trip and Dispatch Management Types
 */

export enum TripStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ASSIGNED = 'assigned',
  ACKNOWLEDGED = 'acknowledged',
  AT_WAREHOUSE = 'at_warehouse',
  LOADING = 'loading',
  DISPATCHED = 'dispatched',
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',
  UNLOADING = 'unloading',
  DELIVERED = 'delivered',
  RETURNING = 'returning',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled',
  INCIDENT_REPORTED = 'incident_reported',
}

export interface TripStatusHistory {
  id: string;
  trip_id: string;
  previous_status?: TripStatus;
  new_status: TripStatus;
  changed_by: string;
  changed_by_name?: string;
  changed_at: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  reason?: string;
}

export interface TripAssignment {
  id: string;
  trip_id: string;
  employee_id: string;
  employee_name?: string;
  employee_number?: string;
  role: 'driver' | 'porter';
  assigned_at: string;
  assigned_by: string;
  acknowledged_at?: string;
  status: 'pending' | 'acknowledged' | 'declined';
}

export interface Trip {
  readonly id: string;
  readonly trip_number: string;
  delivery_reference: string;
  
  // Schedule
  delivery_date: string;
  call_time: string;
  estimated_duration_hours?: number;
  actual_start_time?: string;
  actual_end_time?: string;
  
  // Locations
  pickup_warehouse: string;
  pickup_address?: string;
  delivery_destination: string;
  delivery_address: string;
  store_branch_name?: string;
  
  // Cargo
  cargo_description: string;
  cargo_weight_kg?: number;
  cargo_volume_cbm?: number;
  number_of_items?: number;
  
  // Assignments
  assigned_truck_id?: string;
  assigned_truck_number?: string;
  assigned_driver_id?: string;
  assigned_driver_name?: string;
  porter_ids?: string[];
  porter_names?: string[];
  
  // Financial
  expected_income?: number;
  actual_income?: number;
  
  // Instructions & Notes
  special_instructions?: string;
  delivery_instructions?: string;
  internal_notes?: string;
  
  // Status
  status: TripStatus;
  is_recurring: boolean;
  parent_trip_id?: string;
  
  // Metadata
  readonly created_at: string;
  updated_at: string;
  readonly created_by: string;
  updated_by: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancellation_reason?: string;
  
  // Related data
  status_history?: TripStatusHistory[];
  assignments?: TripAssignment[];
}

export interface CreateTripInput {
  delivery_reference: string;
  delivery_date: string;
  call_time: string;
  pickup_warehouse: string;
  pickup_address?: string;
  delivery_destination: string;
  delivery_address: string;
  store_branch_name?: string;
  cargo_description: string;
  cargo_weight_kg?: number;
  cargo_volume_cbm?: number;
  number_of_items?: number;
  estimated_duration_hours?: number;
  expected_income?: number;
  special_instructions?: string;
  delivery_instructions?: string;
  internal_notes?: string;
  status?: TripStatus;
  is_recurring?: boolean;
}

export interface UpdateTripInput extends Partial<CreateTripInput> {
  id: string;
}

export interface AssignTripResourcesInput {
  trip_id: string;
  truck_id?: string;
  driver_id?: string;
  porter_ids?: string[];
}

export interface UpdateTripStatusInput {
  trip_id: string;
  new_status: TripStatus;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  reason?: string;
}

export interface CancelTripInput {
  trip_id: string;
  reason: string;
}

export interface TripFilters {
  status?: TripStatus;
  delivery_date_from?: string;
  delivery_date_to?: string;
  assigned_truck_id?: string;
  assigned_driver_id?: string;
  search?: string;
}

export interface AvailabilityConflict {
  resource_id: string;
  resource_type: 'truck' | 'driver' | 'porter';
  resource_name: string;
  conflicting_trip_id: string;
  conflicting_trip_number: string;
  conflict_date: string;
  conflict_time: string;
  message: string;
}

export interface AvailabilityCheckResult {
  is_available: boolean;
  conflicts: AvailabilityConflict[];
}

export interface TripStats {
  total_trips: number;
  scheduled_trips: number;
  in_progress_trips: number;
  completed_trips: number;
  cancelled_trips: number;
  delayed_trips: number;
}

export interface DuplicateTripInput {
  source_trip_id: string;
  new_delivery_date: string;
  new_call_time: string;
  copy_assignments?: boolean;
}

// Helper function to get status display info
export const getTripStatusInfo = (status: TripStatus): { label: string; color: string; icon: string } => {
  const statusMap: Record<TripStatus, { label: string; color: string; icon: string }> = {
    [TripStatus.DRAFT]: { label: 'Draft', color: '#6B7280', icon: 'document-text-outline' },
    [TripStatus.SCHEDULED]: { label: 'Scheduled', color: '#3B82F6', icon: 'calendar-outline' },
    [TripStatus.ASSIGNED]: { label: 'Assigned', color: '#8B5CF6', icon: 'people-outline' },
    [TripStatus.ACKNOWLEDGED]: { label: 'Acknowledged', color: '#10B981', icon: 'checkmark-circle-outline' },
    [TripStatus.AT_WAREHOUSE]: { label: 'At Warehouse', color: '#F59E0B', icon: 'business-outline' },
    [TripStatus.LOADING]: { label: 'Loading', color: '#F59E0B', icon: 'cube-outline' },
    [TripStatus.DISPATCHED]: { label: 'Dispatched', color: '#3B82F6', icon: 'send-outline' },
    [TripStatus.IN_TRANSIT]: { label: 'In Transit', color: '#06B6D4', icon: 'navigate-outline' },
    [TripStatus.ARRIVED]: { label: 'Arrived', color: '#8B5CF6', icon: 'location-outline' },
    [TripStatus.UNLOADING]: { label: 'Unloading', color: '#F59E0B', icon: 'download-outline' },
    [TripStatus.DELIVERED]: { label: 'Delivered', color: '#10B981', icon: 'checkmark-done-outline' },
    [TripStatus.RETURNING]: { label: 'Returning', color: '#06B6D4', icon: 'arrow-back-outline' },
    [TripStatus.COMPLETED]: { label: 'Completed', color: '#059669', icon: 'checkmark-circle' },
    [TripStatus.DELAYED]: { label: 'Delayed', color: '#DC2626', icon: 'time-outline' },
    [TripStatus.CANCELLED]: { label: 'Cancelled', color: '#EF4444', icon: 'close-circle-outline' },
    [TripStatus.INCIDENT_REPORTED]: { label: 'Incident', color: '#DC2626', icon: 'warning-outline' },
  };

  return statusMap[status] || { label: status, color: '#6B7280', icon: 'help-outline' };
};

// Get next possible statuses for workflow
export const getNextPossibleStatuses = (currentStatus: TripStatus): TripStatus[] => {
  const workflows: Record<TripStatus, TripStatus[]> = {
    [TripStatus.DRAFT]: [TripStatus.SCHEDULED, TripStatus.CANCELLED],
    [TripStatus.SCHEDULED]: [TripStatus.ASSIGNED, TripStatus.CANCELLED],
    [TripStatus.ASSIGNED]: [TripStatus.ACKNOWLEDGED, TripStatus.CANCELLED],
    [TripStatus.ACKNOWLEDGED]: [TripStatus.AT_WAREHOUSE, TripStatus.CANCELLED],
    [TripStatus.AT_WAREHOUSE]: [TripStatus.LOADING, TripStatus.DELAYED, TripStatus.CANCELLED],
    [TripStatus.LOADING]: [TripStatus.DISPATCHED, TripStatus.DELAYED, TripStatus.CANCELLED],
    [TripStatus.DISPATCHED]: [TripStatus.IN_TRANSIT, TripStatus.DELAYED, TripStatus.INCIDENT_REPORTED],
    [TripStatus.IN_TRANSIT]: [TripStatus.ARRIVED, TripStatus.DELAYED, TripStatus.INCIDENT_REPORTED],
    [TripStatus.ARRIVED]: [TripStatus.UNLOADING, TripStatus.DELAYED],
    [TripStatus.UNLOADING]: [TripStatus.DELIVERED, TripStatus.DELAYED],
    [TripStatus.DELIVERED]: [TripStatus.RETURNING, TripStatus.COMPLETED],
    [TripStatus.RETURNING]: [TripStatus.COMPLETED],
    [TripStatus.DELAYED]: [TripStatus.IN_TRANSIT, TripStatus.CANCELLED],
    [TripStatus.INCIDENT_REPORTED]: [TripStatus.IN_TRANSIT, TripStatus.CANCELLED],
    [TripStatus.COMPLETED]: [],
    [TripStatus.CANCELLED]: [],
  };

  return workflows[currentStatus] || [];
};

// Check if status requires reason/notes
export const statusRequiresReason = (status: TripStatus): boolean => {
  return [
    TripStatus.DELAYED,
    TripStatus.CANCELLED,
    TripStatus.INCIDENT_REPORTED,
  ].includes(status);
};
