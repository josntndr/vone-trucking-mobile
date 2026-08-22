/**
 * Driver and Porter Service
 * Handles assignments, status updates, reports, and submissions
 */

import { supabase } from './supabase';
import { ApiResponse } from '../../types';
import type {
  Assignment,
  AssignmentStatus,
  StatusUpdatePayload,
  DelayReport,
  IncidentReport,
  TruckProblemReport,
  FuelEntry,
  Receipt,
  OdometerReading,
  ProofOfDelivery,
  LoadingChecklist,
  DeliveryChecklist,
  PorterTimeEntry,
  ProductDiscrepancy,
  Payslip,
  CashAdvance,
  Notification,
  DashboardStats,
} from '../../types/driver-porter.types';
import type { Trip, TripStatus } from '../../types/trip.types';

/**
 * Get driver/porter assignments
 */
export const getMyAssignments = async (
  status?: 'today' | 'upcoming' | 'completed'
): Promise<ApiResponse<Assignment[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Get user's employee profile to determine role
    const { data: profile } = await supabase
      .from('employee_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return { error: 'Employee profile not found' };
    }

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    let query = supabase
      .from('trip_assignments')
      .select(`
        *,
        trip:trips(*),
        truck:trucks(*),
        driver:employee_profiles!driver_id(*),
        porter:employee_profiles!porter_id(*)
      `);

    // Filter by role
    if (profile.role === 'driver') {
      query = query.eq('driver_id', user.id);
    } else if (profile.role === 'porter') {
      query = query.eq('porter_id', user.id);
    }

    // Filter by status
    if (status === 'today') {
      query = query.eq('trip.delivery_date', today);
    } else if (status === 'upcoming') {
      query = query.gte('trip.delivery_date', tomorrow);
    } else if (status === 'completed') {
      query = query.eq('trip.status', 'completed');
    }

    const { data, error } = await query;

    if (error) {
      return { error: error.message };
    }

    // Transform to Assignment type
    const assignments: Assignment[] = (data || []).map((item: any) => ({
      id: item.id,
      trip_id: item.trip_id,
      trip: item.trip,
      assignment_status: item.assignment_status || 'pending',
      acknowledged_at: item.acknowledged_at,
      acknowledged_location: item.acknowledged_location,
      rejection_reason: item.rejection_reason,
      truck: item.truck,
      driver: item.driver,
      porters: item.porter ? [item.porter] : [],
    }));

    return { data: assignments };
  } catch (error) {
    return { error: 'Failed to fetch assignments' };
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Get today's trips
    const todayResponse = await getMyAssignments('today');
    const upcomingResponse = await getMyAssignments('upcoming');
    const completedResponse = await getMyAssignments('completed');

    const todayTrips = todayResponse.data?.length || 0;
    const upcomingTrips = upcomingResponse.data?.length || 0;
    const completedTrips = completedResponse.data?.length || 0;
    const pendingAcks = todayResponse.data?.filter(
      a => a.assignment_status === 'pending'
    ).length || 0;

    const stats: DashboardStats = {
      today_trips: todayTrips,
      upcoming_trips: upcomingTrips,
      completed_trips: completedTrips,
      pending_acknowledgements: pendingAcks,
    };

    return { data: stats };
  } catch (error) {
    return { error: 'Failed to fetch dashboard stats' };
  }
};

/**
 * Acknowledge assignment
 */
export const acknowledgeAssignment = async (
  assignmentId: string,
  location?: { latitude: number; longitude: number }
): Promise<ApiResponse<Assignment>> => {
  try {
    const { data, error } = await supabase
      .from('trip_assignments')
      .update({
        assignment_status: 'acknowledged',
        acknowledged_at: new Date().toISOString(),
        acknowledged_location: location,
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: data as any, message: 'Assignment acknowledged' };
  } catch (error) {
    return { error: 'Failed to acknowledge assignment' };
  }
};

/**
 * Reject assignment
 */
export const rejectAssignment = async (
  assignmentId: string,
  reason: string
): Promise<ApiResponse<Assignment>> => {
  try {
    const { data, error } = await supabase
      .from('trip_assignments')
      .update({
        assignment_status: 'rejected',
        rejection_reason: reason,
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: data as any, message: 'Assignment rejected' };
  } catch (error) {
    return { error: 'Failed to reject assignment' };
  }
};

/**
 * Update trip status
 */
export const updateTripStatus = async (
  payload: StatusUpdatePayload
): Promise<ApiResponse<Trip>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Update trip status
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .update({
        status: payload.new_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.trip_id)
      .select()
      .single();

    if (tripError) {
      return { error: tripError.message };
    }

    // Record status history
    const { error: historyError } = await supabase
      .from('trip_status_history')
      .insert({
        trip_id: payload.trip_id,
        previous_status: trip.status,
        new_status: payload.new_status,
        changed_by: user.id,
        changed_at: payload.timestamp || new Date().toISOString(),
        location: payload.location,
        notes: payload.notes,
      });

    if (historyError) {
      console.error('Failed to record status history:', historyError);
    }

    // Record odometer if provided
    if (payload.odometer_reading) {
      await supabase.from('odometer_readings').insert({
        trip_id: payload.trip_id,
        truck_id: trip.assigned_truck_id,
        driver_id: user.id,
        reading_type: payload.new_status === 'dispatched' ? 'start' : 'end',
        reading: payload.odometer_reading,
        recorded_at: new Date().toISOString(),
        location: payload.location,
      });
    }

    return { data: trip, message: 'Status updated successfully' };
  } catch (error) {
    return { error: 'Failed to update trip status' };
  }
};

/**
 * Submit delay report
 */
export const submitDelayReport = async (
  report: Omit<DelayReport, 'id' | 'reported_at'>
): Promise<ApiResponse<DelayReport>> => {
  try {
    const { data, error } = await supabase
      .from('delay_reports')
      .insert({
        ...report,
        reported_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Update trip status to delayed
    await supabase
      .from('trips')
      .update({ status: 'delayed' })
      .eq('id', report.trip_id);

    return { data: data as DelayReport, message: 'Delay report submitted' };
  } catch (error) {
    return { error: 'Failed to submit delay report' };
  }
};

/**
 * Submit incident report
 */
export const submitIncidentReport = async (
  report: Omit<IncidentReport, 'id' | 'reported_at'>
): Promise<ApiResponse<IncidentReport>> => {
  try {
    const { data, error } = await supabase
      .from('incident_reports')
      .insert({
        ...report,
        reported_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Update trip status to incident_reported
    await supabase
      .from('trips')
      .update({ status: 'incident_reported' })
      .eq('id', report.trip_id);

    return { data: data as IncidentReport, message: 'Incident report submitted' };
  } catch (error) {
    return { error: 'Failed to submit incident report' };
  }
};

/**
 * Submit truck problem report
 */
export const submitTruckProblemReport = async (
  report: Omit<TruckProblemReport, 'id' | 'reported_at'>
): Promise<ApiResponse<TruckProblemReport>> => {
  try {
    const { data, error } = await supabase
      .from('truck_problem_reports')
      .insert({
        ...report,
        reported_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: data as TruckProblemReport, message: 'Truck problem report submitted' };
  } catch (error) {
    return { error: 'Failed to submit truck problem report' };
  }
};

/**
 * Submit fuel entry
 */
export const submitFuelEntry = async (
  entry: Omit<FuelEntry, 'id' | 'created_at'>
): Promise<ApiResponse<FuelEntry>> => {
  try {
    const { data, error } = await supabase
      .from('fuel_entries')
      .insert({
        ...entry,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: data as FuelEntry, message: 'Fuel entry submitted' };
  } catch (error) {
    return { error: 'Failed to submit fuel entry' };
  }
};

/**
 * Submit receipt
 */
export const submitReceipt = async (
  receipt: Omit<Receipt, 'id' | 'created_at'>
): Promise<ApiResponse<Receipt>> => {
  try {
    const { data, error } = await supabase
      .from('receipts')
      .insert({
        ...receipt,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: data as Receipt, message: 'Receipt submitted' };
  } catch (error) {
    return { error: 'Failed to submit receipt' };
  }
};

/**
 * Record odometer reading
 */
export const recordOdometerReading = async (
  reading: Omit<OdometerReading, 'id'>
): Promise<ApiResponse<OdometerReading>> => {
  try {
    const { data, error } = await supabase
      .from('odometer_readings')
      .insert(reading)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: data as OdometerReading, message: 'Odometer reading recorded' };
  } catch (error) {
    return { error: 'Failed to record odometer reading' };
  }
};

/**
 * Submit proof of delivery
 */
export const submitProofOfDelivery = async (
  pod: Omit<ProofOfDelivery, 'id'>
): Promise<ApiResponse<ProofOfDelivery>> => {
  try {
    const { data, error } = await supabase
      .from('proof_of_deliveries')
      .insert(pod)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Update trip status to delivered
    await supabase
      .from('trips')
      .update({ status: 'delivered' })
      .eq('id', pod.trip_id);

    return { data: data as ProofOfDelivery, message: 'Proof of delivery submitted' };
  } catch (error) {
    return { error: 'Failed to submit proof of delivery' };
  }
};

/**
 * Submit loading checklist (Porter)
 */
export const submitLoadingChecklist = async (
  checklist: Omit<LoadingChecklist, 'id'>
): Promise<ApiResponse<LoadingChecklist>> => {
  try {
    const { data, error } = await supabase
      .from('loading_checklists')
      .insert(checklist)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: data as LoadingChecklist, message: 'Loading checklist submitted' };
  } catch (error) {
    return { error: 'Failed to submit loading checklist' };
  }
};

/**
 * Submit delivery checklist (Porter)
 */
export const submitDeliveryChecklist = async (
  checklist: Omit<DeliveryChecklist, 'id'>
): Promise<ApiResponse<DeliveryChecklist>> => {
  try {
    const { data, error } = await supabase
      .from('delivery_checklists')
      .insert(checklist)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: data as DeliveryChecklist, message: 'Delivery checklist submitted' };
  } catch (error) {
    return { error: 'Failed to submit delivery checklist' };
  }
};

/**
 * Record porter time entry
 */
export const recordPorterTime = async (
  timeEntry: Partial<PorterTimeEntry> & { trip_id: string; porter_id: string }
): Promise<ApiResponse<PorterTimeEntry>> => {
  try {
    // Check if entry exists
    const { data: existing } = await supabase
      .from('porter_time_entries')
      .select('*')
      .eq('trip_id', timeEntry.trip_id)
      .eq('porter_id', timeEntry.porter_id)
      .single();

    let data, error;

    if (existing) {
      // Update existing entry
      ({ data, error } = await supabase
        .from('porter_time_entries')
        .update(timeEntry)
        .eq('id', existing.id)
        .select()
        .single());
    } else {
      // Create new entry
      ({ data, error } = await supabase
        .from('porter_time_entries')
        .insert(timeEntry)
        .select()
        .single());
    }

    if (error) {
      return { error: error.message };
    }

    return { data: data as PorterTimeEntry, message: 'Time entry recorded' };
  } catch (error) {
    return { error: 'Failed to record time entry' };
  }
};

/**
 * Submit product discrepancy
 */
export const submitProductDiscrepancy = async (
  discrepancy: Omit<ProductDiscrepancy, 'id' | 'reported_at'>
): Promise<ApiResponse<ProductDiscrepancy>> => {
  try {
    const { data, error } = await supabase
      .from('product_discrepancies')
      .insert({
        ...discrepancy,
        reported_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: data as ProductDiscrepancy, message: 'Discrepancy report submitted' };
  } catch (error) {
    return { error: 'Failed to submit discrepancy report' };
  }
};

/**
 * Get payslips
 */
export const getMyPayslips = async (): Promise<ApiResponse<Payslip[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('payslips')
      .select('*')
      .eq('employee_id', user.id)
      .order('period_end', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { data: data as Payslip[] };
  } catch (error) {
    return { error: 'Failed to fetch payslips' };
  }
};

/**
 * Get cash advances
 */
export const getMyCashAdvances = async (): Promise<ApiResponse<CashAdvance[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('cash_advances')
      .select('*')
      .eq('employee_id', user.id)
      .order('requested_at', { ascending: false });

    if (error) {
      return { error: error.message };
    }

    return { data: data as CashAdvance[] };
  } catch (error) {
    return { error: 'Failed to fetch cash advances' };
  }
};

/**
 * Request cash advance
 */
export const requestCashAdvance = async (
  amount: number,
  reason: string
): Promise<ApiResponse<CashAdvance>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('cash_advances')
      .insert({
        employee_id: user.id,
        amount,
        reason,
        status: 'pending',
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { data: data as CashAdvance, message: 'Cash advance request submitted' };
  } catch (error) {
    return { error: 'Failed to request cash advance' };
  }
};

/**
 * Get notifications
 */
export const getMyNotifications = async (
  unreadOnly: boolean = false
): Promise<ApiResponse<Notification[]>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) {
      return { error: error.message };
    }

    return { data: data as Notification[] };
  } catch (error) {
    return { error: 'Failed to fetch notifications' };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (
  notificationId: string
): Promise<ApiResponse<void>> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      return { error: error.message };
    }

    return { message: 'Notification marked as read' };
  } catch (error) {
    return { error: 'Failed to mark notification as read' };
  }
};

/**
 * Upload photo to storage
 */
export const uploadPhoto = async (
  uri: string,
  folder: string,
  filename: string
): Promise<ApiResponse<string>> => {
  try {
    // In a real implementation, this would:
    // 1. Convert URI to blob
    // 2. Upload to Supabase Storage
    // 3. Return public URL
    
    // For now, return mock URL
    const mockUrl = `https://storage.supabase.co/${folder}/${filename}`;
    return { data: mockUrl };
  } catch (error) {
    return { error: 'Failed to upload photo' };
  }
};

/**
 * Get current location
 */
export const getCurrentLocation = async (): Promise<
  ApiResponse<{ latitude: number; longitude: number }>
> => {
  try {
    // In a real implementation, this would use expo-location
    // For now, return mock location
    return {
      data: {
        latitude: 14.5995,
        longitude: 120.9842,
      },
    };
  } catch (error) {
    return { error: 'Failed to get location' };
  }
};
