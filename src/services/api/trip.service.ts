// @ts-nocheck - TODO: Fix type errors
/**
 * Trip Service
 * Handles trip CRUD operations, assignments, conflict detection, and status management
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { ApiResponse, PaginatedResponse } from '../../types';
import type {
  Trip,
  TripStatus,
  CreateTripInput,
  UpdateTripInput,
  AssignTripResourcesInput,
  UpdateTripStatusInput,
  CancelTripInput,
  TripFilters,
  AvailabilityCheckResult,
  AvailabilityConflict,
  TripStats,
  DuplicateTripInput,
  TripStatusHistory,
} from '../../types/trip.types';
import * as DemoTrips from '../demo/demoTrips.service';
import { IMUS_PLANT, getDefaultPickupLocation } from '../../config/plant.config';

/**
 * Generate next trip number
 */
const generateTripNumber = async (): Promise<string> => {
  if (!isSupabaseConfigured() || !supabase) {
    // Generate a demo trip number
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999) + 1;
    return `TRP-${year}${month}-${String(random).padStart(4, '0')}`;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const prefix = `TRP-${year}${month}`;

  // Get count of trips this month
  const { count } = await supabase
    .from('trips')
    .select('*', { count: 'exact', head: true })
    .like('trip_number', `${prefix}%`);

  const nextNumber = (count || 0) + 1;
  return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
};

/**
 * Fetch all trips with optional filters
 */
export const getTrips = async (
  filters?: TripFilters,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<PaginatedResponse<Trip>>> => {
  try {
    // Use demo data if Supabase is not configured
    if (!isSupabaseConfigured() || !supabase) {
      console.log('Using demo trips data - Supabase not configured');
      return await DemoTrips.getDemoTrips(filters, page, limit);
    }

    let query = supabase
      .from('trips')
      .select(`
        *,
        trucks!trips_assigned_truck_id_fkey(truck_number),
        driver:employee_profiles!trips_assigned_driver_id_fkey(employee_id, first_name, last_name)
      `, { count: 'exact' })
      .order('delivery_date', { ascending: false })
      .order('call_time', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.delivery_date_from) {
      query = query.gte('delivery_date', filters.delivery_date_from);
    }

    if (filters?.delivery_date_to) {
      query = query.lte('delivery_date', filters.delivery_date_to);
    }

    if (filters?.assigned_truck_id) {
      query = query.eq('assigned_truck_id', filters.assigned_truck_id);
    }

    if (filters?.assigned_driver_id) {
      query = query.eq('assigned_driver_id', filters.assigned_driver_id);
    }

    if (filters?.search) {
      query = query.or(
        `trip_number.ilike.%${filters.search}%,delivery_reference.ilike.%${filters.search}%,delivery_destination.ilike.%${filters.search}%,cargo_description.ilike.%${filters.search}%`
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

    // Format trip data
    const trips = (data || []).map((trip: any) => ({
      ...trip,
      assigned_truck_number: trip.trucks?.truck_number,
      assigned_driver_name: trip.driver
        ? `${trip.driver.first_name} ${trip.driver.last_name}`
        : undefined,
    }));

    return {
      data: {
        data: trips as Trip[],
        total: count || 0,
        page,
        limit,
        hasMore: count ? count > page * limit : false,
      },
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching trips' };
  }
};

/**
 * Fetch a single trip by ID with full details
 */
export const getTripById = async (id: string): Promise<ApiResponse<Trip>> => {
  try {
    // Use demo data if Supabase is not configured
    if (!isSupabaseConfigured() || !supabase) {
      console.log('Using demo trip data - Supabase not configured');
      return await DemoTrips.getDemoTripById(id);
    }

    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        trucks!trips_assigned_truck_id_fkey(id, truck_number, license_plate),
        driver:employee_profiles!trips_assigned_driver_id_fkey(id, employee_id, first_name, last_name),
        trip_status_history(
          id,
          previous_status,
          new_status,
          changed_at,
          location,
          latitude,
          longitude,
          notes,
          reason,
          changed_by_user:employee_profiles!trip_status_history_changed_by_fkey(first_name, last_name)
        ),
        trip_assignments(
          id,
          employee_id,
          role,
          assigned_at,
          acknowledged_at,
          status,
          employee:employee_profiles!trip_assignments_employee_id_fkey(employee_id, first_name, last_name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Trip not found' };
    }

    // Format the response
    const trip: Trip = {
      ...data,
      assigned_truck_number: data.trucks?.truck_number,
      assigned_driver_name: data.driver
        ? `${data.driver.first_name} ${data.driver.last_name}`
        : undefined,
      status_history: (data.trip_status_history || []).map((history: any) => ({
        ...history,
        changed_by_name: history.changed_by_user
          ? `${history.changed_by_user.first_name} ${history.changed_by_user.last_name}`
          : undefined,
      })),
      assignments: (data.trip_assignments || []).map((assignment: any) => ({
        ...assignment,
        employee_name: assignment.employee
          ? `${assignment.employee.first_name} ${assignment.employee.last_name}`
          : undefined,
        employee_number: assignment.employee?.employee_id,
      })),
    };

    return { data: trip };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching trip' };
  }
};

/**
 * Create a new trip
 */
export const createTrip = async (input: CreateTripInput): Promise<ApiResponse<Trip>> => {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Cannot create trips in demo mode. Please configure Supabase.' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Generate trip number
    const tripNumber = await generateTripNumber();

    // Automatically set Imus Plant as pickup location for all new trips
    const plantLocation = getDefaultPickupLocation();
    const tripData = {
      ...input,
      pickup_warehouse: plantLocation.name,
      pickup_address: plantLocation.address,
      pickup_location_id: plantLocation.id,
    };

    const { data, error } = await supabase
      .from('trips')
      .insert({
        trip_number: tripNumber,
        ...tripData,
        status: input.status || 'draft',
        is_recurring: input.is_recurring || false,
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('delivery_reference')) {
          return { error: 'Delivery reference already exists' };
        }
      }
      return { error: error.message };
    }

    // Create initial status history entry
    await supabase.from('trip_status_history').insert({
      trip_id: data.id,
      new_status: data.status,
      changed_by: user.id,
      notes: 'Trip created',
    });

    return {
      data: data as Trip,
      message: `Trip created successfully: ${tripNumber}`,
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while creating trip' };
  }
};

/**
 * Update a trip
 */
export const updateTrip = async (input: UpdateTripInput): Promise<ApiResponse<Trip>> => {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Cannot update trips in demo mode. Please configure Supabase.' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { id, ...updates } = input;

    const { data, error } = await supabase
      .from('trips')
      .update({
        ...updates,
        updated_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('delivery_reference')) {
          return { error: 'Delivery reference already exists' };
        }
      }
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Trip not found' };
    }

    return {
      data: data as Trip,
      message: 'Trip updated successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while updating trip' };
  }
};

/**
 * Check availability for truck, driver, and porters
 */
export const checkAvailability = async (
  truckId?: string,
  driverId?: string,
  porterIds?: string[],
  deliveryDate?: string,
  callTime?: string,
  estimatedDurationHours: number = 8,
  excludeTripId?: string
): Promise<ApiResponse<AvailabilityCheckResult>> => {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      // In demo mode, always return available
      return {
        data: {
          is_available: true,
          conflicts: [],
        },
      };
    }

    const conflicts: AvailabilityConflict[] = [];

    if (!deliveryDate || !callTime) {
      return {
        data: {
          is_available: true,
          conflicts: [],
        },
      };
    }

    // Calculate time range for conflict check
    const startDateTime = new Date(`${deliveryDate}T${callTime}:00`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(endDateTime.getHours() + estimatedDurationHours);

    // Check for overlapping trips
    let query = supabase
      .from('trips')
      .select('id, trip_number, delivery_date, call_time, assigned_truck_id, assigned_driver_id')
      .eq('delivery_date', deliveryDate)
      .in('status', ['scheduled', 'assigned', 'acknowledged', 'at_warehouse', 'loading', 'dispatched', 'in_transit']);

    if (excludeTripId) {
      query = query.neq('id', excludeTripId);
    }

    const { data: overlappingTrips, error } = await query;

    if (error) {
      return { error: error.message };
    }

    // Check truck conflicts
    if (truckId && overlappingTrips) {
      const truckConflicts = overlappingTrips.filter((trip: Trip) => trip.assigned_truck_id === truckId);
      for (const conflict of truckConflicts) {
        const { data: truck } = await supabase
          .from('trucks')
          .select('truck_number')
          .eq('id', truckId)
          .single();

        conflicts.push({
          resource_id: truckId,
          resource_type: 'truck',
          resource_name: truck?.truck_number || 'Unknown',
          conflicting_trip_id: conflict.id,
          conflicting_trip_number: conflict.trip_number,
          conflict_date: conflict.delivery_date,
          conflict_time: conflict.call_time,
          message: `Truck is already assigned to trip ${conflict.trip_number}`,
        });
      }
    }

    // Check driver conflicts
    if (driverId && overlappingTrips) {
      const driverConflicts = overlappingTrips.filter((trip: Trip) => trip.assigned_driver_id === driverId);
      for (const conflict of driverConflicts) {
        const { data: driver } = await supabase
          .from('employee_profiles')
          .select('first_name, last_name')
          .eq('id', driverId)
          .single();

        conflicts.push({
          resource_id: driverId,
          resource_type: 'driver',
          resource_name: driver ? `${driver.first_name} ${driver.last_name}` : 'Unknown',
          conflicting_trip_id: conflict.id,
          conflicting_trip_number: conflict.trip_number,
          conflict_date: conflict.delivery_date,
          conflict_time: conflict.call_time,
          message: `Driver is already assigned to trip ${conflict.trip_number}`,
        });
      }
    }

    // Check porter conflicts
    if (porterIds && porterIds.length > 0 && overlappingTrips) {
      for (const porterId of porterIds) {
        // Check if porter is assigned to any overlapping trip
        const { data: porterAssignments } = await supabase
          .from('trip_assignments')
          .select('trip_id, trips!inner(trip_number, delivery_date, call_time)')
          .eq('employee_id', porterId)
          .eq('role', 'porter')
          .in('trip_id', overlappingTrips.map((t: Trip) => t.id));

        if (porterAssignments && porterAssignments.length > 0) {
          const { data: porter } = await supabase
            .from('employee_profiles')
            .select('first_name, last_name')
            .eq('id', porterId)
            .single();

          for (const assignment of porterAssignments) {
            conflicts.push({
              resource_id: porterId,
              resource_type: 'porter',
              resource_name: porter ? `${porter.first_name} ${porter.last_name}` : 'Unknown',
              conflicting_trip_id: assignment.trip_id,
              conflicting_trip_number: (assignment as any).trips.trip_number,
              conflict_date: (assignment as any).trips.delivery_date,
              conflict_time: (assignment as any).trips.call_time,
              message: `Porter is already assigned to trip ${(assignment as any).trips.trip_number}`,
            });
          }
        }
      }
    }

    return {
      data: {
        is_available: conflicts.length === 0,
        conflicts,
      },
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while checking availability' };
  }
};

/**
 * Assign resources to a trip
 */
export const assignResources = async (
  input: AssignTripResourcesInput
): Promise<ApiResponse<void>> => {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Cannot assign resources in demo mode. Please configure Supabase.' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Get trip details for conflict checking
    const { data: trip } = await supabase
      .from('trips')
      .select('delivery_date, call_time, estimated_duration_hours')
      .eq('id', input.trip_id)
      .single();

    if (!trip) {
      return { error: 'Trip not found' };
    }

    // Check availability
    const availabilityResult = await checkAvailability(
      input.truck_id,
      input.driver_id,
      input.porter_ids,
      trip.delivery_date,
      trip.call_time,
      trip.estimated_duration_hours || 8,
      input.trip_id
    );

    if (availabilityResult.error) {
      return { error: availabilityResult.error };
    }

    if (!availabilityResult.data?.is_available) {
      const conflictMessages = (availabilityResult.data?.conflicts || [])
        .map((c: any) => c.message)
        .join('\n');
      return { error: `Resource conflicts detected:\n${conflictMessages}` };
    }

    // Update trip with assignments
    const updates: any = { updated_by: user.id };
    if (input.truck_id) updates.assigned_truck_id = input.truck_id;
    if (input.driver_id) updates.assigned_driver_id = input.driver_id;

    const { error: updateError } = await supabase
      .from('trips')
      .update(updates)
      .eq('id', input.trip_id);

    if (updateError) {
      return { error: updateError.message };
    }

    // Create porter assignments
    if (input.porter_ids && input.porter_ids.length > 0) {
      // Remove existing porter assignments
      await supabase
        .from('trip_assignments')
        .delete()
        .eq('trip_id', input.trip_id)
        .eq('role', 'porter');

      // Add new porter assignments
      const porterAssignments = input.porter_ids.map((porterId) => ({
        trip_id: input.trip_id,
        employee_id: porterId,
        role: 'porter',
        assigned_by: user.id,
        status: 'pending',
      }));

      const { error: assignError } = await supabase
        .from('trip_assignments')
        .insert(porterAssignments);

      if (assignError) {
        return { error: assignError.message };
      }
    }

    // Update trip status if it was draft
    const { data: currentTrip } = await supabase
      .from('trips')
      .select('status')
      .eq('id', input.trip_id)
      .single();

    if (currentTrip?.status === TripStatus.DRAFT) {
      await updateTripStatus({
        trip_id: input.trip_id,
        new_status: TripStatus.ASSIGNED,
        notes: 'Resources assigned to trip',
      });
    }

    return {
      data: undefined,
      message: 'Resources assigned successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while assigning resources' };
  }
};

/**
 * Update trip status
 */
export const updateTripStatus = async (
  input: UpdateTripStatusInput
): Promise<ApiResponse<void>> => {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Cannot update trip status in demo mode. Please configure Supabase.' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Get current status
    const { data: currentTrip } = await supabase
      .from('trips')
      .select('status')
      .eq('id', input.trip_id)
      .single();

    if (!currentTrip) {
      return { error: 'Trip not found' };
    }

    // Update trip status
    const { error: updateError } = await supabase
      .from('trips')
      .update({
        status: input.new_status,
        updated_by: user.id,
      })
      .eq('id', input.trip_id);

    if (updateError) {
      return { error: updateError.message };
    }

    // Record status history
    const { error: historyError } = await supabase
      .from('trip_status_history')
      .insert({
        trip_id: input.trip_id,
        previous_status: currentTrip.status,
        new_status: input.new_status,
        changed_by: user.id,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        notes: input.notes,
        reason: input.reason,
      });

    if (historyError) {
      return { error: historyError.message };
    }

    return {
      data: undefined,
      message: 'Trip status updated successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while updating trip status' };
  }
};

/**
 * Cancel a trip
 */
export const cancelTrip = async (input: CancelTripInput): Promise<ApiResponse<void>> => {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Cannot cancel trips in demo mode. Please configure Supabase.' };
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    await updateTripStatus({
      trip_id: input.trip_id,
      new_status: TripStatus.CANCELLED,
      reason: input.reason,
    });

    // Update cancellation fields
    const { error } = await supabase
      .from('trips')
      .update({
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        cancellation_reason: input.reason,
      })
      .eq('id', input.trip_id);

    if (error) {
      return { error: error.message };
    }

    return {
      data: undefined,
      message: 'Trip cancelled successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while cancelling trip' };
  }
};

/**
 * Duplicate a trip
 */
export const duplicateTrip = async (input: DuplicateTripInput): Promise<ApiResponse<Trip>> => {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: 'Cannot duplicate trips in demo mode. Please configure Supabase.' };
    }

    const { data: sourceTrip } = await supabase
      .from('trips')
      .select('*')
      .eq('id', input.source_trip_id)
      .single();

    if (!sourceTrip) {
      return { error: 'Source trip not found' };
    }

    // Ensure new trip uses Imus Plant as origin
    const plantLocation = getDefaultPickupLocation();

    // Create new trip with copied data
    const newTripInput: CreateTripInput = {
      delivery_reference: `${sourceTrip.delivery_reference}-COPY`,
      delivery_date: input.new_delivery_date,
      call_time: input.new_call_time,
      pickup_warehouse: plantLocation.name,
      pickup_address: plantLocation.address,
      delivery_destination: sourceTrip.delivery_destination,
      delivery_address: sourceTrip.delivery_address,
      store_branch_name: sourceTrip.store_branch_name,
      cargo_description: sourceTrip.cargo_description,
      cargo_weight_kg: sourceTrip.cargo_weight_kg,
      cargo_volume_cbm: sourceTrip.cargo_volume_cbm,
      number_of_items: sourceTrip.number_of_items,
      estimated_duration_hours: sourceTrip.estimated_duration_hours,
      expected_income: sourceTrip.expected_income,
      special_instructions: sourceTrip.special_instructions,
      delivery_instructions: sourceTrip.delivery_instructions,
      status: TripStatus.DRAFT,
      is_recurring: true,
    };

    const createResult = await createTrip(newTripInput);

    if (createResult.error || !createResult.data) {
      return { error: createResult.error || 'Failed to create duplicate trip' };
    }

    // Copy assignments if requested
    if (input.copy_assignments && createResult.data) {
      const assignInput: AssignTripResourcesInput = {
        trip_id: createResult.data.id,
        truck_id: sourceTrip.assigned_truck_id,
        driver_id: sourceTrip.assigned_driver_id,
      };

      // Get porter assignments
      const { data: porterAssignments } = await supabase
        .from('trip_assignments')
        .select('employee_id')
        .eq('trip_id', input.source_trip_id)
        .eq('role', 'porter');

      if (porterAssignments && porterAssignments.length > 0) {
        assignInput.porter_ids = porterAssignments.map((a: any) => a.employee_id);
      }

      await assignResources(assignInput);
    }

    // Link to parent trip
    await supabase
      .from('trips')
      .update({ parent_trip_id: input.source_trip_id })
      .eq('id', createResult.data.id);

    return {
      data: createResult.data,
      message: 'Trip duplicated successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while duplicating trip' };
  }
};

/**
 * Get trip statistics
 */
export const getTripStats = async (
  dateFrom?: string,
  dateTo?: string
): Promise<ApiResponse<TripStats>> => {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      // Return demo stats
      return {
        data: {
          total_trips: 5,
          scheduled_trips: 1,
          in_progress_trips: 1,
          completed_trips: 1,
          cancelled_trips: 1,
          delayed_trips: 0,
        },
      };
    }

    let query = supabase.from('trips').select('status', { count: 'exact', head: true });

    if (dateFrom) {
      query = query.gte('delivery_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('delivery_date', dateTo);
    }

    const [
      { count: total },
      { count: scheduled },
      { count: inProgress },
      { count: completed },
      { count: cancelled },
      { count: delayed },
    ] = await Promise.all([
      query,
      query.in('status', ['scheduled', 'assigned', 'acknowledged']),
      query.in('status', ['at_warehouse', 'loading', 'dispatched', 'in_transit', 'arrived', 'unloading', 'delivered', 'returning']),
      query.eq('status', 'completed'),
      query.eq('status', 'cancelled'),
      query.eq('status', 'delayed'),
    ]);

    return {
      data: {
        total_trips: total || 0,
        scheduled_trips: scheduled || 0,
        in_progress_trips: inProgress || 0,
        completed_trips: completed || 0,
        cancelled_trips: cancelled || 0,
        delayed_trips: delayed || 0,
      },
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching trip stats' };
  }
};
