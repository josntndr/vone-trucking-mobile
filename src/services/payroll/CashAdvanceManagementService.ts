// @ts-nocheck
/**
 * Cash Advance Management Service
 * 
 * Handles cash advance requests, approvals, repayments, and balance tracking:
 * - Eligibility checking
 * - Request creation and approval
 * - Repayment term calculation
 * - Payroll deduction integration
 * - Manual repayment processing
 * - Balance tracking and history
 * - Transaction audit trail
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CashAdvanceRequest,
  CashAdvanceTransaction,
  CashAdvanceBalance,
  CashAdvanceEligibility,
  CashAdvanceRepaymentTerms,
  PayrollConfiguration,
} from '../../types/payroll.types';
import {
  DEFAULT_PAYROLL_CONFIG,
} from '../../types/payroll.types';

const CASH_ADVANCE_STORAGE_KEY = '@vone_cash_advances';
const TRANSACTION_STORAGE_KEY = '@vone_cash_advance_transactions';

interface CreateCashAdvanceInput {
  employee_id: string;
  employee_name: string;
  amount_requested: number;
  purpose: string;
  needed_by_date?: string;
  supporting_document_urls?: string[];
  supporting_document_notes?: string;
  created_by: string;
}

export class CashAdvanceManagementService {
  private config: PayrollConfiguration;

  constructor(config?: Partial<PayrollConfiguration>) {
    this.config = { ...DEFAULT_PAYROLL_CONFIG, ...config };
  }

  /**
   * Check employee eligibility for cash advance
   */
  async checkEligibility(
    employeeId: string,
    requestedAmount: number
  ): Promise<CashAdvanceEligibility> {
    const reasons: string[] = [];
    let isEligible = true;

    // Check if cash advances are enabled
    if (!this.config.cash_advance_enabled) {
      reasons.push('Cash advances are currently not available');
      isEligible = false;
    }

    // Get current balance
    const balance = await this.getEmployeeBalance(employeeId);

    // Check maximum amount
    const maxAmount = this.config.cash_advance_max_amount;
    if (requestedAmount > maxAmount) {
      reasons.push(`Requested amount ($${requestedAmount}) exceeds maximum allowed ($${maxAmount})`);
      isEligible = false;
    }

    // Check maximum outstanding balance
    const maxOutstanding = this.config.cash_advance_max_outstanding;
    if (balance.current_balance + requestedAmount > maxOutstanding) {
      reasons.push(`Total outstanding would exceed maximum ($${maxOutstanding})`);
      isEligible = false;
    }

    // Check minimum employment period
    const employmentDays = await this.getEmploymentDays(employeeId);
    const minDays = this.config.cash_advance_min_employment_days;
    if (employmentDays < minDays) {
      reasons.push(`Minimum employment period not met (${employmentDays}/${minDays} days)`);
      isEligible = false;
    }

    // Calculate available amount
    const availableAmount = Math.max(
      0,
      Math.min(
        maxAmount - requestedAmount,
        maxOutstanding - balance.current_balance
      )
    );

    return {
      is_eligible: isEligible,
      reasons,
      max_eligible_amount: maxAmount,
      current_balance: balance.current_balance,
      available_amount: availableAmount,
      minimum_employment_days_met: employmentDays >= minDays,
      maximum_balance_not_exceeded: balance.current_balance < maxOutstanding,
      frequency_limit_not_exceeded: true, // TODO: Implement frequency checking
    };
  }

  /**
   * Create cash advance request
   */
  async createRequest(input: CreateCashAdvanceInput): Promise<CashAdvanceRequest> {
    // Check eligibility
    const eligibility = await this.checkEligibility(
      input.employee_id,
      input.amount_requested
    );

    if (!eligibility.is_eligible) {
      throw new Error(`Not eligible for cash advance: ${eligibility.reasons.join(', ')}`);
    }

    const now = new Date().toISOString();

    // Calculate repayment terms
    const repaymentTerms = this.calculateRepaymentTerms(
      input.amount_requested,
      now
    );

    const request: CashAdvanceRequest = {
      id: this.generateAdvanceId(),
      employee_id: input.employee_id,
      employee_name: input.employee_name,
      amount_requested: input.amount_requested,
      purpose: input.purpose,
      request_date: now,
      needed_by_date: input.needed_by_date,
      supporting_document_urls: input.supporting_document_urls || [],
      supporting_document_notes: input.supporting_document_notes,
      status: 'pending',
      repayment_terms: repaymentTerms,
      acknowledged_by_employee: false,
      created_at: now,
      updated_at: now,
      created_by: input.created_by,
    };

    // Save request
    await this.saveAdvance(request);

    return request;
  }

  /**
   * Approve cash advance request
   */
  async approveRequest(
    advanceId: string,
    approvedBy: string,
    approvedAmount?: number,
    approvalNotes?: string
  ): Promise<CashAdvanceRequest> {
    const advance = await this.getAdvance(advanceId);

    if (!advance) {
      throw new Error('Cash advance not found');
    }

    if (advance.status !== 'pending') {
      throw new Error(`Cannot approve advance with status: ${advance.status}`);
    }

    const now = new Date().toISOString();
    const finalAmount = approvedAmount || advance.amount_requested;

    // Recalculate repayment terms if amount changed
    let repaymentTerms = advance.repayment_terms;
    if (finalAmount !== advance.amount_requested) {
      repaymentTerms = this.calculateRepaymentTerms(finalAmount, now);
    }

    const updated: CashAdvanceRequest = {
      ...advance,
      status: 'approved',
      amount_approved: finalAmount,
      reviewed_by: approvedBy,
      reviewed_at: now,
      approval_notes: approvalNotes,
      repayment_terms: repaymentTerms,
      updated_at: now,
    };

    await this.saveAdvance(updated);

    return updated;
  }

  /**
   * Reject cash advance request
   */
  async rejectRequest(
    advanceId: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<CashAdvanceRequest> {
    const advance = await this.getAdvance(advanceId);

    if (!advance) {
      throw new Error('Cash advance not found');
    }

    if (advance.status !== 'pending') {
      throw new Error(`Cannot reject advance with status: ${advance.status}`);
    }

    const now = new Date().toISOString();

    const updated: CashAdvanceRequest = {
      ...advance,
      status: 'rejected',
      reviewed_by: rejectedBy,
      reviewed_at: now,
      rejection_reason: rejectionReason,
      updated_at: now,
    };

    await this.saveAdvance(updated);

    return updated;
  }

  /**
   * Disburse approved advance
   */
  async disburseAdvance(
    advanceId: string,
    disbursedBy: string,
    disbursementMethod: 'cash' | 'bank_transfer' | 'check',
    disbursementReference?: string
  ): Promise<CashAdvanceRequest> {
    const advance = await this.getAdvance(advanceId);

    if (!advance) {
      throw new Error('Cash advance not found');
    }

    if (advance.status !== 'approved') {
      throw new Error(`Cannot disburse advance with status: ${advance.status}`);
    }

    const now = new Date().toISOString();
    const amount = advance.amount_approved || advance.amount_requested;

    // Record disbursement transaction
    await this.recordTransaction({
      cash_advance_id: advanceId,
      type: 'disbursement',
      amount: amount,
      transaction_date: now,
      source: disbursementMethod === 'cash' ? 'cash' : 'bank_transfer',
      reference_number: disbursementReference,
      notes: `Disbursed via ${disbursementMethod}`,
      balance_after: amount,
      created_by: disbursedBy,
    });

    const updated: CashAdvanceRequest = {
      ...advance,
      status: 'disbursed',
      disbursed_at: now,
      disbursed_by: disbursedBy,
      disbursement_method: disbursementMethod,
      disbursement_reference: disbursementReference,
      updated_at: now,
    };

    await this.saveAdvance(updated);

    return updated;
  }

  /**
   * Employee acknowledges advance receipt
   */
  async acknowledgeAdvance(
    advanceId: string,
    employeeId: string
  ): Promise<CashAdvanceRequest> {
    const advance = await this.getAdvance(advanceId);

    if (!advance) {
      throw new Error('Cash advance not found');
    }

    if (advance.employee_id !== employeeId) {
      throw new Error('Unauthorized: This advance belongs to another employee');
    }

    if (advance.status !== 'disbursed' && advance.status !== 'repaying') {
      throw new Error(`Cannot acknowledge advance with status: ${advance.status}`);
    }

    const now = new Date().toISOString();

    const updated: CashAdvanceRequest = {
      ...advance,
      status: 'repaying',
      acknowledged_by_employee: true,
      acknowledged_at: now,
      updated_at: now,
    };

    await this.saveAdvance(updated);

    return updated;
  }

  /**
   * Process payroll deduction for cash advance
   */
  async processPayrollDeduction(
    advanceId: string,
    deductionAmount: number,
    payrollRecordId: string,
    processedBy: string
  ): Promise<CashAdvanceRequest> {
    const advance = await this.getAdvance(advanceId);

    if (!advance) {
      throw new Error('Cash advance not found');
    }

    if (advance.status !== 'repaying') {
      throw new Error(`Cannot deduct from advance with status: ${advance.status}`);
    }

    const now = new Date().toISOString();
    const currentBalance = await this.getCurrentBalance(advanceId);
    const newBalance = Math.max(0, currentBalance - deductionAmount);

    // Record repayment transaction
    await this.recordTransaction({
      cash_advance_id: advanceId,
      type: 'repayment',
      amount: deductionAmount,
      transaction_date: now,
      source: 'payroll_deduction',
      payroll_record_id: payrollRecordId,
      notes: 'Payroll deduction',
      balance_after: newBalance,
      created_by: processedBy,
    });

    // Update status if fully repaid
    let newStatus = advance.status;
    if (newBalance === 0) {
      newStatus = 'completed';
    }

    const updated: CashAdvanceRequest = {
      ...advance,
      status: newStatus,
      updated_at: now,
    };

    await this.saveAdvance(updated);

    return updated;
  }

  /**
   * Process manual repayment
   */
  async processManualRepayment(
    advanceId: string,
    amount: number,
    paymentMethod: 'cash' | 'bank_transfer' | 'check',
    referenceNumber?: string,
    notes?: string,
    processedBy?: string
  ): Promise<CashAdvanceRequest> {
    const advance = await this.getAdvance(advanceId);

    if (!advance) {
      throw new Error('Cash advance not found');
    }

    if (advance.status !== 'repaying') {
      throw new Error(`Cannot accept repayment for advance with status: ${advance.status}`);
    }

    const now = new Date().toISOString();
    const currentBalance = await this.getCurrentBalance(advanceId);
    
    if (amount > currentBalance) {
      throw new Error(`Payment amount ($${amount}) exceeds remaining balance ($${currentBalance})`);
    }

    const newBalance = currentBalance - amount;

    // Record repayment transaction
    await this.recordTransaction({
      cash_advance_id: advanceId,
      type: 'repayment',
      amount: amount,
      transaction_date: now,
      source: paymentMethod === 'cash' ? 'cash' : 'bank_transfer',
      reference_number: referenceNumber,
      notes: notes || `Manual ${paymentMethod} repayment`,
      balance_after: newBalance,
      created_by: processedBy || 'system',
    });

    // Update status if fully repaid
    let newStatus = advance.status;
    if (newBalance === 0) {
      newStatus = 'completed';
    }

    const updated: CashAdvanceRequest = {
      ...advance,
      status: newStatus,
      updated_at: now,
    };

    await this.saveAdvance(updated);

    return updated;
  }

  /**
   * Calculate cash advance deduction for payroll period
   */
  async calculatePayrollDeduction(
    employeeId: string,
    grossPay: number,
    existingDeductions: number
  ): Promise<{
    deduction_amount: number;
    advances_affected: string[];
    remaining_balance: number;
    calculation_notes: string;
  }> {
    // Get active advances for employee
    const activeAdvances = await this.getActiveAdvances(employeeId);

    if (activeAdvances.length === 0) {
      return {
        deduction_amount: 0,
        advances_affected: [],
        remaining_balance: 0,
        calculation_notes: 'No active cash advances',
      };
    }

    // Calculate maximum deduction amount
    const maxDeductionAmount = this.config.deduction_rules.max_cash_advance_deduction_amount || Infinity;
    const maxDeductionPercentage = this.config.deduction_rules.max_cash_advance_deduction_percentage || 100;
    const maxByPercentage = (grossPay * maxDeductionPercentage) / 100;
    
    let maxDeduction = Math.min(maxDeductionAmount, maxByPercentage);

    // Check minimum net pay requirement
    const minNetPayAmount = this.config.deduction_rules.minimum_net_pay_amount || 0;
    const minNetPayPercentage = this.config.deduction_rules.minimum_net_pay_percentage || 0;
    const minNetByPercentage = (grossPay * minNetPayPercentage) / 100;
    const minNetPay = Math.max(minNetPayAmount, minNetByPercentage);

    const availableForDeduction = grossPay - existingDeductions - minNetPay;
    maxDeduction = Math.min(maxDeduction, Math.max(0, availableForDeduction));

    // Calculate total balance
    let totalBalance = 0;
    for (const advance of activeAdvances) {
      const balance = await this.getCurrentBalance(advance.id);
      totalBalance += balance;
    }

    // Determine deduction amount
    const deductionAmount = Math.min(maxDeduction, totalBalance);

    // Get installment amounts
    const installments = activeAdvances.map(adv => ({
      id: adv.id,
      installment: adv.repayment_terms.installment_amount,
    }));

    const totalInstallment = installments.reduce((sum, i) => sum + i.installment, 0);

    const calculationNotes = deductionAmount === totalBalance
      ? `Full balance deducted ($${totalBalance.toFixed(2)})`
      : deductionAmount === totalInstallment
      ? `Regular installment ($${totalInstallment.toFixed(2)})`
      : `Partial repayment limited by deduction rules ($${deductionAmount.toFixed(2)})`;

    return {
      deduction_amount: this.roundAmount(deductionAmount),
      advances_affected: activeAdvances.map(a => a.id),
      remaining_balance: this.roundAmount(totalBalance - deductionAmount),
      calculation_notes: calculationNotes,
    };
  }

  /**
   * Get employee cash advance balance
   */
  async getEmployeeBalance(employeeId: string): Promise<CashAdvanceBalance> {
    const allAdvances = await this.getEmployeeAdvances(employeeId);
    
    let totalAdvanced = 0;
    let totalRepaid = 0;
    let currentBalance = 0;
    const activeAdvances: Array<{
      advance_id: string;
      amount: number;
      balance: number;
      due_date?: string;
    }> = [];

    let lastTransactionDate = '';

    for (const advance of allAdvances) {
      const advanceAmount = advance.amount_approved || advance.amount_requested;

      if (advance.status === 'disbursed' || advance.status === 'repaying' || advance.status === 'completed') {
        totalAdvanced += advanceAmount;

        const balance = await this.getCurrentBalance(advance.id);
        totalRepaid += (advanceAmount - balance);

        if (balance > 0) {
          currentBalance += balance;
          activeAdvances.push({
            advance_id: advance.id,
            amount: advanceAmount,
            balance: balance,
            due_date: this.calculateDueDate(advance),
          });
        }

        // Track last transaction
        const transactions = await this.getAdvanceTransactions(advance.id);
        if (transactions.length > 0) {
          const lastTx = transactions[transactions.length - 1];
          if (!lastTransactionDate || lastTx.transaction_date > lastTransactionDate) {
            lastTransactionDate = lastTx.transaction_date;
          }
        }
      }
    }

    return {
      employee_id: employeeId,
      total_advanced: this.roundAmount(totalAdvanced),
      total_repaid: this.roundAmount(totalRepaid),
      current_balance: this.roundAmount(currentBalance),
      active_advances: activeAdvances,
      total_historical_advances: totalAdvanced,
      total_historical_repayments: totalRepaid,
      last_transaction_date: lastTransactionDate || new Date().toISOString(),
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Get current balance for specific advance
   */
  async getCurrentBalance(advanceId: string): Promise<number> {
    const transactions = await this.getAdvanceTransactions(advanceId);
    
    let balance = 0;
    for (const transaction of transactions) {
      if (transaction.type === 'disbursement') {
        balance += transaction.amount;
      } else if (transaction.type === 'repayment') {
        balance -= transaction.amount;
      } else if (transaction.type === 'interest') {
        balance += transaction.amount;
      } else if (transaction.type === 'penalty') {
        balance += transaction.amount;
      } else if (transaction.type === 'adjustment') {
        balance += transaction.amount; // Can be negative
      } else if (transaction.type === 'write_off') {
        balance = 0;
      }
    }

    return Math.max(0, this.roundAmount(balance));
  }

  /**
   * Calculate repayment terms
   */
  private calculateRepaymentTerms(
    amount: number,
    startDate: string
  ): CashAdvanceRepaymentTerms {
    const numberOfInstallments = this.config.cash_advance_default_installments;
    const installmentAmount = this.roundAmount(amount / numberOfInstallments);

    return {
      total_amount: amount,
      number_of_installments: numberOfInstallments,
      installment_amount: installmentAmount,
      start_date: startDate,
      frequency: 'per_payroll',
      interest_rate: 0,
      interest_amount: 0,
      allow_early_repayment: true,
      early_repayment_penalty: 0,
    };
  }

  /**
   * Calculate due date for advance
   */
  private calculateDueDate(advance: CashAdvanceRequest): string | undefined {
    if (!advance.disbursed_at) {
      return undefined;
    }

    const { number_of_installments, frequency } = advance.repayment_terms;
    const startDate = new Date(advance.disbursed_at);

    // Estimate based on frequency
    let daysToAdd = 30; // Default monthly
    if (frequency === 'weekly') daysToAdd = 7 * number_of_installments;
    if (frequency === 'bi_weekly') daysToAdd = 14 * number_of_installments;
    if (frequency === 'per_payroll') {
      // Estimate based on payroll frequency
      daysToAdd = this.config.payroll_frequency === 'weekly' ? 7 * number_of_installments
        : this.config.payroll_frequency === 'bi_weekly' ? 14 * number_of_installments
        : 30 * number_of_installments;
    }

    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + daysToAdd);

    return dueDate.toISOString();
  }

  /**
   * Record transaction
   */
  private async recordTransaction(
    transaction: Omit<CashAdvanceTransaction, 'id' | 'created_at'>
  ): Promise<CashAdvanceTransaction> {
    const fullTransaction: CashAdvanceTransaction = {
      ...transaction,
      id: this.generateTransactionId(),
      created_at: new Date().toISOString(),
    };

    const transactions = await this.getAllTransactions();
    transactions.push(fullTransaction);
    await AsyncStorage.setItem(TRANSACTION_STORAGE_KEY, JSON.stringify(transactions));

    return fullTransaction;
  }

  /**
   * Get advance transactions
   */
  private async getAdvanceTransactions(advanceId: string): Promise<CashAdvanceTransaction[]> {
    const allTransactions = await this.getAllTransactions();
    return allTransactions
      .filter(t => t.cash_advance_id === advanceId)
      .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime());
  }

  /**
   * Get all transactions
   */
  private async getAllTransactions(): Promise<CashAdvanceTransaction[]> {
    try {
      const data = await AsyncStorage.getItem(TRANSACTION_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[CashAdvance] Failed to load transactions:', error);
      return [];
    }
  }

  /**
   * Get active advances for employee
   */
  private async getActiveAdvances(employeeId: string): Promise<CashAdvanceRequest[]> {
    const allAdvances = await this.getEmployeeAdvances(employeeId);
    return allAdvances.filter(a => a.status === 'repaying');
  }

  /**
   * Get employee advances
   */
  async getEmployeeAdvances(employeeId: string): Promise<CashAdvanceRequest[]> {
    const allAdvances = await this.getAllAdvances();
    return allAdvances
      .filter(a => a.employee_id === employeeId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Get advance by ID
   */
  private async getAdvance(advanceId: string): Promise<CashAdvanceRequest | null> {
    const allAdvances = await this.getAllAdvances();
    return allAdvances.find(a => a.id === advanceId) || null;
  }

  /**
   * Save advance
   */
  private async saveAdvance(advance: CashAdvanceRequest): Promise<void> {
    const allAdvances = await this.getAllAdvances();
    const index = allAdvances.findIndex(a => a.id === advance.id);

    if (index >= 0) {
      allAdvances[index] = advance;
    } else {
      allAdvances.push(advance);
    }

    await AsyncStorage.setItem(CASH_ADVANCE_STORAGE_KEY, JSON.stringify(allAdvances));
  }

  /**
   * Get all advances
   */
  private async getAllAdvances(): Promise<CashAdvanceRequest[]> {
    try {
      const data = await AsyncStorage.getItem(CASH_ADVANCE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[CashAdvance] Failed to load advances:', error);
      return [];
    }
  }

  /**
   * Get employment days (mock - should integrate with HR system)
   */
  private async getEmploymentDays(employeeId: string): Promise<number> {
    // TODO: Integrate with actual employee data
    // For now, return a value that passes eligibility
    return 90;
  }

  /**
   * Round amount to 2 decimal places
   */
  private roundAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  /**
   * Generate unique advance ID
   */
  private generateAdvanceId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const cashAdvanceManagementService = new CashAdvanceManagementService();

