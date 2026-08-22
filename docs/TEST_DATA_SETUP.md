# Test Data Setup Guide

## Overview

This guide helps testers set up realistic test data for comprehensive testing of the Vone Trucking mobile application.

## 1. User Accounts

### Create Test Users

Create the following test accounts in your Supabase auth system:

#### Operator
- **Email**: operator@vonetrucking.test
- **Password**: Test@2024
- **Role**: operator
- **Name**: Test Operator

#### Drivers
1. **Driver 1**
   - Email: driver1@vonetrucking.test
   - Password: Test@2024
   - Role: driver
   - Name: John Kamau
   - License: KDL12345
   - Phone: +254 712 345 678

2. **Driver 2**
   - Email: driver2@vonetrucking.test
   - Password: Test@2024
   - Role: driver
   - Name: Peter Ochieng
   - License: KDL23456
   - Phone: +254 723 456 789

#### Porters
1. **Porter 1**
   - Email: porter1@vonetrucking.test
   - Password: Test@2024
   - Role: porter
   - Name: David Mwangi
   - ID: 12345678
   - Phone: +254 734 567 890

2. **Porter 2**
   - Email: porter2@vonetrucking.test
   - Password: Test@2024
   - Role: porter
   - Name: James Otieno
   - ID: 23456789
   - Phone: +254 745 678 901

## 2. Truck Data

### Create Test Trucks

```sql
INSERT INTO trucks (registration_number, make, model, year, capacity_kg, status) VALUES
('KBZ 123A', 'Isuzu', 'FRR', 2020, 5000, 'available'),
('KCA 456B', 'Mitsubishi', 'Canter', 2019, 3000, 'available'),
('KAA 789C', 'Isuzu', 'NQR', 2021, 7000, 'on_trip'),
('KBX 012D', 'Hino', '300 Series', 2018, 4000, 'maintenance');
```

### Truck Details
- **KBZ 123A**: Good condition, recently serviced
- **KCA 456B**: Needs tire replacement soon
- **KAA 789C**: Currently on trip to Mombasa
- **KBX 012D**: Under maintenance, expected back in 3 days

## 3. Google Sheets Test Data

### Create Test Google Sheet

1. Create a new Google Sheet named "Vone Trucking Test Schedule"
2. Add the following columns:

| Date | Truck | Driver | Porter | Pickup | Dropoff | Cargo | Weight | Income |
|------|-------|--------|--------|--------|---------|-------|--------|--------|
| 2024-08-23 | KBZ 123A | John Kamau | David Mwangi | Nairobi CBD | Mombasa Port | Electronics | 2500 | 15000 |
| 2024-08-23 | KCA 456B | Peter Ochieng | James Otieno | Nairobi Industrial | Nakuru | Food Supplies | 2000 | 10000 |
| 2024-08-24 | KBZ 123A | John Kamau | - | Thika | Kisumu | Textiles | 3000 | 18000 |
| 2024-08-25 | KCA 456B | Peter Ochieng | David Mwangi | Nairobi | Eldoret | Building Materials | 2800 | 20000 |
| 2024-08-25 | KAA 789C | John Kamau | James Otieno | Mombasa | Nairobi | Import Goods | 4000 | 25000 |

3. Share sheet with your test Google account
4. Copy the sheet URL for import testing

## 4. Trip Test Data

### Sample Completed Trips

Create these manually or via import for testing analytics:

#### Trip 1: Nairobi to Mombasa
```json
{
  "id": "trip_001",
  "truck": "KBZ 123A",
  "driver": "John Kamau",
  "porter": "David Mwangi",
  "pickup": "Nairobi CBD",
  "dropoff": "Mombasa Port",
  "scheduled_date": "2024-08-20",
  "started_at": "2024-08-20T06:00:00Z",
  "completed_at": "2024-08-20T14:30:00Z",
  "start_odometer": 45000,
  "end_odometer": 45480,
  "distance_km": 480,
  "trip_income": 15000,
  "fuel_cost": 7200,
  "toll_cost": 500,
  "parking_cost": 200,
  "total_expenses": 7900,
  "net_profit": 7100,
  "status": "completed",
  "on_time": true
}
```

#### Trip 2: Nairobi to Nakuru
```json
{
  "id": "trip_002",
  "truck": "KCA 456B",
  "driver": "Peter Ochieng",
  "scheduled_date": "2024-08-21",
  "started_at": "2024-08-21T07:00:00Z",
  "completed_at": "2024-08-21T10:00:00Z",
  "start_odometer": 32000,
  "end_odometer": 32160,
  "distance_km": 160,
  "trip_income": 10000,
  "fuel_cost": 2400,
  "toll_cost": 200,
  "total_expenses": 2600,
  "net_profit": 7400,
  "status": "completed",
  "on_time": true
}
```

#### Trip 3: Delayed Trip
```json
{
  "id": "trip_003",
  "truck": "KBZ 123A",
  "driver": "John Kamau",
  "scheduled_date": "2024-08-19",
  "started_at": "2024-08-19T08:30:00Z",
  "completed_at": "2024-08-19T19:00:00Z",
  "status": "completed",
  "on_time": false,
  "delay_reason": "Traffic accident on highway",
  "trip_income": 12000,
  "total_expenses": 5500,
  "net_profit": 6500
}
```

## 5. Fuel Records

### Sample Fuel Data

```json
[
  {
    "trip_id": "trip_001",
    "litres": 50,
    "cost": 7500,
    "price_per_litre": 150,
    "station": "Shell Mlolongo",
    "location": { "lat": -1.398, "lng": 36.986 },
    "recorded_at": "2024-08-20T09:00:00Z",
    "receipt_photo": "receipt_001.jpg"
  },
  {
    "trip_id": "trip_002",
    "litres": 16,
    "cost": 2400,
    "price_per_litre": 150,
    "station": "Total Limuru",
    "recorded_at": "2024-08-21T08:00:00Z"
  }
]
```

## 6. Expense Records

### Sample Expenses

```json
[
  {
    "trip_id": "trip_001",
    "type": "toll",
    "amount": 500,
    "notes": "Mombasa Road Toll",
    "recorded_at": "2024-08-20T08:30:00Z"
  },
  {
    "trip_id": "trip_001",
    "type": "parking",
    "amount": 200,
    "notes": "Port parking fee",
    "recorded_at": "2024-08-20T13:00:00Z"
  },
  {
    "trip_id": "trip_002",
    "type": "toll",
    "amount": 200,
    "notes": "Rironi Toll",
    "recorded_at": "2024-08-21T07:30:00Z"
  }
]
```

## 7. Proof of Delivery Records

### Sample POD Data

```json
[
  {
    "trip_id": "trip_001",
    "recipient_name": "Mohammed Ali",
    "recipient_phone": "+254 722 111 222",
    "delivery_time": "2024-08-20T14:00:00Z",
    "signature_url": "signatures/pod_001.jpg",
    "delivery_photos": [
      "deliveries/pod_001_1.jpg",
      "deliveries/pod_001_2.jpg"
    ],
    "notes": "Delivered in good condition, all packages intact",
    "location": { "lat": -4.043, "lng": 39.668 }
  }
]
```

## 8. Payroll Test Data

### Sample Payroll Period

```json
{
  "period_start": "2024-08-01",
  "period_end": "2024-08-15",
  "employees": [
    {
      "employee_id": "driver_1",
      "name": "John Kamau",
      "role": "driver",
      "trips_completed": 8,
      "days_worked": 12,
      "hours_worked": 96,
      "gross_pay": 50000,
      "deductions": {
        "cash_advance": 5000,
        "nhif": 1700,
        "nssf": 1080
      },
      "net_pay": 42220
    },
    {
      "employee_id": "porter_1",
      "name": "David Mwangi",
      "role": "porter",
      "trips_completed": 6,
      "days_worked": 10,
      "hours_worked": 60,
      "gross_pay": 18000,
      "deductions": {
        "nhif": 850,
        "nssf": 540
      },
      "net_pay": 16610
    }
  ]
}
```

## 9. Cash Advance Test Data

### Sample Cash Advances

```json
[
  {
    "employee_id": "driver_1",
    "employee_name": "John Kamau",
    "amount": 10000,
    "issue_date": "2024-08-10",
    "reason": "Emergency family expense",
    "repayment_terms": "2 installments",
    "installment_amount": 5000,
    "repaid_amount": 5000,
    "remaining_balance": 5000,
    "status": "partial"
  },
  {
    "employee_id": "driver_2",
    "employee_name": "Peter Ochieng",
    "amount": 5000,
    "issue_date": "2024-08-15",
    "reason": "Medical expense",
    "repayment_terms": "1 installment",
    "installment_amount": 5000,
    "repaid_amount": 0,
    "remaining_balance": 5000,
    "status": "pending"
  }
]
```

## 10. Location History Test Data

### Sample Location Points

For testing location tracking, create a series of GPS points along a route:

```json
[
  {"trip_id": "trip_001", "lat": -1.286, "lng": 36.817, "timestamp": "2024-08-20T06:00:00Z", "speed": 0},
  {"trip_id": "trip_001", "lat": -1.300, "lng": 36.850, "timestamp": "2024-08-20T06:15:00Z", "speed": 45},
  {"trip_id": "trip_001", "lat": -1.350, "lng": 36.900, "timestamp": "2024-08-20T06:30:00Z", "speed": 60},
  {"trip_id": "trip_001", "lat": -1.398, "lng": 36.986, "timestamp": "2024-08-20T09:00:00Z", "speed": 0},
  {"trip_id": "trip_001", "lat": -4.043, "lng": 39.668, "timestamp": "2024-08-20T14:00:00Z", "speed": 0}
]
```

## 11. Alerts Test Data

### Sample Alert Conditions

Create scenarios that trigger alerts:

#### Expiring Documents
- Set truck KCA 456B insurance expiry to 10 days from now
- Set driver John Kamau license expiry to 15 days from now

#### Maintenance Due
- Set truck KBX 012D maintenance due date to yesterday
- Set truck KBZ 123A service due at 46,000 km (current: 45,800 km)

#### GPS Issues
- Simulate GPS disconnection for trip_003 for 30 minutes

## 12. Test Photo Assets

### Prepare Test Images

Create or download sample images for:

1. **Receipts**: 3-4 sample receipt images (fuel, parking, toll)
2. **Delivery Photos**: 5-6 photos of cargo/packages
3. **Signatures**: 3-4 sample signature images
4. **Incident Photos**: 2-3 photos for incident reports

Save these in a test assets folder on the device for easy access during testing.

## 13. Database Seeding Script

### SQL Script to Populate Test Data

```sql
-- Run this script to populate your test database

-- Insert test users (assumes auth setup separately)

-- Insert trucks
INSERT INTO trucks (registration_number, make, model, year, capacity_kg, status, insurance_expiry, last_service_date, next_service_km)
VALUES 
  ('KBZ 123A', 'Isuzu', 'FRR', 2020, 5000, 'available', '2025-06-01', '2024-08-01', 46000),
  ('KCA 456B', 'Mitsubishi', 'Canter', 2019, 3000, 'available', '2024-09-05', '2024-07-15', 33000),
  ('KAA 789C', 'Isuzu', 'NQR', 2021, 7000, 'on_trip', '2025-03-20', '2024-08-10', 48000),
  ('KBX 012D', 'Hino', '300 Series', 2018, 4000, 'maintenance', '2025-01-15', '2024-08-21', 40000);

-- Insert completed trips for analytics
INSERT INTO trips (id, truck_reg, driver_id, porter_id, pickup_location, dropoff_location, scheduled_date, started_at, completed_at, start_odometer, end_odometer, trip_income, status, on_time)
VALUES
  ('trip_001', 'KBZ 123A', 'driver_1_id', 'porter_1_id', 'Nairobi CBD', 'Mombasa Port', '2024-08-20', '2024-08-20 06:00:00', '2024-08-20 14:30:00', 45000, 45480, 15000, 'completed', true),
  ('trip_002', 'KCA 456B', 'driver_2_id', null, 'Nairobi Industrial', 'Nakuru', '2024-08-21', '2024-08-21 07:00:00', '2024-08-21 10:00:00', 32000, 32160, 10000, 'completed', true),
  ('trip_003', 'KBZ 123A', 'driver_1_id', 'porter_2_id', 'Thika', 'Kisumu', '2024-08-19', '2024-08-19 08:30:00', '2024-08-19 19:00:00', 45480, 45800, 12000, 'completed', false);

-- Insert fuel records
INSERT INTO fuel_records (trip_id, litres, cost, station, location_lat, location_lng, recorded_at)
VALUES
  ('trip_001', 50, 7500, 'Shell Mlolongo', -1.398, 36.986, '2024-08-20 09:00:00'),
  ('trip_002', 16, 2400, 'Total Limuru', -1.106, 36.652, '2024-08-21 08:00:00');

-- Insert expenses
INSERT INTO expenses (trip_id, type, amount, notes, recorded_at)
VALUES
  ('trip_001', 'toll', 500, 'Mombasa Road Toll', '2024-08-20 08:30:00'),
  ('trip_001', 'parking', 200, 'Port parking fee', '2024-08-20 13:00:00'),
  ('trip_002', 'toll', 200, 'Rironi Toll', '2024-08-21 07:30:00');

-- Insert cash advances
INSERT INTO cash_advances (employee_id, amount, issue_date, reason, repayment_terms, remaining_balance, status)
VALUES
  ('driver_1_id', 10000, '2024-08-10', 'Emergency family expense', '2 installments', 5000, 'partial'),
  ('driver_2_id', 5000, '2024-08-15', 'Medical expense', '1 installment', 5000, 'pending');
```

## 14. Test Environment Checklist

Before starting testing, ensure:

- [ ] All test user accounts created
- [ ] Test trucks added to database
- [ ] Google Sheet created and shared
- [ ] Sample completed trips in database
- [ ] Fuel and expense records added
- [ ] Cash advances created
- [ ] Test photo assets prepared on device
- [ ] Both Android and iOS devices/emulators ready
- [ ] Network throttling tools installed (if testing offline)
- [ ] Screen recording tools ready
- [ ] Bug tracking system accessible

## 15. Resetting Test Data

To reset test data between test runs:

```sql
-- Clear all test trips
DELETE FROM trips WHERE id LIKE 'trip_%';

-- Clear fuel records
DELETE FROM fuel_records WHERE trip_id LIKE 'trip_%';

-- Clear expenses
DELETE FROM expenses WHERE trip_id LIKE 'trip_%';

-- Reset truck statuses
UPDATE trucks SET status = 'available' WHERE registration_number IN ('KBZ 123A', 'KCA 456B', 'KAA 789C');

-- Clear sync queue (in app storage)
-- Navigate to Settings > Developer Options > Clear Sync Queue
```

## Notes

- Keep test data realistic but distinguishable from production data
- Use consistent naming patterns (test_, demo_, etc.)
- Document any custom test data scenarios
- Maintain a test data backup for quick resets
- Update test data as new features are added
