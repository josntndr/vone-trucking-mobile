# Philippine Address System Implementation

## Overview

Complete restructuring of the employee address system to follow the proper Philippine Standard Geographic Code (PSGC) hierarchy with separate Region and Province fields.

**PSGC Version**: Q4 2023 (Latest PSA release)  
**Source**: Philippine Statistics Authority (PSA)

## Proper Address Hierarchy

```
Country
  ├── Region (17 regions)
  │   ├── Province (81 provinces) [Optional for NCR]
  │   │   ├── City/Municipality (1,634 total)
  │   │   │   └── Barangay (42,046 total)
```

### Key Changes from Previous Implementation

| Old Structure | New Structure | Notes |
|--------------|---------------|-------|
| Province/Region (combined) | Region + Province (separate) | Properly follows PSGC |
| Province required for all | Province optional for NCR | NCR has no provinces |
| Limited location data | Comprehensive PSGC data | All 17 regions, 81 provinces |
| "Baranggay" (typo) | "Barangay" (correct) | Fixed spelling |

## Files Implemented

### 1. Location Data (`src/data/locations/philippines-complete.ts`)

**Contains:**
- All 17 Philippine Regions
- All 81 Provinces with region mapping
- Comprehensive Cities and Municipalities for:
  - **NCR** (17 cities, no provinces)
  - **CALABARZON** (All cities/municipalities in Cavite, Laguna, Batangas, Rizal, Quezon)
  - **Central Luzon** (Major cities in Bulacan, Pampanga, etc.)
- Sample Barangays for major cities
- Extensible structure for complete PSGC data

**Key Interfaces:**
```typescript
Region {
  code: string;
  name: string;
  hasProvinces: boolean; // false for NCR
}

Province {
  code: string;
  name: string;
  regionCode: string;
}

City {
  code: string;
  name: string;
  type: 'highly_urbanized_city' | 'independent_component_city' | 'component_city' | 'municipality';
  regionCode: string;
  provinceCode?: string; // Optional - NCR cities don't have provinces
  postalCodes?: string[];
}

Barangay {
  code: string;
  name: string;
  cityCode: string;
}
```

### 2. Location Service (`src/services/location.service.ts`)

**Functions:**

#### Country Functions
- `getCountries()`: Get all countries
- `getCountryByCode(code)`: Find country by ISO code
- `searchCountries(query)`: Search countries

#### Region Functions
- `getRegions(countryCode)`: Get all regions for a country
- `getRegionByCode(code)`: Find region by code
- `searchRegions(query, countryCode)`: Search regions
- `regionHasProvinces(code)`: Check if region requires province (false for NCR)

#### Province Functions
- `getProvinces(regionCode)`: Get provinces for a region
- `getProvinceByCode(code)`: Find province by code
- `searchProvinces(query, regionCode)`: Search provinces
- **Returns empty array for NCR** (region code '13')

#### City/Municipality Functions
- `getCities({ regionCode, provinceCode })`: Get cities
  - For NCR: Returns cities directly under region (no province filter)
  - For other regions: Returns cities under province
- `getCityByCode(code)`: Find city by code
- `searchCities(query, params)`: Search cities

#### Barangay Functions
- `getBarangays(cityCode)`: Get barangays for a city
- `getBarangayByCode(code)`: Find barangay by code
- `searchBarangays(query, cityCode)`: Search barangays

#### Validation
- `validateAddress(address)`: Validates complete address hierarchy
  - Checks region belongs to country
  - Checks province belongs to region (or NULL for NCR)
  - Checks city belongs to province/region
  - Checks barangay belongs to city
  - Returns validation errors with specific messages
- `validatePostalCode(code, country)`: Validates postal code format

#### Formatting
- `formatAddress(options)`: Formats address properly
  - **Handles NCR**: Omits province for NCR addresses
  - **Handles other regions**: Includes province
  - Example NCR: "123 Main St, Bagong Silang, Quezon City, NCR, 1100, Philippines"
  - Example CALABARZON: "456 St, Anabu I-A, Imus, Cavite, CALABARZON, 4103, Philippines"

#### Legacy Migration
- `parseLegacyAddress(legacyAddress)`: Attempts to parse old single-string addresses
- `isLocationDataComplete(regionCode, provinceCode)`: Checks if location data is available

### 3. Employee Types (`src/types/employee.types.ts`)

**Updated Interfaces:**

```typescript
export interface StructuredAddress {
  // Country (required)
  country: string;
  country_code: string;
  
  // Region (required) - separate from Province
  region: string;
  region_code: string;
  
  // Province (optional - not applicable for NCR)
  province?: string;
  province_code?: string;
  
  // City/Municipality (required)
  city: string;
  city_code: string;
  
  // Barangay (required)
  barangay: string;
  barangay_code: string;
  
  // Other fields
  postal_code: string;
  address_line_1: string;
  address_line_2?: string;
  formatted_address: string;
  is_legacy?: boolean;
}

export interface Employee {
  // ... existing fields ...
  
  // Structured Address Fields
  country?: string;
  country_code?: string;
  region?: string;
  region_code?: string;
  province?: string;       // Optional - NULL for NCR
  province_code?: string;
  city?: string;
  city_code?: string;
  barangay?: string;
  barangay_code?: string;
  postal_code?: string;
  address_line_1?: string;
  address_line_2?: string;
  formatted_address?: string;
  address_is_legacy?: boolean;
}
```

### 4. Database Migrations

#### Migration 1: `20260824000001_add_structured_address.sql`
- Adds base structured address columns to `employee_profiles` table
- Creates indexes for performance
- Adds validation constraints
- Creates `generate_formatted_address()` function
- Creates trigger to auto-update formatted address
- Adds `v_employee_address_status` view

#### Migration 2: `20260824000002_add_region_field.sql`
- Adds `region` and `region_code` columns
- Updates `generate_formatted_address()` to handle NCR (no province)
- Updates indexes to include region
- Updates validation to ensure NCR has no province
- Updates views and triggers

## NCR (National Capital Region) Handling

### Special Case: No Provinces

NCR is the only region in the Philippines without provinces. All 17 cities are directly under the region.

**Implementation:**
```typescript
// Region definition
{ code: '13', name: 'NCR (National Capital Region)', hasProvinces: false }

// Cities in NCR
{ 
  code: '137402', 
  name: 'Quezon City', 
  type: 'highly_urbanized_city', 
  regionCode: '13',
  provinceCode: undefined // No province
}
```

**Form Behavior:**
1. When NCR is selected as Region:
   - Province field becomes disabled or hidden
   - Show message: "Province does not apply to NCR"
   - City selector shows NCR cities directly
2. Validation:
   - Province is NOT required for NCR
   - Province must be NULL/undefined for NCR
3. Formatted Address:
   - Omits province: "Address, Barangay, City, NCR, Postal, Philippines"

## Dependent Selector Flow

```
Country (Philippines) 
  ↓ (enables)
Region (e.g., CALABARZON)
  ↓ (enables, filters by region)
Province (e.g., Cavite)
  ↓ (enables, filters by province)
City/Municipality (e.g., Imus)
  ↓ (enables, filters by city)
Barangay (e.g., Anabu I-A)
```

**Clearing Behavior:**
- Changing Country → clears Region, Province, City, Barangay, Postal Code
- Changing Region → clears Province, City, Barangay, Postal Code
- Changing Province → clears City, Barangay, Postal Code
- Changing City → clears Barangay, Postal Code

## Validation Rules

### Required Fields (for Philippines)
- ✅ Country (always required)
- ✅ Region (always required)
- ⚠️ Province (required EXCEPT for NCR)
- ✅ City/Municipality (always required)
- ✅ Barangay (always required)
- ✅ Postal Code (always required)
- ✅ Address Line 1 (always required)
- ⭕ Address Line 2 (optional)

### Validation Messages
- "Select a region"
- "Select a province" (only for non-NCR regions)
- "Province does not apply to this location" (for NCR)
- "This province does not belong to the selected region"
- "This city does not belong to the selected province"
- "This barangay does not belong to the selected city"

## Data Completeness

### Current Coverage

| Region | Provinces | Cities | Barangays | Status |
|--------|-----------|--------|-----------|--------|
| NCR | 0 (N/A) | 17 | Sample | ✅ Complete structure |
| CALABARZON | 5 | ~120 | Sample | ✅ Complete structure |
| Central Luzon | 7 | ~50 | Sample | ⚠️ Major cities only |
| Other Regions | 69 | Limited | Limited | ⭕ Structure ready, needs data |

### Extending the Dataset

The data structure supports the complete PSGC dataset (42,046 barangays). To add more:

1. **Add Provinces**: Already complete (all 81 provinces included)
2. **Add Cities/Municipalities**: Add to `CITIES` array in `philippines-complete.ts`
3. **Add Barangays**: Add to `BARANGAYS` array

**Data Source**: Download complete PSGC from PSA website and convert to TypeScript format.

## Still To Implement

### 1. UI Components (HIGH PRIORITY)

Update `AddressFormSection.tsx` component:
- [ ] Split Province/Region into two separate fields
- [ ] Add Region selector (appears after Country)
- [ ] Update Province selector (appears after Region)
- [ ] Handle NCR case (hide/disable Province field)
- [ ] Show "Province does not apply" message for NCR
- [ ] Update field labels:
  - "Region *"
  - "Province *" (with conditional requirement)
  - "City/Municipality *"
  - "Barangay *"
- [ ] Fix "Baranggay" → "Barangay" spelling

### 2. Validation Schemas

Update `src/validation/schemas/employee.schema.ts`:
- [ ] Add `region` and `region_code` validation
- [ ] Make `province` conditionally required (not for NCR)
- [ ] Update validation messages
- [ ] Add NCR-specific validation logic

### 3. Employee Service

Update `src/services/api/employee.service.ts`:
- [ ] Handle region/province fields in create/update
- [ ] Use `formatAddress()` from location service
- [ ] Handle legacy address migration

### 4. Add/Edit Employee Screens

Update forms:
- [ ] `app/(operator)/employees/add.tsx`
- [ ] `app/(operator)/employees/edit/[id].tsx`
- [ ] `app/(operator)/employees/[id].tsx` (detail view)

### 5. Testing

Test all combinations:
- [ ] NCR address (no province)
- [ ] CALABARZON address (with province)
- [ ] Other regions (with province)
- [ ] Legacy address migration
- [ ] Form validation
- [ ] Address formatting

### 6. Complete PSGC Data (OPTIONAL)

For production-ready completeness:
- [ ] Add all 1,634 cities/municipalities
- [ ] Add all 42,046 barangays
- [ ] Or implement dynamic loading/API for large datasets

## Country Selection

The system supports international addresses:

```typescript
export const COUNTRIES: Country[] = [
  { code: 'PH', name: 'Philippines' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  // Add more as needed
];
```

**Behavior:**
- Philippines is the default
- All countries remain searchable and selectable
- For non-PH countries:
  - Region/Province/City/Barangay selectors can be adapted
  - Or provide manual text entry fallback
  - Postal code validation adjusts per country

## Migration Path for Legacy Addresses

1. **Preserve Legacy Data**: Old `address` field remains intact
2. **Flag Legacy Records**: `address_is_legacy = TRUE`
3. **Display Priority**: Show `formatted_address` if available, else `address`
4. **Operator Review**: Provide UI to convert legacy → structured
5. **Validation**: `parseLegacyAddress()` attempts automatic matching
6. **Manual Entry**: Operators verify and save structured address

## Database Schema

```sql
-- employee_profiles table (simplified)
CREATE TABLE employee_profiles (
  -- ... existing fields ...
  
  -- Structured Address
  country TEXT,
  country_code TEXT,
  region TEXT,                    -- New field
  region_code TEXT,               -- New field
  province TEXT,                  -- Optional for NCR
  province_code TEXT,
  city TEXT,
  city_code TEXT,
  barangay TEXT,
  barangay_code TEXT,
  postal_code TEXT,
  address_line_1 TEXT,
  address_line_2 TEXT,
  formatted_address TEXT,         -- Auto-generated
  address_is_legacy BOOLEAN,
  
  -- Legacy
  address TEXT                    -- Kept for backward compatibility
);
```

## Verification Checklist

Before considering complete:

- [ ] Region and Province appear as **separate** fields
- [ ] All 17 Philippine Regions are available
- [ ] All 81 Provinces are available under correct regions
- [ ] NCR works without province (field disabled/hidden)
- [ ] Changing Region clears Province, City, Barangay
- [ ] Search works for all location types
- [ ] Selectors stay inside mobile app (390px)
- [ ] No emojis in UI (using Ionicons)
- [ ] Address preview shows correct hierarchy
- [ ] Form validates NCR correctly (no province error)
- [ ] Legacy addresses remain accessible
- [ ] No TypeScript/runtime errors

## Example Addresses

### NCR Address (No Province)
```
123 Main Street
Apartment 5B
Bagong Silang
Quezon City
NCR (National Capital Region)
1100
Philippines
```

**Formatted**: "123 Main Street, Apartment 5B, Bagong Silang, Quezon City, NCR, 1100, Philippines"

### CALABARZON Address (With Province)
```
456 Subdivision Road
Lot 10 Block 5
Anabu I-A
Imus
Cavite
Region IV-A (CALABARZON)
4103
Philippines
```

**Formatted**: "456 Subdivision Road, Lot 10 Block 5, Anabu I-A, Imus, Cavite, CALABARZON, 4103, Philippines"

## API Reference

### Location Service Quick Reference

```typescript
// Get regions for Philippines
const regions = getRegions('PH');

// Check if region has provinces
const hasProvinces = regionHasProvinces('13'); // false for NCR

// Get provinces for a region (empty for NCR)
const provinces = getProvinces('04'); // CALABARZON provinces

// Get cities for NCR (no province needed)
const ncrCities = getCities({ regionCode: '13' });

// Get cities for a province
const caviteCities = getCities({ provinceCode: '0434' });

// Validate complete address
const validation = validateAddress({
  countryCode: 'PH',
  regionCode: '13',
  provinceCode: undefined, // OK for NCR
  cityCode: '137402',
  barangayCode: '137402001'
});

// Format address (handles NCR automatically)
const formatted = formatAddress({
  countryName: 'Philippines',
  regionCode: '13',
  regionName: 'NCR',
  // province omitted for NCR
  cityName: 'Quezon City',
  barangayName: 'Bagong Silang',
  postalCode: '1100',
  addressLine1: '123 Main St'
});
```

## Next Steps

1. ✅ **DONE**: Create complete PSGC data structure
2. ✅ **DONE**: Implement location service with NCR handling
3. ✅ **DONE**: Update employee types with Region/Province separation
4. ✅ **DONE**: Create database migrations
5. ⏳ **TODO**: Update AddressFormSection component (UI)
6. ⏳ **TODO**: Update validation schemas
7. ⏳ **TODO**: Update employee service
8. ⏳ **TODO**: Update Add/Edit Employee screens
9. ⏳ **TODO**: Test complete flow

## Technical Notes

- All location codes are PSGC official codes
- Data can be updated by replacing arrays in `philippines-complete.ts`
- Service functions are cached for performance
- Validation is hierarchy-aware
- NCR handling is automatic (checks region code '13')
- Formatted address generation respects regional differences
- Legacy migration preserves existing data

## References

- **PSA PSGC**: https://psa.gov.ph/classification/psgc/
- **PSGC Publications**: Download quarterly updates
- **Region Codes**: 01-17 (NCR is 13)
- **Province Codes**: 4-6 digit codes
- **City/Municipality Codes**: 6 digit codes
- **Barangay Codes**: 9 digit codes

---

**Status**: Core infrastructure complete. UI components and validation need updating.  
**Last Updated**: 2026-08-24
