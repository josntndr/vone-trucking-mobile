# Truck and Employee Management System

## Overview

Complete truck and employee management system for Vone Trucking operators/admins with Philippine format support, validation, and database integration.

## Features Implemented

### Truck Management

#### Truck Profiles
- Fleet/Unit number
- Plate number (Philippine format: ABC-1234)
- Truck type, make, model, year
- Capacity (kg)
- Fuel type (Diesel, Gasoline, Hybrid, Electric)
- Fuel efficiency (km/L)
- Current odometer reading
- VIN (Vehicle Identification Number)
- OR/CR details with expiry tracking
- Insurance details with expiry tracking
- GPS tracker identification
- Assigned driver
- Current status
- Purchase date
- Notes

#### Truck Statuses
- **Available**: Ready for assignment
- **Reserved**: Reserved for upcoming trip
- **Assigned**: Assigned to a driver
- **On Trip**: Currently on a delivery trip
- **Under Maintenance**: In maintenance, unavailable
- **Inactive**: Archived/decommissioned

#### Truck Features
✅ List all trucks with search and filters
✅ View detailed truck information
✅ Add new trucks with validation
✅ Edit existing truck details
✅ Archive trucks (soft delete)
✅ Status-based filtering
✅ Expiry warnings (OR/CR, Insurance)
✅ Philippine plate number formatting
✅ Odometer and fuel efficiency tracking
✅ Driver assignment display

### Employee Management

#### Employee Profiles
- Employee number/ID
- Full name (first and last)
- Role (Operator, Driver, Porter)
- Profile photo support
- Contact number (Philippine format)
- Address
- Emergency contact details
- Employment date
- Employment status
- Compensation configuration
- Trip history (upcoming)
- Attendance tracking (upcoming)
- Payslips access (upcoming)
- Cash advances (upcoming)
- Document uploads (upcoming)
- Performance notes (upcoming)
- Incident history (upcoming)

#### Driver-Specific Fields
- License number
- License type (Non-professional, Professional, Conductor)
- License restrictions
- License expiry date (with warnings)
- Assigned truck

#### Employment Statuses
- **Active**: Currently employed and working
- **On Leave**: Temporarily unavailable
- **Suspended**: Temporarily suspended
- **Inactive**: No longer actively employed
- **Archived**: Permanently archived

#### Employee Features
✅ List all employees with search and filters
✅ Filter by role (Driver, Porter, Operator)
✅ Filter by employment status
✅ View detailed employee information
✅ Add new employees with validation
✅ Edit existing employee details
✅ Archive employees (soft delete)
✅ License expiry warnings for drivers
✅ Philippine phone number formatting
✅ Role-based field validation
✅ Truck assignment display

## Philippine Format Support

### Plate Numbers
- Format: `ABC-1234` (3 letters, dash, 3-4 digits)
- Auto-formatting on input
- Validation with error messages
- Display formatting

### Phone Numbers
- Formats supported:
  - `+63 917 123 4567` (international)
  - `0917 123 4567` (local)
- Auto-formatting on input
- Validation for Philippine mobile numbers
- Display formatting

### Currency
- Format: `₱12,345.67`
- Peso symbol (₱)
- Thousand separators
- Two decimal places

### Dates
- Format: `MM/DD/YYYY` (US/Philippine standard)
- Expiry date tracking
- Expiring soon warnings (30 days)
- Expired status indicators

### License Numbers
- Format: `A12-34-567890` (Philippine driver's license)
- Auto-formatting
- Validation

## Screen Structure

```
app/(operator)/
├── _layout.tsx                 # Tab navigation layout
├── index.tsx                   # Dashboard with stats
├── trucks/
│   ├── _layout.tsx            # Stack navigation
│   ├── index.tsx              # Truck list with search/filters
│   ├── [id].tsx               # Truck detail view
│   ├── add.tsx                # Add truck form
│   └── edit/[id].tsx          # Edit truck form
├── employees/
│   ├── _layout.tsx            # Stack navigation
│   ├── index.tsx              # Employee list with search/filters
│   ├── [id].tsx               # Employee detail view (TODO)
│   ├── add.tsx                # Add employee form (TODO)
│   └── edit/[id].tsx          # Edit employee form (TODO)
├── trips.tsx                  # Trips placeholder
└── profile.tsx                # Profile with logout
```

## Services & API Layer

### Truck Service (`src/services/api/truck.service.ts`)
- `getTrucks(filters, page, limit)` - Fetch paginated truck list
- `getTruckById(id)` - Fetch single truck details
- `createTruck(data)` - Create new truck
- `updateTruck(data)` - Update existing truck
- `archiveTruck(id)` - Soft delete truck
- `restoreTruck(id)` - Restore archived truck
- `updateTruckStatus(id, status)` - Update truck status
- `getAvailableTrucks()` - Get trucks available for assignment

### Employee Service (`src/services/api/employee.service.ts`)
- `getEmployees(filters, page, limit)` - Fetch paginated employee list
- `getEmployeeById(id)` - Fetch single employee details
- `createEmployee(data)` - Create new employee & auth account
- `updateEmployee(data)` - Update existing employee
- `archiveEmployee(id)` - Soft delete employee
- `restoreEmployee(id)` - Restore archived employee
- `getDriversForAssignment()` - Get available drivers
- `assignDriverToTruck(driverId, truckId)` - Assign driver to truck
- `unassignDriverFromTruck(driverId)` - Unassign driver from truck

## Validation Schemas

### Truck Schema (`src/validation/schemas/truck.schema.ts`)
- Required fields validation
- Philippine plate number format
- Year range validation (1900 to current+1)
- Positive numbers for capacity, odometer, fuel efficiency
- Date format validation
- Max length constraints

### Employee Schema (`src/validation/schemas/employee.schema.ts`)
- Required fields validation
- Philippine phone number format
- Email format validation
- License number format (for drivers)
- Role-based conditional validation
- Compensation field validation

## Types & Interfaces

### Truck Types (`src/types/truck.types.ts`)
- `TruckStatus` enum
- `FuelType` enum
- `Truck` interface
- `CreateTruckInput` interface
- `UpdateTruckInput` interface
- `TruckFilters` interface
- `TruckDocument` interface
- `TruckPhoto` interface

### Employee Types (`src/types/employee.types.ts`)
- `EmploymentStatus` enum
- `LicenseType` enum
- `Employee` interface
- `CreateEmployeeInput` interface
- `UpdateEmployeeInput` interface
- `EmployeeFilters` interface
- `EmployeeDocument` interface
- `EmergencyContact` interface
- `LicenseDetails` interface
- `CompensationConfig` interface

## Utilities

### Philippine Utilities (`src/utils/philippines.ts`)
- `formatPlatNumber(plate)` - Format plate number
- `isValidPlateNumber(plate)` - Validate plate number
- `formatPhilippinePhone(phone)` - Format phone number
- `isValidPhilippinePhone(phone)` - Validate phone number
- `formatPeso(amount, showSymbol)` - Format currency
- `parsePeso(amount)` - Parse currency string
- `formatPhilippineDate(date)` - Format date
- `formatPhilippineDateTime(date)` - Format date and time
- `formatLicenseNumber(license)` - Format license number
- `isValidLicenseNumber(license)` - Validate license number
- `getRelativeDate(date)` - Get relative date string
- `isExpiringSoon(date, threshold)` - Check if expiring soon
- `isExpired(date)` - Check if expired

## Testing Checklist

### Truck Management Testing

#### Add Truck
- [ ] Create truck with all required fields
- [ ] Validate plate number format (ABC-1234)
- [ ] Test year validation (must be >= 1900, <= current+1)
- [ ] Test capacity validation (must be positive)
- [ ] Select different fuel types
- [ ] Add optional fields (VIN, OR/CR, insurance)
- [ ] Add notes
- [ ] Verify success message and navigation

#### View Truck List
- [ ] View all active trucks
- [ ] Search by truck number
- [ ] Search by plate number
- [ ] Search by make/model
- [ ] Filter by status (Available, On Trip, etc.)
- [ ] Filter by inactive trucks
- [ ] Test pagination (load more)
- [ ] Pull to refresh
- [ ] View empty state when no trucks

#### View Truck Details
- [ ] View all truck specifications
- [ ] Check OR/CR expiry warnings (if expiring in 30 days)
- [ ] Check insurance expiry warnings
- [ ] View assigned driver (if any)
- [ ] View GPS tracker ID (if any)
- [ ] View notes section

#### Edit Truck
- [ ] Update truck number
- [ ] Update plate number (validate format)
- [ ] Update make/model/year
- [ ] Update capacity and fuel type
- [ ] Update odometer reading
- [ ] Update OR/CR details and expiry dates
- [ ] Update insurance details
- [ ] Change status
- [ ] Update notes
- [ ] Verify success message

#### Archive Truck
- [ ] Archive an active truck
- [ ] Confirm truck is marked inactive
- [ ] Verify truck disappears from active list
- [ ] Check truck appears in inactive filter

### Employee Management Testing

#### Add Employee
- [ ] Create driver with license details
- [ ] Create porter without license requirement
- [ ] Create operator account
- [ ] Validate employee number uniqueness
- [ ] Validate email format
- [ ] Validate Philippine phone number format
- [ ] Validate license number format (for drivers)
- [ ] Add emergency contact
- [ ] Set compensation details
- [ ] Verify temporary password is generated
- [ ] Verify success message

#### View Employee List
- [ ] View all active employees
- [ ] Search by name
- [ ] Search by employee number
- [ ] Search by phone number
- [ ] Filter by role (Driver, Porter, Operator)
- [ ] Filter by employment status
- [ ] Test pagination (load more)
- [ ] Pull to refresh
- [ ] View empty state when no employees

#### View Employee Details
- [ ] View all employee information
- [ ] Check license expiry warnings (for drivers)
- [ ] View assigned truck (for drivers)
- [ ] View emergency contact details
- [ ] View employment status
- [ ] View compensation configuration

#### Edit Employee
- [ ] Update employee name
- [ ] Update contact information
- [ ] Update address
- [ ] Update emergency contact
- [ ] Update license details (for drivers)
- [ ] Update employment status
- [ ] Update compensation
- [ ] Verify success message

#### Archive Employee
- [ ] Archive an active employee
- [ ] Confirm employment status changes to archived
- [ ] Verify employee is marked inactive
- [ ] Check employee appears in inactive filter

### Dashboard Testing
- [ ] View total trucks count
- [ ] View available trucks count
- [ ] View on-trip trucks count
- [ ] View maintenance trucks count
- [ ] View total employees count
- [ ] View active drivers count
- [ ] View active porters count
- [ ] Test quick action buttons
- [ ] Pull to refresh stats

### Profile & Authentication
- [ ] View operator profile information
- [ ] Test logout functionality
- [ ] Confirm logout dialog
- [ ] Verify redirect to login after logout

## Database Integration

All screens are connected to Supabase database via service layer:

### Trucks Table
- Primary key: `id` (UUID)
- Unique constraints: `truck_number`, `license_plate`, `vin`
- Foreign keys: `assigned_driver_id` → `employee_profiles.id`
- Soft delete: `deleted_at`, `is_active`
- Audit fields: `created_by`, `updated_by`, `created_at`, `updated_at`
- RLS policies: Operator-only access

### Employee Profiles Table
- Primary key: `id` (UUID, links to `auth.users`)
- Unique constraints: `employee_id`
- Foreign keys: `assigned_truck_id` → `trucks.id`
- Soft delete via `is_active`, `employment_status`
- Audit fields: `created_by`, `updated_by`, `created_at`, `updated_at`
- RLS policies: Role-based access

## Security Features

- Row Level Security (RLS) enabled on all tables
- Operators have full CRUD access
- Drivers/Porters can only view their own records
- Soft delete prevents data loss
- Audit trail with created_by/updated_by
- No permanent deletion of records
- Password management via Supabase Auth
- Unique constraint validation
- Input sanitization and validation

## Next Steps

### Immediate Priority
1. ✅ Complete truck add/edit forms
2. ✅ Complete employee list screen
3. ⏳ Complete employee detail screen
4. ⏳ Complete employee add/edit forms
5. ⏳ Add document upload functionality
6. ⏳ Test all CRUD operations with real database

### Future Enhancements
- Photo upload for trucks
- Document upload/management
- Maintenance history tracking
- Fuel transaction history
- Trip history per truck/employee
- Performance notes for employees
- Incident report management
- Export reports (PDF, Excel)
- Notification system for expiries
- Calendar view for maintenance schedules

## Common Issues & Solutions

### Issue: Plate number not formatting
**Solution**: Use `formatPlatNumber()` utility and apply on input change

### Issue: Phone number validation failing
**Solution**: Ensure number starts with +63, 0, or is 10 digits (9##)

### Issue: Can't create employee
**Solution**: Check Supabase Auth admin API is enabled, verify email uniqueness

### Issue: Truck/Employee not updating
**Solution**: Verify user authentication, check RLS policies, ensure ID is correct

### Issue: Search not working
**Solution**: Check `.ilike` query syntax, ensure column names match database schema

### Issue: Pagination not loading more
**Solution**: Verify `hasMore` flag, check `onEndReached` trigger, ensure page increment

## Support & Documentation

- **Supabase Setup**: See `supabase/SETUP.md`
- **Database Schema**: See `supabase/DATABASE_SCHEMA.md`
- **API Documentation**: See service layer comments
- **Type Definitions**: See `src/types/` directory
- **Validation Rules**: See `src/validation/schemas/` directory

---

Built with ❤️ for Vone Trucking
