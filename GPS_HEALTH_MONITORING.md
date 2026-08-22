# GPS Health Monitoring System

Comprehensive GPS health monitoring for Vone Trucking's location tracking system.

## Overview

The GPS Health Monitoring system provides real-time tracking of GPS signal quality, accuracy, and availability. It automatically detects issues and alerts drivers and operators when GPS problems occur.

## Components

### 1. GPSHealthMonitor Service

Core service that monitors GPS health and triggers alerts.

**Location:** `src/services/location/GPSHealthMonitor.ts`

**Features:**
- Signal strength monitoring (1-5 scale based on satellite count)
- Accuracy tracking (meters)
- GPS availability detection
- Stale location detection (no updates for 5+ minutes)
- Mock location detection
- Alert throttling (prevents spam)
- Rate limiting (max 10 alerts/hour)
- Health history tracking (24 hours)

**Usage:**

```typescript
import { gpsHealthMonitor } from './services/location/GPSHealthMonitor';

// Start monitoring
gpsHealthMonitor.startMonitoring();

// Subscribe to alerts
const unsubscribe = gpsHealthMonitor.onAlert((alert) => {
  console.log('GPS Alert:', alert.type, alert.message);
  
  // Show to user or send to operator
  if (alert.severity === 'error') {
    showErrorNotification(alert.message);
  }
});

// Subscribe to health updates
const unsubscribeHealth = gpsHealthMonitor.onHealthUpdate((health) => {
  console.log('GPS Health:', health.quality, health.signalStrength);
});

// Get current health
const health = gpsHealthMonitor.getCurrentHealth();
console.log('Signal:', health.signalStrength);
console.log('Accuracy:', health.accuracy);
console.log('Quality:', health.quality);

// Get historical data
const last1Hour = gpsHealthMonitor.getHealthHistory(1);
const avgSignal = gpsHealthMonitor.getAverageSignalStrength(1);
const avgAccuracy = gpsHealthMonitor.getAverageAccuracy(1);

// Stop monitoring
gpsHealthMonitor.stopMonitoring();

// Clean up
unsubscribe();
unsubscribeHealth();
```

### 2. GPSAlertBanner Component

React component for displaying GPS alerts in the driver app.

**Location:** `src/components/location/GPSAlertBanner.tsx`

**Features:**
- Displays up to 3 concurrent alerts
- Auto-dismisses info alerts after 10 seconds
- Manual dismiss for warnings/errors
- Color-coded by severity (info=blue, warning=yellow, error=red)
- Animated entrance
- Accessibility support
- Timestamp display

**Usage:**

```typescript
import { GPSAlertBanner } from './components/location/GPSAlertBanner';

function TripScreen() {
  return (
    <View>
      {/* Other components */}
      
      <GPSAlertBanner
        autoHideDuration={10000}  // Auto-hide after 10s
        maxVisible={3}            // Show max 3 alerts
      />
    </View>
  );
}
```

### 3. Integration with LocationTrackingService

The `LocationTrackingService` automatically integrates with GPS health monitoring:

- Starts monitoring when tracking begins
- Stops monitoring when tracking ends
- Updates health data with each location update
- Health alerts are triggered automatically

## Alert Types

### 1. Weak Signal
- **Type:** `weak_signal`
- **Severity:** Warning
- **Trigger:** Less than 3 satellites
- **Message:** "Weak GPS signal (X satellites). Location accuracy may be reduced."
- **Action:** Driver sees warning banner. Operator sees degraded status.

### 2. Poor Accuracy
- **Type:** `poor_accuracy`
- **Severity:** Warning
- **Trigger:** Accuracy > 50 meters
- **Message:** "GPS accuracy is poor (±Xm). Location may be inaccurate."
- **Action:** Driver sees warning banner. Location marked as low-quality.

### 3. GPS Unavailable
- **Type:** `gps_unavailable`
- **Severity:** Error
- **Trigger:** Location services disabled or permission denied
- **Message:** "Location services disabled. Please enable GPS in device settings."
- **Action:** Driver sees error banner. Operator sees offline status.

### 4. Stale Location
- **Type:** `stale_location`
- **Severity:** Warning
- **Trigger:** No update for 5+ minutes
- **Message:** "No GPS update for X minutes."
- **Action:** Driver sees warning. Operator sees "Last update X min ago".

### 5. Mock Location Detected
- **Type:** `mock_location_detected`
- **Severity:** Error
- **Trigger:** GPS spoofing detected
- **Message:** "Mock location detected. GPS data may be falsified."
- **Action:** Alert logged. Optional admin notification.

### 6. Signal Restored
- **Type:** `signal_restored`
- **Severity:** Info
- **Trigger:** Signal improves after being weak
- **Message:** "GPS signal restored."
- **Action:** Driver sees info banner. Auto-dismissed after 10s.

### 7. Accuracy Improved
- **Type:** `accuracy_improved`
- **Severity:** Info
- **Trigger:** Accuracy improves after being poor
- **Message:** "GPS accuracy improved."
- **Action:** Driver sees info banner. Auto-dismissed after 10s.

## GPS Health Data Structure

```typescript
interface GPSHealth {
  signalStrength: number;      // 1-5 scale
  accuracy: number;            // meters
  lastUpdate: Date;
  isAvailable: boolean;
  satelliteCount?: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}
```

### Signal Strength Scale

| Strength | Satellites | Quality |
|----------|-----------|---------|
| 5 | 8+ | Excellent |
| 4 | 6-7 | Good |
| 3 | 4-5 | Fair |
| 2 | 2-3 | Poor |
| 1 | 0-1 | Very Poor |

### Quality Determination

| Quality | Criteria |
|---------|----------|
| Excellent | Signal ≥4 AND Accuracy ≤10m |
| Good | Signal ≥3 AND Accuracy ≤30m |
| Fair | Signal ≥2 AND Accuracy ≤100m |
| Poor | All other cases |

## Alert Throttling

To prevent alert spam, the system implements:

1. **Type Throttling:** Same alert type can only trigger once every 2 minutes
2. **Rate Limiting:** Maximum 10 alerts per hour (all types combined)
3. **Auto-dismiss:** Info alerts auto-dismiss after 10 seconds

## Configuration

Customize GPS health monitoring behavior:

```typescript
import { GPSHealthMonitor } from './services/location/GPSHealthMonitor';

const monitor = new GPSHealthMonitor({
  // Alert thresholds
  weakSignalThreshold: 3,           // Satellites
  poorAccuracyThreshold: 50,        // Meters
  staleLocationTimeout: 300000,     // 5 minutes in ms
  
  // Alert throttling
  alertThrottleInterval: 120000,    // 2 minutes in ms
  maxAlertsPerHour: 10,
  
  // Health checks
  healthCheckInterval: 30000,       // 30 seconds in ms
  historyRetentionHours: 24,        // Hours of history to keep
});

monitor.startMonitoring();
```

## Operator Dashboard Integration

Display GPS health on the operator map:

```javascript
// In operator-fleet-map.html or React dashboard

function displayTruckHealth(truck) {
  const health = truck.gps_health;
  
  // Show signal indicator
  const signalIcon = getSignalIcon(health.signalStrength);
  const qualityColor = getQualityColor(health.quality);
  
  // Display in truck info window
  infoWindow.setContent(`
    <div class="truck-info">
      <h3>${truck.unit_number}</h3>
      <div class="gps-health" style="color: ${qualityColor}">
        ${signalIcon} ${health.quality.toUpperCase()}
        <br>
        Accuracy: ±${Math.round(health.accuracy)}m
        <br>
        Satellites: ${health.satelliteCount || 'Unknown'}
      </div>
    </div>
  `);
}

function getSignalIcon(strength) {
  if (strength >= 4) return '📶';
  if (strength >= 3) return '📶';
  if (strength >= 2) return '📶';
  return '📵';
}

function getQualityColor(quality) {
  switch (quality) {
    case 'excellent': return '#10B981'; // Green
    case 'good': return '#3B82F6';      // Blue
    case 'fair': return '#F59E0B';      // Yellow
    case 'poor': return '#EF4444';      // Red
    default: return '#6B7280';          // Gray
  }
}
```

## Testing GPS Health

### Test Scenarios

1. **Weak Signal**
   - Go to area with poor GPS (underground parking, building interior)
   - Verify "Weak Signal" alert appears
   - Verify alert disappears when signal improves

2. **Poor Accuracy**
   - Wait for accuracy to degrade naturally
   - Or simulate by testing in challenging GPS environment
   - Verify "Poor Accuracy" alert appears

3. **GPS Unavailable**
   - Disable location services in device settings
   - Verify "GPS Unavailable" error appears
   - Re-enable and verify error clears

4. **Stale Location**
   - Put app in background
   - Wait 5+ minutes without movement
   - Verify "Stale Location" warning appears

5. **Mock Location**
   - Enable mock location on Android (requires dev options)
   - Use GPS spoofing app
   - Verify "Mock Location Detected" error appears

6. **Alert Throttling**
   - Trigger same alert multiple times quickly
   - Verify only one alert per 2 minutes appears
   - Verify max 10 alerts/hour rate limit

7. **Health History**
   - Track GPS for 1+ hours
   - Query health history
   - Verify 24 hours of data retained
   - Verify old data cleaned up

## API Integration

### Location Update Payload

Location updates now include GPS health data:

```json
{
  "trip_id": "trip_123",
  "truck_id": "truck_456",
  "driver_id": "driver_789",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 15.2
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "driver_phone_gps",
  "gps_health": {
    "signal_strength": 4,
    "accuracy": 15.2,
    "satellite_count": 7,
    "quality": "good",
    "is_available": true
  }
}
```

### GPS Alert Webhook

Send critical GPS alerts to backend:

```typescript
// In location.service.ts
export async function submitGPSAlert(alert: GPSAlert): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/gps-alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify(alert),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit GPS alert: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[GPSAlert] Failed to submit alert:', error);
    // Queue for retry
  }
}

// Subscribe to critical alerts
gpsHealthMonitor.onAlert((alert) => {
  if (alert.severity === 'error') {
    submitGPSAlert(alert);
  }
});
```

## Best Practices

### Driver App
1. Display GPSAlertBanner prominently on trip screen
2. Show current GPS health in LocationTrackingCard
3. Explain what alerts mean and how to fix them
4. Provide quick links to device settings

### Operator Dashboard
1. Show GPS health indicator on truck markers
2. Filter/sort by GPS quality
3. Alert operators to trucks with poor GPS
4. Track GPS health trends over time
5. Generate reports on GPS reliability

### Backend
1. Store GPS health with each location update
2. Generate alerts for prolonged poor GPS
3. Track mock location attempts
4. Monitor fleet-wide GPS health metrics
5. Alert admins to systemic GPS issues

## Troubleshooting

### Issue: Too Many Alerts

**Solution:** Adjust throttling settings

```typescript
const monitor = new GPSHealthMonitor({
  alertThrottleInterval: 300000,  // Increase to 5 minutes
  maxAlertsPerHour: 5,            // Reduce max alerts
});
```

### Issue: Missing Alerts

**Solution:** Check monitoring is started

```typescript
// Ensure monitoring starts with tracking
LocationTrackingService.startTracking(tripId, truckId, driverId);

// Verify monitoring is active
const health = gpsHealthMonitor.getCurrentHealth();
console.log('Monitoring active:', health !== null);
```

### Issue: Inaccurate Signal Strength

**Solution:** Satellite count may not be available on all devices. Use accuracy as fallback:

```typescript
// In GPSHealthMonitor.ts, update calculateSignalStrength()
private calculateSignalStrength(location: LocationUpdate): number {
  const satellites = location.satelliteCount;
  
  // If satellite count available, use it
  if (satellites !== undefined && satellites > 0) {
    if (satellites >= 8) return 5;
    if (satellites >= 6) return 4;
    if (satellites >= 4) return 3;
    if (satellites >= 2) return 2;
    return 1;
  }
  
  // Fallback to accuracy-based estimation
  const accuracy = location.accuracy;
  if (accuracy <= 10) return 5;
  if (accuracy <= 30) return 4;
  if (accuracy <= 50) return 3;
  if (accuracy <= 100) return 2;
  return 1;
}
```

## Performance Considerations

### Battery Impact
- Health checks run every 30 seconds (minimal battery use)
- No continuous polling
- Passive monitoring of location updates

### Memory Usage
- Health history limited to 24 hours
- Automatic cleanup of old entries
- Alert throttling prevents queue buildup

### Network Usage
- GPS health sent with location updates (no extra requests)
- Critical alerts can be batched
- Optional: Queue alerts for offline sync

## Future Enhancements

1. **Predictive Alerts**
   - Warn before GPS becomes unavailable
   - Based on historical patterns

2. **GPS Coverage Maps**
   - Track areas with poor GPS
   - Suggest alternative routes

3. **Hardware GPS Integration**
   - Monitor dedicated GPS tracker health
   - Compare phone vs hardware GPS quality

4. **Machine Learning**
   - Detect abnormal GPS patterns
   - Predict GPS failures

5. **Multi-Device Health**
   - Monitor backup GPS sources
   - Automatic failover

## Compliance & Privacy

- GPS health monitoring only active during trips
- No location data collected when tracking is off
- Health metrics do not contain PII
- Mock location detection for security, not punishment
- Alerts respect driver privacy

## Summary

The GPS Health Monitoring system provides comprehensive visibility into GPS signal quality, enabling:

✅ Proactive issue detection
✅ Driver awareness of GPS problems
✅ Operator visibility into fleet GPS health
✅ Data quality assurance
✅ Troubleshooting support
✅ Privacy-respecting implementation

All components are production-ready and integrated with the existing location tracking system.
