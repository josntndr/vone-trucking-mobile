/**
 * Location API Service
 * Handles location updates and fleet tracking data
 */

import type {
  LocationUpdate,
  TruckLocation,
  LocationHistory,
  LocationHistoryResponse,
  TruckLocationResponse,
  LocationUpdateResponse,
  GeofenceEvent,
  GPSAlert,
} from '../../types/location.types';
import type { ApiResponse } from '../../types/driver-porter.types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Submit single location update
 */
export async function submitLocationUpdate(
  update: LocationUpdate
): Promise<ApiResponse<LocationUpdateResponse>> {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/location`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`,
    //   },
    //   body: JSON.stringify(update),
    // });

    // Mock successful response
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      data: {
        success: true,
        location_id: update.id,
        timestamp: update.timestamp,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to submit location',
    };
  }
}

/**
 * Submit batch location updates (for offline sync)
 */
export async function submitLocationBatch(
  updates: LocationUpdate[]
): Promise<ApiResponse<{ success: boolean; count: number }>> {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/location/batch`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`,
    //   },
    //   body: JSON.stringify({ locations: updates }),
    // });

    // Mock successful response
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      data: {
        success: true,
        count: updates.length,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to submit locations',
    };
  }
}

/**
 * Get all active truck locations (for operator map)
 */
export async function getActiveTruckLocations(): Promise<ApiResponse<TruckLocationResponse>> {
  try {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/fleet/locations`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });

    // Mock data
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockTrucks: TruckLocation[] = [
      {
        truck_id: 'truck_001',
        truck_number: 'VT-001',
        plate_number: 'ABC 1234',
        coordinates: {
          latitude: 14.5995,
          longitude: 120.9842,
          accuracy: 15,
          heading: 90,
          speed: 15.5,
        },
        status: 'moving',
        active_trip_id: 'trip_001',
        trip_number: 'DL-2024-001',
        driver_id: 'driver_001',
        driver_name: 'Juan Dela Cruz',
        last_update: new Date().toISOString(),
        source: 'driver_phone_gps',
        gps_provider: {
          id: 'phone_001',
          name: 'Samsung Galaxy S21',
          type: 'phone',
          isActive: true,
        },
        speed_kmh: 55.8,
        heading: 90,
        pickup_location: 'Warehouse Manila',
        delivery_location: 'SM Mall of Asia',
        pickup_coordinates: {
          latitude: 14.5547,
          longitude: 121.0244,
        },
        delivery_coordinates: {
          latitude: 14.5365,
          longitude: 120.9823,
        },
        estimated_arrival: new Date(Date.now() + 45 * 60000).toISOString(),
        distance_to_destination_km: 12.5,
      },
    ];

    return {
      data: {
        trucks: mockTrucks,
        total: mockTrucks.length,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get truck locations',
    };
  }
}

/**
 * Get location history for a trip
 */
export async function getLocationHistory(
  tripId: string,
  startTime?: string,
  endTime?: string
): Promise<ApiResponse<LocationHistoryResponse>> {
  try {
    // TODO: Replace with actual API call
    const params = new URLSearchParams();
    if (startTime) params.append('start', startTime);
    if (endTime) params.append('end', endTime);

    // Mock data
    await new Promise(resolve => setTimeout(resolve, 200));

    const mockHistory: LocationHistory = {
      trip_id: tripId,
      truck_id: 'truck_001',
      start_time: new Date(Date.now() - 3600000).toISOString(),
      points: [],
      total_distance_km: 25.5,
      total_duration_minutes: 65,
    };

    return {
      data: {
        history: mockHistory,
        summary: {
          max_speed_kmh: 80,
          avg_speed_kmh: 45,
          stops_count: 2,
          moving_duration_minutes: 55,
          stopped_duration_minutes: 10,
        },
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get location history',
    };
  }
}

/**
 * Get GPS alerts for a truck or trip
 */
export async function getGPSAlerts(
  truckId?: string,
  tripId?: string
): Promise<ApiResponse<GPSAlert[]>> {
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 150));

    // Mock no alerts for now
    return {
      data: [],
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to get GPS alerts',
    };
  }
}

/**
 * Submit geofence event
 */
export async function submitGeofenceEvent(
  event: GeofenceEvent
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      data: {
        success: true,
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to submit geofence event',
    };
  }
}

/**
 * Calculate ETA based on current location and destination
 */
export async function calculateETA(
  currentLat: number,
  currentLng: number,
  destLat: number,
  destLng: number
): Promise<ApiResponse<{ eta: string; distance_km: number; duration_minutes: number }>> {
  try {
    // Simple calculation using Haversine distance
    // In production, use Google Maps Directions API or similar
    const distance = calculateDistance(currentLat, currentLng, destLat, destLng);
    const avgSpeed = 40; // km/h assumption
    const duration = (distance / avgSpeed) * 60; // minutes
    const eta = new Date(Date.now() + duration * 60000).toISOString();

    return {
      data: {
        eta,
        distance_km: distance,
        duration_minutes: Math.round(duration),
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to calculate ETA',
    };
  }
}

/**
 * Haversine distance calculation
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
