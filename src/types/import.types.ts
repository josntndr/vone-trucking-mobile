/**
 * Import and Google Sheets Integration Types
 */

export enum ImportSource {
  GOOGLE_SHEETS = 'google_sheets',
  CSV = 'csv',
  EXCEL = 'excel',
  MANUAL = 'manual',
}

export enum ImportStatus {
  PENDING = 'pending',
  MAPPING = 'mapping',
  VALIDATING = 'validating',
  PREVIEWING = 'previewing',
  IMPORTING = 'importing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

// Vone Trucking field types for mapping
export enum VoneTruckingField {
  DELIVERY_REFERENCE = 'delivery_reference',
  DELIVERY_DATE = 'delivery_date',
  CALL_TIME = 'call_time',
  PICKUP_WAREHOUSE = 'pickup_warehouse',
  DELIVERY_DESTINATION = 'delivery_destination',
  DELIVERY_ADDRESS = 'delivery_address',
  STORE_BRANCH = 'store_branch',
  CARGO_DESCRIPTION = 'cargo_description',
  CARGO_WEIGHT = 'cargo_weight',
  CARGO_VOLUME = 'cargo_volume',
  NUMBER_OF_ITEMS = 'number_of_items',
  NUMBER_OF_TRIPS = 'number_of_trips',
  TRUCK_NUMBER = 'truck_number',
  PLATE_NUMBER = 'plate_number',
  DRIVER_NAME = 'driver_name',
  PORTER_NAME = 'porter_name',
  EXPECTED_INCOME = 'expected_income',
  SPECIAL_INSTRUCTIONS = 'special_instructions',
  DELIVERY_INSTRUCTIONS = 'delivery_instructions',
}

// Field metadata for UI display and validation
export interface FieldMetadata {
  field: VoneTruckingField;
  label: string;
  description: string;
  required: boolean;
  dataType: 'string' | 'number' | 'date' | 'time';
  example: string;
}

// Column mapping from spreadsheet to Vone Trucking fields
export interface ColumnMapping {
  spreadsheet_column: string; // e.g., "A", "B", "Delivery Date"
  spreadsheet_column_index: number; // 0-based index
  vone_field: VoneTruckingField | null; // null for unmapped columns
  sample_values?: string[]; // First few values for preview
}

// Saved column mapping preset
export interface ColumnMappingPreset {
  id: string;
  name: string;
  description?: string;
  source: ImportSource;
  mappings: ColumnMapping[];
  created_at: string;
  updated_at: string;
  created_by: string;
  last_used_at?: string;
  use_count: number;
}

// Validation issue for a single row/cell
export interface ValidationIssue {
  row_index: number;
  field: VoneTruckingField;
  spreadsheet_column?: string;
  value: any;
  severity: ValidationSeverity;
  message: string;
  suggestion?: string;
}

// Validated row with parsed data
export interface ValidatedRow {
  row_index: number;
  raw_data: Record<string, any>;
  parsed_data: Record<VoneTruckingField, any>;
  is_valid: boolean;
  is_duplicate: boolean;
  duplicate_of?: string; // Delivery reference of existing trip
  issues: ValidationIssue[];
  selected_for_import: boolean;
}

// Google Sheets specific types
export interface GoogleSpreadsheet {
  spreadsheet_id: string;
  name: string;
  url: string;
  owner: string;
  last_modified: string;
  sheets: GoogleSheet[];
}

export interface GoogleSheet {
  sheet_id: number;
  title: string;
  index: number;
  row_count: number;
  column_count: number;
}

export interface GoogleSheetsConnection {
  id: string;
  user_id: string;
  google_email: string;
  connected_at: string;
  last_used_at?: string;
  is_active: boolean;
  // Token stored securely in backend, not exposed to client
}

// Import session tracking
export interface ImportSession {
  id: string;
  source: ImportSource;
  status: ImportStatus;
  
  // Source information
  spreadsheet_id?: string;
  spreadsheet_name?: string;
  sheet_name?: string;
  file_name?: string;
  
  // Mapping
  mapping_preset_id?: string;
  column_mappings: ColumnMapping[];
  
  // Data
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  selected_rows: number;
  
  // Validation
  validated_rows: ValidatedRow[];
  validation_issues: ValidationIssue[];
  
  // Import results
  imported_count?: number;
  failed_count?: number;
  skipped_count?: number;
  imported_trip_ids?: string[];
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
  completed_at?: string;
  error_message?: string;
}

// Import report for audit log
export interface ImportReport {
  id: string;
  session_id: string;
  source: ImportSource;
  
  // Summary
  total_rows: number;
  imported_count: number;
  failed_count: number;
  skipped_count: number;
  duplicate_count: number;
  
  // Details
  imported_trips: {
    row_index: number;
    trip_id: string;
    trip_number: string;
    delivery_reference: string;
  }[];
  
  failed_rows: {
    row_index: number;
    delivery_reference?: string;
    error_message: string;
  }[];
  
  skipped_rows: {
    row_index: number;
    delivery_reference?: string;
    reason: string;
  }[];
  
  // Metadata
  created_at: string;
  created_by: string;
  file_name?: string;
  spreadsheet_name?: string;
}

// Field metadata registry
export const FIELD_METADATA: Record<VoneTruckingField, FieldMetadata> = {
  [VoneTruckingField.DELIVERY_REFERENCE]: {
    field: VoneTruckingField.DELIVERY_REFERENCE,
    label: 'Delivery Reference',
    description: 'Unique delivery reference number from Liwayway',
    required: true,
    dataType: 'string',
    example: 'DR-2024-001',
  },
  [VoneTruckingField.DELIVERY_DATE]: {
    field: VoneTruckingField.DELIVERY_DATE,
    label: 'Delivery Date',
    description: 'Scheduled delivery date',
    required: true,
    dataType: 'date',
    example: '2024-01-15 or 01/15/2024',
  },
  [VoneTruckingField.CALL_TIME]: {
    field: VoneTruckingField.CALL_TIME,
    label: 'Call Time',
    description: 'Time when team should report',
    required: true,
    dataType: 'time',
    example: '08:00 or 8:00 AM',
  },
  [VoneTruckingField.PICKUP_WAREHOUSE]: {
    field: VoneTruckingField.PICKUP_WAREHOUSE,
    label: 'Pickup Warehouse',
    description: 'Warehouse location for pickup',
    required: true,
    dataType: 'string',
    example: 'Liwayway Main Warehouse',
  },
  [VoneTruckingField.DELIVERY_DESTINATION]: {
    field: VoneTruckingField.DELIVERY_DESTINATION,
    label: 'Delivery Destination',
    description: 'Destination name',
    required: true,
    dataType: 'string',
    example: 'SM Megamall',
  },
  [VoneTruckingField.DELIVERY_ADDRESS]: {
    field: VoneTruckingField.DELIVERY_ADDRESS,
    label: 'Delivery Address',
    description: 'Full delivery address',
    required: false,
    dataType: 'string',
    example: 'EDSA corner Ortigas, Mandaluyong',
  },
  [VoneTruckingField.STORE_BRANCH]: {
    field: VoneTruckingField.STORE_BRANCH,
    label: 'Store/Branch Name',
    description: 'Store or branch identifier',
    required: false,
    dataType: 'string',
    example: 'SM Megamall - Building A',
  },
  [VoneTruckingField.CARGO_DESCRIPTION]: {
    field: VoneTruckingField.CARGO_DESCRIPTION,
    label: 'Cargo Description',
    description: 'Description of products/cargo',
    required: true,
    dataType: 'string',
    example: 'Oishi Prawn Crackers, 50 boxes',
  },
  [VoneTruckingField.CARGO_WEIGHT]: {
    field: VoneTruckingField.CARGO_WEIGHT,
    label: 'Cargo Weight (kg)',
    description: 'Total weight in kilograms',
    required: false,
    dataType: 'number',
    example: '500',
  },
  [VoneTruckingField.CARGO_VOLUME]: {
    field: VoneTruckingField.CARGO_VOLUME,
    label: 'Cargo Volume (m³)',
    description: 'Total volume in cubic meters',
    required: false,
    dataType: 'number',
    example: '10.5',
  },
  [VoneTruckingField.NUMBER_OF_ITEMS]: {
    field: VoneTruckingField.NUMBER_OF_ITEMS,
    label: 'Number of Items',
    description: 'Total number of items/boxes',
    required: false,
    dataType: 'number',
    example: '50',
  },
  [VoneTruckingField.NUMBER_OF_TRIPS]: {
    field: VoneTruckingField.NUMBER_OF_TRIPS,
    label: 'Number of Trips',
    description: 'Number of trips required for this delivery',
    required: false,
    dataType: 'number',
    example: '1',
  },
  [VoneTruckingField.TRUCK_NUMBER]: {
    field: VoneTruckingField.TRUCK_NUMBER,
    label: 'Truck Number',
    description: 'Fleet/unit number of assigned truck',
    required: false,
    dataType: 'string',
    example: 'TRK-001',
  },
  [VoneTruckingField.PLATE_NUMBER]: {
    field: VoneTruckingField.PLATE_NUMBER,
    label: 'Plate Number',
    description: 'License plate number',
    required: false,
    dataType: 'string',
    example: 'ABC-1234',
  },
  [VoneTruckingField.DRIVER_NAME]: {
    field: VoneTruckingField.DRIVER_NAME,
    label: 'Driver Name',
    description: 'Name of assigned driver',
    required: false,
    dataType: 'string',
    example: 'Juan Cruz',
  },
  [VoneTruckingField.PORTER_NAME]: {
    field: VoneTruckingField.PORTER_NAME,
    label: 'Porter/Helper Name',
    description: 'Name of assigned porter/helper',
    required: false,
    dataType: 'string',
    example: 'Pedro Santos',
  },
  [VoneTruckingField.EXPECTED_INCOME]: {
    field: VoneTruckingField.EXPECTED_INCOME,
    label: 'Expected Income',
    description: 'Expected income for this delivery',
    required: false,
    dataType: 'number',
    example: '5000',
  },
  [VoneTruckingField.SPECIAL_INSTRUCTIONS]: {
    field: VoneTruckingField.SPECIAL_INSTRUCTIONS,
    label: 'Special Instructions',
    description: 'Special handling or delivery instructions',
    required: false,
    dataType: 'string',
    example: 'Handle with care - fragile items',
  },
  [VoneTruckingField.DELIVERY_INSTRUCTIONS]: {
    field: VoneTruckingField.DELIVERY_INSTRUCTIONS,
    label: 'Delivery Instructions',
    description: 'Instructions for delivery team',
    required: false,
    dataType: 'string',
    example: 'Deliver to receiving dock at rear entrance',
  },
};

// Helper function to get required fields
export const getRequiredFields = (): VoneTruckingField[] => {
  return Object.values(FIELD_METADATA)
    .filter(meta => meta.required)
    .map(meta => meta.field);
};

// Helper function to get field label
export const getFieldLabel = (field: VoneTruckingField): string => {
  return FIELD_METADATA[field]?.label || field;
};

// Helper function to validate field data type
export const validateFieldDataType = (
  field: VoneTruckingField,
  value: any
): { valid: boolean; message?: string } => {
  const metadata = FIELD_METADATA[field];
  if (!metadata) return { valid: false, message: 'Unknown field' };

  if (!value || value === '') {
    if (metadata.required) {
      return { valid: false, message: `${metadata.label} is required` };
    }
    return { valid: true };
  }

  switch (metadata.dataType) {
    case 'number':
      const num = parseFloat(value);
      if (isNaN(num)) {
        return { valid: false, message: `${metadata.label} must be a number` };
      }
      if (num < 0) {
        return { valid: false, message: `${metadata.label} must be positive` };
      }
      break;

    case 'date':
      // Try parsing common date formats
      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
        /^\d{1,2}-\d{1,2}-\d{4}$/, // M-D-YYYY
      ];
      const isValidDate = datePatterns.some(pattern => pattern.test(value.toString()));
      if (!isValidDate) {
        const testDate = new Date(value);
        if (isNaN(testDate.getTime())) {
          return { valid: false, message: `${metadata.label} must be a valid date` };
        }
      }
      break;

    case 'time':
      // Try parsing common time formats
      const timePatterns = [
        /^\d{1,2}:\d{2}$/, // HH:MM
        /^\d{1,2}:\d{2}\s?(AM|PM)$/i, // HH:MM AM/PM
      ];
      const isValidTime = timePatterns.some(pattern => pattern.test(value.toString()));
      if (!isValidTime) {
        return { valid: false, message: `${metadata.label} must be a valid time (HH:MM)` };
      }
      break;

    case 'string':
      if (metadata.required && value.toString().trim().length === 0) {
        return { valid: false, message: `${metadata.label} cannot be empty` };
      }
      break;
  }

  return { valid: true };
};
