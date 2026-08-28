// @ts-nocheck
/**
 * Fuel and Expense Reports Service
 * 
 * Generates comparison reports for fuel consumption, expenses,
 * and detects unusual usage patterns.
 */

import type {
  FuelBudgetCalculation,
  FuelRecord,
  TripExpense,
  FuelBudgetComparison,
  FuelConsumptionByTruck,
  FuelConsumptionByTrip,
  FuelConsumptionByDestination,
  UnusualFuelUsage,
  ReportFilters,
  ReportMetadata,
  VARIANCE_THRESHOLDS,
} from '../../types/fuel.types';

interface TripData {
  trip_id: string;
  truck_id: string;
  driver_id: string;
  origin: string;
  destination: string;
  distance_km: number;
  start_date: string;
  end_date: string;
}

interface TruckData {
  truck_id: string;
  unit_number: string;
  plate_number: string;
  expected_efficiency_kmpl: number;
}

export class FuelReportsService {
  /**
   * Generate budget vs actual comparison
   */
  generateBudgetComparison(
    budget: FuelBudgetCalculation,
    fuelRecords: FuelRecord[]
  ): FuelBudgetComparison {
    // Calculate actual totals
    const actualLitres = fuelRecords.reduce((sum, r) => sum + r.litres_purchased, 0);
    const actualCost = fuelRecords.reduce((sum, r) => sum + r.total_amount, 0);

    // Calculate variances
    const litresVariance = actualLitres - budget.estimated_litres;
    const litresVariancePercent = budget.estimated_litres > 0
      ? (litresVariance / budget.estimated_litres) * 100
      : 0;

    const costVariance = actualCost - budget.estimated_fuel_cost;
    const costVariancePercent = budget.estimated_fuel_cost > 0
      ? (costVariance / budget.estimated_fuel_cost) * 100
      : 0;

    // Calculate remaining budget
    const budgetRemaining = (budget.amount_released || budget.final_budget_amount) - actualCost;

    // Determine if over budget
    const isOverBudget = actualCost > (budget.amount_released || budget.final_budget_amount);
    const varianceThresholdExceeded = Math.abs(costVariancePercent) > 10;

    return {
      trip_id: budget.trip_id,
      truck_id: budget.input.truck_id,
      driver_id: budget.input.driver_id || '',
      estimated_litres: this.roundToDecimal(budget.estimated_litres, 2),
      estimated_cost: this.roundToDecimal(budget.estimated_fuel_cost, 2),
      budgeted_amount: this.roundToDecimal(budget.final_budget_amount, 2),
      amount_released: this.roundToDecimal(budget.amount_released || 0, 2),
      actual_litres: this.roundToDecimal(actualLitres, 2),
      actual_cost: this.roundToDecimal(actualCost, 2),
      litres_variance: this.roundToDecimal(litresVariance, 2),
      litres_variance_percent: this.roundToDecimal(litresVariancePercent, 2),
      cost_variance: this.roundToDecimal(costVariance, 2),
      cost_variance_percent: this.roundToDecimal(costVariancePercent, 2),
      budget_remaining: this.roundToDecimal(budgetRemaining, 2),
      is_over_budget: isOverBudget,
      variance_threshold_exceeded: varianceThresholdExceeded,
    };
  }

  /**
   * Generate fuel consumption by truck report
   */
  generateConsumptionByTruck(
    truck: TruckData,
    trips: TripData[],
    fuelRecords: FuelRecord[],
    filters?: ReportFilters
  ): FuelConsumptionByTruck {
    // Filter trips for this truck
    const truckTrips = trips.filter(t => t.truck_id === truck.truck_id);

    // Apply date filters
    const filteredTrips = this.filterByDateRange(truckTrips, filters);

    // Get fuel records for these trips
    const tripIds = filteredTrips.map(t => t.trip_id);
    const truckFuelRecords = fuelRecords.filter(r => tripIds.includes(r.trip_id));

    // Calculate totals
    const totalDistance = filteredTrips.reduce((sum, t) => sum + t.distance_km, 0);
    const totalLitres = truckFuelRecords.reduce((sum, r) => sum + r.litres_purchased, 0);
    const totalCost = truckFuelRecords.reduce((sum, r) => sum + r.total_amount, 0);

    // Calculate efficiency
    const averageKmpl = totalLitres > 0 ? totalDistance / totalLitres : 0;
    const expectedKmpl = truck.expected_efficiency_kmpl;
    const efficiencyVariancePercent = expectedKmpl > 0
      ? ((averageKmpl - expectedKmpl) / expectedKmpl) * 100
      : 0;

    // Determine performance
    const isPerformingWell = averageKmpl >= expectedKmpl * 0.9; // Within 10% of expected

    return {
      truck_id: truck.truck_id,
      truck_unit_number: truck.unit_number,
      truck_plate_number: truck.plate_number,
      period_start: filters?.start_date || filteredTrips[0]?.start_date || '',
      period_end: filters?.end_date || filteredTrips[filteredTrips.length - 1]?.end_date || '',
      total_distance_km: this.roundToDecimal(totalDistance, 2),
      total_litres: this.roundToDecimal(totalLitres, 2),
      total_cost: this.roundToDecimal(totalCost, 2),
      average_kmpl: this.roundToDecimal(averageKmpl, 2),
      expected_kmpl: this.roundToDecimal(expectedKmpl, 2),
      efficiency_variance_percent: this.roundToDecimal(efficiencyVariancePercent, 2),
      trip_count: filteredTrips.length,
      is_performing_well: isPerformingWell,
    };
  }

  /**
   * Generate fuel consumption by trip report
   */
  generateConsumptionByTrip(
    trip: TripData,
    truck: TruckData,
    fuelRecords: FuelRecord[]
  ): FuelConsumptionByTrip {
    // Get fuel records for this trip
    const tripFuelRecords = fuelRecords.filter(r => r.trip_id === trip.trip_id);

    // Calculate totals
    const litresConsumed = tripFuelRecords.reduce((sum, r) => sum + r.litres_purchased, 0);
    const fuelCost = tripFuelRecords.reduce((sum, r) => sum + r.total_amount, 0);

    // Calculate efficiency
    const actualKmpl = litresConsumed > 0 ? trip.distance_km / litresConsumed : 0;
    const expectedKmpl = truck.expected_efficiency_kmpl;
    const efficiencyVariancePercent = expectedKmpl > 0
      ? ((actualKmpl - expectedKmpl) / expectedKmpl) * 100
      : 0;

    // Calculate cost per km
    const costPerKm = trip.distance_km > 0 ? fuelCost / trip.distance_km : 0;

    // Determine if efficient
    const isEfficient = actualKmpl >= expectedKmpl * 0.9;

    // Flag if unusually high consumption
    const isFlagged = Math.abs(efficiencyVariancePercent) > 20 || litresConsumed === 0;

    return {
      trip_id: trip.trip_id,
      truck_id: trip.truck_id,
      driver_id: trip.driver_id,
      origin: trip.origin,
      destination: trip.destination,
      distance_km: this.roundToDecimal(trip.distance_km, 2),
      litres_consumed: this.roundToDecimal(litresConsumed, 2),
      fuel_cost: this.roundToDecimal(fuelCost, 2),
      actual_kmpl: this.roundToDecimal(actualKmpl, 2),
      expected_kmpl: this.roundToDecimal(expectedKmpl, 2),
      efficiency_variance_percent: this.roundToDecimal(efficiencyVariancePercent, 2),
      cost_per_km: this.roundToDecimal(costPerKm, 2),
      is_efficient: isEfficient,
      is_flagged: isFlagged,
    };
  }

  /**
   * Generate fuel consumption by destination report
   */
  generateConsumptionByDestination(
    destination: string,
    trips: TripData[],
    trucks: TruckData[],
    fuelRecords: FuelRecord[]
  ): FuelConsumptionByDestination {
    // Filter trips to this destination
    const destinationTrips = trips.filter(t => t.destination === destination);

    // Calculate aggregates
    const tripCount = destinationTrips.length;
    const totalDistance = destinationTrips.reduce((sum, t) => sum + t.distance_km, 0);
    const averageDistance = tripCount > 0 ? totalDistance / tripCount : 0;

    // Get fuel records for these trips
    const tripIds = destinationTrips.map(t => t.trip_id);
    const destFuelRecords = fuelRecords.filter(r => tripIds.includes(r.trip_id));

    // Calculate fuel totals
    const totalLitres = destFuelRecords.reduce((sum, r) => sum + r.litres_purchased, 0);
    const averageLitresPerTrip = tripCount > 0 ? totalLitres / tripCount : 0;
    const totalCost = destFuelRecords.reduce((sum, r) => sum + r.total_amount, 0);
    const averageCostPerTrip = tripCount > 0 ? totalCost / tripCount : 0;

    // Calculate efficiency statistics
    const efficiencies: number[] = [];
    for (const trip of destinationTrips) {
      const tripFuel = destFuelRecords.filter(r => r.trip_id === trip.trip_id);
      const litres = tripFuel.reduce((sum, r) => sum + r.litres_purchased, 0);
      if (litres > 0) {
        efficiencies.push(trip.distance_km / litres);
      }
    }

    const averageKmpl = efficiencies.length > 0
      ? efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length
      : 0;
    const bestKmpl = efficiencies.length > 0 ? Math.max(...efficiencies) : 0;
    const worstKmpl = efficiencies.length > 0 ? Math.min(...efficiencies) : 0;

    // Count unique trucks
    const truckCount = new Set(destinationTrips.map(t => t.truck_id)).size;

    return {
      destination,
      trip_count: tripCount,
      total_distance_km: this.roundToDecimal(totalDistance, 2),
      average_distance_km: this.roundToDecimal(averageDistance, 2),
      total_litres: this.roundToDecimal(totalLitres, 2),
      average_litres_per_trip: this.roundToDecimal(averageLitresPerTrip, 2),
      total_cost: this.roundToDecimal(totalCost, 2),
      average_cost_per_trip: this.roundToDecimal(averageCostPerTrip, 2),
      average_kmpl: this.roundToDecimal(averageKmpl, 2),
      best_kmpl: this.roundToDecimal(bestKmpl, 2),
      worst_kmpl: this.roundToDecimal(worstKmpl, 2),
      truck_count: truckCount,
    };
  }

  /**
   * Detect unusual fuel usage
   */
  detectUnusualUsage(
    trips: TripData[],
    trucks: TruckData[],
    fuelRecords: FuelRecord[],
    budgets: FuelBudgetCalculation[]
  ): UnusualFuelUsage[] {
    const unusualUsages: UnusualFuelUsage[] = [];

    // Check each trip
    for (const trip of trips) {
      const truck = trucks.find(t => t.truck_id === trip.truck_id);
      if (!truck) continue;

      const tripFuel = fuelRecords.filter(r => r.trip_id === trip.trip_id);
      const totalLitres = tripFuel.reduce((sum, r) => sum + r.litres_purchased, 0);

      if (totalLitres > 0) {
        // Check for excessive consumption
        const actualKmpl = trip.distance_km / totalLitres;
        const expectedKmpl = truck.expected_efficiency_kmpl;
        const efficiencyVariance = ((actualKmpl - expectedKmpl) / expectedKmpl) * 100;

        if (efficiencyVariance < -30) {
          // 30% worse than expected
          unusualUsages.push({
            record_id: trip.trip_id,
            type: 'trip',
            trip_id: trip.trip_id,
            truck_id: trip.truck_id,
            driver_id: trip.driver_id,
            issue_type: 'excessive_consumption',
            issue_description: `Fuel consumption is ${Math.abs(efficiencyVariance).toFixed(1)}% worse than expected (${actualKmpl.toFixed(2)} vs ${expectedKmpl.toFixed(2)} km/l)`,
            severity: efficiencyVariance < -50 ? 'high' : 'medium',
            expected_value: expectedKmpl,
            actual_value: this.roundToDecimal(actualKmpl, 2),
            variance_percent: this.roundToDecimal(efficiencyVariance, 2),
            is_reviewed: false,
            is_resolved: false,
            flagged_at: new Date().toISOString(),
          });
        } else if (efficiencyVariance > 50) {
          // Suspiciously good efficiency
          unusualUsages.push({
            record_id: trip.trip_id,
            type: 'trip',
            trip_id: trip.trip_id,
            truck_id: trip.truck_id,
            driver_id: trip.driver_id,
            issue_type: 'suspiciously_low',
            issue_description: `Fuel consumption is suspiciously low (${actualKmpl.toFixed(2)} vs expected ${expectedKmpl.toFixed(2)} km/l). Verify records.`,
            severity: 'medium',
            expected_value: expectedKmpl,
            actual_value: this.roundToDecimal(actualKmpl, 2),
            variance_percent: this.roundToDecimal(efficiencyVariance, 2),
            is_reviewed: false,
            is_resolved: false,
            flagged_at: new Date().toISOString(),
          });
        }
      }

      // Check for multiple purchases same day
      const purchasesByDate = new Map<string, FuelRecord[]>();
      for (const record of tripFuel) {
        const date = record.purchase_date.split('T')[0];
        if (!purchasesByDate.has(date)) {
          purchasesByDate.set(date, []);
        }
        purchasesByDate.get(date)!.push(record);
      }

      purchasesByDate.forEach((records, date) => {
        if (records.length >= 3) {
          unusualUsages.push({
            record_id: trip.trip_id,
            type: 'trip',
            trip_id: trip.trip_id,
            truck_id: trip.truck_id,
            driver_id: trip.driver_id,
            issue_type: 'multiple_purchases_same_day',
            issue_description: `${records.length} fuel purchases on ${date}. Verify legitimacy.`,
            severity: 'low',
            actual_value: records.length,
            is_reviewed: false,
            is_resolved: false,
            flagged_at: new Date().toISOString(),
          });
        }
      });

      // Check individual fuel records
      for (const record of tripFuel) {
        // Large single purchase
        if (record.litres_purchased > 300) {
          unusualUsages.push({
            record_id: record.id,
            type: 'fuel_record',
            trip_id: trip.trip_id,
            truck_id: trip.truck_id,
            driver_id: trip.driver_id,
            issue_type: 'large_single_purchase',
            issue_description: `Very large fuel purchase: ${record.litres_purchased}L at ${record.fuel_station_name}`,
            severity: 'medium',
            actual_value: this.roundToDecimal(record.litres_purchased, 2),
            is_reviewed: false,
            is_resolved: false,
            flagged_at: new Date().toISOString(),
          });
        }

        // Price outlier (already has validation in recording)
        // Calculation mismatch (already handled in validation)
      }
    }

    return unusualUsages;
  }

  /**
   * Generate expense summary report
   */
  generateExpenseSummary(
    trips: TripData[],
    expenses: TripExpense[],
    filters?: ReportFilters
  ): {
    total_trips: number;
    total_expenses: number;
    average_per_trip: number;
    by_category: Record<string, number>;
    top_expense_trips: {
      trip_id: string;
      destination: string;
      total: number;
    }[];
  } {
    // Apply filters
    const filteredTrips = this.filterByDateRange(trips, filters);
    const tripIds = filteredTrips.map(t => t.trip_id);
    const filteredExpenses = expenses.filter(e => tripIds.includes(e.trip_id));

    // Calculate totals
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const averagePerTrip = filteredTrips.length > 0 ? totalExpenses / filteredTrips.length : 0;

    // By category
    const byCategory: Record<string, number> = {};
    for (const expense of filteredExpenses) {
      if (!byCategory[expense.category]) {
        byCategory[expense.category] = 0;
      }
      byCategory[expense.category] += expense.amount;
    }

    // Top expense trips
    const tripExpenseTotals = new Map<string, number>();
    for (const expense of filteredExpenses) {
      const current = tripExpenseTotals.get(expense.trip_id) || 0;
      tripExpenseTotals.set(expense.trip_id, current + expense.amount);
    }

    const topExpenseTrips = Array.from(tripExpenseTotals.entries())
      .map(([tripId, total]) => {
        const trip = trips.find(t => t.trip_id === tripId);
        return {
          trip_id: tripId,
          destination: trip?.destination || 'Unknown',
          total: this.roundToDecimal(total, 2),
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return {
      total_trips: filteredTrips.length,
      total_expenses: this.roundToDecimal(totalExpenses, 2),
      average_per_trip: this.roundToDecimal(averagePerTrip, 2),
      by_category: Object.fromEntries(
        Object.entries(byCategory).map(([k, v]) => [k, this.roundToDecimal(v, 2)])
      ),
      top_expense_trips: topExpenseTrips,
    };
  }

  /**
   * Filter trips by date range
   */
  private filterByDateRange(trips: TripData[], filters?: ReportFilters): TripData[] {
    if (!filters?.start_date && !filters?.end_date) {
      return trips;
    }

    return trips.filter(trip => {
      if (filters.start_date && trip.start_date < filters.start_date) {
        return false;
      }
      if (filters.end_date && trip.start_date > filters.end_date) {
        return false;
      }
      return true;
    });
  }

  /**
   * Round to decimal places
   */
  private roundToDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Create report metadata
   */
  createReportMetadata(
    generatedBy: string,
    filters: ReportFilters,
    totalRecords: number
  ): ReportMetadata {
    return {
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
      filters_applied: filters,
      total_records: totalRecords,
    };
  }
}

// Export singleton instance
export const fuelReportsService = new FuelReportsService();

