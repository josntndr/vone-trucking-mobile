/**
 * Fuel Budget Calculator Service
 * 
 * Calculates fuel budgets based on route distance, truck efficiency,
 * fuel prices, and allowances. Supports operator adjustments and approval workflow.
 */

import type {
  FuelBudgetInput,
  FuelBudgetCalculation,
  FuelBudgetAdjustment,
  FuelBudgetValidationRules,
} from '../../types/fuel.types';
import {
  DEFAULT_VALIDATION_RULES,
} from '../../types/fuel.types';

interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

export class FuelBudgetCalculator {
  private validationRules: FuelBudgetValidationRules;

  constructor(validationRules?: Partial<FuelBudgetValidationRules>) {
    this.validationRules = {
      ...DEFAULT_VALIDATION_RULES,
      ...validationRules,
    };
  }

  /**
   * Calculate fuel budget from input parameters
   */
  calculate(input: FuelBudgetInput): FuelBudgetCalculation {
    // Validate input
    const validation = this.validateInput(input);
    if (!validation.is_valid) {
      throw new Error(`Invalid input: ${validation.errors.join(', ')}`);
    }

    const calculationId = this.generateCalculationId();

    // Calculate total distance (one-way + return if specified)
    const totalDistanceKm = this.calculateTotalDistance(input);

    // Calculate base litres (without allowances)
    const baseLitres = this.calculateBaseLitres(
      totalDistanceKm,
      input.truck_efficiency_kmpl
    );

    // Calculate allowances
    const trafficAllowanceLitres = this.calculateAllowance(
      baseLitres,
      input.traffic_allowance_percent
    );

    const idlingAllowanceLitres = this.calculateAllowance(
      baseLitres,
      input.idling_allowance_percent
    );

    // Calculate total estimated litres
    const estimatedLitres = this.roundToDecimal(
      baseLitres + trafficAllowanceLitres + idlingAllowanceLitres,
      2
    );

    // Calculate estimated fuel cost
    const estimatedFuelCost = this.roundToDecimal(
      estimatedLitres * input.current_fuel_price,
      2
    );

    // Create calculation object
    const calculation: FuelBudgetCalculation = {
      id: calculationId,
      trip_id: input.trip_id,
      input,
      total_distance_km: this.roundToDecimal(totalDistanceKm, 2),
      base_litres: this.roundToDecimal(baseLitres, 2),
      traffic_allowance_litres: this.roundToDecimal(trafficAllowanceLitres, 2),
      idling_allowance_litres: this.roundToDecimal(idlingAllowanceLitres, 2),
      estimated_litres: estimatedLitres,
      estimated_fuel_cost: estimatedFuelCost,
      adjustments: [],
      final_budget_amount: estimatedFuelCost,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return calculation;
  }

  /**
   * Recalculate budget (e.g., when input parameters change)
   */
  recalculate(
    existingCalculation: FuelBudgetCalculation,
    newInput: FuelBudgetInput
  ): FuelBudgetCalculation {
    // Create new calculation with updated input
    const newCalculation = this.calculate(newInput);

    // Preserve existing adjustments and approval status
    newCalculation.id = existingCalculation.id;
    newCalculation.adjustments = existingCalculation.adjustments;
    newCalculation.status = existingCalculation.status;
    newCalculation.reviewed_by = existingCalculation.reviewed_by;
    newCalculation.reviewed_at = existingCalculation.reviewed_at;
    newCalculation.approved_by = existingCalculation.approved_by;
    newCalculation.approved_at = existingCalculation.approved_at;
    newCalculation.created_at = existingCalculation.created_at;

    // Recalculate final budget with existing adjustments
    newCalculation.final_budget_amount = this.applyAdjustments(
      newCalculation.estimated_fuel_cost,
      newCalculation.adjustments
    );

    return newCalculation;
  }

  /**
   * Add operator adjustment to budget
   */
  addAdjustment(
    calculation: FuelBudgetCalculation,
    adjustmentType: 'increase' | 'decrease',
    adjustmentAmount: number,
    reason: string,
    operatorId: string
  ): FuelBudgetCalculation {
    // Validate adjustment
    if (adjustmentAmount <= 0) {
      throw new Error('Adjustment amount must be positive');
    }

    if (!reason || reason.trim().length < 10) {
      throw new Error('Adjustment reason must be at least 10 characters');
    }

    // Check if adjustment exceeds threshold
    const adjustmentPercent = (adjustmentAmount / calculation.estimated_fuel_cost) * 100;
    if (adjustmentPercent > this.validationRules.max_operator_adjustment) {
      throw new Error(
        `Adjustment exceeds maximum allowed (${this.validationRules.max_operator_adjustment}%)`
      );
    }

    // Create adjustment record
    const adjustment: FuelBudgetAdjustment = {
      adjustment_type: adjustmentType,
      adjustment_amount: this.roundToDecimal(adjustmentAmount, 2),
      adjustment_reason: reason.trim(),
      adjusted_by: operatorId,
      adjusted_at: new Date().toISOString(),
    };

    // Add to adjustments array
    const updatedCalculation = { ...calculation };
    updatedCalculation.adjustments = [...calculation.adjustments, adjustment];

    // Recalculate final budget
    updatedCalculation.final_budget_amount = this.applyAdjustments(
      calculation.estimated_fuel_cost,
      updatedCalculation.adjustments
    );

    updatedCalculation.updated_at = new Date().toISOString();

    return updatedCalculation;
  }

  /**
   * Remove operator adjustment
   */
  removeAdjustment(
    calculation: FuelBudgetCalculation,
    adjustmentIndex: number
  ): FuelBudgetCalculation {
    if (adjustmentIndex < 0 || adjustmentIndex >= calculation.adjustments.length) {
      throw new Error('Invalid adjustment index');
    }

    const updatedCalculation = { ...calculation };
    updatedCalculation.adjustments = calculation.adjustments.filter(
      (_, index) => index !== adjustmentIndex
    );

    // Recalculate final budget
    updatedCalculation.final_budget_amount = this.applyAdjustments(
      calculation.estimated_fuel_cost,
      updatedCalculation.adjustments
    );

    updatedCalculation.updated_at = new Date().toISOString();

    return updatedCalculation;
  }

  /**
   * Mark budget as reviewed
   */
  markAsReviewed(
    calculation: FuelBudgetCalculation,
    operatorId: string
  ): FuelBudgetCalculation {
    if (calculation.status === 'approved') {
      throw new Error('Cannot review an already approved budget');
    }

    return {
      ...calculation,
      status: 'reviewed',
      reviewed_by: operatorId,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Approve budget
   */
  approve(
    calculation: FuelBudgetCalculation,
    operatorId: string
  ): FuelBudgetCalculation {
    if (calculation.status === 'approved') {
      throw new Error('Budget already approved');
    }

    return {
      ...calculation,
      status: 'approved',
      approved_by: operatorId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Reject budget
   */
  reject(
    calculation: FuelBudgetCalculation,
    operatorId: string,
    reason: string
  ): FuelBudgetCalculation {
    if (!reason || reason.trim().length < 10) {
      throw new Error('Rejection reason must be at least 10 characters');
    }

    return {
      ...calculation,
      status: 'rejected',
      approved_by: operatorId,
      approved_at: new Date().toISOString(),
      rejection_reason: reason.trim(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Record amount released to driver
   */
  recordRelease(
    calculation: FuelBudgetCalculation,
    amountReleased: number,
    operatorId: string,
    notes?: string
  ): FuelBudgetCalculation {
    if (calculation.status !== 'approved') {
      throw new Error('Can only release funds for approved budgets');
    }

    if (amountReleased <= 0) {
      throw new Error('Released amount must be positive');
    }

    if (amountReleased > calculation.final_budget_amount * 1.1) {
      throw new Error('Released amount exceeds budget by more than 10%');
    }

    return {
      ...calculation,
      amount_released: this.roundToDecimal(amountReleased, 2),
      released_by: operatorId,
      released_at: new Date().toISOString(),
      release_notes: notes?.trim(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Calculate total distance (one-way + return)
   */
  private calculateTotalDistance(input: FuelBudgetInput): number {
    const oneWayDistance = input.route_distance_km;
    const returnDistance = input.return_distance_km || 0;
    const numberOfTrips = input.number_of_trips || 1;

    return (oneWayDistance + returnDistance) * numberOfTrips;
  }

  /**
   * Calculate base litres required (without allowances)
   */
  private calculateBaseLitres(distanceKm: number, efficiencyKmpl: number): number {
    if (efficiencyKmpl <= 0) {
      throw new Error('Truck efficiency must be positive');
    }

    return distanceKm / efficiencyKmpl;
  }

  /**
   * Calculate allowance litres
   */
  private calculateAllowance(baseLitres: number, allowancePercent: number): number {
    return (baseLitres * allowancePercent) / 100;
  }

  /**
   * Apply all adjustments to base amount
   */
  private applyAdjustments(
    baseAmount: number,
    adjustments: FuelBudgetAdjustment[]
  ): number {
    let finalAmount = baseAmount;

    for (const adjustment of adjustments) {
      if (adjustment.adjustment_type === 'increase') {
        finalAmount += adjustment.adjustment_amount;
      } else {
        finalAmount -= adjustment.adjustment_amount;
      }
    }

    return this.roundToDecimal(Math.max(0, finalAmount), 2);
  }

  /**
   * Validate input parameters
   */
  private validateInput(input: FuelBudgetInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate distance
    if (input.route_distance_km < this.validationRules.min_distance_km) {
      errors.push(
        `Route distance must be at least ${this.validationRules.min_distance_km} km`
      );
    }

    if (input.route_distance_km > this.validationRules.max_distance_km) {
      errors.push(
        `Route distance exceeds maximum ${this.validationRules.max_distance_km} km`
      );
    }

    if (input.return_distance_km && input.return_distance_km < 0) {
      errors.push('Return distance cannot be negative');
    }

    if (input.return_distance_km && input.return_distance_km > this.validationRules.max_distance_km) {
      errors.push(
        `Return distance exceeds maximum ${this.validationRules.max_distance_km} km`
      );
    }

    // Validate number of trips
    if (input.number_of_trips < 1) {
      errors.push('Number of trips must be at least 1');
    }

    if (input.number_of_trips > 100) {
      errors.push('Number of trips exceeds maximum (100)');
    }

    // Validate truck efficiency
    if (input.truck_efficiency_kmpl < this.validationRules.min_efficiency_kmpl) {
      errors.push(
        `Truck efficiency must be at least ${this.validationRules.min_efficiency_kmpl} km/l`
      );
    }

    if (input.truck_efficiency_kmpl > this.validationRules.max_efficiency_kmpl) {
      errors.push(
        `Truck efficiency exceeds maximum ${this.validationRules.max_efficiency_kmpl} km/l`
      );
    }

    // Validate fuel price
    if (input.current_fuel_price < this.validationRules.min_fuel_price) {
      errors.push(
        `Fuel price must be at least ${this.validationRules.min_fuel_price}`
      );
    }

    if (input.current_fuel_price > this.validationRules.max_fuel_price) {
      errors.push(
        `Fuel price exceeds maximum ${this.validationRules.max_fuel_price}`
      );
    }

    // Validate allowances
    if (input.traffic_allowance_percent < 0) {
      errors.push('Traffic allowance cannot be negative');
    }

    if (input.traffic_allowance_percent > this.validationRules.max_traffic_allowance) {
      errors.push(
        `Traffic allowance exceeds maximum ${this.validationRules.max_traffic_allowance}%`
      );
    }

    if (input.idling_allowance_percent < 0) {
      errors.push('Idling allowance cannot be negative');
    }

    if (input.idling_allowance_percent > this.validationRules.max_idling_allowance) {
      errors.push(
        `Idling allowance exceeds maximum ${this.validationRules.max_idling_allowance}%`
      );
    }

    // Warnings for high allowances
    if (input.traffic_allowance_percent > 20) {
      warnings.push('Traffic allowance is unusually high (>20%)');
    }

    if (input.idling_allowance_percent > 10) {
      warnings.push('Idling allowance is unusually high (>10%)');
    }

    // Warning for very low efficiency
    if (input.truck_efficiency_kmpl < 4) {
      warnings.push('Truck efficiency is very low (<4 km/l). Verify truck data.');
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Round number to specified decimal places
   */
  private roundToDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Generate unique calculation ID
   */
  private generateCalculationId(): string {
    return `fuel_calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get calculation breakdown for display
   */
  getCalculationBreakdown(calculation: FuelBudgetCalculation): {
    label: string;
    value: number;
    formatted: string;
  }[] {
    const currency = '$'; // TODO: Get from settings

    return [
      {
        label: 'Total Distance',
        value: calculation.total_distance_km,
        formatted: `${calculation.total_distance_km.toFixed(2)} km`,
      },
      {
        label: 'Base Fuel Required',
        value: calculation.base_litres,
        formatted: `${calculation.base_litres.toFixed(2)} L`,
      },
      {
        label: `Traffic Allowance (${calculation.input.traffic_allowance_percent}%)`,
        value: calculation.traffic_allowance_litres,
        formatted: `${calculation.traffic_allowance_litres.toFixed(2)} L`,
      },
      {
        label: `Idling Allowance (${calculation.input.idling_allowance_percent}%)`,
        value: calculation.idling_allowance_litres,
        formatted: `${calculation.idling_allowance_litres.toFixed(2)} L`,
      },
      {
        label: 'Total Estimated Litres',
        value: calculation.estimated_litres,
        formatted: `${calculation.estimated_litres.toFixed(2)} L`,
      },
      {
        label: `Fuel Price per Litre`,
        value: calculation.input.current_fuel_price,
        formatted: `${currency}${calculation.input.current_fuel_price.toFixed(2)}/L`,
      },
      {
        label: 'Estimated Fuel Cost',
        value: calculation.estimated_fuel_cost,
        formatted: `${currency}${calculation.estimated_fuel_cost.toFixed(2)}`,
      },
      ...calculation.adjustments.map((adj, index) => ({
        label: `${adj.adjustment_type === 'increase' ? 'Increase' : 'Decrease'} (${adj.adjustment_reason})`,
        value: adj.adjustment_type === 'increase' ? adj.adjustment_amount : -adj.adjustment_amount,
        formatted: `${adj.adjustment_type === 'increase' ? '+' : '-'}${currency}${adj.adjustment_amount.toFixed(2)}`,
      })),
      {
        label: 'Final Budget',
        value: calculation.final_budget_amount,
        formatted: `${currency}${calculation.final_budget_amount.toFixed(2)}`,
      },
    ];
  }

  /**
   * Calculate estimated fuel efficiency from distance and litres
   */
  static calculateEfficiency(distanceKm: number, litres: number): number {
    if (litres <= 0) return 0;
    return distanceKm / litres;
  }

  /**
   * Calculate cost per kilometre
   */
  static calculateCostPerKm(totalCost: number, distanceKm: number): number {
    if (distanceKm <= 0) return 0;
    return totalCost / distanceKm;
  }

  /**
   * Format currency amount
   */
  static formatCurrency(amount: number, currency: string = '$'): string {
    return `${currency}${amount.toFixed(2)}`;
  }

  /**
   * Calculate percentage variance
   */
  static calculateVariance(actual: number, expected: number): {
    absolute: number;
    percentage: number;
  } {
    if (expected === 0) {
      return { absolute: actual, percentage: actual > 0 ? 100 : 0 };
    }

    const absolute = actual - expected;
    const percentage = (absolute / expected) * 100;

    return {
      absolute: Math.round(absolute * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
    };
  }
}

// Export singleton instance
export const fuelBudgetCalculator = new FuelBudgetCalculator();
