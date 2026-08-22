# Location Tracking Setup Guide

Step-by-step guide to install and configure the location tracking system for Vone Trucking.

## Prerequisites

- Node.js 16+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- Physical iOS and Android devices for testing
- Google Maps API key
- Backend API endpoints ready

---

## Step 1: Install Dependencies

```bash
cd vone-trucking-mobile

# Install required Expo packages
npm install expo-location@~17.0.1
npm install expo-task-manager@~11.8.2
npm install expo-device@~6.0.2

# Install AsyncStorage for offline queue
npm install @react-native-async-storage/async-storage

# Verify installation
npm list expo-location expo-task-manager expo-device
```

---

## Step 2: Configure app.json

Update `vone-trucking-mobile/app.json` with location permissions and background modes:

```json
{
  "expo": {
    "name": "Vone Trucking",
    "slug": "vone-trucking",
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Vone Trucking needs your location to track deliveries during active trips. Location is only tracked when you have an assigned delivery.",
          "locationAlwaysPermission": "Vone Trucking needs background location access to track deliveries even when the app is closed. This ensures dispatch always knows your delivery status.",
          "locationWhenInUsePermission": "Vone Trucking needs your location to track deliveries during active trips.",
          "isIosBackgroundLocationEnabled": true,
          "isAndroidBackgroundLocationEnabled": true,
          "isAndroidForegroundServiceEnabled": true
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Vone Trucking needs your location to track deliveries during active trips. Location is only tracked when you have an assigned delivery.",
        "NSLocationAlwaysUsageDescription": "Vone Trucking needs background location access to track deliveries even when the app is closed. This ensures dispatch always knows your delivery status.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Vone Trucking tracks your location during active deliveries to keep dispatch updated and provide accurate ETAs to customers.",
        "UIBackgroundModes": [
          "location"
        ]
      }
    },
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION"
      ],
      "foregroundService": {
        "locationForegroundServiceType": "location"
      }
    }
  }
}
```

---

## Step 3: Configure Google Maps API

### 3.1 Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Maps JavaScript API**
4. Create API key
5. Restrict key to your domains (security best practice)

### 3.2 Update Operator Map

Edit `vone-trucking-mobile/operator-fleet-map.html`:

```html
<!-- Line 380: Replace YOUR_GOOGLE_MAPS_API_KEY -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=geometry"></script>
```

**Security Note:** For production, move API key to environment variable and use server-side proxy.

---

## Step 4: Update API Configuration

Create or update API base URL configuration:

**File:** `vone-trucking-mobile/src/config/api.ts`

```typescript
// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Location endpoints
export const LOCATION_ENDPOINTS = {
  submitUpdate: '/api/location',
  submitBatch: '/api/location/batch',
  getFleetLocations: '/api/fleet/locations',
  getHistory: '/api/location/history',
  submitGPSAlert: '/api/gps-alerts',
  geofenceEvent: '/api/geofence/event',
};
```

**File:** `.env` (create if doesn't exist)

```bash
# Development
EXPO_PUBLIC_API_URL=http://localhost:3000

# Production
# EXPO_PUBLIC_API_URL=https://api.vonetrucking.com
```

---

## Step 5: Integrate Location Tracking in Trip Screen

Update driver trip detail screen to include location tracking:

**File:** `vone-trucking-mobile/app/(driver)/trips/[id].tsx`

```typescript
import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LocationTrackingCard } from '../../../src/components/location/LocationTrackingCard';
import { GPSAlertBanner } from '../../../src/components/location/GPSAlertBanner';
import { useLocationTracking } from '../../../src/hooks/useLocationTracking';
import { LocationTrackingService } from '../../../src/services/location/LocationTrackingService';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams();
  const tripId = id as string;
  
  // TODO: Get trip data from your data source
  const trip = useTripData(tripId);
  const truckId = trip?.truck_id;
  const driverId = trip?.driver_id;

  // Auto-start tracking when trip is active
  useEffect(() => {
    if (!trip) return;

    // Start tracking for active trips
    if (['at_warehouse', 'in_transit', 'at_delivery'].includes(trip.status)) {
      LocationTrackingService.startTracking(tripId, truckId, driverId);
    }

    // Stop tracking when trip is completed
    if (['complete', 'cancelled'].includes(trip.status)) {
      LocationTrackingService.stopTracking();
    }
  }, [trip?.status, tripId, truckId, driverId]);

  return (
    <View style={styles.container}>
      {/* GPS Alert Banner at top */}
      <GPSAlertBanner 
        autoHideDuration={10000}
        maxVisible={3}
      />

      <ScrollView style={styles.content}>
        {/* Trip details */}
        <TripInfoCard trip={trip} />
        
        {/* Location Tracking Card */}
        {trip && ['at_warehouse', 'in_transit', 'at_delivery'].includes(trip.status) && (
          <LocationTrackingCard
            tripId={tripId}
            truckId={truckId}
            driverId={driverId}
          />
        )}

        {/* Other trip components */}
        <TripStopsCard stops={trip?.stops} />
        <TripDocumentsCard documents={trip?.documents} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
```

---

## Step 6: Setup Backend Endpoints

Your backend needs to implement these endpoints:

### 6.1 Submit Location Update

**Endpoint:** `POST /api/location`

**Request:**
```json
{
  "trip_id": "trip_123",
  "truck_id": "truck_456",
  "driver_id": "driver_789",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "altitude": 10.5,
    "accuracy": 15.2,
    "heading": 45,
    "speed": 25.5
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "driver_phone_gps",
  "battery_level": 85,
  "is_mock": false
}
```

**Response:**
```json
{
  "success": true,
  "location_id": "loc_abc123"
}
```

### 6.2 Submit Location Batch

**Endpoint:** `POST /api/location/batch`

**Request:**
```json
{
  "locations": [
    { /* location update 1 */ },
    { /* location update 2 */ },
    { /* location update 3 */ }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "processed": 3,
  "failed": 0
}
```

### 6.3 Get Fleet Locations

**Endpoint:** `GET /api/fleet/locations`

**Query Params:**
- `active_only=true` - Only trucks with active trips

**Response:**
```json
{
  "trucks": [
    {
      "truck_id": "truck_456",
      "unit_number": "T-101",
      "plate_number": "ABC-1234",
      "driver": {
        "id": "driver_789",
        "name": "John Doe",
        "phone": "+1-555-0100"
      },
      "trip": {
        "id": "trip_123",
        "status": "in_transit",
        "pickup": { "address": "123 Main St", "city": "New York" },
        "delivery": { "address": "456 Oak Ave", "city": "Brooklyn" }
      },
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "accuracy": 15.2,
        "heading": 45,
        "speed": 25.5,
        "timestamp": "2024-01-15T10:30:00Z"
      },
      "status": "moving",
      "gps_source": "driver_phone_gps",
      "gps_health": {
        "signal_strength": 4,
        "accuracy": 15.2,
        "satellite_count": 7,
        "quality": "good"
      }
    }
  ]
}
```

### 6.4 Submit GPS Alert

**Endpoint:** `POST /api/gps-alerts`

**Request:**
```json
{
  "type": "weak_signal",
  "severity": "warning",
  "message": "Weak GPS signal (2 satellites). Location accuracy may be reduced.",
  "timestamp": "2024-01-15T10:30:00Z",
  "truck_id": "truck_456",
  "driver_id": "driver_789",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

### 6.5 Geofence Event

**Endpoint:** `POST /api/geofence/event`

**Request:**
```json
{
  "event_type": "entry",
  "geofence_id": "geofence_pickup_123",
  "geofence_name": "Customer Warehouse",
  "trip_id": "trip_123",
  "truck_id": "truck_456",
  "driver_id": "driver_789",
  "timestamp": "2024-01-15T10:30:00Z",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

---

## Step 7: Deploy Operator Map

### Option A: Standalone HTML (Quick Setup)

1. Copy `operator-fleet-map.html` to your web server
2. Update API endpoints in JavaScript section (around line 50)
3. Update Google Maps API key (line 380)
4. Access via: `https://your-domain.com/operator-fleet-map.html`

### Option B: Integrate into React Dashboard

Create React component based on `operator-fleet-map.html`:

**File:** `web-dashboard/src/pages/FleetMap.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { fetchFleetLocations } from '../services/api';

export function FleetMapPage() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
    libraries: ['geometry'],
  });

  // TODO: Implement fleet map logic
  // Reference operator-fleet-map.html for implementation details

  return (
    <div className="fleet-map-container">
      {isLoaded ? (
        <GoogleMap /* ... */ />
      ) : (
        <div>Loading map...</div>
      )}
    </div>
  );
}
```

---

## Step 8: Build and Test

### 8.1 Development Build

```bash
cd vone-trucking-mobile

# Start Expo dev server
npx expo start

# For iOS
npx expo start --ios

# For Android
npx expo start --android
```

### 8.2 Create Development Build (with background location)

Background location requires custom dev build (not Expo Go):

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --profile development --platform ios

# Build for Android
eas build --profile development --platform android
```

### 8.3 Install on Devices

```bash
# iOS: Install via TestFlight or direct install
# Download IPA from EAS build, install via Xcode or TestFlight

# Android: Install APK directly
# Download APK from EAS build
adb install vone-trucking.apk
```

---

## Step 9: Testing Checklist

Use `LOCATION_TRACKING_TESTS.md` for comprehensive testing:

### Phase 1: Permissions (30 min)
- [ ] Test foreground permission request
- [ ] Test background permission request
- [ ] Test permission denied recovery
- [ ] Test permission explanations display correctly

### Phase 2: Basic Tracking (60 min)
- [ ] Test tracking starts with trip
- [ ] Test tracking continues in background
- [ ] Test tracking stops when trip completes
- [ ] Test location updates sent to server
- [ ] Test offline queue when no network

### Phase 3: GPS Health (60 min)
- [ ] Test weak signal detection
- [ ] Test poor accuracy alerts
- [ ] Test GPS unavailable detection
- [ ] Test stale location alerts
- [ ] Test alert throttling

### Phase 4: Operator Map (30 min)
- [ ] Test trucks appear on map
- [ ] Test real-time updates
- [ ] Test truck info windows
- [ ] Test GPS health display
- [ ] Test status indicators

### Phase 5: Battery & Performance (60 min)
- [ ] Measure battery drain over 4 hours
- [ ] Test with battery saver mode
- [ ] Test memory usage
- [ ] Test network bandwidth
- [ ] Test with multiple concurrent trips

---

## Step 10: Production Deployment

### 10.1 Production Build

```bash
# Build for production
eas build --profile production --platform all

# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

### 10.2 Backend Deployment

1. Deploy backend API endpoints
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Enable database backups
5. Configure rate limiting

### 10.3 Web Dashboard Deployment

1. Build React dashboard: `npm run build`
2. Deploy to hosting (Vercel, Netlify, etc.)
3. Configure environment variables
4. Enable HTTPS
5. Test operator map loads correctly

---

## Troubleshooting

### Issue: Background tracking not working

**Solution:**
1. Verify custom dev build (not Expo Go)
2. Check app.json has all required permissions
3. Verify background permission granted
4. Check device location services enabled
5. Test on physical device (not simulator for background)

### Issue: Location updates not received

**Solution:**
1. Check network connection
2. Verify API endpoint URL correct
3. Check authentication token valid
4. Inspect network requests in dev tools
5. Check offline queue in AsyncStorage

### Issue: GPS health alerts not showing

**Solution:**
1. Verify GPSAlertBanner component rendered
2. Check GPS health monitoring started
3. Trigger known alert condition
4. Check console logs for throttling
5. Verify alert callbacks registered

### Issue: Operator map not updating

**Solution:**
1. Verify Google Maps API key valid
2. Check CORS headers on API
3. Test API endpoint directly
4. Check polling/WebSocket connection
5. Inspect browser console for errors

### Issue: High battery drain

**Solution:**
1. Increase update interval (30s → 60s)
2. Increase distance filter (50m → 100m)
3. Use pausesUpdatesAutomatically on iOS
4. Reduce location accuracy if acceptable
5. Profile battery usage in Xcode/Android Studio

---

## Configuration Reference

### LocationTrackingConfig Options

```typescript
interface LocationTrackingConfig {
  // How often to update location
  updateIntervalMs: number;              // Default: 30000 (30s)
  
  // Fastest update rate
  fastestUpdateIntervalMs?: number;      // Default: 10000 (10s)
  
  // Minimum distance to trigger update
  distanceFilterMeters: number;          // Default: 50m
  
  // Target accuracy
  desiredAccuracyMeters: number;         // Default: 100m
  
  // iOS optimizations
  pausesUpdatesAutomatically?: boolean;  // Default: true
  showsBackgroundLocationIndicator?: boolean; // Default: true
  activityType?: 'automotive' | 'fitness' | 'other'; // Default: 'automotive'
  
  // Android foreground service
  foregroundServiceTitle?: string;
  foregroundServiceMessage?: string;
}
```

### GPSHealthMonitor Options

```typescript
interface GPSHealthConfig {
  weakSignalThreshold: number;       // Default: 3 satellites
  poorAccuracyThreshold: number;     // Default: 50 meters
  staleLocationTimeout: number;      // Default: 300000 (5 min)
  alertThrottleInterval: number;     // Default: 120000 (2 min)
  maxAlertsPerHour: number;         // Default: 10
  healthCheckInterval: number;       // Default: 30000 (30s)
  historyRetentionHours: number;    // Default: 24
}
```

---

## Next Steps

1. ✅ Complete setup steps 1-8
2. ✅ Run comprehensive tests (Step 9)
3. ✅ Measure battery impact and optimize
4. ✅ Test on multiple devices (iOS + Android)
5. ✅ Train drivers on location tracking features
6. ✅ Train operators on fleet map usage
7. ✅ Deploy to production (Step 10)
8. ⏳ Monitor GPS health metrics post-launch
9. ⏳ Collect user feedback
10. ⏳ Iterate and improve

---

## Support & Resources

- **Documentation:** See LOCATION_TRACKING_GUIDE.md
- **Tests:** See LOCATION_TRACKING_TESTS.md
- **GPS Health:** See GPS_HEALTH_MONITORING.md
- **Expo Location:** https://docs.expo.dev/versions/latest/sdk/location/
- **Expo Task Manager:** https://docs.expo.dev/versions/latest/sdk/task-manager/
- **Google Maps API:** https://developers.google.com/maps/documentation

---

**Setup complete!** Your location tracking system is now ready for testing and deployment.
