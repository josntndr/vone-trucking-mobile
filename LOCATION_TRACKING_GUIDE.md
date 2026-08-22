# Location Tracking & Fleet Mapping - Implementation Guide

## Overview

This guide covers the complete location tracking system implementation, including driver app GPS tracking, operator fleet map, privacy controls, and testing procedures.

---

## Architecture

### Mobile App (Driver)
- **Location Permission Management**: Proper foreground/background permission requests with explanations
- **Trip-Based Tracking**: GPS tracking ONLY during active trips
- **Background Service**: Continues tracking when app is backgrounded
- **Offline Queue**: Stores location updates when offline, syncs when online
- **Battery Optimization**: Smart update intervals (30s normal, 10s min, 50m distance filter)
- **Privacy First**: Tracking automatically stops when trip completes

### Operator Dashboard (Web)
- **Real-Time Map**: Shows all active trucks on Google Maps
- **Truck Markers**: Color-coded by status (moving/idle/stopped/offline)
- **Live Updates**: WebSocket or polling for position updates
- **Truck Details**: Bottom sheet with full truck/driver/trip info
- **Route Display**: Pickup → destination with ETA
- **Location History**: Breadcrumb trail showing recent path
- **Geofence Visualization**: Pickup/delivery boundaries

### Backend API
- **Location Endpoints**: Receive and store GPS updates
- **Fleet Tracking**: Provide real-time truck positions
- **History Storage**: Store location history for trips
- **Geofence Processing**: Detect arrival/departure events
- **Alert System**: Monitor GPS health and offline trucks

---

## Mobile App Integration

### 1. Add Location Tracking to Trip Detail Screen

Update `app/(driver)/trips/[id].tsx`:

```typescript
import { useLocationTracking } from '../../../src/hooks/useLocationTracking';
import { LocationTrackingCard } from '../../../src/components/location/LocationTrackingCard';
import { GeofenceService } from '../../../src/services/location/GeofenceService';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const [trip, setTrip] = useState<Assignment | null>(null);
  
  // Add location tracking
  const {
    isTracking,
    hasRequiredPermissions,
    requestPermissions,
    showPrivacyInfo,
    startTracking,
    stopTracking,
    gpsHealth,
    currentLocation,
  } = useLocationTracking();

  // Start tracking when trip becomes active
  useEffect(() => {
    if (!trip) return;
    
    const shouldTrack = [
      'at_warehouse',
      'loading',
      'dispatch',
      'in_transit',
      'arrive_at_destination',
      'unloading',
    ].includes(trip.trip.status);

    if (shouldTrack && !isTracking) {
      // Start tracking
      startTracking(trip.trip_id, trip.truck!.id, trip.driver!.id);
      
      // Create geofences
      if (trip.trip.pickup_coordinates && trip.trip.delivery_coordinates) {
        GeofenceService.createTripGeofences(
          trip.trip_id,
          {
            ...trip.trip.pickup_coordinates,
            name: trip.trip.pickup_warehouse,
          },
          {
            ...trip.trip.delivery_coordinates,
            name: trip.trip.delivery_destination,
          }
        );
      }
    } else if (!shouldTrack && isTracking) {
      // Stop tracking
      stopTracking();
      GeofenceService.removeTripGeofences(trip.trip_id);
    }
  }, [trip?.trip.status, isTracking]);

  return (
    <ScrollView>
      {/* Existing trip details */}
      
      {/* Add location tracking card */}
      <LocationTrackingCard
        isTracking={isTracking}
        gpsHealth={gpsHealth}
        currentLocation={currentLocation}
        hasRequiredPermissions={hasRequiredPermissions}
        onRequestPermissions={requestPermissions}
        onShowPrivacyInfo={showPrivacyInfo}
      />
      
      {/* Rest of content */}
    </ScrollView>
  );
}
```

### 2. Required Packages

Add to `package.json`:

```json
{
  "dependencies": {
    "expo-location": "~17.0.1",
    "expo-task-manager": "~11.8.2",
    "expo-device": "~6.0.2"
  }
}
```

Install:
```bash
npm install expo-location expo-task-manager expo-device
```

### 3. App Configuration

Update `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Vone Trucking needs your location to track deliveries and update dispatch. Location is only tracked during active trips.",
          "isIosBackgroundLocationEnabled": true,
          "isAndroidBackgroundLocationEnabled": true,
          "isAndroidForegroundServiceEnabled": true
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Vone Trucking needs your location to track deliveries and update dispatch.",
        "NSLocationAlwaysUsageDescription": "Vone Trucking needs background location access to track deliveries when the app is not in use. Location is only tracked during active trips.",
        "UIBackgroundModes": ["location"]
      }
    },
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION"
      ]
    }
  }
}
```

---

## Operator Map Implementation

### Option 1: Standalone HTML Page

Create `operator-map.html` (see separate file) with:
- Google Maps JavaScript API
- Real-time truck markers
- WebSocket or polling for updates
- Truck detail sidebar
- Status filters
- Search functionality

### Option 2: React Web Dashboard

```typescript
// components/FleetMap.tsx
import { GoogleMap, Marker, InfoWindow, Polyline } from '@react-google-maps/api';

export function FleetMap() {
  const [trucks, setTrucks] = useState<TruckLocation[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<TruckLocation | null>(null);

  // Fetch truck locations
  useEffect(() => {
    const fetchTrucks = async () => {
      const response = await fetch('/api/fleet/locations');
      const data = await response.json();
      setTrucks(data.trucks);
    };

    // Initial fetch
    fetchTrucks();

    // Poll every 30 seconds
    const interval = setInterval(fetchTrucks, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTruckIcon = (status: TruckStatus) => {
    const colors = {
      moving: '#4CAF50',    // Green
      idle: '#FFC107',      // Yellow
      stopped: '#9E9E9E',   // Gray
      offline: '#F44336',   // Red
    };
    
    return {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: colors[status],
      fillOpacity: 1,
      strokeColor: '#fff',
      strokeWeight: 2,
      scale: 6,
      rotation: truck.heading || 0,
    };
  };

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100vh' }}
      center={{ lat: 14.5995, lng: 120.9842 }} // Manila
      zoom={12}
    >
      {trucks.map(truck => (
        <Marker
          key={truck.truck_id}
          position={{
            lat: truck.coordinates.latitude,
            lng: truck.coordinates.longitude,
          }}
          icon={getTruckIcon(truck.status)}
          onClick={() => setSelectedTruck(truck)}
          label={{
            text: truck.truck_number,
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        />
      ))}

      {selectedTruck && (
        <InfoWindow
          position={{
            lat: selectedTruck.coordinates.latitude,
            lng: selectedTruck.coordinates.longitude,
          }}
          onCloseClick={() => setSelectedTruck(null)}
        >
          <TruckInfoCard truck={selectedTruck} />
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
```

---

## Backend API Endpoints

### POST /api/location

Receive location update from driver app:

```typescript
{
  "id": "loc_123",
  "trip_id": "trip_001",
  "truck_id": "truck_001",
  "driver_id": "driver_001",
  "coordinates": {
    "latitude": 14.5995,
    "longitude": 120.9842,
    "accuracy": 15,
    "heading": 90,
    "speed": 15.5
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "driver_phone_gps",
  "battery_level": 85
}
```

### POST /api/location/batch

Batch upload for offline sync:

```typescript
{
  "locations": [
    { /* location 1 */ },
    { /* location 2 */ },
    // ...
  ]
}
```

### GET /api/fleet/locations

Get all active truck locations:

```typescript
{
  "trucks": [
    {
      "truck_id": "truck_001",
      "truck_number": "VT-001",
      "plate_number": "ABC 1234",
      "coordinates": { ... },
      "status": "moving",
      "speed_kmh": 55,
      "heading": 90,
      "active_trip_id": "trip_001",
      "driver_name": "Juan Dela Cruz",
      "last_update": "2024-01-15T10:30:00Z",
      "source": "driver_phone_gps"
    }
  ],
  "total": 5,
  "timestamp": "2024-01-15T10:30:05Z"
}
```

### GET /api/location/history/:tripId

Get location history for a trip:

```typescript
{
  "history": {
    "trip_id": "trip_001",
    "truck_id": "truck_001",
    "start_time": "2024-01-15T08:00:00Z",
    "end_time": "2024-01-15T10:30:00Z",
    "points": [
      {
        "id": "loc_1",
        "coordinates": { ... },
        "timestamp": "2024-01-15T08:00:00Z",
        "speed_kmh": 0,
        "status": "stopped"
      },
      // ... more points
    ],
    "total_distance_km": 25.5,
    "total_duration_minutes": 150
  },
  "summary": {
    "max_speed_kmh": 80,
    "avg_speed_kmh": 45,
    "stops_count": 3,
    "moving_duration_minutes": 120,
    "stopped_duration_minutes": 30
  }
}
```

### POST /api/geofence/event

Geofence entry/exit notification:

```typescript
{
  "id": "gf_event_123",
  "geofence_id": "trip_001_pickup",
  "trip_id": "trip_001",
  "truck_id": "truck_001",
  "event_type": "enter",
  "timestamp": "2024-01-15T08:15:00Z",
  "coordinates": { ... }
}
```

---

## Database Schema

### locations Table

```sql
CREATE TABLE locations (
  id VARCHAR(50) PRIMARY KEY,
  trip_id VARCHAR(50) NOT NULL,
  truck_id VARCHAR(50) NOT NULL,
  driver_id VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  altitude DECIMAL(10, 2),
  accuracy DECIMAL(10, 2),
  heading DECIMAL(5, 2),
  speed DECIMAL(8, 2),
  timestamp TIMESTAMP NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'driver_phone_gps', 'truck_gps_device'
  battery_level INT,
  is_mock BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_trip_timestamp (trip_id, timestamp),
  INDEX idx_truck_timestamp (truck_id, timestamp),
  INDEX idx_timestamp (timestamp)
);
```

### geofence_events Table

```sql
CREATE TABLE geofence_events (
  id VARCHAR(50) PRIMARY KEY,
  geofence_id VARCHAR(50) NOT NULL,
  trip_id VARCHAR(50) NOT NULL,
  truck_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(20) NOT NULL, -- 'enter', 'exit', 'dwell'
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_trip_timestamp (trip_id, timestamp),
  INDEX idx_geofence (geofence_id)
);
```

### gps_alerts Table

```sql
CREATE TABLE gps_alerts (
  id VARCHAR(50) PRIMARY KEY,
  trip_id VARCHAR(50),
  truck_id VARCHAR(50) NOT NULL,
  alert_type VARCHAR(50) NOT NULL, -- 'gps_offline', 'weak_signal', 'stale_location'
  severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
  message TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_truck_active (truck_id, resolved),
  INDEX idx_timestamp (timestamp)
);
```

---

## Privacy & Compliance

### What We Track
✅ Location during active trips only
✅ GPS accuracy and signal strength
✅ Battery level (to optimize tracking)
✅ Speed and heading
✅ Source (phone GPS vs hardware)

### What We DON'T Track
❌ Location outside work hours
❌ Location when no active trip
❌ Personal destinations
❌ Off-duty movements
❌ Audio or video
❌ Browsing history

### Automatic Safeguards
- Tracking starts ONLY when trip status is active
- Tracking stops automatically when trip completes
- No location stored for personal use
- 90-day automatic data deletion
- Encrypted transmission (HTTPS)
- Secure server storage

### Employee Rights
- View their own location data
- Request data deletion (after trip completion)
- Opt-out disables future trip assignments
- Clear notification when tracking is active
- Access to privacy policy

### Legal Compliance (Philippines)
- Data Privacy Act of 2012 compliance
- Employee consent obtained during onboarding
- Clear purpose: delivery tracking and safety
- Limited data retention (90 days)
- Secure data handling

---

## Testing Procedures

### 1. Permission Tests

**Test: Initial Permission Request**
```
1. Fresh install app
2. Login as driver
3. View trip detail (active trip)
4. Should see permission request with explanation
5. Grant foreground permission
6. Should see background permission request
7. Grant background permission
8. Should show "Tracking active"
```

**Test: Permission Denied**
```
1. Deny foreground permission
2. Should show "Permission Required" card
3. Tap "Enable Location"
4. Should open Settings
5. Grant permission in Settings
6. Return to app
7. Should detect permission granted
```

**Test: Background Permission Denied**
```
1. Grant foreground only
2. Deny background
3. Should show warning about limited tracking
4. App should still track in foreground
5. Backgrounding app should pause updates
```

### 2. Tracking Start/Stop Tests

**Test: Auto-Start on Trip Active**
```
1. Trip status: "acknowledged"
2. No tracking active
3. Update status to "at_warehouse"
4. Tracking should start automatically
5. Notification should appear (Android)
6. Blue bar should appear (iOS)
```

**Test: Auto-Stop on Trip Complete**
```
1. Tracking active during trip
2. Complete trip
3. Tracking should stop
4. Notification should dismiss (Android)
5. Blue bar should dismiss (iOS)
6. Queued locations should sync
```

**Test: Manual Stop Handling**
```
1. Tracking active
2. Force stop from system settings
3. Reopen app
4. Should detect tracking stopped
5. Should offer to restart
```

### 3. Background Tracking Tests

**Test: App Backgrounded**
```
1. Start tracking
2. Background the app
3. Wait 5 minutes
4. Check location updates on server
5. Should have multiple updates
6. Updates should be ~30s apart
```

**Test: App Killed**
```
1. Start tracking
2. Force kill app
3. Wait 5 minutes
4. Check location updates on server
5. Should continue receiving updates
6. Background task should persist
```

**Test: Device Restart**
```
1. Start tracking
2. Restart device
3. App should auto-restart tracking (if configured)
4. Or prompt to resume on next app open
```

### 4. Offline Tests

**Test: Offline Location Queue**
```
1. Start tracking
2. Enable airplane mode
3. Move around (simulate with mock locations)
4. Check AsyncStorage for queued locations
5. Should have stored updates
6. Disable airplane mode
7. Should auto-sync queued locations
```

**Test: Partial Connectivity**
```
1. Simulate poor network (dev tools)
2. Some updates should succeed
3. Failed updates should queue
4. Should retry on better connection
```

### 5. GPS Health Tests

**Test: Weak GPS Signal**
```
1. Move indoors (weak GPS)
2. GPS health should show "weak"
3. Should show warning card
4. Accuracy should increase (>50m)
5. Move outdoors
6. Should recover to "healthy"
```

**Test: GPS Unavailable**
```
1. Disable location services
2. GPS health should show "unavailable"
3. Should show error card
4. Should alert operator
5. Re-enable location
6. Should recover
```

**Test: Mock Location Detection**
```
1. Enable mock location app (Android)
2. Should detect mock location
3. Should show warning
4. Should flag in location data
5. Should alert operator
```

### 6. Battery Tests

**Test: Battery Drain**
```
1. Start with 100% battery
2. Enable tracking for 8 hours
3. Monitor battery usage
4. Should be <10% total drain
5. Compare to industry standards
```

**Test: Low Battery Optimization**
```
1. Battery <20%
2. Tracking should continue
3. May reduce update frequency
4. Should prioritize accuracy
```

**Test: Battery Saver Mode**
```
1. Enable battery saver
2. Tracking should continue
3. Location accuracy may reduce
4. Should still provide updates
```

### 7. Geofence Tests

**Test: Pickup Arrival**
```
1. Create trip with pickup geofence
2. Start tracking
3. Move to pickup location
4. Should detect entry event
5. Should notify operator
6. Should trigger status suggestion
```

**Test: Delivery Arrival**
```
1. En route to delivery
2. Enter delivery geofence
3. Should detect entry event
4. Should notify operator
5. Should suggest "arrived" status
```

**Test: Geofence Exit**
```
1. Inside geofence
2. Exit geofence
3. Should detect exit event
4. Should record dwell time
```

### 8. Operator Map Tests

**Test: Real-Time Updates**
```
1. Open operator map
2. Driver moves
3. Truck marker should update within 30s
4. Position should be smooth
5. Heading arrow should rotate
```

**Test: Truck Status Colors**
```
1. Moving truck: green marker
2. Idle truck: yellow marker
3. Stopped truck: gray marker
4. Offline truck: red marker
5. Colors should update live
```

**Test: Truck Detail Sheet**
```
1. Click truck marker
2. Should open bottom sheet
3. Should show:
   - Truck number, plate
   - Driver name
   - Trip info
   - Last update time
   - Speed, heading
   - ETA
4. Should have navigation buttons
```

**Test: Location History**
```
1. Select truck
2. View history
3. Should show breadcrumb trail
4. Should show stops
5. Should show timeline
```

### 9. Integration Tests

**Test: Full Trip Workflow**
```
1. Assign trip
2. Driver acknowledges
3. Tracking should NOT start yet
4. Driver arrives at warehouse
5. Updates status to "at_warehouse"
6. Tracking should start automatically
7. Geofences created
8. Monitor location updates
9. Detect pickup arrival (geofence)
10. Load cargo
11. Dispatch
12. Monitor en route
13. Detect delivery arrival (geofence)
14. Deliver
15. Complete trip
16. Tracking should stop automatically
17. History should be available
```

### 10. Edge Case Tests

**Test: Rapid Status Changes**
```
1. Quickly cycle through statuses
2. Tracking should handle gracefully
3. No duplicate tracking sessions
4. Clean start/stop
```

**Test: Multiple Concurrent Trips** (Error case)
```
1. Assign two trips to driver
2. Should prevent tracking both
3. Should track only active trip
4. Should handle edge case gracefully
```

**Test: Timezone Handling**
```
1. Locations in different timezones
2. All timestamps should be UTC
3. Display should show Philippine time
4. ETA calculations should be correct
```

**Test: Coordinate Validation**
```
1. Invalid coordinates (out of range)
2. Should reject bad data
3. Should not crash
4. Should log error
```

---

## Performance Benchmarks

### Mobile App
- **Cold start**: <3 seconds to tracking ready
- **Permission check**: <500ms
- **Location fetch**: <2 seconds (outdoor)
- **Update send**: <1 second (online)
- **Battery drain**: <10% per 8-hour shift
- **Memory usage**: <50MB additional
- **Storage**: <10MB for offline queue

### Operator Map
- **Initial load**: <2 seconds
- **Marker render**: <1 second for 50 trucks
- **Update latency**: <30 seconds end-to-end
- **Map interaction**: 60fps smooth panning/zooming
- **Search**: <100ms for any truck

### Backend
- **Location ingest**: <50ms p95
- **Batch processing**: <500ms for 100 locations
- **Fleet query**: <200ms for all active trucks
- **History query**: <1s for 8-hour trip
- **Geofence check**: <10ms per location

---

## Troubleshooting

### Driver App Issues

**Tracking not starting**
- Check permissions (foreground + background)
- Verify trip status is active
- Check device location settings
- Review logs for errors

**Weak GPS signal**
- Move to open area
- Check device GPS settings
- Restart device if needed
- Verify not using mock location

**High battery drain**
- Check update intervals
- Verify app is optimized
- Check for other GPS apps
- Review tracking configuration

**Offline sync not working**
- Check AsyncStorage space
- Verify network connectivity
- Check API endpoint health
- Review queue logic

### Operator Map Issues

**Trucks not showing**
- Check API endpoint
- Verify authentication
- Check truck has active trip
- Review last update time

**Stale locations**
- Check WebSocket connection
- Verify polling interval
- Check backend health
- Review driver app tracking

**Map not loading**
- Verify Google Maps API key
- Check API quota
- Review browser console
- Test API key restrictions

---

## Security Best Practices

### API Key Management
```typescript
// ❌ NEVER expose API keys in code
const GOOGLE_MAPS_KEY = "AIza..."; // DON'T DO THIS

// ✅ Use environment variables
const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_API_KEY;

// ✅ Restrict API keys in Google Cloud Console
- Restrict by HTTP referrer (web)
- Restrict by Android app signature
- Restrict by iOS bundle ID
- Restrict to specific APIs only
```

### Location Data Security
- Always use HTTPS for transmission
- Encrypt sensitive data at rest
- Implement rate limiting
- Validate all incoming coordinates
- Sanitize user inputs
- Implement authentication
- Use JWT tokens
- Log access to location data

### Privacy Protection
- Store minimum data required
- Implement automatic deletion (90 days)
- Provide data export
- Allow data deletion requests
- Clear tracking notifications
- Transparent privacy policy
- Employee consent tracking

---

## Future Hardware GPS Integration

When ready to integrate hardware GPS trackers:

1. **Obtain Required Information**
   - GPS tracker brand/model
   - Provider platform details
   - API documentation
   - API credentials
   - Device identification method (IMEI, serial, etc.)

2. **Implement Provider Adapter**
   ```typescript
   class HardwareGPSAdapter implements GPSTrackerProvider {
     async getLocations(): Promise<LocationUpdate[]> {
       // Provider-specific implementation
     }
   }
   ```

3. **Update Location Service**
   - Add hardware provider to location sources
   - Implement fallback logic (phone → hardware)
   - Merge location streams
   - Handle provider-specific data formats

4. **Testing**
   - Test hardware device integration
   - Verify data accuracy
   - Test failover scenarios
   - Monitor costs (API usage)

---

## Support & Maintenance

### Monitoring
- Track GPS health metrics
- Monitor offline truck count
- Alert on stale locations (>10 min)
- Track API errors
- Monitor battery impact

### Regular Maintenance
- Review and tune update intervals
- Clean up old location data
- Update geofence definitions
- Optimize database queries
- Review privacy compliance

### User Support
- Train drivers on permissions
- Explain privacy protections
- Troubleshoot GPS issues
- Handle device-specific problems
- Collect feedback for improvements

---

**Last Updated**: January 2024
**Version**: 1.0
**Status**: Ready for Implementation
