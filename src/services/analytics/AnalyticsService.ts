/**
 * Analytics Service
 * 
 * Calculates trip profits, aggregates dashboard metrics, generates reports,
 * and provides business intelligence for operators
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  TripProfitCalculation,
  DashboardMetrics,
  DashboardFilters,
  DateFilter,
  TripMetrics,
  FinancialSummary,
  TruckUtilization,
  DriverPerformance,
  MaintenanceAlert,
  DocumentExpiryAlert,
  GPSHealthStatus,
  FuelAnalysis,
} from '../../types/analytics.types';

// Storage keys from other services
const TRIPS_KEY = '@vone_trips';
const FUEL_RECORDS_KEY = '@vone_fuel_records';
const PAYROLL_RECORDS_KEY = '@vone_payroll_records';
const CASH_ADVANCES_KEY = '@vone_cash_advances';

export class AnalyticsService {
  /**
   * Calculate net trip profit
   * Net trip profit = Trip income − Total trip expenses
   */
  calculateTripProfit(trip: any): TripProfitCalculation {
    // Get trip income
    const tripIncome = trip.trip_fee || 0;

    // Calculate total expenses
    const fuelExpenses = trip.fuel_records?.reduce((sum: number, record: any) => 
      sum + (record.total_amount || 0), 0) || 0;
    
    const tollExpenses = trip.expenses?.filter((e: any) => e.expense_type === 'toll')
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;
    
    const parkingExpenses = trip.expenses?.filter((e: any) => e.expense_type === 'parking')
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;
    
    const maintenanceExpenses = trip.expenses?.filter((e: any) => e.expense_type === 'maintenance')
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;
    
    const otherExpenses = trip.expenses?.filter((e: any) => 
      !['toll', 'parking', 'maintenance'].includes(e.expense_type))
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;

    const totalExpenses = fuelExpenses + tollExpenses + parkingExpenses + 
                         maintenanceExpenses + otherExpenses;

    const netProfit = tripIncome - totalExpenses;
    const profitMargin = tripIncome > 0 ? (netProfit / tripIncome) * 100 : 0;

    return {
      trip_id: trip.id,
      trip_income: tripIncome,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      expense_breakdown: {
        fuel: fuelExpenses,
        toll: tollExpenses,
        parking: parkingExpenses,
        maintenance: maintenanceExpenses,
        other: otherExpenses,
      },
      profit_margin_percentage: profitMargin,
    };
  }

  /**
   * Get date range based on filter type
   */
  private getDateRange(filter: DateFilter): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);
    end.setHours(23, 59, 59, 999);

    switch (filter.type) {
      case 'today':
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      
      case 'this_week':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        start.setHours(0, 0, 0, 0);
        break;
      
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        break;
      
      case 'custom':
        start = filter.start_date ? new Date(filter.start_date) : new Date(now);
        end = filter.end_date ? new Date(filter.end_date) : new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      
      default:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
    }

    return { start, end };
  }

  /**
   * Filter trips based on dashboard filters
   */
  private filterTrips(trips: any[], filters: DashboardFilters): any[] {
    const { start, end } = this.getDateRange(filters.date_filter);

    return trips.filter(trip => {
      // Date filter
      const tripDate = new Date(trip.scheduled_date || trip.created_at);
      if (tripDate < start || tripDate > end) {
        return false;
      }

      // Truck filter
      if (filters.truck_id && trip.truck_id !== filters.truck_id) {
        return false;
      }

      // Driver filter
      if (filters.driver_id && trip.driver_id !== filters.driver_id) {
        return false;
      }

      // Porter filter
      if (filters.porter_id && trip.porter_id !== filters.porter_id) {
        return false;
      }

      // Destination filter
      if (filters.destination && trip.destination !== filters.destination) {
        return false;
      }

      return true;
    });
  }

  /**
   * Calculate dashboard metrics
   */
  async calculateDashboardMetrics(filters: DashboardFilters): Promise<DashboardMetrics> {
    try {
      // Load all data
      const allTrips = await this.loadTrips();
      const fuelRecords = await this.loadFuelRecords();
      const payrollRecords = await this.loadPayrollRecords();
      const cashAdvances = await this.loadCashAdvances();

      // Apply filters
      const filteredTrips = this.filterTrips(allTrips, filters);
      const { start, end } = this.getDateRange(filters.date_filter);

      // Trip status counts
      const activeTrips = filteredTrips.filter(t => 
        t.status === 'in_progress' || t.status === 'at_loading' || 
        t.status === 'in_transit' || t.status === 'at_unloading'
      ).length;

      const scheduledTrips = filteredTrips.filter(t => t.status === 'scheduled').length;
      const completedTrips = filteredTrips.filter(t => t.status === 'completed').length;
      
      const delayedTrips = filteredTrips.filter(t => {
        if (t.status !== 'completed' && t.scheduled_date) {
          return new Date(t.scheduled_date) < new Date();
        }
        return false;
      }).length;

      // Truck status (mock - should query actual truck data)
      const uniqueTrucks = new Set(filteredTrips.map(t => t.truck_id));
      const trucksOnTrips = new Set(
        filteredTrips.filter(t => 
          t.status === 'in_progress' || t.status === 'at_loading' || 
          t.status === 'in_transit' || t.status === 'at_unloading'
        ).map(t => t.truck_id)
      ).size;

      // Financial metrics
      const weekStart = new Date(end);
      weekStart.setDate(end.getDate() - 7);
      
      const monthStart = new Date(end);
      monthStart.setDate(end.getDate() - 30);

      const weeklyTrips = filteredTrips.filter(t => {
        const date = new Date(t.completed_at || t.scheduled_date);
        return date >= weekStart && date <= end;
      });

      const monthlyTrips = filteredTrips.filter(t => {
        const date = new Date(t.completed_at || t.scheduled_date);
        return date >= monthStart && date <= end;
      });

      let weeklyIncome = 0;
      let weeklyExpenses = 0;
      let monthlyIncome = 0;
      let monthlyExpenses = 0;

      weeklyTrips.forEach(trip => {
        const profit = this.calculateTripProfit(trip);
        weeklyIncome += profit.trip_income;
        weeklyExpenses += profit.total_expenses;
      });

      monthlyTrips.forEach(trip => {
        const profit = this.calculateTripProfit(trip);
        monthlyIncome += profit.trip_income;
        monthlyExpenses += profit.total_expenses;
      });

      // Expense breakdown
      const fuelExpenses = fuelRecords
        .filter(r => {
          const date = new Date(r.purchase_date);
          return date >= start && date <= end;
        })
        .reduce((sum, r) => sum + (r.total_amount || 0), 0);

      const payrollCosts = payrollRecords
        .filter(r => {
          const date = new Date(r.created_at);
          return date >= start && date <= end;
        })
        .reduce((sum, r) => sum + (r.gross_pay || 0), 0);

      const outstandingCashAdvances = cashAdvances
        .filter(a => a.status === 'disbursed' || a.status === 'repaying')
        .reduce((sum, a) => {
          // Calculate remaining balance
          const transactions = a.transactions || [];
          let balance = a.amount;
          transactions.forEach((t: any) => {
            if (t.transaction_type === 'repayment') {
              balance -= t.amount;
            }
          });
          return sum + balance;
        }, 0);

      // Utilization and performance
      const totalTrucks = uniqueTrucks.size || 1;
      const truckUtilization = (trucksOnTrips / totalTrucks) * 100;

      // Fuel variance
      const fuelAnalysis = this.calculateFuelVariance(filteredTrips);

      // On-time delivery rate
      const completedWithDates = filteredTrips.filter(t => 
        t.status === 'completed' && t.scheduled_date && t.completed_at
      );
      
      const onTimeDeliveries = completedWithDates.filter(t => {
        const scheduled = new Date(t.scheduled_date);
        const completed = new Date(t.completed_at);
        return completed <= scheduled;
      }).length;
      
      const onTimeRate = completedWithDates.length > 0 
        ? (onTimeDeliveries / completedWithDates.length) * 100 
        : 0;

      // Frequent destinations
      const destinationMap = new Map<string, { count: number; income: number }>();
      filteredTrips.forEach(trip => {
        if (trip.destination) {
          const existing = destinationMap.get(trip.destination) || { count: 0, income: 0 };
          destinationMap.set(trip.destination, {
            count: existing.count + 1,
            income: existing.income + (trip.trip_fee || 0),
          });
        }
      });

      const frequentDestinations = Array.from(destinationMap.entries())
        .map(([destination, data]) => ({
          destination,
          trip_count: data.count,
          total_income: data.income,
        }))
        .sort((a, b) => b.trip_count - a.trip_count)
        .slice(0, 10);

      // Alerts (mock counts - should query actual data)
      const expiringDocumentsCount = 0; // TODO: Implement document tracking
      const maintenanceRemindersCount = 0; // TODO: Implement maintenance tracking
      const offlineGPSDevicesCount = 0; // TODO: Implement GPS health tracking

      return {
        active_trips: activeTrips,
        scheduled_trips: scheduledTrips,
        completed_trips: completedTrips,
        delayed_trips: delayedTrips,
        
        available_trucks: totalTrucks - trucksOnTrips,
        trucks_on_trips: trucksOnTrips,
        trucks_under_maintenance: 0, // TODO: Implement
        
        weekly_trip_income: weeklyIncome,
        monthly_trip_income: monthlyIncome,
        weekly_expenses: weeklyExpenses,
        monthly_expenses: monthlyExpenses,
        weekly_net_profit: weeklyIncome - weeklyExpenses,
        monthly_net_profit: monthlyIncome - monthlyExpenses,
        
        fuel_expenses: fuelExpenses,
        payroll_costs: payrollCosts,
        outstanding_cash_advances: outstandingCashAdvances,
        
        truck_utilization_percentage: truckUtilization,
        estimated_vs_actual_fuel_variance: fuelAnalysis.variance_percentage,
        on_time_delivery_rate: onTimeRate,
        
        frequent_destinations: frequentDestinations,
        
        expiring_documents_count: expiringDocumentsCount,
        maintenance_reminders_count: maintenanceRemindersCount,
        offline_gps_devices_count: offlineGPSDevicesCount,
        
        calculated_at: new Date().toISOString(),
        date_range_start: start.toISOString(),
        date_range_end: end.toISOString(),
      };
    } catch (error) {
      console.error('[Analytics] Failed to calculate dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate fuel variance analysis
   */
  private calculateFuelVariance(trips: any[]): FuelAnalysis {
    let estimatedTotal = 0;
    let actualTotal = 0;
    const tripsWithVariance: any[] = [];

    trips.forEach(trip => {
      const estimated = trip.estimated_fuel_cost || 0;
      const actual = trip.fuel_records?.reduce((sum: number, r: any) => 
        sum + (r.total_amount || 0), 0) || 0;

      if (estimated > 0 || actual > 0) {
        estimatedTotal += estimated;
        actualTotal += actual;

        const variance = actual - estimated;
        const variancePercentage = estimated > 0 ? (variance / estimated) * 100 : 0;

        if (Math.abs(variancePercentage) > 5) { // Only include significant variances
          tripsWithVariance.push({
            trip_id: trip.id,
            destination: trip.destination,
            estimated,
            actual,
            variance,
            variance_percentage: variancePercentage,
          });
        }
      }
    });

    const totalVariance = actualTotal - estimatedTotal;
    const totalVariancePercentage = estimatedTotal > 0 
      ? (totalVariance / estimatedTotal) * 100 
      : 0;

    return {
      estimated_total: estimatedTotal,
      actual_total: actualTotal,
      variance: totalVariance,
      variance_percentage: totalVariancePercentage,
      trip_count: trips.length,
      trips_with_variance: tripsWithVariance
        .sort((a, b) => Math.abs(b.variance_percentage) - Math.abs(a.variance_percentage))
        .slice(0, 20),
    };
  }

  /**
   * Calculate trip metrics
   */
  async calculateTripMetrics(filters: DashboardFilters): Promise<TripMetrics> {
    const allTrips = await this.loadTrips();
    const filteredTrips = this.filterTrips(allTrips, filters);

    const completedTrips = filteredTrips.filter(t => t.status === 'completed');
    const inProgressTrips = filteredTrips.filter(t => 
      t.status === 'in_progress' || t.status === 'at_loading' || 
      t.status === 'in_transit' || t.status === 'at_unloading'
    );
    const scheduledTrips = filteredTrips.filter(t => t.status === 'scheduled');
    const delayedTrips = filteredTrips.filter(t => {
      if (t.status !== 'completed' && t.scheduled_date) {
        return new Date(t.scheduled_date) < new Date();
      }
      return false;
    });
    const cancelledTrips = filteredTrips.filter(t => t.status === 'cancelled');

    // Calculate average trip duration
    let totalDurationHours = 0;
    let tripCountWithDuration = 0;

    completedTrips.forEach(trip => {
      if (trip.started_at && trip.completed_at) {
        const start = new Date(trip.started_at);
        const end = new Date(trip.completed_at);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalDurationHours += hours;
        tripCountWithDuration++;
      }
    });

    const avgDuration = tripCountWithDuration > 0 
      ? totalDurationHours / tripCountWithDuration 
      : 0;

    // On-time percentage
    const completedWithDates = completedTrips.filter(t => 
      t.scheduled_date && t.completed_at
    );
    
    const onTime = completedWithDates.filter(t => {
      const scheduled = new Date(t.scheduled_date);
      const completed = new Date(t.completed_at);
      return completed <= scheduled;
    }).length;

    const onTimePercentage = completedWithDates.length > 0 
      ? (onTime / completedWithDates.length) * 100 
      : 0;

    return {
      total_trips: filteredTrips.length,
      completed_trips: completedTrips.length,
      in_progress_trips: inProgressTrips.length,
      scheduled_trips: scheduledTrips.length,
      delayed_trips: delayedTrips.length,
      cancelled_trips: cancelledTrips.length,
      average_trip_duration_hours: avgDuration,
      on_time_percentage: onTimePercentage,
    };
  }

  /**
   * Calculate financial summary
   */
  async calculateFinancialSummary(filters: DashboardFilters): Promise<FinancialSummary> {
    const allTrips = await this.loadTrips();
    const filteredTrips = this.filterTrips(allTrips, filters);

    let totalIncome = 0;
    let totalExpenses = 0;
    let fuelTotal = 0;
    let tollTotal = 0;
    let parkingTotal = 0;
    let maintenanceTotal = 0;
    let otherTotal = 0;

    filteredTrips.forEach(trip => {
      const profit = this.calculateTripProfit(trip);
      totalIncome += profit.trip_income;
      totalExpenses += profit.total_expenses;
      fuelTotal += profit.expense_breakdown.fuel;
      tollTotal += profit.expense_breakdown.toll;
      parkingTotal += profit.expense_breakdown.parking;
      maintenanceTotal += profit.expense_breakdown.maintenance;
      otherTotal += profit.expense_breakdown.other;
    });

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;
    const avgProfitPerTrip = filteredTrips.length > 0 ? netProfit / filteredTrips.length : 0;

    // Get payroll costs for the period
    const payrollRecords = await this.loadPayrollRecords();
    const { start, end } = this.getDateRange(filters.date_filter);
    const payrollTotal = payrollRecords
      .filter(r => {
        const date = new Date(r.created_at);
        return date >= start && date <= end;
      })
      .reduce((sum, r) => sum + (r.gross_pay || 0), 0);

    return {
      total_income: totalIncome,
      total_expenses: totalExpenses + payrollTotal,
      net_profit: totalIncome - (totalExpenses + payrollTotal),
      profit_margin: profitMargin,
      average_profit_per_trip: avgProfitPerTrip,
      
      income_breakdown: {
        trip_fees: totalIncome,
        additional_charges: 0, // TODO: Implement
        other: 0,
      },
      
      expense_breakdown: {
        fuel: fuelTotal,
        payroll: payrollTotal,
        maintenance: maintenanceTotal,
        tolls: tollTotal,
        parking: parkingTotal,
        other: otherTotal,
      },
    };
  }

  /**
   * Calculate truck utilization
   */
  async calculateTruckUtilization(filters: DashboardFilters): Promise<TruckUtilization[]> {
    const allTrips = await this.loadTrips();
    const filteredTrips = this.filterTrips(allTrips, filters);
    const { start, end } = this.getDateRange(filters.date_filter);

    const truckMap = new Map<string, any>();

    filteredTrips.forEach(trip => {
      if (!trip.truck_id) return;

      const existing = truckMap.get(trip.truck_id) || {
        truck_id: trip.truck_id,
        truck_name: trip.truck_name || trip.truck_id,
        trips: [],
        activeDays: new Set<string>(),
      };

      existing.trips.push(trip);

      // Track active days
      const tripDate = new Date(trip.scheduled_date || trip.created_at);
      if (tripDate >= start && tripDate <= end) {
        existing.activeDays.add(tripDate.toDateString());
      }

      truckMap.set(trip.truck_id, existing);
    });

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return Array.from(truckMap.values()).map(data => {
      let totalIncome = 0;
      let totalExpenses = 0;

      data.trips.forEach((trip: any) => {
        const profit = this.calculateTripProfit(trip);
        totalIncome += profit.trip_income;
        totalExpenses += profit.total_expenses;
      });

      const utilizationPercentage = totalDays > 0 
        ? (data.activeDays.size / totalDays) * 100 
        : 0;

      return {
        truck_id: data.truck_id,
        truck_name: data.truck_name,
        total_trips: data.trips.length,
        active_days: data.activeDays.size,
        utilization_percentage: utilizationPercentage,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_profit: totalIncome - totalExpenses,
      };
    }).sort((a, b) => b.utilization_percentage - a.utilization_percentage);
  }

  /**
   * Storage helpers
   */
  private async loadTrips(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(TRIPS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Analytics] Failed to load trips:', error);
      return [];
    }
  }

  private async loadFuelRecords(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(FUEL_RECORDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Analytics] Failed to load fuel records:', error);
      return [];
    }
  }

  private async loadPayrollRecords(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(PAYROLL_RECORDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Analytics] Failed to load payroll records:', error);
      return [];
    }
  }

  private async loadCashAdvances(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(CASH_ADVANCES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Analytics] Failed to load cash advances:', error);
      return [];
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
