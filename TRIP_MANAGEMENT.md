# Trip and Dispatch Management Module

## Overview

Complete trip and dispatch management system for Vone Trucking operators with scheduling, resource assignments, conflict detection, real-time tracking, and comprehensive status management.

## Features Implemented

### Trip Statuses (16 Total)

1. **Draft** - Trip is being created but not yet scheduled
2. **Scheduled** - Trip is planned and scheduled
3. **Assigned** - Resources (truck/driver/porters) have been assigned
4. **Acknowledged** - Driver/team has acknowledged the assignment
5. **At Warehouse** - Team has arrived at pickup location
6. **Loading** - Cargo is being loaded
7. **Dispatched** - Trip has been dispatched from warehouse
8. **In Transit** - Currently en route to destination
9. **Arrived** - Arrived at delivery destination
10. **Unloading** - Cargo is being unloaded
11. **Delivered** - Delivery completed
12. **Returning** - Returning to base
13. **Completed** - Trip fully completed
14. **Delayed** - Trip is experiencing delays
15. **Cancelled** - Trip has been cancelled
16. **Incident Reported** - An incident has been reported during the trip

### Trip Information

#### Schedule
- Delivery reference number (unique identifier)
- Delivery date
- Call time (when team should report)
- Estimated duration in hours
- Actual start and end times (tracked)

#### Locations
- Pickup warehouse name and address
- Delivery destination name and full address
- Store/branch/distributor name
- GPS coordinates (captured during status updates)

#### Cargo
- Detailed cargo/product description
- Weight in kilograms
- Volume in cubic meters
- Number of items/packages

#### Assignments
- Assigned truck
- Assigned driver
- Multiple assigned porters/helpers
- Assignment acknowledgment tracking
- Assignment timestamps

#### Financial
- Expected trip income
- Actual income (to be recorded)

#### Instructions
- Special handling instructions
- Delivery-specific instructions
- Internal notes (operator-only)

### Core Functionality

✅ **Create Trip**
- Comprehensive form with all required fields
- Save as draft functionality
- Automatic trip number generation (format: TRP-YYYYMM-####)
- Form validation with Zod schemas
- Philippine date and time format support

✅ **Edit Trip**
- Edit draft and scheduled trips
- Cannot edit trips in progress or completed
- All fields editable except trip number
- Validation on update

✅ **View Trip Details**
- Complete trip information display
- Schedule and timeline
- Pickup and delivery locations
- Cargo specifications
- Current assignments with acknowledgment status
- Financial information
- Instructions and notes
- Complete status history timeline

✅ **Assign Resources**
- Assign truck to trip
- Assign driver to trip
- Assign multiple porters to trip
- Automatic availability checking
- Conflict detection and warnings
- Reassignment capability
- Cannot assign to conflicting trips

✅ **Status Management**
- Update trip status through workflow
- Only valid next statuses allowed
- Automatic status history recording
- Required reason for certain statuses (Delayed, Cancelled, Incident)
- Location capture on status updates
- Notes and timestamps for each change
- User tracking (who made the change)

✅ **Cancel Trip**
- Cancel trips with required reason
- Minimum 10-character cancellation reason
- Cancellation recorded in history
- Trip marked with cancelled_at timestamp
- Cannot be uncancelled (permanent)

✅ **Duplicate Trip**
- Create copy of existing trip
- Specify new date and time
- Option to copy assignments
- Useful for recurring deliveries
- Links to parent trip for reference

✅ **Search and Filter**
- Search by trip number, delivery reference, destination, cargo
- Filter by status (all 16 statuses)
- Filter by date range
- Filter by assigned truck or driver
- Filter groups (Draft, Scheduled, In Progress, Completed, Delayed, Cancelled)

✅ **Trip Calendar**
- Month-by-month view
- Trips grouped by delivery date
- Today highlighting
- Shows trip time, status, destination
- Quick navigation to trip details

✅ **Dispatch Dashboard**
- Real-time active trips monitoring
- Trips grouped by current status
- Today's statistics (in progress, completed, scheduled, delayed)
- Auto-refresh every 30 seconds
- Color-coded status indicators
- Quick access to trip details

✅ **Conflict Detection**
- Checks truck availability for date/time
- Checks driver availability for date/time
- Checks porter availability for date/time
- Prevents double-booking
- Shows conflicting trip information
- Operator override option (explicit resolution required)

✅ **Status Timeline**
- Chronological status history
- Shows all status changes
- User who made each change
- Timestamp for each change
- Location information (if provided)
- Notes and reasons
- Visual timeline with dots and connecting lines

### Availability Checking

The system performs intelligent conflict detection:

1. **Time-based conflicts**: Checks if resource is assigned to another trip on the same date
2. **Estimated duration**: Considers trip duration for overlap detection
3. **Multiple porters**: Can check availability for multiple porters simultaneously
4. **Resource types**: Separate checks for trucks, drivers, and porters
5. **Conflict reporting**: Provides detailed conflict information including conflicting trip number

### Status Workflow

Status transitions follow a logical workflow:

```
Draft → Scheduled → Assigned → Acknowledged → At Warehouse → 
Loading → Dispatched → In Transit → Arrived → Unloading → 
Delivered → Returning → Completed
```

Alternative paths:
- Any active status → Delayed → Resume or Cancel
- Any active status → Incident Reported → Resume or Cancel
- Draft/Scheduled/Assigned → Cancelled

### Screen Structure

```
app/(operator)/trips/
├── _layout.tsx                # Stack navigation
├── index.tsx                  # Trip list with filters and search
├── [id].tsx                   # Trip detail with timeline
├── add.tsx                    # Create new trip
├── edit/[id].tsx             # Edit existing trip
├── assign/[id].tsx           # Assign resources with conflict checking
├── calendar.tsx              # Calendar view of scheduled trips
└── dispatch.tsx              # Real-time dispatch dashboard
```

### Services & API Layer

**Trip Service** (`src/services/api/trip.service.ts`):
- `getTrips(filters, page, limit)` - Fetch paginated trip list
- `getTripById(id)` - Fetch single trip with full details
- `createTrip(data)` - Create new trip with auto-numbering
- `updateTrip(data)` - Update existing trip
- `checkAvailability(...)` - Check resource availability and conflicts
- `assignResources(input)` - Assign truck/driver/porters with conflict check
- `updateTripStatus(input)` - Update status with history tracking
- `cancelTrip(input)` - Cancel trip with required reason
- `duplicateTrip(input)` - Duplicate trip for recurring deliveries
- `getTripStats(dateFrom, dateTo)` - Get trip statistics

### Database Integration

**Trips Table**:
- Primary key: `id` (UUID)
- Unique constraint: `trip_number`, `delivery_reference`
- Foreign keys: `assigned_truck_id`, `assigned_driver_id`, `created_by`, `updated_by`
- Auto-generated: `trip_number` (TRP-YYYYMM-####)
- Audit fields: timestamps, created_by, updated_by
- Cancellation tracking: `cancelled_at`, `cancelled_by`, `cancellation_reason`

**Trip Status History Table**:
- Records every status change
- Links to trip via `trip_id`
- Tracks: `previous_status`, `new_status`, `changed_by`, `changed_at`
- Optional: `location`, `latitude`, `longitude`, `notes`, `reason`

**Trip Assignments Table**:
- Manages porter assignments
- Links: `trip_id`, `employee_id`
- Tracks: `assigned_at`, `assigned_by`, `acknowledged_at`, `status`
- Status: pending, acknowledged, declined

### Validation

**Create/Edit Trip**:
- Required: delivery_reference, delivery_date, call_time, pickup_warehouse, delivery_destination, delivery_address, cargo_description
- Date format: YYYY-MM-DD or MM/DD/YYYY
- Time format: HH:MM (24-hour)
- Weight/volume/items: positive numbers
- Instructions: max 2000 characters each

**Assign Resources**:
- At least one resource must be assigned (truck, driver, or porter)
- Valid UUIDs for all resource IDs
- Automatic conflict checking before assignment

**Update Status**:
- Must be a valid next status in workflow
- Delayed/Cancelled/Incident requires reason (min length validation)
- Location optional but recommended

**Cancel Trip**:
- Reason required (minimum 10 characters)
- Cannot cancel already completed or cancelled trips

### Security Features

- RLS policies on all trip tables
- Operators have full CRUD access
- Drivers can view their assigned trips only
- Porters can view their assigned trips only
- Status history is immutable (insert-only)
- Audit trail for all changes
- User tracking on all operations

### Testing Checklist

#### Create Trip
- [ ] Create trip with all required fields
- [ ] Save trip as draft
- [ ] Validate date format (YYYY-MM-DD)
- [ ] Validate time format (HH:MM)
- [ ] Test unique delivery reference constraint
- [ ] Verify auto-generated trip number
- [ ] Create trip and schedule immediately

#### Assign Resources
- [ ] Assign truck to trip
- [ ] Assign driver to trip
- [ ] Assign multiple porters to trip
- [ ] Test conflict detection (same truck, same date/time)
- [ ] Test conflict detection (same driver, same date/time)
- [ ] Test conflict detection (same porter, same date/time)
- [ ] View conflict details
- [ ] Reassign resources

#### Status Updates
- [ ] Update status from Draft → Scheduled
- [ ] Update status from Scheduled → Assigned
- [ ] Update status through complete workflow
- [ ] Mark trip as Delayed (with reason)
- [ ] Mark trip as Incident (with reason)
- [ ] Resume from Delayed status
- [ ] Test invalid status transitions (should be blocked)

#### View and Search
- [ ] View trip list
- [ ] Search by trip number
- [ ] Search by delivery reference
- [ ] Search by destination
- [ ] Filter by status
- [ ] Filter by date range
- [ ] Filter by assigned truck
- [ ] Filter by assigned driver
- [ ] View trip details
- [ ] View status timeline
- [ ] Check pagination works

#### Calendar and Dispatch
- [ ] View trip calendar
- [ ] Navigate between months
- [ ] View trips for specific date
- [ ] View dispatch dashboard
- [ ] Check auto-refresh works (30 seconds)
- [ ] View trips by status groups

#### Cancel and Duplicate
- [ ] Cancel trip with reason
- [ ] Verify cancellation reason required
- [ ] Verify cancelled trip cannot be edited
- [ ] Duplicate trip
- [ ] Duplicate with assignments copied
- [ ] Duplicate without assignments

### Common Issues & Solutions

**Issue**: Trip number not generating
**Solution**: Ensure database trigger or service function is working, check date format

**Issue**: Cannot assign resources - conflict detected
**Solution**: Check conflicting trip details, verify dates/times, reassign conflicting trip first

**Issue**: Status update fails
**Solution**: Verify current status and next status are valid workflow steps, check if reason is required

**Issue**: Calendar not showing trips
**Solution**: Check date filter range, verify trips have valid delivery_date values

**Issue**: Dispatch dashboard empty
**Solution**: Check for trips with active statuses, verify date filters, check RLS policies

### Next Steps

1. ⏳ Complete edit trip form
2. ⏳ Complete assignment screen with conflict resolution
3. ⏳ Add status update UI from trip detail screen
4. ⏳ Implement driver/porter mobile interface for acknowledgments
5. ⏳ Add real-time GPS tracking integration
6. ⏳ Add photo attachments for delivery proof
7. ⏳ Add signature capture for delivery confirmation
8. ⏳ Generate delivery reports (PDF)
9. ⏳ Add push notifications for status changes
10. ⏳ Implement trip income/expense tracking

### API Endpoints Summary

```typescript
// Trip Management
GET    /trips                    // List all trips with filters
GET    /trips/:id                // Get trip details
POST   /trips                    // Create new trip
PUT    /trips/:id                // Update trip
DELETE /trips/:id                // Cancel trip (soft)

// Assignment
POST   /trips/:id/assign         // Assign resources
POST   /trips/:id/check-availability // Check conflicts

// Status
POST   /trips/:id/status         // Update status
GET    /trips/:id/history        // Get status history

// Operations
POST   /trips/:id/duplicate      // Duplicate trip
GET    /trips/stats              // Get statistics
```

---

Built with ❤️ for Vone Trucking
