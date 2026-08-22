# Vone Trucking Mobile App - Testing Guide

This document provides comprehensive testing procedures for the driver and porter mobile workflows.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Driver Workflow Testing](#driver-workflow-testing)
- [Porter Workflow Testing](#porter-workflow-testing)
- [Offline Support Testing](#offline-support-testing)
- [Known Limitations](#known-limitations)

---

## Prerequisites

### Test Data Requirements

Before testing, ensure the following test data is available:

1. **Test Users**
   - Driver account with valid credentials
   - Porter account with valid credentials
   
2. **Test Trips**
   - At least 2 scheduled trips for today
   - At least 2 upcoming trips
   - At least 1 completed trip (for history)

3. **Test Assignments**
   - Trips assigned to both driver and porter
   - At least one pending acknowledgement
   - Mixed trip statuses (scheduled, in progress, completed)

### Device Setup

- Device with GPS enabled (for location testing)
- Camera access granted (for photo uploads)
- Internet connection (test both online and offline scenarios)

---

## Driver Workflow Testing

### Test 1: Home Screen and Assignment Viewing

**Objective:** Verify driver can view their assignments and current trip status

**Steps:**
1. Open the app and login as driver
2. Navigate to Home tab (should be default)
3. Verify offline banner does NOT show (if online)
4. Check header displays:
   - Greeting ("Good day!")
   - Current date in Philippine format
   - Notification bell icon
   - Sync queue button (if any pending syncs)

**Expected Results:**
- Current trip card shows:
  - Trip number
  - Status badge with icon
  - Pickup warehouse
  - Delivery destination
  - Call time
  - Cargo description
  - "View Trip Details" button
- OR "No active trip" message if no trip in progress
- Overview stats display:
  - Today trips count
  - Upcoming trips count
  - Completed trips count
  - Pending acknowledgements count (if any)
- Today's Assignments section shows pending trips
- Upcoming Trips section shows next 3 upcoming trips with "See All" link

---

### Test 2: Assignment Acknowledgement

**Objective:** Verify driver can acknowledge trip assignments

**Steps:**
1. On Home screen, find a trip with "Needs Ack" badge
2. Tap the trip card
3. Verify acknowledgement button is visible
4. Tap "Acknowledge Assignment" button
5. Confirm in the dialog

**Expected Results:**
- Confirmation dialog appears with trip number
- After confirming:
  - Success message displays
  - Badge changes from "Needs Ack" to acknowledged status
  - Trip appears in current trip card if it's today
  - Home screen refreshes to show updated status

---

### Test 3: Trip Navigation Integration

**Objective:** Verify navigation to Google Maps/Waze works

**Steps:**
1. From Home, tap current trip card or navigate to Trips tab
2. Tap a trip to view details
3. In trip detail screen, find the "Navigate" buttons
4. Tap "Google Maps" button
5. Go back and tap "Waze" button

**Expected Results:**
- Google Maps button opens Google Maps app with destination address
- Waze button opens Waze app with destination address
- If app not installed, system shows appropriate message
- After returning from navigation app, trip detail screen still displays correctly

---

### Test 4: Status Update Flow

**Objective:** Verify driver can update trip status through valid transitions

**Steps:**
1. Navigate to a trip in "Acknowledged" status
2. Verify "At Warehouse" button is displayed (next valid action)
3. Tap "At Warehouse" button
4. Confirm the action
5. Verify status updates to "At Warehouse"
6. Repeat for next status transitions:
   - At Warehouse → Loading
   - Loading → Dispatch
   - Dispatch → In Transit
   - In Transit → Arrive at Destination
   - Arrive → Unloading
   - Unloading → Delivered
   - Delivered → Returning
   - Returning → Complete

**Expected Results:**
- Only valid next status button(s) are displayed
- Status badge updates after each transition
- Button colors match status type
- Confirmation dialog shows before each change
- Invalid transitions are not offered as options
- Location is captured automatically on status updates

---

### Test 5: Delay Reporting

**Objective:** Verify driver can report delays with proper details

**Steps:**
1. Navigate to Reports tab
2. Tap "Delay Report" card
3. Select a delay reason (e.g., "Traffic")
4. Select estimated delay time (e.g., "30 Minutes")
5. Enter optional description
6. Tap "Submit Report"
7. Confirm submission

**Expected Results:**
- All 7 delay reasons are selectable
- 6 delay time options available (15min to 3+ hours)
- Text description is optional
- Confirmation dialog shows before submission
- Success message after submission
- Location captured automatically
- Screen returns to Reports home

---

### Test 6: Incident Reporting

**Objective:** Verify driver can report incidents with all required details

**Steps:**
1. From Reports tab, tap "Incident Report"
2. Select incident type (e.g., "Accident")
3. Select severity level (e.g., "High")
4. Enter detailed description
5. Toggle "Were there injuries?" to ON
6. Enter injury details
7. Toggle "Was police called?" to ON
8. Enter police report number
9. Toggle "Other parties involved?" to ON
10. Enter other parties details
11. Tap "Submit Report"
12. Confirm submission

**Expected Results:**
- 6 incident types available
- 4 severity levels with color coding
- Description field is required
- Conditional fields appear only when toggles are ON
- All toggles default to OFF
- Confirmation shows severity level
- Location captured automatically
- Success message after submission

---

### Test 7: Truck Problem Reporting

**Objective:** Verify driver can report truck issues

**Steps:**
1. From Reports tab, tap "Truck Problem Report"
2. Select problem type (e.g., "Brakes")
3. Select severity (e.g., "Critical")
4. Toggle "Can you continue the trip safely?" to OFF
5. Observe urgent warning message
6. Enter problem description
7. Optionally enter odometer reading
8. Tap "Submit Report"
9. Confirm submission

**Expected Results:**
- 10 problem types displayed in grid
- 4 severity levels available
- Red warning appears when "can continue" is OFF
- Orange warning for medium/high severity
- Description field required
- Odometer reading optional
- Photo upload option available
- Location captured automatically

---

### Test 8: Fuel Entry

**Objective:** Verify driver can log fuel purchases

**Steps:**
1. Navigate to Profile tab
2. Tap "Fuel & Receipts"
3. Verify "Fuel" tab is active
4. Enter station name (e.g., "Shell NLEX")
5. Enter liters (e.g., "45")
6. Enter cost (e.g., "2500")
7. Enter odometer reading (e.g., "12500")
8. Tap "Take Photo" button (simulated for now)
9. Tap "Submit Fuel Entry"
10. Confirm submission

**Expected Results:**
- All fields are required except photo
- Numeric inputs show number keyboard
- Photo placeholder shows when tapped
- Confirmation dialog before submission
- Success message after submission
- Form clears after successful submission

---

### Test 9: Receipt Upload

**Objective:** Verify driver can submit expense receipts

**Steps:**
1. In Profile → Fuel & Receipts
2. Switch to "Receipts" tab
3. Select receipt type (e.g., "Toll")
4. Enter description (e.g., "SCTEX toll")
5. Enter amount (e.g., "150")
6. Tap "Take Photo"
7. Tap "Submit Receipt"
8. Confirm submission

**Expected Results:**
- 4 receipt types available
- All fields required except photo
- Amount field shows decimal keyboard
- Photo upload simulated
- Confirmation before submission
- Success message displayed

---

### Test 10: Odometer Reading

**Objective:** Verify driver can record odometer readings

**Steps:**
1. In Profile → Fuel & Receipts
2. Switch to "Odometer" tab
3. Select reading type "Start of Trip"
4. Enter odometer value (e.g., "12500")
5. Tap "Take Photo" (simulated)
6. Tap "Submit Reading"
7. Confirm submission
8. Repeat for "End of Trip" reading

**Expected Results:**
- 2 reading types: Start and End
- Large numeric input field
- Photo required for submission
- Confirmation dialog
- Success message
- Reading stored with timestamp

---

### Test 11: Trip History

**Objective:** Verify driver can view completed trips

**Steps:**
1. Navigate to Profile tab
2. Tap "Trip History"
3. Pull down to refresh
4. Tap a completed trip card

**Expected Results:**
- All completed trips display
- Each card shows:
  - Trip number
  - Completion date
  - Route (pickup → destination)
  - Green checkmark icon
- Tapping card navigates to trip details
- Pull-to-refresh works
- Empty state shown if no history

---

### Test 12: Payslips

**Objective:** Verify driver can view salary information

**Steps:**
1. Navigate to Profile tab
2. Tap "Payslips"
3. Pull down to refresh
4. View a payslip card
5. Tap "Download PDF" button

**Expected Results:**
- All payslips displayed newest first
- Each card shows:
  - Pay period dates
  - Trip count
  - Status badge (paid/approved/pending)
  - Base salary
  - Trip incentives (green)
  - Deductions (red)
  - Net pay (prominent)
- Download button visible
- Pull-to-refresh works

---

### Test 13: Cash Advance Request

**Objective:** Verify driver can request cash advances

**Steps:**
1. Navigate to Profile tab
2. Tap "Cash Advance"
3. Tap "Request Cash Advance" button
4. Enter amount (e.g., "5000")
5. Enter reason (e.g., "Family emergency")
6. Read the notice about deductions
7. Tap "Submit Request"
8. Confirm submission

**Expected Results:**
- Modal opens with request form
- Amount and reason fields required
- Notice about payslip deduction shown
- Confirmation dialog before submission
- Success message
- New request appears with "pending" status
- Modal closes after submission

---

### Test 14: Profile Actions

**Objective:** Verify profile-level actions work

**Steps:**
1. Navigate to Profile tab
2. Tap "Call Operator" button
3. Confirm or cancel the call dialog
4. Tap "Logout" button
5. Confirm or cancel logout

**Expected Results:**
- Call operator shows phone number
- Confirmation before dialing
- Logout shows warning
- Confirmation before logout
- User info card displays name, role, ID

---

## Porter Workflow Testing

### Test 15: Porter Home Screen

**Objective:** Verify porter can view assignments

**Steps:**
1. Login as porter
2. View Home tab
3. Check stats overview
4. View today's assignments
5. View upcoming trips

**Expected Results:**
- Similar to driver home but with 3 tabs (no Reports tab)
- Stats show today/upcoming/completed counts
- Assignment cards show:
  - Trip number
  - Call time
  - Destination
  - Truck number
  - Driver name
  - "Needs Ack" badge if pending

---

### Test 16: Porter Trip Acknowledgement

**Objective:** Verify porter can acknowledge assignments

**Steps:**
1. Find trip with "Needs Ack" badge
2. Tap trip card
3. Tap "Acknowledge Assignment" button
4. Confirm in dialog

**Expected Results:**
- Same as driver acknowledgement
- Badge updates
- Trip moves to acknowledged status

---

### Test 17: Time In/Out Tracking

**Objective:** Verify porter can clock in and out

**Steps:**
1. Navigate to acknowledged trip
2. In "Time Tracking" section, tap "Clock In"
3. Verify current time displayed
4. Confirm clock in
5. Observe time in recorded
6. Tap "Clock Out"
7. Confirm clock out
8. Observe time out recorded

**Expected Results:**
- Clock In button available when no time in
- Modal shows current time in Philippine format
- Notice about location capture
- Time in displays after recording
- Clock Out button appears after clocking in
- Both times stored with location
- Times displayed in Philippine format

---

### Test 18: Loading Checklist

**Objective:** Verify porter can complete loading checklist

**Steps:**
1. In trip detail, tap "Loading Checklist" button
2. Modal opens with checklist
3. Tap each checkbox:
   - All items loaded
   - Items match manifest
   - Items properly secured
   - No damage observed
4. Enter quantity loaded (e.g., "50")
5. Enter optional notes
6. Tap "Take Photo" multiple times
7. Tap "Submit Loading Checklist"
8. Confirm submission

**Expected Results:**
- Full-screen modal with checklist
- 4 checkbox items
- Checkboxes toggle on/off
- Quantity field required
- Notes field optional
- Photo counter updates
- Cannot submit without all checkboxes
- Cannot submit without quantity
- Success message after submission
- Modal closes

---

### Test 19: Delivery Checklist

**Objective:** Verify porter can complete delivery checklist

**Steps:**
1. In trip detail, tap "Delivery Checklist" button
2. Complete all 4 checkboxes:
   - All items delivered
   - Customer signature obtained
   - Delivery location correct
   - No damage on delivery
3. Enter quantity delivered
4. Enter customer notes (optional)
5. Enter delivery notes (optional)
6. Take photos
7. Submit checklist
8. Confirm

**Expected Results:**
- Similar to loading checklist
- 4 different checkbox items
- Quantity delivered required
- Two notes fields (customer and delivery)
- Photos recommended
- Validation before submission
- Success message

---

### Test 20: Missing Product Report

**Objective:** Verify porter can report missing items

**Steps:**
1. From trip detail, tap "Report Missing Item"
2. Enter product name
3. Enter quantity missing
4. Enter description of situation
5. Take photos (optional)
6. Tap "Submit Report"
7. Confirm submission

**Expected Results:**
- Yellow warning banner at top
- Product name required
- Quantity must be valid number
- Description required
- Photos optional but recommended
- Confirmation dialog
- Success message
- Returns to trip detail

---

### Test 21: Damaged Product Report

**Objective:** Verify porter can report damaged items

**Steps:**
1. From trip detail, tap "Report Damaged Item"
2. Enter product name
3. Enter quantity damaged
4. Select damage type (e.g., "Broken")
5. Enter detailed description
6. Take photos (required)
7. Submit report
8. Confirm

**Expected Results:**
- Red error banner at top
- 6 damage types in grid
- All fields required
- Photos strongly recommended
- Confirmation shows damage type
- Success message

---

### Test 22: Rejected Product Report

**Objective:** Verify porter can report rejected deliveries

**Steps:**
1. From trip detail, tap "Report Rejected Item"
2. Enter product name
3. Enter quantity rejected
4. Select rejection reason (e.g., "Wrong Item")
5. Enter customer name
6. Enter description
7. Take photos (required)
8. Submit report
9. Confirm

**Expected Results:**
- Red error banner
- 6 rejection reasons in grid
- Customer name required
- Description required
- Photos required (enforced)
- Cannot submit without photos
- Confirmation dialog
- Success message

---

### Test 23: Porter Profile Screens

**Objective:** Verify porter profile functionality

**Steps:**
1. Test Trip History (same as driver)
2. Test Payslips (same as driver)
3. Test Cash Advance (same as driver)
4. Test Call Operator
5. Test Logout

**Expected Results:**
- All profile screens work identically to driver
- User info shows porter role
- History shows porter's trips
- Payslips show porter's pay

---

## Offline Support Testing

### Test 24: Offline Banner

**Objective:** Verify offline mode is detected and displayed

**Steps:**
1. Enable airplane mode or disable internet
2. Open app (or it's already open)
3. Observe offline banner at top

**Expected Results:**
- Orange banner appears at top of screen
- Shows "You're Offline" message
- Shows count of pending actions (if any)
- Banner disappears when back online

---

### Test 25: Action Queuing While Offline

**Objective:** Verify actions are queued when offline

**Steps:**
1. Go offline (airplane mode)
2. Submit a delay report
3. Submit an incident report
4. Record fuel entry
5. Tap sync queue button in header
6. View pending sync queue

**Expected Results:**
- Actions submit without errors
- "Pending" status shown
- Sync queue button shows count badge
- Queue modal shows all pending actions
- Each action shows:
  - Action type
  - Timestamp
  - "Pending" status badge
  - Retry count (if any)

---

### Test 26: Auto-Sync When Online

**Objective:** Verify automatic sync when connection restored

**Steps:**
1. With pending actions in queue
2. Re-enable internet connection
3. Observe sync queue button
4. Open sync queue modal

**Expected Results:**
- Actions automatically begin syncing
- Status changes from "Pending" to "Syncing"
- Sync queue count decreases
- Successfully synced actions removed from queue
- Badge disappears when all synced

---

### Test 27: Manual Sync Trigger

**Objective:** Verify manual sync functionality

**Steps:**
1. Have pending actions in queue
2. Be online
3. Open sync queue modal
4. Tap "Sync All" button
5. Observe sync progress

**Expected Results:**
- Sync All button visible when online
- Button shows "Syncing..." during sync
- Status badges update in real-time
- Success/failure shown for each action
- Queue updates automatically

---

### Test 28: Failed Action Retry

**Objective:** Verify retry mechanism for failed syncs

**Steps:**
1. Create a scenario where sync fails (simulate server error)
2. Observe action marked as "Failed"
3. Tap the retry button on failed action
4. Confirm retry
5. Observe re-sync attempt

**Expected Results:**
- Failed actions show red badge
- Retry count displayed (1 of 3, 2 of 3, etc.)
- Retry button visible
- Individual retry button works
- After 3 failed attempts, action stays failed
- Can manually remove failed actions

---

### Test 29: Sync Status Indicators

**Objective:** Verify sync status badges are clear

**Steps:**
1. View pending sync queue with mixed statuses
2. Identify actions in each state:
   - Synced (green check)
   - Pending (yellow clock)
   - Syncing (blue sync icon)
   - Failed (red alert)
   - Offline (gray cloud)

**Expected Results:**
- Each status has distinct color and icon
- Status changes are animated
- Compact badges available in lists
- Full badges in queue view
- Failed items show retry option

---

### Test 30: Offline Data Persistence

**Objective:** Verify queued actions persist across app restarts

**Steps:**
1. Go offline
2. Submit several actions
3. Verify they're queued
4. Force close the app
5. Reopen app while still offline
6. Check sync queue

**Expected Results:**
- All pending actions still in queue
- No data loss
- Timestamps preserved
- Retry counts maintained
- Queue loads quickly on app start

---

## Known Limitations

### Current Implementation Gaps

1. **Photo Upload**
   - Camera integration not yet implemented
   - Currently shows placeholder alerts
   - Photo URLs are mocked
   - **TODO**: Integrate `expo-image-picker` or `expo-camera`

2. **Location Capture**
   - Location services not yet implemented
   - `getCurrentLocation()` returns mock coordinates
   - **TODO**: Integrate `expo-location`

3. **Real API Integration**
   - All service functions use mock data
   - No actual backend calls
   - AsyncStorage used for offline queue only
   - **TODO**: Replace mock responses with real API endpoints

4. **Navigation Deep Links**
   - Google Maps/Waze URLs constructed but not fully tested
   - May need platform-specific adjustments
   - **TODO**: Test on actual devices with navigation apps

5. **Push Notifications**
   - Notification bell is placeholder
   - No actual push notification service
   - **TODO**: Integrate Firebase Cloud Messaging or similar

6. **PDF Generation**
   - Payslip download button is placeholder
   - No PDF generation implemented
   - **TODO**: Integrate PDF generation library

7. **Signature Capture**
   - Proof of delivery signature mentioned but not implemented
   - **TODO**: Add signature pad component

8. **Barcode Scanning**
   - No barcode/QR code scanning for cargo verification
   - **TODO**: Consider adding if needed

### Testing Environment Notes

- Test on both iOS and Android devices
- Test on different screen sizes (phones and tablets)
- Test with different network conditions (WiFi, cellular, offline)
- Test with low battery mode
- Test with interrupted workflows (phone calls, app switching)

### Data Validation Requirements

Before production:
- Validate all Philippine date/time formatting
- Verify currency formatting (PHP ₱)
- Test timezone handling
- Validate phone number formats
- Test address formatting

---

## Test Result Template

Use this template to record test results:

```
Test #: [Test Number]
Test Name: [Test Name]
Date: [YYYY-MM-DD]
Tester: [Name]
Device: [Device Model & OS]
Result: [PASS/FAIL/BLOCKED]
Notes: [Any observations or issues]
Screenshots: [Attach if applicable]
```

---

## Next Steps

1. Complete tasks #13 and #14 by running through all tests
2. Document any bugs or issues found
3. Implement missing integrations (camera, location, API)
4. Add unit tests for business logic
5. Add integration tests for critical flows
6. Set up continuous testing pipeline

---

**Document Version:** 1.0  
**Last Updated:** August 22, 2026  
**Status:** Ready for Testing
