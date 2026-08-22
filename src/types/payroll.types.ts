/**
 * Payroll and Cash Advance Types
 * 
 * Type definitions for payroll processing, compensation calculations,
 * cash advance management, and employee financial records.
 */

// ============================================================================
// Compensation Methods
// ============================================================================

/**
 * Types of compensation methods
 */
export type CompensationMethod =
  | 'weekly_salary'
  | 'monthly_salary'
  | 'daily_rate'
  | 'per_trip'
  | 'destination_based'
  | 'hourly_rate';

/**
 * Employee compensation configuration
 */
export interface EmployeeCompensation {
  employee_id: string;
  method: CompensationMethod;
  
  // Salary-based
  weekly_salary?: number;
  monthly_salary?: number;
  
  // Rate-based
  daily_rate?: number;
  hourly_rate?: number;
  per_trip_rate?: number;
  
  // Role-specific rates
  driver_rate?: number;
  porter_rate?: number;
  
  // Overtime
  overtime_enabled: boolean;
  overtime_threshold_hours?: number;      // Daily or weekly threshold
  overtime_multiplier?: number;           // e.g., 1.5 or 2.0
  
  // Additional pay
  rest_day_multiplier?: number;           // e.g., 2.0 for double pay
  holiday_multiplier?: number;            // e.g., 2.5 for holiday work
  
  // Effective dates
  effective_from: string;
  effective_until?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * Destination-based rate configuration
 */
export interface DestinationRate {
  id: string;
  destination: string;
  driver_rate: number;
  porter_rate: number;
  round_trip_rate?: number;
  notes?: string;
  effective_from: string;
  effective_until?: string;
}

// ============================================================================
// Earnings Components
// ============================================================================

/**
 * Types of earnings
 */
export type EarningsType =
  | 'base_salary'
  | 'base_wage'
  | 'trip_earnings'
  | 'overtime'
  | 'rest_day_pay'
  | 'holiday_pay'
  | 'allowance'
  | 'bonus'
  | 'adjustment';

/**
 * Individual earnings line item
 */
export interface EarningsLineItem {
  id: string;
  type: EarningsType;
  description: string;
  
  // Calculation details
  quantity?: number;              // e.g., trips, days, hours
  rate?: number;                  // Rate per unit
  amount: number;                 // Total amount
  
  // Supporting data
  reference_ids?: string[];       // Trip IDs, attendance IDs, etc.
  calculation_notes?: string;     // How this was calculated
  
  // Metadata
  is_taxable: boolean;
  is_mandatory: boolean;
}

/**
 * Allowance type
 */
export interface Allowance {
  id: string;
  name: string;
  type: 'meal' | 'fuel' | 'phone' | 'transportation' | 'housing' | 'other';
  amount: number;
  frequency: 'per_day' | 'per_trip' | 'per_week' | 'per_month' | 'one_time';
  is_taxable: boolean;
  conditions?: string;
  effective_from: string;
  effective_until?: string;
}

/**
 * Bonus type
 */
export interface Bonus {
  id: string;
  name: string;
  type: 'performance' | 'attendance' | 'safety' | 'seasonal' | 'referral' | 'other';
  amount?: number;
  percentage?: number;            // Percentage of base pay
  
  // Conditions
  conditions?: string;
  minimum_trips?: number;
  minimum_days?: number;
  perfect_attendance_required?: boolean;
  zero_incidents_required?: boolean;
  
  // Dates
  effective_from: string;
  effective_until?: string;
}

// ============================================================================
// Deductions
// ============================================================================

/**
 * Types of deductions
 */
export type DeductionType =
  | 'tax'
  | 'social_security'
  | 'health_insurance'
  | 'pension'
  | 'union_dues'
  | 'loan_repayment'
  | 'cash_advance'
  | 'damage_charge'
  | 'absence_deduction'
  | 'other';

/**
 * Individual deduction line item
 */
export interface DeductionLineItem {
  id: string;
  type: DeductionType;
  description: string;
  
  // Amount
  amount: number;
  is_mandatory: boolean;
  
  // Supporting data
  reference_id?: string;          // Cash advance ID, loan ID, etc.
  calculation_notes?: string;
  
  // Limits
  max_amount?: number;
  max_percentage?: number;        // Max % of gross or net
}

/**
 * Deduction rules
 */
export interface DeductionRules {
  // Cash advance limits
  max_cash_advance_deduction_amount?: number;
  max_cash_advance_deduction_percentage?: number;
  
  // Minimum net pay
  minimum_net_pay_amount?: number;
  minimum_net_pay_percentage?: number;
  
  // Deduction order priority
  deduction_priority: DeductionType[];
}

// ============================================================================
// Payroll Period
// ============================================================================

/**
 * Payroll period frequency
 */
export type PayrollFrequency = 'weekly' | 'bi_weekly' | 'semi_monthly' | 'monthly';

/**
 * Payroll period
 */
export interface PayrollPeriod {
  id: string;
  frequency: PayrollFrequency;
  
  // Period dates
  period_start: string;
  period_end: string;
  pay_date: string;
  
  // Status
  status: 'draft' | 'calculating' | 'preview' | 'approved' | 'paid' | 'closed';
  
  // Cutoff
  cutoff_date: string;            // Last date for data inclusion
  
  // Metadata
  created_at: string;
  created_by: string;
  approved_at?: string;
  approved_by?: string;
  paid_at?: string;
  paid_by?: string;
  closed_at?: string;
}

// ============================================================================
// Payroll Record
// ============================================================================

/**
 * Individual employee payroll record
 */
export interface PayrollRecord {
  id: string;
  payroll_period_id: string;
  employee_id: string;
  employee_name: string;
  employee_role: string;
  
  // Earnings
  earnings: EarningsLineItem[];
  gross_pay: number;
  
  // Deductions
  deductions: DeductionLineItem[];
  total_deductions: number;
  
  // Net pay
  net_pay: number;
  
  // Supporting data
  trips_completed: number;
  trips_approved: number;
  days_worked: number;
  hours_worked: number;
  overtime_hours: number;
  
  // Cash advance
  cash_advance_balance_before: number;
  cash_advance_deduction: number;
  cash_advance_balance_after: number;
  
  // Status
  status: 'draft' | 'pending_review' | 'approved' | 'paid';
  
  // Corrections
  has_corrections: boolean;
  correction_reason?: string;
  corrected_at?: string;
  corrected_by?: string;
  original_record_id?: string;
  
  // Audit trail
  calculation_timestamp: string;
  calculation_method: string;
  reviewed_by?: string;
  reviewed_at?: string;
  approved_by?: string;
  approved_at?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * Payroll calculation breakdown
 */
export interface PayrollCalculationBreakdown {
  // Base earnings
  base_earnings_description: string;
  base_earnings_calculation: string;
  base_earnings_amount: number;
  
  // Trip earnings
  trip_earnings?: {
    total_trips: number;
    approved_trips: number;
    trip_details: Array<{
      trip_id: string;
      destination: string;
      rate: number;
      amount: number;
    }>;
    total_amount: number;
  };
  
  // Additional pay
  overtime?: {
    regular_hours: number;
    overtime_hours: number;
    overtime_rate: number;
    amount: number;
  };
  
  allowances?: Array<{
    name: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  
  bonuses?: Array<{
    name: string;
    conditions_met: boolean;
    amount: number;
  }>;
  
  // Deductions
  deduction_breakdown: Array<{
    type: string;
    description: string;
    calculation: string;
    amount: number;
  }>;
  
  // Summary
  gross_pay: number;
  total_deductions: number;
  net_pay: number;
}

// ============================================================================
// Cash Advance
// ============================================================================

/**
 * Cash advance request status
 */
export type CashAdvanceStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'disbursed'
  | 'repaying'
  | 'completed'
  | 'written_off';

/**
 * Cash advance request
 */
export interface CashAdvanceRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  
  // Request details
  amount_requested: number;
  amount_approved?: number;
  purpose: string;
  request_date: string;
  needed_by_date?: string;
  
  // Supporting documents
  supporting_document_urls: string[];
  supporting_document_notes?: string;
  
  // Status
  status: CashAdvanceStatus;
  
  // Approval
  reviewed_by?: string;
  reviewed_at?: string;
  approval_notes?: string;
  rejection_reason?: string;
  
  // Disbursement
  disbursed_at?: string;
  disbursed_by?: string;
  disbursement_method?: 'cash' | 'bank_transfer' | 'check';
  disbursement_reference?: string;
  
  // Repayment
  repayment_terms: CashAdvanceRepaymentTerms;
  
  // Employee acknowledgement
  acknowledged_by_employee: boolean;
  acknowledged_at?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * Repayment terms
 */
export interface CashAdvanceRepaymentTerms {
  total_amount: number;
  
  // Installment plan
  number_of_installments: number;
  installment_amount: number;
  
  // Schedule
  start_date: string;
  frequency: 'per_payroll' | 'weekly' | 'bi_weekly' | 'monthly';
  
  // Interest
  interest_rate?: number;
  interest_amount?: number;
  
  // Penalties
  late_payment_fee?: number;
  
  // Flexibility
  allow_early_repayment: boolean;
  early_repayment_penalty?: number;
}

/**
 * Cash advance transaction
 */
export interface CashAdvanceTransaction {
  id: string;
  cash_advance_id: string;
  
  // Transaction details
  type: 'disbursement' | 'repayment' | 'interest' | 'penalty' | 'adjustment' | 'write_off';
  amount: number;
  transaction_date: string;
  
  // Source
  source: 'payroll_deduction' | 'manual_payment' | 'bank_transfer' | 'cash' | 'adjustment';
  
  // Reference
  payroll_record_id?: string;
  reference_number?: string;
  
  // Notes
  notes?: string;
  
  // Balance after transaction
  balance_after: number;
  
  // Metadata
  created_at: string;
  created_by: string;
}

/**
 * Cash advance balance
 */
export interface CashAdvanceBalance {
  employee_id: string;
  total_advanced: number;
  total_repaid: number;
  current_balance: number;
  
  // Active advances
  active_advances: Array<{
    advance_id: string;
    amount: number;
    balance: number;
    due_date?: string;
  }>;
  
  // History
  total_historical_advances: number;
  total_historical_repayments: number;
  
  // Last updated
  last_transaction_date: string;
  last_updated: string;
}

// ============================================================================
// Payslip
// ============================================================================

/**
 * Employee payslip
 */
export interface Payslip {
  id: string;
  payroll_record_id: string;
  payroll_period_id: string;
  
  // Employee info
  employee_id: string;
  employee_name: string;
  employee_number: string;
  employee_role: string;
  
  // Period
  period_start: string;
  period_end: string;
  pay_date: string;
  
  // Earnings breakdown
  earnings_summary: Array<{
    description: string;
    details?: string;
    amount: number;
  }>;
  gross_pay: number;
  
  // Deductions breakdown
  deductions_summary: Array<{
    description: string;
    details?: string;
    amount: number;
  }>;
  total_deductions: number;
  
  // Net pay
  net_pay: number;
  
  // Year-to-date totals
  ytd_gross: number;
  ytd_deductions: number;
  ytd_net: number;
  
  // Cash advance info
  cash_advance_deduction?: number;
  cash_advance_balance?: number;
  
  // Payment info
  payment_method?: 'bank_transfer' | 'cash' | 'check';
  bank_account?: string;
  
  // Notes
  notes?: string;
  
  // Generation
  generated_at: string;
  generated_by: string;
}

// ============================================================================
// Attendance
// ============================================================================

/**
 * Attendance record
 */
export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  
  // Status
  status: 'present' | 'absent' | 'rest_day' | 'holiday' | 'leave' | 'half_day';
  
  // Time tracking
  clock_in?: string;
  clock_out?: string;
  hours_worked?: number;
  
  // Leave details
  leave_type?: 'sick' | 'vacation' | 'emergency' | 'unpaid';
  leave_approved: boolean;
  
  // Notes
  notes?: string;
  
  // Metadata
  recorded_by: string;
  recorded_at: string;
}

// ============================================================================
// Audit & Corrections
// ============================================================================

/**
 * Payroll correction record
 */
export interface PayrollCorrection {
  id: string;
  payroll_record_id: string;
  original_payroll_record_id?: string;
  
  // Correction details
  correction_type: 'earnings_adjustment' | 'deduction_adjustment' | 'calculation_error' | 'data_error' | 'policy_change';
  reason: string;
  description: string;
  
  // Changes
  field_changed: string;
  old_value: any;
  new_value: any;
  amount_difference: number;
  
  // Approval
  requires_approval: boolean;
  approved: boolean;
  approved_by?: string;
  approved_at?: string;
  
  // Metadata
  corrected_by: string;
  corrected_at: string;
}

/**
 * Payroll audit log entry
 */
export interface PayrollAuditLog {
  id: string;
  
  // What changed
  entity_type: 'payroll_period' | 'payroll_record' | 'cash_advance' | 'compensation_config';
  entity_id: string;
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'rejected' | 'paid' | 'corrected';
  
  // Changes
  changes?: Record<string, {
    old_value: any;
    new_value: any;
  }>;
  
  // Context
  reason?: string;
  notes?: string;
  
  // User
  user_id: string;
  user_name: string;
  user_role: string;
  
  // Timestamp
  timestamp: string;
  
  // Request info
  ip_address?: string;
  device_info?: string;
}

// ============================================================================
// Validation & Rules
// ============================================================================

/**
 * Payroll validation result
 */
export interface PayrollValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  
  // Detailed checks
  checks: Array<{
    check_name: string;
    passed: boolean;
    message?: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}

/**
 * Cash advance eligibility check
 */
export interface CashAdvanceEligibility {
  is_eligible: boolean;
  reasons: string[];
  
  // Limits
  max_eligible_amount: number;
  current_balance: number;
  available_amount: number;
  
  // Conditions
  minimum_employment_days_met: boolean;
  maximum_balance_not_exceeded: boolean;
  frequency_limit_not_exceeded: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Payroll system configuration
 */
export interface PayrollConfiguration {
  // General
  company_name: string;
  payroll_frequency: PayrollFrequency;
  pay_day: number;                    // Day of week (0-6) or day of month (1-31)
  cutoff_days_before_pay: number;
  
  // Compensation
  default_compensation_method: CompensationMethod;
  overtime_enabled: boolean;
  default_overtime_threshold: number;
  default_overtime_multiplier: number;
  
  // Deductions
  deduction_rules: DeductionRules;
  
  // Cash advances
  cash_advance_enabled: boolean;
  cash_advance_max_amount: number;
  cash_advance_max_percentage: number;
  cash_advance_min_employment_days: number;
  cash_advance_max_outstanding: number;
  cash_advance_default_installments: number;
  
  // Trip requirements
  require_trip_completion: boolean;
  require_pod_submission: boolean;
  require_pod_approval: boolean;
  
  // Approvals
  require_payroll_approval: boolean;
  require_cash_advance_approval: boolean;
  approval_roles: string[];
  
  // Currency
  currency_code: string;
  currency_symbol: string;
  
  // Rounding
  rounding_precision: number;         // Decimal places
  
  // Last updated
  updated_at: string;
  updated_by: string;
}

// ============================================================================
// Reports
// ============================================================================

/**
 * Payroll summary report
 */
export interface PayrollSummaryReport {
  payroll_period_id: string;
  period_start: string;
  period_end: string;
  
  // Totals
  total_employees: number;
  total_gross_pay: number;
  total_deductions: number;
  total_net_pay: number;
  
  // Breakdown by role
  by_role: Array<{
    role: string;
    employee_count: number;
    total_gross: number;
    total_net: number;
  }>;
  
  // Breakdown by compensation method
  by_compensation_method: Array<{
    method: CompensationMethod;
    employee_count: number;
    total_gross: number;
  }>;
  
  // Cash advances
  total_cash_advance_deductions: number;
  employees_with_advances: number;
  
  // Generated
  generated_at: string;
}

/**
 * Cash advance summary report
 */
export interface CashAdvanceSummaryReport {
  // Period
  report_date: string;
  
  // Totals
  total_active_advances: number;
  total_outstanding_balance: number;
  total_disbursed_this_period: number;
  total_repaid_this_period: number;
  
  // By status
  by_status: Array<{
    status: CashAdvanceStatus;
    count: number;
    total_amount: number;
  }>;
  
  // Aging
  aging_breakdown: Array<{
    age_range: string;          // e.g., "0-30 days", "31-60 days"
    count: number;
    total_balance: number;
  }>;
  
  // Generated
  generated_at: string;
}

// ============================================================================
// Constants
// ============================================================================

export const COMPENSATION_METHOD_LABELS: Record<CompensationMethod, string> = {
  weekly_salary: 'Weekly Salary',
  monthly_salary: 'Monthly Salary',
  daily_rate: 'Daily Rate',
  per_trip: 'Per Trip',
  destination_based: 'Destination-Based',
  hourly_rate: 'Hourly Rate',
};

export const EARNINGS_TYPE_LABELS: Record<EarningsType, string> = {
  base_salary: 'Base Salary',
  base_wage: 'Base Wage',
  trip_earnings: 'Trip Earnings',
  overtime: 'Overtime Pay',
  rest_day_pay: 'Rest Day Pay',
  holiday_pay: 'Holiday Pay',
  allowance: 'Allowance',
  bonus: 'Bonus',
  adjustment: 'Adjustment',
};

export const DEDUCTION_TYPE_LABELS: Record<DeductionType, string> = {
  tax: 'Tax Withholding',
  social_security: 'Social Security',
  health_insurance: 'Health Insurance',
  pension: 'Pension Contribution',
  union_dues: 'Union Dues',
  loan_repayment: 'Loan Repayment',
  cash_advance: 'Cash Advance Repayment',
  damage_charge: 'Damage Charge',
  absence_deduction: 'Absence Deduction',
  other: 'Other Deduction',
};

export const CASH_ADVANCE_STATUS_LABELS: Record<CashAdvanceStatus, string> = {
  draft: 'Draft',
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  disbursed: 'Disbursed',
  repaying: 'Repaying',
  completed: 'Completed',
  written_off: 'Written Off',
};

export const CASH_ADVANCE_STATUS_COLORS: Record<CashAdvanceStatus, string> = {
  draft: '#6B7280',
  pending: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
  disbursed: '#3B82F6',
  repaying: '#8B5CF6',
  completed: '#059669',
  written_off: '#DC2626',
};

/**
 * Default payroll configuration
 */
export const DEFAULT_PAYROLL_CONFIG: PayrollConfiguration = {
  company_name: 'Vone Trucking',
  payroll_frequency: 'monthly',
  pay_day: 30,
  cutoff_days_before_pay: 2,
  
  default_compensation_method: 'per_trip',
  overtime_enabled: true,
  default_overtime_threshold: 40,
  default_overtime_multiplier: 1.5,
  
  deduction_rules: {
    max_cash_advance_deduction_percentage: 30,
    minimum_net_pay_percentage: 50,
    deduction_priority: [
      'tax',
      'social_security',
      'health_insurance',
      'pension',
      'union_dues',
      'cash_advance',
      'loan_repayment',
      'other',
    ],
  },
  
  cash_advance_enabled: true,
  cash_advance_max_amount: 5000,
  cash_advance_max_percentage: 50,
  cash_advance_min_employment_days: 90,
  cash_advance_max_outstanding: 10000,
  cash_advance_default_installments: 3,
  
  require_trip_completion: true,
  require_pod_submission: true,
  require_pod_approval: true,
  
  require_payroll_approval: true,
  require_cash_advance_approval: true,
  approval_roles: ['operator', 'admin'],
  
  currency_code: 'USD',
  currency_symbol: '$',
  rounding_precision: 2,
  
  updated_at: new Date().toISOString(),
  updated_by: 'system',
};
