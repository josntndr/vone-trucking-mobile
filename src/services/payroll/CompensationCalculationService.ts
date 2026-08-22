/**
 * Compensation Calculation Service
 * 
 * Handles all compensation calculations including:
 * - Base pay (salary, daily, hourly, per-trip, destination-based)
 * - Overtime calculations
 * - Allowances and bonuses
 * - Detailed calculation breakdowns
 */

import type {
  EmployeeCompensation,
  DestinationRate,
  EarningsLineItem,
  Allowance,
  Bonus,
  AttendanceRecord,
  PayrollCalculationBreakdown,
} from '../../types/payroll.types';

interface TripData {
  trip_id: string;
  destination: string;
  completed_date: string;
  is_approved: boolean;
  driver_id?: string;
  porter_id?: string;
}

interface CalculationContext {
  period_start: string;
  period_end: string;
  employee_id: string;
  employee_role: 'driver' | 'porter' | 'other';
  compensation_config: EmployeeCompensation;
  trips: TripData[];
  attendance: AttendanceRecord[];
  destination_rates: DestinationRate[];
  allowances: Allowance[];
  bonuses: Bonus[];
}

export class CompensationCalculationService {
  /**
   * Calculate total earnings for an employee
   */
  async calculateEarnings(context: CalculationContext): Promise<{
    earnings: EarningsLineItem[];
    gross_pay: number;
    breakdown: PayrollCalculationBreakdown;
  }> {
    const earnings: EarningsLineItem[] = [];
    
    // Calculate base earnings
    const baseEarnings = this.calculateBaseEarnings(context);
    if (baseEarnings) {
      earnings.push(baseEarnings);
    }

    // Calculate overtime
    const overtimeEarnings = this.calculateOvertime(context);
    if (overtimeEarnings) {
      earnings.push(overtimeEarnings);
    }

    // Calculate rest day pay
    const restDayPay = this.calculateRestDayPay(context);
    if (restDayPay) {
      earnings.push(restDayPay);
    }

    // Calculate holiday pay
    const holidayPay = this.calculateHolidayPay(context);
    if (holidayPay) {
      earnings.push(holidayPay);
    }

    // Calculate allowances
    const allowanceEarnings = this.calculateAllowances(context);
    earnings.push(...allowanceEarnings);

    // Calculate bonuses
    const bonusEarnings = this.calculateBonuses(context);
    earnings.push(...bonusEarnings);

    // Calculate gross pay
    const gross_pay = this.roundAmount(
      earnings.reduce((sum, item) => sum + item.amount, 0)
    );

    // Generate detailed breakdown
    const breakdown = this.generateBreakdown(context, earnings, gross_pay);

    return {
      earnings,
      gross_pay,
      breakdown,
    };
  }

  /**
   * Calculate base earnings based on compensation method
   */
  private calculateBaseEarnings(context: CalculationContext): EarningsLineItem | null {
    const { compensation_config, period_start, period_end } = context;

    switch (compensation_config.method) {
      case 'weekly_salary':
        return this.calculateWeeklySalary(context);
      
      case 'monthly_salary':
        return this.calculateMonthlySalary(context);
      
      case 'daily_rate':
        return this.calculateDailyRate(context);
      
      case 'per_trip':
        return this.calculatePerTripEarnings(context);
      
      case 'destination_based':
        return this.calculateDestinationBasedEarnings(context);
      
      case 'hourly_rate':
        return this.calculateHourlyWage(context);
      
      default:
        console.warn(`Unknown compensation method: ${compensation_config.method}`);
        return null;
    }
  }

  /**
   * Calculate weekly salary
   */
  private calculateWeeklySalary(context: CalculationContext): EarningsLineItem {
    const { compensation_config, period_start, period_end } = context;
    const weeklySalary = compensation_config.weekly_salary || 0;

    // Calculate number of weeks in period
    const periodDays = this.getDaysBetween(period_start, period_end);
    const weeks = periodDays / 7;

    const amount = this.roundAmount(weeklySalary * weeks);

    return {
      id: this.generateId(),
      type: 'base_salary',
      description: 'Weekly Salary',
      quantity: weeks,
      rate: weeklySalary,
      amount,
      calculation_notes: `${weeks.toFixed(2)} weeks × $${weeklySalary.toFixed(2)}`,
      is_taxable: true,
      is_mandatory: true,
    };
  }

  /**
   * Calculate monthly salary
   */
  private calculateMonthlySalary(context: CalculationContext): EarningsLineItem {
    const { compensation_config, period_start, period_end } = context;
    const monthlySalary = compensation_config.monthly_salary || 0;

    // Calculate proration if partial month
    const periodDays = this.getDaysBetween(period_start, period_end);
    const monthDays = this.getDaysInMonth(new Date(period_start));
    const prorationFactor = periodDays / monthDays;

    const amount = this.roundAmount(monthlySalary * prorationFactor);

    return {
      id: this.generateId(),
      type: 'base_salary',
      description: 'Monthly Salary',
      quantity: prorationFactor,
      rate: monthlySalary,
      amount,
      calculation_notes: prorationFactor === 1
        ? `Full month salary: $${monthlySalary.toFixed(2)}`
        : `${periodDays} days / ${monthDays} days × $${monthlySalary.toFixed(2)}`,
      is_taxable: true,
      is_mandatory: true,
    };
  }

  /**
   * Calculate daily rate earnings
   */
  private calculateDailyRate(context: CalculationContext): EarningsLineItem {
    const { compensation_config, attendance, employee_role } = context;

    // Get appropriate rate for role
    const dailyRate = employee_role === 'driver'
      ? (compensation_config.driver_rate || compensation_config.daily_rate || 0)
      : (compensation_config.porter_rate || compensation_config.daily_rate || 0);

    // Count work days (excluding rest days and holidays - they're calculated separately)
    const workDays = attendance.filter(
      a => a.status === 'present' || a.status === 'half_day'
    ).length;

    const amount = this.roundAmount(workDays * dailyRate);

    return {
      id: this.generateId(),
      type: 'base_wage',
      description: `Daily Rate (${employee_role})`,
      quantity: workDays,
      rate: dailyRate,
      amount,
      reference_ids: attendance
        .filter(a => a.status === 'present' || a.status === 'half_day')
        .map(a => a.id),
      calculation_notes: `${workDays} days × $${dailyRate.toFixed(2)}`,
      is_taxable: true,
      is_mandatory: true,
    };
  }

  /**
   * Calculate per-trip earnings
   */
  private calculatePerTripEarnings(context: CalculationContext): EarningsLineItem {
    const { compensation_config, trips, employee_role, employee_id } = context;

    // Get appropriate rate for role
    const perTripRate = employee_role === 'driver'
      ? (compensation_config.driver_rate || compensation_config.per_trip_rate || 0)
      : (compensation_config.porter_rate || compensation_config.per_trip_rate || 0);

    // Only count approved trips
    const approvedTrips = trips.filter(t => t.is_approved);

    const amount = this.roundAmount(approvedTrips.length * perTripRate);

    return {
      id: this.generateId(),
      type: 'trip_earnings',
      description: `Per-Trip Rate (${employee_role})`,
      quantity: approvedTrips.length,
      rate: perTripRate,
      amount,
      reference_ids: approvedTrips.map(t => t.trip_id),
      calculation_notes: `${approvedTrips.length} approved trips × $${perTripRate.toFixed(2)}`,
      is_taxable: true,
      is_mandatory: true,
    };
  }

  /**
   * Calculate destination-based earnings
   */
  private calculateDestinationBasedEarnings(context: CalculationContext): EarningsLineItem {
    const { trips, employee_role, destination_rates } = context;

    // Only count approved trips
    const approvedTrips = trips.filter(t => t.is_approved);

    // Calculate earnings per destination
    let totalAmount = 0;
    const tripDetails: Array<{ trip_id: string; destination: string; rate: number; amount: number }> = [];

    for (const trip of approvedTrips) {
      // Find rate for destination
      const destinationRate = destination_rates.find(
        dr => dr.destination.toLowerCase() === trip.destination.toLowerCase()
      );

      const rate = employee_role === 'driver'
        ? (destinationRate?.driver_rate || 0)
        : (destinationRate?.porter_rate || 0);

      const amount = rate;
      totalAmount += amount;

      tripDetails.push({
        trip_id: trip.trip_id,
        destination: trip.destination,
        rate,
        amount,
      });
    }

    return {
      id: this.generateId(),
      type: 'trip_earnings',
      description: `Destination-Based Pay (${employee_role})`,
      quantity: approvedTrips.length,
      amount: this.roundAmount(totalAmount),
      reference_ids: approvedTrips.map(t => t.trip_id),
      calculation_notes: `${approvedTrips.length} trips to various destinations`,
      is_taxable: true,
      is_mandatory: true,
    };
  }

  /**
   * Calculate hourly wage
   */
  private calculateHourlyWage(context: CalculationContext): EarningsLineItem {
    const { compensation_config, attendance } = context;
    const hourlyRate = compensation_config.hourly_rate || 0;

    // Sum regular hours from attendance
    const totalHours = attendance.reduce((sum, a) => {
      if (a.status === 'present' && a.hours_worked) {
        // Don't count overtime hours here
        const overtimeThreshold = compensation_config.overtime_threshold_hours || 8;
        return sum + Math.min(a.hours_worked, overtimeThreshold);
      }
      return sum;
    }, 0);

    const amount = this.roundAmount(totalHours * hourlyRate);

    return {
      id: this.generateId(),
      type: 'base_wage',
      description: 'Regular Hours',
      quantity: totalHours,
      rate: hourlyRate,
      amount,
      reference_ids: attendance.filter(a => a.status === 'present').map(a => a.id),
      calculation_notes: `${totalHours.toFixed(2)} hours × $${hourlyRate.toFixed(2)}`,
      is_taxable: true,
      is_mandatory: true,
    };
  }

  /**
   * Calculate overtime pay
   */
  private calculateOvertime(context: CalculationContext): EarningsLineItem | null {
    const { compensation_config, attendance } = context;

    if (!compensation_config.overtime_enabled) {
      return null;
    }

    const overtimeThreshold = compensation_config.overtime_threshold_hours || 8;
    const overtimeMultiplier = compensation_config.overtime_multiplier || 1.5;
    const regularRate = this.getRegularHourlyRate(context);

    // Calculate overtime hours
    let overtimeHours = 0;
    for (const record of attendance) {
      if (record.status === 'present' && record.hours_worked) {
        if (record.hours_worked > overtimeThreshold) {
          overtimeHours += record.hours_worked - overtimeThreshold;
        }
      }
    }

    if (overtimeHours === 0) {
      return null;
    }

    const overtimeRate = regularRate * overtimeMultiplier;
    const amount = this.roundAmount(overtimeHours * overtimeRate);

    return {
      id: this.generateId(),
      type: 'overtime',
      description: 'Overtime Pay',
      quantity: overtimeHours,
      rate: overtimeRate,
      amount,
      reference_ids: attendance
        .filter(a => a.status === 'present' && a.hours_worked && a.hours_worked > overtimeThreshold)
        .map(a => a.id),
      calculation_notes: `${overtimeHours.toFixed(2)} OT hours × $${overtimeRate.toFixed(2)} (${overtimeMultiplier}×)`,
      is_taxable: true,
      is_mandatory: false,
    };
  }

  /**
   * Calculate rest day pay
   */
  private calculateRestDayPay(context: CalculationContext): EarningsLineItem | null {
    const { compensation_config, attendance } = context;

    const restDayMultiplier = compensation_config.rest_day_multiplier || 2.0;
    const regularRate = this.getRegularDailyRate(context);

    // Count rest days worked
    const restDaysWorked = attendance.filter(a => a.status === 'rest_day').length;

    if (restDaysWorked === 0) {
      return null;
    }

    const restDayRate = regularRate * restDayMultiplier;
    const amount = this.roundAmount(restDaysWorked * restDayRate);

    return {
      id: this.generateId(),
      type: 'rest_day_pay',
      description: 'Rest Day Pay',
      quantity: restDaysWorked,
      rate: restDayRate,
      amount,
      reference_ids: attendance.filter(a => a.status === 'rest_day').map(a => a.id),
      calculation_notes: `${restDaysWorked} rest days × $${restDayRate.toFixed(2)} (${restDayMultiplier}×)`,
      is_taxable: true,
      is_mandatory: false,
    };
  }

  /**
   * Calculate holiday pay
   */
  private calculateHolidayPay(context: CalculationContext): EarningsLineItem | null {
    const { compensation_config, attendance } = context;

    const holidayMultiplier = compensation_config.holiday_multiplier || 2.5;
    const regularRate = this.getRegularDailyRate(context);

    // Count holidays worked
    const holidaysWorked = attendance.filter(a => a.status === 'holiday').length;

    if (holidaysWorked === 0) {
      return null;
    }

    const holidayRate = regularRate * holidayMultiplier;
    const amount = this.roundAmount(holidaysWorked * holidayRate);

    return {
      id: this.generateId(),
      type: 'holiday_pay',
      description: 'Holiday Pay',
      quantity: holidaysWorked,
      rate: holidayRate,
      amount,
      reference_ids: attendance.filter(a => a.status === 'holiday').map(a => a.id),
      calculation_notes: `${holidaysWorked} holidays × $${holidayRate.toFixed(2)} (${holidayMultiplier}×)`,
      is_taxable: true,
      is_mandatory: false,
    };
  }

  /**
   * Calculate allowances
   */
  private calculateAllowances(context: CalculationContext): EarningsLineItem[] {
    const { allowances, trips, attendance, period_start, period_end } = context;
    const earnings: EarningsLineItem[] = [];

    for (const allowance of allowances) {
      // Check if allowance is effective
      if (!this.isEffective(allowance.effective_from, allowance.effective_until, period_start)) {
        continue;
      }

      let quantity = 0;
      let calculationNotes = '';

      switch (allowance.frequency) {
        case 'per_day':
          quantity = attendance.filter(a => a.status === 'present').length;
          calculationNotes = `${quantity} days × $${allowance.amount.toFixed(2)}`;
          break;

        case 'per_trip':
          quantity = trips.filter(t => t.is_approved).length;
          calculationNotes = `${quantity} trips × $${allowance.amount.toFixed(2)}`;
          break;

        case 'per_week':
          const periodDays = this.getDaysBetween(period_start, period_end);
          quantity = Math.floor(periodDays / 7);
          calculationNotes = `${quantity} weeks × $${allowance.amount.toFixed(2)}`;
          break;

        case 'per_month':
          quantity = 1;
          calculationNotes = `Monthly allowance: $${allowance.amount.toFixed(2)}`;
          break;

        case 'one_time':
          quantity = 1;
          calculationNotes = `One-time allowance: $${allowance.amount.toFixed(2)}`;
          break;
      }

      if (quantity > 0) {
        earnings.push({
          id: this.generateId(),
          type: 'allowance',
          description: allowance.name,
          quantity,
          rate: allowance.amount,
          amount: this.roundAmount(quantity * allowance.amount),
          calculation_notes: calculationNotes,
          is_taxable: allowance.is_taxable,
          is_mandatory: false,
        });
      }
    }

    return earnings;
  }

  /**
   * Calculate bonuses
   */
  private calculateBonuses(context: CalculationContext): EarningsLineItem[] {
    const { bonuses, trips, attendance } = context;
    const earnings: EarningsLineItem[] = [];

    for (const bonus of bonuses) {
      // Check conditions
      const meetsConditions = this.checkBonusConditions(bonus, trips, attendance);

      if (!meetsConditions) {
        continue;
      }

      // Calculate bonus amount
      let amount = bonus.amount || 0;

      // If percentage-based, calculate from base pay
      if (bonus.percentage && !bonus.amount) {
        const baseEarnings = this.calculateBaseEarnings(context);
        const baseAmount = baseEarnings?.amount || 0;
        amount = baseAmount * (bonus.percentage / 100);
      }

      if (amount > 0) {
        earnings.push({
          id: this.generateId(),
          type: 'bonus',
          description: bonus.name,
          amount: this.roundAmount(amount),
          calculation_notes: bonus.conditions || 'Bonus conditions met',
          is_taxable: true,
          is_mandatory: false,
        });
      }
    }

    return earnings;
  }

  /**
   * Check if bonus conditions are met
   */
  private checkBonusConditions(
    bonus: Bonus,
    trips: TripData[],
    attendance: AttendanceRecord[]
  ): boolean {
    // Check minimum trips
    if (bonus.minimum_trips) {
      const approvedTrips = trips.filter(t => t.is_approved).length;
      if (approvedTrips < bonus.minimum_trips) {
        return false;
      }
    }

    // Check minimum days
    if (bonus.minimum_days) {
      const daysWorked = attendance.filter(a => a.status === 'present').length;
      if (daysWorked < bonus.minimum_days) {
        return false;
      }
    }

    // Check perfect attendance
    if (bonus.perfect_attendance_required) {
      const hasAbsence = attendance.some(a => a.status === 'absent');
      if (hasAbsence) {
        return false;
      }
    }

    // All conditions met
    return true;
  }

  /**
   * Generate detailed calculation breakdown
   */
  private generateBreakdown(
    context: CalculationContext,
    earnings: EarningsLineItem[],
    grossPay: number
  ): PayrollCalculationBreakdown {
    const { trips, attendance, compensation_config, employee_role, destination_rates } = context;

    // Base earnings
    const baseEarning = earnings.find(e => e.type === 'base_salary' || e.type === 'base_wage');
    const tripEarning = earnings.find(e => e.type === 'trip_earnings');

    // Trip breakdown
    let tripEarningsBreakdown;
    if (tripEarning && compensation_config.method === 'destination_based') {
      const approvedTrips = trips.filter(t => t.is_approved);
      tripEarningsBreakdown = {
        total_trips: trips.length,
        approved_trips: approvedTrips.length,
        trip_details: approvedTrips.map(trip => {
          const destRate = destination_rates.find(
            dr => dr.destination.toLowerCase() === trip.destination.toLowerCase()
          );
          const rate = employee_role === 'driver'
            ? (destRate?.driver_rate || 0)
            : (destRate?.porter_rate || 0);

          return {
            trip_id: trip.trip_id,
            destination: trip.destination,
            rate,
            amount: rate,
          };
        }),
        total_amount: tripEarning.amount,
      };
    }

    // Overtime breakdown
    const overtimeEarning = earnings.find(e => e.type === 'overtime');
    let overtimeBreakdown;
    if (overtimeEarning) {
      const regularRate = this.getRegularHourlyRate(context);
      const overtimeThreshold = compensation_config.overtime_threshold_hours || 8;
      const totalHours = attendance.reduce((sum, a) => sum + (a.hours_worked || 0), 0);
      const regularHours = Math.min(totalHours, overtimeThreshold * attendance.length);

      overtimeBreakdown = {
        regular_hours: regularHours,
        overtime_hours: overtimeEarning.quantity || 0,
        overtime_rate: overtimeEarning.rate || 0,
        amount: overtimeEarning.amount,
      };
    }

    // Allowances
    const allowanceItems = earnings.filter(e => e.type === 'allowance');
    const allowancesBreakdown = allowanceItems.map(item => ({
      name: item.description,
      quantity: item.quantity || 0,
      rate: item.rate || 0,
      amount: item.amount,
    }));

    // Bonuses
    const bonusItems = earnings.filter(e => e.type === 'bonus');
    const bonusesBreakdown = bonusItems.map(item => ({
      name: item.description,
      conditions_met: true,
      amount: item.amount,
    }));

    return {
      base_earnings_description: baseEarning?.description || 'Base Earnings',
      base_earnings_calculation: baseEarning?.calculation_notes || '',
      base_earnings_amount: baseEarning?.amount || 0,
      trip_earnings: tripEarningsBreakdown,
      overtime: overtimeBreakdown,
      allowances: allowancesBreakdown,
      bonuses: bonusesBreakdown,
      deduction_breakdown: [],  // Filled by deduction service
      gross_pay: grossPay,
      total_deductions: 0,      // Filled by deduction service
      net_pay: grossPay,        // Filled by deduction service
    };
  }

  /**
   * Get regular hourly rate for overtime calculations
   */
  private getRegularHourlyRate(context: CalculationContext): number {
    const { compensation_config } = context;

    if (compensation_config.hourly_rate) {
      return compensation_config.hourly_rate;
    }

    // Estimate from daily rate
    if (compensation_config.daily_rate) {
      return compensation_config.daily_rate / 8; // Assume 8-hour day
    }

    // Estimate from weekly salary
    if (compensation_config.weekly_salary) {
      return compensation_config.weekly_salary / 40; // Assume 40-hour week
    }

    // Default fallback
    return 10; // Minimum wage estimate
  }

  /**
   * Get regular daily rate for special day calculations
   */
  private getRegularDailyRate(context: CalculationContext): number {
    const { compensation_config, employee_role } = context;

    // Use daily rate if available
    if (employee_role === 'driver' && compensation_config.driver_rate) {
      return compensation_config.driver_rate;
    }
    if (employee_role === 'porter' && compensation_config.porter_rate) {
      return compensation_config.porter_rate;
    }
    if (compensation_config.daily_rate) {
      return compensation_config.daily_rate;
    }

    // Estimate from weekly salary
    if (compensation_config.weekly_salary) {
      return compensation_config.weekly_salary / 7;
    }

    // Estimate from monthly salary
    if (compensation_config.monthly_salary) {
      return compensation_config.monthly_salary / 30;
    }

    // Default fallback
    return 80; // Estimate
  }

  /**
   * Check if allowance/bonus is effective in period
   */
  private isEffective(
    effectiveFrom: string,
    effectiveUntil: string | undefined,
    periodStart: string
  ): boolean {
    const from = new Date(effectiveFrom);
    const period = new Date(periodStart);

    if (period < from) {
      return false;
    }

    if (effectiveUntil) {
      const until = new Date(effectiveUntil);
      if (period > until) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get days between two dates
   */
  private getDaysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Get days in month
   */
  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  /**
   * Round amount to 2 decimal places
   */
  private roundAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `earning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const compensationCalculationService = new CompensationCalculationService();
