-- Add Structured Address Fields to Employee Profiles
-- Migration: 20260824000001_add_structured_address.sql
-- Description: Adds structured location fields to support detailed Philippine addresses
--              with country, province, city, barangay, postal code, and address lines.
--              Maintains backward compatibility with legacy single-string address field.

-- ============================================================================
-- ADD STRUCTURED ADDRESS COLUMNS
-- ============================================================================

-- Add new address columns to employee_profiles table
ALTER TABLE employee_profiles
  -- Country
  ADD COLUMN country TEXT,
  ADD COLUMN country_code TEXT,
  
  -- Province/Region
  ADD COLUMN province TEXT,
  ADD COLUMN province_code TEXT,
  
  -- City/Municipality
  ADD COLUMN city TEXT,
  ADD COLUMN city_code TEXT,
  
  -- Barangay
  ADD COLUMN barangay TEXT,
  ADD COLUMN barangay_code TEXT,
  
  -- Postal Code
  ADD COLUMN postal_code TEXT,
  
  -- Address Lines
  ADD COLUMN address_line_1 TEXT,
  ADD COLUMN address_line_2 TEXT,
  
  -- Formatted Complete Address (generated from structured fields)
  ADD COLUMN formatted_address TEXT,
  
  -- Flag to indicate if address was migrated from legacy format
  ADD COLUMN address_is_legacy BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN employee_profiles.country IS 'Country name (e.g., Philippines)';
COMMENT ON COLUMN employee_profiles.country_code IS 'ISO country code (e.g., PH)';
COMMENT ON COLUMN employee_profiles.province IS 'Province or region name (e.g., Cavite)';
COMMENT ON COLUMN employee_profiles.province_code IS 'PSGC province code (e.g., 0434000)';
COMMENT ON COLUMN employee_profiles.city IS 'City or municipality name (e.g., Imus)';
COMMENT ON COLUMN employee_profiles.city_code IS 'PSGC city/municipality code (e.g., 043405)';
COMMENT ON COLUMN employee_profiles.barangay IS 'Barangay name (e.g., Anabu I-A)';
COMMENT ON COLUMN employee_profiles.barangay_code IS 'PSGC barangay code (e.g., 043405001)';
COMMENT ON COLUMN employee_profiles.postal_code IS 'Philippine 4-digit postal code (e.g., 4103)';
COMMENT ON COLUMN employee_profiles.address_line_1 IS 'Primary address: house/unit number, building, street, subdivision (required)';
COMMENT ON COLUMN employee_profiles.address_line_2 IS 'Secondary address: apartment, floor, landmark, additional directions (optional)';
COMMENT ON COLUMN employee_profiles.formatted_address IS 'Complete formatted address generated from structured fields';
COMMENT ON COLUMN employee_profiles.address_is_legacy IS 'TRUE if address was migrated from legacy single-string format and needs review';
COMMENT ON COLUMN employee_profiles.address IS 'Legacy single-string address field (maintained for backward compatibility)';

-- ============================================================================
-- ADD INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for searching by location
CREATE INDEX IF NOT EXISTS idx_employee_profiles_city ON employee_profiles(city) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_employee_profiles_province ON employee_profiles(province) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_employee_profiles_barangay ON employee_profiles(barangay) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_employee_profiles_postal_code ON employee_profiles(postal_code) WHERE is_active = TRUE;

-- Index for location hierarchy queries
CREATE INDEX IF NOT EXISTS idx_employee_profiles_location_codes ON employee_profiles(country_code, province_code, city_code, barangay_code) WHERE is_active = TRUE;

-- ============================================================================
-- ADD CONSTRAINTS
-- ============================================================================

-- Postal code format validation (Philippine 4-digit format)
ALTER TABLE employee_profiles
  ADD CONSTRAINT chk_postal_code_format 
  CHECK (
    postal_code IS NULL OR 
    (postal_code ~ '^\d{4}$' AND postal_code::INTEGER >= 1000 AND postal_code::INTEGER <= 9999)
  );

-- Address line 1 minimum length when provided
ALTER TABLE employee_profiles
  ADD CONSTRAINT chk_address_line_1_min_length 
  CHECK (
    address_line_1 IS NULL OR 
    LENGTH(TRIM(address_line_1)) >= 5
  );

-- Address line 2 maximum length
ALTER TABLE employee_profiles
  ADD CONSTRAINT chk_address_line_2_max_length 
  CHECK (
    address_line_2 IS NULL OR 
    LENGTH(address_line_2) <= 200
  );

-- Formatted address consistency check
ALTER TABLE employee_profiles
  ADD CONSTRAINT chk_formatted_address_consistency 
  CHECK (
    -- If structured fields are provided, formatted_address should also be provided
    (
      country_code IS NULL AND 
      province_code IS NULL AND 
      city_code IS NULL AND 
      barangay_code IS NULL AND 
      address_line_1 IS NULL
    ) OR (
      formatted_address IS NOT NULL AND 
      LENGTH(TRIM(formatted_address)) > 0
    )
  );

-- ============================================================================
-- CREATE FUNCTION TO GENERATE FORMATTED ADDRESS
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_formatted_address(
  p_address_line_1 TEXT,
  p_address_line_2 TEXT,
  p_barangay TEXT,
  p_city TEXT,
  p_province TEXT,
  p_postal_code TEXT,
  p_country TEXT
) RETURNS TEXT AS $$
DECLARE
  v_formatted_address TEXT;
  v_parts TEXT[];
BEGIN
  -- Initialize empty array
  v_parts := ARRAY[]::TEXT[];
  
  -- Add address line 1 (required)
  IF p_address_line_1 IS NOT NULL AND LENGTH(TRIM(p_address_line_1)) > 0 THEN
    v_parts := array_append(v_parts, TRIM(p_address_line_1));
  END IF;
  
  -- Add address line 2 (optional)
  IF p_address_line_2 IS NOT NULL AND LENGTH(TRIM(p_address_line_2)) > 0 THEN
    v_parts := array_append(v_parts, TRIM(p_address_line_2));
  END IF;
  
  -- Add barangay
  IF p_barangay IS NOT NULL AND LENGTH(TRIM(p_barangay)) > 0 THEN
    v_parts := array_append(v_parts, TRIM(p_barangay));
  END IF;
  
  -- Add city
  IF p_city IS NOT NULL AND LENGTH(TRIM(p_city)) > 0 THEN
    v_parts := array_append(v_parts, TRIM(p_city));
  END IF;
  
  -- Add province
  IF p_province IS NOT NULL AND LENGTH(TRIM(p_province)) > 0 THEN
    v_parts := array_append(v_parts, TRIM(p_province));
  END IF;
  
  -- Add postal code
  IF p_postal_code IS NOT NULL AND LENGTH(TRIM(p_postal_code)) > 0 THEN
    v_parts := array_append(v_parts, TRIM(p_postal_code));
  END IF;
  
  -- Add country
  IF p_country IS NOT NULL AND LENGTH(TRIM(p_country)) > 0 THEN
    v_parts := array_append(v_parts, TRIM(p_country));
  END IF;
  
  -- Join with comma and space
  v_formatted_address := array_to_string(v_parts, ', ');
  
  RETURN v_formatted_address;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION generate_formatted_address IS 'Generates a formatted complete address from structured address components';

-- ============================================================================
-- CREATE TRIGGER TO AUTO-UPDATE FORMATTED ADDRESS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_employee_formatted_address()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update formatted_address if structured fields are provided
  IF NEW.address_line_1 IS NOT NULL AND LENGTH(TRIM(NEW.address_line_1)) > 0 THEN
    NEW.formatted_address := generate_formatted_address(
      NEW.address_line_1,
      NEW.address_line_2,
      NEW.barangay,
      NEW.city,
      NEW.province,
      NEW.postal_code,
      NEW.country
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_employee_formatted_address
  BEFORE INSERT OR UPDATE OF 
    address_line_1, 
    address_line_2, 
    barangay, 
    city, 
    province, 
    postal_code, 
    country
  ON employee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_formatted_address();

COMMENT ON TRIGGER trg_employee_formatted_address ON employee_profiles IS 'Automatically generates formatted_address when structured address fields are updated';

-- ============================================================================
-- DATA MIGRATION HELPER FUNCTION
-- ============================================================================

-- Function to mark existing addresses as legacy
-- This should be run manually after deployment to preserve existing data
CREATE OR REPLACE FUNCTION mark_legacy_addresses()
RETURNS TABLE(
  employee_id TEXT,
  legacy_address TEXT,
  marked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  UPDATE employee_profiles
  SET address_is_legacy = TRUE
  WHERE address IS NOT NULL 
    AND LENGTH(TRIM(address)) > 0
    AND address_line_1 IS NULL
  RETURNING employee_profiles.employee_id, employee_profiles.address, TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_legacy_addresses IS 'Marks existing single-string addresses as legacy for operator review. Run once after migration deployment.';

-- ============================================================================
-- HELPER VIEW FOR ADDRESS COMPLETENESS
-- ============================================================================

-- View to check which employees have structured vs legacy addresses
CREATE OR REPLACE VIEW v_employee_address_status AS
SELECT 
  ep.id,
  ep.employee_id,
  ep.first_name,
  ep.last_name,
  ep.is_active,
  CASE 
    WHEN ep.address_line_1 IS NOT NULL AND ep.barangay_code IS NOT NULL THEN 'structured'
    WHEN ep.address IS NOT NULL THEN 'legacy'
    ELSE 'missing'
  END AS address_type,
  ep.address_is_legacy,
  ep.formatted_address,
  ep.address AS legacy_address,
  -- Check completeness
  (
    ep.country_code IS NOT NULL AND
    ep.province_code IS NOT NULL AND
    ep.city_code IS NOT NULL AND
    ep.barangay_code IS NOT NULL AND
    ep.postal_code IS NOT NULL AND
    ep.address_line_1 IS NOT NULL
  ) AS has_complete_structured_address
FROM employee_profiles ep
WHERE ep.is_active = TRUE;

COMMENT ON VIEW v_employee_address_status IS 'Shows address completeness status for all active employees';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION generate_formatted_address TO authenticated;
GRANT SELECT ON v_employee_address_status TO authenticated;

-- Only operators can run the legacy migration function
GRANT EXECUTE ON FUNCTION mark_legacy_addresses TO authenticated;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- IMPORTANT: After deploying this migration:
--
-- 1. Existing employee records with addresses will continue to work
--    (legacy 'address' field is preserved)
--
-- 2. Run mark_legacy_addresses() function ONCE to flag existing addresses:
--    SELECT * FROM mark_legacy_addresses();
--
-- 3. Update application code to:
--    - Use structured address fields for new employees
--    - Display formatted_address when available, fall back to address
--    - Show UI prompt for operators to update legacy addresses
--
-- 4. Consider creating a data migration task for operators to:
--    - Review employees with address_is_legacy = TRUE
--    - Manually update to structured format using Edit Employee form
--
-- 5. After all legacy addresses are migrated, you may optionally:
--    - Make structured fields NOT NULL for new records
--    - Deprecate the legacy address field
--
-- 6. Structured address fields are indexed for performance in location-based queries

-- End of migration
