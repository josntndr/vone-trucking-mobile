/**
 * Employee Service
 * Handles employee CRUD operations via Supabase
 */

import { supabase } from './supabase';
import { ApiResponse, PaginatedResponse, UserRole } from '../../types';
import type { Employee, CreateEmployeeInput, UpdateEmployeeInput, EmployeeFilters } from '../../types/employee.types';

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

    if (filters?.search) {
      query = query.or(
        `employee_id.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
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
    };

    return { data: employee };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching employee' };
  }
};

/**
 * Create a new employee
 */
export const createEmployee = async (input: CreateEmployeeInput): Promise<ApiResponse<Employee>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // First, create user in auth.users
    const tempPassword = `${input.employee_id}Temp123!`;
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: input.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        first_name: input.first_name,
        last_name: input.last_name,
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return { error: 'Email already registered' };
      }
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: 'Failed to create user account' };
    }

    // Then create employee profile
    const { base_salary, daily_rate, trip_rate, ...profileData } = input;

    const compensationConfig = {
      base_salary,
      daily_rate,
      trip_rate,
      currency: 'PHP',
    };

    const { data, error } = await supabase
      .from('employee_profiles')
      .insert({
        ...profileData,
        id: authData.user.id,
        employment_status: input.employment_status || 'active',
        is_active: true,
        compensation_config: compensationConfig,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      // Rollback: delete the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);

      if (error.code === '23505') {
        if (error.message.includes('employee_id')) {
          return { error: 'Employee number already exists' };
        }
      }
      return { error: error.message };
    }

    return {
      data: {
        ...data,
        full_name: `${data.first_name} ${data.last_name}`,
      } as Employee,
      message: `Employee created successfully. Temporary password: ${tempPassword}`,
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while creating employee' };
  }
};

/**
 * Update an employee
 */
export const updateEmployee = async (input: UpdateEmployeeInput): Promise<ApiResponse<Employee>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { id, base_salary, daily_rate, trip_rate, email, ...updates } = input;

    // Fetch current employee data
    const { data: currentEmployee } = await supabase
      .from('employee_profiles')
      .select('compensation_config')
      .eq('id', id)
      .single();

    // Update compensation config
    const compensationConfig = currentEmployee?.compensation_config || {};
    if (base_salary !== undefined) compensationConfig.base_salary = base_salary;
    if (daily_rate !== undefined) compensationConfig.daily_rate = daily_rate;
    if (trip_rate !== undefined) compensationConfig.trip_rate = trip_rate;

    const { data, error } = await supabase
      .from('employee_profiles')
      .update({
        ...updates,
        compensation_config: compensationConfig,
        updated_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('employee_id')) {
          return { error: 'Employee number already exists' };
        }
      }
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Employee not found' };
    }

    // Update email in auth if provided
    if (email && email !== data.email) {
      await supabase.auth.admin.updateUserById(id, { email });
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
 * Archive an employee (soft delete)
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
        employment_status: 'archived',
        updated_by: user.id,
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
 * Get drivers for assignment
 */
export const getDriversForAssignment = async (): Promise<ApiResponse<Employee[]>> => {
  try {
    const { data, error } = await supabase
      .from('employee_profiles')
      .select('id, employee_id, first_name, last_name, license_number')
      .eq('role', UserRole.DRIVER)
      .eq('is_active', true)
      .eq('employment_status', 'active')
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
