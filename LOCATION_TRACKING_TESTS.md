# Location Tracking - Test Scenarios

Complete test scenarios for location tracking, GPS monitoring, geofencing, and fleet mapping features.

---

## Test Environment Setup

### Prerequisites
- Physical iOS device (iOS 14+)
- Physical Android device (Android 10+)
- Active mobile data or WiFi connection
- GPS enabled on devices
- Test accounts (driver and operator)
- Access to operator dashboard

### Test Data
- Test trips with known coordinates
- Geofence locations (warehouse, delivery points)
- Mock trip routes
- Various truck assignments

---

## Category 1: Permission Management

### TEST-LOC-001: Initial Permission Request - Foreground
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. Fresh install app (or clear app data)
2. Login as driver
3. Navigate to active trip detail screen
4. Observe permission request dialog

**Expected**:
- Permission dialog appears automatically
- Dialog explains why location is needed
- Dialog mentions "delivery tracking" and "dispatch updates"
- "Allow While Using App" option shown (iOS)
- "Allow only while using the app" option shown (Android)
- Denying shows info card with "Enable Location" button

**Pass Criteria**: Permission request appears with clear explanation

---

### TEST-LOC-002: Background Permission Request
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. After granting foreground permission
2. Observe second permission request
3. Read explanation dialog

**Expected**:
- Separate dialog for background permission
- Explains tracking only during trips
- States "location never tracked outside work hours"
- Shows "Always Allow" option (iOS)
- Shows "Allow all the time" option (Android)
- Privacy assurance text visible
- Can deny and continue with foreground only

**Pass Criteria**: Background permission requested with privacy explanation

---

### TEST-LOC-003: Permission Denied Recovery
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Deny location permission
2. Observe warning card
3. Tap "Enable Location" button
4. Device Settings should open
5. Grant permission in Settings
6. Return to app

**Expected**:
- Card shows "Location permission required"
- Explains importance for tracking
- Button opens device Settings directly
- Returning to app auto-detects permission granted
- Tracking initializes automatically
- Card updates to show tracking status

**Pass Criteria**: App detects permission change and starts tracking

---

### TEST-LOC-004: Background Permission Platform Differences
**Priority**: Medium  
**Platform**: iOS vs Android

**iOS Steps**:
1. Request background permission
2. Select "Allow While Using App"
3. Verify limited tracking

**Android Steps**:
1. Request background permission
2. Select "Allow only while using the app"
3. Verify limited tracking

**Expected**:
- iOS: Shows "When In Use" status, tracking pauses when backgrounded
- Android: Similar behavior, foreground service notification doesn't persist
- Both: App should inform user about limited tracking
- Both: Can re-request full background permission

**Pass Criteria**: Platform-specific permission states handled correctly

---

### TEST-LOC-005: Mock Location Detection (Android)
**Priority**: High  
**Platform**: Android only

**Steps**:
1. Enable mock location app (e.g., Fake GPS)
2. Start tracking
3. Observe warning

**Expected**:
- App detects mock location enabled
- Shows warning dialog
- "Mock Location Detected" message
- Asks to disable mock locations
- Still allows tracking but flags data
- Location updates marked as `is_mock: true`

**Pass Criteria**: Mock locations detected and flagged

---

## Category 2: Tracking Lifecycle

### TEST-LOC-010: Auto-Start on Trip Active
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. Trip status: "acknowledged"
2. Verify tracking NOT active
3. Update trip status to "at_warehouse"
4. Observe tracking start

**Expected**:
- Tracking does NOT start at "assigned" or "acknowledged"
- Tracking DOES start at "at_warehouse"
- LocationTrackingCard updates to "Tracking active"
- Green checkmark icon appears
- Foreground service notification shows (Android)
- Blue status bar appears (iOS)
- First location update sent within 30 seconds

**Pass Criteria**: Tracking auto-starts at correct trip status

---

### TEST-LOC-011: Auto-Stop on Trip Complete
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. Start tracking (trip active)
2. Complete trip
3. Observe tracking stop

**Expected**:
- Trip status changes to "complete"
- Tracking stops automatically within 5 seconds
- LocationTrackingCard shows "Tracking inactive"
- Foreground notification dismisses (Android)
- Blue bar dismisses (iOS)
- Any queued locations sync before stopping
- Geofences cleaned up

**Pass Criteria**: Tracking auto-stops when trip completes

---

### TEST-LOC-012: Manual Stop Handling
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Go to device Settings
3. Force stop app or revoke permissions
4. Reopen app

**Expected**:
- App detects tracking was interrupted
- Shows "Tracking stopped" status
- Offers to restart tracking
- If permissions revoked, shows permission request
- If trip still active, prompts to resume
- Does NOT automatically restart without user action

**Pass Criteria**: Graceful handling of manual tracking stop

---

### TEST-LOC-013: Multiple Trip Handling
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Have tracking active for Trip A
2. Receive assignment for Trip B
3. Accept Trip B
4. Try to start Trip B

**Expected**:
- App prevents tracking multiple trips simultaneously
- Shows warning "Complete current trip first"
- Existing tracking continues for Trip A
- Trip B remains in "acknowledged" state
- Only one trip can be active at a time

**Pass Criteria**: No duplicate tracking sessions

---

### TEST-LOC-014: Tracking Persistence After App Kill
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Force kill app (swipe away from recent apps)
3. Wait 5 minutes
4. Check server for location updates

**Expected**:
- **Android**: Background service continues, updates received
- **iOS**: Updates may pause but resume when app reopens
- Updates resume immediately when app reopened
- No data loss
- Queued updates sync on app reopen

**Pass Criteria**: Tracking persists or gracefully resumes

---

### TEST-LOC-015: Device Restart Handling
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Restart device
3. Wait for device to boot
4. Open app

**Expected**:
- Tracking does NOT auto-restart (security)
- App shows "Tracking was interrupted"
- Offers to resume tracking if trip still active
- User must explicitly approve restart
- All settings and permissions preserved

**Pass Criteria**: Safe handling of device restart

---

## Category 3: Background Tracking

### TEST-LOC-020: Background Tracking - Home Screen
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Press home button
3. Wait 5 minutes
4. Check location updates on server

**Expected**:
- Android: Persistent notification shows "Vone Trucking - Active Delivery"
- iOS: Blue status bar shows "Vone Trucking is using your location"
- Updates continue every ~30 seconds
- No interruption in tracking
- Battery drain minimal (<2% per hour)

**Pass Criteria**: Background tracking continues smoothly

---

### TEST-LOC-021: Background Tracking - App Switcher
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Open multiple other apps
3. Switch between apps frequently
4. Check location updates

**Expected**:
- Tracking continues uninterrupted
- Updates arrive consistently
- No crashes or freezes
- Other apps function normally
- Vone app visible in background indicator

**Pass Criteria**: Tracking stable during multitasking

---

### TEST-LOC-022: Background Tracking - Screen Off
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Turn off screen (lock device)
3. Keep device locked for 30 minutes
4. Check location updates

**Expected**:
- Updates continue with screen off
- Update frequency may reduce slightly (battery optimization)
- No gaps longer than 2 minutes
- Location accuracy maintained
- Device doesn't overheat

**Pass Criteria**: Tracking continues with screen locked

---

### TEST-LOC-023: Background Tracking - Low Power Mode
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Enable battery saver mode
3. Monitor for 1 hour
4. Check update frequency

**Expected**:
- Tracking continues (may be slower)
- Update interval may increase to 60s
- Still provides reasonable tracking
- No complete loss of updates
- Shows warning about reduced accuracy

**Pass Criteria**: Tracking adapts to power saving mode

---

### TEST-LOC-024: Background Tracking Duration
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Keep app in background for 8 hours
3. Periodically check updates
4. Measure battery drain

**Expected**:
- Tracking persists for full 8-hour shift
- Consistent update frequency
- Total battery drain <10%
- No memory leaks
- App remains responsive when reopened

**Pass Criteria**: All-day tracking reliability

---

## Category 4: GPS Health & Accuracy

### TEST-LOC-030: Strong GPS Signal
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Go to open outdoor area
2. Start tracking
3. Observe GPS health card
4. Check accuracy values

**Expected**:
- GPS status: "healthy"
- Signal strength: "excellent" or "good"
- Accuracy: <20 meters
- Updates arrive every ~30 seconds
- Green checkmark indicator
- No warnings shown

**Pass Criteria**: Strong signal provides accurate tracking

---

### TEST-LOC-031: Weak GPS Signal
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Move indoors (building center)
2. Start tracking
3. Observe GPS health changes
4. Wait for signal recovery

**Expected**:
- GPS status changes to "weak"
- Signal strength: "fair" or "poor"
- Accuracy: 50-100 meters
- Warning card appears
- "Weak GPS signal" message
- Suggests moving to open area
- Status improves when moving outdoors

**Pass Criteria**: Weak signal detected and reported

---

### TEST-LOC-032: GPS Unavailable
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Disable location services in Settings
3. Observe app behavior
4. Re-enable location

**Expected**:
- GPS status: "unavailable"
- Error card appears
- "GPS unavailable" message
- Tracking pauses (doesn't crash)
- Operator receives offline alert
- Auto-recovers when re-enabled

**Pass Criteria**: Graceful handling of GPS loss

---

### TEST-LOC-033: GPS Accuracy Indicators
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Track in various conditions:
   - Open field
   - Urban canyon
   - Under bridge
   - Inside building
2. Note accuracy values

**Expected**:
- Accuracy reflects actual conditions
- Open field: <10m
- Urban: 10-30m
- Mixed coverage: 30-100m
- Poor coverage: >100m
- UI shows accuracy in meters

**Pass Criteria**: Accuracy values realistic

---

### TEST-LOC-034: GPS Cold Start
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Device hasn't used GPS in 24 hours
2. Start tracking
3. Measure time to first fix

**Expected**:
- First fix within 30 seconds (outdoors)
- May take up to 2 minutes (first time)
- Shows "Acquiring GPS..." message
- Progress indicator visible
- Eventually achieves normal accuracy

**Pass Criteria**: Cold start handled with feedback

---

## Category 5: Offline & Sync

### TEST-LOC-040: Offline Location Queue
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Enable airplane mode
3. Move around for 10 minutes
4. Check AsyncStorage
5. Disable airplane mode
6. Observe sync

**Expected**:
- Locations stored in AsyncStorage
- ~20 locations queued (10 min ÷ 30 sec)
- No app crashes
- When online, auto-sync triggered
- All queued locations uploaded
- Queue cleared after successful sync

**Pass Criteria**: Offline locations queued and synced

---

### TEST-LOC-041: Partial Connectivity
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Simulate poor network (1-2 bars)
2. Start tracking
3. Monitor success/failure rates

**Expected**:
- Some updates succeed
- Failed updates queued
- Retry logic kicks in
- Eventually all synced
- No duplicate submissions
- Progress shown to user

**Pass Criteria**: Handles poor connectivity

---

### TEST-LOC-042: Large Offline Queue
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Stay offline for 4 hours (tracking)
2. Accumulate ~480 locations
3. Come online
4. Monitor sync performance

**Expected**:
- Large queue handled gracefully
- Batch upload used (100 at a time)
- Syncs in background
- Doesn't block UI
- Progress indicator shown
- All locations eventually synced

**Pass Criteria**: Large queue synced efficiently

---

### TEST-LOC-043: Sync on Low Battery
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Device at <20% battery
2. Have queued locations
3. Come online
4. Observe sync behavior

**Expected**:
- Sync still attempted
- May be throttled slightly
- Critical updates prioritized
- Doesn't drain remaining battery rapidly
- Completes within reasonable time

**Pass Criteria**: Syncs without excessive battery drain

---

## Category 6: Geofencing

### TEST-LOC-050: Pickup Arrival Detection
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Create trip with pickup geofence (200m radius)
2. Start tracking en route to pickup
3. Enter pickup geofence
4. Observe event

**Expected**:
- Geofence entry detected within 1 minute
- "Entered [Warehouse Name]" event logged
- Operator receives notification
- Location marked on map
- Timestamp recorded
- Suggested status change offered

**Pass Criteria**: Pickup arrival detected reliably

---

### TEST-LOC-051: Delivery Arrival Detection
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. En route to delivery
2. Enter delivery geofence
3. Observe detection

**Expected**:
- Entry event triggered
- "Arrived at destination" notification
- Operator map updates
- Suggested status: "arrive_at_destination"
- ETA calculation stops
- Distance to destination: 0 km

**Pass Criteria**: Delivery arrival detected

---

### TEST-LOC-052: Geofence Exit Detection
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Inside geofence
2. Exit geofence boundary
3. Observe event

**Expected**:
- Exit event detected
- Dwell time calculated
- Event logged with timestamp
- Operator notified if significant
- Map updates truck position

**Pass Criteria**: Exit events detected

---

### TEST-LOC-053: Geofence Edge Cases
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Rapid entry/exit (driving by)
2. Long dwell (staying inside)
3. GPS drift at boundary

**Expected**:
- No duplicate events
- Debouncing prevents false triggers
- Dwell time accurate
- GPS drift doesn't cause false exits
- State tracking prevents event spam

**Pass Criteria**: Edge cases handled correctly

---

### TEST-LOC-054: Multiple Geofences
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Trip with 3+ waypoints
2. Each has geofence
3. Visit all in sequence

**Expected**:
- All geofences monitored
- Correct geofence triggered each time
- No interference between geofences
- Events in correct order
- Performance stable

**Pass Criteria**: Multiple geofences work independently

---

## Category 7: Operator Map

### TEST-LOC-060: Real-Time Map Updates
**Priority**: Critical  
**Platform**: Web

**Steps**:
1. Open operator map
2. Driver moves location
3. Observe marker update

**Expected**:
- Marker updates within 30 seconds
- Smooth position transition (animated)
- Heading arrow rotates correctly
- No flickering or jumps
- Multiple trucks update independently

**Pass Criteria**: Map updates reflect real-time positions

---

### TEST-LOC-061: Truck Status Visualization
**Priority**: High  
**Platform**: Web

**Steps**:
1. View trucks in different states:
   - Moving (>5 km/h)
   - Idle (0 km/h, engine on)
   - Stopped (parked)
   - Offline (no update >10 min)

**Expected**:
- Moving: Green arrow marker
- Idle: Yellow arrow marker
- Stopped: Gray circle marker
- Offline: Red marker with alert icon
- Colors update automatically
- Status clearly distinguishable

**Pass Criteria**: Status colors accurate

---

### TEST-LOC-062: Truck Detail Sheet
**Priority**: High  
**Platform**: Web

**Steps**:
1. Click truck marker
2. View detail sheet
3. Verify all information

**Expected Sheet Contents**:
- ✅ Truck number
- ✅ Plate number
- ✅ Driver name
- ✅ Trip number
- ✅ Current status
- ✅ Speed (km/h)
- ✅ GPS source ("Driver Phone GPS")
- ✅ Last update time
- ✅ Destination
- ✅ ETA
- ✅ Navigation buttons (Google Maps, Waze)

**Pass Criteria**: All fields populated correctly

---

### TEST-LOC-063: Navigation Integration
**Priority**: Medium  
**Platform**: Web

**Steps**:
1. Open truck detail
2. Click "Google Maps" button
3. Click "Waze" button

**Expected**:
- Google Maps: Opens with truck coordinates as destination
- Waze: Opens with truck coordinates as destination
- Both: Open in new tab
- Both: Work on mobile and desktop
- Coordinates accurate

**Pass Criteria**: Navigation links work

---

### TEST-LOC-064: Map Filters
**Priority**: Medium  
**Platform**: Web

**Steps**:
1. Toggle status filters:
   - Uncheck "Moving"
   - Uncheck "Idle"
   - Uncheck "Stopped"
   - Uncheck "Offline"

**Expected**:
- Unchecked status trucks disappear from map
- Truck count updates
- Filters persist on refresh
- All trucks reappear when all checked
- Filter applies instantly

**Pass Criteria**: Filters work correctly

---

### TEST-LOC-065: Location History Trail
**Priority**: Medium  
**Platform**: Web

**Steps**:
1. Select truck
2. Enable "Show History"
3. View breadcrumb trail

**Expected**:
- Polyline shows recent path
- Different colors for different statuses
- Timestamps at waypoints
- Stops indicated
- Trail fades with time
- Performance good with 100+ points

**Pass Criteria**: History trail displays correctly

---

### TEST-LOC-066: Offline Truck Alerts
**Priority**: High  
**Platform**: Web

**Steps**:
1. Truck goes offline (no update >10 min)
2. Observe alert

**Expected**:
- Marker turns red
- "OFFLINE" badge shown
- Alert notification appears
- Last known position shown
- Timestamp shows how long offline
- Returns to normal when back online

**Pass Criteria**: Offline state clearly indicated

---

## Category 8: Battery & Performance

### TEST-LOC-070: Battery Drain - 8 Hour Shift
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. Fully charge device (100%)
2. Start tracking at 8:00 AM
3. Keep tracking until 4:00 PM
4. Note battery level

**Expected**:
- Battery drain: <10% from tracking alone
- Device remains cool (not overheating)
- No sudden battery drops
- Consistent drain rate
- Other apps usable

**Pass Criteria**: <10% battery drain over 8 hours

---

### TEST-LOC-071: Memory Usage
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Run for 4 hours
3. Check memory usage

**Expected**:
- App memory: <100 MB
- No memory leaks
- Memory stable over time
- App remains responsive
- No crashes

**Pass Criteria**: Memory usage stable

---

### TEST-LOC-072: CPU Usage
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Monitor CPU during tracking
2. Check background CPU usage

**Expected**:
- Foreground: <5% average
- Background: <2% average
- No sustained high usage
- Device doesn't heat up

**Pass Criteria**: Low CPU usage

---

### TEST-LOC-073: Network Usage
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Track for 8 hours
2. Measure data usage

**Expected**:
- Data usage: <5 MB per 8-hour shift
- Each update: ~1 KB
- 480 updates × 1 KB = ~500 KB
- Overhead: <5× base = 2.5 MB
- Well within mobile data limits

**Pass Criteria**: <5 MB data per 8 hours

---

### TEST-LOC-074: App Responsiveness
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Navigate between screens
3. Check UI responsiveness

**Expected**:
- Screen transitions smooth
- No freezing or stuttering
- Buttons respond immediately
- List scrolling smooth
- Map panning smooth

**Pass Criteria**: App remains responsive during tracking

---

## Category 9: Edge Cases

### TEST-LOC-080: Timezone Crossing
**Priority**: Low  
**Platform**: iOS, Android

**Steps**:
1. Track while crossing timezones (rare in Philippines)
2. Check timestamp handling

**Expected**:
- All timestamps in UTC
- Display times in Philippine timezone
- No timestamp errors
- ETA calculations correct

**Pass Criteria**: Timezone handled correctly

---

### TEST-LOC-081: Date Rollover
**Priority**: Low  
**Platform**: iOS, Android

**Steps**:
1. Track from 11:30 PM to 12:30 AM
2. Cross midnight

**Expected**:
- No errors at midnight
- Dates transition correctly
- History spans correctly
- No data loss

**Pass Criteria**: Midnight rollover handled

---

### TEST-LOC-082: Coordinate Validation
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Simulate invalid coordinates:
   - Lat > 90°
   - Lng > 180°
   - NaN values

**Expected**:
- Invalid coordinates rejected
- Error logged
- No crash
- Continues with next update

**Pass Criteria**: Bad data rejected safely

---

### TEST-LOC-083: Rapid Location Changes
**Priority**: Low  
**Platform**: iOS, Android

**Steps**:
1. Simulate GPS spoofing with rapid jumps
2. Jump 100km instantly

**Expected**:
- Flags suspicious movement
- May require validation
- Doesn't crash
- Logs anomaly

**Pass Criteria**: Anomalies detected

---

### TEST-LOC-084: Long Duration Stopped
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Track while parked for 4 hours
2. Check update behavior

**Expected**:
- Updates reduce in frequency when stationary
- No battery waste on duplicate locations
- Still sends periodic heartbeat
- Resumes normal frequency when moving

**Pass Criteria**: Optimizes for stationary periods

---

## Category 10: Privacy & Compliance

### TEST-LOC-090: No Tracking When Inactive
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. No active trip
2. Check location service status
3. Verify no updates sent

**Expected**:
- Location service OFF
- No background tracking
- No location updates sent
- Clear "Tracking inactive" status
- No foreground service (Android)
- No blue bar (iOS)

**Pass Criteria**: Zero tracking without active trip

---

### TEST-LOC-091: Privacy Info Display
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Tap "Your privacy is protected" link
2. Read privacy information

**Expected Dialog Shows**:
- ✅ Tracking only during trips
- ✅ Auto-stops when trip completes
- ✅ Never tracked during personal time
- ✅ Encrypted transmission
- ✅ 90-day data retention
- ✅ Employee access to own data

**Pass Criteria**: Privacy info clear and accurate

---

### TEST-LOC-092: Data Retention
**Priority**: Medium  
**Platform**: Backend

**Steps**:
1. Create location data
2. Wait 90 days
3. Check if auto-deleted

**Expected**:
- Locations >90 days automatically deleted
- Recent data preserved
- Deletion runs daily
- Audit log of deletions

**Pass Criteria**: Old data auto-deleted

---

### TEST-LOC-093: Employee Data Access
**Priority**: Medium  
**Platform**: iOS, Android, Web

**Steps**:
1. Driver requests own location data
2. Export data

**Expected**:
- Driver can view own history
- Can export as CSV/JSON
- Shows all trips tracked
- Includes timestamps, coordinates
- Cannot see other drivers

**Pass Criteria**: Own data accessible

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Test devices prepared (iOS + Android)
- [ ] Test accounts created
- [ ] API endpoints configured
- [ ] Operator dashboard accessible
- [ ] Mock data ready
- [ ] Network testing tools ready

### Test Execution
- [ ] Run all Critical priority tests
- [ ] Run all High priority tests
- [ ] Document any failures
- [ ] Capture screenshots/videos
- [ ] Note device models and OS versions

### Post-Test
- [ ] Create bug reports for failures
- [ ] Update test results spreadsheet
- [ ] Share results with team
- [ ] Plan fixes for critical issues
- [ ] Schedule regression testing

---

## Success Criteria Summary

### Must Pass (Critical)
- ✅ Permissions requested correctly
- ✅ Auto-start/stop on trip lifecycle
- ✅ Background tracking persists
- ✅ Offline queue and sync works
- ✅ Geofence arrival detection
- ✅ Operator map real-time updates
- ✅ Battery <10% drain per 8 hours
- ✅ No tracking without active trip

### Should Pass (High)
- All Medium and Low priority tests
- Edge case handling
- Performance benchmarks
- Privacy compliance

---

**Test Document Version**: 1.0  
**Last Updated**: January 2024  
**Status**: Ready for Execution


---

## Category 11: GPS Health Monitoring

### TEST-GPS-001: GPS Health Monitoring Start/Stop
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. Start trip and begin tracking
2. Verify GPS health monitoring starts
3. Check health updates are being received
4. Complete trip
5. Verify GPS health monitoring stops

**Expected**:
- Health monitoring starts with tracking
- Health updates every 30 seconds
- Current health accessible via hook
- Monitoring stops when tracking stops
- No health updates after stop
- Resources cleaned up properly

**Pass Criteria**: Monitoring lifecycle tied to tracking

---

### TEST-GPS-002: Weak Signal Detection
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Start tracking in area with good GPS
2. Move to area with weak GPS signal (underground parking, building interior)
3. Wait for GPS signal to degrade
4. Observe alert banner

**Expected**:
- "Weak GPS Signal" alert appears
- Alert shows satellite count if available
- Alert severity is "warning" (yellow)
- Message explains accuracy may be reduced
- Alert dismissible by user
- Alert throttled (max 1 per 2 minutes)

**Pass Criteria**: Weak signal detected and alert displayed

---

### TEST-GPS-003: Poor Accuracy Detection
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Wait for accuracy to degrade >50m
3. Observe alert banner

**Expected**:
- "Poor GPS Accuracy" alert appears
- Shows accuracy value (e.g., "±75m")
- Alert severity is "warning" (yellow)
- Explains location may be inaccurate
- Location marker shows larger uncertainty circle on operator map

**Pass Criteria**: Poor accuracy detected and alert displayed

---

### TEST-GPS-004: GPS Unavailable Detection
**Priority**: Critical  
**Platform**: iOS, Android

**Steps**:
1. Start tracking with GPS enabled
2. Disable location services in device settings
3. Return to app
4. Observe alert

**Expected**:
- "GPS Unavailable" alert appears
- Alert severity is "error" (red)
- Message directs user to enable GPS
- "Open Settings" button available
- Operator map shows truck as "offline"
- Tracking paused until GPS restored

**Pass Criteria**: GPS unavailability detected and error shown

---

### TEST-GPS-005: Stale Location Detection
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Move app to background
3. Wait 5+ minutes without device movement
4. Return to app
5. Observe alert

**Expected**:
- "No GPS update for X minutes" alert appears
- Alert severity is "warning" (yellow)
- Shows time since last update
- Operator map shows "Last update Xm ago"
- Alert clears when fresh update received

**Pass Criteria**: Stale location detected after timeout

---

### TEST-GPS-006: Mock Location Detection (Android)
**Priority**: High  
**Platform**: Android

**Steps**:
1. Enable Developer Options
2. Enable "Allow mock locations"
3. Install GPS spoofing app
4. Start GPS spoofing
5. Start trip tracking
6. Observe alert

**Expected**:
- "Mock Location Detected" alert appears
- Alert severity is "error" (red)
- Warning that GPS may be falsified
- Alert sent to backend for logging
- Optional: Tracking paused pending review

**Pass Criteria**: Mock location detected and logged

---

### TEST-GPS-007: Signal Restored Notification
**Priority**: Low  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Move to weak signal area (trigger weak signal alert)
3. Return to good signal area
4. Observe alert

**Expected**:
- "GPS Signal Restored" alert appears
- Alert severity is "info" (blue)
- Auto-dismisses after 10 seconds
- Previous weak signal warning dismissed
- Operator map shows improved status

**Pass Criteria**: Signal restoration detected and notified

---

### TEST-GPS-008: Alert Throttling
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Rapidly trigger same alert type multiple times
   - Move in/out of weak signal area quickly
3. Observe alert frequency

**Expected**:
- Same alert type triggers max once per 2 minutes
- Subsequent triggers within 2 minutes are suppressed
- Console logs show "Alert throttled" message
- Different alert types not affected by each other's throttles

**Pass Criteria**: Alerts throttled to prevent spam

---

### TEST-GPS-009: Alert Rate Limiting
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Trigger multiple different alert types rapidly
3. Count alerts displayed
4. Continue for 1 hour

**Expected**:
- Maximum 10 alerts per hour (all types combined)
- After 10 alerts, new alerts suppressed
- Console logs show "Alert rate limit reached"
- Rate limit resets after 1 hour
- Critical errors (GPS unavailable) may bypass limit

**Pass Criteria**: Max 10 alerts per hour enforced

---

### TEST-GPS-010: Health History Tracking
**Priority**: Low  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Track for 2+ hours
3. Query health history via hook: `getHistory(1)`
4. Query health history via hook: `getHistory(24)`
5. Query average signal strength
6. Query average accuracy

**Expected**:
- History tracks signal strength over time
- History tracks accuracy over time
- Can query last 1 hour, 24 hours, etc.
- Average statistics calculated correctly
- History limited to 24 hours
- Old entries automatically cleaned up

**Pass Criteria**: Health history tracked and queryable

---

### TEST-GPS-011: GPS Health in LocationTrackingCard
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Observe LocationTrackingCard component
3. Check GPS health display

**Expected**:
- Shows signal strength (1-5 bars or stars)
- Shows accuracy in meters
- Shows satellite count if available
- Shows quality indicator (excellent/good/fair/poor)
- Color-coded by quality:
  - Excellent: Green
  - Good: Blue
  - Fair: Yellow
  - Poor: Red
- Updates in real-time

**Pass Criteria**: GPS health visible in tracking card

---

### TEST-GPS-012: GPS Health on Operator Map
**Priority**: High  
**Platform**: Web (operator dashboard)

**Steps**:
1. Driver starts tracking
2. Operator opens fleet map
3. Click on truck marker
4. Observe info window

**Expected**:
- GPS health indicator shown
- Signal strength icon displayed
- Accuracy value shown (±Xm)
- Satellite count shown if available
- Quality badge (excellent/good/fair/poor)
- Color-coded by health status
- "Last update" timestamp
- Updates in real-time as health changes

**Pass Criteria**: GPS health visible on operator map

---

### TEST-GPS-013: Multiple Concurrent Alerts
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Trigger multiple different alert types:
   - Weak signal
   - Poor accuracy
   - Stale location
3. Observe GPSAlertBanner

**Expected**:
- Shows up to 3 alerts simultaneously
- Stacked vertically with spacing
- Each alert independently dismissible
- "Clear All" button appears when 2+ alerts
- Oldest alerts drop off when 4th alert arrives
- Each alert shows timestamp

**Pass Criteria**: Max 3 alerts shown simultaneously

---

### TEST-GPS-014: Alert Auto-Dismiss
**Priority**: Low  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Trigger info alert (signal restored)
3. Wait 10 seconds
4. Observe alert

**Expected**:
- Info severity alerts auto-dismiss after 10 seconds
- Warning alerts persist until manually dismissed
- Error alerts persist until manually dismissed
- Fade-out animation on auto-dismiss
- Alert removed from recentAlerts array

**Pass Criteria**: Info alerts auto-dismiss, others persist

---

### TEST-GPS-015: Health Data in Location Updates
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Capture network request for location update
3. Inspect payload

**Expected**:
- Location payload includes `gps_health` object
- Contains: signal_strength, accuracy, satellite_count, quality
- Values match current health state
- Operator map can display this data
- Backend stores health with location

**Pass Criteria**: GPS health included in location updates

---

### TEST-GPS-016: GPS Health After App Restart
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Start tracking with active trip
2. Force close app
3. Reopen app
4. Observe GPS health

**Expected**:
- Tracking resumes automatically
- GPS health monitoring resumes
- Health history lost (acceptable)
- New health data collected immediately
- Alerts reset (no stale alerts shown)

**Pass Criteria**: Health monitoring resumes after restart

---

### TEST-GPS-017: GPS Health with Battery Saver Mode
**Priority**: High  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Enable battery saver mode on device
3. Observe GPS health alerts

**Expected**:
- May trigger "Poor Accuracy" warning
- Update frequency may decrease (expected)
- Alert explains battery saver may affect GPS
- Accuracy typically degrades to 50-100m
- Tracking continues despite degradation

**Pass Criteria**: Health monitoring works in battery saver mode

---

### TEST-GPS-018: GPS Health in Airplane Mode
**Priority**: Medium  
**Platform**: iOS, Android

**Steps**:
1. Start tracking
2. Enable airplane mode (GPS stays on if device supports)
3. Observe GPS health

**Expected**:
- GPS continues if device supports GPS-only mode
- May trigger "GPS Unavailable" if GPS disabled
- Network-based location unavailable
- Accuracy may be reduced without assisted GPS
- Location queue stores updates for later sync

**Pass Criteria**: Handles airplane mode appropriately

---

### TEST-GPS-019: GPS Health Callback Unsubscribe
**Priority**: Low  
**Platform**: iOS, Android

**Steps**:
1. Component mounts and subscribes to health updates
2. Component unmounts
3. Verify unsubscribe called
4. Verify no memory leaks

**Expected**:
- useGPSHealth hook cleans up on unmount
- onHealthUpdate callback unsubscribed
- onAlert callback unsubscribed
- No console errors after unmount
- No memory leaks in React DevTools

**Pass Criteria**: Proper cleanup on unmount

---

### TEST-GPS-020: GPS Health with No Satellite Data
**Priority**: Medium  
**Platform**: iOS, Android (especially iOS)

**Steps**:
1. Start tracking on device that doesn't expose satellite count
2. Observe GPS health

**Expected**:
- Signal strength calculated from accuracy as fallback
- Quality still determined correctly
- No errors or crashes
- Signal strength: 
  - 5 if accuracy ≤10m
  - 4 if accuracy ≤30m
  - 3 if accuracy ≤50m
  - 2 if accuracy ≤100m
  - 1 if accuracy >100m

**Pass Criteria**: Health monitoring works without satellite count

---

## GPS Health Test Summary

Total GPS Health Tests: 20

**By Priority:**
- Critical: 3
- High: 5
- Medium: 9
- Low: 3

**By Platform:**
- iOS & Android: 18
- Web (Operator): 1
- Android-specific: 1

**Test Coverage:**
- ✅ Health monitoring lifecycle
- ✅ All alert types (7 types)
- ✅ Alert throttling and rate limiting
- ✅ Health history tracking
- ✅ UI components (banner, card, map)
- ✅ Data integration with location updates
- ✅ Edge cases (battery saver, airplane mode, no satellites)
- ✅ Memory management and cleanup

**Estimated Testing Time:** 4-6 hours

---

## Running GPS Health Tests

### Manual Testing Checklist

1. **Setup Phase** (15 min)
   - Install app on test devices
   - Enable GPS/location services
   - Login as test driver
   - Verify permissions granted

2. **Alert Testing** (90 min)
   - Test all 7 alert types
   - Verify throttling behavior
   - Test rate limiting
   - Check alert UI (banner, colors, dismiss)

3. **Health Data Testing** (60 min)
   - Verify signal strength calculation
   - Check accuracy tracking
   - Test quality determination
   - Validate history tracking

4. **Integration Testing** (60 min)
   - Test with LocationTrackingCard
   - Test with GPSAlertBanner
   - Verify operator map integration
   - Check location payload includes health

5. **Edge Case Testing** (60 min)
   - Battery saver mode
   - Airplane mode
   - App restart
   - No satellite data
   - Mock location (Android)

6. **Performance Testing** (30 min)
   - Memory leak check
   - Battery drain measurement
   - Network overhead
   - History cleanup

### Automated Testing

```typescript
// Jest tests for GPSHealthMonitor
describe('GPSHealthMonitor', () => {
  test('should start and stop monitoring', () => {
    const monitor = new GPSHealthMonitor();
    monitor.startMonitoring();
    expect(monitor['healthCheckTimer']).toBeDefined();
    
    monitor.stopMonitoring();
    expect(monitor['healthCheckTimer']).toBeUndefined();
  });

  test('should trigger weak signal alert', () => {
    const monitor = new GPSHealthMonitor();
    let triggeredAlert: GPSAlert | null = null;
    
    monitor.onAlert(alert => {
      triggeredAlert = alert;
    });

    const location: LocationUpdate = {
      // ... location with 2 satellites
      satelliteCount: 2,
    };

    monitor.updateLocation(location);
    expect(triggeredAlert?.type).toBe('weak_signal');
    expect(triggeredAlert?.severity).toBe('warning');
  });

  test('should throttle duplicate alerts', () => {
    const monitor = new GPSHealthMonitor({
      alertThrottleInterval: 1000, // 1 second for testing
    });
    
    let alertCount = 0;
    monitor.onAlert(() => alertCount++);

    const location: LocationUpdate = {
      // ... weak signal location
      satelliteCount: 2,
    };

    // Trigger same alert multiple times
    monitor.updateLocation(location);
    monitor.updateLocation(location);
    monitor.updateLocation(location);

    expect(alertCount).toBe(1); // Only first alert triggered
  });

  test('should track health history', () => {
    const monitor = new GPSHealthMonitor();
    
    const location: LocationUpdate = {
      // ... location data
    };

    monitor.updateLocation(location);
    
    const history = monitor.getHealthHistory(1);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toHaveProperty('signalStrength');
    expect(history[0]).toHaveProperty('accuracy');
  });

  test('should calculate average signal strength', () => {
    const monitor = new GPSHealthMonitor();
    
    // Add multiple updates with different signal strengths
    for (let i = 0; i < 5; i++) {
      monitor.updateLocation({
        // ... location with varying satellite counts
        satelliteCount: 3 + i,
      } as LocationUpdate);
    }

    const avg = monitor.getAverageSignalStrength(1);
    expect(avg).toBeGreaterThan(0);
    expect(avg).toBeLessThanOrEqual(5);
  });
});
```

### Testing Checklist

- [ ] TEST-GPS-001: Health monitoring lifecycle
- [ ] TEST-GPS-002: Weak signal detection
- [ ] TEST-GPS-003: Poor accuracy detection
- [ ] TEST-GPS-004: GPS unavailable detection
- [ ] TEST-GPS-005: Stale location detection
- [ ] TEST-GPS-006: Mock location detection (Android)
- [ ] TEST-GPS-007: Signal restored notification
- [ ] TEST-GPS-008: Alert throttling
- [ ] TEST-GPS-009: Alert rate limiting
- [ ] TEST-GPS-010: Health history tracking
- [ ] TEST-GPS-011: GPS health in LocationTrackingCard
- [ ] TEST-GPS-012: GPS health on operator map
- [ ] TEST-GPS-013: Multiple concurrent alerts
- [ ] TEST-GPS-014: Alert auto-dismiss
- [ ] TEST-GPS-015: Health data in location updates
- [ ] TEST-GPS-016: GPS health after app restart
- [ ] TEST-GPS-017: GPS health with battery saver mode
- [ ] TEST-GPS-018: GPS health in airplane mode
- [ ] TEST-GPS-019: GPS health callback unsubscribe
- [ ] TEST-GPS-020: GPS health with no satellite data

---

## Test Results Template

### GPS Health Test Report

**Date:** __________  
**Tester:** __________  
**Device(s):** __________  
**OS Version(s):** __________  
**App Version:** __________

#### Tests Executed: _____ / 20
#### Tests Passed: _____ / 20
#### Tests Failed: _____ / 20
#### Tests Blocked: _____ / 20

#### Critical Issues Found:
1. 
2. 
3. 

#### Non-Critical Issues:
1. 
2. 
3. 

#### Notes:


**Tester Signature:** __________
