# Location Services Consent

## Vone Trucking - Location Access Explanation

### Why We Need Location Access

Vone Trucking requires access to your device's location services to provide essential trip tracking and management features. This document explains exactly how we use location data and what controls you have.

---

## What Location Data We Collect

### During Active Trips

When you start a trip, the app collects:

- **Precise GPS coordinates** (latitude and longitude)
- **Timestamp** of each location point
- **Speed** and direction (if available)
- **Accuracy** of the GPS reading

### Frequency

- Location updates occur every **1-5 minutes** during active trips
- Updates pause when you're not on an active trip
- Background location continues if you switch to another app during a trip

### Background Location Access

We request "Always Allow" location permission because:

1. **Trip Continuity**: Drivers need to use other apps (maps, messages) during trips
2. **Real-Time Tracking**: Operators need to monitor driver progress continuously
3. **Safety**: Emergency location services in case of incidents
4. **Route Accuracy**: Complete trip route recording even if app is backgrounded

---

## How We Use Location Data

### Primary Uses

✅ **Trip Tracking**
- Show your current location on the map
- Record your route from pickup to delivery
- Calculate trip distance accurately
- Verify arrival at pickup and delivery locations

✅ **Fleet Management**
- Allow operators to see where drivers are
- Monitor trip progress in real-time
- Estimate arrival times
- Coordinate multiple drivers

✅ **Route History**
- Provide proof of route taken
- Analyze route efficiency
- Dispute resolution if needed
- Historical trip replay

✅ **Safety & Security**
- Emergency location sharing
- Verify you're following assigned route
- Assist in case of vehicle breakdown
- Incident location documentation

✅ **Analytics & Reporting**
- Calculate accurate distances for billing
- Analyze fuel efficiency by route
- Identify optimal routes
- Generate location-based reports

### What We DON'T Do

❌ **We Never**:
- Track your location when you're off duty
- Track your location when you don't have an active trip
- Sell your location data to third parties
- Use location for advertising or marketing
- Share location with anyone outside your organization
- Track location after you log out

---

## Location Permissions Explained

### iOS Permission Levels

**"Allow Once"**
- Location tracked only during current session
- ⚠️ Not recommended - you'll be asked repeatedly

**"While Using the App"**
- Location tracked only when app is open and visible
- ⚠️ Limited functionality - tracking stops if you switch apps

**"Always"** ✅ Recommended
- Full trip tracking functionality
- Background location during active trips only
- Best user experience

### Android Permission Levels

**"Allow only while using the app"**
- Location tracked when app is in foreground
- ⚠️ Limited functionality

**"Allow all the time"** ✅ Recommended
- Full trip tracking functionality
- Background location during active trips
- Android 11+: Requires confirmation after initial grant

**"Deny"**
- No location tracking
- ⚠️ Cannot use trip tracking features

---

## Your Control & Privacy

### You Control Your Location

**Turn Location On/Off**:
- Device Settings > Apps > Vone Trucking > Location
- Disable anytime (but trip features won't work)

**View Location Usage**:
- iOS: Settings > Privacy > Location Services > Vone Trucking
- Android: Settings > Apps > Vone Trucking > Permissions > Location

**When Location is Collected**:
- ONLY during active trips
- NOT when you're logged out
- NOT when you're off duty (no active trip)

**Delete Location Data**:
- Request deletion via app settings
- Contact privacy@vonetrucking.com
- Account deletion removes all location history

### Location Data Security

🔒 **How We Protect Your Location**:
- Encrypted during transmission (TLS/HTTPS)
- Encrypted storage on our servers
- Access restricted to operators in your organization
- Automatic deletion after retention period (2 years)
- No third-party access without your consent

### Who Sees Your Location

**Can See Your Location**:
- ✅ Operators in your trucking company (during active trips)
- ✅ You (view your own trip history)

**Cannot See Your Location**:
- ❌ Other drivers in your company
- ❌ Customers/delivery recipients
- ❌ Third-party companies
- ❌ Advertisers

---

## Battery Impact

**Location Services & Battery**:
- GPS uses battery power
- We've optimized to minimize impact:
  - Updates every 1-5 minutes (not continuously)
  - Pauses when trip is not active
  - Uses device's best location source (GPS, WiFi, Cell towers)
  - Smart power management

**Typical Battery Usage**:
- 5-10% additional battery drain during 8-hour trip
- Varies by device and signal strength

**Tips to Conserve Battery**:
- Keep device plugged into charger during trips
- Close unnecessary background apps
- Ensure good GPS signal (drain increases when searching for signal)

---

## Location Accuracy

**GPS Accuracy**:
- Typically accurate within 5-20 meters
- Depends on:
  - GPS signal strength
  - Number of satellites in view
  - Urban vs. rural areas
  - Weather conditions
  - Device quality

**When GPS May Be Inaccurate**:
- Inside buildings or tunnels
- Urban canyons (tall buildings)
- Heavy tree cover
- Bad weather

**What We Do**:
- Display accuracy indicator in app
- Filter out obviously incorrect points
- Use best available location source
- Mark low-accuracy points in history

---

## Frequently Asked Questions

### Q: Can I use the app without location access?

**A**: You can log in and view information, but you cannot:
- Start or track trips
- Record delivery locations
- Use navigation features
- Complete proof of delivery

Location is essential for core trip functionality.

### Q: Will you track me 24/7 if I allow "Always"?

**A**: No. We ONLY collect location during active trips. When you don't have an active trip, location collection is paused even with "Always" permission.

### Q: What if I don't want my operator to see my location?

**A**: Real-time location visibility is required for fleet management. However:
- Location is only visible during active trips
- Your personal time is not tracked
- This is a standard feature in fleet management systems

If you have concerns, discuss with your employer.

### Q: Can I review where I've been?

**A**: Yes! You can view:
- Your trip history
- Routes taken for each trip
- Location timeline
- Distance traveled

Available in Trip History section of the app.

### Q: How long do you keep my location data?

**A**: 
- Active trip data: Retained for 2 years
- Then automatically deleted
- You can request early deletion anytime

### Q: What if I'm in a location-sensitive area?

**A**: If you're concerned about location tracking in certain areas:
- Discuss with your employer about route policies
- Location data is secure and encrypted
- Only your organization's operators can see your location
- Location data is never sold or shared externally

### Q: Does location drain my data plan?

**A**: Location data usage is minimal:
- ~1-2 MB per 8-hour trip
- Works offline (syncs later)
- WiFi sync recommended to save data

---

## Granting Location Permission

### First-Time Setup

**iOS**:
1. Open Vone Trucking app
2. Tap "Start Trip" for first time
3. Popup appears: "Vone Trucking would like to access your location"
4. Tap "Allow While Using App"
5. Later popup: "Change to 'Always Allow'?"
6. Tap "Change to Always Allow" ✅

**Android**:
1. Open Vone Trucking app
2. Tap "Start Trip" for first time
3. Popup appears: "Allow Vone Trucking to access this device's location?"
4. Tap "Allow all the time" ✅
5. (Android 11+) After a few days, confirm you want to keep allowing

### Changing Permission Later

**iOS**:
Settings > Privacy & Security > Location Services > Vone Trucking > Select "Always"

**Android**:
Settings > Apps > Vone Trucking > Permissions > Location > Select "Allow all the time"

---

## Legal Basis

We collect location data based on:

1. **Contractual Necessity**: Required to provide trip tracking services
2. **Legitimate Interest**: Fleet management and safety monitoring
3. **Employer Authorization**: Your employer requires trip tracking

By using Vone Trucking for work purposes, you acknowledge that location tracking is part of the job requirements, authorized by your employer.

---

## Concerns or Questions?

**Contact Us**:
- **Email**: privacy@vonetrucking.com
- **Support**: support@vonetrucking.com
- **Phone**: +254 XXX XXX XXX

**Your Rights**:
- Request your location data
- Request deletion
- File a complaint with data protection authority
- Speak with your employer about location policies

---

## Consent Statement

**By tapping "Allow" on the location permission request, you acknowledge that**:

- ✅ You understand why we need location access
- ✅ You understand location is collected during active trips
- ✅ You understand operators in your organization can see your location
- ✅ You understand you can revoke permission anytime (though trip features won't work)
- ✅ You have read and understand this location consent explanation

**You can withdraw consent** by disabling location permission in your device settings, though this will prevent you from using trip tracking features.

---

**Last Updated**: August 22, 2024  
**Version**: 1.0

For full privacy details, see our [Privacy Policy](./PRIVACY_POLICY.md).

© 2024 Vone Trucking. All rights reserved.
