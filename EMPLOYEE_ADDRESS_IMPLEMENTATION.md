# Employee Address Form - Structured Implementation

## Overview
Complete redesign of the employee address system from a single text field to a structured, validated address form with Philippine location hierarchy.

## Implementation Date
August 24, 2026

## Key Changes

### 1. Country Field - Philippines Only
**Decision**: All employees must be in the Philippines
- Country field is **read-only** and always displays "Philippines 🇵🇭"
- No country selector modal (removed to avoid layout issues)
- `country_code` is automatically set to "PH"
- `country` is automatically set to "Philippines"

### 2. Structured Address Fields

#### Required Fields:
1. **Province/Region** - Searchable dropdown (13 provinces)
2. **City/Municipality** - Searchable dropdown (63 cities, filtered by province)
3. **Barangay** - Searchable dropdown (400+ barangays, filtered by city)
4. **Postal Code** - 4-digit Philippine postal code (auto-suggested)
5. **Address Line 1** - House/Unit, Building, Street, Subdivision
6. **Address Line 2** - Optional landmark or additional directions

#### Dependent Field Behavior:
- Province → loads cities for that province
- City → loads barangays for that city
- City → auto-suggests postal code
- Changing province clears city, barangay, and postal code
- Changing city clears barangay

### 3. Database Schema

#### New Columns (migration: `20260824000001_add_structured_address.sql`):
```sql
country TEXT                    -- Always "Philippines"
country_code TEXT              -- Always "PH"
province TEXT
province_code TEXT             -- PSGC code
city TEXT
city_code TEXT                 -- PSGC code
barangay TEXT
barangay_code TEXT             -- PSGC code
postal_code TEXT               -- 4 digits
address_line_1 TEXT            -- Required
address_line_2 TEXT            -- Optional
formatted_address TEXT         -- Auto-generated
address_is_legacy BOOLEAN      -- Migration flag
```

#### Legacy Support:
- Old `address` field preserved for backward compatibility
- Legacy addresses flagged with `address_is_legacy = TRUE`
- Migration helper function: `mark_legacy_addresses()`

### 4. Components

#### AddressFormSection (`src/components/forms/AddressFormSection.tsx`)
- Read-only country display
- Dependent Province → City → Barangay selectors
- Auto-suggest postal code
- Real-time formatted address preview
- Loading states for each selector
- Field-specific error messages

#### SearchableSelect (`src/components/forms/SearchableSelect.tsx`)
- Mobile-friendly modal-based selector
- Search functionality
- Loading/empty states
- Keyboard navigation support
- Accessibility labels

### 5. Data Sources

#### Philippine Location Data (`src/data/locations/philippines.ts`)
Based on Philippine Standard Geographic Code (PSGC):

**Coverage:**
- **13 provinces**: NCR, Cavite, Laguna, Batangas, Rizal, Quezon, Bulacan, Pampanga, Tarlac, Nueva Ecija, Zambales, Bataan, Aurora
- **63 cities/municipalities**: Complete for Cavite, major cities for other provinces
- **400+ barangays**: All 97 barangays for Imus, comprehensive for Bacoor, samples for major cities
- **Postal codes**: Mapped to cities

**Complete Imus Barangays** (97 total):
- Alapan I-A through Alapan II-B
- Anabu I-A through Anabu II-F
- Bayan Luma I through IX
- Bucandala I through V
- All Poblacion zones
- Malagasang, Medicion, Palico, Toclong zones
- And more...

### 6. Location Service (`src/services/location.service.ts`)

**Functions:**
- `getProvinces()` - Get all Philippine provinces
- `getCities(provinceCode)` - Get cities for a province
- `getBarangays(cityCode)` - Get barangays for a city
- `searchProvinces/Cities/Barangays()` - Search with caching
- `validateLocationHierarchy()` - Ensure city belongs to province, barangay to city
- `validatePostalCode()` - Validate format and city match
- `formatAddress()` - Generate formatted complete address
- `parseLegacyAddress()` - Attempt to parse old addresses (best-effort)

### 7. Validation

#### Field Validation:
- **Province/City/Barangay**: Required, must select from valid options
- **Postal Code**: Must be exactly 4 digits (e.g., "4103")
- **Address Line 1**: Minimum 5 characters, required
- **Address Line 2**: Optional, max 200 characters
- **Location Hierarchy**: City must belong to province, barangay to city

#### Error Messages:
- "Select a province or region"
- "Select a city or municipality"
- "Select a barangay"
- "Enter a valid postal code"
- "This city does not belong to the selected province"
- "This barangay does not belong to the selected city"

### 8. Screens Updated

#### Add Employee (`app/(operator)/employees/add.tsx`)
- Replaced single address field with `AddressFormSection`
- Default values: country="Philippines", country_code="PH"
- All structured fields included in form submission

#### Edit Employee (`app/(operator)/employees/edit/[id].tsx`)
- NEW SCREEN - Complete edit form with structured address
- Loads existing structured or legacy addresses
- Shows warning for legacy addresses
- Full validation on update

#### Employee Detail (`app/(operator)/employees/[id].tsx`)
- Displays `formatted_address` when available
- Falls back to legacy `address` field
- Uses `getDisplayAddress()` helper function

### 9. Service Layer (`src/services/api/employee.service.ts`)

#### createEmployee():
- Generates `formatted_address` from structured fields
- Inserts all 13 address columns
- Sets `address_is_legacy = false`
- Handles errors gracefully

#### updateEmployee():
- Regenerates `formatted_address` when address fields updated
- Preserves legacy addresses if not updated
- Validates structured data before save

### 10. Display Format

**Formatted Address Example:**
```
Block 3 Lot 15, Treelane 3 Subdivision, Anabu I-A, Imus City, Cavite, 4103, Philippines
```

**With Address Line 2:**
```
Block 3 Lot 15, Treelane 3 Subdivision, Near SM Imus, Anabu I-A, Imus City, Cavite, 4103, Philippines
```

## Benefits

### Data Quality
✅ No more incomplete addresses like "Treelane 3, Imus, Cavite"
✅ Validated location hierarchy
✅ Standardized postal codes
✅ Structured data for analytics

### User Experience
✅ Guided input with dropdowns instead of free text
✅ Search functionality in all selectors
✅ Auto-suggest postal code
✅ Real-time address preview
✅ Clear error messages

### Developer Experience
✅ Full TypeScript type safety
✅ Comprehensive validation
✅ Easy to query by location
✅ Migration path for legacy data
✅ Well-documented code

## Migration Guide

### For Existing Employees

1. **Run the migration:**
   ```sql
   -- Apply migration
   psql -d vone_trucking -f supabase/migrations/20260824000001_add_structured_address.sql
   
   -- Mark legacy addresses
   SELECT * FROM mark_legacy_addresses();
   ```

2. **Check address status:**
   ```sql
   SELECT * FROM v_employee_address_status 
   WHERE address_type = 'legacy';
   ```

3. **Update via UI:**
   - Operators can edit employees with legacy addresses
   - Form shows warning: "This employee has a legacy address format"
   - Update to structured format using the form
   - `address_is_legacy` automatically set to FALSE on save

### For Developers

**When creating employees:**
```typescript
const employeeData = {
  // ... other fields
  country: 'Philippines',
  country_code: 'PH',
  province: 'Cavite',
  province_code: '0434000',
  city: 'Imus',
  city_code: '043405',
  barangay: 'Anabu I-A',
  barangay_code: '043405006',
  postal_code: '4103',
  address_line_1: 'Block 3 Lot 15, Treelane 3 Subdivision',
  address_line_2: 'Near SM Imus', // optional
};
```

**Display addresses:**
```typescript
import { getDisplayAddress } from '@/types/employee.types';

// Prefers formatted_address, falls back to legacy address
const displayAddress = getDisplayAddress(employee);
```

## Testing Checklist

- [x] Province dropdown loads 13 Philippine provinces
- [x] City dropdown filters by selected province
- [x] Barangay dropdown filters by selected city
- [x] Postal code auto-suggests based on city
- [x] Changing province clears dependent fields
- [x] Search works in all dropdowns
- [x] Formatted address preview updates in real-time
- [x] Form validation shows specific errors
- [x] Add Employee creates structured address
- [x] Edit Employee loads and updates structured address
- [x] Employee Detail displays formatted address
- [x] Legacy addresses preserved and flagged
- [x] TypeScript compilation passes
- [x] Database constraints work correctly

## Known Limitations

1. **Location Data Coverage:**
   - Comprehensive for Cavite (all cities and many barangays)
   - Major cities only for other provinces
   - Can be extended by adding more data to `philippines.ts`

2. **Offline Support:**
   - All location data is local (no API calls)
   - Works completely offline
   - No internet required for address entry

3. **International Addresses:**
   - System only supports Philippine addresses
   - Country field is fixed to Philippines
   - Not suitable for international operations

## Future Enhancements

### Possible Additions:
- [ ] GPS coordinates for delivery optimization
- [ ] Map view for address verification
- [ ] Address autocomplete using Google Maps API
- [ ] Batch address update tool for operators
- [ ] Address validation against postal service data
- [ ] Export employees by location
- [ ] Location-based reporting

### Data Expansion:
- [ ] Add remaining barangays for all cities
- [ ] Include all municipalities in covered provinces
- [ ] Add more provinces beyond initial 13
- [ ] Include alternative barangay names
- [ ] Add ZIP+4 extended postal codes

## Support

For issues or questions:
1. Check the validation error messages
2. Review the formatted address preview
3. Verify location data in `philippines.ts`
4. Check migration status in database
5. Review employee service logs

## Files Modified

1. `src/data/locations/philippines.ts` (NEW)
2. `src/services/location.service.ts` (NEW)
3. `src/components/forms/SearchableSelect.tsx` (NEW)
4. `src/components/forms/AddressFormSection.tsx` (NEW)
5. `src/components/forms/index.ts`
6. `src/types/employee.types.ts`
7. `src/validation/schemas/employee.schema.ts`
8. `src/services/api/employee.service.ts`
9. `supabase/migrations/20260824000001_add_structured_address.sql` (NEW)
10. `app/(operator)/employees/add.tsx`
11. `app/(operator)/employees/edit/[id].tsx` (NEW)
12. `app/(operator)/employees/[id].tsx`

---

**Implementation Status**: ✅ Complete and Production Ready

**Last Updated**: August 24, 2026
