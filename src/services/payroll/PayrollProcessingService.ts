/**
 * Payroll Processing Service
 * 
 * Implements the complete 10-step payroll workflow:
 * 1. Operator selects payroll period
 * 2. System retrieves approved trips and attendance
 * 3. System calculates base earnings
 * 4. Additional pay, overtime, allowances, bonuses added
 * 5. Deductions and cash-advance repayments applied
 * 6. Detailed payroll preview generated
 * 7. Operator reviews and corrects preview
 * 8. Operator approves payroll
 * 9. System generates employee payslips
 * 10. Operator marks payroll as paid
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  PayrollPeriod,
  PayrollRecord,
  PayrollConfiguration,
  EmployeeCompensation,
  DestinationRate,
  Allowance,
  Bonus,
  AttendanceRecord,
  DeductionLineItem,
  DeductionType,
  PayrollValidation,
  PayrollCorrection,
  PayrollAuditLog,
  Payslip,
  PayrollSummaryReport,
} from '../../types/payroll.types';
import {
  DEFAULT_PAYROLL_CONFIG,
} from '../../types/payroll.types';
import { compensationCalculationService } from './CompensationCalculationService';
import { cashAdvanceManagementService } from './CashAdvanceManagementService';

const PAYROLL_PERIODS_KEY = '@vone_payroll_periods';
const PAYROLL_RECORDS_KEY = '@vone_payroll_records';
const PAYROLL_CORRECTIONS_KEY = '@vone_payroll_corrections';
const PAYROLL_AUDIT_KEY = '@vone_payroll_audit';

interface TripData {
  trip_id: string;
  destination: string;
  completed_date: string;
  is_approved: boolean;
  driver_id?: string;
  porter_id?: string;
}

export class PayrollProcessingService {
  private config: PayrollConfiguration;

  constructor(config?: Partial<PayrollConfiguration>) {
    this.config = { ...DEFAULT_PAYROLL_CONFIG, ...config };
  }

  /**
   * STEP 1: Create payroll period
   */
  async createPayrollPeriod(
    periodStart: string,
    periodEnd: string,
    payDate: string,
    createdBy: string
  ): Promise<PayrollPeriod> {
    const cutoffDate = this.calculateCutoffDate(payDate);

    const period: PayrollPeriod = {
      id: this.generatePeriodId(),
      frequency: this.config.payroll_frequency,
      period_start: periodStart,
      period_end: periodEnd,
      pay_date: payDate,
      status: 'draft',
      cutoff_date: cutoffDate,
      created_at: new Date().toISOString(),
      created_by: createdBy,
    };

    await this.savePeriod(period);
    await this.auditLog({
      entity_type: 'payroll_period',
      entity_id: period.id,
      action: 'created',
      user_id: createdBy,
      user_name: createdBy,
      user_role: 'operator',
    });

    return period;
  }

  /**
   * STEP 2 & 3 & 4: Calculate payroll for all employees
   */
  async calculatePayroll(
    periodId: string,
    employees: Array<{
      employee_id: string;
      employee_name: string;
      employee_role: 'driver' | 'porter' | 'other';
      compensation_config: EmployeeCompensation;
    }>,
    trips: TripData[],
    attendance: AttendanceRecord[],
    destinationRates: DestinationRate[],
    allowances: Allowance[],
    bonuses: Bonus[],
    calculatedBy: string
  ): Promise<PayrollRecord[]> {
    const period = await this.getPeriod(periodId);
    if (!period) {
      throw new Error('Payroll period not found');
    }

    if (period.status !== 'draft') {
      throw new Error(`Cannot calculate payroll for period with status: ${period.status}`);
    }

    // Update period status
    await this.updatePeriodStatus(periodId, 'calculating', calculatedBy);

    const records: PayrollRecord[] = [];

    for (const employee of employees) {
      try {
        const record = await this.calculateEmployeePayroll(
          period,
          employee,
          trips,
          attendance,
          destinationRates,
          allowances,
          bonuses
        );
        records.push(record);
      } catch (error) {
        console.error(`Failed to calculate payroll for ${employee.employee_name}:`, error);
        // Continue with other employees
      }
    }

    // Save all records
    for (const record of records) {
      await this.saveRecord(record);
    }

    // Update period status to preview
    await this.updatePeriodStatus(periodId, 'preview', calculatedBy);

    return records;
  }

  /**
   * Calculate payroll for single employee
   */
  private async calculateEmployeePayroll(
    period: PayrollPeriod,
    employee: {
      employee_id: string;
      employee_name: string;
      employee_role: 'driver' | 'porter' | 'other';
      compensation_config: EmployeeCompensation;
    },
    allTrips: TripData[],
    allAttendance: AttendanceRecord[],
    destinationRates: DestinationRate[],
    allowances: Allowance[],
    bonuses: Bonus[]
  ): Promise<PayrollRecord> {
    // Filter data for this employee
    const employeeTrips = allTrips.filter(
      t => t.driver_id === employee.employee_id || t.porter_id === employee.employee_id
    );
    const employeeAttendance = allAttendance.filter(
      a => a.employee_id === employee.employee_id
    );

    // Calculate earnings
    const earningsResult = await compensationCalculationService.calculateEarnings({
      period_start: period.period_start,
      period_end: period.period_end,
      employee_id: employee.employee_id,
      employee_role: employee.employee_role,
      compensation_config: employee.compensation_config,
      trips: employeeTrips,
      attendance: employeeAttendance,
      destination_rates: destinationRates,
      allowances: allowances,
      bonuses: bonuses,
    });

    // STEP 5: Calculate deductions
    const deductions = await this.calculateDeductions(
      employee.employee_id,
      earningsResult.gross_pay
    );

    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

    // Get cash advance info
    const cashAdvanceBalance = await cashAdvanceManagementService.getEmployeeBalance(
      employee.employee_id
    );
    const cashAdvanceDeduction = deductions.find(d => d.type === 'cash_advance');

    // Calculate net pay
    const netPay = this.roundAmount(earningsResult.gross_pay - totalDeductions);

    // Count trips
    const tripsCompleted = employeeTrips.length;
    const tripsApproved = employeeTrips.filter(t => t.is_approved).length;

    // Count days and hours
    const daysWorked = employeeAttendance.filter(a => a.status === 'present').length;
    const hoursWorked = employeeAttendance.reduce((sum, a) => sum + (a.hours_worked || 0), 0);
    const overtimeHours = earningsResult.earnings.find(e => e.type === 'overtime')?.quantity || 0;

    const record: PayrollRecord = {
      id: this.generateRecordId(),
      payroll_period_id: period.id,
      employee_id: employee.employee_id,
      employee_name: employee.employee_name,
      employee_role: employee.employee_role,
      
      earnings: earningsResult.earnings,
      gross_pay: earningsResult.gross_pay,
      
      deductions: deductions,
      total_deductions: totalDeductions,
      
      net_pay: netPay,
      
      trips_completed: tripsCompleted,
      trips_approved: tripsApproved,
      days_worked: daysWorked,
      hours_worked: hoursWorked,
      overtime_hours: overtimeHours,
      
      cash_advance_balance_before: cashAdvanceBalance.current_balance,
      cash_advance_deduction: cashAdvanceDeduction?.amount || 0,
      cash_advance_balance_after: cashAdvanceBalance.current_balance - (cashAdvanceDeduction?.amount || 0),
      
      status: 'draft',
      has_corrections: false,
      
      calculation_timestamp: new Date().toISOString(),
      calculation_method: employee.compensation_config.method,
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return record;
  }

  /**
   * STEP 5: Calculate deductions
   */
  private async calculateDeductions(
    employeeId: string,
    grossPay: number
  ): Promise<DeductionLineItem[]> {
    const deductions: DeductionLineItem[] = [];

    // Standard deductions (mock - should be configurable)
    // Tax withholding
    const taxRate = 0.15; // 15%
    deductions.push({
      id: this.generateId(),
      type: 'tax',
      description: 'Income Tax Withholding',
      amount: this.roundAmount(grossPay * taxRate),
      is_mandatory: true,
      calculation_notes: `${(taxRate * 100).toFixed(0)}% of gross pay`,
    });

    // Social security
    const ssRate = 0.062; // 6.2%
    deductions.push({
      id: this.generateId(),
      type: 'social_security',
      description: 'Social Security',
      amount: this.roundAmount(grossPay * ssRate),
      is_mandatory: true,
      calculation_notes: `${(ssRate * 100).toFixed(1)}% of gross pay`,
    });

    // Calculate current total of mandatory deductions
    const mandatoryDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);

    // Cash advance deduction
    const cashAdvanceDeduction = await cashAdvanceManagementService.calculatePayrollDeduction(
      employeeId,
      grossPay,
      mandatoryDeductions
    );

    if (cashAdvanceDeduction.deduction_amount > 0) {
      deductions.push({
        id: this.generateId(),
        type: 'cash_advance',
        description: 'Cash Advance Repayment',
        amount: cashAdvanceDeduction.deduction_amount,
        is_mandatory: false,
        calculation_notes: cashAdvanceDeduction.calculation_notes,
      });
    }

    // Sort by priority
    return this.sortDeductionsByPriority(deductions);
  }

  /**
   * Sort deductions by configured priority
   */
  private sortDeductionsByPriority(deductions: DeductionLineItem[]): DeductionLineItem[] {
    const priority = this.config.deduction_rules.deduction_priority;
    
    return deductions.sort((a, b) => {
      const aPriority = priority.indexOf(a.type);
      const bPriority = priority.indexOf(b.type);
      
      // If not in priority list, put at end
      const aIndex = aPriority === -1 ? 999 : aPriority;
      const bIndex = bPriority === -1 ? 999 : bPriority;
      
      return aIndex - bIndex;
    });
  }

  /**
   * STEP 6: Get payroll preview
   */
  async getPayrollPreview(periodId: string): Promise<{
    period: PayrollPeriod;
    records: PayrollRecord[];
    summary: PayrollSummaryReport;
  }> {
    const period = await this.getPeriod(periodId);
    if (!period) {
      throw new Error('Payroll period not found');
    }

    const records = await this.getPeriodRecords(periodId);
    const summary = this.generateSummary(period, records);

    return {
      period,
      records,
      summary,
    };
  }

  /**
   * STEP 7: Make correction to payroll record
   */
  async makeCorrection(
    recordId: string,
    correctionType: PayrollCorrection['correction_type'],
    fieldChanged: string,
    newValue: any,
    reason: string,
    correctedBy: string
  ): Promise<{
    record: PayrollRecord;
    correction: PayrollCorrection;
  }> {
    const record = await this.getRecord(recordId);
    if (!record) {
      throw new Error('Payroll record not found');
    }

    if (record.status === 'approved' || record.status === 'paid') {
      throw new Error(`Cannot correct record with status: ${record.status}`);
    }

    // Get old value
    const oldValue = (record as any)[fieldChanged];

    // Calculate amount difference
    let amountDifference = 0;
    if (fieldChanged === 'gross_pay' || fieldChanged === 'net_pay') {
      amountDifference = newValue - oldValue;
    }

    // Create correction record
    const correction: PayrollCorrection = {
      id: this.generateId(),
      payroll_record_id: recordId,
      correction_type: correctionType,
      reason: reason,
      description: `Changed ${fieldChanged} from ${oldValue} to ${newValue}`,
      field_changed: fieldChanged,
      old_value: oldValue,
      new_value: newValue,
      amount_difference: amountDifference,
      requires_approval: true,
      approved: false,
      corrected_by: correctedBy,
      corrected_at: new Date().toISOString(),
    };

    // Update record
    const updatedRecord: PayrollRecord = {
      ...record,
      [fieldChanged]: newValue,
      has_corrections: true,
      correction_reason: reason,
      corrected_at: new Date().toISOString(),
      corrected_by: correctedBy,
      updated_at: new Date().toISOString(),
    };

    await this.saveCorrection(correction);
    await this.saveRecord(updatedRecord);

    await this.auditLog({
      entity_type: 'payroll_record',
      entity_id: recordId,
      action: 'corrected',
      reason: reason,
      changes: {
        [fieldChanged]: {
          old_value: oldValue,
          new_value: newValue,
        },
      },
      user_id: correctedBy,
      user_name: correctedBy,
      user_role: 'operator',
    });

    return {
      record: updatedRecord,
      correction,
    };
  }

  /**
   * STEP 8: Approve payroll
   */
  async approvePayroll(
    periodId: string,
    approvedBy: string
  ): Promise<PayrollPeriod> {
    const period = await this.getPeriod(periodId);
    if (!period) {
      throw new Error('Payroll period not found');
    }

    if (period.status !== 'preview') {
      throw new Error(`Cannot approve payroll with status: ${period.status}`);
    }

    // Validate all records
    const records = await this.getPeriodRecords(periodId);
    for (const record of records) {
      const validation = this.validateRecord(record);
      if (!validation.is_valid) {
        throw new Error(`Validation failed for ${record.employee_name}: ${validation.errors.join(', ')}`);
      }
    }

    // Update all records to approved
    for (const record of records) {
      const updated: PayrollRecord = {
        ...record,
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await this.saveRecord(updated);
    }

    // Update period status
    const updated = await this.updatePeriodStatus(periodId, 'approved', approvedBy);
    updated.approved_by = approvedBy;
    updated.approved_at = new Date().toISOString();
    await this.savePeriod(updated);

    await this.auditLog({
      entity_type: 'payroll_period',
      entity_id: periodId,
      action: 'approved',
      user_id: approvedBy,
      user_name: approvedBy,
      user_role: 'operator',
    });

    return updated;
  }

  /**
   * STEP 9: Generate payslips
   */
  async generatePayslips(periodId: string, generatedBy: string): Promise<Payslip[]> {
    const period = await this.getPeriod(periodId);
    if (!period) {
      throw new Error('Payroll period not found');
    }

    if (period.status !== 'approved' && period.status !== 'paid') {
      throw new Error(`Cannot generate payslips for period with status: ${period.status}`);
    }

    const records = await this.getPeriodRecords(periodId);
    const payslips: Payslip[] = [];

    for (const record of records) {
      const payslip = await this.generatePayslip(period, record, generatedBy);
      payslips.push(payslip);
    }

    return payslips;
  }

  /**
   * Generate single payslip
   */
  private async generatePayslip(
    period: PayrollPeriod,
    record: PayrollRecord,
    generatedBy: string
  ): Promise<Payslip> {
    // Calculate YTD totals (mock - should query historical data)
    const ytdGross = record.gross_pay;
    const ytdDeductions = record.total_deductions;
    const ytdNet = record.net_pay;

    const payslip: Payslip = {
      id: this.generateId(),
      payroll_record_id: record.id,
      payroll_period_id: period.id,
      
      employee_id: record.employee_id,
      employee_name: record.employee_name,
      employee_number: record.employee_id,
      employee_role: record.employee_role,
      
      period_start: period.period_start,
      period_end: period.period_end,
      pay_date: period.pay_date,
      
      earnings_summary: record.earnings.map(e => ({
        description: e.description,
        details: e.calculation_notes,
        amount: e.amount,
      })),
      gross_pay: record.gross_pay,
      
      deductions_summary: record.deductions.map(d => ({
        description: d.description,
        details: d.calculation_notes,
        amount: d.amount,
      })),
      total_deductions: record.total_deductions,
      
      net_pay: record.net_pay,
      
      ytd_gross: ytdGross,
      ytd_deductions: ytdDeductions,
      ytd_net: ytdNet,
      
      cash_advance_deduction: record.cash_advance_deduction,
      cash_advance_balance: record.cash_advance_balance_after,
      
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
    };

    return payslip;
  }

  /**
   * STEP 10: Mark payroll as paid
   */
  async markAsPaid(
    periodId: string,
    paidBy: string,
    notes?: string
  ): Promise<PayrollPeriod> {
    const period = await this.getPeriod(periodId);
    if (!period) {
      throw new Error('Payroll period not found');
    }

    if (period.status !== 'approved') {
      throw new Error(`Cannot mark as paid with status: ${period.status}`);
    }

    // Update all records to paid
    const records = await this.getPeriodRecords(periodId);
    for (const record of records) {
      const updated: PayrollRecord = {
        ...record,
        status: 'paid',
        updated_at: new Date().toISOString(),
      };
      await this.saveRecord(updated);

      // Process cash advance deductions
      if (record.cash_advance_deduction > 0) {
        const balance = await cashAdvanceManagementService.getEmployeeBalance(record.employee_id);
        for (const advance of balance.active_advances) {
          await cashAdvanceManagementService.processPayrollDeduction(
            advance.advance_id,
            record.cash_advance_deduction,
            record.id,
            paidBy
          );
        }
      }
    }

    // Update period status
    const updated = await this.updatePeriodStatus(periodId, 'paid', paidBy);
    updated.paid_by = paidBy;
    updated.paid_at = new Date().toISOString();
    await this.savePeriod(updated);

    await this.auditLog({
      entity_type: 'payroll_period',
      entity_id: periodId,
      action: 'paid',
      notes: notes,
      user_id: paidBy,
      user_name: paidBy,
      user_role: 'operator',
    });

    return updated;
  }

  /**
   * Validate payroll record
   */
  private validateRecord(record: PayrollRecord): PayrollValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const checks: PayrollValidation['checks'] = [];

    // Check gross pay is positive
    if (record.gross_pay <= 0) {
      errors.push('Gross pay must be greater than zero');
      checks.push({
        check_name: 'positive_gross_pay',
        passed: false,
        message: 'Gross pay must be positive',
        severity: 'error',
      });
    } else {
      checks.push({
        check_name: 'positive_gross_pay',
        passed: true,
        severity: 'info',
      });
    }

    // Check net pay is positive
    if (record.net_pay < 0) {
      errors.push('Net pay cannot be negative');
      checks.push({
        check_name: 'positive_net_pay',
        passed: false,
        message: 'Net pay is negative',
        severity: 'error',
      });
    } else {
      checks.push({
        check_name: 'positive_net_pay',
        passed: true,
        severity: 'info',
      });
    }

    // Check minimum net pay
    const minNetPayPercent = this.config.deduction_rules.minimum_net_pay_percentage || 0;
    const minNetPay = (record.gross_pay * minNetPayPercent) / 100;
    if (record.net_pay < minNetPay) {
      warnings.push(`Net pay is below ${minNetPayPercent}% of gross pay`);
      checks.push({
        check_name: 'minimum_net_pay',
        passed: false,
        message: `Net pay should be at least ${minNetPayPercent}% of gross`,
        severity: 'warning',
      });
    } else {
      checks.push({
        check_name: 'minimum_net_pay',
        passed: true,
        severity: 'info',
      });
    }

    // Check calculations add up
    const calculatedNet = record.gross_pay - record.total_deductions;
    if (Math.abs(calculatedNet - record.net_pay) > 0.01) {
      errors.push('Net pay calculation mismatch');
      checks.push({
        check_name: 'calculation_accuracy',
        passed: false,
        message: `Expected ${calculatedNet.toFixed(2)}, got ${record.net_pay.toFixed(2)}`,
        severity: 'error',
      });
    } else {
      checks.push({
        check_name: 'calculation_accuracy',
        passed: true,
        severity: 'info',
      });
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      checks,
    };
  }

  /**
   * Generate payroll summary
   */
  private generateSummary(
    period: PayrollPeriod,
    records: PayrollRecord[]
  ): PayrollSummaryReport {
    const totalGross = records.reduce((sum, r) => sum + r.gross_pay, 0);
    const totalDeductions = records.reduce((sum, r) => sum + r.total_deductions, 0);
    const totalNet = records.reduce((sum, r) => sum + r.net_pay, 0);

    // By role
    const byRole = this.groupByRole(records);

    // By compensation method
    const byMethod = this.groupByCompensationMethod(records);

    // Cash advances
    const totalCashAdvanceDeductions = records.reduce(
      (sum, r) => sum + r.cash_advance_deduction,
      0
    );
    const employeesWithAdvances = records.filter(r => r.cash_advance_deduction > 0).length;

    return {
      payroll_period_id: period.id,
      period_start: period.period_start,
      period_end: period.period_end,
      total_employees: records.length,
      total_gross_pay: this.roundAmount(totalGross),
      total_deductions: this.roundAmount(totalDeductions),
      total_net_pay: this.roundAmount(totalNet),
      by_role: byRole,
      by_compensation_method: byMethod,
      total_cash_advance_deductions: this.roundAmount(totalCashAdvanceDeductions),
      employees_with_advances: employeesWithAdvances,
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Group records by role
   */
  private groupByRole(records: PayrollRecord[]): PayrollSummaryReport['by_role'] {
    const roles = new Map<string, { count: number; gross: number; net: number }>();

    for (const record of records) {
      const existing = roles.get(record.employee_role) || { count: 0, gross: 0, net: 0 };
      roles.set(record.employee_role, {
        count: existing.count + 1,
        gross: existing.gross + record.gross_pay,
        net: existing.net + record.net_pay,
      });
    }

    return Array.from(roles.entries()).map(([role, data]) => ({
      role,
      employee_count: data.count,
      total_gross: this.roundAmount(data.gross),
      total_net: this.roundAmount(data.net),
    }));
  }

  /**
   * Group records by compensation method
   */
  private groupByCompensationMethod(
    records: PayrollRecord[]
  ): PayrollSummaryReport['by_compensation_method'] {
    const methods = new Map<string, { count: number; gross: number }>();

    for (const record of records) {
      const existing = methods.get(record.calculation_method) || { count: 0, gross: 0 };
      methods.set(record.calculation_method, {
        count: existing.count + 1,
        gross: existing.gross + record.gross_pay,
      });
    }

    return Array.from(methods.entries()).map(([method, data]) => ({
      method: method as any,
      employee_count: data.count,
      total_gross: this.roundAmount(data.gross),
    }));
  }

  /**
   * Calculate cutoff date
   */
  private calculateCutoffDate(payDate: string): string {
    const date = new Date(payDate);
    date.setDate(date.getDate() - this.config.cutoff_days_before_pay);
    return date.toISOString();
  }

  /**
   * Update period status
   */
  private async updatePeriodStatus(
    periodId: string,
    status: PayrollPeriod['status'],
    updatedBy: string
  ): Promise<PayrollPeriod> {
    const period = await this.getPeriod(periodId);
    if (!period) {
      throw new Error('Payroll period not found');
    }

    period.status = status;
    await this.savePeriod(period);

    return period;
  }

  /**
   * Audit log
   */
  private async auditLog(
    entry: Omit<PayrollAuditLog, 'id' | 'timestamp'>
  ): Promise<void> {
    const log: PayrollAuditLog = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    const allLogs = await this.getAllAuditLogs();
    allLogs.push(log);
    await AsyncStorage.setItem(PAYROLL_AUDIT_KEY, JSON.stringify(allLogs));
  }

  /**
   * Storage operations
   */
  private async getPeriod(periodId: string): Promise<PayrollPeriod | null> {
    const periods = await this.getAllPeriods();
    return periods.find(p => p.id === periodId) || null;
  }

  private async savePeriod(period: PayrollPeriod): Promise<void> {
    const periods = await this.getAllPeriods();
    const index = periods.findIndex(p => p.id === period.id);
    if (index >= 0) {
      periods[index] = period;
    } else {
      periods.push(period);
    }
    await AsyncStorage.setItem(PAYROLL_PERIODS_KEY, JSON.stringify(periods));
  }

  private async getAllPeriods(): Promise<PayrollPeriod[]> {
    try {
      const data = await AsyncStorage.getItem(PAYROLL_PERIODS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Payroll] Failed to load periods:', error);
      return [];
    }
  }

  private async getRecord(recordId: string): Promise<PayrollRecord | null> {
    const records = await this.getAllRecords();
    return records.find(r => r.id === recordId) || null;
  }

  private async getPeriodRecords(periodId: string): Promise<PayrollRecord[]> {
    const records = await this.getAllRecords();
    return records.filter(r => r.payroll_period_id === periodId);
  }

  private async saveRecord(record: PayrollRecord): Promise<void> {
    const records = await this.getAllRecords();
    const index = records.findIndex(r => r.id === record.id);
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    await AsyncStorage.setItem(PAYROLL_RECORDS_KEY, JSON.stringify(records));
  }

  private async getAllRecords(): Promise<PayrollRecord[]> {
    try {
      const data = await AsyncStorage.getItem(PAYROLL_RECORDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Payroll] Failed to load records:', error);
      return [];
    }
  }

  private async saveCorrection(correction: PayrollCorrection): Promise<void> {
    const corrections = await this.getAllCorrections();
    corrections.push(correction);
    await AsyncStorage.setItem(PAYROLL_CORRECTIONS_KEY, JSON.stringify(corrections));
  }

  private async getAllCorrections(): Promise<PayrollCorrection[]> {
    try {
      const data = await AsyncStorage.getItem(PAYROLL_CORRECTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Payroll] Failed to load corrections:', error);
      return [];
    }
  }

  private async getAllAuditLogs(): Promise<PayrollAuditLog[]> {
    try {
      const data = await AsyncStorage.getItem(PAYROLL_AUDIT_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Payroll] Failed to load audit logs:', error);
      return [];
    }
  }

  /**
   * Utility functions
   */
  private roundAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  private generatePeriodId(): string {
    return `period_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecordId(): string {
    return `payroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const payrollProcessingService = new PayrollProcessingService();
