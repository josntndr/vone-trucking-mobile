/**
 * Employee-related type definitions
 */

import { UserRole } from './index';

export enum EmploymentStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
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
  relationship?: string;
  phone: string;
  address?: string;
}

export interface LicenseDetails {
  license_number: string;
  license_type: LicenseType;
  restrictions?: string;
  expiry_date: string;
}

export interface CompensationConfig {
  base_salary?: number;
  daily_rate?: number;
  trip_rate?: number;
  overtime_rate?: number;
  currency: string;
}

export interface PerformanceNote {
  id: string;
  date: string;
  note: string;
  rating?: number;
  created_by: string;
}

export interface Employee {
  id: string;
  employee_id: string; // Employee number
  first_name: string;
  last_name: string;
  full_name?: string; // Computed
  role: UserRole;
  
  // Contact
  phone?: string;
  email?: string;
  address?: string;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact?: EmergencyContact;
  
  // Employment
  hire_date?: string;
  employment_status?: EmploymentStatus;
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
  
  // Compensation
  compensation_config?: CompensationConfig;
  
  // Metadata
  created_at: string;
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
  employee_id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  email: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  hire_date?: string;
  employment_status?: EmploymentStatus;
  
  // Driver-specific
  license_number?: string;
  license_type?: LicenseType;
  license_restrictions?: string;
  license_expiry?: string;
  
  // Compensation
  base_salary?: number;
  daily_rate?: number;
  trip_rate?: number;
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  id: string;
}

export interface EmployeeFilters {
  role?: UserRole;
  employment_status?: EmploymentStatus;
  is_active?: boolean;
  search?: string;
}
