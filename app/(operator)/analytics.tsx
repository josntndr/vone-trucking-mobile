/**
 * Operator Analytics Dashboard Screen - Redesigned
 * Enhanced UI/UX with proper layouts, complete data, and polish
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
import InteractiveLineChart from '../../src/components/analytics/InteractiveLineChart';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  // Force light theme for operator/admin
  const themeObj = useTheme();
  const colors = {
    background: '#F0EDE8',
    surface: '#FFFCF8',
    text: '#2C2418',
    textSecondary: '#6B6256',
    textTertiary: '#9B9289',
    border: '#E0D7CC',
    primary: '#1B2A4A',
    teal: '#3A7D8C',
    orange: '#E07B2A',
    success: '#4F7A5E',
    error: '#C74C47',
    warning: '#D89534',
    white: '#FFFFFF',
  };
  const { spacing, fontSizes, fontWeights, borderRadius } = themeObj;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with actual API calls
  const stats = [
    { label: 'Active Trips', value: '24', icon: 'location', color: colors.teal, trend: '+12%', isPositive: true },
    { label: 'Total Drivers', value: '48', icon: 'people', color: colors.primary, trend: '+3', isPositive: true },
    { label: 'Fleet Size', value: '32', icon: 'car', color: colors.orange, trend: '+2', isPositive: true },
    { label: 'Revenue', value: '₱2.4M', icon: 'cash', color: colors.success, trend: '+18%', isPositive: true },
  ];

  const quickStats = [
    { label: 'Completed', subtitle: 'Today', value: '18', color: colors.success },
    { label: 'In Progress', subtitle: 'trips', value: '24', color: colors.teal },
    { label: 'Pending', subtitle: 'trips', value: '12', color: colors.orange },
    { label: 'Issues', subtitle: 'reports', value: '3', color: colors.error },
  ];

  const performance = [
    { label: 'On-Time Delivery', value: '94%', percent: 94, icon: 'checkmark-circle', color: colors.success },
    { label: 'Avg Trip Duration', value: '4.2 hrs', percent: 70, icon: 'time', color: colors.teal },
    { label: 'Fuel Efficiency', value: '8.5 km/L', percent: 85, icon: 'speedometer', color: colors.orange },
    { label: 'Customer Rating', value: '4.7', rating: 4.7, icon: 'star', color: colors.warning },
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

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

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
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={0.6}
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
          {/* Overview - 2x2 Grid */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#9E9E9E',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              OVERVIEW
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {stats.slice(0, 2).map((stat, index) => (
                  <View key={index} style={{ flex: 1 }}>
                    <View
                      style={{
                        backgroundColor: colors.white,
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                        minHeight: 130,
                      }}
                    >
                      <Ionicons name={stat.icon as any} size={28} color={stat.color} style={{ marginBottom: 12 }} />
                      <Text
                        style={{
                          fontSize: 32,
                          fontWeight: '700',
                          color: colors.text,
                          marginBottom: 4,
                        }}
                      >
                        {stat.value}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginBottom: 8,
                          textAlign: 'center',
                        }}
                      >
                        {stat.label}
                      </Text>
                      <View
                        style={{
                          backgroundColor: stat.isPositive ? colors.success + '15' : colors.error + '15',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: stat.isPositive ? colors.success : colors.error,
                          }}
                        >
                          {stat.trend}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {stats.slice(2, 4).map((stat, index) => (
                  <View key={index} style={{ flex: 1 }}>
                    <View
                      style={{
                        backgroundColor: colors.white,
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                        minHeight: 130,
                      }}
                    >
                      <Ionicons name={stat.icon as any} size={28} color={stat.color} style={{ marginBottom: 12 }} />
                      <Text
                        style={{
                          fontSize: 32,
                          fontWeight: '700',
                          color: colors.text,
                          marginBottom: 4,
                        }}
                      >
                        {stat.value}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginBottom: 8,
                          textAlign: 'center',
                        }}
                      >
                        {stat.label}
                      </Text>
                      <View
                        style={{
                          backgroundColor: stat.isPositive ? colors.success + '15' : colors.error + '15',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '600',
                            color: stat.isPositive ? colors.success : colors.error,
                          }}
                        >
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
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#9E9E9E',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              TODAY'S SUMMARY
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {quickStats.map((stat, index) => (
                <View
                  key={index}
                  style={{
                    flex: 1,
                    backgroundColor: colors.white,
                    borderRadius: 8,
                    padding: 10,
                    minHeight: 90,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: '700',
                      color: stat.color,
                      marginBottom: 6,
                    }}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: 2,
                      textAlign: 'center',
                    }}
                  >
                    {stat.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: colors.textTertiary,
                      textAlign: 'center',
                    }}
                  >
                    {stat.subtitle}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Weekly Trips Chart - Full Week Display */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#9E9E9E',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              WEEKLY TRIPS TREND
            </Text>
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                overflow: 'hidden',
              }}
            >
              <InteractiveLineChart
                data={interactiveChartData}
                width={width - 64}
                height={260}
                onPeriodChange={handlePeriodChange}
              />
            </View>
          </View>

          {/* Performance Metrics - Progress Bars, No Chevrons */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#9E9E9E',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              PERFORMANCE METRICS
            </Text>
            <View
              style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              {performance.map((metric, index) => (
                <View
                  key={index}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderBottomWidth: index < performance.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                    minHeight: 56,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View
                      style={{
                        backgroundColor: metric.color + '15',
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Ionicons name={metric.icon as any} size={20} color={metric.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.textSecondary,
                          marginBottom: 2,
                        }}
                      >
                        {metric.label}
                      </Text>
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: '700',
                          color: colors.text,
                        }}
                      >
                        {metric.value}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Progress Bar or Star Rating */}
                  {metric.rating ? (
                    <View style={{ flexDirection: 'row', gap: 4, paddingLeft: 52 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= Math.floor(metric.rating!) ? 'star' : star <= metric.rating! ? 'star-half' : 'star-outline'}
                          size={16}
                          color={colors.warning}
                        />
                      ))}
                    </View>
                  ) : (
                    <View
                      style={{
                        height: 6,
                        backgroundColor: colors.border,
                        borderRadius: 3,
                        overflow: 'hidden',
                        marginLeft: 52,
                      }}
                    >
                      <View
                        style={{
                          width: `${metric.percent}%`,
                          height: '100%',
                          backgroundColor: metric.color,
                          borderRadius: 3,
                        }}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions - Polished Buttons */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#9E9E9E',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              QUICK ACTIONS
            </Text>
            <View style={{ gap: 8 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
                onPress={() => {}}
                activeOpacity={0.8}
              >
                <Ionicons name="document-text" size={20} color={colors.white} />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.white,
                    marginLeft: 8,
                  }}
                >
                  Generate Report
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 8,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1.5,
                  borderColor: colors.primary,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <Ionicons name="download" size={20} color={colors.primary} />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: colors.primary,
                    marginLeft: 8,
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
});
