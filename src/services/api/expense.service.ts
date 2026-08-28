/**
 * Expense Service
 * Handles expense CRUD operations with file upload, validation, and approval workflow
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { ApiResponse, PaginatedResponse } from '../../types';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { 
  Expense, 
  CreateExpenseInput, 
  UpdateExpenseInput,
  ApproveExpenseInput,
  ExpenseFilters,
  ExpenseCategory,
  PaymentMethod,
  ApprovalStatus,
  ExpenseSummary,
} from '../../types/expense.types';

// Demo expenses storage
let demoExpenses: Expense[] = [];
let demoExpenseIdCounter = 1;

/**
 * Generate demo expense ID
 */
const generateDemoExpenseId = (): string => {
  return `exp_demo_${demoExpenseIdCounter++}`;
};

/**
 * Get current date in Asia/Manila timezone (YYYY-MM-DD)
 */
export const getCurrentDateManila = (): string => {
  // Create date in Manila timezone
  const date = new Date();
  const manilaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
  
  const year = manilaDate.getFullYear();
  const month = String(manilaDate.getMonth() + 1).padStart(2, '0');
  const day = String(manilaDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Validate expense amount
 */
export const validateExpenseAmount = (amount: number | string): { valid: boolean; error?: string } => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return { valid: false, error: 'Enter a valid expense amount greater than zero.' };
  }
  
  if (num <= 0) {
    return { valid: false, error: 'Enter a valid expense amount greater than zero.' };
  }
  
  if (num > 9999999.99) {
    return { valid: false, error: 'Amount exceeds maximum allowed value.' };
  }
  
  // Check decimal places
  const decimalPlaces = (num.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { valid: false, error: 'Amount can only have up to 2 decimal places.' };
  }
  
  return { valid: true };
};

/**
 * Validate expense date
 */
export const validateExpenseDate = (date: string): { valid: boolean; error?: string } => {
  if (!date) {
    return { valid: false, error: 'Expense date is required.' };
  }
  
  const expenseDate = new Date(date);
  if (isNaN(expenseDate.getTime())) {
    return { valid: false, error: 'Invalid date format.' };
  }
  
  // Check if date is in the future
  const today = new Date(getCurrentDateManila());
  today.setHours(0, 0, 0, 0);
  expenseDate.setHours(0, 0, 0, 0);
  
  if (expenseDate > today) {
    return { valid: false, error: 'Expense date cannot be in the future.' };
  }
  
  return { valid: true };
};

/**
 * Upload receipt file
 * Returns the file URL and filename
 */
export const uploadReceipt = async (
  fileUri: string,
  expenseId: string
): Promise<ApiResponse<{ url: string; filename: string }>> => {
  try {
    if (!isSupabaseConfigured()) {
      // Demo mode - just return the local URI
      const filename = fileUri.split('/').pop() || 'receipt.jpg';
      return {
        data: {
          url: fileUri,
          filename,
        },
      };
    }

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      return { error: 'File not found' };
    }

    // Generate unique filename
    const fileExt = fileUri.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const filename = `expense_${expenseId}_${timestamp}.${fileExt}`;
    const filePath = `receipts/${filename}`;

    // Read file as base64
    const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to blob
    const blob = await fetch(`data:image/${fileExt};base64,${fileBase64}`).then(r => r.blob());

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('expense-receipts')
      .upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) {
      return { error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('expense-receipts')
      .getPublicUrl(filePath);

    return {
      data: {
        url: urlData.publicUrl,
        filename,
      },
    };
  } catch (error) {
    return { error: 'Failed to upload receipt' };
  }
};

/**
 * Delete receipt file
 */
export const deleteReceipt = async (filename: string): Promise<ApiResponse<void>> => {
  try {
    if (!isSupabaseConfigured()) {
      return { data: undefined };
    }

    const { error } = await supabase.storage
      .from('expense-receipts')
      .remove([`receipts/${filename}`]);

    if (error) {
      return { error: error.message };
    }

    return { data: undefined };
  } catch (error) {
    return { error: 'Failed to delete receipt' };
  }
};


/**
 * Fetch all expenses with optional filters
 */
export const getExpenses = async (
  filters?: ExpenseFilters,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<PaginatedResponse<Expense>>> => {
  try {
    if (!isSupabaseConfigured()) {
      // Return demo data
      let filtered = [...demoExpenses];

      // Apply filters
      if (filters?.trip_id) {
        filtered = filtered.filter(e => e.trip_id === filters.trip_id);
      }
      if (filters?.truck_id) {
        filtered = filtered.filter(e => e.truck_id === filters.truck_id);
      }
      if (filters?.category) {
        filtered = filtered.filter(e => e.category === filters.category);
      }
      if (filters?.payment_method) {
        filtered = filtered.filter(e => e.payment_method === filters.payment_method);
      }
      if (filters?.approval_status) {
        filtered = filtered.filter(e => e.approval_status === filters.approval_status);
      }
      if (filters?.date_from) {
        filtered = filtered.filter(e => e.expense_date >= filters.date_from!);
      }
      if (filters?.date_to) {
        filtered = filtered.filter(e => e.expense_date <= filters.date_to!);
      }

      // Pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = filtered.slice(start, end);

      return {
        data: {
          data: paginatedData,
          total: filtered.length,
          page,
          limit,
          hasMore: filtered.length > end,
        },
      };
    }

    // Supabase implementation
    let query = supabase
      .from('expenses')
      .select(`
        *,
        trips(trip_number),
        trucks(truck_number),
        recorded_by_profile:employee_profiles!expenses_recorded_by_fkey(first_name, last_name, employee_id),
        approved_by_profile:employee_profiles!expenses_approved_by_fkey(first_name, last_name)
      `, { count: 'exact' })
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.trip_id) {
      query = query.eq('trip_id', filters.trip_id);
    }
    if (filters?.truck_id) {
      query = query.eq('truck_id', filters.truck_id);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.payment_method) {
      query = query.eq('payment_method', filters.payment_method);
    }
    if (filters?.approval_status) {
      query = query.eq('approval_status', filters.approval_status);
    }
    if (filters?.date_from) {
      query = query.gte('expense_date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('expense_date', filters.date_to);
    }
    if (filters?.recorded_by) {
      query = query.eq('recorded_by', filters.recorded_by);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return { error: error.message };
    }

    // Format expenses with joined data
    const expenses = (data || []).map((expense: any) => ({
      ...expense,
      trip_number: expense.trips?.trip_number,
      truck_number: expense.trucks?.truck_number,
      recorded_by_name: expense.recorded_by_profile
        ? `${expense.recorded_by_profile.first_name} ${expense.recorded_by_profile.last_name}`
        : undefined,
      recorded_by_employee_number: expense.recorded_by_profile?.employee_id,
      approved_by_name: expense.approved_by_profile
        ? `${expense.approved_by_profile.first_name} ${expense.approved_by_profile.last_name}`
        : undefined,
    }));

    return {
      data: {
        data: expenses as Expense[],
        total: count || 0,
        page,
        limit,
        hasMore: count ? count > page * limit : false,
      },
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching expenses' };
  }
};


/**
 * Create a new expense
 */
export const createExpense = async (input: CreateExpenseInput): Promise<ApiResponse<Expense>> => {
  try {
    // Validate amount
    const amountValidation = validateExpenseAmount(input.amount);
    if (!amountValidation.valid) {
      return { error: amountValidation.error };
    }

    // Validate date
    const dateValidation = validateExpenseDate(input.expense_date);
    if (!dateValidation.valid) {
      return { error: dateValidation.error };
    }

    // Round amount to 2 decimal places to avoid floating point errors
    const roundedAmount = Math.round(input.amount * 100) / 100;

    if (!isSupabaseConfigured()) {
      // Demo data
      const now = new Date().toISOString();
      const newExpense: Expense = {
        id: generateDemoExpenseId(),
        ...input,
        amount: roundedAmount,
        recorded_by: 'demo_user',
        recorded_by_name: 'Demo Operator',
        recorded_by_employee_number: 'ADMIN-001',
        approval_status: ApprovalStatus.APPROVED, // Auto-approve for operators in demo
        approved_by: 'demo_user',
        approved_by_name: 'Demo Operator',
        approved_at: now,
        created_at: now,
        updated_at: now,
      };

      demoExpenses.unshift(newExpense);

      return {
        data: newExpense,
        message: 'Expense recorded successfully',
      };
    }

    // Supabase implementation
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('employee_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Operators auto-approve their own expenses
    const isOperator = profile?.role === 'operator';
    const approvalStatus = isOperator ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...input,
        amount: roundedAmount,
        recorded_by: user.id,
        approval_status: approvalStatus,
        approved_by: isOperator ? user.id : undefined,
        approved_at: isOperator ? now : undefined,
      })
      .select(`
        *,
        trips(trip_number),
        trucks(truck_number),
        recorded_by_profile:employee_profiles!expenses_recorded_by_fkey(first_name, last_name, employee_id)
      `)
      .single();

    if (error) {
      // Clean up uploaded receipt if expense creation failed
      if (input.receipt_filename) {
        await deleteReceipt(input.receipt_filename);
      }
      return { error: error.message };
    }

    // Format response
    const expense: Expense = {
      ...data,
      trip_number: (data as any).trips?.trip_number,
      truck_number: (data as any).trucks?.truck_number,
      recorded_by_name: (data as any).recorded_by_profile
        ? `${(data as any).recorded_by_profile.first_name} ${(data as any).recorded_by_profile.last_name}`
        : undefined,
      recorded_by_employee_number: (data as any).recorded_by_profile?.employee_id,
    };

    return {
      data: expense,
      message: 'Expense recorded successfully',
    };
  } catch (error) {
    // Clean up uploaded receipt if any error occurred
    if (input.receipt_filename) {
      await deleteReceipt(input.receipt_filename);
    }
    return { error: 'An unexpected error occurred while creating expense' };
  }
};


/**
 * Update an expense
 */
export const updateExpense = async (input: UpdateExpenseInput): Promise<ApiResponse<Expense>> => {
  try {
    // Validate amount if provided
    if (input.amount !== undefined) {
      const amountValidation = validateExpenseAmount(input.amount);
      if (!amountValidation.valid) {
        return { error: amountValidation.error };
      }
      // Round amount to 2 decimal places
      input.amount = Math.round(input.amount * 100) / 100;
    }

    // Validate date if provided
    if (input.expense_date) {
      const dateValidation = validateExpenseDate(input.expense_date);
      if (!dateValidation.valid) {
        return { error: dateValidation.error };
      }
    }

    if (!isSupabaseConfigured()) {
      // Demo data
      const { id, ...updates } = input;
      const expenseIndex = demoExpenses.findIndex(e => e.id === id);

      if (expenseIndex === -1) {
        return { error: 'Expense not found' };
      }

      const updatedExpense = {
        ...demoExpenses[expenseIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      demoExpenses[expenseIndex] = updatedExpense;

      return {
        data: updatedExpense,
        message: 'Expense updated successfully',
      };
    }

    // Supabase implementation
    const { id, ...updates } = input;

    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        trips(trip_number),
        trucks(truck_number),
        recorded_by_profile:employee_profiles!expenses_recorded_by_fkey(first_name, last_name, employee_id)
      `)
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Expense not found' };
    }

    // Format response
    const expense: Expense = {
      ...data,
      trip_number: (data as any).trips?.trip_number,
      truck_number: (data as any).trucks?.truck_number,
      recorded_by_name: (data as any).recorded_by_profile
        ? `${(data as any).recorded_by_profile.first_name} ${(data as any).recorded_by_profile.last_name}`
        : undefined,
      recorded_by_employee_number: (data as any).recorded_by_profile?.employee_id,
    };

    return {
      data: expense,
      message: 'Expense updated successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while updating expense' };
  }
};

/**
 * Approve or reject an expense
 */
export const approveExpense = async (input: ApproveExpenseInput): Promise<ApiResponse<Expense>> => {
  try {
    if (!isSupabaseConfigured()) {
      // Demo data
      const expenseIndex = demoExpenses.findIndex(e => e.id === input.id);

      if (expenseIndex === -1) {
        return { error: 'Expense not found' };
      }

      const now = new Date().toISOString();
      const updatedExpense = {
        ...demoExpenses[expenseIndex],
        approval_status: input.approval_status,
        approved_by: 'demo_user',
        approved_by_name: 'Demo Operator',
        approved_at: input.approval_status === ApprovalStatus.APPROVED ? now : undefined,
        rejection_reason: input.rejection_reason,
        updated_at: now,
      };

      demoExpenses[expenseIndex] = updatedExpense;

      return {
        data: updatedExpense,
        message: input.approval_status === ApprovalStatus.APPROVED 
          ? 'Expense approved successfully' 
          : 'Expense rejected',
      };
    }

    // Supabase implementation
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    const now = new Date().toISOString();
    const updates: any = {
      approval_status: input.approval_status,
      rejection_reason: input.rejection_reason,
    };

    if (input.approval_status === ApprovalStatus.APPROVED) {
      updates.approved_by = user.id;
      updates.approved_at = now;
    }

    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', input.id)
      .select(`
        *,
        trips(trip_number),
        trucks(truck_number),
        recorded_by_profile:employee_profiles!expenses_recorded_by_fkey(first_name, last_name, employee_id),
        approved_by_profile:employee_profiles!expenses_approved_by_fkey(first_name, last_name)
      `)
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Expense not found' };
    }

    // Format response
    const expense: Expense = {
      ...data,
      trip_number: (data as any).trips?.trip_number,
      truck_number: (data as any).trucks?.truck_number,
      recorded_by_name: (data as any).recorded_by_profile
        ? `${(data as any).recorded_by_profile.first_name} ${(data as any).recorded_by_profile.last_name}`
        : undefined,
      recorded_by_employee_number: (data as any).recorded_by_profile?.employee_id,
      approved_by_name: (data as any).approved_by_profile
        ? `${(data as any).approved_by_profile.first_name} ${(data as any).approved_by_profile.last_name}`
        : undefined,
    };

    return {
      data: expense,
      message: input.approval_status === ApprovalStatus.APPROVED 
        ? 'Expense approved successfully' 
        : 'Expense rejected',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while approving expense' };
  }
};


/**
 * Delete an expense
 */
export const deleteExpense = async (id: string): Promise<ApiResponse<void>> => {
  try {
    if (!isSupabaseConfigured()) {
      // Demo data
      const expenseIndex = demoExpenses.findIndex(e => e.id === id);

      if (expenseIndex === -1) {
        return { error: 'Expense not found' };
      }

      // Delete receipt if exists
      const expense = demoExpenses[expenseIndex];
      if (expense.receipt_filename) {
        await deleteReceipt(expense.receipt_filename);
      }

      demoExpenses.splice(expenseIndex, 1);

      return {
        data: undefined,
        message: 'Expense deleted successfully',
      };
    }

    // Get expense to check for receipt
    const { data: expense } = await supabase
      .from('expenses')
      .select('receipt_filename')
      .eq('id', id)
      .single();

    // Delete receipt if exists
    if (expense?.receipt_filename) {
      await deleteReceipt(expense.receipt_filename);
    }

    // Supabase implementation
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    return {
      data: undefined,
      message: 'Expense deleted successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while deleting expense' };
  }
};

/**
 * Get expense by ID
 */
export const getExpenseById = async (id: string): Promise<ApiResponse<Expense>> => {
  try {
    if (!isSupabaseConfigured()) {
      // Demo data
      const expense = demoExpenses.find(e => e.id === id);

      if (!expense) {
        return { error: 'Expense not found' };
      }

      return { data: expense };
    }

    // Supabase implementation
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        trips(trip_number),
        trucks(truck_number),
        recorded_by_profile:employee_profiles!expenses_recorded_by_fkey(first_name, last_name, employee_id),
        approved_by_profile:employee_profiles!expenses_approved_by_fkey(first_name, last_name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Expense not found' };
    }

    // Format response
    const expense: Expense = {
      ...data,
      trip_number: (data as any).trips?.trip_number,
      truck_number: (data as any).trucks?.truck_number,
      recorded_by_name: (data as any).recorded_by_profile
        ? `${(data as any).recorded_by_profile.first_name} ${(data as any).recorded_by_profile.last_name}`
        : undefined,
      recorded_by_employee_number: (data as any).recorded_by_profile?.employee_id,
      approved_by_name: (data as any).approved_by_profile
        ? `${(data as any).approved_by_profile.first_name} ${(data as any).approved_by_profile.last_name}`
        : undefined,
    };

    return { data: expense };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching expense' };
  }
};

/**
 * Get expenses summary with totals by status and category
 */
export const getExpensesSummary = async (
  dateFrom?: string,
  dateTo?: string
): Promise<ApiResponse<ExpenseSummary>> => {
  try {
    const response = await getExpenses(
      { date_from: dateFrom, date_to: dateTo },
      1,
      1000
    );

    if (response.error || !response.data) {
      return { error: response.error || 'Failed to fetch expenses' };
    }

    const expenses = response.data.data;

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const approved_total = expenses
      .filter(exp => exp.approval_status === ApprovalStatus.APPROVED)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const pending_total = expenses
      .filter(exp => exp.approval_status === ApprovalStatus.PENDING)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const rejected_total = expenses
      .filter(exp => exp.approval_status === ApprovalStatus.REJECTED)
      .reduce((sum, exp) => sum + exp.amount, 0);

    const by_category = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    const by_payment_method = expenses.reduce((acc, exp) => {
      acc[exp.payment_method] = (acc[exp.payment_method] || 0) + exp.amount;
      return acc;
    }, {} as Record<PaymentMethod, number>);

    return {
      data: {
        total,
        approved_total,
        pending_total,
        rejected_total,
        by_category,
        by_payment_method,
        count: expenses.length,
      },
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while calculating expenses summary' };
  }
};
