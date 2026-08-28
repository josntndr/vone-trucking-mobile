/**
 * Expense Type Definitions
 * Comprehensive expense tracking with trip/truck association, receipts, and approval workflow
 */

export enum ExpenseCategory {
  FUEL = 'fuel',
  TOLL_FEE = 'toll_fee',
  PARKING = 'parking',
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  PARTS_SUPPLIES = 'parts_supplies',
  DRIVER_ALLOWANCE = 'driver_allowance',
  HELPER_ALLOWANCE = 'helper_allowance',
  LOADING_UNLOADING = 'loading_unloading',
  OFFICE_ADMINISTRATIVE = 'office_administrative',
  OTHER = 'other',
}

export enum PaymentMethod {
  CASH = 'cash',
  COMPANY_CARD = 'company_card',
  PETTY_CASH = 'petty_cash',
  BANK_TRANSFER = 'bank_transfer',
  REIMBURSEMENT = 'reimbursement',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface Expense {
  id: string;
  // Trip and Truck Association
  trip_id?: string;
  trip_number?: string;
  truck_id?: string;
  truck_number?: string;
  
  // Expense Details
  category: ExpenseCategory;
  amount: number;
  expense_date: string; // YYYY-MM-DD in Asia/Manila timezone
  payment_method: PaymentMethod;
  description?: string;
  notes?: string;
  
  // Receipt and Documentation
  receipt_url?: string;
  receipt_filename?: string;
  transaction_reference?: string;
  
  // Approval Workflow
  approval_status: ApprovalStatus;
  recorded_by: string;
  recorded_by_name?: string;
  recorded_by_employee_number?: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseInput {
  // Required Fields
  category: ExpenseCategory;
  amount: number;
  expense_date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  
  // Optional Association
  trip_id?: string;
  truck_id?: string;
  
  // Optional Details
  description?: string;
  notes?: string;
  transaction_reference?: string;
  
  // Receipt (handled separately in upload flow)
  receipt_url?: string;
  receipt_filename?: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
  id: string;
}

export interface ApproveExpenseInput {
  id: string;
  approval_status: ApprovalStatus;
  rejection_reason?: string;
}

export interface ExpenseFilters {
  trip_id?: string;
  truck_id?: string;
  category?: ExpenseCategory;
  payment_method?: PaymentMethod;
  approval_status?: ApprovalStatus;
  date_from?: string;
  date_to?: string;
  recorded_by?: string;
}

export interface ExpenseSummary {
  total: number;
  approved_total: number;
  pending_total: number;
  rejected_total: number;
  by_category: Record<ExpenseCategory, number>;
  by_payment_method: Record<PaymentMethod, number>;
  count: number;
}

// Labels for UI display
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.FUEL]: 'Fuel',
  [ExpenseCategory.TOLL_FEE]: 'Toll Fee',
  [ExpenseCategory.PARKING]: 'Parking',
  [ExpenseCategory.MAINTENANCE]: 'Maintenance',
  [ExpenseCategory.REPAIR]: 'Repair',
  [ExpenseCategory.PARTS_SUPPLIES]: 'Parts and Supplies',
  [ExpenseCategory.DRIVER_ALLOWANCE]: 'Driver Allowance',
  [ExpenseCategory.HELPER_ALLOWANCE]: 'Helper Allowance',
  [ExpenseCategory.LOADING_UNLOADING]: 'Loading/Unloading',
  [ExpenseCategory.OFFICE_ADMINISTRATIVE]: 'Office/Administrative',
  [ExpenseCategory.OTHER]: 'Other',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.COMPANY_CARD]: 'Company Card',
  [PaymentMethod.PETTY_CASH]: 'Petty Cash',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
  [PaymentMethod.REIMBURSEMENT]: 'Reimbursement',
};

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  [ApprovalStatus.PENDING]: 'Pending',
  [ApprovalStatus.APPROVED]: 'Approved',
  [ApprovalStatus.REJECTED]: 'Rejected',
};

// Categories that typically require trip association
export const TRIP_RELATED_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.FUEL,
  ExpenseCategory.TOLL_FEE,
  ExpenseCategory.PARKING,
  ExpenseCategory.DRIVER_ALLOWANCE,
  ExpenseCategory.HELPER_ALLOWANCE,
  ExpenseCategory.LOADING_UNLOADING,
];

// Categories that typically require truck association
export const TRUCK_RELATED_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.MAINTENANCE,
  ExpenseCategory.REPAIR,
  ExpenseCategory.PARTS_SUPPLIES,
];

// Categories that require description when selected
export const REQUIRES_DESCRIPTION: ExpenseCategory[] = [
  ExpenseCategory.OTHER,
];
