// @ts-nocheck
/**
 * Report Generation Service
 * 
 * Generates all report types with PDF and spreadsheet export support:
 * - Trip reports
 * - Delivery reports
 * - Fuel reports
 * - Truck expense reports
 * - Payroll reports
 * - Cash advance statements
 * - Employee trip reports
 * - Maintenance reports
 * - Incident reports
 * - Income and profit reports
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import type {
  ReportType,
  ReportFilters,
  ReportData,
} from '../../types/analytics.types';
import { analyticsService } from '../analytics/AnalyticsService';

// Storage keys
const TRIPS_KEY = '@vone_trips';
const FUEL_RECORDS_KEY = '@vone_fuel_records';
const PAYROLL_RECORDS_KEY = '@vone_payroll_records';
const CASH_ADVANCES_KEY = '@vone_cash_advances';

export type ExportFormat = 'pdf' | 'csv' | 'excel';

export class ReportGenerationService {
  /**
   * Generate trip report
   */
  async generateTripReport(filters: ReportFilters, generatedBy: string): Promise<ReportData> {
    const trips = await this.loadTrips();
    const filteredTrips = this.filterByDateRange(trips, filters.date_range_start, filters.date_range_end);

    // Apply additional filters
    let reportTrips = filteredTrips.filter(trip => {
      if (filters.truck_ids && !filters.truck_ids.includes(trip.truck_id)) return false;
      if (filters.driver_ids && !filters.driver_ids.includes(trip.driver_id)) return false;
      if (filters.porter_ids && trip.porter_id && !filters.porter_ids.includes(trip.porter_id)) return false;
      if (filters.destinations && !filters.destinations.includes(trip.destination)) return false;
      if (filters.status && !filters.status.includes(trip.status)) return false;
      return true;
    });

    // Calculate trip profits
    const reportData = reportTrips.map(trip => {
      const profit = analyticsService.calculateTripProfit(trip);
      return {
        trip_id: trip.id,
        trip_number: trip.trip_number,
        date: trip.scheduled_date || trip.created_at,
        truck: trip.truck_name || trip.truck_id,
        driver: trip.driver_name || trip.driver_id,
        porter: trip.porter_name || trip.porter_id || 'N/A',
        origin: trip.origin || 'N/A',
        destination: trip.destination,
        status: trip.status,
        trip_income: profit.trip_income,
        fuel_cost: profit.expense_breakdown.fuel,
        toll_cost: profit.expense_breakdown.toll,
        parking_cost: profit.expense_breakdown.parking,
        maintenance_cost: profit.expense_breakdown.maintenance,
        other_expenses: profit.expense_breakdown.other,
        total_expenses: profit.total_expenses,
        net_profit: profit.net_profit,
        profit_margin: profit.profit_margin_percentage,
      };
    });

    // Calculate summary
    const summary = {
      total_records: reportData.length,
      total_income: reportData.reduce((sum, t) => sum + t.trip_income, 0),
      total_expenses: reportData.reduce((sum, t) => sum + t.total_expenses, 0),
      total_profit: reportData.reduce((sum, t) => sum + t.net_profit, 0),
      average_profit_per_trip: reportData.length > 0 
        ? reportData.reduce((sum, t) => sum + t.net_profit, 0) / reportData.length 
        : 0,
    };

    return {
      report_type: { id: 'trip_report', name: 'Trip Report' } as ReportType,
      filters,
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
      data: reportData,
      summary,
    };
  }

  /**
   * Generate delivery report
   */
  async generateDeliveryReport(filters: ReportFilters, generatedBy: string): Promise<ReportData> {
    const trips = await this.loadTrips();
    const filteredTrips = this.filterByDateRange(trips, filters.date_range_start, filters.date_range_end)
      .filter(trip => trip.status === 'completed' && trip.proof_of_delivery);

    const reportData = filteredTrips.map(trip => ({
      trip_id: trip.id,
      trip_number: trip.trip_number,
      delivery_date: trip.completed_at,
      truck: trip.truck_name || trip.truck_id,
      driver: trip.driver_name || trip.driver_id,
      destination: trip.destination,
      customer_name: trip.proof_of_delivery?.customer_name || 'N/A',
      signature_captured: !!trip.proof_of_delivery?.signature_image_url,
      photos_count: trip.proof_of_delivery?.photos?.length || 0,
      delivery_notes: trip.proof_of_delivery?.notes || '',
      delivery_status: trip.proof_of_delivery?.delivery_status || 'delivered',
    }));

    return {
      report_type: { id: 'delivery_report', name: 'Delivery Report' } as ReportType,
      filters,
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
      data: reportData,
      summary: {
        total_records: reportData.length,
        with_signature: reportData.filter(d => d.signature_captured).length,
        with_photos: reportData.filter(d => d.photos_count > 0).length,
      },
    };
  }

  /**
   * Generate fuel report
   */
  async generateFuelReport(filters: ReportFilters, generatedBy: string): Promise<ReportData> {
    const fuelRecords = await this.loadFuelRecords();
    const filteredRecords = this.filterByDateRange(fuelRecords, filters.date_range_start, filters.date_range_end);

    const reportData = filteredRecords.map(record => ({
      record_id: record.id,
      trip_id: record.trip_id,
      purchase_date: record.purchase_date,
      truck: record.truck_name || record.truck_id,
      driver: record.driver_name || record.driver_id,
      fuel_station: record.fuel_station_name,
      litres_purchased: record.litres_purchased,
      price_per_litre: record.price_per_litre,
      total_amount: record.total_amount,
      odometer_reading: record.odometer_reading,
      receipt_number: record.receipt_number || 'N/A',
      has_receipt_photo: !!record.receipt_photo_url,
      validation_issues: record.validation_issues?.join(', ') || 'None',
    }));

    const summary = {
      total_records: reportData.length,
      total_litres: reportData.reduce((sum, r) => sum + r.litres_purchased, 0),
      total_cost: reportData.reduce((sum, r) => sum + r.total_amount, 0),
      average_price_per_litre: reportData.length > 0
        ? reportData.reduce((sum, r) => sum + r.price_per_litre, 0) / reportData.length
        : 0,
    };

    return {
      report_type: { id: 'fuel_report', name: 'Fuel Report' } as ReportType,
      filters,
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
      data: reportData,
      summary,
    };
  }

  /**
   * Generate truck expense report
   */
  async generateTruckExpenseReport(filters: ReportFilters, generatedBy: string): Promise<ReportData> {
    const trips = await this.loadTrips();
    const fuelRecords = await this.loadFuelRecords();
    
    const filteredTrips = this.filterByDateRange(trips, filters.date_range_start, filters.date_range_end);
    const filteredFuel = this.filterByDateRange(fuelRecords, filters.date_range_start, filters.date_range_end);

    // Group by truck
    const truckExpenses = new Map<string, any>();

    // Add fuel expenses
    filteredFuel.forEach(fuel => {
      const truckId = fuel.truck_id;
      if (!truckExpenses.has(truckId)) {
        truckExpenses.set(truckId, {
          truck_id: truckId,
          truck_name: fuel.truck_name || truckId,
          fuel: 0,
          toll: 0,
          parking: 0,
          maintenance: 0,
          other: 0,
        });
      }
      truckExpenses.get(truckId).fuel += fuel.total_amount;
    });

    // Add trip expenses
    filteredTrips.forEach(trip => {
      const truckId = trip.truck_id;
      if (!truckExpenses.has(truckId)) {
        truckExpenses.set(truckId, {
          truck_id: truckId,
          truck_name: trip.truck_name || truckId,
          fuel: 0,
          toll: 0,
          parking: 0,
          maintenance: 0,
          other: 0,
        });
      }

      const expenses = truckExpenses.get(truckId);
      trip.expenses?.forEach((expense: any) => {
        switch (expense.expense_type) {
          case 'toll':
            expenses.toll += expense.amount;
            break;
          case 'parking':
            expenses.parking += expense.amount;
            break;
          case 'maintenance':
            expenses.maintenance += expense.amount;
            break;
          default:
            expenses.other += expense.amount;
        }
      });
    });

    const reportData = Array.from(truckExpenses.values()).map(truck => ({
      ...truck,
      total_expenses: truck.fuel + truck.toll + truck.parking + truck.maintenance + truck.other,
    })).sort((a, b) => b.total_expenses - a.total_expenses);

    return {
      report_type: { id: 'truck_expense_report', name: 'Truck Expense Report' } as ReportType,
      filters,
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
      data: reportData,
      summary: {
        total_records: reportData.length,
        total_expenses: reportData.reduce((sum, t) => sum + t.total_expenses, 0),
        total_fuel: reportData.reduce((sum, t) => sum + t.fuel, 0),
      },
    };
  }

  /**
   * Generate payroll report
   */
  async generatePayrollReport(filters: ReportFilters, generatedBy: string): Promise<ReportData> {
    const payrollRecords = await this.loadPayrollRecords();
    const filteredRecords = this.filterByDateRange(payrollRecords, filters.date_range_start, filters.date_range_end);

    const reportData = filteredRecords.map(record => ({
      record_id: record.id,
      period_id: record.payroll_period_id,
      employee_id: record.employee_id,
      employee_name: record.employee_name,
      employee_role: record.employee_role,
      gross_pay: record.gross_pay,
      total_deductions: record.total_deductions,
      net_pay: record.net_pay,
      trips_completed: record.trips_completed,
      days_worked: record.days_worked,
      hours_worked: record.hours_worked,
      overtime_hours: record.overtime_hours,
      cash_advance_deduction: record.cash_advance_deduction,
      status: record.status,
    }));

    return {
      report_type: { id: 'payroll_report', name: 'Payroll Report' } as ReportType,
      filters,
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
      data: reportData,
      summary: {
        total_records: reportData.length,
        total_gross_pay: reportData.reduce((sum, r) => sum + r.gross_pay, 0),
        total_deductions: reportData.reduce((sum, r) => sum + r.total_deductions, 0),
        total_net_pay: reportData.reduce((sum, r) => sum + r.net_pay, 0),
      },
    };
  }

  /**
   * Generate cash advance statement
   */
  async generateCashAdvanceReport(filters: ReportFilters, generatedBy: string): Promise<ReportData> {
    const cashAdvances = await this.loadCashAdvances();
    const filteredAdvances = this.filterByDateRange(cashAdvances, filters.date_range_start, filters.date_range_end);

    const reportData = filteredAdvances.map(advance => {
      // Calculate remaining balance
      const transactions = advance.transactions || [];
      let balance = advance.amount;
      transactions.forEach((t: any) => {
        if (t.transaction_type === 'repayment') {
          balance -= t.amount;
        }
      });

      return {
        advance_id: advance.id,
        employee_id: advance.employee_id,
        employee_name: advance.employee_name,
        request_date: advance.request_date,
        amount: advance.amount,
        purpose: advance.purpose,
        status: advance.status,
        approved_date: advance.approved_at || 'N/A',
        disbursed_date: advance.disbursed_at || 'N/A',
        repayment_installments: advance.repayment_terms?.number_of_installments || 0,
        installment_amount: advance.repayment_terms?.installment_amount || 0,
        remaining_balance: balance,
      };
    });

    return {
      report_type: { id: 'cash_advance_report', name: 'Cash Advance Statement' } as ReportType,
      filters,
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
      data: reportData,
      summary: {
        total_records: reportData.length,
        total_advanced: reportData.reduce((sum, a) => sum + a.amount, 0),
        total_outstanding: reportData.reduce((sum, a) => sum + a.remaining_balance, 0),
      },
    };
  }

  /**
   * Generate employee trip report
   */
  async generateEmployeeTripReport(filters: ReportFilters, generatedBy: string): Promise<ReportData> {
    const trips = await this.loadTrips();
    const filteredTrips = this.filterByDateRange(trips, filters.date_range_start, filters.date_range_end);

    // Group by employee (driver or porter)
    const employeeTrips = new Map<string, any>();

    filteredTrips.forEach(trip => {
      // Driver trips
      if (trip.driver_id) {
        if (!employeeTrips.has(trip.driver_id)) {
          employeeTrips.set(trip.driver_id, {
            employee_id: trip.driver_id,
            employee_name: trip.driver_name || trip.driver_id,
            role: 'driver',
            trips: [],
          });
        }
        employeeTrips.get(trip.driver_id).trips.push(trip);
      }

      // Porter trips
      if (trip.porter_id) {
        if (!employeeTrips.has(trip.porter_id)) {
          employeeTrips.set(trip.porter_id, {
            employee_id: trip.porter_id,
            employee_name: trip.porter_name || trip.porter_id,
            role: 'porter',
            trips: [],
          });
        }
        employeeTrips.get(trip.porter_id).trips.push(trip);
      }
    });

    const reportData = Array.from(employeeTrips.values()).map(employee => {
      const completedTrips = employee.trips.filter((t: any) => t.status === 'completed').length;
      const totalIncome = employee.trips.reduce((sum: number, t: any) => {
        const profit = analyticsService.calculateTripProfit(t);
        return sum + profit.trip_income;
      }, 0);

      return {
        employee_id: employee.employee_id,
        employee_name: employee.employee_name,
        role: employee.role,
        total_trips: employee.trips.length,
        completed_trips: completedTrips,
        in_progress_trips: employee.trips.filter((t: any) => 
          t.status === 'in_progress' || t.status === 'at_loading' || 
          t.status === 'in_transit' || t.status === 'at_unloading'
        ).length,
        total_income_generated: totalIncome,
      };
    });

    return {
      report_type: { id: 'employee_trip_report', name: 'Employee Trip Report' } as ReportType,
      filters,
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
      data: reportData,
      summary: {
        total_records: reportData.length,
        total_trips: reportData.reduce((sum, e) => sum + e.total_trips, 0),
      },
    };
  }

  /**
   * Generate income and profit report
   */
  async generateIncomeProfitReport(filters: ReportFilters, generatedBy: string): Promise<ReportData> {
    const trips = await this.loadTrips();
    const filteredTrips = this.filterByDateRange(trips, filters.date_range_start, filters.date_range_end);

    let totalIncome = 0;
    let totalFuelCost = 0;
    let totalTollCost = 0;
    let totalParkingCost = 0;
    let totalMaintenanceCost = 0;
    let totalOtherExpenses = 0;

    const tripProfits = filteredTrips.map(trip => {
      const profit = analyticsService.calculateTripProfit(trip);
      
      totalIncome += profit.trip_income;
      totalFuelCost += profit.expense_breakdown.fuel;
      totalTollCost += profit.expense_breakdown.toll;
      totalParkingCost += profit.expense_breakdown.parking;
      totalMaintenanceCost += profit.expense_breakdown.maintenance;
      totalOtherExpenses += profit.expense_breakdown.other;

      return {
        trip_id: trip.id,
        date: trip.scheduled_date || trip.created_at,
        destination: trip.destination,
        income: profit.trip_income,
        expenses: profit.total_expenses,
        profit: profit.net_profit,
        margin: profit.profit_margin_percentage,
      };
    });

    const totalExpenses = totalFuelCost + totalTollCost + totalParkingCost + 
                         totalMaintenanceCost + totalOtherExpenses;
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return {
      report_type: { id: 'income_profit_report', name: 'Income and Profit Report' } as ReportType,
      filters,
      generated_at: new Date().toISOString(),
      generated_by: generatedBy,
      data: tripProfits,
      summary: {
        total_records: tripProfits.length,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_profit: netProfit,
        profit_margin: profitMargin,
        expense_breakdown: {
          fuel: totalFuelCost,
          toll: totalTollCost,
          parking: totalParkingCost,
          maintenance: totalMaintenanceCost,
          other: totalOtherExpenses,
        },
      },
    };
  }

  /**
   * Export report to CSV with spreadsheet formula injection protection
   */
  async exportToCSV(reportData: ReportData): Promise<string> {
    try {
      // Convert data to CSV format
      const data = reportData.data;
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Get headers from first row
      const headers = Object.keys(data[0]);
      let csv = headers.join(',') + '\n';

      // Helper to sanitize CSV field against formula injection (=, +, -, @)
      const sanitizeCsvField = (val: any): string => {
        if (val === null || val === undefined) return '';
        let str = String(val);
        // Formula injection protection: prepend single quote if string starts with formula trigger characters
        if (/^[=+\-@\t\r]/.test(str)) {
          str = `'${str}`;
        }
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Add data rows
      data.forEach((row: any) => {
        const values = headers.map(header => sanitizeCsvField(row[header]));
        csv += values.join(',') + '\n';
      });

      // Add summary section
      csv += '\n\nSUMMARY\n';
      Object.entries(reportData.summary).forEach(([key, value]) => {
        csv += `${sanitizeCsvField(key)},${sanitizeCsvField(value)}\n`;
      });

      // Save to file
      const fileName = `${reportData.report_type.id}_${Date.now()}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: `Export ${reportData.report_type.name}`,
        });
      }

      return fileUri;
    } catch (error) {
      console.error('[Reports] Failed to export CSV:', error);
      throw error;
    }
  }

  /**
   * Export report to real PDF using expo-print
   */
  async exportToPDF(reportData: ReportData): Promise<string> {
    try {
      // Generate HTML content
      const htmlContent = this.generateReportHTML(reportData);

      // Generate real PDF file
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Export ${reportData.report_type.name}`,
        });
      }

      return uri;
    } catch (error) {
      console.error('[Reports] Failed to export PDF:', error);
      throw error;
    }
  }

  /**
   * Generate HTML for report
   */
  private generateReportHTML(reportData: ReportData): string {
    const data = reportData.data;
    if (!data || data.length === 0) {
      return '<html><body><h1>No data available</h1></body></html>';
    }

    const headers = Object.keys(data[0]);
    const rows = data.map((row: any) => {
      const cells = headers.map(header => `<td>${row[header] || ''}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const summaryRows = Object.entries(reportData.summary).map(([key, value]) => 
      `<tr><td><strong>${key}</strong></td><td>${value}</td></tr>`
    ).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${reportData.report_type.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1F2937; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; }
          th { background-color: #F3F4F6; font-weight: 600; }
          .summary { margin-top: 40px; }
          .footer { margin-top: 40px; font-size: 12px; color: #6B7280; }
        </style>
      </head>
      <body>
        <h1>${reportData.report_type.name}</h1>
        <p><strong>Generated:</strong> ${new Date(reportData.generated_at).toLocaleString()}</p>
        <p><strong>Generated By:</strong> ${reportData.generated_by}</p>
        <p><strong>Period:</strong> ${new Date(reportData.filters.date_range_start).toLocaleDateString()} - ${new Date(reportData.filters.date_range_end).toLocaleDateString()}</p>
        
        <table>
          <thead>
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        
        <div class="summary">
          <h2>Summary</h2>
          <table>
            <tbody>
              ${summaryRows}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>Vone Trucking Management System</p>
          <p>This report is generated electronically and does not require a signature.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Storage and filter helpers
   */
  private async loadTrips(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(TRIPS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Reports] Failed to load trips:', error);
      return [];
    }
  }

  private async loadFuelRecords(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(FUEL_RECORDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Reports] Failed to load fuel records:', error);
      return [];
    }
  }

  private async loadPayrollRecords(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(PAYROLL_RECORDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Reports] Failed to load payroll records:', error);
      return [];
    }
  }

  private async loadCashAdvances(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(CASH_ADVANCES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[Reports] Failed to load cash advances:', error);
      return [];
    }
  }

  private filterByDateRange(items: any[], startDate: string, endDate: string): any[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return items.filter(item => {
      const itemDate = new Date(
        item.scheduled_date || item.purchase_date || item.request_date || 
        item.created_at || item.date
      );
      return itemDate >= start && itemDate <= end;
    });
  }
}

// Export singleton instance
export const reportGenerationService = new ReportGenerationService();

