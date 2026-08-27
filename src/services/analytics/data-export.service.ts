/**
 * Data Export Service
 * Exports analytics data to CSV and other formats
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import {
  ExportConfig,
  ExportResult,
  AnalyticsMetrics,
  TripRecord,
} from '../../types/reporting.types';

/**
 * Escape CSV value to prevent formula injection and handle special characters
 */
const escapeCSVValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);
  
  // Prevent formula injection
  if (stringValue.startsWith('=') || stringValue.startsWith('+') || 
      stringValue.startsWith('-') || stringValue.startsWith('@')) {
    return `'${stringValue}`;
  }

  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Format date for export
 */
const formatExportDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  });
};

/**
 * Generate CSV content for analytics summary
 */
const generateAnalyticsSummaryCSV = (metrics: AnalyticsMetrics): string => {
  const rows = [
    ['VONE TRUCKING - ANALYTICS SUMMARY'],
    ['Reporting Period', metrics.period],
    [],
    ['TRIP STATISTICS'],
    ['Total Trips', metrics.totalTrips],
    ['Completed Trips', metrics.completedTrips],
    ['In Progress Trips', metrics.inProgressTrips],
    ['Pending Trips', metrics.pendingTrips],
    ['Scheduled Trips', metrics.scheduledTrips],
    ['Cancelled Trips', metrics.cancelledTrips],
    ['Delayed Trips', metrics.delayedTrips],
    ['Incident Reports', metrics.incidentReports],
    [],
    ['PERFORMANCE METRICS'],
    ['On-Time Delivery Rate', `${metrics.onTimeDeliveryRate}%`],
    ['Average Trip Duration (hours)', metrics.avgTripDurationHours],
    metrics.fuelEfficiency ? ['Fuel Efficiency (km/L)', metrics.fuelEfficiency] : [],
    metrics.customerRating ? ['Customer Rating', metrics.customerRating] : [],
    [],
    ['FINANCIAL SUMMARY'],
    ['Total Revenue (₱)', metrics.totalRevenue],
    ['Total Expenses (₱)', metrics.totalExpenses],
    ['Estimated Profit (₱)', metrics.estimatedProfit],
    [],
    ['FLEET & RESOURCES'],
    ['Active Trucks', metrics.activeTrucks],
    ['Active Drivers', metrics.activeDrivers],
    ['Fleet Utilization', `${metrics.fleetUtilization}%`],
  ].filter(row => row.length > 0); // Remove empty arrays

  return rows.map(row => row.map(escapeCSVValue).join(',')).join('\n');
};

/**
 * Generate CSV content for trip records
 */
const generateTripRecordsCSV = (records: TripRecord[]): string => {
  const headers = [
    'Trip Number',
    'Delivery Reference',
    'Pickup Location',
    'Destination',
    'Departure Date/Time',
    'Completion Date/Time',
    'Status',
    'Truck Plate Number',
    'Driver Name',
    'Helper/Porter Name',
    'Trip Income (₱)',
    'Fuel Budget (₱)',
    'Expenses (₱)',
    'Estimated Profit (₱)',
    'Delay Status',
    'Incident Count',
  ];

  const rows = [headers];

  records.forEach(record => {
    rows.push([
      record.tripNumber,
      record.deliveryReference,
      record.pickupLocation,
      record.destination,
      formatExportDate(record.departureDateTime),
      record.completionDateTime ? formatExportDate(record.completionDateTime) : '',
      record.status,
      record.truckPlateNumber || '',
      record.driverName || '',
      record.helperName || '',
      record.tripIncome?.toString() || '',
      record.fuelBudget?.toString() || '',
      record.expenses?.toString() || '',
      record.estimatedProfit?.toString() || '',
      record.delayStatus,
      record.incidentCount.toString(),
    ]);
  });

  return rows.map(row => row.map(escapeCSVValue).join(',')).join('\n');
};

/**
 * Generate CSV content for financial data
 */
const generateFinancialDataCSV = (metrics: AnalyticsMetrics, records: TripRecord[]): string => {
  const summaryRows = [
    ['VONE TRUCKING - FINANCIAL REPORT'],
    ['Reporting Period', metrics.period],
    [],
    ['SUMMARY'],
    ['Total Revenue (₱)', metrics.totalRevenue],
    ['Total Expenses (₱)', metrics.totalExpenses],
    ['Estimated Profit (₱)', metrics.estimatedProfit],
    ['Profit Margin (%)', ((metrics.estimatedProfit / metrics.totalRevenue) * 100).toFixed(2)],
    [],
    ['TRIP BREAKDOWN'],
    ['Trip Number', 'Reference', 'Income (₱)', 'Expenses (₱)', 'Profit (₱)'],
  ];

  const tripRows = records.map(record => [
    record.tripNumber,
    record.deliveryReference,
    record.tripIncome?.toString() || '0',
    record.expenses?.toString() || '0',
    record.estimatedProfit?.toString() || '0',
  ]);

  const allRows = [...summaryRows, ...tripRows];
  return allRows.map(row => row.map(escapeCSVValue).join(',')).join('\n');
};

/**
 * Generate CSV content for fleet performance
 */
const generateFleetPerformanceCSV = (metrics: AnalyticsMetrics): string => {
  const rows = [
    ['VONE TRUCKING - FLEET PERFORMANCE REPORT'],
    ['Reporting Period', metrics.period],
    [],
    ['FLEET METRICS'],
    ['Active Trucks', metrics.activeTrucks],
    ['Fleet Utilization Rate', `${metrics.fleetUtilization}%`],
    ['Total Trips', metrics.totalTrips],
    ['Completed Trips', metrics.completedTrips],
    ['On-Time Delivery Rate', `${metrics.onTimeDeliveryRate}%`],
    ['Average Trip Duration (hours)', metrics.avgTripDurationHours],
    metrics.fuelEfficiency ? ['Fuel Efficiency (km/L)', metrics.fuelEfficiency] : [],
    [],
    ['DRIVER METRICS'],
    ['Active Drivers', metrics.activeDrivers],
    ['Trips per Driver (avg)', (metrics.totalTrips / Math.max(metrics.activeDrivers, 1)).toFixed(1)],
  ].filter(row => row.length > 0);

  return rows.map(row => row.map(escapeCSVValue).join(',')).join('\n');
};

/**
 * Generate CSV content for employee performance
 */
const generateEmployeePerformanceCSV = (metrics: AnalyticsMetrics): string => {
  const rows = [
    ['VONE TRUCKING - EMPLOYEE PERFORMANCE REPORT'],
    ['Reporting Period', metrics.period],
    [],
    ['DRIVER PERFORMANCE'],
    ['Active Drivers', metrics.activeDrivers],
    ['Total Trips', metrics.totalTrips],
    ['Completed Trips', metrics.completedTrips],
    ['Trips per Driver (avg)', (metrics.totalTrips / Math.max(metrics.activeDrivers, 1)).toFixed(1)],
    ['On-Time Delivery Rate', `${metrics.onTimeDeliveryRate}%`],
    ['Average Trip Duration (hours)', metrics.avgTripDurationHours],
    metrics.customerRating ? ['Customer Rating (avg)', metrics.customerRating] : [],
    [],
    ['HELPER/PORTER PERFORMANCE'],
    ['Active Helpers', metrics.activeHelpers],
  ].filter(row => row.length > 0);

  return rows.map(row => row.map(escapeCSVValue).join(',')).join('\n');
};

/**
 * Generate filename for export
 */
const generateExportFilename = (config: ExportConfig): string => {
  const startDate = new Date(config.dateRange.startDate);
  const endDate = new Date(config.dateRange.endDate);
  
  const formatFileDate = (date: Date) => {
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Manila',
    }).replace(/\//g, '-');
  };

  const datasetLabel = config.dataset.replace(/_/g, '-');
  const ext = config.format === 'xlsx' ? 'xlsx' : 'csv';
  
  return `Vone_${datasetLabel}_${formatFileDate(startDate)}_to_${formatFileDate(endDate)}.${ext}`;
};

/**
 * Export data to CSV
 */
export const exportToCSV = async (
  config: ExportConfig,
  metrics: AnalyticsMetrics,
  tripRecords: TripRecord[]
): Promise<ExportResult> => {
  try {
    let csvContent: string;
    let recordCount: number;

    switch (config.dataset) {
      case 'analytics_summary':
        csvContent = generateAnalyticsSummaryCSV(metrics);
        recordCount = 1;
        break;

      case 'trip_records':
        csvContent = generateTripRecordsCSV(tripRecords);
        recordCount = tripRecords.length;
        break;

      case 'financial_data':
        csvContent = generateFinancialDataCSV(metrics, tripRecords);
        recordCount = tripRecords.length;
        break;

      case 'fleet_performance':
        csvContent = generateFleetPerformanceCSV(metrics);
        recordCount = 1;
        break;

      case 'employee_performance':
        csvContent = generateEmployeePerformanceCSV(metrics);
        recordCount = 1;
        break;

      case 'all_data':
        // Combine all datasets
        csvContent = [
          generateAnalyticsSummaryCSV(metrics),
          '\n\n',
          'TRIP RECORDS',
          generateTripRecordsCSV(tripRecords),
        ].join('\n');
        recordCount = tripRecords.length;
        break;

      default:
        throw new Error('Unsupported dataset type');
    }

    const filename = generateExportFilename(config);
    const filePath = `${FileSystem.documentDirectory}${filename}`;

    // Write CSV file
    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    return {
      success: true,
      filename,
      filePath,
      recordCount,
      fileSize: fileInfo.exists ? fileInfo.size : undefined,
    };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export data to CSV');
  }
};

/**
 * Share or download exported file
 */
export const shareExportedFile = async (
  filePath: string,
  filename: string,
  format: 'csv' | 'xlsx'
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Web: Download file
      const content = await FileSystem.readAsStringAsync(filePath);
      const blob = new Blob([content], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Native: Use share sheet
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Share Export',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    }
  } catch (error) {
    console.error('Error sharing exported file:', error);
    throw new Error('Failed to share exported file');
  }
};

/**
 * Clean up temporary file
 */
export const cleanupExportFile = async (filePath: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath, { idempotent: true });
    }
  } catch (error) {
    console.error('Error cleaning up export file:', error);
    // Don't throw - cleanup failures should not break the flow
  }
};
