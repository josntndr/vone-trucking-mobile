/**
 * Reporting and Export Types
 */

import { TripStatus } from './trip.types';

export type ReportPeriod = 'week' | 'month' | 'year' | 'custom';

export interface DateRange {
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
}

export interface AnalyticsFilters {
  period: ReportPeriod;
  dateRange?: DateRange;
  statuses?: TripStatus[];
  truckIds?: string[];
  driverIds?: string[];
}

export type ReportType =
  | 'analytics_summary'
  | 'detailed_operations'
  | 'financial'
  | 'fleet_performance';

export interface ReportSection {
  id: string;
  label: string;
  included: boolean;
  available: boolean;
}

export interface ReportConfig {
  title: string;
  type: ReportType;
  dateRange: DateRange;
  sections: ReportSection[];
  generatedBy: string;
  generatedAt: string;
}

export interface AnalyticsMetrics {
  period: string;
  totalTrips: number;
  completedTrips: number;
  inProgressTrips: number;
  pendingTrips: number;
  scheduledTrips: number;
  cancelledTrips: number;
  delayedTrips: number;
  incidentReports: number;
  
  onTimeDeliveryRate: number;
  avgTripDurationHours: number;
  fuelEfficiency?: number;
  customerRating?: number;
  
  totalRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  
  activeDrivers: number;
  activeHelpers: number;
  activeTrucks: number;
  fleetUtilization: number;
}

export interface TripRecord {
  tripNumber: string;
  deliveryReference: string;
  pickupLocation: string;
  destination: string;
  departureDateTime: string;
  completionDateTime?: string;
  status: string;
  truckPlateNumber?: string;
  driverName?: string;
  helperName?: string;
  tripIncome?: number;
  fuelBudget?: number;
  expenses?: number;
  estimatedProfit?: number;
  delayStatus: string;
  incidentCount: number;
}

export type ExportDataset =
  | 'analytics_summary'
  | 'trip_records'
  | 'financial_data'
  | 'fleet_performance'
  | 'employee_performance'
  | 'all_data';

export type ExportFormat = 'csv' | 'xlsx';

export interface ExportConfig {
  dataset: ExportDataset;
  format: ExportFormat;
  dateRange: DateRange;
  filters: AnalyticsFilters;
}

export interface ExportResult {
  success: boolean;
  filename: string;
  filePath: string;
  recordCount: number;
  fileSize?: number;
}

export interface ReportResult {
  success: boolean;
  filename: string;
  filePath: string;
  pageCount?: number;
  fileSize?: number;
}
