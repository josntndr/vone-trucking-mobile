/**
 * Trip Expense Management Service
 * 
 * Manages all trip expenses including fuel, tolls, parking, meals,
 * repairs, emergency expenses, and other costs.
 */

import type {
  TripExpense,
  ExpenseCategory,
  TripExpenseSummary,
  EXPENSE_CATEGORY_LABELS,
} from '../../types/fuel.types';

interface CreateExpenseInput {
  trip_id: string;
  truck_id: string;
  driver_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  fuel_record_id?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  expense_date: string;
  receipt_photo_url?: string;
  receipt_number?: string;
  notes?: string;
}

interface ExpenseValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

export class TripExpenseService {
  private readonly MIN_AMOUNT = 0.01;
  private readonly MAX_AMOUNT = 100000;
  private readonly MIN_DESCRIPTION_LENGTH = 5;

  /**
   * Create new expense record
   */
  async createExpense(input: CreateExpenseInput): Promise<TripExpense> {
    // Validate input
    const validation = this.validateExpense(input);
    if (!validation.is_valid) {
      throw new Error(`Invalid expense: ${validation.errors.join(', ')}`);
    }

    // Create expense
    const expense: TripExpense = {
      id: this.generateExpenseId(),
      trip_id: input.trip_id,
      truck_id: input.truck_id,
      driver_id: input.driver_id,
      category: input.category,
      description: input.description.trim(),
      amount: this.roundToDecimal(input.amount, 2),
      fuel_record_id: input.fuel_record_id,
      location: input.location?.trim(),
      latitude: input.latitude,
      longitude: input.longitude,
      expense_date: input.expense_date,
      receipt_photo_url: input.receipt_photo_url,
      receipt_number: input.receipt_number?.trim(),
      is_approved: false,
      notes: input.notes?.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return expense;
  }

  /**
   * Update existing expense
   */
  async updateExpense(
    existingExpense: TripExpense,
    updates: Partial<CreateExpenseInput>
  ): Promise<TripExpense> {
    if (existingExpense.is_approved) {
      throw new Error('Cannot update approved expense');
    }

    // Merge updates
    const updatedInput = {
      trip_id: updates.trip_id || existingExpense.trip_id,
      truck_id: updates.truck_id || existingExpense.truck_id,
      driver_id: updates.driver_id || existingExpense.driver_id,
      category: updates.category || existingExpense.category,
      description: updates.description || existingExpense.description,
      amount: updates.amount ?? existingExpense.amount,
      fuel_record_id: updates.fuel_record_id || existingExpense.fuel_record_id,
      location: updates.location || existingExpense.location,
      latitude: updates.latitude ?? existingExpense.latitude,
      longitude: updates.longitude ?? existingExpense.longitude,
      expense_date: updates.expense_date || existingExpense.expense_date,
      receipt_photo_url: updates.receipt_photo_url || existingExpense.receipt_photo_url,
      receipt_number: updates.receipt_number || existingExpense.receipt_number,
      notes: updates.notes || existingExpense.notes,
    };

    // Re-validate
    const validation = this.validateExpense(updatedInput);
    if (!validation.is_valid) {
      throw new Error(`Invalid expense update: ${validation.errors.join(', ')}`);
    }

    // Update expense
    return {
      ...existingExpense,
      category: updatedInput.category,
      description: updatedInput.description.trim(),
      amount: this.roundToDecimal(updatedInput.amount, 2),
      fuel_record_id: updatedInput.fuel_record_id,
      location: updatedInput.location?.trim(),
      latitude: updatedInput.latitude,
      longitude: updatedInput.longitude,
      expense_date: updatedInput.expense_date,
      receipt_photo_url: updatedInput.receipt_photo_url,
      receipt_number: updatedInput.receipt_number?.trim(),
      notes: updatedInput.notes?.trim(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Delete expense
   */
  async deleteExpense(expense: TripExpense): Promise<void> {
    if (expense.is_approved) {
      throw new Error('Cannot delete approved expense. Request operator review.');
    }

    // In production, would mark as deleted in database
    console.log('[TripExpense] Deleting expense:', expense.id);
  }

  /**
   * Approve expense
   */
  approveExpense(
    expense: TripExpense,
    operatorId: string
  ): TripExpense {
    if (expense.is_approved) {
      throw new Error('Expense already approved');
    }

    return {
      ...expense,
      is_approved: true,
      approved_by: operatorId,
      approved_at: new Date().toISOString(),
      rejection_reason: undefined, // Clear any previous rejection
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Reject expense
   */
  rejectExpense(
    expense: TripExpense,
    operatorId: string,
    reason: string
  ): TripExpense {
    if (!reason || reason.trim().length < 10) {
      throw new Error('Rejection reason must be at least 10 characters');
    }

    return {
      ...expense,
      is_approved: false,
      approved_by: operatorId,
      approved_at: new Date().toISOString(),
      rejection_reason: reason.trim(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Bulk approve expenses
   */
  async bulkApprove(
    expenses: TripExpense[],
    operatorId: string
  ): Promise<TripExpense[]> {
    const approved: TripExpense[] = [];

    for (const expense of expenses) {
      if (!expense.is_approved) {
        approved.push(this.approveExpense(expense, operatorId));
      } else {
        approved.push(expense);
      }
    }

    return approved;
  }

  /**
   * Validate expense input
   */
  private validateExpense(input: CreateExpenseInput): ExpenseValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate category
    const validCategories: ExpenseCategory[] = [
      'fuel',
      'toll_fees',
      'parking',
      'meals_allowances',
      'repairs',
      'emergency',
      'other',
    ];

    if (!validCategories.includes(input.category)) {
      errors.push('Invalid expense category');
    }

    // Validate description
    if (!input.description || input.description.trim().length < this.MIN_DESCRIPTION_LENGTH) {
      errors.push(
        `Description must be at least ${this.MIN_DESCRIPTION_LENGTH} characters`
      );
    }

    // Validate amount
    if (input.amount < this.MIN_AMOUNT) {
      errors.push(`Amount must be at least $${this.MIN_AMOUNT}`);
    }

    if (input.amount > this.MAX_AMOUNT) {
      errors.push(`Amount exceeds maximum $${this.MAX_AMOUNT}`);
      warnings.push('Unusually high expense amount. Please verify.');
    }

    // Warn on large expenses
    if (input.amount > 1000) {
      warnings.push('Large expense (>$1000). Receipt required.');
    }

    // Validate fuel category specific rules
    if (input.category === 'fuel' && !input.fuel_record_id) {
      warnings.push('Fuel expense should reference a fuel record');
    }

    // Validate repair expenses
    if (input.category === 'repairs' && input.amount > 500) {
      warnings.push('Large repair expense. Ensure proper documentation.');
    }

    // Validate emergency expenses
    if (input.category === 'emergency' && !input.notes) {
      warnings.push('Emergency expense should include detailed notes');
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate trip expense summary by category
   */
  calculateTripSummary(
    tripId: string,
    expenses: TripExpense[]
  ): TripExpenseSummary {
    const tripExpenses = expenses.filter(e => e.trip_id === tripId);

    const summary: TripExpenseSummary = {
      trip_id: tripId,
      fuel: 0,
      toll_fees: 0,
      parking: 0,
      meals_allowances: 0,
      repairs: 0,
      emergency: 0,
      other: 0,
      total: 0,
      approved_total: 0,
      pending_approval_total: 0,
    };

    for (const expense of tripExpenses) {
      // Add to category total
      summary[expense.category] += expense.amount;

      // Add to overall total
      summary.total += expense.amount;

      // Add to approved or pending
      if (expense.is_approved) {
        summary.approved_total += expense.amount;
      } else {
        summary.pending_approval_total += expense.amount;
      }
    }

    // Round all values
    Object.keys(summary).forEach(key => {
      if (typeof summary[key as keyof TripExpenseSummary] === 'number') {
        (summary[key as keyof TripExpenseSummary] as number) = this.roundToDecimal(
          summary[key as keyof TripExpenseSummary] as number,
          2
        );
      }
    });

    return summary;
  }

  /**
   * Get expenses by category
   */
  getExpensesByCategory(
    expenses: TripExpense[],
    category: ExpenseCategory
  ): TripExpense[] {
    return expenses.filter(e => e.category === category);
  }

  /**
   * Get expenses by trip
   */
  getExpensesByTrip(
    expenses: TripExpense[],
    tripId: string
  ): TripExpense[] {
    return expenses.filter(e => e.trip_id === tripId);
  }

  /**
   * Get unapproved expenses
   */
  getUnapprovedExpenses(expenses: TripExpense[]): TripExpense[] {
    return expenses.filter(e => !e.is_approved);
  }

  /**
   * Get expenses without receipts
   */
  getExpensesWithoutReceipts(
    expenses: TripExpense[],
    minAmount: number = 50
  ): TripExpense[] {
    return expenses.filter(
      e => !e.receipt_photo_url && e.amount >= minAmount
    );
  }

  /**
   * Get expense category label
   */
  getCategoryLabel(category: ExpenseCategory): string {
    const labels: Record<ExpenseCategory, string> = {
      fuel: 'Fuel',
      toll_fees: 'Toll Fees',
      parking: 'Parking',
      meals_allowances: 'Meals & Allowances',
      repairs: 'Repairs',
      emergency: 'Emergency Expenses',
      other: 'Other Expenses',
    };

    return labels[category] || category;
  }

  /**
   * Get expense category color (for UI)
   */
  getCategoryColor(category: ExpenseCategory): string {
    const colors: Record<ExpenseCategory, string> = {
      fuel: '#3B82F6',           // Blue
      toll_fees: '#8B5CF6',      // Purple
      parking: '#EC4899',        // Pink
      meals_allowances: '#F59E0B', // Amber
      repairs: '#EF4444',        // Red
      emergency: '#DC2626',      // Dark red
      other: '#6B7280',          // Gray
    };

    return colors[category] || '#6B7280';
  }

  /**
   * Get expense category icon (for UI)
   */
  getCategoryIcon(category: ExpenseCategory): string {
    const icons: Record<ExpenseCategory, string> = {
      fuel: 'fuel',
      toll_fees: 'car',
      parking: 'car-side',
      meals_allowances: 'restaurant',
      repairs: 'wrench',
      emergency: 'alert-circle',
      other: 'receipt',
    };

    return icons[category] || 'receipt';
  }

  /**
   * Format expense summary for display
   */
  formatSummaryForDisplay(summary: TripExpenseSummary): {
    category: string;
    amount: number;
    formatted: string;
    color: string;
  }[] {
    const categories: ExpenseCategory[] = [
      'fuel',
      'toll_fees',
      'parking',
      'meals_allowances',
      'repairs',
      'emergency',
      'other',
    ];

    return categories
      .map(category => ({
        category: this.getCategoryLabel(category),
        amount: summary[category],
        formatted: this.formatCurrency(summary[category]),
        color: this.getCategoryColor(category),
      }))
      .filter(item => item.amount > 0); // Only show categories with expenses
  }

  /**
   * Upload expense receipt
   */
  async uploadReceipt(
    expenseId: string,
    photoFile: File | Blob
  ): Promise<string> {
    // TODO: Implement actual file upload to cloud storage
    const fileName = `expense_receipt_${expenseId}_${Date.now()}.jpg`;
    const mockUrl = `/uploads/expense-receipts/${fileName}`;
    
    console.log('[TripExpense] Uploading receipt:', fileName);
    
    return mockUrl;
  }

  /**
   * Export expenses to CSV
   */
  exportToCSV(expenses: TripExpense[]): string {
    const headers = [
      'Date',
      'Category',
      'Description',
      'Amount',
      'Location',
      'Receipt',
      'Approved',
      'Notes',
    ];

    const rows = expenses.map(expense => [
      new Date(expense.expense_date).toLocaleDateString(),
      this.getCategoryLabel(expense.category),
      expense.description,
      this.formatCurrency(expense.amount),
      expense.location || '',
      expense.receipt_photo_url ? 'Yes' : 'No',
      expense.is_approved ? 'Yes' : 'Pending',
      expense.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Calculate daily expense average
   */
  calculateDailyAverage(expenses: TripExpense[]): number {
    if (expenses.length === 0) return 0;

    // Get unique dates
    const dates = new Set(
      expenses.map(e => e.expense_date.split('T')[0])
    );

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const dayCount = dates.size;

    return this.roundToDecimal(totalAmount / dayCount, 2);
  }

  /**
   * Find duplicate expenses (same amount, date, category)
   */
  findDuplicates(expenses: TripExpense[]): TripExpense[][] {
    const duplicates: TripExpense[][] = [];
    const seen = new Map<string, TripExpense[]>();

    for (const expense of expenses) {
      const key = `${expense.expense_date.split('T')[0]}_${expense.category}_${expense.amount}`;
      
      if (seen.has(key)) {
        seen.get(key)!.push(expense);
      } else {
        seen.set(key, [expense]);
      }
    }

    // Return only groups with duplicates
    seen.forEach(group => {
      if (group.length > 1) {
        duplicates.push(group);
      }
    });

    return duplicates;
  }

  /**
   * Round to decimal places
   */
  private roundToDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Format currency
   */
  private formatCurrency(amount: number, currency: string = '$'): string {
    return `${currency}${amount.toFixed(2)}`;
  }

  /**
   * Generate unique expense ID
   */
  private generateExpenseId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get expense statistics
   */
  getExpenseStatistics(expenses: TripExpense[]): {
    total_count: number;
    total_amount: number;
    approved_count: number;
    approved_amount: number;
    pending_count: number;
    pending_amount: number;
    rejected_count: number;
    with_receipt_count: number;
    without_receipt_count: number;
    categories: Record<ExpenseCategory, { count: number; amount: number }>;
  } {
    const stats = {
      total_count: expenses.length,
      total_amount: 0,
      approved_count: 0,
      approved_amount: 0,
      pending_count: 0,
      pending_amount: 0,
      rejected_count: 0,
      with_receipt_count: 0,
      without_receipt_count: 0,
      categories: {
        fuel: { count: 0, amount: 0 },
        toll_fees: { count: 0, amount: 0 },
        parking: { count: 0, amount: 0 },
        meals_allowances: { count: 0, amount: 0 },
        repairs: { count: 0, amount: 0 },
        emergency: { count: 0, amount: 0 },
        other: { count: 0, amount: 0 },
      } as Record<ExpenseCategory, { count: number; amount: number }>,
    };

    for (const expense of expenses) {
      stats.total_amount += expense.amount;

      if (expense.is_approved && !expense.rejection_reason) {
        stats.approved_count++;
        stats.approved_amount += expense.amount;
      } else if (expense.rejection_reason) {
        stats.rejected_count++;
      } else {
        stats.pending_count++;
        stats.pending_amount += expense.amount;
      }

      if (expense.receipt_photo_url) {
        stats.with_receipt_count++;
      } else {
        stats.without_receipt_count++;
      }

      // Category statistics
      stats.categories[expense.category].count++;
      stats.categories[expense.category].amount += expense.amount;
    }

    // Round amounts
    stats.total_amount = this.roundToDecimal(stats.total_amount, 2);
    stats.approved_amount = this.roundToDecimal(stats.approved_amount, 2);
    stats.pending_amount = this.roundToDecimal(stats.pending_amount, 2);

    Object.keys(stats.categories).forEach(key => {
      stats.categories[key as ExpenseCategory].amount = this.roundToDecimal(
        stats.categories[key as ExpenseCategory].amount,
        2
      );
    });

    return stats;
  }
}

// Export singleton instance
export const tripExpenseService = new TripExpenseService();
