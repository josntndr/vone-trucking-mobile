-- Vone Trucking Database Schema
-- Initial migration: Core tables with RLS policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('operator', 'driver', 'porter');
CREATE TYPE trip_status AS ENUM ('draft', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'on_leave');
CREATE TYPE document_type AS ENUM ('pod', 'bill_of_lading', 'invoice', 'receipt', 'other');
CREATE TYPE transaction_type AS ENUM ('fuel', 'toll', 'maintenance', 'parking', 'other');
CREATE TYPE advance_status AS ENUM ('pending', 'approved', 'rejected', 'paid', 'repaid');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Employee Profiles (extends auth.users)
CREATE TABLE employee_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    role user_role NOT NULL,
    hire_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_photo_url TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Trucks
CREATE TABLE trucks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_number TEXT UNIQUE NOT NULL,
    license_plate TEXT UNIQUE NOT NULL,
    make TEXT,
    model TEXT,
    year INTEGER,
    vin TEXT UNIQUE,
    capacity_kg DECIMAL(10,2),
    fuel_type TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    purchase_date DATE,
    last_service_date DATE,
    next_service_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_year CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1)
);

-- GPS Devices
CREATE TABLE gps_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT UNIQUE NOT NULL,
    device_name TEXT,
    imei TEXT UNIQUE,
    phone_number TEXT,
    truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_connection TIMESTAMPTZ,
    battery_level INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    CONSTRAINT valid_battery CHECK (battery_level >= 0 AND battery_level <= 100)
);

-- Trips
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_number TEXT UNIQUE NOT NULL,
    truck_id UUID REFERENCES trucks(id),
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    distance_km DECIMAL(10,2),
    planned_departure TIMESTAMPTZ,
    planned_arrival TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    status trip_status DEFAULT 'draft',
    cargo_description TEXT,
    cargo_weight_kg DECIMAL(10,2),
    customer_name TEXT,
    customer_contact TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_distance CHECK (distance_km >= 0),
    CONSTRAINT valid_weight CHECK (cargo_weight_kg >= 0),
    CONSTRAINT valid_dates CHECK (planned_departure < planned_arrival)
);

-- Trip Assignments
CREATE TABLE trip_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee_profiles(id),
    role user_role NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    removed_at TIMESTAMPTZ,
    removed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    UNIQUE(trip_id, employee_id, role),
    CONSTRAINT valid_role CHECK (role IN ('driver', 'porter'))
);

-- Trip Status History
CREATE TABLE trip_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    old_status trip_status,
    new_status trip_status NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Location Logs
CREATE TABLE location_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    gps_device_id UUID REFERENCES gps_devices(id),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude DECIMAL(10,2),
    speed_kmh DECIMAL(6,2),
    heading DECIMAL(5,2),
    accuracy_meters DECIMAL(6,2),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180),
    CONSTRAINT valid_speed CHECK (speed_kmh >= 0),
    CONSTRAINT valid_heading CHECK (heading >= 0 AND heading < 360)
);

-- Create index for location logs by trip and time
CREATE INDEX idx_location_logs_trip_time ON location_logs(trip_id, recorded_at DESC);
CREATE INDEX idx_location_logs_device_time ON location_logs(gps_device_id, recorded_at DESC);

-- Fuel Budgets
CREATE TABLE fuel_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID UNIQUE NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    budgeted_amount DECIMAL(10,2) NOT NULL,
    budgeted_liters DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    CONSTRAINT valid_budgeted_amount CHECK (budgeted_amount >= 0),
    CONSTRAINT valid_budgeted_liters CHECK (budgeted_liters IS NULL OR budgeted_liters >= 0)
);

-- Fuel Transactions
CREATE TABLE fuel_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    station_name TEXT,
    station_location TEXT,
    liters DECIMAL(10,2) NOT NULL,
    price_per_liter DECIMAL(10,2),
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    receipt_url TEXT,
    odometer_reading INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_liters CHECK (liters > 0),
    CONSTRAINT valid_price CHECK (price_per_liter IS NULL OR price_per_liter >= 0),
    CONSTRAINT valid_total CHECK (total_amount >= 0)
);

-- Trip Income
CREATE TABLE trip_income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    received_date DATE,
    payment_method TEXT,
    invoice_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_income_amount CHECK (amount >= 0)
);

-- Trip Expenses
CREATE TABLE trip_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    expense_type transaction_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_expense_amount CHECK (amount >= 0)
);

-- Delivery Documents
CREATE TABLE delivery_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    document_type document_type NOT NULL,
    document_number TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    notes TEXT,
    deleted_at TIMESTAMPTZ
);

-- Attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    hours_worked DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(employee_id, date),
    CONSTRAINT valid_hours CHECK (hours_worked IS NULL OR (hours_worked >= 0 AND hours_worked <= 24))
);

-- Payroll Periods
CREATE TABLE payroll_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_date DATE,
    is_finalized BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    CONSTRAINT valid_period CHECK (start_date < end_date),
    CONSTRAINT unique_period UNIQUE(start_date, end_date)
);

-- Payslips
CREATE TABLE payslips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    base_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    bonuses DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_status TEXT DEFAULT 'pending',
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    UNIQUE(payroll_period_id, employee_id),
    CONSTRAINT valid_base_salary CHECK (base_salary >= 0),
    CONSTRAINT valid_allowances CHECK (allowances >= 0),
    CONSTRAINT valid_deductions CHECK (deductions >= 0),
    CONSTRAINT valid_bonuses CHECK (bonuses >= 0),
    CONSTRAINT valid_net_salary CHECK (net_salary >= 0)
);

-- Cash Advances
CREATE TABLE cash_advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    request_date DATE DEFAULT CURRENT_DATE,
    approved_date DATE,
    disbursed_date DATE,
    status advance_status DEFAULT 'pending',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    CONSTRAINT valid_advance_amount CHECK (amount > 0)
);

-- Cash Advance Repayments
CREATE TABLE cash_advance_repayments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cash_advance_id UUID NOT NULL REFERENCES cash_advances(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    CONSTRAINT valid_repayment_amount CHECK (amount > 0)
);

-- Maintenance Records
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    service_date DATE NOT NULL,
    odometer_reading INTEGER,
    cost DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    vendor_name TEXT,
    invoice_number TEXT,
    next_service_date DATE,
    next_service_odometer INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_cost CHECK (cost IS NULL OR cost >= 0),
    CONSTRAINT valid_odometer CHECK (odometer_reading IS NULL OR odometer_reading >= 0)
);

-- Incident Reports
CREATE TABLE incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    reported_by UUID REFERENCES employee_profiles(id),
    incident_date TIMESTAMPTZ NOT NULL,
    incident_type TEXT NOT NULL,
    severity TEXT,
    location TEXT,
    description TEXT NOT NULL,
    injuries BOOLEAN DEFAULT FALSE,
    property_damage BOOLEAN DEFAULT FALSE,
    police_notified BOOLEAN DEFAULT FALSE,
    police_report_number TEXT,
    insurance_notified BOOLEAN DEFAULT FALSE,
    insurance_claim_number TEXT,
    photos_urls TEXT[],
    status TEXT DEFAULT 'open',
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    data JSONB,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- Google Sheets Imports
CREATE TABLE google_sheets_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sheet_name TEXT NOT NULL,
    sheet_id TEXT NOT NULL,
    import_type TEXT NOT NULL,
    rows_imported INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    error_log JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES auth.users(id),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id, created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_employee_profiles_updated_at BEFORE UPDATE ON employee_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON trucks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gps_devices_updated_at BEFORE UPDATE ON gps_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fuel_budgets_updated_at BEFORE UPDATE ON fuel_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fuel_transactions_updated_at BEFORE UPDATE ON fuel_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_income_updated_at BEFORE UPDATE ON trip_income FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_expenses_updated_at BEFORE UPDATE ON trip_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_periods_updated_at BEFORE UPDATE ON payroll_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON payslips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_advances_updated_at BEFORE UPDATE ON cash_advances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incident_reports_updated_at BEFORE UPDATE ON incident_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUDIT LOGGING TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to sensitive tables
CREATE TRIGGER audit_trips AFTER INSERT OR UPDATE OR DELETE ON trips FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_payslips AFTER INSERT OR UPDATE OR DELETE ON payslips FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_cash_advances AFTER INSERT OR UPDATE OR DELETE ON cash_advances FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_fuel_transactions AFTER INSERT OR UPDATE OR DELETE ON fuel_transactions FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
CREATE TRIGGER audit_trip_income AFTER INSERT OR UPDATE OR DELETE ON trip_income FOR EACH ROW EXECUTE FUNCTION log_audit_changes();

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_employee_profiles_role ON employee_profiles(role) WHERE is_active = TRUE;
CREATE INDEX idx_employee_profiles_employee_id ON employee_profiles(employee_id);
CREATE INDEX idx_trucks_active ON trucks(truck_number) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_trips_status ON trips(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_trips_truck ON trips(truck_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_trip_assignments_trip ON trip_assignments(trip_id) WHERE removed_at IS NULL;
CREATE INDEX idx_trip_assignments_employee ON trip_assignments(employee_id) WHERE removed_at IS NULL;
CREATE INDEX idx_fuel_transactions_trip ON fuel_transactions(trip_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_trip_expenses_trip ON trip_expenses(trip_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_trip_income_trip ON trip_income(trip_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date DESC);
CREATE INDEX idx_payslips_employee ON payslips(employee_id);
CREATE INDEX idx_cash_advances_employee ON cash_advances(employee_id);
CREATE INDEX idx_maintenance_truck ON maintenance_records(truck_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_incident_reports_trip ON incident_reports(trip_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE employee_profiles IS 'Employee information extending auth.users';
COMMENT ON TABLE trips IS 'Main trips table with soft delete support';
COMMENT ON TABLE trip_assignments IS 'Links employees to trips with roles';
COMMENT ON TABLE location_logs IS 'GPS tracking data for trips';
COMMENT ON TABLE payslips IS 'Payroll records - highly sensitive';
COMMENT ON TABLE cash_advances IS 'Employee cash advances - sensitive';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all changes';
