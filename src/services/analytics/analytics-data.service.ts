/**
 * Analytics Data Service
 * Fetches and calculates analytics metrics from real database records
 */

import { supabase } from '../api/supabase';
import { ApiResponse } from '../../types';
import {
  AnalyticsMetrics,
  AnalyticsFilters,
  DateRange,
  TripRecord,
} from '../../types/reporting.types';
import { TripStatus } from '../../types/trip.types';

/**
 * Calculate date range based on period
 */
export const calculateDateRange = (period: 'week' | 'month' | 'year' | 'custom', customRange?: DateRange): DateRange => {
  const now = new Date();
  const timezone = 'Asia/Manila';
  
  // Convert to Manila timezone
  const manilaDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  
  let startDate: Date;
  let endDate: Date = new Date(manilaDate);
  endDate.setHours(23, 59, 59, 999);

  switch (period) {
    case 'week':
      startDate = new Date(manilaDate);
      startDate.setDate(startDate.getDate() - 6); // Last 7 days
      startDate.setHours(0, 0, 0, 0);
      break;
      
    case 'month':
      startDate = new Date(manilaDate.getFullYear(), manilaDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      break;
      
    case 'year':
      startDate = new Date(manilaDate.getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
      
    case 'custom':
      if (!customRange) {
        throw new Error('Custom range required for custom period');
      }
      return customRange;
      
    default:
      startDate = new Date(manilaDate);
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

/**
 * Fetch analytics metrics for the given filters
 */
export const getAnalyticsMetrics = async (
  filters: AnalyticsFilters
): Promise<ApiResponse<AnalyticsMetrics>> => {
  try {
    const dateRange = filters.dateRange || calculateDateRange(filters.period);

    // Build base query
    let query = supabase
      .from('trips')
      .select('*', { count: 'exact' })
      .gte('delivery_date', dateRange.startDate.split('T')[0])
      .lte('delivery_date', dateRange.endDate.split('T')[0]);

    // Apply additional filters
    if (filters.statuses && filters.statuses.length > 0) {
      query = query.in('status', filters.statuses);
    }

    if (filters.truckIds && filters.truckIds.length > 0) {
      query = query.in('assigned_truck_id', filters.truckIds);
    }

    if (filters.driverIds && filters.driverIds.length > 0) {
      query = query.in('assigned_driver_id', filters.driverIds);
    }

    const { data: trips, error, count } = await query;

    if (error) {
      return { error: error.message };
    }

    if (!trips) {
      return { error: 'No trip data available' };
    }

    // Calculate metrics
    const totalTrips = count || 0;
    const completedTrips = trips.filter((t: any) => t.status === TripStatus.COMPLETED).length;
    const inProgressTrips = trips.filter((t: any) => 
      [TripStatus.DISPATCHED, TripStatus.IN_TRANSIT, TripStatus.LOADING, TripStatus.UNLOADING].includes(t.status)
    ).length;
    const pendingTrips = trips.filter((t: any) => t.status === TripStatus.DRAFT).length;
    const scheduledTrips = trips.filter((t: any) => 
      [TripStatus.SCHEDULED, TripStatus.ASSIGNED, TripStatus.ACKNOWLEDGED].includes(t.status)
    ).length;
    const cancelledTrips = trips.filter((t: any) => t.status === TripStatus.CANCELLED).length;
    const delayedTrips = trips.filter((t: any) => t.status === TripStatus.DELAYED).length;
    const incidentReports = trips.filter((t: any) => t.status === TripStatus.INCIDENT_REPORTED).length;

    // Calculate on-time delivery rate
    const deliveredTrips = trips.filter((t: any) => 
      [TripStatus.COMPLETED, TripStatus.DELIVERED].includes(t.status)
    );
    const onTimeTrips = deliveredTrips.filter((t: any) => t.status !== TripStatus.DELAYED && !t.actual_end_time);
    const onTimeDeliveryRate = deliveredTrips.length > 0 
      ? (onTimeTrips.length / deliveredTrips.length) * 100 
      : 0;

    // Calculate average trip duration
    const tripsWithDuration = trips.filter((t: any) => 
      t.actual_start_time && t.actual_end_time
    );
    let avgTripDurationHours = 0;
    if (tripsWithDuration.length > 0) {
      const totalDuration = tripsWithDuration.reduce((sum: number, trip: any) => {
        const start = new Date(trip.actual_start_time!).getTime();
        const end = new Date(trip.actual_end_time!).getTime();
        return sum + (end - start) / (1000 * 60 * 60); // Convert to hours
      }, 0);
      avgTripDurationHours = totalDuration / tripsWithDuration.length;
    }

    // Calculate financial metrics
    const totalRevenue = trips.reduce((sum: number, trip: any) => sum + (trip.actual_income || trip.expected_income || 0), 0);
    const totalExpenses = 0; // TODO: Add expense tracking
    const estimatedProfit = totalRevenue - totalExpenses;

    // Get unique drivers, helpers, and trucks
    const uniqueDrivers = new Set(trips.filter((t: any) => t.assigned_driver_id).map((t: any) => t.assigned_driver_id));
    const uniqueTrucks = new Set(trips.filter((t: any) => t.assigned_truck_id).map((t: any) => t.assigned_truck_id));

    // Calculate fleet utilization (simplified)
    const { count: totalTrucks } = await supabase
      .from('trucks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const fleetUtilization = totalTrucks && totalTrucks > 0
      ? (uniqueTrucks.size / totalTrucks) * 100
      : 0;

    const metrics: AnalyticsMetrics = {
      period: `${dateRange.startDate.split('T')[0]} to ${dateRange.endDate.split('T')[0]}`,
      totalTrips,
      completedTrips,
      inProgressTrips,
      pendingTrips,
      scheduledTrips,
      cancelledTrips,
      delayedTrips,
      incidentReports,
      onTimeDeliveryRate: Math.round(onTimeDeliveryRate * 10) / 10,
      avgTripDurationHours: Math.round(avgTripDurationHours * 10) / 10,
      fuelEfficiency: 8.5, // TODO: Calculate from fuel records
      customerRating: 4.7, // TODO: Calculate from ratings
      totalRevenue,
      totalExpenses,
      estimatedProfit,
      activeDrivers: uniqueDrivers.size,
      activeHelpers: 0, // TODO: Track helpers separately
      activeTrucks: uniqueTrucks.size,
      fleetUtilization: Math.round(fleetUtilization * 10) / 10,
    };

    return { data: metrics };
  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    return { error: 'Failed to fetch analytics metrics' };
  }
};

/**
 * Fetch detailed trip records for export
 */
export const getTripRecords = async (
  filters: AnalyticsFilters
): Promise<ApiResponse<TripRecord[]>> => {
  try {
    const dateRange = filters.dateRange || calculateDateRange(filters.period);

    let query = supabase
      .from('trips')
      .select(`
        *,
        trucks!trips_assigned_truck_id_fkey(truck_number),
        driver:employee_profiles!trips_assigned_driver_id_fkey(employee_id, first_name, last_name)
      `)
      .gte('delivery_date', dateRange.startDate.split('T')[0])
      .lte('delivery_date', dateRange.endDate.split('T')[0])
      .order('delivery_date', { ascending: false })
      .order('call_time', { ascending: false });

    // Apply filters
    if (filters.statuses && filters.statuses.length > 0) {
      query = query.in('status', filters.statuses);
    }

    if (filters.truckIds && filters.truckIds.length > 0) {
      query = query.in('assigned_truck_id', filters.truckIds);
    }

    if (filters.driverIds && filters.driverIds.length > 0) {
      query = query.in('assigned_driver_id', filters.driverIds);
    }

    const { data: trips, error } = await query;

    if (error) {
      return { error: error.message };
    }

    if (!trips) {
      return { data: [] };
    }

    // Transform to TripRecord format
    const records: TripRecord[] = trips.map((trip: any) => ({
      tripNumber: trip.trip_number,
      deliveryReference: trip.delivery_reference,
      pickupLocation: trip.pickup_warehouse || 'N/A',
      destination: trip.delivery_destination,
      departureDateTime: trip.actual_start_time || `${trip.delivery_date} ${trip.call_time}`,
      completionDateTime: trip.actual_end_time,
      status: trip.status,
      truckPlateNumber: trip.trucks?.truck_number,
      driverName: trip.driver ? `${trip.driver.first_name} ${trip.driver.last_name}` : undefined,
      helperName: trip.porter_names?.join(', '),
      tripIncome: trip.actual_income || trip.expected_income,
      fuelBudget: undefined, // TODO: Add fuel budget
      expenses: undefined, // TODO: Add expenses
      estimatedProfit: (trip.actual_income || trip.expected_income || 0) - 0,
      delayStatus: trip.status === TripStatus.DELAYED ? 'Delayed' : 'On Time',
      incidentCount: trip.status === TripStatus.INCIDENT_REPORTED ? 1 : 0,
    }));

    return { data: records };
  } catch (error) {
    console.error('Error fetching trip records:', error);
    return { error: 'Failed to fetch trip records' };
  }
};
