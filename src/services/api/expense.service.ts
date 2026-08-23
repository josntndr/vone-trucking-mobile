/**
 * Expense Service
 * Handles expense CRUD operations
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { ApiResponse, PaginatedResponse } from '../../types';
import type { 
  Expense, 
  CreateExpenseInput, 
  UpdateExpenseInput, 
  ExpenseFilters,
  ExpenseCategory,
  PaymentMethod,
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
      if (filters?.category) {
        filtered = filtered.filter(e => e.category === filters.category);
      }
      if (filters?.payment_method) {
        filtered = filtered.filter(e => e.payment_method === filters.payment_method);
      }
      if (filters?.is_approved !== undefined) {
        filtered = filtered.filter(e => e.is_approved === filters.is_approved);
      }
      if (filters?.date_from) {
        filtered = filtered.filter(e => e.date >= filters.date_from!);
      }
      if (filters?.date_to) {
        filtered = filtered.filter(e => e.date <= filters.date_to!);
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
      .select('*, trips(trip_number), trucks(truck_number)', { count: 'exact' })
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    // Apply filters
    if (filters?.trip_id) {
      query = query.eq('trip_id', filters.trip_id);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.payment_method) {
      query = query.eq('payment_method', filters.payment_method);
    }
    if (filters?.is_approved !== undefined) {
      query = query.eq('is_approved', filters.is_approved);
    }
    if (filters?.date_from) {
      query = query.gte('date', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('date', filters.date_to);
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

    return {
      data: {
        data: data as Expense[],
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
    if (!isSupabaseConfigured()) {
      // Demo data
      const now = new Date().toISOString();
      const newExpense: Expense = {
        id: generateDemoExpenseId(),
        ...input,
        recorded_by: 'demo_user',
        recorded_by_name: 'Demo Operator',
        employee_number: 'ADMIN-001',
        is_approved: false,
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

    const { data, error } = await supabase
      .from('expenses')
      .insert({
        ...input,
        recorded_by: user.id,
        is_approved: false,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return {
      data: data as Expense,
      message: 'Expense recorded successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while creating expense' };
  }
};

/**
 * Update an expense
 */
export const updateExpense = async (input: UpdateExpenseInput): Promise<ApiResponse<Expense>> => {
  try {
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
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Expense not found' };
    }

    return {
      data: data as Expense,
      message: 'Expense updated successfully',
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while updating expense' };
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

      demoExpenses.splice(expenseIndex, 1);

      return {
        data: undefined,
        message: 'Expense deleted successfully',
      };
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
      .select('*, trips(trip_number), trucks(truck_number)')
      .eq('id', id)
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Expense not found' };
    }

    return { data: data as Expense };
  } catch (error) {
    return { error: 'An unexpected error occurred while fetching expense' };
  }
};

/**
 * Get expenses summary
 */
export const getExpensesSummary = async (
  dateFrom?: string,
  dateTo?: string
): Promise<ApiResponse<{
  total: number;
  byCategory: Record<ExpenseCategory, number>;
  byPaymentMethod: Record<PaymentMethod, number>;
}>> => {
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

    const byCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    const byPaymentMethod = expenses.reduce((acc, exp) => {
      acc[exp.payment_method] = (acc[exp.payment_method] || 0) + exp.amount;
      return acc;
    }, {} as Record<PaymentMethod, number>);

    return {
      data: {
        total,
        byCategory,
        byPaymentMethod,
      },
    };
  } catch (error) {
    return { error: 'An unexpected error occurred while calculating expenses summary' };
  }
};
