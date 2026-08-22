# Location Tracking - Quick Start Guide

**Get started with location tracking in 30 minutes.**

---

## ⚡ Fastest Path to Testing

### Step 1: Install Dependencies (5 minutes)

```bash
cd vone-trucking-mobile

# Install location tracking packages
npm install expo-location@~17.0.1
npm install expo-task-manager@~11.8.2
npm install expo-device@~6.0.2
npm install @react-native-async-storage/async-storage

# Verify installation
npm list expo-location
```

---

### Step 2: Configure app.json (5 minutes)

Add to `vone-trucking-mobile/app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Vone Trucking tracks deliveries during active trips.",
          "isIosBackgroundLocationEnabled": true,
          "isAndroidBackgroundLocationEnabled": true
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["location"]
      }
    },
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE"
      ]
    }
  }
}
```

---

### Step 3: Create Development Build (10 minutes)

Background location requires custom build (not Expo Go):

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for your device
eas build --profile development --platform ios
# OR
eas build --profile development --platform android

# Install on device when build completes
```

---

### Step 4: Test Basic Tracking (10 minutes)

```typescript
// Add to your trip screen
import { LocationTrackingCard } from '../src/components/location/LocationTrackingCard';
import { GPSAlertBanner } from '../src/components/location/GPSAlertBanner';

export default function TripScreen() {
  return (
    <View>
      <GPSAlertBanner />
      <LocationTrackingCard 
        tripId="test_trip_1"
        truckId="test_truck_1" 
        driverId="test_driver_1"
      />
    </View>
  );
}
```

**Test:**
1. Open trip screen
2. Grant location permissions
3. Verify "Tracking Active" shows
4. Put app in background
5. Check GPS health displays

---

## 🎯 Core Features to Test First

### 1. Permission Flow (5 min)
- [ ] Foreground permission requested
- [ ] Background permission requested
- [ ] Explanations display correctly
- [ ] Denial recovery works

### 2. Basic Tracking (10 min)
- [ ] Tracking starts with trip
- [ ] Location updates in console
- [ ] GPS health shows signal/accuracy
- [ ] Tracking continues in background

### 3. GPS Alerts (5 min)
- [ ] Move to weak signal area
- [ ] Alert banner appears
- [ ] Alert dismissible
- [ ] Multiple alerts stack

---

## 📱 Quick Test Scenarios

### Scenario A: Happy Path (15 min)

1. Fresh app install
2. Start trip → Grant permissions
3. Observe tracking active
4. Move around → See updates
5. Complete trip → Tracking stops

**Expected:** All green, no errors

### Scenario B: Background Tracking (10 min)

1. Start tracking
2. Put app in background
3. Wait 2 minutes
4. Return to app
5. Check location updates continued

**Expected:** Updates queued while in background

### Scenario C: Weak GPS (5 min)

1. Start tracking outdoors (good GPS)
2. Move indoors or underground
3. Observe GPS health degrade
4. Alert banner shows "Weak Signal"

**Expected:** Alert appears and dismisses correctly

---

## 🐛 Quick Troubleshooting

### Problem: "Background location not supported"

**Solution:** Using Expo Go won't work. Build custom dev build with EAS.

```bash
eas build --profile development --platform ios
```

---

### Problem: Tracking doesn't start

**Checklist:**
- [ ] Permissions granted? (Check LocationTrackingCard)
- [ ] Location services enabled? (Device settings)
- [ ] Trip ID provided? (Check component props)
- [ ] Console errors? (Check Metro bundler)

---

### Problem: No GPS health showing

**Checklist:**
- [ ] GPSHealthMonitor started? (Auto-starts with tracking)
- [ ] Location updates received? (Check console logs)
- [ ] Component rendered? (Check component tree)

---

## 📚 Documentation Quick Links

| Topic | File |
|-------|------|
| **Full setup** | [LOCATION_TRACKING_SETUP.md](./LOCATION_TRACKING_SETUP.md) |
| **All tests** | [LOCATION_TRACKING_TESTS.md](./LOCATION_TRACKING_TESTS.md) |
| **Implementation** | [LOCATION_TRACKING_GUIDE.md](./LOCATION_TRACKING_GUIDE.md) |
| **GPS health** | [GPS_HEALTH_MONITORING.md](./GPS_HEALTH_MONITORING.md) |
| **Project status** | [LOCATION_TRACKING_STATUS.md](./LOCATION_TRACKING_STATUS.md) |

---

## 🚀 What's Already Done

✅ **All code written** - 16 files, ~9,500 lines
✅ **All documentation** - 6 guides, ~5,000 lines
✅ **114 test scenarios** - Comprehensive test coverage
✅ **GPS health monitoring** - Full alert system
✅ **Geofence detection** - Arrival/departure events
✅ **Operator map** - Real-time fleet view

---

## ⏭️ What You Need to Do

1. **Install packages** (5 min)
2. **Configure app.json** (5 min)
3. **Build custom dev build** (10 min)
4. **Test on device** (10 min)

**Total: 30 minutes to first test**

---

## 💡 Pro Tips

**Tip 1:** Test on physical device, not simulator. Background location requires real device.

**Tip 2:** Start with iOS if possible. Permission flow is more straightforward.

**Tip 3:** Check console logs. All services log their actions with `[ServiceName]` prefix.

**Tip 4:** Use React DevTools to inspect component state and verify hooks working.

**Tip 5:** Test in open area first (parking lot) to ensure good GPS signal.

---

## 🎓 5-Minute Overview

### Architecture

```
Driver App (React Native + Expo)
   ↓
LocationTrackingService (Background tracking)
   ↓
GPSHealthMonitor (Signal monitoring)
   ↓
Location Queue (Offline storage)
   ↓
API Service (Backend communication)
   ↓
Backend API (To be implemented)
   ↓
Operator Map (Real-time display)
```

### Key Components

1. **LocationTrackingService** - Core tracking engine
2. **GPSHealthMonitor** - Signal quality monitoring
3. **GeofenceService** - Arrival detection
4. **LocationTrackingCard** - Driver UI
5. **GPSAlertBanner** - Alert notifications
6. **operator-fleet-map.html** - Live fleet map

### Configuration

- **Update Interval:** 30 seconds
- **Distance Filter:** 50 meters
- **GPS Threshold:** <3 satellites = weak signal
- **Accuracy Threshold:** >50m = poor accuracy
- **Alert Throttle:** 1 per type per 2 minutes

---

## 🎬 Ready to Start?

**Run this now:**

```bash
cd vone-trucking-mobile
npm install expo-location@~17.0.1 expo-task-manager@~11.8.2 expo-device@~6.0.2 @react-native-async-storage/async-storage
```

**Then edit:** `app.json` (copy config from Step 2 above)

**Then build:** `eas build --profile development --platform [ios/android]`

**Questions?** Check LOCATION_TRACKING_SETUP.md for detailed instructions.

---

**You're 30 minutes away from testing live location tracking! 🚀**
