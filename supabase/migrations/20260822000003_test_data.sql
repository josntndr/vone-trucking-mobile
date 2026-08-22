-- Test Data for Vone Trucking
-- Fictional accounts for testing all roles and permissions

-- NOTE: In production, auth.users records should be created via Supabase Auth API
-- This is for testing purposes only

-- ============================================================================
-- TEST USERS (to be created via Supabase Auth)
-- ============================================================================

-- These need to be created manually in Supabase or via API:
-- 1. operator@vonetrucking.com (password: Operator123!)
-- 2. driver1@vonetrucking.com (password: Driver123!)
-- 3. driver2@vonetrucking.com (password: Driver123!)
-- 4. porter1@vonetrucking.com (password: Porter123!)
-- 5. porter2@vonetrucking.com (password: Porter123!)

-- After creating auth users, their UUIDs should be inserted here
-- For now, we'll use placeholder UUIDs that need to be replaced

-- ============================================================================
-- EMPLOYEE PROFILES
-- ============================================================================

-- Operator/Admin
INSERT INTO employee_profiles (
    id,
    employee_id,
    first_name,
    last_name,
    phone,
    role,
    hire_date,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID, -- Replace with actual auth.user id
    'EMP001',
    'John',
    'Administrator',
    '+1-555-0001',
    'operator',
    '2024-01-01',
    TRUE
);

-- Driver 1
INSERT INTO employee_profiles (
    id,
    employee_id,
    first_name,
    last_name,
    phone,
    role,
    hire_date,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000002'::UUID, -- Replace with actual auth.user id
    'DRV001',
    'Michael',
    'Thompson',
    '+1-555-0101',
    'driver',
    '2024-02-15',
    TRUE
);

-- Driver 2
INSERT INTO employee_profiles (
    id,
    employee_id,
    first_name,
    last_name,
    phone,
    role,
    hire_date,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000003'::UUID, -- Replace with actual auth.user id
    'DRV002',
    'David',
    'Martinez',
    '+1-555-0102',
    'driver',
    '2024-03-01',
    TRUE
);

-- Porter 1
INSERT INTO employee_profiles (
    id,
    employee_id,
    first_name,
    last_name,
    phone,
    role,
    hire_date,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000004'::UUID, -- Replace with actual auth.user id
    'PTR001',
    'James',
    'Wilson',
    '+1-555-0201',
    'porter',
    '2024-03-15',
    TRUE
);

-- Porter 2
INSERT INTO employee_profiles (
    id,
    employee_id,
    first_name,
    last_name,
    phone,
    role,
    hire_date,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000005'::UUID, -- Replace with actual auth.user id
    'PTR002',
    'Robert',
    'Garcia',
    '+1-555-0202',
    'porter',
    '2024-04-01',
    TRUE
);

-- ============================================================================
-- TRUCKS
-- ============================================================================

INSERT INTO trucks (
    truck_number,
    license_plate,
    make,
    model,
    year,
    vin,
    capacity_kg,
    fuel_type,
    is_active,
    created_by
) VALUES
    ('TRK-001', 'ABC-1234', 'Freightliner', 'Cascadia', 2022, '1FUJGHDV8NLDX1234', 15000.00, 'Diesel', TRUE, '00000000-0000-0000-0000-000000000001'),
    ('TRK-002', 'XYZ-5678', 'Kenworth', 'T680', 2023, '1XKYDP9X0NJ123456', 18000.00, 'Diesel', TRUE, '00000000-0000-0000-0000-000000000001'),
    ('TRK-003', 'DEF-9012', 'Peterbilt', '579', 2021, '1XPBD40X2ED123456', 16000.00, 'Diesel', TRUE, '00000000-0000-0000-0000-000000000001');

-- ============================================================================
-- GPS DEVICES
-- ============================================================================

INSERT INTO gps_devices (
    device_id,
    device_name,
    imei,
    phone_number,
    truck_id,
    is_active,
    created_by
) VALUES
    ('GPS-001', 'Tracker Alpha', '123456789012345', '+1-555-9001', (SELECT id FROM trucks WHERE truck_number = 'TRK-001'), TRUE, '00000000-0000-0000-0000-000000000001'),
    ('GPS-002', 'Tracker Beta', '123456789012346', '+1-555-9002', (SELECT id FROM trucks WHERE truck_number = 'TRK-002'), TRUE, '00000000-0000-0000-0000-000000000001'),
    ('GPS-003', 'Tracker Gamma', '123456789012347', '+1-555-9003', (SELECT id FROM trucks WHERE truck_number = 'TRK-003'), TRUE, '00000000-0000-0000-0000-000000000001');

-- ============================================================================
-- TRIPS
-- ============================================================================

INSERT INTO trips (
    trip_number,
    truck_id,
    origin,
    destination,
    distance_km,
    planned_departure,
    planned_arrival,
    status,
    cargo_description,
    cargo_weight_kg,
    customer_name,
    customer_contact,
    created_by
) VALUES
    (
        'TRIP-2024-001',
        (SELECT id FROM trucks WHERE truck_number = 'TRK-001'),
        'New York, NY',
        'Boston, MA',
        350.00,
        '2024-08-23 08:00:00',
        '2024-08-23 14:00:00',
        'assigned',
        'General Cargo',
        8000.00,
        'ABC Logistics',
        '+1-555-1000',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        'TRIP-2024-002',
        (SELECT id FROM trucks WHERE truck_number = 'TRK-002'),
        'Los Angeles, CA',
        'San Francisco, CA',
        615.00,
        '2024-08-24 06:00:00',
        '2024-08-24 15:00:00',
        'in_progress',
        'Electronics',
        12000.00,
        'Tech Supplies Inc',
        '+1-555-2000',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        'TRIP-2024-003',
        (SELECT id FROM trucks WHERE truck_number = 'TRK-003'),
        'Chicago, IL',
        'Detroit, MI',
        455.00,
        '2024-08-25 07:00:00',
        '2024-08-25 14:00:00',
        'draft',
        'Furniture',
        10000.00,
        'Home Furnishings Co',
        '+1-555-3000',
        '00000000-0000-0000-0000-000000000001'
    );

-- ============================================================================
-- TRIP ASSIGNMENTS
-- ============================================================================

-- Assign Driver 1 and Porter 1 to Trip 1
INSERT INTO trip_assignments (
    trip_id,
    employee_id,
    role,
    assigned_by
) VALUES
    (
        (SELECT id FROM trips WHERE trip_number = 'TRIP-2024-001'),
        '00000000-0000-0000-0000-000000000002',
        'driver',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        (SELECT id FROM trips WHERE trip_number = 'TRIP-2024-001'),
        '00000000-0000-0000-0000-000000000004',
        'porter',
        '00000000-0000-0000-0000-000000000001'
    );

-- Assign Driver 2 and Porter 2 to Trip 2
INSERT INTO trip_assignments (
    trip_id,
    employee_id,
    role,
    assigned_by
) VALUES
    (
        (SELECT id FROM trips WHERE trip_number = 'TRIP-2024-002'),
        '00000000-0000-0000-0000-000000000003',
        'driver',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        (SELECT id FROM trips WHERE trip_number = 'TRIP-2024-002'),
        '00000000-0000-0000-0000-000000000005',
        'porter',
        '00000000-0000-0000-0000-000000000001'
    );

-- ============================================================================
-- FUEL BUDGETS
-- ============================================================================

INSERT INTO fuel_budgets (
    trip_id,
    budgeted_amount,
    budgeted_liters,
    created_by
) VALUES
    (
        (SELECT id FROM trips WHERE trip_number = 'TRIP-2024-001'),
        250.00,
        180.00,
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        (SELECT id FROM trips WHERE trip_number = 'TRIP-2024-002'),
        400.00,
        300.00,
        '00000000-0000-0000-0000-000000000001'
    );

-- ============================================================================
-- ATTENDANCE RECORDS
-- ============================================================================

-- Recent attendance for all employees
INSERT INTO attendance (
    employee_id,
    date,
    status,
    check_in_time,
    check_out_time,
    hours_worked,
    created_by
) VALUES
    -- Driver 1
    ('00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '2 days', 'present', '08:00', '17:00', 9.0, '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '1 day', 'present', '08:15', '17:30', 9.25, '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000002', CURRENT_DATE, 'present', '07:45', NULL, NULL, '00000000-0000-0000-0000-000000000001'),
    
    -- Driver 2
    ('00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '2 days', 'present', '08:00', '17:00', 9.0, '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000003', CURRENT_DATE - INTERVAL '1 day', 'late', '09:00', '17:00', 8.0, '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000003', CURRENT_DATE, 'present', '08:00', NULL, NULL, '00000000-0000-0000-0000-000000000001'),
    
    -- Porter 1
    ('00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '2 days', 'present', '08:00', '17:00', 9.0, '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '1 day', 'present', '08:00', '17:00', 9.0, '00000000-0000-0000-0000-000000000001'),
    ('00000000-0000-0000-0000-000000000004', CURRENT_DATE, 'present', '08:00', NULL, NULL, '00000000-0000-0000-0000-000000000001');

-- ============================================================================
-- PAYROLL PERIOD
-- ============================================================================

INSERT INTO payroll_periods (
    period_name,
    start_date,
    end_date,
    payment_date,
    is_finalized,
    created_by
) VALUES
    (
        'August 2024 - Period 1',
        '2024-08-01',
        '2024-08-15',
        '2024-08-20',
        TRUE,
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        'August 2024 - Period 2',
        '2024-08-16',
        '2024-08-31',
        '2024-09-05',
        FALSE,
        '00000000-0000-0000-0000-000000000001'
    );

-- ============================================================================
-- PAYSLIPS (SENSITIVE - Only for first period)
-- ============================================================================

INSERT INTO payslips (
    payroll_period_id,
    employee_id,
    base_salary,
    allowances,
    deductions,
    bonuses,
    net_salary,
    payment_status,
    paid_date,
    created_by
) VALUES
    (
        (SELECT id FROM payroll_periods WHERE period_name = 'August 2024 - Period 1'),
        '00000000-0000-0000-0000-000000000002',
        2500.00,
        200.00,
        150.00,
        0.00,
        2550.00,
        'paid',
        '2024-08-20',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        (SELECT id FROM payroll_periods WHERE period_name = 'August 2024 - Period 1'),
        '00000000-0000-0000-0000-000000000003',
        2500.00,
        200.00,
        150.00,
        100.00,
        2650.00,
        'paid',
        '2024-08-20',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        (SELECT id FROM payroll_periods WHERE period_name = 'August 2024 - Period 1'),
        '00000000-0000-0000-0000-000000000004',
        2000.00,
        150.00,
        100.00,
        0.00,
        2050.00,
        'paid',
        '2024-08-20',
        '00000000-0000-0000-0000-000000000001'
    );

-- ============================================================================
-- CASH ADVANCES
-- ============================================================================

INSERT INTO cash_advances (
    employee_id,
    amount,
    request_date,
    approved_date,
    disbursed_date,
    status,
    reason,
    created_by,
    approved_by
) VALUES
    (
        '00000000-0000-0000-0000-000000000002',
        500.00,
        '2024-08-15',
        '2024-08-16',
        '2024-08-17',
        'paid',
        'Emergency medical expenses',
        '00000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        300.00,
        '2024-08-20',
        NULL,
        NULL,
        'pending',
        'Personal need',
        '00000000-0000-0000-0000-000000000004',
        NULL
    );

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    priority
) VALUES
    (
        '00000000-0000-0000-0000-000000000002',
        'Trip Assignment',
        'You have been assigned to TRIP-2024-001 departing tomorrow at 08:00.',
        'trip_assignment',
        'high'
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'Trip In Progress',
        'Your trip TRIP-2024-002 is currently in progress.',
        'trip_status',
        'normal'
    ),
    (
        '00000000-0000-0000-0000-000000000004',
        'Cash Advance Status',
        'Your cash advance request is pending approval.',
        'cash_advance',
        'normal'
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE employee_profiles IS 'Test data loaded. Replace placeholder UUIDs with actual auth.users IDs.';
