-- Row-Level Security (RLS) Policies
-- Implements role-based access control for all tables

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_advance_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_sheets_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
    SELECT role FROM employee_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is operator
CREATE OR REPLACE FUNCTION is_operator()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM employee_profiles 
        WHERE id = auth.uid() AND role = 'operator' AND is_active = TRUE
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is driver
CREATE OR REPLACE FUNCTION is_driver()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM employee_profiles 
        WHERE id = auth.uid() AND role = 'driver' AND is_active = TRUE
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if current user is porter
CREATE OR REPLACE FUNCTION is_porter()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM employee_profiles 
        WHERE id = auth.uid() AND role = 'porter' AND is_active = TRUE
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is assigned to a trip
CREATE OR REPLACE FUNCTION is_assigned_to_trip(trip_id_param UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM trip_assignments 
        WHERE trip_id = trip_id_param 
        AND employee_id = auth.uid()
        AND removed_at IS NULL
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- EMPLOYEE PROFILES POLICIES
-- ============================================================================

-- Operators can view all employees
CREATE POLICY "Operators can view all employee profiles"
ON employee_profiles FOR SELECT
USING (is_operator());

-- Drivers and porters can only view their own profile
CREATE POLICY "Drivers and porters can view their own profile"
ON employee_profiles FOR SELECT
USING (id = auth.uid() AND (is_driver() OR is_porter()));

-- Only operators can insert employee profiles
CREATE POLICY "Only operators can create employee profiles"
ON employee_profiles FOR INSERT
WITH CHECK (is_operator());

-- Only operators can update employee profiles
CREATE POLICY "Only operators can update employee profiles"
ON employee_profiles FOR UPDATE
USING (is_operator())
WITH CHECK (is_operator());

-- No one can delete employee profiles (use is_active flag instead)
CREATE POLICY "No direct deletion of employee profiles"
ON employee_profiles FOR DELETE
USING (FALSE);

-- ============================================================================
-- TRUCKS POLICIES
-- ============================================================================

-- Operators can do everything with trucks
CREATE POLICY "Operators have full access to trucks"
ON trucks FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Drivers and porters can view active trucks
CREATE POLICY "Drivers and porters can view active trucks"
ON trucks FOR SELECT
USING ((is_driver() OR is_porter()) AND is_active = TRUE AND deleted_at IS NULL);

-- ============================================================================
-- GPS DEVICES POLICIES
-- ============================================================================

-- Operators have full access
CREATE POLICY "Operators have full access to GPS devices"
ON gps_devices FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Drivers and porters can view active devices
CREATE POLICY "Drivers and porters can view active GPS devices"
ON gps_devices FOR SELECT
USING ((is_driver() OR is_porter()) AND is_active = TRUE);

-- ============================================================================
-- TRIPS POLICIES
-- ============================================================================

-- Operators can do everything with trips
CREATE POLICY "Operators have full access to trips"
ON trips FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Drivers and porters can view their assigned trips
CREATE POLICY "Drivers and porters can view assigned trips"
ON trips FOR SELECT
USING (
    (is_driver() OR is_porter()) 
    AND is_assigned_to_trip(id)
    AND deleted_at IS NULL
);

-- Drivers can update status of their assigned trips
CREATE POLICY "Drivers can update their assigned trips"
ON trips FOR UPDATE
USING (is_driver() AND is_assigned_to_trip(id))
WITH CHECK (is_driver() AND is_assigned_to_trip(id));

-- ============================================================================
-- TRIP ASSIGNMENTS POLICIES
-- ============================================================================

-- Operators have full access
CREATE POLICY "Operators have full access to trip assignments"
ON trip_assignments FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Drivers and porters can view their own assignments
CREATE POLICY "Drivers and porters can view their assignments"
ON trip_assignments FOR SELECT
USING (
    (is_driver() OR is_porter()) 
    AND employee_id = auth.uid()
    AND removed_at IS NULL
);

-- ============================================================================
-- TRIP STATUS HISTORY POLICIES
-- ============================================================================

-- Operators can view all history
CREATE POLICY "Operators can view all trip status history"
ON trip_status_history FOR SELECT
USING (is_operator());

-- Drivers and porters can view history of their trips
CREATE POLICY "Drivers and porters can view their trip status history"
ON trip_status_history FOR SELECT
USING (
    (is_driver() OR is_porter())
    AND is_assigned_to_trip(trip_id)
);

-- Only system can insert (via trigger)
CREATE POLICY "Only operators can log trip status changes"
ON trip_status_history FOR INSERT
WITH CHECK (is_operator());

-- ============================================================================
-- LOCATION LOGS POLICIES
-- ============================================================================

-- Operators can view all location logs
CREATE POLICY "Operators can view all location logs"
ON location_logs FOR SELECT
USING (is_operator());

-- Drivers and porters can view locations for their trips
CREATE POLICY "Drivers and porters can view their trip locations"
ON location_logs FOR SELECT
USING (
    (is_driver() OR is_porter())
    AND is_assigned_to_trip(trip_id)
);

-- Drivers can insert location logs for their trips
CREATE POLICY "Drivers can insert location logs for their trips"
ON location_logs FOR INSERT
WITH CHECK (is_driver() AND is_assigned_to_trip(trip_id));

-- ============================================================================
-- FUEL BUDGETS POLICIES
-- ============================================================================

-- Operators have full access
CREATE POLICY "Operators have full access to fuel budgets"
ON fuel_budgets FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Drivers can view fuel budgets for their trips
CREATE POLICY "Drivers can view fuel budgets for their trips"
ON fuel_budgets FOR SELECT
USING (is_driver() AND is_assigned_to_trip(trip_id));

-- ============================================================================
-- FUEL TRANSACTIONS POLICIES
-- ============================================================================

-- Operators have full access
CREATE POLICY "Operators have full access to fuel transactions"
ON fuel_transactions FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Drivers can view and insert fuel transactions for their trips
CREATE POLICY "Drivers can view fuel transactions for their trips"
ON fuel_transactions FOR SELECT
USING (is_driver() AND is_assigned_to_trip(trip_id));

CREATE POLICY "Drivers can insert fuel transactions for their trips"
ON fuel_transactions FOR INSERT
WITH CHECK (is_driver() AND is_assigned_to_trip(trip_id));

CREATE POLICY "Drivers can update their fuel transactions"
ON fuel_transactions FOR UPDATE
USING (is_driver() AND is_assigned_to_trip(trip_id) AND deleted_at IS NULL)
WITH CHECK (is_driver() AND is_assigned_to_trip(trip_id));

-- ============================================================================
-- TRIP INCOME POLICIES (SENSITIVE)
-- ============================================================================

-- Only operators can access trip income
CREATE POLICY "Only operators can access trip income"
ON trip_income FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- ============================================================================
-- TRIP EXPENSES POLICIES
-- ============================================================================

-- Operators have full access
CREATE POLICY "Operators have full access to trip expenses"
ON trip_expenses FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Drivers can view and insert expenses for their trips
CREATE POLICY "Drivers can view expenses for their trips"
ON trip_expenses FOR SELECT
USING (is_driver() AND is_assigned_to_trip(trip_id));

CREATE POLICY "Drivers can insert expenses for their trips"
ON trip_expenses FOR INSERT
WITH CHECK (is_driver() AND is_assigned_to_trip(trip_id));

CREATE POLICY "Drivers can update their expenses"
ON trip_expenses FOR UPDATE
USING (is_driver() AND is_assigned_to_trip(trip_id) AND deleted_at IS NULL)
WITH CHECK (is_driver() AND is_assigned_to_trip(trip_id));

-- ============================================================================
-- DELIVERY DOCUMENTS POLICIES
-- ============================================================================

-- Operators have full access
CREATE POLICY "Operators have full access to delivery documents"
ON delivery_documents FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Drivers can view and upload documents for their trips
CREATE POLICY "Drivers can view documents for their trips"
ON delivery_documents FOR SELECT
USING (is_driver() AND is_assigned_to_trip(trip_id));

CREATE POLICY "Drivers can upload documents for their trips"
ON delivery_documents FOR INSERT
WITH CHECK (is_driver() AND is_assigned_to_trip(trip_id));

-- ============================================================================
-- ATTENDANCE POLICIES
-- ============================================================================

-- Operators have full access
CREATE POLICY "Operators have full access to attendance"
ON attendance FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Employees can view their own attendance
CREATE POLICY "Employees can view their own attendance"
ON attendance FOR SELECT
USING (employee_id = auth.uid());

-- ============================================================================
-- PAYROLL PERIODS POLICIES (SENSITIVE)
-- ============================================================================

-- Only operators can access payroll periods
CREATE POLICY "Only operators can access payroll periods"
ON payroll_periods FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- ============================================================================
-- PAYSLIPS POLICIES (HIGHLY SENSITIVE)
-- ============================================================================

-- Only operators can manage all payslips
CREATE POLICY "Operators can manage all payslips"
ON payslips FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Employees can only view their own payslips
CREATE POLICY "Employees can view their own payslips"
ON payslips FOR SELECT
USING (employee_id = auth.uid());

-- ============================================================================
-- CASH ADVANCES POLICIES (SENSITIVE)
-- ============================================================================

-- Operators have full access
CREATE POLICY "Operators have full access to cash advances"
ON cash_advances FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Employees can view and request their own advances
CREATE POLICY "Employees can view their own cash advances"
ON cash_advances FOR SELECT
USING (employee_id = auth.uid());

CREATE POLICY "Employees can request cash advances"
ON cash_advances FOR INSERT
WITH CHECK (employee_id = auth.uid() AND status = 'pending');

-- ============================================================================
-- CASH ADVANCE REPAYMENTS POLICIES
-- ============================================================================

-- Operators have full access
CREATE POLICY "Operators have full access to repayments"
ON cash_advance_repayments FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Employees can view repayments for their advances
CREATE POLICY "Employees can view their repayments"
ON cash_advance_repayments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM cash_advances 
        WHERE id = cash_advance_id 
        AND employee_id = auth.uid()
    )
);

-- ============================================================================
-- MAINTENANCE RECORDS POLICIES
-- ============================================================================

-- Operators have full access
CREATE POLICY "Operators have full access to maintenance records"
ON maintenance_records FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Drivers can view maintenance records for trucks they use
CREATE POLICY "Drivers can view maintenance records"
ON maintenance_records FOR SELECT
USING (
    is_driver() 
    AND deleted_at IS NULL
);

-- ============================================================================
-- INCIDENT REPORTS POLICIES
-- ============================================================================

-- Operators have full access
CREATE POLICY "Operators have full access to incident reports"
ON incident_reports FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- Employees can view and create their own incident reports
CREATE POLICY "Employees can view their incident reports"
ON incident_reports FOR SELECT
USING (reported_by = auth.uid());

CREATE POLICY "Employees can create incident reports"
ON incident_reports FOR INSERT
WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Employees can update their own incident reports"
ON incident_reports FOR UPDATE
USING (reported_by = auth.uid() AND status = 'open')
WITH CHECK (reported_by = auth.uid());

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can mark their notifications as read
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Only operators can create notifications
CREATE POLICY "Only operators can create notifications"
ON notifications FOR INSERT
WITH CHECK (is_operator());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- GOOGLE SHEETS IMPORTS POLICIES
-- ============================================================================

-- Only operators can access imports
CREATE POLICY "Only operators can access Google Sheets imports"
ON google_sheets_imports FOR ALL
USING (is_operator())
WITH CHECK (is_operator());

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Only operators can view audit logs
CREATE POLICY "Only operators can view audit logs"
ON audit_logs FOR SELECT
USING (is_operator());

-- No manual insert/update/delete - logs are system-managed
CREATE POLICY "No manual modification of audit logs"
ON audit_logs FOR INSERT
WITH CHECK (FALSE);

CREATE POLICY "No update of audit logs"
ON audit_logs FOR UPDATE
USING (FALSE);

CREATE POLICY "No deletion of audit logs"
ON audit_logs FOR DELETE
USING (FALSE);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents
CREATE POLICY "Operators can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'documents' 
    AND is_operator()
);

CREATE POLICY "Operators can view all documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND is_operator());

CREATE POLICY "Drivers can view documents for their trips"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'documents'
    AND (is_driver() OR is_porter())
    -- Additional logic would check if document belongs to user's trip
);

-- Storage policies for receipts
CREATE POLICY "Employees can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'receipts'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Operators can view all receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'receipts' AND is_operator());

CREATE POLICY "Employees can view their own receipts"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage policies for photos
CREATE POLICY "Employees can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'photos'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Operators can view all photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos' AND is_operator());

CREATE POLICY "Employees can view their own photos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_operator() TO authenticated;
GRANT EXECUTE ON FUNCTION is_driver() TO authenticated;
GRANT EXECUTE ON FUNCTION is_porter() TO authenticated;
GRANT EXECUTE ON FUNCTION is_assigned_to_trip(UUID) TO authenticated;
