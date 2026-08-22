/**
 * Core type definitions for Vone Trucking
 */

// Common types
export type ID = string;
export type Timestamp = string;

// User roles
export enum UserRole {
  OPERATOR = 'operator',
  DRIVER = 'driver',
  PORTER = 'porter',
}

// User profile
export interface UserProfile {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  role: UserRole;
  hire_date?: string;
  is_active: boolean;
  profile_photo_url?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
  updated_at: string;
}

// Generic API response
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form state
export interface FormState {
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

// Navigation types
export type RootStackParamList = {
  '(auth)/welcome': undefined;
  '(auth)/login': undefined;
  '(auth)/register': undefined;
  '(auth)/forgot-password': undefined;
  '(operator)': undefined;
  '(driver)': undefined;
  '(porter)': undefined;
};

// Re-export domain types
export * from './truck.types';
export * from './employee.types';
export * from './trip.types';
export * from './import.types';
export * from './driver-porter.types';
