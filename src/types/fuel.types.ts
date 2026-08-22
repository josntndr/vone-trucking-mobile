/**
 * Fuel Management Types
 * 
 * Type definitions for fuel budget calculation, fuel recording,
 * trip expenses, and fuel consumption reporting.
 */

// ============================================================================
// Fuel Budget Calculation
// ============================================================================

/**
 * Fuel budget calculation input parameters
 */
export interface FuelBudgetInput {
  trip_id: string;
  origin: string;
  destination: string;
  route_distance_km: number;
  return_distance_km?: number;        // Optional return journey
  number_of_trips: number;            // For recurring routes
  truck_id: string;
  truck_efficiency_kmpl: number;      // Kilometres per litre
  current_fuel_price: number;         // Price per litre
  traffic_allowance_percent: number;  // Additional % for traffic (e.g., 10%)
  idling_allowance_percent: number;   // Additional % for idling (e.g., 5%)
}

/**
 * Operator adjustment to fuel budget
 */
export interface FuelBudgetAdjustment {
  adjustment_type: 'increase' | 'decrease';
  adjustment_amount: number;          // Amount in currency
  adjustment_reason: string;          // Required explanation
  adjusted_by: string;                // Operator ID
  adjusted_at: string;                // ISO timestamp
}

/**
 * Calculated fuel budget
 */
export interface FuelBudgetCalculation {
  id: string;
  trip_id: string;
  
  // Input parameters
  input: FuelBudgetInput;
  
  // Calculated values
  total_distance_km: number;          // route + return (if any)
  base_litres: number;                // Without allowances
  traffic_allowance_litres: number;
  idling_allowance_litres: number;
  estimated_litres: number;           // Total with allowances
  estimated_fuel_cost: number;        // Litres × price
  
  // Operator adjustments
  adjustments: FuelBudgetAdjustment[];
  final_budget_amount: number;        // After adjustments
  
  // Approval status
  status: 'draft' | 'reviewed' | 'approved' | 'rejected';
  reviewed_by?: string;               // Operator ID
  reviewed_at?: string;               // ISO timestamp
  approved_by?: string;               // Operator ID
  approved_at?: string;               // ISO timestamp
  rejection_reason?: string;
  
  // Disbursement
  amount_released?: number;           // Actual amount given to driver
  released_by?: string;               // Operator ID
  released_at?: string;               // ISO timestamp
  release_notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Fuel Recording (Driver)
// ============================================================================

/**
 * Driver fuel purchase record
 */
export interface FuelRecord {
  id: string;
  trip_id: string;
  truck_id: string;
  driver_id: string;
  
  // Purchase details
  litres_purchased: number;
  price_per_litre: number;
  total_amount: number;
  
  // Location and station
  fuel_station_name: string;
  fuel_station_location?: string;     // Address or coordinates
  fuel_station_latitude?: number;
  fuel_station_longitude?: number;
  
  // Odometer reading
  odometer_reading: number;           // In kilometres
  
  // Timestamp
  purchase_date: string;              // ISO timestamp
  
  // Receipt
  receipt_photo_url?: string;
  receipt_number?: string;
  
  // Validation
  is_validated: boolean;
  validation_issues?: string[];       // e.g., "Price mismatch", "Calculation error"
  requires_explanation: boolean;
  driver_explanation?: string;
  
  // Operator review
  is_approved: boolean;
  approved_by?: string;               // Operator ID
  approved_at?: string;               // ISO timestamp
  rejection_reason?: string;
  
  // Notes
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Fuel record validation result
 */
export interface FuelRecordValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  calculated_total: number;           // litres × price
  amount_difference: number;          // Reported - calculated
  requires_explanation: boolean;
}

// ============================================================================
// Trip Expenses
// ============================================================================

/**
 * Trip expense categories
 */
export type ExpenseCategory = 
  | 'fuel'
  | 'toll_fees'
  | 'parking'
  | 'meals_allowances'
  | 'repairs'
  | 'emergency'
  | 'other';

/**
 * Trip expense record
 */
export interface TripExpense {
  id: string;
  trip_id: string;
  truck_id: string;
  driver_id: string;
  
  // Expense details
  category: ExpenseCategory;
  description: string;
  amount: number;
  
  // Optional fuel reference (if category is 'fuel')
  fuel_record_id?: string;
  
  // Location
  location?: string;
  latitude?: number;
  longitude?: number;
  
  // Timestamp
  expense_date: string;               // ISO timestamp
  
  // Receipt
  receipt_photo_url?: string;
  receipt_number?: string;
  
  // Approval
  is_approved: boolean;
  approved_by?: string;               // Operator ID
  approved_at?: string;               // ISO timestamp
  rejection_reason?: string;
  
  // Notes
  notes?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Trip expense summary by category
 */
export interface TripExpenseSummary {
  trip_id: string;
  fuel: number;
  toll_fees: number;
  parking: number;
  meals_allowances: number;
  repairs: number;
  emergency: number;
  other: number;
  total: number;
  approved_total: number;
  pending_approval_total: number;
}

// ============================================================================
// Fuel Consumption Reporting
// ============================================================================

/**
 * Fuel budget vs actual comparison
 */
export interface FuelBudgetComparison {
  trip_id: string;
  truck_id: string;
  driver_id: string;
  
  // Budget
  estimated_litres: number;
  estimated_cost: number;
  budgeted_amount: number;
  amount_released: number;
  
  // Actual
  actual_litres: number;
  actual_cost: number;
  
  // Variance
  litres_variance: number;            // Actual - estimated (positive = over)
  litres_variance_percent: number;
  cost_variance: number;              // Actual - estimated
  cost_variance_percent: number;
  
  // Remaining budget
  budget_remaining: number;           // Released - actual cost
  
  // Status
  is_over_budget: boolean;
  variance_threshold_exceeded: boolean; // e.g., >10% variance
}

/**
 * Fuel consumption by truck report
 */
export interface FuelConsumptionByTruck {
  truck_id: string;
  truck_unit_number: string;
  truck_plate_number: string;
  
  // Period
  period_start: string;
  period_end: string;
  
  // Distance
  total_distance_km: number;
  
  // Fuel consumption
  total_litres: number;
  total_cost: number;
  average_kmpl: number;               // Calculated efficiency
  expected_kmpl: number;              // Truck's rated efficiency
  efficiency_variance_percent: number;
  
  // Trip count
  trip_count: number;
  
  // Comparison
  is_performing_well: boolean;        // Meets or exceeds expected efficiency
}

/**
 * Fuel consumption by trip report
 */
export interface FuelConsumptionByTrip {
  trip_id: string;
  truck_id: string;
  driver_id: string;
  origin: string;
  destination: string;
  
  // Distance
  distance_km: number;
  
  // Fuel
  litres_consumed: number;
  fuel_cost: number;
  actual_kmpl: number;
  expected_kmpl: number;
  
  // Variance
  efficiency_variance_percent: number;
  cost_per_km: number;
  
  // Status
  is_efficient: boolean;
  is_flagged: boolean;                // Unusually high consumption
}

/**
 * Fuel consumption by destination report
 */
export interface FuelConsumptionByDestination {
  destination: string;
  
  // Aggregated data
  trip_count: number;
  total_distance_km: number;
  average_distance_km: number;
  
  // Fuel consumption
  total_litres: number;
  average_litres_per_trip: number;
  total_cost: number;
  average_cost_per_trip: number;
  
  // Efficiency
  average_kmpl: number;
  best_kmpl: number;
  worst_kmpl: number;
  
  // Trucks used
  truck_count: number;
}

/**
 * Unusual fuel usage detection
 */
export interface UnusualFuelUsage {
  record_id: string;                  // Fuel record or trip ID
  type: 'fuel_record' | 'trip';
  trip_id: string;
  truck_id: string;
  driver_id: string;
  
  // Issue details
  issue_type: 
    | 'excessive_consumption'         // Much higher than expected
    | 'suspiciously_low'              // Much lower than expected
    | 'price_outlier'                 // Price significantly different
    | 'multiple_purchases_same_day'   // Multiple fuel purchases
    | 'large_single_purchase'         // Very large single purchase
    | 'odometer_inconsistency'        // Odometer reading doesn't match distance
    | 'calculation_mismatch';         // Receipt amount doesn't match calculation
  
  issue_description: string;
  severity: 'low' | 'medium' | 'high';
  
  // Values
  expected_value?: number;
  actual_value: number;
  variance_percent?: number;
  
  // Status
  is_reviewed: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  resolution?: string;
  is_resolved: boolean;
  
  // Timestamp
  flagged_at: string;
}

// ============================================================================
// Fuel Price Tracking
// ============================================================================

/**
 * Fuel price record (for tracking market prices)
 */
export interface FuelPrice {
  id: string;
  region: string;
  city?: string;
  price_per_litre: number;
  currency: string;
  effective_date: string;
  source?: string;                    // e.g., "Government data", "Manual entry"
  created_at: string;
}

// ============================================================================
// Odometer Tracking
// ============================================================================

/**
 * Odometer reading record
 */
export interface OdometerReading {
  id: string;
  truck_id: string;
  reading_km: number;
  recorded_by: string;                // Driver or operator ID
  reading_type: 'trip_start' | 'trip_end' | 'fuel_purchase' | 'maintenance' | 'manual';
  trip_id?: string;
  fuel_record_id?: string;
  recorded_at: string;
  location?: string;
  notes?: string;
}

/**
 * Odometer validation result
 */
export interface OdometerValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  previous_reading?: number;
  current_reading: number;
  distance_travelled?: number;
  expected_distance?: number;
  variance?: number;
  is_suspicious: boolean;
}

// ============================================================================
// Report Filters and Parameters
// ============================================================================

/**
 * Common report filter parameters
 */
export interface ReportFilters {
  // Time period
  start_date?: string;                // ISO date
  end_date?: string;                  // ISO date
  
  // Filters
  truck_ids?: string[];
  driver_ids?: string[];
  destination?: string;
  
  // Thresholds
  variance_threshold?: number;        // % variance to flag (default 10%)
  efficiency_threshold?: number;      // Minimum acceptable kmpl
  
  // Sorting
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Report metadata
 */
export interface ReportMetadata {
  generated_at: string;
  generated_by: string;
  filters_applied: ReportFilters;
  total_records: number;
  total_pages?: number;
  current_page?: number;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Currency amount with formatting
 */
export interface CurrencyAmount {
  amount: number;
  currency: string;
  formatted: string;                  // e.g., "$1,234.56"
}

/**
 * Distance with unit
 */
export interface Distance {
  value: number;
  unit: 'km' | 'miles';
}

/**
 * Fuel efficiency
 */
export interface FuelEfficiency {
  value: number;
  unit: 'kmpl' | 'mpg';              // Kilometres per litre or miles per gallon
}

// ============================================================================
// Validation Rules
// ============================================================================

/**
 * Fuel budget validation rules
 */
export interface FuelBudgetValidationRules {
  min_distance_km: number;            // Minimum trip distance (e.g., 1 km)
  max_distance_km: number;            // Maximum single trip distance (e.g., 5000 km)
  min_efficiency_kmpl: number;        // Minimum truck efficiency (e.g., 2 kmpl)
  max_efficiency_kmpl: number;        // Maximum truck efficiency (e.g., 15 kmpl)
  min_fuel_price: number;             // Minimum fuel price (e.g., 0.10)
  max_fuel_price: number;             // Maximum fuel price (e.g., 10.00)
  max_traffic_allowance: number;      // Maximum traffic allowance % (e.g., 50%)
  max_idling_allowance: number;       // Maximum idling allowance % (e.g., 20%)
  max_operator_adjustment: number;    // Maximum adjustment % (e.g., 30%)
}

/**
 * Fuel record validation rules
 */
export interface FuelRecordValidationRules {
  min_litres: number;                 // Minimum purchase (e.g., 5 litres)
  max_litres: number;                 // Maximum single purchase (e.g., 500 litres)
  calculation_tolerance: number;      // Allowed difference in amount (e.g., 0.50)
  price_variance_threshold: number;   // % variance from market price (e.g., 20%)
  max_purchases_per_day: number;      // Flag if exceeded (e.g., 3)
  odometer_variance_threshold: number; // km variance from expected (e.g., 100 km)
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_VALIDATION_RULES: FuelBudgetValidationRules = {
  min_distance_km: 1,
  max_distance_km: 5000,
  min_efficiency_kmpl: 2,
  max_efficiency_kmpl: 15,
  min_fuel_price: 0.10,
  max_fuel_price: 10.00,
  max_traffic_allowance: 50,
  max_idling_allowance: 20,
  max_operator_adjustment: 30,
};

export const DEFAULT_FUEL_RECORD_RULES: FuelRecordValidationRules = {
  min_litres: 5,
  max_litres: 500,
  calculation_tolerance: 0.50,
  price_variance_threshold: 20,
  max_purchases_per_day: 3,
  odometer_variance_threshold: 100,
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  fuel: 'Fuel',
  toll_fees: 'Toll Fees',
  parking: 'Parking',
  meals_allowances: 'Meals & Allowances',
  repairs: 'Repairs',
  emergency: 'Emergency Expenses',
  other: 'Other Expenses',
};

export const VARIANCE_THRESHOLDS = {
  low: 5,        // <5% variance
  medium: 10,    // 5-10% variance
  high: 20,      // >10% variance
};
