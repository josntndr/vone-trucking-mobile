/**
 * Fuel Recording Service
 * 
 * Manages driver fuel purchase records with validation,
 * receipt upload, and operator approval workflow.
 */

import type {
  FuelRecord,
  FuelRecordValidation,
  FuelRecordValidationRules,
  OdometerReading,
  OdometerValidation,
} from '../../types/fuel.types';
import {
  DEFAULT_FUEL_RECORD_RULES,
} from '../../types/fuel.types';

interface CreateFuelRecordInput {
  trip_id: string;
  truck_id: string;
  driver_id: string;
  litres_purchased: number;
  price_per_litre: number;
  total_amount: number;
  fuel_station_name: string;
  fuel_station_location?: string;
  fuel_station_latitude?: number;
  fuel_station_longitude?: number;
  odometer_reading: number;
  purchase_date: string;
  receipt_photo_url?: string;
  receipt_number?: string;
  notes?: string;
}

export class FuelRecordingService {
  private validationRules: FuelRecordValidationRules;
  private marketFuelPrice: number = 1.50; // TODO: Get from fuel price service

  constructor(validationRules?: Partial<FuelRecordValidationRules>) {
    this.validationRules = {
      ...DEFAULT_FUEL_RECORD_RULES,
      ...validationRules,
    };
  }

  /**
   * Create new fuel record
   */
  async createRecord(input: CreateFuelRecordInput): Promise<FuelRecord> {
    // Validate input
    const validation = this.validateRecord(input);

    // Create record
    const record: FuelRecord = {
      id: this.generateRecordId(),
      trip_id: input.trip_id,
      truck_id: input.truck_id,
      driver_id: input.driver_id,
      litres_purchased: this.roundToDecimal(input.litres_purchased, 2),
      price_per_litre: this.roundToDecimal(input.price_per_litre, 2),
      total_amount: this.roundToDecimal(input.total_amount, 2),
      fuel_station_name: input.fuel_station_name.trim(),
      fuel_station_location: input.fuel_station_location?.trim(),
      fuel_station_latitude: input.fuel_station_latitude,
      fuel_station_longitude: input.fuel_station_longitude,
      odometer_reading: Math.round(input.odometer_reading),
      purchase_date: input.purchase_date,
      receipt_photo_url: input.receipt_photo_url,
      receipt_number: input.receipt_number?.trim(),
      is_validated: validation.is_valid,
      validation_issues: validation.errors.length > 0 ? validation.errors : undefined,
      requires_explanation: validation.requires_explanation,
      is_approved: false,
      notes: input.notes?.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return record;
  }

  /**
   * Update existing fuel record
   */
  async updateRecord(
    existingRecord: FuelRecord,
    updates: Partial<CreateFuelRecordInput>
  ): Promise<FuelRecord> {
    if (existingRecord.is_approved) {
      throw new Error('Cannot update approved fuel record');
    }

    // Merge updates
    const updatedInput = {
      trip_id: updates.trip_id || existingRecord.trip_id,
      truck_id: updates.truck_id || existingRecord.truck_id,
      driver_id: updates.driver_id || existingRecord.driver_id,
      litres_purchased: updates.litres_purchased ?? existingRecord.litres_purchased,
      price_per_litre: updates.price_per_litre ?? existingRecord.price_per_litre,
      total_amount: updates.total_amount ?? existingRecord.total_amount,
      fuel_station_name: updates.fuel_station_name || existingRecord.fuel_station_name,
      fuel_station_location: updates.fuel_station_location || existingRecord.fuel_station_location,
      fuel_station_latitude: updates.fuel_station_latitude ?? existingRecord.fuel_station_latitude,
      fuel_station_longitude: updates.fuel_station_longitude ?? existingRecord.fuel_station_longitude,
      odometer_reading: updates.odometer_reading ?? existingRecord.odometer_reading,
      purchase_date: updates.purchase_date || existingRecord.purchase_date,
      receipt_photo_url: updates.receipt_photo_url || existingRecord.receipt_photo_url,
      receipt_number: updates.receipt_number || existingRecord.receipt_number,
      notes: updates.notes || existingRecord.notes,
    };

    // Re-validate
    const validation = this.validateRecord(updatedInput);

    // Update record
    return {
      ...existingRecord,
      ...updatedInput,
      litres_purchased: this.roundToDecimal(updatedInput.litres_purchased, 2),
      price_per_litre: this.roundToDecimal(updatedInput.price_per_litre, 2),
      total_amount: this.roundToDecimal(updatedInput.total_amount, 2),
      odometer_reading: Math.round(updatedInput.odometer_reading),
      is_validated: validation.is_valid,
      validation_issues: validation.errors.length > 0 ? validation.errors : undefined,
      requires_explanation: validation.requires_explanation,
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Add driver explanation for validation issues
   */
  addExplanation(
    record: FuelRecord,
    explanation: string
  ): FuelRecord {
    if (!record.requires_explanation) {
      throw new Error('Record does not require explanation');
    }

    if (!explanation || explanation.trim().length < 20) {
      throw new Error('Explanation must be at least 20 characters');
    }

    return {
      ...record,
      driver_explanation: explanation.trim(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Approve fuel record
   */
  approve(
    record: FuelRecord,
    operatorId: string
  ): FuelRecord {
    if (record.is_approved) {
      throw new Error('Record already approved');
    }

    if (record.requires_explanation && !record.driver_explanation) {
      throw new Error('Driver explanation required before approval');
    }

    return {
      ...record,
      is_approved: true,
      approved_by: operatorId,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Reject fuel record
   */
  reject(
    record: FuelRecord,
    operatorId: string,
    reason: string
  ): FuelRecord {
    if (!reason || reason.trim().length < 10) {
      throw new Error('Rejection reason must be at least 10 characters');
    }

    return {
      ...record,
      is_approved: false,
      approved_by: operatorId,
      approved_at: new Date().toISOString(),
      rejection_reason: reason.trim(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Validate fuel record
   */
  validateRecord(input: CreateFuelRecordInput): FuelRecordValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let requiresExplanation = false;

    // Validate litres
    if (input.litres_purchased < this.validationRules.min_litres) {
      errors.push(
        `Litres purchased must be at least ${this.validationRules.min_litres}L`
      );
    }

    if (input.litres_purchased > this.validationRules.max_litres) {
      errors.push(
        `Litres purchased exceeds maximum ${this.validationRules.max_litres}L`
      );
      requiresExplanation = true;
    }

    // Validate price per litre
    if (input.price_per_litre <= 0) {
      errors.push('Price per litre must be positive');
    }

    // Check price variance from market rate
    const priceVariance = Math.abs(input.price_per_litre - this.marketFuelPrice);
    const priceVariancePercent = (priceVariance / this.marketFuelPrice) * 100;

    if (priceVariancePercent > this.validationRules.price_variance_threshold) {
      warnings.push(
        `Price varies ${priceVariancePercent.toFixed(1)}% from market rate ($${this.marketFuelPrice.toFixed(2)}/L)`
      );
      requiresExplanation = true;
    }

    // Validate total amount calculation
    const calculatedTotal = this.roundToDecimal(
      input.litres_purchased * input.price_per_litre,
      2
    );
    const amountDifference = Math.abs(input.total_amount - calculatedTotal);

    if (amountDifference > this.validationRules.calculation_tolerance) {
      errors.push(
        `Total amount mismatch. Expected $${calculatedTotal.toFixed(2)}, got $${input.total_amount.toFixed(2)}`
      );
      requiresExplanation = true;
    }

    // Validate odometer
    if (input.odometer_reading < 0) {
      errors.push('Odometer reading cannot be negative');
    }

    // Validate fuel station name
    if (!input.fuel_station_name || input.fuel_station_name.trim().length < 2) {
      errors.push('Fuel station name is required');
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      calculated_total: calculatedTotal,
      amount_difference: this.roundToDecimal(input.total_amount - calculatedTotal, 2),
      requires_explanation: requiresExplanation || amountDifference > this.validationRules.calculation_tolerance,
    };
  }

  /**
   * Validate odometer reading against previous readings
   */
  async validateOdometer(
    currentReading: number,
    truckId: string,
    previousReadings: OdometerReading[],
    expectedDistance?: number
  ): Promise<OdometerValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isSuspicious = false;

    if (previousReadings.length === 0) {
      // No previous readings to compare
      return {
        is_valid: true,
        errors: [],
        warnings: [],
        current_reading: currentReading,
        is_suspicious: false,
      };
    }

    // Get most recent reading
    const previousReading = previousReadings[previousReadings.length - 1];
    const distanceTravelled = currentReading - previousReading.reading_km;

    // Check if odometer went backwards
    if (distanceTravelled < 0) {
      errors.push('Odometer reading is less than previous reading');
      isSuspicious = true;
    }

    // Check if distance is unusually large
    if (distanceTravelled > 1000) {
      warnings.push('Distance travelled is unusually high (>1000 km)');
      isSuspicious = true;
    }

    // Compare with expected distance (if provided)
    if (expectedDistance !== undefined && distanceTravelled > 0) {
      const variance = Math.abs(distanceTravelled - expectedDistance);
      const variancePercent = (variance / expectedDistance) * 100;

      if (variance > this.validationRules.odometer_variance_threshold) {
        warnings.push(
          `Odometer variance: Expected ${expectedDistance} km, got ${distanceTravelled} km (${variancePercent.toFixed(1)}% difference)`
        );

        if (variancePercent > 50) {
          isSuspicious = true;
        }
      }
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      previous_reading: previousReading.reading_km,
      current_reading: currentReading,
      distance_travelled: distanceTravelled,
      expected_distance: expectedDistance,
      variance: expectedDistance ? Math.abs(distanceTravelled - expectedDistance) : undefined,
      is_suspicious: isSuspicious,
    };
  }

  /**
   * Check for multiple purchases on same day
   */
  async checkMultiplePurchases(
    truckId: string,
    purchaseDate: string,
    existingRecords: FuelRecord[]
  ): Promise<{ count: number; is_unusual: boolean; message?: string }> {
    const purchaseDateOnly = purchaseDate.split('T')[0];
    
    const sameDayPurchases = existingRecords.filter(record => {
      const recordDate = record.purchase_date.split('T')[0];
      return record.truck_id === truckId && recordDate === purchaseDateOnly;
    });

    const count = sameDayPurchases.length;
    const isUnusual = count >= this.validationRules.max_purchases_per_day;

    return {
      count,
      is_unusual: isUnusual,
      message: isUnusual
        ? `${count} fuel purchases recorded on the same day. Please verify.`
        : undefined,
    };
  }

  /**
   * Calculate fuel efficiency from record
   */
  calculateEfficiency(
    fuelRecord: FuelRecord,
    distanceTravelled: number
  ): number {
    if (fuelRecord.litres_purchased <= 0) return 0;
    return this.roundToDecimal(distanceTravelled / fuelRecord.litres_purchased, 2);
  }

  /**
   * Get fuel records summary for trip
   */
  getTripFuelSummary(records: FuelRecord[]): {
    total_litres: number;
    total_cost: number;
    purchase_count: number;
    approved_count: number;
    pending_count: number;
    average_price: number;
  } {
    const approvedRecords = records.filter(r => r.is_approved);
    const pendingRecords = records.filter(r => !r.is_approved);

    const totalLitres = records.reduce((sum, r) => sum + r.litres_purchased, 0);
    const totalCost = records.reduce((sum, r) => sum + r.total_amount, 0);
    const averagePrice = totalLitres > 0 ? totalCost / totalLitres : 0;

    return {
      total_litres: this.roundToDecimal(totalLitres, 2),
      total_cost: this.roundToDecimal(totalCost, 2),
      purchase_count: records.length,
      approved_count: approvedRecords.length,
      pending_count: pendingRecords.length,
      average_price: this.roundToDecimal(averagePrice, 2),
    };
  }

  /**
   * Upload receipt photo
   */
  async uploadReceipt(
    recordId: string,
    photoFile: File | Blob
  ): Promise<string> {
    // TODO: Implement actual file upload to cloud storage
    // For now, return mock URL
    const fileName = `receipt_${recordId}_${Date.now()}.jpg`;
    const mockUrl = `/uploads/receipts/${fileName}`;
    
    console.log('[FuelRecording] Uploading receipt:', fileName);
    
    // In production, use:
    // const url = await uploadToCloudStorage(photoFile, fileName);
    
    return mockUrl;
  }

  /**
   * Set market fuel price (for validation)
   */
  setMarketFuelPrice(price: number): void {
    if (price <= 0) {
      throw new Error('Market fuel price must be positive');
    }
    this.marketFuelPrice = price;
  }

  /**
   * Get market fuel price
   */
  getMarketFuelPrice(): number {
    return this.marketFuelPrice;
  }

  /**
   * Round number to decimal places
   */
  private roundToDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Generate unique record ID
   */
  private generateRecordId(): string {
    return `fuel_rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Auto-calculate total from litres and price
   */
  static calculateTotal(litres: number, pricePerLitre: number): number {
    return Math.round(litres * pricePerLitre * 100) / 100;
  }

  /**
   * Auto-calculate litres from total and price
   */
  static calculateLitres(total: number, pricePerLitre: number): number {
    if (pricePerLitre <= 0) return 0;
    return Math.round((total / pricePerLitre) * 100) / 100;
  }

  /**
   * Auto-calculate price from total and litres
   */
  static calculatePrice(total: number, litres: number): number {
    if (litres <= 0) return 0;
    return Math.round((total / litres) * 100) / 100;
  }
}

// Export singleton instance
export const fuelRecordingService = new FuelRecordingService();
