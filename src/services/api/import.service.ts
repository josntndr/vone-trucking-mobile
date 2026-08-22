/**
 * Import Service
 * Handles Google Sheets import, validation, and trip creation
 * NOTE: Google OAuth and API calls go through secure backend to protect credentials
 */

import { supabase } from './supabase';
import { ApiResponse } from '../../types';
import type {
  ImportSession,
  ImportReport,
  GoogleSpreadsheet,
  GoogleSheetsConnection,
  ColumnMapping,
  ColumnMappingPreset,
  ValidatedRow,
  ValidationIssue,
  ImportSource,
} from '../../types/import.types';
import {
  VoneTruckingField,
  ValidationSeverity,
  validateFieldDataType,
  getRequiredFields,
  FIELD_METADATA,
} from '../../types/import.types';
import { getTrips } from './trip.service';
import { createTrip } from './trip.service';

/**
 * NOTE: In production, implement a secure backend service (e.g., Supabase Edge Functions)
 * to handle Google OAuth and API requests. Never expose Google credentials in the mobile app.
 * 
 * Backend endpoints needed:
 * - POST /api/google-sheets/auth - Initiate OAuth flow
 * - GET /api/google-sheets/callback - Handle OAuth callback
 * - GET /api/google-sheets/spreadsheets - List accessible spreadsheets
 * - GET /api/google-sheets/read - Read spreadsheet data
 * - POST /api/google-sheets/disconnect - Revoke access
 */

/**
 * Connect Google Account (OAuth flow)
 * In production, this would redirect to backend OAuth handler
 */
export const connectGoogleAccount = async (): Promise<ApiResponse<GoogleSheetsConnection>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    // TODO: In production, call backend OAuth endpoint
    // const response = await fetch(`${BACKEND_URL}/api/google-sheets/auth`, {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${session.access_token}` }
    // });

    // For now, simulate connection (development only)
    const mockConnection: GoogleSheetsConnection = {
      id: `conn_${Date.now()}`,
      user_id: user.id,
      google_email: 'operator@example.com', // Would come from OAuth
      connected_at: new Date().toISOString(),
      is_active: true,
    };

    return {
      data: mockConnection,
      message: 'Google account connected successfully',
    };
  } catch (error) {
    return { error: 'Failed to connect Google account' };
  }
};

/**
 * Get list of accessible spreadsheets
 */
export const getSpreadsheets = async (): Promise<ApiResponse<GoogleSpreadsheet[]>> => {
  try {
    // TODO: In production, call backend endpoint
    // const response = await fetch(`${BACKEND_URL}/api/google-sheets/spreadsheets`);
    
    // Mock data for development
    const mockSpreadsheets: GoogleSpreadsheet[] = [
      {
        spreadsheet_id: 'sheet_001',
        name: 'Liwayway Delivery Schedule - January 2024',
        url: 'https://docs.google.com/spreadsheets/d/mock_id',
        owner: 'liwayway@example.com',
        last_modified: new Date(Date.now() - 86400000).toISOString(),
        sheets: [
          {
            sheet_id: 0,
            title: 'Week 1',
            index: 0,
            row_count: 25,
            column_count: 12,
          },
          {
            sheet_id: 1,
            title: 'Week 2',
            index: 1,
            row_count: 30,
            column_count: 12,
          },
        ],
      },
    ];

    return { data: mockSpreadsheets };
  } catch (error) {
    return { error: 'Failed to fetch spreadsheets' };
  }
};

/**
 * Read spreadsheet data
 */
export const readSpreadsheetData = async (
  spreadsheetId: string,
  sheetName: string
): Promise<ApiResponse<{ headers: string[]; rows: any[][] }>> => {
  try {
    // TODO: In production, call backend endpoint with spreadsheet ID and sheet name
    
    // Mock data for development - simulating Liwayway delivery schedule
    const mockData = {
      headers: [
        'Delivery Reference',
        'Date',
        'Time',
        'Warehouse',
        'Destination',
        'Store',
        'Products',
        'Weight (kg)',
        'Items',
        'Truck',
        'Driver',
        'Instructions',
      ],
      rows: [
        ['DR-2024-001', '01/15/2024', '08:00', 'Liwayway Main', 'SM Megamall', 'Building A', 'Oishi Prawn Crackers', '500', '50', 'TRK-001', 'Juan Cruz', 'Handle with care'],
        ['DR-2024-002', '01/15/2024', '09:00', 'Liwayway Main', 'Robinsons Galleria', 'Main Store', 'Oishi Bread Pan', '300', '30', 'TRK-002', 'Pedro Santos', ''],
        ['DR-2024-003', '01/16/2024', '08:00', 'Liwayway Main', 'SM North', 'Supermarket', 'Mixed Products', '750', '80', '', '', 'Deliver to back entrance'],
        ['DR-2024-004', '01/16/2024', 'invalid', 'Liwayway Main', 'SM Southmall', '', 'Oishi Rinbee', '200', 'abc', '', '', ''], // Invalid time and items
        ['', '01/17/2024', '08:00', '', 'SM Fairview', '', 'Oishi Products', '', '', '', '', ''], // Missing required fields
        ['DR-2024-001', '01/18/2024', '08:00', 'Liwayway Main', 'SM Megamall', 'Building B', 'Oishi Crackers', '400', '40', '', '', ''], // Duplicate reference
      ],
    };

    return { data: mockData };
  } catch (error) {
    return { error: 'Failed to read spreadsheet data' };
  }
};

/**
 * Validate imported rows
 */
export const validateImportData = async (
  headers: string[],
  rows: any[][],
  mappings: ColumnMapping[]
): Promise<ApiResponse<{ validated_rows: ValidatedRow[]; issues: ValidationIssue[] }>> => {
  try {
    const validatedRows: ValidatedRow[] = [];
    const allIssues: ValidationIssue[] = [];

    // Check for existing trips to detect duplicates
    const existingTripsResponse = await getTrips({}, 1, 1000);
    const existingReferences = new Set(
      (existingTripsResponse.data?.data || []).map(trip => trip.delivery_reference)
    );

    // Track references in this import for duplicate detection
    const importReferences = new Set<string>();

    rows.forEach((row, rowIndex) => {
      const rawData: Record<string, any> = {};
      const parsedData: Record<VoneTruckingField, any> = {} as any;
      const issues: ValidationIssue[] = [];

      // Map spreadsheet columns to Vone fields
      mappings.forEach(mapping => {
        const value = row[mapping.spreadsheet_column_index];
        rawData[mapping.spreadsheet_column] = value;
        parsedData[mapping.vone_field] = value;

        // Validate data type and required fields
        const validation = validateFieldDataType(mapping.vone_field, value);
        if (!validation.valid) {
          issues.push({
            row_index: rowIndex,
            field: mapping.vone_field,
            spreadsheet_column: mapping.spreadsheet_column,
            value,
            severity: FIELD_METADATA[mapping.vone_field].required
              ? ValidationSeverity.ERROR
              : ValidationSeverity.WARNING,
            message: validation.message || 'Invalid value',
          });
        }
      });

      // Check for missing required fields
      const requiredFields = getRequiredFields();
      requiredFields.forEach(field => {
        if (!parsedData[field] || parsedData[field] === '') {
          const fieldName = FIELD_METADATA[field].label;
          issues.push({
            row_index: rowIndex,
            field,
            value: parsedData[field],
            severity: ValidationSeverity.ERROR,
            message: `${fieldName} is required`,
            suggestion: `Please provide a value for ${fieldName}`,
          });
        }
      });

      // Check for duplicate delivery reference
      const deliveryRef = parsedData[VoneTruckingField.DELIVERY_REFERENCE];
      let isDuplicate = false;
      let duplicateOf: string | undefined;

      if (deliveryRef) {
        if (existingReferences.has(deliveryRef)) {
          isDuplicate = true;
          duplicateOf = deliveryRef;
          issues.push({
            row_index: rowIndex,
            field: VoneTruckingField.DELIVERY_REFERENCE,
            value: deliveryRef,
            severity: ValidationSeverity.ERROR,
            message: 'Duplicate delivery reference - already exists in system',
            suggestion: 'This trip already exists. Skip or use different reference',
          });
        } else if (importReferences.has(deliveryRef)) {
          isDuplicate = true;
          duplicateOf = deliveryRef;
          issues.push({
            row_index: rowIndex,
            field: VoneTruckingField.DELIVERY_REFERENCE,
            value: deliveryRef,
            severity: ValidationSeverity.ERROR,
            message: 'Duplicate delivery reference in this import',
            suggestion: 'Multiple rows have the same reference number',
          });
        } else {
          importReferences.add(deliveryRef);
        }
      }

      // Determine if row is valid (no errors, only warnings allowed)
      const hasErrors = issues.some(issue => issue.severity === ValidationSeverity.ERROR);

      validatedRows.push({
        row_index: rowIndex,
        raw_data: rawData,
        parsed_data: parsedData,
        is_valid: !hasErrors,
        is_duplicate: isDuplicate,
        duplicate_of: duplicateOf,
        issues,
        selected_for_import: !hasErrors && !isDuplicate, // Auto-select valid, non-duplicate rows
      });

      allIssues.push(...issues);
    });

    return {
      data: {
        validated_rows: validatedRows,
        issues: allIssues,
      },
    };
  } catch (error) {
    return { error: 'Failed to validate import data' };
  }
};

/**
 * Import validated rows as trips
 */
export const importTrips = async (
  session: ImportSession,
  selectedRows: ValidatedRow[]
): Promise<ApiResponse<ImportReport>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const importedTrips: any[] = [];
    const failedRows: any[] = [];
    const skippedRows: any[] = [];

    for (const row of selectedRows) {
      // Skip invalid or duplicate rows
      if (!row.is_valid || row.is_duplicate) {
        skippedRows.push({
          row_index: row.row_index,
          delivery_reference: row.parsed_data[VoneTruckingField.DELIVERY_REFERENCE],
          reason: row.is_duplicate ? 'Duplicate reference' : 'Validation errors',
        });
        continue;
      }

      // Create trip from validated data
      const tripInput = {
        delivery_reference: row.parsed_data[VoneTruckingField.DELIVERY_REFERENCE],
        delivery_date: row.parsed_data[VoneTruckingField.DELIVERY_DATE],
        call_time: row.parsed_data[VoneTruckingField.CALL_TIME],
        pickup_warehouse: row.parsed_data[VoneTruckingField.PICKUP_WAREHOUSE],
        delivery_destination: row.parsed_data[VoneTruckingField.DELIVERY_DESTINATION],
        delivery_address: row.parsed_data[VoneTruckingField.DELIVERY_ADDRESS] || 
                         row.parsed_data[VoneTruckingField.DELIVERY_DESTINATION],
        store_branch_name: row.parsed_data[VoneTruckingField.STORE_BRANCH],
        cargo_description: row.parsed_data[VoneTruckingField.CARGO_DESCRIPTION],
        cargo_weight_kg: row.parsed_data[VoneTruckingField.CARGO_WEIGHT] 
          ? parseFloat(row.parsed_data[VoneTruckingField.CARGO_WEIGHT]) 
          : undefined,
        cargo_volume_cbm: row.parsed_data[VoneTruckingField.CARGO_VOLUME]
          ? parseFloat(row.parsed_data[VoneTruckingField.CARGO_VOLUME])
          : undefined,
        number_of_items: row.parsed_data[VoneTruckingField.NUMBER_OF_ITEMS]
          ? parseInt(row.parsed_data[VoneTruckingField.NUMBER_OF_ITEMS])
          : undefined,
        expected_income: row.parsed_data[VoneTruckingField.EXPECTED_INCOME]
          ? parseFloat(row.parsed_data[VoneTruckingField.EXPECTED_INCOME])
          : undefined,
        special_instructions: row.parsed_data[VoneTruckingField.SPECIAL_INSTRUCTIONS],
        delivery_instructions: row.parsed_data[VoneTruckingField.DELIVERY_INSTRUCTIONS],
        internal_notes: `Imported from ${session.source} on ${new Date().toISOString()}`,
        status: 'scheduled' as any,
      };

      const response = await createTrip(tripInput);

      if (response.error) {
        failedRows.push({
          row_index: row.row_index,
          delivery_reference: row.parsed_data[VoneTruckingField.DELIVERY_REFERENCE],
          error_message: response.error,
        });
      } else if (response.data) {
        importedTrips.push({
          row_index: row.row_index,
          trip_id: response.data.id,
          trip_number: response.data.trip_number,
          delivery_reference: response.data.delivery_reference,
        });
      }
    }

    // Create import report
    const report: ImportReport = {
      id: `report_${Date.now()}`,
      session_id: session.id,
      source: session.source,
      total_rows: session.total_rows,
      imported_count: importedTrips.length,
      failed_count: failedRows.length,
      skipped_count: skippedRows.length,
      duplicate_count: selectedRows.filter(r => r.is_duplicate).length,
      imported_trips: importedTrips,
      failed_rows: failedRows,
      skipped_rows: skippedRows,
      created_at: new Date().toISOString(),
      created_by: user.id,
      spreadsheet_name: session.spreadsheet_name,
      file_name: session.file_name,
    };

    // Save report to database
    await supabase.from('import_reports').insert({
      ...report,
      imported_trips: JSON.stringify(report.imported_trips),
      failed_rows: JSON.stringify(report.failed_rows),
      skipped_rows: JSON.stringify(report.skipped_rows),
    });

    return {
      data: report,
      message: `Successfully imported ${importedTrips.length} trips`,
    };
  } catch (error) {
    return { error: 'Failed to import trips' };
  }
};

/**
 * Save column mapping preset
 */
export const saveColumnMappingPreset = async (
  name: string,
  description: string,
  source: ImportSource,
  mappings: ColumnMapping[]
): Promise<ApiResponse<ColumnMappingPreset>> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Not authenticated' };
    }

    const preset: ColumnMappingPreset = {
      id: `preset_${Date.now()}`,
      name,
      description,
      source,
      mappings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: user.id,
      use_count: 0,
    };

    const { data, error } = await supabase
      .from('column_mapping_presets')
      .insert({
        ...preset,
        mappings: JSON.stringify(mappings),
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return {
      data: {
        ...data,
        mappings: JSON.parse(data.mappings),
      },
      message: 'Mapping preset saved successfully',
    };
  } catch (error) {
    return { error: 'Failed to save mapping preset' };
  }
};

/**
 * Get column mapping presets
 */
export const getColumnMappingPresets = async (
  source?: ImportSource
): Promise<ApiResponse<ColumnMappingPreset[]>> => {
  try {
    let query = supabase
      .from('column_mapping_presets')
      .select('*')
      .order('last_used_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (source) {
      query = query.eq('source', source);
    }

    const { data, error } = await query;

    if (error) {
      return { error: error.message };
    }

    const presets = (data || []).map((preset: any) => ({
      ...preset,
      mappings: JSON.parse(preset.mappings),
    }));

    return { data: presets };
  } catch (error) {
    return { error: 'Failed to fetch mapping presets' };
  }
};

/**
 * Get import history
 */
export const getImportReports = async (
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<{ reports: ImportReport[]; total: number }>> => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('import_reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return { error: error.message };
    }

    const reports = (data || []).map((report: any) => ({
      ...report,
      imported_trips: JSON.parse(report.imported_trips || '[]'),
      failed_rows: JSON.parse(report.failed_rows || '[]'),
      skipped_rows: JSON.parse(report.skipped_rows || '[]'),
    }));

    return {
      data: {
        reports,
        total: count || 0,
      },
    };
  } catch (error) {
    return { error: 'Failed to fetch import reports' };
  }
};
