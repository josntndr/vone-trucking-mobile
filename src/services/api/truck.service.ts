/**
 * Truck Service
 * Handles truck CRUD operations via Supabase
 */

import { supabase } from './supabase';
import { ApiResponse, PaginatedResponse } from '../../types';
import type { Truck, CreateTruckInput, UpdateTruckInput, TruckFilters, TruckStatus } from '../../types/truck.types';

/**
 * Fetch all trucks with optional filters
 */
export const getTrucks = async (
  filters?: TruckFilters,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<PaginatedResponse<Truck>>> => {
  try {
    let query = supabase
      .from('trucks')
      .select('*, gps_devices(device_id, device_name)', { count: 'exact' })
      .is('deleted_at', null)
      .order('truck_number', { ascending: true });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters?.assigned_driver_id) {
      query = query.eq('assigned_driver_id', filters.assigned_driver_id);
    }

    if (filters?.search) {
      query = query.or(
        `truck_number.ilike.%${filters.search}%,license_plate.ilike.%${filters.search}%,make.ilike.%${filters.search}%,model.ilike.%${filters.search}%`
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

    return {
      data: {
        data: data as Truck[],
        total: count || 0,
        page,
        limit,
        hasMore: count ? count > page * limit : false,
      },
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching trucks' };
  }
};

/**
 * Fetch a single truck by ID
 */
export const getTruckById = async (id: string): Promise<ApiResponse<Truck>> => {
  try {
    const { data, error } = await supabase
      .from('trucks')
      .select(`
        *,
        gps_devices(id, device_id, device_name, imei, phone_number),
        employee_profiles!trucks_assigned_driver_id_fkey(
          id,
          employee_id,
          first_name,
          last_name
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Truck not found' };
    }

    // Format the response
    const truck: Truck = {
      ...data,
      assigned_driver_name: data.employee_profiles
        ? `${data.employee_profiles.first_name} ${data.employee_profiles.last_name}`
        : undefined,
      gps_device_id: data.gps_devices?.device_id,
    };

    return { data: truck };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching truck' };
  }
};

/**
 * Create a new truck
 */
export const createTruck = async (input: CreateTruckInput): Promise<ApiResponse<Truck>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('trucks')
      .insert({
        ...input,
        status: input.status || 'available',
        is_active: true,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message.includes('truck_number')) {
          return { error: 'Truck number already exists' };
        }
        if (error.message.includes('license_plate')) {
          return { error: 'License plate already exists' };
        }
        if (error.message.includes('vin')) {
          return { error: 'VIN already exists' };
        }
      }
      return { error: error.message };
    }

    return {
      data: data as Truck,
      message: 'Truck created successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while creating truck' };
  }
};

/**
 * Update a truck
 */
export const updateTruck = async (input: UpdateTruckInput): Promise<ApiResponse<Truck>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { id, ...updates } = input;

    const { data, error } = await supabase
      .from('trucks')
      .update({
        ...updates,
        updated_by: user.id,
      })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('truck_number')) {
          return { error: 'Truck number already exists' };
        }
        if (error.message.includes('license_plate')) {
          return { error: 'License plate already exists' };
        }
        if (error.message.includes('vin')) {
          return { error: 'VIN already exists' };
        }
      }
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Truck not found' };
    }

    return {
      data: data as Truck,
      message: 'Truck updated successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while updating truck' };
  }
};

/**
 * Archive a truck (soft delete)
 */
export const archiveTruck = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('trucks')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      return { error: error.message };
    }

    return {
      data: undefined,
      message: 'Truck archived successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while archiving truck' };
  }
};

/**
 * Restore an archived truck
 */
export const restoreTruck = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('trucks')
      .update({
        is_active: true,
        deleted_at: null,
        updated_by: user.id,
      })
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return {
      data: undefined,
      message: 'Truck restored successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while restoring truck' };
  }
};

/**
 * Update truck status
 */
export const updateTruckStatus = async (
  id: string,
  status: TruckStatus
): Promise<ApiResponse<void>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('trucks')
      .update({
        status,
        updated_by: user.id,
      })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      return { error: error.message };
    }

    return {
      data: undefined,
      message: 'Truck status updated successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while updating truck status' };
  }
};

/**
 * Get available trucks (for assignment)
 */
export const getAvailableTrucks = async (): Promise<ApiResponse<Truck[]>> => {
  try {
    const { data, error } = await supabase
      .from('trucks')
      .select('id, truck_number, license_plate, make, model, status')
      .eq('is_active', true)
      .is('deleted_at', null)
      .in('status', ['available', 'reserved'])
      .order('truck_number', { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { data: data as Truck[] };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching available trucks' };
  }
};
