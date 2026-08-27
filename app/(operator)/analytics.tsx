/**
 * Operator Analytics Dashboard Screen - Redesigned with Design System
 * Phase 3: Modern premium design with complete DESIGN_SYSTEM integration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, LoadingSpinner } from '../../src/components';
import InteractiveLineChart from '../../src/components/analytics/InteractiveLineChart';
import { DESIGN_SYSTEM, COLORS, SPACING, COMPONENTS } from '../../src/theme/designSystem';

const { width } = Dimensions.get('window');
const DS = DESIGN_SYSTEM;

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Mock data - replace with actual API calls
  const stats = [
    { label: 'Active Trips', value: '24', icon: 'location', color: COLORS.teal, trend: '+12%', isPositive: true },
    { label: 'Total Drivers', value: '48', icon: 'people', color: COLORS.navy, trend: '+3', isPositive: true },
    { label: 'Fleet Size', value: '32', icon: 'car', color: COLORS.orange, trend: '+2', isPositive: true },
    { label: 'Revenue', value: '₱2.4M', icon: 'cash', color: COLORS.success, trend: '+18%', isPositive: true },
  ];

  const quickStats = [
    { label: 'Completed', subtitle: 'Today', value: '18', color: COLORS.success },
    { label: 'In Progress', subtitle: 'trips', value: '24', color: COLORS.teal },
    { label: 'Pending', subtitle: 'trips', value: '12', color: COLORS.orange },
    { label: 'Issues', subtitle: 'reports', value: '3', color: COLORS.error },
  ];

  const performance = [
    { label: 'On-Time Delivery', value: '94%', percent: 94, icon: 'checkmark-circle', color: COLORS.success },
    { label: 'Avg Trip Duration', value: '4.2 hrs', percent: 70, icon: 'time', color: COLORS.teal },
    { label: 'Fuel Efficiency', value: '8.5 km/L', percent: 85, icon: 'speedometer', color: COLORS.orange },
    { label: 'Customer Rating', value: '4.7', rating: 4.7, icon: 'star', color: COLORS.warning },
  ];

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
    // TODO: Fetch data for the selected period
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1000);
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
            <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: SPACING['2xl'] }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.navy]} />
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
                      <View style={[styles.trendBadge, { backgroundColor: stat.isPositive ? COLORS.success + '15' : COLORS.error + '15' }]}>
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
                      <View style={[styles.trendBadge, { backgroundColor: stat.isPositive ? COLORS.success + '15' : COLORS.error + '15' }]}>
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
                onPress={() => {}}
                activeOpacity={0.8}
              >
                <Ionicons name="document-text" size={20} color={COLORS.white} />
                <Text style={styles.primaryActionText}>Generate Report</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <Ionicons name="download" size={20} color={COLORS.navy} />
                <Text style={styles.secondaryActionText}>Export Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SPACING.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: DS.typography.fontSize['2xl'],
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.navy,
  },
  section: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 13,
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
    backgroundColor: COLORS.white,
    borderRadius: COMPONENTS.card.borderRadius,
    padding: SPACING.md,
    alignItems: 'center',
    ...COMPONENTS.card.shadow,
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
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.sm,
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
    ...COMPONENTS.card.shadow,
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
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  // Chart Styles
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: COMPONENTS.card.borderRadius,
    padding: SPACING.md,
    ...COMPONENTS.card.shadow,
    overflow: 'hidden',
  },
  // Metrics Styles
  metricsCard: {
    backgroundColor: COLORS.white,
    borderRadius: COMPONENTS.card.borderRadius,
    ...COMPONENTS.card.shadow,
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
    backgroundColor: COLORS.border,
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
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.white,
    marginLeft: SPACING.xs,
  },
  secondaryActionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.navy,
    ...COMPONENTS.card.shadow,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.navy,
    marginLeft: SPACING.xs,
  },
});
