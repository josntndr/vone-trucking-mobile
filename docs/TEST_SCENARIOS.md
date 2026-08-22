# Vone Trucking - Detailed Test Scenarios

## Scenario 1: Complete Trip Workflow (Online)

**Role**: Driver  
**Duration**: ~30 minutes  
**Prerequisites**: Have test Google Sheet with trip, test truck assigned, test route

### Steps:

1. **Login as Operator**
   - Open app
   - Enter operator credentials
   - Verify dashboard appears

2. **Import Schedule**
   - Navigate to Schedule Import
   - Connect Google account (if first time)
   - Select test Google Sheet
   - Tap "Import Schedule"
   - Verify import success message
   - Verify trips appear in trip list
   - Check notification sent to driver

3. **Login as Driver**
   - Logout operator
   - Login with driver credentials
   - Navigate to "Assignments"
   - Verify trip appears in "Upcoming" section

4. **Review Trip Details**
   - Tap on assigned trip
   - Verify details: pickup, dropoff, cargo, truck, schedule
   - Verify porter information (if assigned)
   - Check map/directions available

5. **Start Trip**
   - Tap "Start Trip"
   - Allow location permissions (if prompted)
   - Enter starting odometer: 45000 km
   - Complete pre-trip checklist (if shown)
   - Verify GPS location captured
   - Verify trip status = "In Progress"
   - Check start time recorded
   - Verify notification sent to operator

6. **Record Fuel**
   - Tap "Add Fuel" button
   - Enter fuel station name: "Shell Nairobi"
   - Enter litres: 45
   - Enter cost: KES 6,750
   - Tap "Take Receipt Photo"
   - Capture receipt photo
   - Tap "Save Fuel Record"
   - Verify fuel record appears
   - Verify location captured

7. **Record Expense (Toll)**
   - Tap "Add Expense"
   - Select type: "Toll"
   - Enter amount: KES 300
   - Enter notes: "Thika Superhighway"
   - Tap "Take Receipt Photo" (optional)
   - Tap "Save Expense"
   - Verify expense appears in trip

8. **Record Expense (Parking)**
   - Tap "Add Expense"
   - Select type: "Parking"
   - Enter amount: KES 200
   - Enter notes: "Customer parking fee"
   - Tap "Save Expense"
   - Verify expense appears

9. **Complete Delivery**
   - Navigate to "Complete Delivery"
   - Enter recipient name: "John Doe"
   - Verify delivery time auto-filled
   - Tap "Capture Signature"
   - Draw signature on screen
   - Tap "Done"
   - Verify signature preview shown
   - Tap "Take Delivery Photo"
   - Capture photo of delivered goods
   - Enter delivery notes: "Delivered in good condition"
   - Tap "Save Proof of Delivery"
   - Verify POD saved
   - Verify delivery confirmation notification sent

10. **Complete Trip**
    - Tap "Complete Trip"
    - Enter ending odometer: 45180 km
    - Complete post-trip checklist (if shown)
    - Review trip summary:
      - Duration
      - Distance: 180 km
      - Fuel cost: KES 6,750
      - Other expenses: KES 500
      - Total expenses: KES 7,250
      - Trip income: KES 15,000
      - Net profit: KES 7,750
    - Tap "Confirm Completion"
    - Verify trip status = "Completed"
    - Verify completion notification sent
    - Verify trip appears in "Completed" list

11. **Verify Operator View**
    - Logout driver
    - Login as operator
    - Navigate to Analytics Dashboard
    - Verify completed trip count increased
    - Verify profit included in dashboard
    - Navigate to trip details
    - Verify all expenses visible
    - Verify POD signature and photo visible

12. **Generate Report**
    - Navigate to Reports
    - Select "Trip Report"
    - Select date range including test trip
    - Tap "Generate Report"
    - Verify trip appears in report
    - Verify profit calculated correctly
    - Export to CSV
    - Verify file downloads/shares successfully

**Expected Result**: Complete trip workflow from import through delivery, all data captured correctly, profit calculated accurately, operator can view all details and generate reports.

---

## Scenario 2: Complete Trip Workflow (Offline)

**Role**: Driver  
**Duration**: ~35 minutes  
**Prerequisites**: Same as Scenario 1

### Steps:

1-4. **Follow Scenario 1 Steps 1-4** (Login, import, view assignment)

5. **Enable Airplane Mode**
   - Open device settings
   - Enable Airplane Mode
   - Return to app
   - Verify offline indicator appears

6. **Start Trip Offline**
   - Tap "Start Trip"
   - Enter starting odometer: 45000 km
   - Verify trip starts despite offline
   - Verify sync queue indicator shows "1 pending"
   - Check trip status = "In Progress"

7. **Record Fuel Offline**
   - Tap "Add Fuel"
   - Enter fuel station: "Total Mombasa"
   - Enter litres: 50
   - Enter cost: KES 7,500
   - Take receipt photo
   - Tap "Save Fuel Record"
   - Verify "Saved Offline" message
   - Verify sync queue shows "2 pending"

8. **Record Expenses Offline**
   - Add toll: KES 500
   - Add parking: KES 150
   - Verify both saved offline
   - Verify sync queue shows "4 pending"

9. **Complete Delivery Offline**
   - Navigate to delivery screen
   - Enter recipient name
   - Capture signature
   - Take delivery photo
   - Save POD
   - Verify "Saved Offline, will sync when online"
   - Verify sync queue shows "6 pending" (POD + photos)

10. **Complete Trip Offline**
    - Tap "Complete Trip"
    - Enter ending odometer
    - Confirm completion
    - Verify trip marked complete locally
    - Verify sync queue shows "7 pending"

11. **Disable Airplane Mode**
    - Open device settings
    - Disable Airplane Mode
    - Return to app
    - Verify online indicator appears
    - **Watch sync queue**
    - Verify auto-sync starts
    - Verify items sync one by one
    - Wait for "All items synced" message

12. **Verify Sync Complete**
    - Navigate to Sync Queue screen
    - Verify all items status = "Synced"
    - Verify no pending or failed items
    - Check timestamps on synced items

13. **Verify Operator View**
    - Login as operator
    - Verify trip appears as completed
    - Verify all data synced correctly:
      - Start/end times
      - Fuel record
      - Expenses
      - POD signature and photo
      - Trip completion
    - Verify profit calculation correct

**Expected Result**: All data saved offline, queued for sync, auto-synced when connection restored, no data loss, operator sees complete trip data.

---

## Scenario 3: Duplicate Prevention Test

**Role**: Driver  
**Duration**: ~15 minutes  
**Prerequisites**: Assigned trip

### Steps:

1. **Enable Airplane Mode**
   - Ensure device offline

2. **Start Trip First Time**
   - Login as driver
   - Open assigned trip
   - Tap "Start Trip"
   - Enter odometer reading
   - Verify trip started
   - Verify queued for sync

3. **Attempt Start Trip Again**
   - Tap "Start Trip" button again (if still visible)
   - Verify error: "Trip already started"
   - OR button disabled/hidden

4. **Add Fuel Record**
   - Add fuel: 45L, KES 6,750
   - Save record
   - Verify saved offline

5. **Attempt Duplicate Fuel**
   - Add fuel: 45L, KES 6,750 (exact same)
   - Tap Save
   - Verify error: "Duplicate fuel record detected"
   - Verify not added to queue

6. **Add Slightly Different Fuel**
   - Add fuel: 45L, KES 6,751 (different price)
   - Tap Save
   - Verify saved successfully (not exact duplicate)

7. **Complete Delivery**
   - Enter POD details
   - Capture signature
   - Save POD
   - Verify saved offline

8. **Attempt Duplicate POD**
   - Try to create another POD
   - Verify error or button disabled
   - Verify duplicate not queued

9. **Complete Trip**
   - Complete trip with ending odometer
   - Verify completed

10. **Attempt Duplicate Completion**
    - Try to complete trip again
    - Verify error or button disabled

11. **Enable Online & Sync**
    - Disable airplane mode
    - Wait for sync
    - Verify no duplicate records on server

**Expected Result**: Duplicate operations prevented at UI level and queue level, SHA256 fingerprinting detects exact duplicates, only unique operations synced.

---

## Scenario 4: Conflict Resolution Test

**Role**: Operator & Driver  
**Duration**: ~20 minutes  
**Prerequisites**: Two devices or ability to switch accounts

### Steps:

1. **Setup Conflict: Trip Update**
   - Device 1 (Operator): Login
   - Device 2 (Driver): Login, enable airplane mode
   - Operator: Update trip destination from "Nairobi" to "Mombasa"
   - Driver (offline): Add fuel record to trip
   - Driver: Disable airplane mode

2. **Observe Conflict Resolution**
   - Driver device auto-syncs
   - Server-wins strategy for trip = Driver sees updated destination
   - Local-wins strategy for fuel = Fuel record preserved
   - Verify both changes applied correctly

3. **Setup Conflict: Location Updates**
   - Driver: Enable airplane mode
   - Driver: Record several location updates offline
   - Operator: View trip on map (old locations)
   - Driver: Disable airplane mode

4. **Verify Location Sync**
   - Driver's locations sync automatically
   - Operator refreshes map
   - Verify current location updated
   - Local-wins ensures driver's GPS is authoritative

5. **Manual Conflict: Payroll**
   - Operator: Edit completed trip payroll amount
   - Driver: Enable airplane mode
   - Driver: Dispute trip income amount (hypothetical feature)
   - Driver: Disable airplane mode
   - Sync occurs
   - Verify conflict flagged for manual review
   - Operator sees conflict notification
   - Operator resolves conflict manually

**Expected Result**: Conflicts detected, resolution strategies applied correctly, no data loss, manual conflicts flagged for review.

---

## Scenario 5: Failed Upload Recovery

**Role**: Driver  
**Duration**: ~15 minutes  
**Prerequisites**: Ability to simulate network failure

### Steps:

1. **Start Trip Normally**
   - Login as driver
   - Start trip online
   - Verify trip started successfully

2. **Simulate Upload Failure**
   - Add fuel record
   - As it's saving, quickly enable airplane mode (interrupt)
   - OR use network throttling tool to simulate failure

3. **Verify Retry Logic**
   - Check sync queue
   - Verify item status = "Failed"
   - Verify error message shown
   - Wait 30 seconds (retry delay)
   - Enable network again

4. **Watch Auto-Retry**
   - Verify sync attempts item again
   - Verify success on retry
   - Verify item status = "Synced"

5. **Exhaust Retry Attempts**
   - Add another fuel record
   - Simulate 3 consecutive failures:
     - Save fuel
     - Interrupt sync (enable airplane mode)
     - Wait for retry #1 to fail
     - Interrupt retry #2
     - Interrupt retry #3
   - Verify item status = "Failed" permanently
   - Verify "Max retry attempts reached" message

6. **Manual Retry**
   - Navigate to Sync Queue
   - Tap failed item
   - Tap "Retry"
   - Enable network
   - Verify item syncs successfully

**Expected Result**: Failed uploads automatically retry with exponential backoff, max attempts respected, manual retry available, no data loss.

---

## Scenario 6: Analytics Accuracy Test

**Role**: Operator  
**Duration**: ~20 minutes  
**Prerequisites**: Multiple completed trips with known values

### Steps:

1. **Setup Test Data**
   - Create/ensure 3 completed trips:
     - Trip A: Income KES 15,000, Expenses KES 7,000, Profit KES 8,000
     - Trip B: Income KES 20,000, Expenses KES 12,000, Profit KES 8,000
     - Trip C: Income KES 10,000, Expenses KES 6,000, Profit KES 4,000
   - All from this week

2. **Verify Trip Counts**
   - Login as operator
   - Open analytics dashboard
   - Filter: "This Week"
   - Verify "Completed Trips" = 3

3. **Verify Financial Totals**
   - Check "Weekly Income" = KES 45,000
   - Check "Weekly Expenses" = KES 25,000
   - Check "Weekly Net Profit" = KES 20,000
   - Verify profit margin = 44.4% (20k/45k)

4. **Verify Expense Breakdown**
   - Check fuel expenses total correctly
   - Check toll expenses total correctly
   - Check parking expenses total correctly
   - Verify percentages add to 100%

5. **Test Date Filters**
   - Filter: "Today" - verify only today's trips
   - Filter: "This Month" - verify all trips this month
   - Filter: Custom range - select last 7 days
   - Verify counts and totals update correctly

6. **Test Entity Filters**
   - Filter by specific truck
   - Verify only that truck's trips shown
   - Verify totals recalculated for filtered data
   - Clear filter, filter by driver
   - Verify only that driver's trips shown

7. **Verify Performance Metrics**
   - Check on-time delivery rate
   - Manually calculate: (on-time trips / total trips) * 100
   - Verify matches dashboard
   - Check fuel variance
   - Verify trips with significant variance flagged

8. **Generate Report and Verify**
   - Navigate to Reports
   - Generate "Income & Profit Report"
   - Same date range as dashboard
   - Verify report totals match dashboard exactly

**Expected Result**: All dashboard metrics accurate, calculations correct, filters work properly, data consistency between dashboard and reports.

---

## Scenario 7: Payroll Integration Test

**Role**: Operator & Driver  
**Duration**: ~25 minutes  
**Prerequisites**: Driver with completed trips, cash advance

### Steps:

1. **Setup Test Scenario**
   - Ensure driver has:
     - 2 completed trips this period
     - 1 cash advance of KES 5,000
     - Known income from trips

2. **Create Payroll Period**
   - Login as operator
   - Navigate to Payroll
   - Create new payroll period
   - Select date range covering trips
   - Include driver in payroll

3. **Verify Trip Inclusion**
   - View driver's payroll details
   - Verify both trips listed
   - Verify trip income amounts correct
   - Verify commission calculated (if applicable)

4. **Verify Cash Advance Deduction**
   - Check deductions section
   - Verify cash advance listed: KES 5,000
   - Verify other deductions (if any)

5. **Verify Pay Calculation**
   - Gross pay = Trip income + bonuses
   - Deductions = Cash advance + other
   - Net pay = Gross - Deductions
   - Manually calculate and verify matches

6. **Generate Payroll Report**
   - Export payroll report (CSV)
   - Verify driver's row in export
   - Verify all amounts match

7. **Driver View Payroll**
   - Login as driver
   - Verify payroll notification received
   - Navigate to Payroll section
   - View payroll details
   - Verify can see:
     - Gross pay
     - Deductions breakdown
     - Net pay
     - Trip list included
     - Cash advance deduction

8. **Verify Cash Advance Balance**
   - Navigate to Cash Advances
   - Verify balance reduced by payroll deduction
   - Verify repayment recorded
   - Verify remaining balance correct

9. **Mark Payroll as Paid**
   - Login as operator
   - Mark payroll period as paid
   - Verify driver receives payment notification
   - Verify payroll period locked (can't edit)

**Expected Result**: Payroll correctly aggregates trips, calculates commission, deducts cash advances, computes net pay, accessible to both operator and driver, cash advance balance updates.

---

## Scenario 8: Multi-Role Permission Test

**Role**: All Roles  
**Duration**: ~20 minutes  
**Prerequisites**: Test accounts for all 3 roles

### Steps:

1. **Operator Permissions**
   - Login as operator
   - Verify can access: ✓
     - Analytics Dashboard
     - All trips (any driver)
     - Schedule Import
     - Report Generation
     - User Management
     - Payroll Management
     - Cash Advance Management
     - Sync Queue (all users)

2. **Driver Permissions**
   - Login as driver
   - Verify can access: ✓
     - Own assigned trips only
     - Trip start/stop
     - Fuel recording
     - Expense recording
     - Proof of delivery
     - Own payroll view
     - Own cash advances
     - Own sync queue
   - Verify CANNOT access: ✗
     - Analytics dashboard
     - Other drivers' trips
     - Report generation
     - User management
     - Payroll management (operator functions)

3. **Porter Permissions**
   - Login as porter
   - Verify can access: ✓
     - Trips where assigned as porter
     - View trip details
     - Expense recording (limited)
     - Proof of delivery (assist)
     - Own payroll view
     - Own sync queue
   - Verify CANNOT access: ✗
     - Trip start/stop
     - Fuel recording
     - Analytics dashboard
     - Report generation
     - Trips not assigned to them
     - User management

4. **Cross-Role Tests**
   - Driver attempts to access operator URL
   - Verify redirect or permission error
   - Porter attempts to start trip
   - Verify button hidden or error shown
   - Driver attempts to view another driver's trip
   - Verify 404 or permission error

5. **Navigation Menu Test**
   - Compare navigation menus across roles
   - Verify operator sees all menu items
   - Verify driver sees limited menu
   - Verify porter sees most limited menu

**Expected Result**: Each role has appropriate permissions, cannot access unauthorized features, navigation reflects role permissions, security enforced at API and UI level.

---

## Test Scenario Execution Log

| Scenario | Date | Tester | Result | Issues | Notes |
|----------|------|--------|--------|--------|-------|
| 1. Complete Trip (Online) | | | | | |
| 2. Complete Trip (Offline) | | | | | |
| 3. Duplicate Prevention | | | | | |
| 4. Conflict Resolution | | | | | |
| 5. Failed Upload Recovery | | | | | |
| 6. Analytics Accuracy | | | | | |
| 7. Payroll Integration | | | | | |
| 8. Multi-Role Permissions | | | | | |

---

**Notes**:
- Each scenario should be executed on both Android and iOS
- Document any deviations from expected results
- Take screenshots of any issues
- Retest failed scenarios after bug fixes
- Time actual execution vs estimated duration
