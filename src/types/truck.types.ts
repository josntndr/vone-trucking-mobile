/**
 * Truck-related type definitions
 */

export enum TruckStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  ASSIGNED = 'assigned',
  ON_TRIP = 'on_trip',
  UNDER_MAINTENANCE = 'under_maintenance',
  INACTIVE = 'inactive',
}

export enum FuelType {
  DIESEL = 'diesel',
  GASOLINE = 'gasoline',
  HYBRID = 'hybrid',
  ELECTRIC = 'electric',
}

export interface TruckDocument {
  id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

export interface TruckPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  uploaded_at: string;
}

export interface Truck {
  id: string;
  truck_number: string; // Fleet/Unit number
  license_plate: string;
  make: string;
  model: string;
  year: number;
  truck_type?: string;
  capacity_kg: number;
  fuel_type: FuelType;
  avg_km_per_liter?: number;
  current_odometer?: number;
  vin?: string;
  
  // Registration & Insurance
  or_number?: string;
  cr_number?: string;
  or_expiry?: string;
  cr_expiry?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  
  // GPS & Assignment
  gps_device_id?: string;
  assigned_driver_id?: string;
  assigned_driver_name?: string;
  
  // Status & Maintenance
  status: TruckStatus;
  is_active: boolean;
  purchase_date?: string;
  last_service_date?: string;
  next_service_date?: string;
  notes?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string;
  
  // Related data
  photos?: TruckPhoto[];
  documents?: TruckDocument[];
}

export interface CreateTruckInput {
  truck_number: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  truck_type?: string;
  capacity_kg: number;
  fuel_type: FuelType;
  avg_km_per_liter?: number;
  current_odometer?: number;
  vin?: string;
  or_number?: string;
  cr_number?: string;
  or_expiry?: string;
  cr_expiry?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  status?: TruckStatus;
  purchase_date?: string;
  notes?: string;
}

export interface UpdateTruckInput extends Partial<CreateTruckInput> {
  id: string;
}

export interface TruckFilters {
  status?: TruckStatus;
  is_active?: boolean;
  search?: string;
  assigned_driver_id?: string;
}
