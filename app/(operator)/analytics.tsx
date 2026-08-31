// @ts-nocheck
/**
 * Operator Analytics Dashboard Screen - Redesigned with Design System
 * Phase 3: Modern premium design with complete DESIGN_SYSTEM integration
 * Phase 4: Full reporting and export functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, LoadingSpinner } from '../../src/components';
import InteractiveLineChart from '../../src/components/analytics/InteractiveLineChart';
import { ReportConfigModal } from '../../src/components/analytics/ReportConfigModal';
import { ExportConfigModal } from '../../src/components/analytics/ExportConfigModal';
import { ResultModal } from '../../src/components/analytics/ResultModal';
import { DESIGN_SYSTEM, COLORS, SPACING, COMPONENTS } from '../../src/theme/designSystem';
import { useAuth } from '../../src/hooks';
import {
  getAnalyticsMetrics,
  getTripRecords,
  calculateDateRange,
} from '../../src/services/analytics/analytics-data.service';
import {
  generatePDFReport,
  sharePDFReport,
} from '../../src/services/analytics/report-generator.service';
import {
  exportToCSV,
  shareExportedFile,
} from '../../src/services/analytics/data-export.service';
import {
  ReportType,
  ReportSection,
  ExportDataset,
  ExportFormat,
  AnalyticsMetrics,
  TripRecord,
  AnalyticsFilters,
  ReportConfig,
} from '../../src/types/reporting.types';

const { width } = Dimensions.get('window');
const DS = DESIGN_SYSTEM;

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  
  // Analytics data
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [tripRecords, setTripRecords] = useState<TripRecord[]>([]);
  
  // Modal states
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultType, setResultType] = useState<'success' | 'error' | 'loading'>('loading');
  const [resultTitle, setResultTitle] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [resultFilename, setResultFilename] = useState<string>();
  const [resultRecordCount, setResultRecordCount] = useState<number>();
  const [resultFilePath, setResultFilePath] = useState<string>();
  const [resultShareLabel, setResultShareLabel] = useState('Share');

  // Mock data - replace with actual API calls
  const stats = [
    { label: 'Active Trips', value: metrics?.inProgressTrips.toString() || '24', icon: 'location', color: COLORS.teal, trend: '+12%', isPositive: true },
    { label: 'Total Drivers', value: metrics?.activeDrivers.toString() || '48', icon: 'people', color: COLORS.navy, trend: '+3', isPositive: true },
    { label: 'Fleet Size', value: metrics?.activeTrucks.toString() || '32', icon: 'car', color: COLORS.orange, trend: '+2', isPositive: true },
    { label: 'Revenue', value: `₱${((metrics?.totalRevenue || 2400000) / 1000000).toFixed(1)}M`, icon: 'cash', color: COLORS.success, trend: '+18%', isPositive: true },
  ];

  const quickStats = [
    { label: 'Completed', subtitle: 'trips', value: metrics?.completedTrips.toString() || '18', color: COLORS.success },
    { label: 'In Progress', subtitle: 'trips', value: metrics?.inProgressTrips.toString() || '24', color: COLORS.teal },
    { label: 'Pending', subtitle: 'trips', value: metrics?.pendingTrips.toString() || '12', color: COLORS.orange },
    { label: 'Issues', subtitle: 'reports', value: metrics?.incidentReports.toString() || '3', color: COLORS.error },
  ];

  const performance = [
    { label: 'On-Time Delivery', value: `${metrics?.onTimeDeliveryRate.toFixed(0) || '94'}%`, percent: metrics?.onTimeDeliveryRate || 94, icon: 'checkmark-circle', color: COLORS.success },
    { label: 'Avg Trip Duration', value: `${metrics?.avgTripDurationHours.toFixed(1) || '4.2'} hrs`, percent: 70, icon: 'time', color: COLORS.teal },
    { label: 'Fuel Efficiency', value: `${metrics?.fuelEfficiency?.toFixed(1) || '8.5'} km/L`, percent: 85, icon: 'speedometer', color: COLORS.orange },
    { label: 'Customer Rating', value: metrics?.customerRating?.toFixed(1) || '4.7', rating: metrics?.customerRating || 4.7, icon: 'star', color: COLORS.warning },
  ];

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      const filters: AnalyticsFilters = {
        period: selectedPeriod,
      };

      // Fetch metrics
      const metricsResponse = await getAnalyticsMetrics(filters);
      if (metricsResponse.data) {
        setMetrics(metricsResponse.data);
      }

      // Fetch trip records for potential export
      const recordsResponse = await getTripRecords(filters);
      if (recordsResponse.data) {
        setTripRecords(recordsResponse.data);
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeLabel = (): string => {
    const dateRange = calculateDateRange(selectedPeriod);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'Asia/Manila',
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const handleGenerateReport = async (reportType: ReportType, sections: ReportSection[]) => {
    if (!metrics || !user) {
      Alert.alert('Error', 'Unable to generate report. Please try again.');
      return;
    }

    try {
      setReportModalVisible(false);
      setResultModalVisible(true);
      setResultType('loading');
      setResultTitle('Generating Report');
      setResultMessage('Please wait while we create your PDF report...');

      const dateRange = calculateDateRange(selectedPeriod);
      const config: ReportConfig = {
        title: reportType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        type: reportType,
        dateRange,
        sections,
        generatedBy: user.email || 'Operator',
        generatedAt: new Date().toISOString(),
      };

      const result = await generatePDFReport(config, metrics, sections.find(s => s.id === 'trip_details')?.included ? tripRecords : undefined);

      setResultType('success');
      setResultTitle('Report Generated');
      setResultMessage('Your PDF report has been created successfully.');
      setResultFilename(result.filename);
      setResultRecordCount(metrics.totalTrips);
      setResultFilePath(result.filePath);
      setResultShareLabel('Download PDF');
    } catch (error) {
      console.error('Error generating report:', error);
      setResultType('error');
      setResultTitle('Generation Failed');
      setResultMessage('We couldn\'t create this file. Please try again.');
    }
  };

  const handleExportData = async (dataset: ExportDataset, format: ExportFormat) => {
    if (!metrics) {
      Alert.alert('Error', 'Unable to export data. Please try again.');
      return;
    }

    try {
      setExportModalVisible(false);
      setResultModalVisible(true);
      setResultType('loading');
      setResultTitle('Exporting Data');
      setResultMessage(`Please wait while we prepare your ${format.toUpperCase()} file...`);

      const dateRange = calculateDateRange(selectedPeriod);
      const filters: AnalyticsFilters = {
        period: selectedPeriod,
        dateRange,
      };

      const result = await exportToCSV(
        { dataset, format, dateRange, filters },
        metrics,
        tripRecords
      );

      if (result.recordCount === 0) {
        setResultType('error');
        setResultTitle('No Data Available');
        setResultMessage('No data available for the selected period. Change the date range or filters and try again.');
        return;
      }

      setResultType('success');
      setResultTitle('Export Complete');
      setResultMessage(`Successfully exported ${result.recordCount.toLocaleString()} record${result.recordCount !== 1 ? 's' : ''}.`);
      setResultFilename(result.filename);
      setResultRecordCount(result.recordCount);
      setResultFilePath(result.filePath);
      setResultShareLabel('Download File');
    } catch (error) {
      console.error('Error exporting data:', error);
      setResultType('error');
      setResultTitle('Export Failed');
      setResultMessage('We couldn\'t create this file. Please try again.');
    }
  };

  const handleShare = async () => {
    if (!resultFilePath || !resultFilename) return;

    try {
      if (resultShareLabel.includes('PDF')) {
        await sharePDFReport(resultFilePath, resultFilename);
      } else {
        const format = resultFilename.endsWith('.xlsx') ? 'xlsx' : 'csv';
        await shareExportedFile(resultFilePath, resultFilename, format);
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Error', 'Failed to share file. Please try again.');
    }
  };

  const handleRetry = () => {
    setResultModalVisible(false);
    // Reopen the appropriate modal based on previous action
    if (resultShareLabel.includes('PDF')) {
      setReportModalVisible(true);
    } else {
      setExportModalVisible(true);
    }
  };

  // Chart data for interactive component
  const interactiveChartData = {
    thisWeek: [
      { label: 'Mon', value: 19, fullLabel: 'Monday' },
      { label: 'Tue', value: 21, fullLabel: 'Tuesday' },
      { label: 'Wed', value: 18, fullLabel: 'Wednesday' },
      { label: 'Thu', value: 24, fullLabel: 'Thursday' },
      { label: 'Fri', value: 22, fullLabel: 'Friday' },
      { label: 'Sat', value: 26, fullLabel: 'Saturday' },
      { label: 'Sun', value: 19, fullLabel: 'Sunday' },
    ],
    lastWeek: [
      { label: 'Mon', value: 15, fullLabel: 'Monday' },
      { label: 'Tue', value: 18, fullLabel: 'Tuesday' },
      { label: 'Wed', value: 16, fullLabel: 'Wednesday' },
      { label: 'Thu', value: 20, fullLabel: 'Thursday' },
      { label: 'Fri', value: 19, fullLabel: 'Friday' },
      { label: 'Sat', value: 22, fullLabel: 'Saturday' },
      { label: 'Sun', value: 17, fullLabel: 'Sunday' },
    ],
  };

  const handlePeriodChange = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Screen>
        <View style={[styles.container, { backgroundColor: COLORS.background }]}>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: SPACING['2xl'] }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.teal]} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Overview - 2x2 Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>OVERVIEW</Text>
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                {stats.slice(0, 2).map((stat, index) => (
                  <View key={index} style={styles.gridCell}>
                    <View style={styles.statCard}>
                      <Ionicons name={stat.icon as any} size={28} color={stat.color} style={{ marginBottom: SPACING.sm }} />
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                      <View style={[styles.trendBadge, { backgroundColor: stat.isPositive ? COLORS.success + '25' : COLORS.error + '25' }]}>
                        <Text style={[styles.trendText, { color: stat.isPositive ? COLORS.success : COLORS.error }]}>
                          {stat.trend}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.gridRow}>
                {stats.slice(2, 4).map((stat, index) => (
                  <View key={index} style={styles.gridCell}>
                    <View style={styles.statCard}>
                      <Ionicons name={stat.icon as any} size={28} color={stat.color} style={{ marginBottom: SPACING.sm }} />
                      <Text style={styles.statValue}>{stat.value}</Text>
                      <Text style={styles.statLabel}>{stat.label}</Text>
                      <View style={[styles.trendBadge, { backgroundColor: stat.isPositive ? COLORS.success + '25' : COLORS.error + '25' }]}>
                        <Text style={[styles.trendText, { color: stat.isPositive ? COLORS.success : COLORS.error }]}>
                          {stat.trend}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Today's Summary - All 4 Cards Fully Visible */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TODAY'S SUMMARY</Text>
            <View style={styles.summaryContainer}>
              {quickStats.map((stat, index) => (
                <View key={index} style={styles.summaryCard}>
                  <Text style={[styles.summaryValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={styles.summaryLabel}>{stat.label}</Text>
                  <Text style={styles.summarySubtitle}>{stat.subtitle}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weekly Trips Chart - Full Week Display */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>WEEKLY TRIPS TREND</Text>
            <View style={styles.chartCard}>
              <InteractiveLineChart
                data={interactiveChartData}
                width={width - 64}
                height={260}
                onPeriodChange={handlePeriodChange}
              />
            </View>
          </View>

          {/* Performance Metrics - Progress Bars, No Chevrons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PERFORMANCE METRICS</Text>
            <View style={styles.metricsCard}>
              {performance.map((metric, index) => (
                <View
                  key={index}
                  style={[
                    styles.metricRow,
                    index < performance.length - 1 && styles.metricRowBorder,
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <View style={[styles.metricIconContainer, { backgroundColor: metric.color + '15' }]}>
                      <Ionicons name={metric.icon as any} size={20} color={metric.color} />
                    </View>
                    <View style={styles.metricInfo}>
                      <Text style={styles.metricLabelText}>{metric.label}</Text>
                      <Text style={styles.metricValueText}>{metric.value}</Text>
                    </View>
                  </View>
                  
                  {/* Progress Bar or Star Rating */}
                  {metric.rating ? (
                    <View style={styles.starRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= Math.floor(metric.rating!) ? 'star' : star <= metric.rating! ? 'star-half' : 'star-outline'}
                          size={16}
                          color={COLORS.warning}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${metric.percent}%`, backgroundColor: metric.color }]} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions - Polished Buttons */}
          <View style={[styles.section, { paddingBottom: SPACING['2xl'] }]}>
            <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => setReportModalVisible(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Generate analytics report"
                accessibilityHint="Opens report configuration to generate PDF"
              >
                <Ionicons name="document-text" size={20} color={COLORS.white} />
                <Text style={styles.primaryActionText}>Generate Report</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => setExportModalVisible(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Export analytics data"
                accessibilityHint="Opens export configuration to download data"
              >
                <Ionicons name="download" size={20} color={COLORS.teal} />
                <Text style={styles.secondaryActionText}>Export Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Report Configuration Modal */}
        <ReportConfigModal
          visible={reportModalVisible}
          dateRangeLabel={getDateRangeLabel()}
          onClose={() => setReportModalVisible(false)}
          onGenerate={handleGenerateReport}
        />

        {/* Export Configuration Modal */}
        <ExportConfigModal
          visible={exportModalVisible}
          dateRangeLabel={getDateRangeLabel()}
          onClose={() => setExportModalVisible(false)}
          onExport={handleExportData}
        />

        {/* Result Modal */}
        <ResultModal
          visible={resultModalVisible}
          type={resultType}
          title={resultTitle}
          message={resultMessage}
          filename={resultFilename}
          recordCount={resultRecordCount}
          onClose={() => setResultModalVisible(false)}
          onShare={resultType === 'success' ? handleShare : undefined}
          onRetry={resultType === 'error' ? handleRetry : undefined}
          shareLabel={resultShareLabel}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  section: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.textTertiary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Overview Grid Styles
  gridContainer: {
    gap: SPACING.xs,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  gridCell: {
    flex: 1,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: COMPONENTS.card.borderRadius,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 130,
  },
  statValue: {
    fontSize: 32,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  trendBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 11,
    fontWeight: DS.typography.fontWeight.semibold,
  },
  // Summary Styles
  summaryContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.sm,
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: DS.typography.fontWeight.bold,
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: 2,
    textAlign: 'center',
  },
  summarySubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Chart Styles
  chartCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: COMPONENTS.card.borderRadius,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  // Metrics Styles
  metricsCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: COMPONENTS.card.borderRadius,
  },
  metricRow: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    minHeight: 56,
  },
  metricRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabelText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  metricValueText: {
    fontSize: 20,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.text,
  },
  starRating: {
    flexDirection: 'row',
    gap: 4,
    paddingLeft: 52,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
    marginLeft: 52,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  // Actions Styles
  actionsContainer: {
    gap: SPACING.xs,
  },
  primaryActionButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  secondaryActionButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
});
