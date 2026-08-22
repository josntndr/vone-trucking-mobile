# Google Sheets Import Module

Complete documentation for the Vone Trucking Google Sheets delivery schedule import system.

## Overview

The Google Sheets import module allows operators to import delivery schedules from Liwayway's Google Sheets directly into the Vone Trucking system. The module includes OAuth authentication, intelligent column mapping, comprehensive validation, duplicate detection, and complete audit logging.

## Features

### 1. Secure Google OAuth Connection
- Backend-only authentication (credentials never exposed to mobile app)
- Read-only access to Google Sheets
- Connection status tracking
- Easy disconnect functionality

### 2. Spreadsheet Selection
- Lists all accessible Google Sheets
- Multi-sheet spreadsheet support
- Last modified date display
- Refresh capability

### 3. Intelligent Column Mapping
- **Auto-mapping**: Automatically maps columns based on common patterns
- **Manual mapping**: Dropdown selection for each column
- **Preset support**: Save and reuse mappings for different formats
- **Field descriptions**: Helpful information for each Vone field
- **Required field validation**: Ensures all required fields are mapped

### 4. Comprehensive Validation
- **Required field check**: Validates all required data is present
- **Data type validation**: Ensures dates, times, numbers are valid
- **Duplicate detection**: Checks against existing trips and within import
- **Philippine format validation**: Validates plate numbers, phone numbers
- **Row-level issues**: Shows specific problems with each row

### 5. Preview and Selection
- View validation results before importing
- Filter by valid, invalid, or duplicate rows
- Select/deselect rows for import
- Expand rows to see detailed issues
- Override duplicate warnings when necessary

### 6. Import Execution and Reporting
- Batch import of selected rows
- Real-time progress tracking
- Detailed success/failure reporting
- Complete audit log
- Import history with searchable reports

## Workflow

```
1. Connect Google Account
   ↓
2. Select Spreadsheet & Sheet
   ↓
3. Map Columns to Fields
   ↓
4. Preview & Validate Data
   ↓
5. Select Rows to Import
   ↓
6. Execute Import
   ↓
7. View Results & Audit Log
```

## Supported Fields

### Required Fields
- **Delivery Reference**: Unique reference from Liwayway (e.g., DR-2024-001)
- **Delivery Date**: Scheduled delivery date (MM/DD/YYYY or YYYY-MM-DD)
- **Call Time**: Time when team reports (HH:MM or HH:MM AM/PM)
- **Pickup Warehouse**: Warehouse location for pickup
- **Delivery Destination**: Destination name
- **Cargo Description**: Description of products/cargo

### Optional Fields
- **Delivery Address**: Full delivery address
- **Store/Branch Name**: Store or branch identifier
- **Cargo Weight (kg)**: Total weight in kilograms
- **Cargo Volume (m³)**: Total volume in cubic meters
- **Number of Items**: Total items/boxes count
- **Number of Trips**: Number of trips needed
- **Truck Number**: Fleet/unit number
- **Plate Number**: License plate (ABC-1234 format)
- **Driver Name**: Assigned driver
- **Porter/Helper Name**: Assigned porter
- **Expected Income**: Expected income (₱)
- **Special Instructions**: Special handling instructions
- **Delivery Instructions**: Team instructions

## Sample Test Spreadsheet

### Test Scenarios

Create a Google Sheet with these test cases to validate all functionality:

#### Scenario 1: Valid Complete Row
```
Delivery Reference: DR-2024-001
Date: 01/15/2024
Time: 08:00
Warehouse: Liwayway Main Warehouse
Destination: SM Megamall
Store: Building A
Products: Oishi Prawn Crackers, 50 boxes
Weight (kg): 500
Items: 50
Truck: TRK-001
Driver: Juan Cruz
Instructions: Handle with care
```
**Expected**: ✅ Valid - Will be auto-selected for import

#### Scenario 2: Valid Minimal Row (Only Required Fields)
```
Delivery Reference: DR-2024-002
Date: 01/15/2024
Time: 09:00
Warehouse: Liwayway Main
Destination: Robinsons Galleria
Products: Oishi Bread Pan
```
**Expected**: ✅ Valid - Will be auto-selected for import

#### Scenario 3: Missing Required Fields
```
Delivery Reference: [EMPTY]
Date: 01/16/2024
Time: 08:00
Warehouse: [EMPTY]
Destination: SM North
Products: Mixed Products
```
**Expected**: ❌ Invalid - Missing delivery reference and pickup warehouse

#### Scenario 4: Invalid Data Types
```
Delivery Reference: DR-2024-004
Date: 01/16/2024
Time: invalid_time
Warehouse: Liwayway Main
Destination: SM Southmall
Products: Oishi Rinbee
Weight (kg): abc
Items: not_a_number
```
**Expected**: ❌ Invalid - Invalid time format, invalid weight, invalid items

#### Scenario 5: Duplicate Delivery Reference (Existing)
```
Delivery Reference: DR-2024-001
Date: 01/17/2024
Time: 08:00
Warehouse: Liwayway Main
Destination: SM Fairview
Products: Oishi Products
```
**Expected**: ⚠️ Duplicate - Already exists in system (use different reference from Scenario 1)

#### Scenario 6: Duplicate Within Import
```
Row 1:
Delivery Reference: DR-2024-NEW
Date: 01/18/2024
Time: 08:00
Warehouse: Liwayway Main
Destination: SM Manila
Products: Oishi Crackers

Row 2:
Delivery Reference: DR-2024-NEW
Date: 01/18/2024
Time: 10:00
Warehouse: Liwayway Main
Destination: SM Manila
Products: Oishi Crackers
```
**Expected**: ⚠️ Row 2 marked as duplicate of Row 1

#### Scenario 7: Invalid Philippine Formats
```
Delivery Reference: DR-2024-007
Date: 01/19/2024
Time: 08:00
Warehouse: Liwayway Main
Destination: SM Cebu
Products: Oishi Products
Plate Number: INVALID123
```
**Expected**: ⚠️ Warning - Invalid Philippine plate format (should be ABC-1234)

#### Scenario 8: Empty Row
```
[All fields empty]
```
**Expected**: ❌ Invalid - All required fields missing

#### Scenario 9: Past Date Warning
```
Delivery Reference: DR-2024-009
Date: 01/01/2023
Time: 08:00
Warehouse: Liwayway Main
Destination: SM Davao
Products: Oishi Products
```
**Expected**: ⚠️ Warning - Date in the past

#### Scenario 10: Future Date with All Details
```
Delivery Reference: DR-2024-010
Date: 12/31/2024
Time: 14:00
Warehouse: Liwayway Secondary
Destination: Puregold Sta. Mesa
Store: Main Branch
Products: Mixed Oishi Products - 100 boxes
Weight (kg): 1200
Volume (m³): 25
Items: 100
Number of Trips: 2
Truck: TRK-003
Plate Number: XYZ-9876
Driver: Pedro Santos
Porter: Maria Garcia
Expected Income: 15000
Instructions: Deliver before 5pm, fragile items, back entrance only
```
**Expected**: ✅ Valid - Complete entry with all fields

### Sample Spreadsheet Template

Create a Google Sheet named **"Liwayway Delivery Schedule - Test Data"** with these columns:

```
| Delivery Reference | Date       | Time  | Warehouse              | Destination          | Store      | Products                    | Weight (kg) | Items | Truck   | Driver      | Instructions        |
|--------------------|------------|-------|------------------------|----------------------|------------|-----------------------------|-------------|-------|---------|-------------|---------------------|
| DR-2024-001        | 01/15/2024 | 08:00 | Liwayway Main          | SM Megamall          | Building A | Oishi Prawn Crackers        | 500         | 50    | TRK-001 | Juan Cruz   | Handle with care    |
| DR-2024-002        | 01/15/2024 | 09:00 | Liwayway Main          | Robinsons Galleria   |            | Oishi Bread Pan             | 300         | 30    | TRK-002 | Pedro Santos|                     |
| DR-2024-003        | 01/16/2024 | 08:00 | Liwayway Main          | SM North             |            | Mixed Products              | 750         | 80    |         |             | Back entrance       |
| DR-2024-004        | 01/16/2024 | invalid| Liwayway Main         | SM Southmall         |            | Oishi Rinbee                | abc         | xyz   |         |             |                     |
|                    | 01/17/2024 | 08:00 |                        | SM Fairview          |            | Oishi Products              |             |       |         |             |                     |
| DR-2024-001        | 01/18/2024 | 08:00 | Liwayway Main          | SM Megamall          | Building B | Oishi Crackers              | 400         | 40    |         |             |                     |
```

## Backend Requirements

⚠️ **IMPORTANT**: For production deployment, implement these secure backend endpoints:

### Required Supabase Edge Functions

#### 1. Google OAuth Handler
```typescript
// POST /api/google-sheets/auth
// Initiates OAuth flow and returns authorization URL
```

#### 2. OAuth Callback
```typescript
// GET /api/google-sheets/callback
// Handles OAuth callback, stores tokens securely
```

#### 3. List Spreadsheets
```typescript
// GET /api/google-sheets/spreadsheets
// Returns accessible spreadsheets for authenticated user
```

#### 4. Read Spreadsheet
```typescript
// GET /api/google-sheets/read?spreadsheetId=...&sheetName=...
// Returns spreadsheet data (headers and rows)
```

#### 5. Disconnect
```typescript
// POST /api/google-sheets/disconnect
// Revokes Google OAuth token
```

### Database Schema

#### `column_mapping_presets` Table
```sql
CREATE TABLE column_mapping_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL,
  mappings JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  last_used_at TIMESTAMP,
  use_count INTEGER DEFAULT 0
);
```

#### `import_reports` Table
```sql
CREATE TABLE import_reports (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  source TEXT NOT NULL,
  total_rows INTEGER NOT NULL,
  imported_count INTEGER NOT NULL,
  failed_count INTEGER NOT NULL,
  skipped_count INTEGER NOT NULL,
  duplicate_count INTEGER NOT NULL,
  imported_trips JSONB,
  failed_rows JSONB,
  skipped_rows JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  file_name TEXT,
  spreadsheet_name TEXT
);
```

#### `google_sheets_connections` Table
```sql
CREATE TABLE google_sheets_connections (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  google_email TEXT NOT NULL,
  connected_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);
```

## Testing Checklist

### Phase 1: Connection
- [ ] Connect Google account successfully
- [ ] View connection status
- [ ] Disconnect account
- [ ] Handle connection errors gracefully

### Phase 2: Spreadsheet Selection
- [ ] View list of accessible spreadsheets
- [ ] Select spreadsheet with single sheet
- [ ] Select spreadsheet with multiple sheets
- [ ] Select specific sheet from multi-sheet spreadsheet
- [ ] Refresh spreadsheet list
- [ ] Handle no spreadsheets found

### Phase 3: Column Mapping
- [ ] Auto-mapping detects common column patterns
- [ ] Manual mapping allows field selection
- [ ] View sample data for each column
- [ ] Required fields are marked clearly
- [ ] Cannot proceed without all required fields mapped
- [ ] Save column mapping preset
- [ ] Load saved preset
- [ ] View field descriptions

### Phase 4: Validation
- [ ] All rows validated automatically
- [ ] Valid rows auto-selected
- [ ] Invalid rows show specific errors
- [ ] Duplicate trips detected (existing)
- [ ] Duplicate references detected (within import)
- [ ] Data type validation works (dates, times, numbers)
- [ ] Required field validation works
- [ ] Filter by valid/invalid/duplicate
- [ ] Expand/collapse row details
- [ ] Select/deselect individual rows
- [ ] Select all valid rows
- [ ] Deselect all rows

### Phase 5: Import
- [ ] Import selected rows successfully
- [ ] Skip duplicate rows
- [ ] Handle validation errors
- [ ] Show import progress
- [ ] Create trips with correct data
- [ ] Generate trip numbers correctly
- [ ] Handle partial failures gracefully

### Phase 6: Results & History
- [ ] View import results summary
- [ ] See success/warning/error counts
- [ ] Navigate to imported trips
- [ ] View import history
- [ ] View detailed report for each import
- [ ] See imported trips in report
- [ ] See skipped rows with reasons
- [ ] See failed rows with errors
- [ ] Refresh history list

### Phase 7: Error Handling
- [ ] Handle network errors
- [ ] Handle authentication failures
- [ ] Handle spreadsheet read errors
- [ ] Handle validation errors
- [ ] Handle import failures
- [ ] Show user-friendly error messages
- [ ] Allow retry after errors

## Usage Instructions

### For Operators

#### First-Time Setup
1. Navigate to Import section in operator dashboard
2. Tap "Connect Google Sheets"
3. Review permissions and security notice
4. Tap "Connect Google Account"
5. Complete Google OAuth flow in browser
6. Return to app when connection is confirmed

#### Importing a Delivery Schedule

1. **Select Spreadsheet**
   - View list of shared spreadsheets
   - Tap the Liwayway delivery schedule
   - If multiple sheets, select the correct one
   - Tap "Continue to Mapping"

2. **Map Columns**
   - Review auto-mapped columns
   - Adjust mappings using dropdowns if needed
   - Ensure all required fields are mapped
   - Save as preset for future use (optional)
   - Tap "Continue to Preview"

3. **Preview and Validate**
   - Review validation statistics
   - Filter by valid/invalid/duplicate
   - Expand rows to see issues
   - Deselect rows you don't want to import
   - Tap "Import X Trips"

4. **Review Results**
   - Check import summary
   - Note any skipped or failed rows
   - Navigate to trips to assign resources
   - Or start a new import

#### Loading a Saved Preset

1. In the mapping screen, tap "Load Preset"
2. Select your saved preset
3. Mappings applied automatically
4. Adjust if needed
5. Continue to preview

#### Viewing Import History

1. Navigate to Import > History
2. Tap any import to view details
3. See which trips were created
4. Review any errors or skipped rows
5. Use report ID for support inquiries

## Troubleshooting

### "Failed to connect Google account"
- **Cause**: OAuth flow interrupted or network error
- **Solution**: Try again, ensure stable internet connection

### "No spreadsheets found"
- **Cause**: No spreadsheets shared with your Google account
- **Solution**: Ask Liwayway to share their delivery schedule with your email

### "Missing required fields"
- **Cause**: Not all required fields are mapped
- **Solution**: Map delivery reference, date, time, warehouse, destination, and cargo description

### "Duplicate delivery reference"
- **Cause**: Trip with this reference already exists
- **Solution**: Verify if it's truly a duplicate, or use a different reference

### "Invalid date/time format"
- **Cause**: Date or time not in recognized format
- **Solution**: Use MM/DD/YYYY or YYYY-MM-DD for dates, HH:MM for times

### "Failed to import trips"
- **Cause**: Database error or network issue
- **Solution**: Check connection and try again, contact support if persists

## Security Notes

- ✅ Google OAuth handled by secure backend
- ✅ Access tokens never stored in mobile app
- ✅ Read-only access to Google Sheets
- ✅ All API calls authenticated with Supabase RLS
- ✅ Complete audit trail of all imports
- ✅ Connection can be revoked anytime

## Future Enhancements

### Phase 2 Features
- CSV/Excel file upload import
- Email delivery schedule parsing
- Automatic Gmail monitoring
- Schedule recurring imports
- Advanced duplicate resolution
- Bulk edit before import
- Import templates for different clients
- Multi-language column headers
- Custom validation rules
- Export validation report

## Support

For issues with the Google Sheets import module:
1. Check import history for error details
2. Note the import report ID
3. Review this documentation
4. Contact technical support with report ID

---

**Version**: 1.0  
**Last Updated**: January 2024  
**Module Status**: ✅ Complete - Ready for Testing
