/**
 * Report Generator Service
 * Generates PDF reports from analytics data
 */

import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import {
  ReportConfig,
  ReportResult,
  AnalyticsMetrics,
  TripRecord,
} from '../../types/reporting.types';

/**
 * Format currency (PHP)
 */
const formatCurrency = (amount: number): string => {
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format percentage
 */
const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Manila',
  });
};

/**
 * Format date and time for display
 */
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  });
};

/**
 * Generate HTML for PDF report
 */
const generateReportHTML = (
  config: ReportConfig,
  metrics: AnalyticsMetrics,
  tripRecords?: TripRecord[]
): string => {
  const includedSections = config.sections.filter(s => s.included);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          font-size: 12px;
          line-height: 1.6;
          color: #24211F;
          background: white;
          padding: 40px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #1B2A4A;
        }
        
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #1B2A4A;
          margin-bottom: 10px;
        }
        
        .report-title {
          font-size: 20px;
          font-weight: bold;
          color: #1B2A4A;
          margin: 20px 0 10px;
        }
        
        .report-meta {
          font-size: 11px;
          color: #746B63;
          margin-bottom: 5px;
        }
        
        .section {
          margin: 30px 0;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #1B2A4A;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #E07B2A;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        
        .metric-card {
          background: #F7F4EF;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #E07B2A;
        }
        
        .metric-label {
          font-size: 11px;
          color: #746B63;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: #1B2A4A;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 10px;
        }
        
        .data-table th {
          background: #1B2A4A;
          color: white;
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          font-size: 10px;
        }
        
        .data-table td {
          padding: 8px;
          border-bottom: 1px solid #E5DDD5;
        }
        
        .data-table tr:nth-child(even) {
          background: #F7F4EF;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #E5DDD5;
        }
        
        .summary-label {
          color: #746B63;
          font-weight: 500;
        }
        
        .summary-value {
          color: #1B2A4A;
          font-weight: 600;
        }
        
        .highlight {
          background: #E07B2A15;
          padding: 2px 6px;
          border-radius: 4px;
          color: #E07B2A;
          font-weight: 600;
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status-completed { background: #4CAF5015; color: #4CAF50; }
        .status-in-progress { background: #2196F315; color: #2196F3; }
        .status-pending { background: #FF980015; color: #FF9800; }
        .status-cancelled { background: #F4433615; color: #F44336; }
        .status-delayed { background: #FF572215; color: #FF5722; }
        
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #E5DDD5;
          text-align: center;
          font-size: 10px;
          color: #9D9690;
        }
        
        .confidential {
          color: #C44C47;
          font-weight: 600;
          margin-top: 10px;
        }
        
        .page-break {
          page-break-after: always;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo">VONE TRUCKING</div>
        <div class="report-title">${config.title}</div>
        <div class="report-meta">Reporting Period: ${formatDate(config.dateRange.startDate)} - ${formatDate(config.dateRange.endDate)}</div>
        <div class="report-meta">Generated: ${formatDateTime(config.generatedAt)}</div>
        <div class="report-meta">Generated By: ${config.generatedBy}</div>
      </div>

      <!-- Executive Summary -->
      ${includedSections.find(s => s.id === 'overview') ? `
      <div class="section">
        <div class="section-title">Executive Summary</div>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Total Trips</div>
            <div class="metric-value">${metrics.totalTrips}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Completed Trips</div>
            <div class="metric-value">${metrics.completedTrips}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Revenue</div>
            <div class="metric-value">${formatCurrency(metrics.totalRevenue)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Estimated Profit</div>
            <div class="metric-value">${formatCurrency(metrics.estimatedProfit)}</div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Trip Statistics -->
      ${includedSections.find(s => s.id === 'trip_stats') ? `
      <div class="section">
        <div class="section-title">Trip Statistics</div>
        <div class="summary-row">
          <span class="summary-label">Total Trips</span>
          <span class="summary-value">${metrics.totalTrips}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Completed Trips</span>
          <span class="summary-value">${metrics.completedTrips}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">In Progress</span>
          <span class="summary-value">${metrics.inProgressTrips}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Pending</span>
          <span class="summary-value">${metrics.pendingTrips}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Scheduled</span>
          <span class="summary-value">${metrics.scheduledTrips}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Cancelled</span>
          <span class="summary-value">${metrics.cancelledTrips}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Delayed</span>
          <span class="summary-value">${metrics.delayedTrips}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Incident Reports</span>
          <span class="summary-value">${metrics.incidentReports}</span>
        </div>
      </div>
      ` : ''}

      <!-- Performance Metrics -->
      ${includedSections.find(s => s.id === 'performance') ? `
      <div class="section">
        <div class="section-title">Performance Metrics</div>
        <div class="summary-row">
          <span class="summary-label">On-Time Delivery Rate</span>
          <span class="summary-value highlight">${formatPercent(metrics.onTimeDeliveryRate)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Average Trip Duration</span>
          <span class="summary-value">${metrics.avgTripDurationHours.toFixed(1)} hours</span>
        </div>
        ${metrics.fuelEfficiency ? `
        <div class="summary-row">
          <span class="summary-label">Fuel Efficiency</span>
          <span class="summary-value">${metrics.fuelEfficiency.toFixed(1)} km/L</span>
        </div>
        ` : ''}
        ${metrics.customerRating ? `
        <div class="summary-row">
          <span class="summary-label">Customer Rating</span>
          <span class="summary-value">${metrics.customerRating.toFixed(1)}/5.0</span>
        </div>
        ` : ''}
      </div>
      ` : ''}

      <!-- Financial Summary -->
      ${includedSections.find(s => s.id === 'financial') ? `
      <div class="section">
        <div class="section-title">Financial Summary</div>
        <div class="summary-row">
          <span class="summary-label">Total Revenue</span>
          <span class="summary-value">${formatCurrency(metrics.totalRevenue)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Total Expenses</span>
          <span class="summary-value">${formatCurrency(metrics.totalExpenses)}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Estimated Profit</span>
          <span class="summary-value highlight">${formatCurrency(metrics.estimatedProfit)}</span>
        </div>
      </div>
      ` : ''}

      <!-- Fleet Utilization -->
      ${includedSections.find(s => s.id === 'fleet') ? `
      <div class="section">
        <div class="section-title">Fleet & Resources</div>
        <div class="summary-row">
          <span class="summary-label">Active Trucks</span>
          <span class="summary-value">${metrics.activeTrucks}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Active Drivers</span>
          <span class="summary-value">${metrics.activeDrivers}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Fleet Utilization</span>
          <span class="summary-value highlight">${formatPercent(metrics.fleetUtilization)}</span>
        </div>
      </div>
      ` : ''}

      <!-- Detailed Trip Records -->
      ${includedSections.find(s => s.id === 'trip_details') && tripRecords && tripRecords.length > 0 ? `
      <div class="section page-break">
        <div class="section-title">Detailed Trip Records</div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Trip #</th>
              <th>Reference</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Status</th>
              <th>Driver</th>
              <th>Income</th>
            </tr>
          </thead>
          <tbody>
            ${tripRecords.slice(0, 50).map(record => `
              <tr>
                <td>${record.tripNumber}</td>
                <td>${record.deliveryReference}</td>
                <td>${record.destination}</td>
                <td>${formatDate(record.departureDateTime)}</td>
                <td>
                  <span class="status-badge status-${record.status.toLowerCase().replace('_', '-')}">
                    ${record.status}
                  </span>
                </td>
                <td>${record.driverName || 'Unassigned'}</td>
                <td>${record.tripIncome ? formatCurrency(record.tripIncome) : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${tripRecords.length > 50 ? `
          <p style="margin-top: 10px; color: #746B63; font-style: italic;">
            Showing first 50 of ${tripRecords.length} records. Export full data for complete records.
          </p>
        ` : ''}
      </div>
      ` : ''}

      <!-- No Data Notice -->
      ${metrics.totalTrips === 0 ? `
      <div class="section">
        <div style="text-align: center; padding: 40px; color: #746B63;">
          <p style="font-size: 16px; margin-bottom: 10px;">No Data Available</p>
          <p>No trips found for the selected period.</p>
        </div>
      </div>
      ` : ''}

      <!-- Footer -->
      <div class="footer">
        <div>Vone Trucking Analytics Report - Page 1</div>
        <div class="confidential">CONFIDENTIAL - FOR AUTHORIZED USE ONLY</div>
        <div style="margin-top: 5px;">© ${new Date().getFullYear()} Vone Trucking. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate filename for report
 */
const generateFilename = (config: ReportConfig): string => {
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

  const typeLabel = config.type.replace(/_/g, '-');
  return `Vone_${typeLabel}_Report_${formatFileDate(startDate)}_to_${formatFileDate(endDate)}.pdf`;
};

/**
 * Generate PDF report
 */
export const generatePDFReport = async (
  config: ReportConfig,
  metrics: AnalyticsMetrics,
  tripRecords?: TripRecord[]
): Promise<ReportResult> => {
  try {
    const html = generateReportHTML(config, metrics, tripRecords);
    const filename = generateFilename(config);

    // Generate PDF using expo-print
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    return {
      success: true,
      filename,
      filePath: uri,
      fileSize: fileInfo.exists ? fileInfo.size : undefined,
      pageCount: undefined, // expo-print doesn't provide page count
    };
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw new Error('Failed to generate PDF report');
  }
};

/**
 * Share or download PDF report
 */
export const sharePDFReport = async (filePath: string, filename: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Web: Download file
      const response = await fetch(filePath);
      const blob = await response.blob();
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
          mimeType: 'application/pdf',
          dialogTitle: 'Share Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        throw new Error('Sharing is not available on this device');
      }
    }
  } catch (error) {
    console.error('Error sharing PDF report:', error);
    throw new Error('Failed to share PDF report');
  }
};

/**
 * Clean up temporary file
 */
export const cleanupReportFile = async (filePath: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath, { idempotent: true });
    }
  } catch (error) {
    console.error('Error cleaning up report file:', error);
    // Don't throw - cleanup failures should not break the flow
  }
};
