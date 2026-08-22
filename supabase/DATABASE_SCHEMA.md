# Vone Trucking Database Schema Documentation

## Overview

Comprehensive PostgreSQL database schema for Vone Trucking management system with secure Row-Level Security (RLS) policies.

## Core Tables

### Authentication & Users

#### `employee_profiles`
Extends `auth.users` with employee-specific data.

**Columns:**
- `id` (UUID, PK, FK → auth.users) - Links to Supabase auth
- `employee_id` (TEXT, UNIQUE) - Internal employee ID
- `first_name`, `last_name` (TEXT) - Employee name
- `phone`, `address` (TEXT) - Contact information  
- `role` (user_role ENUM) - operator | driver | porter
- `hire_date` (DATE) - Employment start date
- `is_active` (BOOLEAN) - Account status
- `profile_photo_url` (TEXT) - Photo URL
- `emergency_contact_name`, `emergency_contact_phone` (TEXT)
- Standard audit fields: `created_at`, `updated_at`, `created_by`, `updated_by`

**Security:**
- Operators: Full access
- Drivers/Porters: View own profile only
- No public access
- No deletion (use `is_active` flag)

### Fleet Management

#### `trucks`
Vehicle inventory and specifications.

**Key Features:**
- Soft delete support (`deleted_at`)
- Unique constraints on `truck_number`, `license_plate`, `vin`
- Validation: Year range check
- Tracks: maintenance schedule, capacity, fuel type

#### `gps_devices`
GPS tracker devices linked to trucks.

**Key Features:**
- One-to-one relationship with trucks (nullable)
- Tracks: battery level, last connection, IMEI
- Validation: Battery 0-100%

### Trip Management

#### `trips`
Core table for delivery trips.

**Key Columns:**
- `trip_number` (UNIQUE) - Business identifier
- `truck_id` (FK → trucks)
- `origin`, `destination` (TEXT) - Route
- `distance_km`, `cargo_weight_kg` (DECIMAL)
- `status` (trip_status ENUM) - draft | assigned | in_progress | completed | cancelled
- Planned vs actual times
- Customer information
- Soft delete support

**Security:**
- Operators: Full access
- Drivers/Porters: View assigned trips only
- Drivers can update status of assigned trips

#### `trip_assignments`
Links employees to trips with roles.

**Key Features:**
- Composite unique constraint: `(trip_id, employee_id, role)`
- Tracks assignment and removal timestamps
- Only driver and porter roles allowed
- Soft removal via `removed_at`

#### `trip_status_history`
Audit trail for trip status changes.

**Auto-logged via trigger**

#### `location_logs`
GPS tracking data for trips.

**Key Features:**
- High-volume table - indexed by trip and time
- Validates: latitude (-90 to 90), longitude (-180 to 180)
- Tracks: speed, heading, accuracy
- Drivers can insert for their trips

### Financial Management

#### `fuel_budgets`
Fuel budget per trip (one-to-one).

**Security:**
- Operators: Full access
- Drivers: View only for assigned trips

#### `fuel_transactions`
Fuel purchases during trips.

**Key Features:**
- Multiple transactions per trip
- Receipt URL storage
- Odometer tracking
- Soft delete support

**Security:**
- Drivers can create/update for their trips
- Operators have full access

#### `trip_income` **[SENSITIVE]**
Revenue from completed trips.

**Security:**
- **Operators ONLY**
- Drivers and porters CANNOT access

#### `trip_expenses`
Trip-related expenses (tolls, parking, etc).

**Key Features:**
- Type classification via `transaction_type` ENUM
- Receipt URL storage
- Drivers can log expenses for their trips

### Documents

#### `delivery_documents`
PODs, bills of lading, receipts, etc.

**Key Features:**
- Type classification via `document_type` ENUM
- File metadata: size, MIME type, name
- Uploaded via Supabase Storage
- Soft delete support

**Security:**
- Drivers can upload for their trips
- Operators have full access

### HR & Payroll

#### `attendance`
Daily employee attendance tracking.

**Key Features:**
- One record per employee per day
- Tracks: check-in/out times, hours worked
- Status: present | absent | late | on_leave
- Validation: 0-24 hours

**Security:**
- Operators: Full access
- Employees: View own attendance only

#### `payroll_periods` **[SENSITIVE]**
Pay period definitions.

**Security:**
- **Operators ONLY**

#### `payslips` **[HIGHLY SENSITIVE]**
Employee compensation details.

**Key Features:**
- One per employee per period
- Components: base, allowances, deductions, bonuses
- Payment tracking
- Unique constraint: `(payroll_period_id, employee_id)`

**Security:**
- **Operators: Full access**
- **Employees: View own payslips ONLY**
- **Most sensitive table in system**

#### `cash_advances` **[SENSITIVE]**
Employee cash advance requests.

**Workflow:**
1. Employee requests (status: pending)
2. Operator approves/rejects
3. If approved, marked as paid
4. Tracked until repaid

**Security:**
- Operators: Full access
- Employees: View own, create pending requests only

#### `cash_advance_repayments`
Tracks repayment of cash advances.

**Security:**
- Operators: Full access
- Employees: View repayments for own advances

### Maintenance & Incidents

#### `maintenance_records`
Vehicle maintenance history.

**Key Features:**
- Service tracking
- Cost recording
- Next service scheduling
- Vendor information
- Soft delete support

#### `incident_reports`
Accidents, breakdowns, incidents.

**Key Features:**
- Links to trips and trucks
- Severity classification
- Police/insurance tracking
- Photo storage (array of URLs)
- Status tracking and resolution

**Security:**
- Employees can create and update own reports (when open)
- Operators have full access

### System Tables

#### `notifications`
In-app notifications.

**Key Features:**
- Per-user delivery
- Read/unread tracking
- Priority levels
- Expiration support
- Action URLs
- JSONB data payload

#### `google_sheets_imports`
Import job tracking.

**Security:**
- Operators ONLY

#### `audit_logs`
Comprehensive change tracking.

**Key Features:**
- Auto-logged via triggers on sensitive tables
- Stores: old_data, new_data, changed_fields
- Tracks: user, IP, user agent
- **Read-only** - no manual modification allowed

**Audited Tables:**
- trips
- payslips
- cash_advances
- fuel_transactions
- trip_income

## Security Model

### Row-Level Security (RLS)

**All tables have RLS enabled.**

### Role Hierarchy

1. **Operator/Admin** - Full system access
2. **Driver** - Access to assigned trips, expenses, own payroll
3. **Porter** - Access to assigned trips (limited), own payroll

### Key Security Functions

```sql
get_user_role()              -- Returns current user's role
is_operator()                -- Check if user is operator
is_driver()                  -- Check if user is driver
is_porter()                  -- Check if user is porter
is_assigned_to_trip(UUID)    -- Check trip assignment
```

### Sensitive Data Protection

**Restricted to Operators ONLY:**
- trip_income (revenue data)
- payroll_periods
- All users' payslips (employees see own only)
- Cash advance approval
- Audit logs
- Google Sheets imports

### Storage Security

**Buckets:**
- `documents` - Delivery docs
- `receipts` - Expense receipts
- `photos` - Incident photos, profile pictures

**Policies:**
- Organized by user ID folders
- Operators can view all
- Users can view/upload own files only

## Data Integrity

### Constraints

- **Unique Constraints:** Prevent duplicates
- **Foreign Keys:** Maintain referential integrity
- **Check Constraints:** Validate data ranges
- **NOT NULL:** Enforce required fields

### Triggers

1. **`update_updated_at_column()`**
   - Auto-updates `updated_at` on row modification
   - Applied to all tables with `updated_at`

2. **`log_audit_changes()`**
   - Auto-logs INSERT/UPDATE/DELETE to `audit_logs`
   - Applied to sensitive tables

### Indexes

**Performance indexes on:**
- Foreign keys
- Frequently queried fields
- Status fields with WHERE clauses
- Composite indexes on common queries
- Time-series data (location_logs)

## Best Practices

### For Developers

1. **Never bypass RLS** - Always use authenticated context
2. **Test permissions** - Verify access for each role
3. **Use transactions** - For related changes
4. **Validate input** - Even with DB constraints
5. **Handle soft deletes** - Check `deleted_at` in queries

### For Operators

1. **Regular backups** - Daily recommended
2. **Monitor audit logs** - Review sensitive changes
3. **Disable inactive accounts** - Use `is_active` flag
4. **Review permissions** - Quarterly audit
5. **Strong passwords** - Enforce complexity

### For Queries

```sql
-- Good: Respects RLS
SELECT * FROM trips WHERE status = 'in_progress';

-- Bad: Attempts to bypass (will fail)
SELECT * FROM trips FOR SYSTEM_TIME ALL;

-- Good: Uses helper functions
SELECT * FROM trips WHERE is_assigned_to_trip(id);

-- Good: Checks soft delete
SELECT * FROM trucks WHERE deleted_at IS NULL;
```

## Migration Order

1. `20260822000001_initial_schema.sql` - Tables, triggers, indexes
2. `20260822000002_rls_policies.sql` - Security policies
3. `20260822000003_test_data.sql` - Test accounts (development only)

## Testing Checklist

- [ ] Operator can view all data
- [ ] Driver can view only assigned trips
- [ ] Driver cannot view trip_income
- [ ] Porter cannot update trip status
- [ ] Employees can view only own payslips
- [ ] Employees cannot approve own cash advances
- [ ] Audit logs are created automatically
- [ ] Soft deletes work correctly
- [ ] Storage policies enforce user folders
- [ ] Disabled accounts cannot sign in

## Performance Considerations

**High-Volume Tables:**
- `location_logs` - GPS data
- `audit_logs` - Change tracking

**Optimization:**
- Partition by date for large tables
- Archive old data periodically
- Monitor slow queries
- Consider materialized views for reporting

## Support & Maintenance

**Regular Tasks:**
- Vacuum/analyze monthly
- Index maintenance quarterly
- Audit log archival annually
- Performance review quarterly

---

**Schema Version:** 1.0.0  
**Last Updated:** August 22, 2026  
**Total Tables:** 23  
**Total Policies:** 70+
