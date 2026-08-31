/**
 * Employee Service
 * Handles employee CRUD operations and account management via Supabase
 * Updated for per-trip compensation and operator-managed accounts
 */

import { supabase } from './supabase';
import { ApiResponse, PaginatedResponse, UserRole } from '../../types';
import type {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  UpdateEmployeeAccountInput,
  EmployeeFilters,
  AccountStatus,
} from '../../types/employee.types';
import { formatAddress } from '../location.service';

/**
 * Check if username is available
 */
export const checkUsernameAvailability = async (username: string): Promise<ApiResponse<boolean>> => {
  try {
    const { data, error } = await supabase
      .from('employee_profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (error) {
      return { error: error.message };
    }

    return { data: !data }; // true if username is available (no data found)
  } catch (error) {
    return { error: 'Failed to check username availability' };
  }
};

/**
 * Fetch all employees with optional filters
 */
export const getEmployees = async (
  filters?: EmployeeFilters,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<PaginatedResponse<Employee>>> => {
  try {
    let query = supabase
      .from('employee_profiles')
      .select('*, trucks!trucks_assigned_driver_id_fkey(truck_number)', { count: 'exact' })
      .order('employee_id', { ascending: true });

    // Apply filters
    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.employment_status) {
      query = query.eq('employment_status', filters.employment_status);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters?.account_status) {
      query = query.eq('account_status', filters.account_status);
    }

    if (filters?.search) {
      // Search by employee_id, name, or phone (NOT email)
      query = query.or(
        `employee_id.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return { error: error.message };
    }

    // Format employee data
    const employees = (data || []).map((emp: any) => ({
      ...emp,
      full_name: `${emp.first_name} ${emp.last_name}`,
      assigned_truck_number: emp.trucks?.truck_number,
    }));

    return {
      data: {
        data: employees as Employee[],
        total: count || 0,
        page,
        limit,
        hasMore: count ? count > page * limit : false,
      },
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching employees' };
  }
};

/**
 * Fetch a single employee by ID
 */
export const getEmployeeById = async (id: string): Promise<ApiResponse<Employee>> => {
  try {
    const { data, error } = await supabase
      .from('employee_profiles')
      .select(`
        *,
        trucks!trucks_assigned_driver_id_fkey(
          id,
          truck_number,
          license_plate,
          make,
          model
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Employee not found' };
    }

    // Format the response
    const employee: Employee = {
      ...data,
      full_name: `${data.first_name} ${data.last_name}`,
      assigned_truck_number: data.trucks?.truck_number,
      account_info: {
        username: data.username,
        account_status: data.account_status,
        require_password_change: data.require_password_change,
        last_login: data.last_login,
        created_at: data.created_at,
      },
    };

    return { data: employee };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching employee' };
  }
};

/**
 * Create a new employee with operator-managed account
 * This creates both the employee profile and authentication account as a single transaction
 */
export const createEmployee = async (input: CreateEmployeeInput): Promise<ApiResponse<Employee & { temporary_password_shown: string }>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Check username availability first
    const usernameCheck = await checkUsernameAvailability(input.username);
    if (usernameCheck.error || !usernameCheck.data) {
      return { error: 'This username is already in use' };
    }

    // Generate formatted address from structured fields
    let formattedAddress: string | undefined;
    if (input.address_line_1 && input.barangay_code && input.city_code && input.region_code && input.postal_code && input.country_code) {
      try {
        formattedAddress = formatAddress({
          countryCode: input.country_code,
          countryName: input.country || 'Philippines',
          regionCode: input.region_code,
          regionName: input.region || '',
          provinceCode: input.province_code,
          provinceName: input.province,
          cityCode: input.city_code,
          cityName: input.city || '',
          barangayCode: input.barangay_code,
          barangayName: input.barangay || '',
          postalCode: input.postal_code,
          addressLine1: input.address_line_1,
          addressLine2: input.address_line_2,
        });
      } catch (error) {
        console.error('Error formatting address:', error);
        // Continue without formatted address
      }
    }

    // Generate internal email identifier for auth system
    // This is NEVER shown to the employee or operator UI
    const internalEmail = `${input.username.toLowerCase()}@vonetrucking.internal`;

    // Create authentication account via edge function or RPC
    // DO NOT expose auth admin keys in mobile app
    const { data: authResult, error: authError } = await supabase.functions.invoke('create-employee-account', {
      body: {
        username: input.username.toLowerCase(),
        password: input.temporary_password,
        internal_email: internalEmail,
        require_password_change: input.require_password_change,
      },
    });

    if (authError || !authResult?.user_id) {
      console.error('Auth account creation failed:', authError);
      return { error: 'Failed to create employee account. Please try again.' };
    }

    // Create employee profile with all required fields including structured address
    const { temporary_password, confirm_password, ...profileData } = input;

    const { data, error } = await supabase
      .from('employee_profiles')
      .insert({
        ...profileData,
        id: authResult.user_id,
        username: input.username.toLowerCase(),
        account_status: input.account_status,
        require_password_change: input.require_password_change,
        employment_status: input.employment_status,
        is_active: true,
        per_trip_rate: input.per_trip_rate,
        // Structured address fields
        country: input.country,
        country_code: input.country_code,
        region: input.region,
        region_code: input.region_code,
        province: input.province || null,
        province_code: input.province_code || null,
        city: input.city,
        city_code: input.city_code,
        barangay: input.barangay,
        barangay_code: input.barangay_code,
        postal_code: input.postal_code,
        address_line_1: input.address_line_1,
        address_line_2: input.address_line_2 || null,
        formatted_address: formattedAddress,
        address_is_legacy: false,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      // Rollback: delete the auth user if profile creation fails
      await supabase.functions.invoke('delete-employee-account', {
        body: { user_id: authResult.user_id },
      });

      if (error.code === '23505') {
        if (error.message.includes('employee_id')) {
          return { error: 'Employee ID already exists' };
        }
        if (error.message.includes('username')) {
          return { error: 'This username is already in use' };
        }
        if (error.message.includes('phone')) {
          return { error: 'This phone number is already registered' };
        }
      }
      return { error: error.message };
    }

    return {
      data: {
        ...data,
        full_name: `${data.first_name} ${data.last_name}`,
        temporary_password_shown: input.temporary_password, // Only shown once
      } as any,
      message: 'Employee created successfully',
    };
  } catch (error) {
    console.error('Create employee error:', error);
    return { error: 'An unexpected error occurred while creating employee' };
  }
};

/**
 * Update employee profile information (not account credentials)
 */
export const updateEmployee = async (input: UpdateEmployeeInput): Promise<ApiResponse<Employee>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { id, ...updates } = input;

    // Generate formatted address if structured fields are provided
    let formattedAddress: string | undefined;
    if (updates.address_line_1 && updates.barangay_code && updates.city_code && updates.region_code && updates.postal_code && updates.country_code) {
      try {
        formattedAddress = formatAddress({
          countryCode: updates.country_code,
          countryName: updates.country || 'Philippines',
          regionCode: updates.region_code,
          regionName: updates.region || '',
          provinceCode: updates.province_code,
          provinceName: updates.province,
          cityCode: updates.city_code,
          cityName: updates.city || '',
          barangayCode: updates.barangay_code,
          barangayName: updates.barangay || '',
          postalCode: updates.postal_code,
          addressLine1: updates.address_line_1,
          addressLine2: updates.address_line_2,
        });
      } catch (error) {
        console.error('Error formatting address:', error);
        // Continue without formatted address
      }
    }

    const { data, error } = await supabase
      .from('employee_profiles')
      .update({
        ...updates,
        formatted_address: formattedAddress,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('employee_id')) {
          return { error: 'Employee ID already exists' };
        }
        if (error.message.includes('phone')) {
          return { error: 'This phone number is already registered' };
        }
      }
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Employee not found' };
    }

    return {
      data: {
        ...data,
        full_name: `${data.first_name} ${data.last_name}`,
      } as Employee,
      message: 'Employee updated successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while updating employee' };
  }
};

/**
 * Update employee account information (username, password, status)
 * Operator-only function for account management
 */
export const updateEmployeeAccount = async (input: UpdateEmployeeAccountInput): Promise<ApiResponse<void>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const updates: any = {};

    // Check username availability if changing
    if (input.username) {
      const { data: existing } = await supabase
        .from('employee_profiles')
        .select('id')
        .eq('username', input.username.toLowerCase())
        .neq('id', input.employee_id)
        .maybeSingle();

      if (existing) {
        return { error: 'This username is already in use' };
      }

      updates.username = input.username.toLowerCase();
    }

    if (input.account_status) {
      updates.account_status = input.account_status;
    }

    if (input.require_password_change !== undefined) {
      updates.require_password_change = input.require_password_change;
    }

    // Update profile
    if (Object.keys(updates).length > 0) {
      const { error: profileError } = await supabase
        .from('employee_profiles')
        .update({
          ...updates,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.employee_id);

      if (profileError) {
        return { error: profileError.message };
      }
    }

    // Update password or revoke sessions via edge function
    if (input.temporary_password || input.revoke_sessions) {
      const { error: authError } = await supabase.functions.invoke('update-employee-account', {
        body: {
          user_id: input.employee_id,
          new_password: input.temporary_password,
          revoke_sessions: input.revoke_sessions,
          deactivate: input.account_status === 'deactivated',
        },
      });

      if (authError) {
        return { error: 'Failed to update account credentials' };
      }
    }

    return {
      data: undefined,
      message: 'Account updated successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while updating account' };
  }
};

/**
 * Deactivate employee account
 * Blocks login but preserves all employee data
 */
export const deactivateEmployeeAccount = async (employeeId: string): Promise<ApiResponse<void>> => {
  return updateEmployeeAccount({
    employee_id: employeeId,
    account_status: 'deactivated' as AccountStatus,
    revoke_sessions: true,
  });
};

/**
 * Activate employee account
 */
export const activateEmployeeAccount = async (employeeId: string): Promise<ApiResponse<void>> => {
  return updateEmployeeAccount({
    employee_id: employeeId,
    account_status: 'active' as AccountStatus,
  });
};

/**
 * Archive an employee (soft delete - changes employment status)
 * Does NOT delete account
 */
export const archiveEmployee = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('employee_profiles')
      .update({
        is_active: false,
        employment_status: 'inactive',
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return {
      data: undefined,
      message: 'Employee archived successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while archiving employee' };
  }
};

/**
 * Restore an archived employee
 */
export const restoreEmployee = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('employee_profiles')
      .update({
        is_active: true,
        employment_status: 'active',
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return {
      data: undefined,
      message: 'Employee restored successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while restoring employee' };
  }
};

/**
 * Get drivers for assignment (only active drivers with active accounts)
 */
export const getDriversForAssignment = async (): Promise<ApiResponse<Employee[]>> => {
  try {
    const { data, error } = await supabase
      .from('employee_profiles')
      .select('id, employee_id, first_name, last_name, license_number, phone')
      .eq('role', UserRole.DRIVER)
      .eq('is_active', true)
      .eq('employment_status', 'active')
      .eq('account_status', 'active')
      .order('employee_id', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    const drivers = (data || []).map((driver: any) => ({
      ...driver,
      full_name: `${driver.first_name} ${driver.last_name}`,
    }));

    return { data: drivers as Employee[] };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching drivers' };
  }
};

/**
 * Get porters/helpers for assignment (only active porters with active accounts)
 */
export const getPortersForAssignment = async (): Promise<ApiResponse<Employee[]>> => {
  try {
    const { data, error } = await supabase
      .from('employee_profiles')
      .select('id, employee_id, first_name, last_name, phone')
      .eq('role', UserRole.PORTER)
      .eq('is_active', true)
      .eq('employment_status', 'active')
      .eq('account_status', 'active')
      .order('employee_id', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    const porters = (data || []).map((porter: any) => ({
      ...porter,
      full_name: `${porter.first_name} ${porter.last_name}`,
    }));

    return { data: porters as Employee[] };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching porters' };
  }
};

/**
 * Assign driver to truck
 */
export const assignDriverToTruck = async (
  driverId: string,
  truckId: string
): Promise<ApiResponse<void>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Update truck with assigned driver
    const { error: truckError } = await supabase
      .from('trucks')
      .update({
        assigned_driver_id: driverId,
        status: 'assigned',
        updated_by: user.id,
      })
      .eq('id', truckId);

    if (truckError) {
      return { error: truckError.message };
    }

    // Update employee with assigned truck
    const { error: employeeError } = await supabase
      .from('employee_profiles')
      .update({
        assigned_truck_id: truckId,
        updated_by: user.id,
      })
      .eq('id', driverId);

    if (employeeError) {
      return { error: employeeError.message };
    }

    return {
      data: undefined,
      message: 'Driver assigned to truck successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while assigning driver' };
  }
};

/**
 * Unassign driver from truck
 */
export const unassignDriverFromTruck = async (driverId: string): Promise<ApiResponse<void>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Get current assignment
    const { data: employee } = await supabase
      .from('employee_profiles')
      .select('assigned_truck_id')
      .eq('id', driverId)
      .single();

    if (!employee?.assigned_truck_id) {
      return { error: 'Driver is not assigned to any truck' };
    }

    // Update truck
    const { error: truckError } = await supabase
      .from('trucks')
      .update({
        assigned_driver_id: null,
        status: 'available',
        updated_by: user.id,
      })
      .eq('id', employee.assigned_truck_id);

    if (truckError) {
      return { error: truckError.message };
    }

    // Update employee
    const { error: employeeError } = await supabase
      .from('employee_profiles')
      .update({
        assigned_truck_id: null,
        updated_by: user.id,
      })
      .eq('id', driverId);

    if (employeeError) {
      return { error: employeeError.message };
    }

    return {
      data: undefined,
      message: 'Driver unassigned from truck successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while unassigning driver' };
  }
};
