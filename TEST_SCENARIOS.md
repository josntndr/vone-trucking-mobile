# Test Scenarios for Truck and Employee Management

## Prerequisites

1. **Supabase Setup**
   - Run migrations: `supabase/migrations/*.sql`
   - Verify tables exist: `trucks`, `employee_profiles`, `gps_devices`
   - Check RLS policies are enabled
   - Create test operator account: `operator@vonetrucking.com`

2. **Environment Configuration**
   - Update `.env` with Supabase credentials
   - `EXPO_PUBLIC_SUPABASE_URL=your_project_url`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`

3. **Run the App**
   ```bash
   cd vone-trucking-mobile
   npm install
   npx expo start
   ```

## Test Scenario 1: Operator Login & Dashboard

### Steps:
1. Open the app
2. Navigate to Login screen
3. Enter credentials:
   - Email: `operator@vonetrucking.com`
   - Password: `Operator123!`
4. Tap "Sign In"

### Expected Results:
- ✅ Successful login
- ✅ Redirect to operator dashboard
- ✅ See dashboard stats (Total Trucks, Available, etc.)
- ✅ See bottom tab navigation (Dashboard, Trucks, Employees, Trips, Profile)
- ✅ Stats show 0 for all counts (if new database)

## Test Scenario 2: Add First Truck

### Steps:
1. From dashboard, tap "Add Truck" quick action OR
2. Navigate to "Trucks" tab → Tap FAB (+) button
3. Fill in the form:
   - Fleet Number: `TRK-001`
   - Plate Number: `ABC1234` (will auto-format to ABC-1234)
   - Make: `Isuzu`
   - Model: `ELF`
   - Year: `2023`
   - Type: `Closed Van`
   - Capacity: `5000`
   - Fuel Type: Select "Diesel"
   - Fuel Efficiency: `8.5`
   - Odometer: `25000`
4. Scroll to Registration & Insurance:
   - OR Number: `OR123456789`
   - OR Expiry: `12/31/2024`
   - Insurance Provider: `MAPFRE Insurance`
   - Policy Number: `POL-2024-001`
   - Insurance Expiry: `06/30/2025`
5. Status: Leave as "Available"
6. Tap "Create Truck"

### Expected Results:
- ✅ Form validation passes
- ✅ Success alert appears: "Truck created successfully"
- ✅ Navigate back to truck list
- ✅ New truck appears in the list
- ✅ Truck shows green "Available" status chip
- ✅ Dashboard stats update (Total Trucks: 1, Available: 1)

## Test Scenario 3: Add Second Truck with Expiring Insurance

### Steps:
1. Tap FAB (+) to add another truck
2. Fill required fields:
   - Fleet Number: `TRK-002`
   - Plate Number: `XYZ5678`
   - Make: `Mitsubishi`
   - Model: `Canter`
   - Year: `2022`
   - Capacity: `3000`
   - Fuel Type: `Diesel`
3. Insurance details:
   - Insurance Provider: `BPI MS Insurance`
   - Policy Number: `INS-2024-999`
   - Insurance Expiry: Enter a date 20 days from today (format: MM/DD/YYYY)
4. Tap "Create Truck"

### Expected Results:
- ✅ Truck created successfully
- ✅ Truck list now shows 2 trucks
- ✅ Dashboard Total Trucks: 2

## Test Scenario 4: View Truck Details with Expiry Warning

### Steps:
1. From truck list, tap on `TRK-002` (the one with expiring insurance)
2. View the truck details screen

### Expected Results:
- ✅ See truck specifications
- ✅ **WARNING BANNER** appears at top: "Insurance expiring soon" (yellow/orange)
- ✅ Insurance expiry date shown in warning color
- ✅ All other truck details displayed correctly
- ✅ "Edit" and "Archive" buttons visible

## Test Scenario 5: Edit Truck Details

### Steps:
1. From truck detail screen, tap "Edit" button
2. Update the following:
   - Current Odometer: `28500` (increased from original)
   - Fuel Efficiency: `9.2` (improved)
   - Notes: `Recently serviced, oil changed`
3. Tap "Save Changes"

### Expected Results:
- ✅ Success alert: "Truck updated successfully"
- ✅ Navigate back to detail screen
- ✅ Updated values reflected in details
- ✅ Odometer shows 28,500 km
- ✅ Fuel efficiency shows 9.2 km/L
- ✅ Notes section appears with text

## Test Scenario 6: Search and Filter Trucks

### Steps:
1. Navigate to Trucks tab
2. In search bar, type: `isuzu`
3. Observe results
4. Clear search
5. Tap "Available" status filter
6. Observe filtered results
7. Tap "All" to clear filter

### Expected Results:
- ✅ Search shows only Isuzu truck(s)
- ✅ Search is case-insensitive
- ✅ Status filter shows only available trucks
- ✅ Clearing filter shows all trucks again

## Test Scenario 7: Add First Employee (Driver)

### Steps:
1. Navigate to "Employees" tab
2. Tap FAB (+) button
3. Fill in the form:
   - Employee Number: `DRV-001`
   - First Name: `Juan`
   - Last Name: `Cruz`
   - Role: Select "Driver"
   - Email: `juan.cruz@vonetrucking.com`
   - Phone: `09171234567` (will auto-format to 0917 123 4567)
   - Address: `123 Bonifacio St, Manila`
   - Emergency Contact Name: `Maria Cruz`
   - Emergency Contact Phone: `09181234567`
   - Hire Date: `01/15/2024`
   - Employment Status: "Active"
4. Driver-specific fields:
   - License Number: `N0112345678` (will format to N01-12-345678)
   - License Type: Select "Professional"
   - License Expiry: `12/31/2025`
5. Compensation:
   - Base Salary: `18000`
   - Daily Rate: `800`
   - Trip Rate: `500`
6. Tap "Create Employee"

### Expected Results:
- ✅ Success alert with temporary password shown
- ✅ Employee created in database
- ✅ Auth account created in Supabase
- ✅ Navigate back to employee list
- ✅ New driver appears in list with car icon
- ✅ License number formatted correctly
- ✅ Phone number formatted correctly
- ✅ Dashboard stats update (Active Drivers: 1)

## Test Scenario 8: Add Employee (Porter)

### Steps:
1. Tap FAB (+) to add another employee
2. Fill required fields:
   - Employee Number: `POR-001`
   - First Name: `Pedro`
   - Last Name: `Santos`
   - Role: Select "Porter"
   - Email: `pedro.santos@vonetrucking.com`
   - Phone: `+639171111111`
   - Employment Status: "Active"
3. Compensation:
   - Daily Rate: `600`
   - Trip Rate: `300`
4. **Note**: No license fields required for porter
5. Tap "Create Employee"

### Expected Results:
- ✅ Employee created successfully
- ✅ No validation error for missing license
- ✅ Employee list shows 2 employees
- ✅ Porter has different role icon (cube)
- ✅ Dashboard shows Active Porters: 1

## Test Scenario 9: Search and Filter Employees

### Steps:
1. In employee list, search for: `cruz`
2. Observe results
3. Clear search
4. Tap "Drivers" role filter
5. Observe filtered results
6. Clear filter, tap "Active" status filter
7. Observe results

### Expected Results:
- ✅ Search finds Juan Cruz
- ✅ Driver filter shows only driver(s)
- ✅ Active filter shows only active employees
- ✅ Multiple filters can be combined

## Test Scenario 10: View Employee with License Warning

### Steps:
1. Edit driver's license expiry to 25 days from today
2. Go back to employee list
3. Observe warning indicator

### Expected Results:
- ✅ Warning badge (⚠️) appears next to license info
- ✅ Badge is yellow/orange color
- ✅ Clicking on employee shows full details
- ✅ License expiry date highlighted in warning color

## Test Scenario 11: Archive Truck

### Steps:
1. Navigate to Trucks tab
2. Select `TRK-002`
3. Tap "Archive" button
4. Confirm in dialog
5. Observe result

### Expected Results:
- ✅ Confirmation dialog appears
- ✅ After confirming, success message shown
- ✅ Navigate back to truck list
- ✅ Truck no longer in default list
- ✅ Tap "Inactive" filter to see archived truck
- ✅ Dashboard available trucks count decreases

## Test Scenario 12: Archive Employee

### Steps:
1. Navigate to Employees tab
2. Select a porter employee
3. View details, tap "Archive"
4. Confirm action

### Expected Results:
- ✅ Employee archived
- ✅ No longer in active list
- ✅ Appears in "Inactive" status filter
- ✅ Employment status changed to "Archived"
- ✅ Dashboard active porters count decreases

## Test Scenario 13: Dashboard Stats Accuracy

### Steps:
1. Navigate to Dashboard tab
2. Pull down to refresh
3. Observe all stat cards

### Expected Results:
- ✅ Total Trucks matches actual count
- ✅ Available Trucks count is correct
- ✅ On Trip count is 0 (no trips yet)
- ✅ Maintenance count is 0
- ✅ Total Employees count is correct
- ✅ Active Drivers count matches
- ✅ Active Porters count matches
- ✅ Quick actions work

## Test Scenario 14: Profile and Logout

### Steps:
1. Navigate to Profile tab
2. View profile information
3. Scroll down to logout button
4. Tap "Logout"
5. Confirm in dialog

### Expected Results:
- ✅ Profile shows operator email
- ✅ Role badge shows "Operator / Admin"
- ✅ Logout confirmation dialog appears
- ✅ After confirming, session ends
- ✅ Redirect to login screen
- ✅ Cannot navigate back to operator screens

## Test Scenario 15: Data Persistence

### Steps:
1. Close and reopen the app
2. Login again
3. Navigate to Trucks and Employees

### Expected Results:
- ✅ All previously created trucks still exist
- ✅ All previously created employees still exist
- ✅ Truck details unchanged
- ✅ Employee details unchanged
- ✅ Stats accurate on dashboard

## Error Handling Tests

### Test 16: Duplicate Truck Number
1. Try to create truck with existing fleet number
2. **Expected**: Error message "Truck number already exists"

### Test 17: Duplicate Plate Number
1. Try to create truck with existing plate
2. **Expected**: Error message "License plate already exists"

### Test 18: Invalid Plate Format
1. Enter plate as "12345" (no letters)
2. **Expected**: Validation error "Invalid plate number format"

### Test 19: Invalid Phone Number
1. Enter phone as "12345"
2. **Expected**: Validation error "Invalid Philippine phone number"

### Test 20: Driver Without License
1. Try to create driver without license number
2. **Expected**: Validation error "License number is required for drivers"

### Test 21: Duplicate Employee Number
1. Try to create employee with existing employee_id
2. **Expected**: Error message "Employee number already exists"

### Test 22: Duplicate Email
1. Try to create employee with existing email
2. **Expected**: Error message "Email already registered"

## Performance Tests

### Test 23: Pagination
1. If database has 20+ trucks, scroll to bottom of list
2. **Expected**: More trucks load automatically
3. Loading indicator appears briefly

### Test 24: Pull to Refresh
1. Pull down on any list screen
2. **Expected**: Refresh indicator appears, data reloads

### Test 25: Search Performance
1. Type quickly in search box
2. **Expected**: Debounced search, no lag

## Summary Checklist

- [ ] ✅ Login as operator successful
- [ ] ✅ Dashboard displays correct stats
- [ ] ✅ Add truck with all fields
- [ ] ✅ Add truck with expiring insurance
- [ ] ✅ View truck details with warnings
- [ ] ✅ Edit truck successfully
- [ ] ✅ Search trucks works
- [ ] ✅ Filter trucks by status
- [ ] ✅ Add driver with license
- [ ] ✅ Add porter without license requirement
- [ ] ✅ Search employees works
- [ ] ✅ Filter employees by role and status
- [ ] ✅ Archive truck (soft delete)
- [ ] ✅ Archive employee (soft delete)
- [ ] ✅ Logout and session cleared
- [ ] ✅ Data persists after app restart
- [ ] ✅ Validation errors display correctly
- [ ] ✅ Duplicate prevention works
- [ ] ✅ Philippine formats applied correctly
- [ ] ✅ Pagination works (if 20+ records)
- [ ] ✅ Pull to refresh works

## Reporting Issues

When reporting issues, include:
1. Test scenario number
2. Step where failure occurred
3. Expected vs actual result
4. Error messages (if any)
5. Screenshots
6. Console logs

---

## Next Testing Phase

After completing these scenarios, proceed to:
- Employee detail screen testing
- Employee add/edit form testing
- Document upload functionality
- Trip management module
- Real-time GPS tracking integration
