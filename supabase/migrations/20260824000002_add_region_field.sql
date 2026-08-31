-- Add Region Field to Employee Profiles (Separate from Province)
-- Migration: 20260824000002_add_region_field.sql
-- Description: Adds separate Region field to support proper Philippine address hierarchy
--              Country → Region → Province → City → Barangay
--              Note: Province is optional for NCR (National Capital Region)

-- ============================================================================
-- ADD REGION COLUMNS
-- ============================================================================

ALTER TABLE employee_profiles
  ADD COLUMN IF NOT EXISTS region TEXT,
  ADD COLUMN IF NOT EXISTS region_code TEXT;

-- ============================================================================
-- UPDATE COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN employee_profiles.region IS 'Region name (e.g., NCR, CALABARZON)';
COMMENT ON COLUMN employee_profiles.region_code IS 'PSG Region code (e.g., 13 for NCR, 04 for CALABARZON)';
COMMENT ON COLUMN employee_profiles.province IS 'Province name - Optional (NULL for NCR and other regions without provinces)';
COMMENT ON COLUMN employee_profiles.province_code IS 'PSGC province code - Optional (NULL for NCR)';

-- ============================================================================
-- UPDATE INDEXES
-- ============================================================================

-- Add region to location hierarchy index
DROP INDEX IF EXISTS idx_employee_profiles_location_codes;
CREATE INDEX IF NOT EXISTS idx_employee_profiles_location_codes 
  ON employee_profiles(country_code, region_code, province_code, city_code, barangay_code) 
  WHERE is_active = TRUE;

-- Add dedicated region index
CREATE INDEX IF NOT EXISTS idx_employee_profiles_region 
  ON employee_profiles(region) 
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_employee_profiles_region_code 
  ON employee_profiles(region_code) 
  WHERE is_active = TRUE;

-- ============================================================================
-- UPDATE FORMATTED ADDRESS FUNCTION
-- ============================================================================

-- Drop and recreate function with region parameter
DROP FUNCTION IF EXISTS generate_formatted_address(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION generate_formatted_address(
  p_address_line_1 TEXT,
  p_address_line_2 TEXT,
  p_barangay TEXT,
  p_city TEXT,
  p_province TEXT,
  p_region TEXT,
  p_region_code TEXT,
  p_postal_code TEXT,
  p_country TEXT
) RETURNS TEXT AS $$
DECLARE
  v_formatted_address TEXT;
  v_parts TEXT[];
  v_include_province BOOLEAN;
BEGIN
  -- Initialize empty array
  v_parts := ARRAY[]::TEXT[];
  
  -- Determine if province should be included
  -- NCR (region code '13') does not have provinces
  v_include_province := (p_region_code IS NULL OR p_region_code != '13');
  
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
  
  -- Add province (only if applicable - not for NCR)
  IF v_include_province AND p_province IS NOT NULL AND LENGTH(TRIM(p_province)) > 0 THEN
    v_parts := array_append(v_parts, TRIM(p_province));
  END IF;
  
  -- Add region
  IF p_region IS NOT NULL AND LENGTH(TRIM(p_region)) > 0 THEN
    v_parts := array_append(v_parts, TRIM(p_region));
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

COMMENT ON FUNCTION generate_formatted_address IS 'Generates formatted address with proper handling of NCR (no province)';

-- ============================================================================
-- UPDATE TRIGGER FUNCTION
-- ============================================================================

DROP FUNCTION IF EXISTS update_employee_formatted_address() CASCADE;

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
      NEW.region,
      NEW.region_code,
      NEW.postal_code,
      NEW.country
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger with updated field list
DROP TRIGGER IF EXISTS trg_employee_formatted_address ON employee_profiles;

CREATE TRIGGER trg_employee_formatted_address
  BEFORE INSERT OR UPDATE OF 
    address_line_1, 
    address_line_2, 
    barangay, 
    city, 
    province,
    region,
    region_code,
    postal_code, 
    country
  ON employee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_employee_formatted_address();

COMMENT ON TRIGGER trg_employee_formatted_address ON employee_profiles IS 'Automatically generates formatted_address with proper Region/Province separation';

-- ============================================================================
-- UPDATE COMPLETENESS CHECK
-- ============================================================================

-- Drop and recreate view with region field
DROP VIEW IF EXISTS v_employee_address_status;

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
  ep.region,
  ep.province,
  -- Check completeness (province is optional for NCR)
  (
    ep.country_code IS NOT NULL AND
    ep.region_code IS NOT NULL AND
    (ep.province_code IS NOT NULL OR ep.region_code = '13') AND  -- Province not required for NCR
    ep.city_code IS NOT NULL AND
    ep.barangay_code IS NOT NULL AND
    ep.postal_code IS NOT NULL AND
    ep.address_line_1 IS NOT NULL
  ) AS has_complete_structured_address,
  -- Indicate if province is required
  (ep.region_code != '13' OR ep.region_code IS NULL) AS province_required
FROM employee_profiles ep
WHERE ep.is_active = TRUE;

COMMENT ON VIEW v_employee_address_status IS 'Shows address completeness status with proper Region/Province separation and NCR handling';

-- ============================================================================
-- VALIDATION FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_employee_address(
  p_region_code TEXT,
  p_province_code TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- NCR (region code '13') should not have a province
  IF p_region_code = '13' THEN
    RETURN p_province_code IS NULL;
  END IF;
  
  -- Other regions should have a province
  IF p_region_code IS NOT NULL AND p_region_code != '13' THEN
    RETURN p_province_code IS NOT NULL;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION validate_employee_address IS 'Validates that NCR addresses have no province and other regions do';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- IMPORTANT: This migration adds Region as a separate field from Province
--
-- Key changes:
-- 1. Region and Province are now separate fields
-- 2. Province is optional for NCR (National Capital Region)
-- 3. Formatted address properly handles NCR (omits province)
-- 4. Validation ensures NCR addresses don't have provinces
-- 5. Other regions must have provinces
--
-- Address hierarchy is now:
-- Country → Region → Province (optional for NCR) → City → Barangay
--
-- Example addresses:
-- - NCR: "123 Main St, Bagong Silang, Quezon City, NCR, 1100, Philippines"
--   (no province)
-- - CALABARZON: "456 Street, Anabu I-A, Imus, Cavite, CALABARZON, 4103, Philippines"
--   (includes province)

-- End of migration
