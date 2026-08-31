/**
 * Employee-related type definitions
 * Updated for per-trip compensation and operator-managed accounts
 */

import { UserRole } from './index';

export enum EmploymentStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',  // Added for historical/legacy records
  ARCHIVED = 'archived',    // Added for deleted/archived records
}

export enum AccountStatus {
  ACTIVE = 'active',
  DEACTIVATED = 'deactivated',
}

export enum LicenseType {
  NON_PROFESSIONAL = 'non_professional',
  PROFESSIONAL = 'professional',
  CONDUCTOR = 'conductor',
}

export interface EmployeeDocument {
  id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

/**
 * Structured Address Components
 * Follows Philippine PSGC hierarchy: Country → Region → Province → City → Barangay
 * Note: Province is optional for NCR (National Capital Region) which has no provinces
 */
export interface StructuredAddress {
  // Country (required)
  country: string;
  country_code: string;
  
  // Region (required) - separate from Province
  region: string;
  region_code: string;
  
  // Province (optional - not applicable for NCR)
  province?: string;
  province_code?: string;
  
  // City/Municipality (required)
  city: string;
  city_code: string;
  
  // Barangay (required)
  barangay: string;
  barangay_code: string;
  
  // Postal code (required)
  postal_code: string;
  
  // Address lines (required)
  address_line_1: string; // House/Unit, Building, Street, Subdivision
  address_line_2?: string; // Apartment, floor, landmark, additional directions
  
  // Formatted complete address (generated)
  formatted_address: string;
  
  // Legacy flag
  is_legacy?: boolean; // True if address was migrated from old single-string format
}

export interface LicenseDetails {
  license_number: string;
  license_type: LicenseType;
  restrictions?: string;
  expiry_date: string;
}

export interface AccountInfo {
  username: string;
  account_status: AccountStatus;
  require_password_change: boolean;
  last_login?: string;
  created_at: string;
}

export interface PerformanceNote {
  id: string;
  date: string;
  note: string;
  rating?: number;
  created_by: string;
}

export interface Employee {
  readonly id: string;
  readonly employee_id: string; // Employee number
  first_name: string;
  last_name: string;
  full_name?: string; // Computed
  role: UserRole;
  
  // Contact (required)
  phone: string;
  address: string; // Legacy single-string address (for backward compatibility)
  
  // Structured Address (new fields with Region/Province separation)
  country?: string;
  country_code?: string;
  region?: string;
  region_code?: string;
  province?: string; // Optional - not applicable for NCR
  province_code?: string;
  city?: string;
  city_code?: string;
  barangay?: string;
  barangay_code?: string;
  postal_code?: string;
  address_line_1?: string;
  address_line_2?: string;
  formatted_address?: string;
  address_is_legacy?: boolean;
  
  // Email is nullable for backward compatibility, not exposed in UI
  email?: string | null;
  
  // Emergency Contact (required)
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  
  // Employment (required)
  hire_date: string;
  employment_status: EmploymentStatus;
  is_active: boolean;
  
  // Profile
  profile_photo_url?: string;
  
  // Driver-specific
  license_number?: string;
  license_type?: LicenseType;
  license_restrictions?: string;
  license_expiry?: string;
  assigned_truck_id?: string;
  assigned_truck_number?: string;
  
  // Compensation - per-trip only (required)
  per_trip_rate: number;
  
  // Legacy compensation fields (nullable for historical data)
  base_salary?: number | null;
  daily_rate?: number | null;
  
  // Legacy compensation_config object (for backward compatibility with old screens)
  compensation_config?: {
    method?: 'per_trip' | 'salary' | 'daily';
    base_amount?: number;
    effective_from?: string;
  };
  
  // Account Information
  account_info?: AccountInfo;
  
  // Metadata
  readonly created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Related data
  documents?: EmployeeDocument[];
  performance_notes?: PerformanceNote[];
  trip_count?: number;
  completed_trips?: number;
}

export interface CreateEmployeeInput {
  // Basic Information (required)
  employee_id: string;
  first_name: string;
  last_name: string;
  role: UserRole.DRIVER | UserRole.PORTER;
  phone: string;
  
  // Address (legacy single-string, optional for backward compatibility)
  address?: string;
  
  // Structured Address (new required fields with Region/Province separation)
  country: string;
  country_code: string;
  region: string;
  region_code: string;
  province?: string; // Optional - not required for NCR
  province_code?: string;
  city: string;
  city_code: string;
  barangay: string;
  barangay_code: string;
  postal_code: string;
  address_line_1: string;
  address_line_2?: string;
  
  // Emergency Contact (required)
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;
  
  // Employment Details (required)
  hire_date: string;
  employment_status: EmploymentStatus;
  
  // Driver-specific (conditional)
  license_number?: string;
  license_type?: LicenseType;
  license_restrictions?: string;
  license_expiry?: string;
  
  // Compensation (required)
  per_trip_rate: number;
  
  // Account Access (required)
  username: string;
  temporary_password: string;
  confirm_password?: string; // For form validation only, not sent to API
  account_status: AccountStatus;
  require_password_change: boolean;
}

export interface UpdateEmployeeInput {
  id: string;
  
  // Basic Information
  employee_id?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  
  // Address (legacy single-string, optional for backward compatibility)
  address?: string;
  
  // Structured Address (new fields with Region/Province separation)
  country?: string;
  country_code?: string;
  region?: string;
  region_code?: string;
  province?: string; // Optional - not applicable for NCR
  province_code?: string;
  city?: string;
  city_code?: string;
  barangay?: string;
  barangay_code?: string;
  postal_code?: string;
  address_line_1?: string;
  address_line_2?: string;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  
  // Employment Details
  hire_date?: string;
  employment_status?: EmploymentStatus;
  
  // Driver-specific
  license_number?: string;
  license_type?: LicenseType;
  license_restrictions?: string;
  license_expiry?: string;
  
  // Compensation
  per_trip_rate?: number;
}

export interface UpdateEmployeeAccountInput {
  employee_id: string;
  username?: string;
  temporary_password?: string;
  account_status?: AccountStatus;
  require_password_change?: boolean;
  revoke_sessions?: boolean;
}

export interface EmployeeFilters {
  role?: UserRole;
  employment_status?: EmploymentStatus;
  is_active?: boolean;
  account_status?: AccountStatus;
  search?: string; // Search by employee_id, name, or phone (not email)
}

/**
 * Helper function to check if employee has structured address
 */
export function hasStructuredAddress(employee: Employee): boolean {
  return !!(
    employee.country_code &&
    employee.region_code &&
    // Province is optional for NCR (region_code '13')
    (employee.region_code === '13' || (employee.province_code && employee.province)) &&
    employee.city_code &&
    employee.barangay_code &&
    employee.postal_code &&
    employee.address_line_1
  );
}

/**
 * Helper function to get display address (prefers formatted_address, falls back to legacy address)
 */
export function getDisplayAddress(employee: Employee): string {
  if (employee.formatted_address) {
    return employee.formatted_address;
  }
  return employee.address || 'No address provided';
}

/**
 * Helper function to extract structured address from employee
 */
export function getStructuredAddress(employee: Employee): StructuredAddress | null {
  if (!hasStructuredAddress(employee)) {
    return null;
  }
  
  return {
    country: employee.country!,
    country_code: employee.country_code!,
    region: employee.region!,
    region_code: employee.region_code!,
    province: employee.province,
    province_code: employee.province_code,
    city: employee.city!,
    city_code: employee.city_code!,
    barangay: employee.barangay!,
    barangay_code: employee.barangay_code!,
    postal_code: employee.postal_code!,
    address_line_1: employee.address_line_1!,
    address_line_2: employee.address_line_2,
    formatted_address: employee.formatted_address!,
    is_legacy: employee.address_is_legacy,
  };
}
