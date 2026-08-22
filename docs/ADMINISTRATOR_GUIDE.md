# Vone Trucking - Administrator Guide

## Overview

This guide is for operators and administrators who manage the Vone Trucking fleet management system. It covers system setup, trip management, employee oversight, reporting, and troubleshooting.

**Version**: 1.0  
**Last Updated**: August 22, 2024

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Trip Management](#trip-management)
4. [Employee Management](#employee-management)
5. [Fleet Management](#fleet-management)
6. [Financial Management](#financial-management)
7. [Reports & Analytics](#reports--analytics)
8. [Notifications](#notifications)
9. [Settings & Configuration](#settings--configuration)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Initial Setup

#### 1. Create Your Account
- Download Vone Trucking from Google Play or App Store
- Tap "Sign Up" or use invitation link from your organization
- Enter your details:
  - Full Name
  - Email Address
  - Phone Number
  - Password (min 8 characters, must include uppercase, lowercase, number)
- Verify your email address
- Your role will be set to "Operator" by system administrator

#### 2. First Login
- Open the app
- Enter your email and password
- Tap "Login"
- Grant necessary permissions when prompted:
  - **Notifications**: Receive alerts for trip updates
  - **Camera** (optional): Take photos for documentation
  - **Storage** (optional): Save reports

#### 3. Complete Your Profile
- Navigate to Settings > Profile
- Add profile photo (optional)
- Verify contact information
- Set notification preferences

### System Requirements

**Android**:
- Android 10 or higher
- 2 GB RAM minimum
- 100 MB free storage
- GPS/Location services
- Internet connection (WiFi or mobile data)

**iOS**:
- iOS 13 or higher
- iPhone 7 or newer
- 100 MB free storage
- Location services
- Internet connection

---

## Dashboard Overview

The Dashboard is your command center for monitoring fleet operations in real-time.

### Key Metrics

#### Trip Status
- **Active Trips**: Trips currently in progress
- **Scheduled Trips**: Upcoming trips assigned
- **Completed Trips**: Finished trips (today/week/month)
- **Delayed Trips**: Trips behind schedule

#### Fleet Status
- **Available Trucks**: Trucks ready for assignment
- **Trucks on Trips**: Currently deployed vehicles
- **Under Maintenance**: Trucks in service
- **Utilization %**: Percentage of fleet actively working

#### Financial Summary
- **Weekly Income**: Total trip income this week
- **Weekly Expenses**: Total costs this week
- **Weekly Net Profit**: Income minus expenses
- **Monthly figures**: Same metrics for the current month
- **Profit Margin**: Net profit as percentage of income

#### Performance Metrics
- **On-Time Delivery Rate**: Percentage of trips completed on time
- **Fuel Variance**: Difference between estimated and actual fuel costs
- **Top Destinations**: Most frequent delivery locations

#### Alerts
- Document expirations (licenses, insurance, permits)
- Maintenance due reminders
- GPS disconnection alerts
- Outstanding cash advances
- Fuel irregularities

### Dashboard Filters

**Date Filters**:
- Today: Shows today's data only
- This Week: Monday to Sunday current week
- This Month: First to last day of current month
- Custom: Select specific date range

**Entity Filters**:
- Filter by specific truck
- Filter by driver
- Filter by porter
- Filter by destination
- Combine multiple filters

**Refresh Data**:
- Pull down to refresh
- Data updates automatically every 30 seconds
- Manual refresh button in top right

---

## Trip Management

### Importing Schedules from Google Sheets

#### Setup Google Sheets Integration

1. **Prepare Your Google Sheet**:
   - Create a Google Sheet with the following columns:
     ```
     Date | Truck | Driver | Porter | Pickup | Dropoff | Cargo | Weight | Income
     ```
   - Example row:
     ```
     2024-08-25 | KBZ 123A | John Kamau | David Mwangi | Nairobi CBD | Mombasa Port | Electronics | 2500 | 15000
     ```

2. **Share Your Sheet**:
   - Click "Share" in Google Sheets
   - Set to "Anyone with the link can view"
   - Copy the sheet URL

3. **Import Schedule**:
   - Open Vone Trucking app
   - Navigate to "Schedule Import"
   - Tap "Connect Google Account" (first time only)
   - Grant Google Sheets access
   - Paste your sheet URL
   - Tap "Import Schedule"
   - Review trips to be imported
   - Tap "Confirm Import"

4. **Automatic Assignments**:
   - Drivers and porters automatically notified
   - Trips appear in their assignment lists
   - Status set to "Scheduled"

#### Import Tips
- Ensure driver and porter names exactly match their profile names
- Truck registration must match exactly
- Use YYYY-MM-DD format for dates
- Income should be in base currency (KES)
- Weight in kilograms

### Manual Trip Creation

If you need to create a trip without Google Sheets:

1. Navigate to "Trips" > "Create New Trip"
2. Fill in trip details:
   - **Scheduled Date & Time**
   - **Truck**: Select from available trucks
   - **Driver**: Select from active drivers
   - **Porter**: Optional, select if needed
   - **Pickup Location**: Address or GPS coordinates
   - **Dropoff Location**: Delivery destination
   - **Cargo Description**: What's being transported
   - **Weight**: In kilograms
   - **Trip Income**: Expected payment amount
3. Add optional details:
   - Customer name and contact
   - Special instructions
   - Estimated fuel cost
   - Delivery deadline
4. Tap "Create Trip"
5. Driver receives notification immediately

### Monitoring Active Trips

#### View Trip Details
- Tap on any trip from the dashboard or trip list
- See comprehensive trip information:
  - Current status
  - Driver location (live map)
  - Route taken (if started)
  - Time elapsed
  - Distance traveled
  - Fuel recorded
  - Expenses recorded
  - ETA to destination

#### Real-Time Tracking
- View driver's current location on map
- See route history
- Monitor progress toward destination
- Check last location update timestamp
- GPS signal strength indicator

#### Communication
- Call driver directly from trip screen
- Call porter (if assigned)
- Send in-app message (if implemented)
- View driver's notes

### Trip Status Management

#### Trip Lifecycle
1. **Scheduled**: Assigned but not started
2. **In Progress**: Driver has started trip
3. **Completed**: Trip finished with POD
4. **Cancelled**: Trip cancelled before completion
5. **Delayed**: Trip behind schedule

#### Updating Trips
- **Edit Scheduled Trip**:
  - Change driver, porter, or truck
  - Modify pickup/dropoff locations
  - Update income amount
  - Add special instructions
- **Cancel Trip**:
  - Provide cancellation reason
  - Notify assigned driver/porter
  - Trip marked as cancelled
- **Reassign Trip**:
  - Assign to different driver
  - Change truck assignment
  - Update porter

### Handling Trip Issues

#### GPS Disconnection
- Alert appears on dashboard
- View last known location
- Call driver to verify status
- Manual location update if needed

#### Delayed Trips
- System automatically flags delays
- Review reason for delay
- Communicate with customer
- Adjust future schedules

#### Failed Deliveries
- Driver can mark delivery as failed
- Review failure reason
- Reschedule delivery
- Update customer

---

## Employee Management

### Managing Drivers

#### View Driver Performance
- Navigate to "Employees" > "Drivers"
- See list of all drivers
- View individual driver dashboard:
  - Total trips completed
  - On-time delivery rate
  - Average trip duration
  - Total income generated
  - Current status (available/on trip/off duty)

#### Driver Details
- Personal information
- License number and expiry
- Phone number
- Emergency contact
- Active/inactive status
- Document uploads (license, ID)

#### Add New Driver
1. Navigate to "Employees" > "Add Driver"
2. Enter driver details:
   - Full name
   - Email address
   - Phone number
   - License number
   - License expiry date
3. Upload documents:
   - Driver's license photo
   - ID card photo
4. Set initial password
5. Tap "Create Driver Account"
6. Driver receives email with login credentials

#### Deactivate Driver
- Select driver from list
- Tap "Deactivate"
- Provide reason
- Driver can no longer log in
- Historical data preserved

### Managing Porters/Helpers

#### Porter Overview
- Navigate to "Employees" > "Porters"
- View all helpers
- See trip counts and hours worked
- Check availability status

#### Add New Porter
1. Navigate to "Employees" > "Add Porter"
2. Enter porter details:
   - Full name
   - Email address (optional)
   - Phone number
   - ID number
3. Set initial password
4. Tap "Create Porter Account"

### Document Management

#### Track Expiring Documents
- Dashboard shows expiring documents alert
- Navigate to "Documents" or tap alert
- See list of expiring documents:
  - Driver licenses
  - Vehicle insurance
  - Permits and certifications
- Filter by document type
- Set reminder dates
- Export expiry report

#### Upload Documents
- Navigate to employee or truck profile
- Tap "Documents"
- Tap "Add Document"
- Select document type
- Take photo or select from gallery
- Enter expiry date
- Save document

---

## Fleet Management

### Truck Management

#### View Fleet
- Navigate to "Fleet" > "Trucks"
- See all trucks with status indicators:
  - Green: Available
  - Blue: On Trip
  - Orange: Maintenance
  - Red: Out of Service

#### Add New Truck
1. Navigate to "Fleet" > "Add Truck"
2. Enter truck details:
   - Registration number
   - Make and model
   - Year
   - Capacity (kg)
   - Current odometer reading
3. Upload documents:
   - Registration certificate
   - Insurance certificate
   - Inspection certificate
4. Tap "Add Truck"

#### Truck Maintenance

**Schedule Maintenance**:
- Select truck
- Tap "Schedule Maintenance"
- Enter maintenance type
- Select service date
- Add notes
- Truck status changes to "Maintenance"

**Record Maintenance**:
- After service, tap "Record Maintenance"
- Enter details:
  - Service type
  - Service date
  - Odometer reading
  - Cost
  - Next service due (km or date)
- Upload receipts
- Tap "Complete"

**Maintenance Alerts**:
- System alerts when maintenance due based on:
  - Kilometers traveled
  - Time since last service
  - Scheduled service date

#### Truck Utilization
- View utilization report for each truck
- See days active vs. idle
- Analyze profitability per truck
- Identify underutilized vehicles
- Plan fleet optimization

---

## Financial Management

### Trip Profitability

#### Understanding Profit Calculation
```
Net Trip Profit = Trip Income - Total Expenses

Where Total Expenses include:
- Fuel costs
- Toll fees
- Parking fees
- Maintenance during trip
- Other trip-related expenses
```

#### View Trip Profit
- Navigate to completed trip
- Scroll to "Financial Summary" section
- See breakdown:
  - Trip Income: KES X,XXX
  - Fuel: KES X,XXX
  - Tolls: KES XXX
  - Parking: KES XXX
  - Other: KES XXX
  - **Net Profit: KES X,XXX**
  - Profit Margin: XX%

#### Low Profit Analysis
- Dashboard highlights low-profit trips
- Review expense breakdown
- Identify cost-saving opportunities
- Adjust pricing for future trips

### Payroll Management

#### Generate Payroll

1. Navigate to "Payroll" > "Create Payroll Period"
2. Select date range (e.g., Aug 1-15, 2024)
3. Select employees to include (or select all)
4. Tap "Generate Payroll"
5. System calculates for each employee:
   - **Gross Pay**: Based on trips completed
   - **Deductions**:
     - Cash advances
     - NHIF (if configured)
     - NSSF (if configured)
     - Other deductions
   - **Net Pay**: Gross - Deductions

#### Review Payroll
- View individual employee payroll details
- See trip list included
- Verify deductions
- Check net pay calculations
- Export payroll report (CSV/PDF)

#### Process Payroll
1. Review and approve payroll
2. Tap "Mark as Paid"
3. Enter payment reference
4. Employees receive notification
5. Payroll period locked (no edits)

#### Payroll Settings
- Configure pay rates:
  - Per-trip payment
  - Per-kilometer rate
  - Commission percentage
- Set deduction rules:
  - NHIF rates
  - NSSF contributions
  - Tax rates (if applicable)
- Define payroll periods (weekly, bi-weekly, monthly)

### Cash Advance Management

#### Issue Cash Advance

1. Navigate to "Cash Advances" > "Issue Advance"
2. Select employee
3. Enter advance details:
   - Amount: KES X,XXX
   - Reason: (e.g., Emergency, Fuel advance)
   - Repayment terms: (1 installment, 2 installments, etc.)
   - Issue date
4. Tap "Issue Advance"
5. Employee receives notification

#### Track Cash Advances
- View all active cash advances
- See repayment status:
  - Amount issued
  - Amount repaid
  - Remaining balance
- Filter by employee
- Filter by status (pending, partial, paid)

#### Automatic Deduction
- Cash advances automatically deducted from payroll
- Deduction amount based on repayment terms
- Balance updates after each payroll
- Employee can view their cash advance status

#### Outstanding Advances
- Dashboard alerts for outstanding advances
- Generate cash advance statement
- Contact employees with overdue payments

---

## Reports & Analytics

### Available Reports

#### 1. Trip Report
**Shows**: All trips with profit calculations  
**Filters**: Date range, truck, driver, destination  
**Exports**: CSV, PDF

**Includes**:
- Trip details (pickup, dropoff, dates)
- Income and all expenses
- Net profit per trip
- Totals and averages

#### 2. Delivery Report
**Shows**: Proof of delivery details  
**Filters**: Date range, driver, status  
**Exports**: CSV, PDF (with photos)

**Includes**:
- Customer information
- Delivery timestamps
- Signatures
- Delivery photos
- Notes

#### 3. Fuel Report
**Shows**: All fuel records with validation  
**Filters**: Date range, truck, driver  
**Exports**: CSV, PDF

**Includes**:
- Fuel station and location
- Litres and cost
- Price per litre
- Fuel efficiency
- Variance from estimate

#### 4. Truck Expense Report
**Shows**: Expenses grouped by truck  
**Filters**: Date range, truck, expense type  
**Exports**: CSV, PDF

**Includes**:
- Fuel costs
- Toll fees
- Parking fees
- Maintenance costs
- Totals per truck

#### 5. Payroll Report
**Shows**: Employee payroll for period  
**Filters**: Payroll period, employee  
**Exports**: CSV, PDF

**Includes**:
- Gross pay
- Deductions breakdown
- Net pay
- Trips completed
- Hours/days worked

#### 6. Cash Advance Statement
**Shows**: All cash advances and repayments  
**Filters**: Date range, employee, status  
**Exports**: CSV, PDF

**Includes**:
- Issue date and amount
- Repayment schedule
- Amount repaid
- Remaining balance

#### 7. Employee Trip Report
**Shows**: Trips grouped by employee  
**Filters**: Date range, employee  
**Exports**: CSV, PDF

**Includes**:
- Trip count per employee
- Total income generated
- Performance metrics

#### 8. Income & Profit Report
**Shows**: Financial summary  
**Filters**: Date range  
**Exports**: CSV, PDF

**Includes**:
- Total income
- Total expenses (by category)
- Net profit
- Profit margins
- Expense breakdown percentages

### Generating Reports

1. Navigate to "Reports"
2. Select report type
3. Set filters:
   - Date range
   - Specific trucks/drivers (optional)
   - Other criteria
4. Tap "Generate Report"
5. Review report on screen
6. Export options:
   - **CSV**: Opens in spreadsheet app
   - **PDF**: Opens in PDF viewer
   - **Share**: Send via email, WhatsApp, etc.

### Analytics Dashboard

#### Financial Analytics
- Revenue trends (daily, weekly, monthly)
- Expense trends
- Profit margins over time
- Cost per kilometer
- Revenue per truck

#### Operational Analytics
- Fleet utilization rates
- Average trip duration
- On-time delivery trends
- Fuel efficiency trends
- Most profitable routes

#### Employee Analytics
- Driver performance rankings
- Trips per driver
- Revenue per driver
- On-time delivery by driver

---

## Notifications

### Notification Types

You'll receive notifications for:

1. **Trip Assignment**: New trip created/imported
2. **Trip Started**: Driver starts trip
3. **Trip Completed**: Driver completes delivery
4. **GPS Disconnection**: Driver's GPS goes offline
5. **Delay Alert**: Trip behind schedule
6. **Fuel Irregularity**: Fuel cost significantly different from estimate
7. **Document Expiring**: License, insurance, permit expiring soon
8. **Maintenance Due**: Vehicle service due
9. **Payroll Generated**: Payroll ready for review
10. **Cash Advance Request**: Employee requests advance (if enabled)

### Managing Notifications

#### Notification Settings
- Navigate to Settings > Notifications
- Enable/disable by type
- Set quiet hours (e.g., 10 PM - 6 AM)
- Choose notification sound
- Enable/disable vibration

#### Viewing Notifications
- Tap bell icon in top right
- See all recent notifications
- Unread notifications highlighted
- Tap notification to view details
- Mark as read or dismiss

#### Notification Actions
- Most notifications have quick actions
- Example: "Trip Started" → View Trip
- Example: "Document Expiring" → View Document
- Tap action to navigate directly

---

## Settings & Configuration

### General Settings

- **Company Information**: Name, address, contact
- **Currency**: Set default currency (KES, USD, etc.)
- **Date Format**: DD/MM/YYYY or MM/DD/YYYY
- **Distance Unit**: Kilometers or Miles
- **Language**: English (more languages coming)

### Sync Settings

- **Auto-Sync Interval**: 5, 10, 15, 30 minutes
- **WiFi Only**: Sync only on WiFi (saves data)
- **Sync on Foreground**: Sync when app opens
- **Sync on Network Change**: Sync when connection restored

### Notification Settings

- Enable/disable notifications
- Set quiet hours
- Configure notification types
- Sound and vibration preferences

### Security Settings

- **Change Password**: Update your password
- **Two-Factor Authentication**: Add extra security (if available)
- **Session Timeout**: Auto-logout after inactivity
- **Biometric Login**: Use fingerprint/Face ID (if available)

### Backup & Data

- **Export All Data**: Download all your data
- **Data Retention**: How long to keep data
- **Clear Cache**: Free up storage space

---

## Troubleshooting

### Common Issues

#### Cannot Import from Google Sheets

**Problem**: Import fails or shows error

**Solutions**:
1. Verify Google Sheet is shared ("Anyone with link can view")
2. Check URL is correct (no extra spaces)
3. Ensure column headers match expected format
4. Verify driver/truck names match exactly
5. Check dates are in YYYY-MM-DD format
6. Try re-connecting Google account:
   - Settings > Integrations > Disconnect Google
   - Reconnect and try again

#### Driver Location Not Updating

**Problem**: Map shows old location or "Location unavailable"

**Solutions**:
1. Verify driver has active trip
2. Check driver's device has GPS enabled
3. Ensure driver granted location permissions
4. Check driver's internet connection
5. Ask driver to:
   - Open app and check for updates
   - Restart app
   - Check location services in device settings

#### Reports Not Generating

**Problem**: Report generation fails or hangs

**Solutions**:
1. Check internet connection
2. Try smaller date range
3. Remove some filters
4. Restart app and try again
5. Clear app cache:
   - Settings > Storage > Clear Cache
6. If persists, contact support with:
   - Report type
   - Filters used
   - Screenshot of error

#### Sync Issues

**Problem**: Data not syncing, items stuck in sync queue

**Solutions**:
1. Check internet connection
2. Navigate to Settings > Sync
3. Tap "Sync Now" manually
4. View Sync Queue to see pending items
5. Check for failed items:
   - Tap failed item
   - Review error message
   - Retry if network issue
6. If persists, contact support

#### App Crashes or Freezes

**Problem**: App closes unexpectedly or becomes unresponsive

**Solutions**:
1. Force close and reopen app
2. Check for app updates in Play Store/App Store
3. Restart device
4. Clear app cache (Settings > Storage > Clear Cache)
5. If persists, uninstall and reinstall app
6. Ensure device meets minimum requirements
7. Contact support with device model and OS version

### Getting Help

#### In-App Help
- Navigate to Settings > Help & Support
- Browse FAQ
- Search help articles
- Contact support

#### Contact Support
- **Email**: support@vonetrucking.com
- **Phone**: +254 XXX XXX XXX
- **Hours**: Monday-Friday, 8 AM - 6 PM EAT

#### Support Information to Provide
- Your account email
- Description of issue
- Steps to reproduce
- Screenshots or videos
- Device model and OS version
- App version (Settings > About)

#### Emergency Support
For urgent issues affecting operations:
- Call support hotline directly
- Mark email as "URGENT"
- Provide trip ID or driver name if trip-related

---

## Best Practices

### Daily Operations

1. **Morning Routine**:
   - Review dashboard for overnight updates
   - Check scheduled trips for the day
   - Verify truck and driver availability
   - Address any alerts (documents, maintenance)

2. **During Operations**:
   - Monitor active trips periodically
   - Respond to notifications promptly
   - Address delays or issues immediately
   - Keep communication open with drivers

3. **End of Day**:
   - Review completed trips
   - Check all PODs submitted
   - Verify expenses recorded
   - Plan next day's schedule

### Weekly Tasks

- Generate weekly performance reports
- Review fuel costs and irregularities
- Check upcoming maintenance schedules
- Process payroll (if weekly cycle)
- Review cash advance repayments
- Check document expirations (next 30 days)

### Monthly Tasks

- Generate monthly financial reports
- Analyze profit margins and trends
- Review employee performance
- Plan maintenance schedules
- Update forecasts and budgets
- Archive completed trips

### Data Management

- Export important reports regularly
- Back up critical data
- Clean up old test data
- Archive completed payroll periods
- Review and update employee information
- Verify truck documentation current

---

## Appendix

### Keyboard Shortcuts (Web Version)

If using web version, these shortcuts are available:

- `Ctrl/Cmd + D`: Dashboard
- `Ctrl/Cmd + T`: Trips
- `Ctrl/Cmd + R`: Reports
- `Ctrl/Cmd + E`: Employees
- `Ctrl/Cmd + F`: Fleet
- `Ctrl/Cmd + ,`: Settings

### Data Export Formats

#### CSV
- Compatible with Excel, Google Sheets
- Easy to analyze and manipulate
- Best for data analysis

#### PDF
- Professional presentation
- Includes branding and formatting
- Best for sharing with clients or printing

### Support Resources

- **User Community**: community.vonetrucking.com
- **Video Tutorials**: youtube.com/vonetrucking
- **Knowledge Base**: support.vonetrucking.com
- **Feature Requests**: feedback.vonetrucking.com

---

**Document Version**: 1.0  
**Last Updated**: August 22, 2024  
**For App Version**: 1.0.0+

© 2024 Vone Trucking. All rights reserved.
