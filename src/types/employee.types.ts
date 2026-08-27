/**
 * Employee-related type definitions
 * Updated for per-trip compensation and operator-managed accounts
 */

import { UserRole } from './index';

export enum EmploymentStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  INACTIVE = 'inactive',
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
  address: string;
  
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
  address: string;
  
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
  address?: string;
  
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
