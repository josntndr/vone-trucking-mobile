/**
 * Demo Trips Service
 * Provides mock trip data when Supabase is not configured
 */

import { ApiResponse, PaginatedResponse } from '../../types';
import type { Trip, TripStatus, TripFilters } from '../../types/trip.types';
import { IMUS_PLANT } from '../../config/plant.config';

/**
 * Mock trip data
 */
const DEMO_TRIPS: Trip[] = [
  {
    id: 'demo-trip-1',
    trip_number: 'TRP-202408-0001',
    delivery_reference: 'DEL-2024-001',
    delivery_date: '2024-08-25',
    call_time: '08:00',
    pickup_warehouse: IMUS_PLANT.name,
    pickup_address: IMUS_PLANT.address,
    pickup_location_id: IMUS_PLANT.id,
    delivery_destination: 'Makati City',
    delivery_address: 'Ayala Ave, Makati, Metro Manila',
    store_branch_name: 'Makati Central Branch',
    cargo_description: 'Office supplies and equipment',
    cargo_weight_kg: 500,
    cargo_volume_cbm: 2.5,
    number_of_items: 25,
    estimated_duration_hours: 4,
    expected_income: 5000,
    status: 'scheduled' as TripStatus,
    assigned_truck_id: 'demo-truck-1',
    assigned_truck_number: 'ABC-1234',
    assigned_driver_id: 'demo-driver-1',
    assigned_driver_name: 'Juan Dela Cruz',
    assigned_porter_name: 'Pedro Santos',
    special_instructions: 'Handle with care - fragile items',
    delivery_instructions: 'Deliver to 5th floor reception',
    is_recurring: false,
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: '2024-08-20T10:00:00Z',
    updated_at: '2024-08-20T10:00:00Z',
  },
  {
    id: 'demo-trip-2',
    trip_number: 'TRP-202408-0002',
    delivery_reference: 'DEL-2024-002',
    delivery_date: '2024-08-24',
    call_time: '06:00',
    pickup_warehouse: IMUS_PLANT.name,
    pickup_address: IMUS_PLANT.address,
    pickup_location_id: IMUS_PLANT.id,
    delivery_destination: 'Pasig City',
    delivery_address: 'Ortigas Center, Pasig, Metro Manila',
    store_branch_name: 'Ortigas Branch',
    cargo_description: 'Electronics and appliances',
    cargo_weight_kg: 800,
    cargo_volume_cbm: 4.0,
    number_of_items: 15,
    estimated_duration_hours: 5,
    expected_income: 7500,
    status: 'in_transit' as TripStatus,
    assigned_truck_id: 'demo-truck-2',
    assigned_truck_number: 'XYZ-5678',
    assigned_driver_id: 'demo-driver-2',
    assigned_driver_name: 'Maria Garcia',
    special_instructions: 'Avoid rush hour traffic',
    delivery_instructions: 'Call recipient 30 minutes before arrival',
    is_recurring: false,
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: '2024-08-19T08:00:00Z',
    updated_at: '2024-08-24T06:30:00Z',
  },
  {
    id: 'demo-trip-3',
    trip_number: 'TRP-202408-0003',
    delivery_reference: 'DEL-2024-003',
    delivery_date: '2024-08-23',
    call_time: '10:00',
    pickup_warehouse: IMUS_PLANT.name,
    pickup_address: IMUS_PLANT.address,
    pickup_location_id: IMUS_PLANT.id,
    delivery_destination: 'Las Piñas City',
    delivery_address: 'BF Homes, Las Piñas, Metro Manila',
    store_branch_name: 'BF Homes Branch',
    cargo_description: 'Furniture and fixtures',
    cargo_weight_kg: 1200,
    cargo_volume_cbm: 6.5,
    number_of_items: 10,
    estimated_duration_hours: 6,
    expected_income: 9000,
    status: 'completed' as TripStatus,
    assigned_truck_id: 'demo-truck-1',
    assigned_truck_number: 'ABC-1234',
    assigned_driver_id: 'demo-driver-3',
    assigned_driver_name: 'Ramon Reyes',
    assigned_porter_name: 'Jose Cruz',
    special_instructions: 'Assembly required on-site',
    delivery_instructions: 'Coordinate with store manager',
    is_recurring: false,
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: '2024-08-18T09:00:00Z',
    updated_at: '2024-08-23T16:00:00Z',
  },
  {
    id: 'demo-trip-4',
    trip_number: 'TRP-202408-0004',
    delivery_reference: 'DEL-2024-004',
    delivery_date: '2024-08-26',
    call_time: '07:00',
    pickup_warehouse: IMUS_PLANT.name,
    pickup_address: IMUS_PLANT.address,
    pickup_location_id: IMUS_PLANT.id,
    delivery_destination: 'Antipolo City',
    delivery_address: 'Sumulong Highway, Antipolo, Rizal',
    store_branch_name: 'Antipolo Branch',
    cargo_description: 'Food and beverage supplies',
    cargo_weight_kg: 600,
    cargo_volume_cbm: 3.2,
    number_of_items: 30,
    estimated_duration_hours: 4,
    expected_income: 6000,
    status: 'draft' as TripStatus,
    special_instructions: 'Temperature-sensitive items',
    delivery_instructions: 'Deliver before 12:00 PM',
    is_recurring: false,
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: '2024-08-21T11:00:00Z',
    updated_at: '2024-08-21T11:00:00Z',
  },
  {
    id: 'demo-trip-5',
    trip_number: 'TRP-202408-0005',
    delivery_reference: 'DEL-2024-005',
    delivery_date: '2024-08-22',
    call_time: '09:00',
    pickup_warehouse: IMUS_PLANT.name,
    pickup_address: IMUS_PLANT.address,
    pickup_location_id: IMUS_PLANT.id,
    delivery_destination: 'San Juan City',
    delivery_address: 'Greenhills, San Juan, Metro Manila',
    store_branch_name: 'Greenhills Branch',
    cargo_description: 'Retail merchandise',
    cargo_weight_kg: 400,
    cargo_volume_cbm: 2.0,
    number_of_items: 20,
    estimated_duration_hours: 3,
    expected_income: 4000,
    status: 'cancelled' as TripStatus,
    assigned_truck_id: 'demo-truck-2',
    assigned_truck_number: 'XYZ-5678',
    assigned_driver_id: 'demo-driver-2',
    assigned_driver_name: 'Maria Garcia',
    cancellation_reason: 'Client requested postponement',
    cancelled_at: '2024-08-22T07:00:00Z',
    is_recurring: false,
    created_by: 'demo-user',
    updated_by: 'demo-user',
    created_at: '2024-08-17T13:00:00Z',
    updated_at: '2024-08-22T07:00:00Z',
  },
];

/**
 * Get demo trips with optional filters
 */
export const getDemoTrips = async (
  filters?: TripFilters,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<PaginatedResponse<Trip>>> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    let filteredTrips = [...DEMO_TRIPS];

    // Apply status filter
    if (filters?.status) {
      filteredTrips = filteredTrips.filter((trip) => trip.status === filters.status);
    }

    // Apply date filters
    if (filters?.delivery_date_from) {
      filteredTrips = filteredTrips.filter(
        (trip) => trip.delivery_date >= filters.delivery_date_from!
      );
    }

    if (filters?.delivery_date_to) {
      filteredTrips = filteredTrips.filter(
        (trip) => trip.delivery_date <= filters.delivery_date_to!
      );
    }

    // Apply truck filter
    if (filters?.assigned_truck_id) {
      filteredTrips = filteredTrips.filter(
        (trip) => trip.assigned_truck_id === filters.assigned_truck_id
      );
    }

    // Apply driver filter
    if (filters?.assigned_driver_id) {
      filteredTrips = filteredTrips.filter(
        (trip) => trip.assigned_driver_id === filters.assigned_driver_id
      );
    }

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTrips = filteredTrips.filter(
        (trip) =>
          trip.trip_number.toLowerCase().includes(searchLower) ||
          trip.delivery_reference.toLowerCase().includes(searchLower) ||
          trip.delivery_destination.toLowerCase().includes(searchLower) ||
          trip.cargo_description.toLowerCase().includes(searchLower) ||
          trip.assigned_truck_number?.toLowerCase().includes(searchLower) ||
          trip.assigned_driver_name?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by delivery date (newest first)
    filteredTrips.sort((a, b) => {
      const dateCompare = b.delivery_date.localeCompare(a.delivery_date);
      if (dateCompare !== 0) return dateCompare;
      return (b.call_time || '').localeCompare(a.call_time || '');
    });

    // Pagination
    const total = filteredTrips.length;
    const from = (page - 1) * limit;
    const to = from + limit;
    const paginatedTrips = filteredTrips.slice(from, to);

    return {
      data: {
        data: paginatedTrips,
        total,
        page,
        limit,
        hasMore: to < total,
      },
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching demo trips' };
  }
};

/**
 * Get demo trip by ID
 */
export const getDemoTripById = async (id: string): Promise<ApiResponse<Trip>> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const trip = DEMO_TRIPS.find((t) => t.id === id);

  if (!trip) {
    return { error: 'Trip not found' };
  }

  return { data: trip };
};

/**
 * Check if demo mode is enabled
 */
export const isDemoTripsMode = async (): Promise<boolean> => {
  // Demo mode is enabled when Supabase is not configured
  const { isSupabaseConfigured } = await import('../api/supabase');
  return !isSupabaseConfigured();
};
