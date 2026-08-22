/**
 * Analytics Dashboard Component (Operator)
 * 
 * Comprehensive dashboard showing trip metrics, financial summaries,
 * truck utilization, alerts, and performance indicators with filters
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  DashboardMetrics,
  DashboardFilters,
  DateFilter,
} from '../../types/analytics.types';
import { analyticsService } from '../../services/analytics/AnalyticsService';

interface AnalyticsDashboardProps {
  operatorId: string;
  onNavigateToReports?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  operatorId,
  onNavigateToReports,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [dateFilter, setDateFilter] = useState<DateFilter>({ type: 'this_month' });
  const [truckFilter, setTruckFilter] = useState<string | undefined>();
  const [driverFilter, setDriverFilter] = useState<string | undefined>();
  const [porterFilter, setPorterFilter] = useState<string | undefined>();
  const [destinationFilter, setDestinationFilter] = useState<string | undefined>();

  useEffect(() => {
    loadMetrics();
  }, [dateFilter, truckFilter, driverFilter, porterFilter, destinationFilter]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);

      const filters: DashboardFilters = {
        date_filter: dateFilter,
        truck_id: truckFilter,
        driver_id: driverFilter,
        porter_id: porterFilter,
        destination: destinationFilter,
      };

      const data = await analyticsService.calculateDashboardMetrics(filters);
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load dashboard metrics:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMetrics();
  };

  const handleDateFilterChange = (type: DateFilter['type']) => {
    setDateFilter({ type });
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  /**
   * Render date filter buttons
   */
  const renderDateFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filtersTitle}>Time Period</Text>
      <View style={styles.filterButtons}>
        {['today', 'this_week', 'this_month'].map((type) => {
          const isActive = dateFilter.type === type;
          const label = type === 'today' ? 'Today' : 
                       type === 'this_week' ? 'This Week' : 
                       'This Month';
          
          return (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, isActive && styles.filterButtonActive]}
              onPress={() => handleDateFilterChange(type as DateFilter['type'])}
            >
              <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  /**
   * Render metric card
   */
  const renderMetricCard = (
    icon: string,
    label: string,
    value: string | number,
    trend?: { value: number; isPositive: boolean },
    color: string = '#3B82F6'
  ) => (
    <View style={styles.metricCard}>
      <View style={[styles.metricIconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.metricContent}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={trend.isPositive ? '#10B981' : '#EF4444'}
            />
            <Text style={[styles.trendText, {
              color: trend.isPositive ? '#10B981' : '#EF4444'
            }]}>
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  /**
   * Render trip status overview
   */
  const renderTripStatusOverview = () => {
    if (!metrics) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics" size={20} color="#1F2937" />
          <Text style={styles.sectionTitle}>Trip Status Overview</Text>
        </View>

        <View style={styles.metricsGrid}>
          {renderMetricCard('checkmark-circle', 'Completed', metrics.completed_trips, undefined, '#10B981')}
          {renderMetricCard('play-circle', 'Active', metrics.active_trips, undefined, '#3B82F6')}
          {renderMetricCard('calendar', 'Scheduled', metrics.scheduled_trips, undefined, '#6366F1')}
          {renderMetricCard('alert-circle', 'Delayed', metrics.delayed_trips, undefined, '#EF4444')}
        </View>
      </View>
    );
  };

  /**
   * Render truck status overview
   */
  const renderTruckStatusOverview = () => {
    if (!metrics) return null;

    const totalTrucks = metrics.available_trucks + metrics.trucks_on_trips + metrics.trucks_under_maintenance;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="car" size={20} color="#1F2937" />
          <Text style={styles.sectionTitle}>Fleet Status</Text>
        </View>

        <View style={styles.metricsGrid}>
          {renderMetricCard('checkmark-circle', 'Available', metrics.available_trucks, undefined, '#10B981')}
          {renderMetricCard('navigate-circle', 'On Trips', metrics.trucks_on_trips, undefined, '#3B82F6')}
          {renderMetricCard('construct', 'Maintenance', metrics.trucks_under_maintenance, undefined, '#F59E0B')}
          {renderMetricCard('speedometer', 'Utilization', formatPercentage(metrics.truck_utilization_percentage), undefined, '#8B5CF6')}
        </View>
      </View>
    );
  };

  /**
   * Render financial summary
   */
  const renderFinancialSummary = () => {
    if (!metrics) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="cash" size={20} color="#1F2937" />
          <Text style={styles.sectionTitle}>Financial Summary</Text>
        </View>

        {/* Weekly */}
        <View style={styles.financialPeriod}>
          <Text style={styles.financialPeriodTitle}>This Week</Text>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Income</Text>
            <Text style={[styles.financialValue, styles.incomeText]}>
              {formatCurrency(metrics.weekly_trip_income)}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Expenses</Text>
            <Text style={[styles.financialValue, styles.expenseText]}>
              {formatCurrency(metrics.weekly_expenses)}
            </Text>
          </View>
          <View style={[styles.financialRow, styles.financialTotal]}>
            <Text style={styles.financialTotalLabel}>Net Profit</Text>
            <Text style={[
              styles.financialTotalValue,
              metrics.weekly_net_profit >= 0 ? styles.profitPositive : styles.profitNegative
            ]}>
              {formatCurrency(metrics.weekly_net_profit)}
            </Text>
          </View>
        </View>

        {/* Monthly */}
        <View style={styles.financialPeriod}>
          <Text style={styles.financialPeriodTitle}>This Month</Text>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Income</Text>
            <Text style={[styles.financialValue, styles.incomeText]}>
              {formatCurrency(metrics.monthly_trip_income)}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Expenses</Text>
            <Text style={[styles.financialValue, styles.expenseText]}>
              {formatCurrency(metrics.monthly_expenses)}
            </Text>
          </View>
          <View style={[styles.financialRow, styles.financialTotal]}>
            <Text style={styles.financialTotalLabel}>Net Profit</Text>
            <Text style={[
              styles.financialTotalValue,
              metrics.monthly_net_profit >= 0 ? styles.profitPositive : styles.profitNegative
            ]}>
              {formatCurrency(metrics.monthly_net_profit)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render expense breakdown
   */
  const renderExpenseBreakdown = () => {
    if (!metrics) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="pie-chart" size={20} color="#1F2937" />
          <Text style={styles.sectionTitle}>Expense Breakdown</Text>
        </View>

        <View style={styles.expenseList}>
          <View style={styles.expenseItem}>
            <View style={styles.expenseItemLeft}>
              <View style={[styles.expenseDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.expenseItemLabel}>Fuel</Text>
            </View>
            <Text style={styles.expenseItemValue}>
              {formatCurrency(metrics.fuel_expenses)}
            </Text>
          </View>

          <View style={styles.expenseItem}>
            <View style={styles.expenseItemLeft}>
              <View style={[styles.expenseDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.expenseItemLabel}>Payroll</Text>
            </View>
            <Text style={styles.expenseItemValue}>
              {formatCurrency(metrics.payroll_costs)}
            </Text>
          </View>

          <View style={styles.expenseItem}>
            <View style={styles.expenseItemLeft}>
              <View style={[styles.expenseDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.expenseItemLabel}>Cash Advances</Text>
            </View>
            <Text style={styles.expenseItemValue}>
              {formatCurrency(metrics.outstanding_cash_advances)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render performance metrics
   */
  const renderPerformanceMetrics = () => {
    if (!metrics) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trending-up" size={20} color="#1F2937" />
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
        </View>

        <View style={styles.performanceGrid}>
          <View style={styles.performanceCard}>
            <Text style={styles.performanceValue}>
              {formatPercentage(metrics.on_time_delivery_rate)}
            </Text>
            <Text style={styles.performanceLabel}>On-Time Delivery</Text>
            <View style={styles.performanceBar}>
              <View
                style={[
                  styles.performanceBarFill,
                  {
                    width: `${metrics.on_time_delivery_rate}%`,
                    backgroundColor: metrics.on_time_delivery_rate >= 90 ? '#10B981' : 
                                   metrics.on_time_delivery_rate >= 75 ? '#F59E0B' : '#EF4444'
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.performanceCard}>
            <Text style={[
              styles.performanceValue,
              metrics.estimated_vs_actual_fuel_variance > 10 ? { color: '#EF4444' } :
              metrics.estimated_vs_actual_fuel_variance > 5 ? { color: '#F59E0B' } : { color: '#10B981' }
            ]}>
              {formatPercentage(Math.abs(metrics.estimated_vs_actual_fuel_variance))}
            </Text>
            <Text style={styles.performanceLabel}>Fuel Variance</Text>
            <Text style={styles.performanceSubtext}>
              {metrics.estimated_vs_actual_fuel_variance > 0 ? 'Over' : 'Under'} estimate
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render frequent destinations
   */
  const renderFrequentDestinations = () => {
    if (!metrics || metrics.frequent_destinations.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location" size={20} color="#1F2937" />
          <Text style={styles.sectionTitle}>Top Destinations</Text>
        </View>

        <View style={styles.destinationList}>
          {metrics.frequent_destinations.slice(0, 5).map((dest, index) => (
            <View key={index} style={styles.destinationItem}>
              <View style={styles.destinationRank}>
                <Text style={styles.destinationRankText}>{index + 1}</Text>
              </View>
              <View style={styles.destinationInfo}>
                <Text style={styles.destinationName}>{dest.destination}</Text>
                <Text style={styles.destinationStats}>
                  {dest.trip_count} trips • {formatCurrency(dest.total_income)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          ))}
        </View>
      </View>
    );
  };

  /**
   * Render alerts section
   */
  const renderAlerts = () => {
    if (!metrics) return null;

    const totalAlerts = metrics.expiring_documents_count + 
                       metrics.maintenance_reminders_count + 
                       metrics.offline_gps_devices_count;

    if (totalAlerts === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications" size={20} color="#1F2937" />
          <Text style={styles.sectionTitle}>Alerts</Text>
        </View>

        <View style={styles.alertsList}>
          {metrics.expiring_documents_count > 0 && (
            <TouchableOpacity style={styles.alertItem}>
              <View style={[styles.alertIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="document-text" size={20} color="#D97706" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Expiring Documents</Text>
                <Text style={styles.alertSubtext}>
                  {metrics.expiring_documents_count} document(s) expiring soon
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {metrics.maintenance_reminders_count > 0 && (
            <TouchableOpacity style={styles.alertItem}>
              <View style={[styles.alertIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="construct" size={20} color="#DC2626" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Maintenance Due</Text>
                <Text style={styles.alertSubtext}>
                  {metrics.maintenance_reminders_count} truck(s) need maintenance
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {metrics.offline_gps_devices_count > 0 && (
            <TouchableOpacity style={styles.alertItem}>
              <View style={[styles.alertIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="locate" size={20} color="#2563EB" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>GPS Devices Offline</Text>
                <Text style={styles.alertSubtext}>
                  {metrics.offline_gps_devices_count} device(s) not reporting
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (isLoading && !metrics) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {metrics && new Date(metrics.date_range_start).toLocaleDateString()} -{' '}
            {metrics && new Date(metrics.date_range_end).toLocaleDateString()}
          </Text>
        </View>
        {onNavigateToReports && (
          <TouchableOpacity style={styles.reportsButton} onPress={onNavigateToReports}>
            <Ionicons name="document-text" size={20} color="#3B82F6" />
            <Text style={styles.reportsButtonText}>Reports</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderDateFilters()}
      {renderTripStatusOverview()}
      {renderTruckStatusOverview()}
      {renderFinancialSummary()}
      {renderExpenseBreakdown()}
      {renderPerformanceMetrics()}
      {renderFrequentDestinations()}
      {renderAlerts()}

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  reportsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  reportsButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 6,
  },

  // Filters
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },

  // Section
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 2,
  },

  // Financial
  financialPeriod: {
    marginBottom: 16,
  },
  financialPeriodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  financialLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  incomeText: {
    color: '#10B981',
  },
  expenseText: {
    color: '#EF4444',
  },
  financialTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  financialTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  financialTotalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  profitPositive: {
    color: '#10B981',
  },
  profitNegative: {
    color: '#EF4444',
  },

  // Expense
  expenseList: {
    gap: 12,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  expenseItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  expenseItemLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  expenseItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Performance
  performanceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  performanceCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    alignItems: 'center',
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  performanceSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  performanceBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  performanceBarFill: {
    height: '100%',
  },

  // Destinations
  destinationList: {
    gap: 12,
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  destinationRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destinationRankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  destinationStats: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Alerts
  alertsList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  alertSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },

  footer: {
    height: 24,
  },
});
