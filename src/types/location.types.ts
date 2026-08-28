/**
 * Location Tracking Types
 * Types for GPS tracking, fleet mapping, and location-based features
 */

// ==================== Location Data ====================

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null; // meters
  altitudeAccuracy?: number | null;
  heading?: number | null; // degrees (0-360, 0 = North)
  speed?: number | null; // m/s
}

export interface LocationUpdate {
  id: string;
  trip_id: string;
  truck_id: string;
  driver_id: string;
  coordinates: LocationCoordinates;
  timestamp: string; // ISO 8601
  source: LocationSource;
  battery_level?: number; // 0-100
  is_mock?: boolean; // Android mock location detection
  
  // Flattened coordinate properties for backward compatibility
  latitude?: number;
  longitude?: number;
  accuracy?: number; // meters
  altitude?: number;
  speed?: number; // m/s
  heading?: number; // degrees
  
  // GPS quality indicators
  satelliteCount?: number;
  isMock?: boolean; // Alias for is_mock
}

export type LocationSource = 
  | 'driver_phone_gps'      // Driver's phone GPS
  | 'truck_gps_device'      // Hardware GPS tracker (future)
  | 'manual_entry';         // Manually entered (emergency fallback)

// ==================== GPS Health ====================

/**
 * GPS Health Status
 * Indicates the overall health of GPS tracking
 */
export interface GPSHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  signal_strength: number; // 1-5 scale
  accuracy_meters: number;
  last_fix_age_seconds: number;
  satellite_count: number;
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Backward compatibility aliases
  signalStrength?: number;
  accuracy?: number;
  lastUpdate?: string | Date;
  isAvailable?: boolean;
  satelliteCount?: number;
}

// ==================== GPS Tracker Abstraction ====================

/**
 * Abstract GPS Tracker Interface
 * Provider-independent interface for GPS data sources
 * Supports both phone GPS and future hardware integration
 */
export interface GPSTrackerProvider {
  id: string;
  name: string;
  type: 'phone' | 'hardware';
  isActive: boolean;
  lastUpdate?: string;
}

export interface PhoneGPSProvider extends GPSTrackerProvider {
  type: 'phone';
  deviceId: string;
  osType: 'ios' | 'android';
  appVersion: string;
}

/**
 * Hardware GPS Tracker Interface (Future Integration)
 * 
 * IMPORTANT: Do not implement until the following are provided:
 * - GPS tracker brand/model
 * - Provider platform details
 * - API documentation
 * - API credentials
 * - Device identification method
 */
export interface HardwareGPSProvider extends GPSTrackerProvider {
  type: 'hardware';
  brand?: string;          // e.g., "Teltonika", "Queclink", "CalAmp"
  model?: string;          // e.g., "FMB920", "GL300W"
  deviceImei?: string;     // IMEI for cellular devices
  serialNumber?: string;
  apiEndpoint?: string;
  apiKey?: string;         // Store securely, never expose
}

// ==================== Truck Status ====================

export type TruckStatus = 
  | 'moving'     // Speed > threshold (e.g., 5 km/h)
  | 'idle'       // Engine on but not moving
  | 'stopped'    // Engine off
  | 'offline';   // No update received for X minutes

export interface TruckLocation {
  truck_id: string;
  truck_number: string;
  plate_number: string;
  
  // Current position
  coordinates: LocationCoordinates;
  status: TruckStatus;
  
  // Trip information
  active_trip_id?: string;
  trip_number?: string;
  driver_id?: string;
  driver_name?: string;
  porter_id?: string;
  porter_name?: string;
  
  // Location metadata
  last_update: string;
  source: LocationSource;
  gps_provider: GPSTrackerProvider;
  
  // Movement data
  speed_kmh?: number;
  heading?: number; // degrees
  
  // Destinations
  pickup_location?: string;
  delivery_location?: string;
  pickup_coordinates?: LocationCoordinates;
  delivery_coordinates?: LocationCoordinates;
  
  // ETA
  estimated_arrival?: string;
  distance_to_destination_km?: number;
}

// ==================== Location History ====================

export interface LocationHistoryPoint {
  id: string;
  coordinates: LocationCoordinates;
  timestamp: string;
  speed_kmh?: number;
  heading?: number;
  status: TruckStatus;
}

export interface LocationHistory {
  trip_id: string;
  truck_id: string;
  start_time: string;
  end_time?: string;
  points: LocationHistoryPoint[];
  total_distance_km: number;
  total_duration_minutes: number;
}

// ==================== Geofence ====================

export interface Geofence {
  id: string;
  name: string;
  type: 'pickup' | 'delivery' | 'warehouse' | 'checkpoint';
  center: LocationCoordinates;
  radius_meters: number;
  
  // Optional polygon for complex shapes (future)
  polygon?: LocationCoordinates[];
}

export interface GeofenceEvent {
  id: string;
  geofence_id: string;
  trip_id: string;
  truck_id: string;
  event_type: 'enter' | 'exit' | 'dwell';
  timestamp: string;
  coordinates: LocationCoordinates;
}

// ==================== Location Permissions ====================

export type LocationPermissionStatus = 
  | 'granted'
  | 'denied'
  | 'undetermined';

export type BackgroundLocationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'restricted' // iOS: when always access is denied but when-in-use is granted
  | 'undetermined';

export interface LocationPermissions {
  foreground: LocationPermissionStatus;
  background: BackgroundLocationPermissionStatus;
  precisioLocation: boolean; // iOS 14+: precise vs approximate
}

// ==================== Location Tracking Config ====================

export interface LocationTrackingConfig {
  // Update intervals
  updateIntervalMs: number;           // Normal update frequency (e.g., 30000 = 30s)
  fastestUpdateIntervalMs: number;    // Minimum time between updates (e.g., 10000 = 10s)
  
  // Distance threshold
  distanceFilterMeters: number;       // Minimum distance for update (e.g., 50m)
  
  // Accuracy
  desiredAccuracyMeters: number;      // Target accuracy (e.g., 100m)
  
  // Battery optimization
  deferredUpdatesInterval?: number;   // iOS: batch updates when possible
  pausesUpdatesAutomatically?: boolean; // iOS: pause when stationary
  
  // Background behavior
  showsBackgroundLocationIndicator?: boolean; // iOS: show blue bar
  activityType?: 'automotive' | 'other'; // iOS: optimize for driving
  
  // Foreground service (Android)
  foregroundServiceTitle?: string;
  foregroundServiceMessage?: string;
}

// ==================== GPS Health ====================

export interface GPSHealth {
  status: 'healthy' | 'weak' | 'unavailable';
  accuracy_meters?: number;
  satellite_count?: number; // If available from hardware
  last_fix_age_seconds: number;
  signal_strength?: 'excellent' | 'good' | 'fair' | 'poor';
  
  // CamelCase aliases for backward compatibility
  accuracy?: number; // Alias for accuracy_meters
  satelliteCount?: number; // Alias for satellite_count
  signalStrength?: 'excellent' | 'good' | 'fair' | 'poor'; // Alias for signal_strength
  isAvailable?: boolean; // Computed from status
  lastUpdate?: string; // Last successful location update timestamp
}

export interface GPSAlert {
  id: string;
  trip_id: string;
  truck_id: string;
  type: 'gps_offline' | 'weak_signal' | 'stale_location' | 'mock_location_detected';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolved_at?: string;
}

// ==================== Route & Navigation ====================

export interface RoutePoint {
  coordinates: LocationCoordinates;
  instruction?: string;
  distance_from_previous_meters?: number;
  duration_from_previous_seconds?: number;
}

export interface Route {
  id: string;
  trip_id: string;
  origin: LocationCoordinates;
  destination: LocationCoordinates;
  waypoints?: LocationCoordinates[];
  
  // Route data
  points: RoutePoint[];
  total_distance_meters: number;
  total_duration_seconds: number;
  
  // Metadata
  created_at: string;
  source: 'google_maps' | 'waze' | 'manual';
}

// ==================== Map Preferences ====================

export interface MapPreferences {
  defaultZoom: number;
  followTruck: boolean;
  showTraffic: boolean;
  showRoute: boolean;
  showHistory: boolean;
  historyDuration: number; // minutes
  mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
}

// ==================== Arrival Detection ====================

export interface ArrivalDetection {
  geofence_id: string;
  geofence_name: string;
  geofence_type: 'pickup' | 'delivery';
  entered_at: string;
  detected_at: string;
  coordinates: LocationCoordinates;
  distance_from_center_meters: number;
  auto_triggered: boolean; // vs manual confirmation
}

// ==================== Location API Responses ====================

export interface LocationUpdateResponse {
  success: boolean;
  location_id?: string;
  timestamp?: string;
  error?: string;
}

export interface TruckLocationResponse {
  trucks: TruckLocation[];
  total: number;
  timestamp: string;
}

export interface LocationHistoryResponse {
  history: LocationHistory;
  summary: {
    max_speed_kmh: number;
    avg_speed_kmh: number;
    stops_count: number;
    moving_duration_minutes: number;
    stopped_duration_minutes: number;
  };
}
