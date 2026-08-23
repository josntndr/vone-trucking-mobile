/**
 * Expense Type Definitions
 */

export enum ExpenseCategory {
  FUEL = 'fuel',
  TOLL = 'toll',
  PARKING = 'parking',
  REPAIRS = 'repairs',
  MEALS = 'meals',
  LOADING_UNLOADING = 'loading_unloading',
  OTHER = 'other',
}

export enum PaymentMethod {
  CASH = 'cash',
  COMPANY_CARD = 'company_card',
  PETTY_CASH = 'petty_cash',
  REIMBURSEMENT = 'reimbursement',
}

export interface Expense {
  id: string;
  trip_id?: string;
  trip_number?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  time: string;
  payment_method: PaymentMethod;
  description?: string;
  notes?: string;
  receipt_url?: string;
  recorded_by: string;
  recorded_by_name?: string;
  employee_number?: string;
  truck_id?: string;
  truck_number?: string;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseInput {
  trip_id?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  time: string;
  payment_method: PaymentMethod;
  description?: string;
  notes?: string;
  receipt_url?: string;
  truck_id?: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
  id: string;
  is_approved?: boolean;
}

export interface ExpenseFilters {
  trip_id?: string;
  category?: ExpenseCategory;
  payment_method?: PaymentMethod;
  date_from?: string;
  date_to?: string;
  is_approved?: boolean;
  recorded_by?: string;
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.FUEL]: 'Fuel',
  [ExpenseCategory.TOLL]: 'Toll',
  [ExpenseCategory.PARKING]: 'Parking',
  [ExpenseCategory.REPAIRS]: 'Repairs',
  [ExpenseCategory.MEALS]: 'Meals',
  [ExpenseCategory.LOADING_UNLOADING]: 'Loading/Unloading',
  [ExpenseCategory.OTHER]: 'Other',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.COMPANY_CARD]: 'Company Card',
  [PaymentMethod.PETTY_CASH]: 'Petty Cash',
  [PaymentMethod.REIMBURSEMENT]: 'Reimbursement',
};
