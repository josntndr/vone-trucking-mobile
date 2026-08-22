/**
 * Geofence Service
 * Detects when trucks enter/exit geofenced areas
 */

import type {
  Geofence,
  GeofenceEvent,
  LocationCoordinates,
} from '../../types/location.types';
import { submitGeofenceEvent } from '../api/location.service';

export class GeofenceService {
  private static geofences: Map<string, Geofence> = new Map();
  private static lastKnownStates: Map<string, Map<string, boolean>> = new Map(); // truck -> geofence -> inside

  /**
   * Register a geofence for monitoring
   */
  static registerGeofence(geofence: Geofence): void {
    this.geofences.set(geofence.id, geofence);
    console.log(`[Geofence] Registered: ${geofence.name} (${geofence.radius_meters}m radius)`);
  }

  /**
   * Unregister a geofence
   */
  static unregisterGeofence(geofenceId: string): void {
    this.geofences.delete(geofenceId);
    console.log(`[Geofence] Unregistered: ${geofenceId}`);
  }

  /**
   * Clear all geofences
   */
  static clearAllGeofences(): void {
    this.geofences.clear();
    this.lastKnownStates.clear();
    console.log('[Geofence] Cleared all geofences');
  }

  /**
   * Check if a location is inside a geofence
   */
  static isInsideGeofence(
    location: LocationCoordinates,
    geofence: Geofence
  ): boolean {
    if (geofence.polygon && geofence.polygon.length > 0) {
      // Polygon-based geofence (future)
      return this.isInsidePolygon(location, geofence.polygon);
    } else {
      // Circle-based geofence
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.center.latitude,
        geofence.center.longitude
      );
      return distance <= geofence.radius_meters;
    }
  }

  /**
   * Check all geofences for a location update
   * Detects entry and exit events
   */
  static async checkGeofences(
    tripId: string,
    truckId: string,
    location: LocationCoordinates
  ): Promise<GeofenceEvent[]> {
    const events: GeofenceEvent[] = [];

    // Get or create truck state map
    if (!this.lastKnownStates.has(truckId)) {
      this.lastKnownStates.set(truckId, new Map());
    }
    const truckStates = this.lastKnownStates.get(truckId)!;

    // Check each geofence
    for (const [geofenceId, geofence] of this.geofences) {
      const wasInside = truckStates.get(geofenceId) || false;
      const isInside = this.isInsideGeofence(location, geofence);

      // Detect events
      if (isInside && !wasInside) {
        // Entry event
        const event: GeofenceEvent = {
          id: `gf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          geofence_id: geofenceId,
          trip_id: tripId,
          truck_id: truckId,
          event_type: 'enter',
          timestamp: new Date().toISOString(),
          coordinates: location,
        };
        events.push(event);

        // Submit to server
        await submitGeofenceEvent(event);

        console.log(`[Geofence] Truck ${truckId} ENTERED ${geofence.name}`);
      } else if (!isInside && wasInside) {
        // Exit event
        const event: GeofenceEvent = {
          id: `gf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          geofence_id: geofenceId,
          trip_id: tripId,
          truck_id: truckId,
          event_type: 'exit',
          timestamp: new Date().toISOString(),
          coordinates: location,
        };
        events.push(event);

        // Submit to server
        await submitGeofenceEvent(event);

        console.log(`[Geofence] Truck ${truckId} EXITED ${geofence.name}`);
      }

      // Update state
      truckStates.set(geofenceId, isInside);
    }

    return events;
  }

  /**
   * Get distance to nearest geofence
   */
  static getDistanceToNearestGeofence(
    location: LocationCoordinates,
    geofenceType?: Geofence['type']
  ): { geofence: Geofence; distance: number } | null {
    let nearest: { geofence: Geofence; distance: number } | null = null;

    for (const geofence of this.geofences.values()) {
      // Filter by type if specified
      if (geofenceType && geofence.type !== geofenceType) {
        continue;
      }

      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.center.latitude,
        geofence.center.longitude
      );

      // Subtract radius to get distance from edge
      const distanceFromEdge = Math.max(0, distance - geofence.radius_meters);

      if (!nearest || distanceFromEdge < nearest.distance) {
        nearest = { geofence, distance: distanceFromEdge };
      }
    }

    return nearest;
  }

  /**
   * Create geofences for trip pickup and delivery locations
   */
  static createTripGeofences(
    tripId: string,
    pickupLocation: { latitude: number; longitude: number; name: string },
    deliveryLocation: { latitude: number; longitude: number; name: string },
    radiusMeters: number = 200 // Default 200m radius
  ): void {
    // Pickup geofence
    const pickupGeofence: Geofence = {
      id: `${tripId}_pickup`,
      name: pickupLocation.name,
      type: 'pickup',
      center: {
        latitude: pickupLocation.latitude,
        longitude: pickupLocation.longitude,
      },
      radius_meters: radiusMeters,
    };
    this.registerGeofence(pickupGeofence);

    // Delivery geofence
    const deliveryGeofence: Geofence = {
      id: `${tripId}_delivery`,
      name: deliveryLocation.name,
      type: 'delivery',
      center: {
        latitude: deliveryLocation.latitude,
        longitude: deliveryLocation.longitude,
      },
      radius_meters: radiusMeters,
    };
    this.registerGeofence(deliveryGeofence);

    console.log(`[Geofence] Created trip geofences for ${tripId}`);
  }

  /**
   * Remove trip geofences
   */
  static removeTripGeofences(tripId: string): void {
    this.unregisterGeofence(`${tripId}_pickup`);
    this.unregisterGeofence(`${tripId}_delivery`);
    console.log(`[Geofence] Removed trip geofences for ${tripId}`);
  }

  /**
   * Calculate distance between two coordinates (Haversine)
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Check if point is inside polygon (Ray casting algorithm)
   */
  private static isInsidePolygon(
    point: LocationCoordinates,
    polygon: LocationCoordinates[]
  ): boolean {
    let inside = false;
    const x = point.latitude;
    const y = point.longitude;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].latitude;
      const yi = polygon[i].longitude;
      const xj = polygon[j].latitude;
      const yj = polygon[j].longitude;

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  }
}
