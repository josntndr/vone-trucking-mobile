/**
 * Operator Analytics Dashboard Screen
 */

import React, { useEffect, useState } from 'react';
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
import { Screen, Card, LoadingSpinner } from '../../src/components';
import { useTheme } from '../../src/hooks';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  // Force light theme for operator/admin
  const themeObj = useTheme();
  const colors = {
    background: '#F7F4EF',
    surface: '#FFFDFC',
    text: '#24211F',
    textSecondary: '#746B63',
    textTertiary: '#9D9690',
    border: '#E5DDD5',
    primary: '#192A4A',
    accent: '#D87532',
    success: '#4F956E',
    info: '#4D728C',
    warning: '#C68A24',
    error: '#C44C47',
    white: '#FFFFFF',
  };
  const { spacing, fontSizes, fontWeights, borderRadius } = themeObj;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with actual API calls
  const stats = [
    { label: 'Active Trips', value: '24', icon: 'location', color: colors.primary, trend: '+12%' },
    { label: 'Total Drivers', value: '48', icon: 'people', color: colors.info, trend: '+3' },
    { label: 'Fleet Size', value: '32', icon: 'car', color: colors.accent, trend: '+2' },
    { label: 'Revenue', value: '₱2.4M', icon: 'cash', color: colors.success, trend: '+18%' },
  ];

  const quickStats = [
    { label: 'Completed Today', value: '18', subtitle: 'trips', color: colors.success },
    { label: 'In Progress', value: '24', subtitle: 'trips', color: colors.info },
    { label: 'Pending', value: '12', subtitle: 'trips', color: colors.warning },
    { label: 'Issues', value: '3', subtitle: 'reports', color: colors.error },
  ];

  const performance = [
    { label: 'On-Time Delivery', value: '94%', icon: 'checkmark-circle', color: colors.success },
    { label: 'Avg Trip Duration', value: '4.2 hrs', icon: 'time', color: colors.info },
    { label: 'Fuel Efficiency', value: '8.5 km/L', icon: 'speedometer', color: colors.accent },
    { label: 'Customer Rating', value: '4.7', icon: 'star', color: colors.warning },
  ];

  // Chart data - Weekly trips
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [18, 22, 20, 25, 24, 19, 21],
        color: (opacity = 1) => `rgba(25, 42, 74, ${opacity})`, // primary color
        strokeWidth: 3,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(25, 42, 74, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(116, 107, 99, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // solid lines
      stroke: colors.border,
      strokeWidth: 1,
    },
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading) {
    return (
      <Screen>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: spacing.md,
              paddingVertical: spacing[3],
              backgroundColor: colors.white,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: spacing[3] }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.text,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              flex: 1,
            }}
          >
            Analytics
          </Text>
          <TouchableOpacity
            onPress={() => {}}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="calendar-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Main Stats */}
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing[4] }}>
            <Text
              style={{
                fontSize: fontSizes.lg,
                fontWeight: fontWeights.bold,
                color: colors.text,
                marginBottom: spacing[3],
              }}
            >
              Overview
            </Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  style={{
                    flex: 1,
                    margin: 4,
                    padding: spacing[3],
                    minWidth: (width - spacing.md * 2 - 16) / 2,
                  }}
                >
                  <View
                    style={[
                      styles.statIcon,
                      {
                        backgroundColor: stat.color + '15',
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        marginBottom: spacing[2],
                      },
                    ]}
                  >
                    <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                  </View>
                  <Text
                    style={{
                      fontSize: fontSizes['2xl'],
                      fontWeight: fontWeights.bold,
                      color: colors.text,
                      marginBottom: spacing[1],
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSizes.xs,
                      color: colors.textSecondary,
                      marginBottom: spacing[1],
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSizes.xs,
                      fontWeight: fontWeights.semibold,
                      color: stat.trend.startsWith('+') ? colors.success : colors.error,
                    }}
                  >
                    {stat.trend}
                  </Text>
                </Card>
              ))}
            </View>
          </View>

          {/* Quick Stats */}
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing[5] }}>
            <Text
              style={{
                fontSize: fontSizes.lg,
                fontWeight: fontWeights.bold,
                color: colors.text,
                marginBottom: spacing[3],
              }}
            >
              Today's Summary
            </Text>
            <View style={styles.quickStatsRow}>
              {quickStats.map((stat, index) => (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    backgroundColor: colors.white,
                    borderRadius: borderRadius.base,
                    padding: spacing[3],
                    marginRight: index < quickStats.length - 1 ? 8 : 0,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: fontSizes['2xl'],
                      fontWeight: fontWeights.bold,
                      color: stat.color,
                      marginBottom: spacing[1],
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSizes.xs,
                      color: colors.textSecondary,
                      marginBottom: 2,
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSizes.xs,
                      color: colors.textTertiary,
                    }}
                  >
                    {stat.subtitle}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weekly Trips Chart */}
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing[5] }}>
            <Text
              style={{
                fontSize: fontSizes.lg,
                fontWeight: fontWeights.bold,
                color: colors.text,
                marginBottom: spacing[3],
              }}
            >
              Weekly Trips Trend
            </Text>
            <Card style={{ padding: spacing[3], overflow: 'hidden' }}>
              <LineChart
                data={chartData}
                width={width - spacing.md * 2 - spacing[3] * 2}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                withDots={true}
                withShadow={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero={true}
              />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: spacing[2],
                  paddingHorizontal: spacing[2],
                }}
              >
                <View>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.textTertiary }}>
                    Average
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSizes.lg,
                      fontWeight: fontWeights.bold,
                      color: colors.text,
                    }}
                  >
                    21.3
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.textTertiary }}>
                    This Week
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSizes.lg,
                      fontWeight: fontWeights.bold,
                      color: colors.success,
                    }}
                  >
                    149 trips
                  </Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Performance Metrics */}
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing[5] }}>
            <Text
              style={{
                fontSize: fontSizes.lg,
                fontWeight: fontWeights.bold,
                color: colors.text,
                marginBottom: spacing[3],
              }}
            >
              Performance Metrics
            </Text>
            <Card>
              {performance.map((metric, index) => (
                <View
                  key={index}
                  style={[
                    styles.performanceRow,
                    {
                      paddingVertical: spacing[3],
                      paddingHorizontal: spacing[4],
                      borderBottomWidth: index < performance.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.metricIcon,
                      {
                        backgroundColor: metric.color + '15',
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        marginRight: spacing[3],
                      },
                    ]}
                  >
                    <Ionicons name={metric.icon as any} size={20} color={metric.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: fontSizes.sm,
                        color: colors.textSecondary,
                        marginBottom: 2,
                      }}
                    >
                      {metric.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: fontSizes.xl,
                        fontWeight: fontWeights.bold,
                        color: colors.text,
                      }}
                    >
                      {metric.value}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </View>
              ))}
            </Card>
          </View>

          {/* Quick Actions */}
          <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing[5] }}>
            <Text
              style={{
                fontSize: fontSizes.lg,
                fontWeight: fontWeights.bold,
                color: colors.text,
                marginBottom: spacing[3],
              }}
            >
              Quick Actions
            </Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  {
                    backgroundColor: colors.white,
                    borderRadius: borderRadius.base,
                    padding: spacing[4],
                    marginRight: 8,
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {}}
              >
                <Ionicons name="document-text" size={28} color={colors.primary} />
                <Text
                  style={{
                    fontSize: fontSizes.sm,
                    fontWeight: fontWeights.semibold,
                    color: colors.text,
                    marginTop: spacing[2],
                  }}
                >
                  Generate Report
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionCard,
                  {
                    backgroundColor: colors.white,
                    borderRadius: borderRadius.base,
                    padding: spacing[4],
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => {}}
              >
                <Ionicons name="download" size={28} color={colors.info} />
                <Text
                  style={{
                    fontSize: fontSizes.sm,
                    fontWeight: fontWeights.semibold,
                    color: colors.text,
                    marginTop: spacing[2],
                  }}
                >
                  Export Data
                </Text>
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
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatsRow: {
    flexDirection: 'row',
  },
  performanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
  },
  actionCard: {
    alignItems: 'center',
  },
});
