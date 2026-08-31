/**
 * Operator/Admin Home Screen - Complete Redesign v3.0
 * Matches attached screenshot design with real data integration
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import { getTrucks } from '../../src/services/api/truck.service';
import { getEmployees } from '../../src/services/api/employee.service';
import { getTrips, getTripStats } from '../../src/services/api/trip.service';
import { getExpensesSummary } from '../../src/services/api/expense.service';
import { isSupabaseConfigured } from '../../src/services/api/supabase';
import { TruckStatus } from '../../src/types/truck.types';
import { EmploymentStatus, UserRole } from '../../src/types';
import { TripStatus, Trip } from '../../src/types/trip.types';
import { COLORS, SPACING, DESIGN_SYSTEM } from '../../src/theme/designSystem';
import { formatPhilippinePeso } from '../../src/utils/philippines';

const DS = DESIGN_SYSTEM;

interface DashboardStats {
  totalTrips: number;
  completedTrips: number;
  activeEmployees: number;
  inProgressTrips: number;
  activeTodayTrips: number;
  scheduledTodayTrips: number;
  delayedTodayTrips: number;
  availableTrucks: number;
}

interface FinancialSummary {
  tripIncome: number;
  expenses: number;
  profit: number;
  profitPercentage: number;
}

interface UrgentAlert {
  id: string;
  type: 'warning' | 'critical';
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: 'trip' | 'truck' | 'employee';
}

export default function OperatorHome() {
  const { user } = useAuth();
  const { colors, isDarkMode } = useThemeContext();
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    completedTrips: 0,
    activeEmployees: 0,
    inProgressTrips: 0,
    activeTodayTrips: 0,
    scheduledTodayTrips: 0,
    delayedTodayTrips: 0,
    availableTrucks: 0,
  });
  const [financial, setFinancial] = useState<FinancialSummary>({
    tripIncome: 0,
    expenses: 0,
    profit: 0,
    profitPercentage: 0,
  });
  const [activeTrips, setActiveTrips] = useState<Trip[]>([]);
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const loadDashboardData = async () => {
    try {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Load all data in parallel
      await Promise.all([
        loadStatistics(),
        loadFinancialData(),
        loadActiveTrips(),
        loadUrgentAlerts(),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStatistics = async () => {
    try {
      // Get today's date in Manila timezone
      const today = new Date().toLocaleDateString('en-CA', {
        timeZone: 'Asia/Manila',
      });

      // Load trip stats
      const tripStatsResponse = await getTripStats();
      const tripStats = tripStatsResponse.data || {
        total_trips: 0,
        completed_trips: 0,
        in_progress_trips: 0,
        scheduled_trips: 0,
        delayed_trips: 0,
      };

      // Load today's trips
      const todayTripsResponse = await getTrips(
        { delivery_date_from: today, delivery_date_to: today },
        1,
        100
      );
      const todayTrips = todayTripsResponse.data?.data || [];
      
      const activeTodayTrips = todayTrips.filter(t => 
        [TripStatus.IN_TRANSIT, TripStatus.LOADING, TripStatus.DISPATCHED, TripStatus.AT_WAREHOUSE].includes(t.status)
      ).length;
      
      const scheduledTodayTrips = todayTrips.filter(t => 
        [TripStatus.SCHEDULED, TripStatus.ASSIGNED, TripStatus.ACKNOWLEDGED].includes(t.status)
      ).length;
      
      const delayedTodayTrips = todayTrips.filter(t => 
        t.status === TripStatus.DELAYED
      ).length;

      // Load trucks
      const trucksResponse = await getTrucks({}, 1, 100);
      const trucks = trucksResponse.data?.data || [];
      const availableTrucks = trucks.filter(t => 
        t.is_active && t.status === TruckStatus.AVAILABLE
      ).length;

      // Load employees
      const employeesResponse = await getEmployees({}, 1, 100);
      const employees = employeesResponse.data?.data || [];
      const activeEmployees = employees.filter(e => 
        e.is_active && e.employment_status === EmploymentStatus.ACTIVE
      ).length;

      setStats({
        totalTrips: tripStats.total_trips,
        completedTrips: tripStats.completed_trips,
        activeEmployees,
        inProgressTrips: tripStats.in_progress_trips,
        activeTodayTrips,
        scheduledTodayTrips,
        delayedTodayTrips,
        availableTrucks,
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const loadFinancialData = async () => {
    try {
      // Get this week's date range (Monday to Sunday) in Manila timezone
      const now = new Date();
      const manilaDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
      
      const dayOfWeek = manilaDate.getDay();
      const monday = new Date(manilaDate);
      monday.setDate(manilaDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const dateFrom = monday.toISOString().split('T')[0];
      const dateTo = sunday.toISOString().split('T')[0];

      // Get approved expenses for the week
      const expensesResponse = await getExpensesSummary(dateFrom, dateTo);
      const approvedExpenses = expensesResponse.data?.approved_total || 0;

      // Get completed trips income for the week
      const tripsResponse = await getTrips(
        { 
          delivery_date_from: dateFrom, 
          delivery_date_to: dateTo,
          status: TripStatus.COMPLETED,
        },
        1,
        1000
      );
      
      const trips = tripsResponse.data?.data || [];
      const tripIncome = trips.reduce((sum, trip) => sum + (trip.actual_income || trip.expected_income || 0), 0);

      // Calculate profit
      const profit = tripIncome - approvedExpenses;
      const profitPercentage = tripIncome > 0 ? Math.round((profit / tripIncome) * 100) : 0;

      setFinancial({
        tripIncome,
        expenses: approvedExpenses,
        profit,
        profitPercentage: Math.max(0, Math.min(100, profitPercentage)),
      });
    } catch (error) {
      console.error('Failed to load financial data:', error);
    }
  };

  const loadActiveTrips = async () => {
    try {
      const response = await getTrips(
        { 
          status: TripStatus.IN_TRANSIT,
        },
        1,
        50
      );
      
      let trips = response.data?.data || [];
      
      // If no in-transit trips, get scheduled trips
      if (trips.length === 0) {
        const scheduledResponse = await getTrips(
          { 
            status: TripStatus.SCHEDULED,
          },
          1,
          50
        );
        trips = scheduledResponse.data?.data || [];
      }

      setActiveTrips(trips.slice(0, 5));
    } catch (error) {
      console.error('Failed to load active trips:', error);
    }
  };

  const loadUrgentAlerts = async () => {
    try {
      const alerts: UrgentAlert[] = [];

      // Check for delayed trips
      const delayedResponse = await getTrips({ status: TripStatus.DELAYED }, 1, 10);
      const delayedTrips = delayedResponse.data?.data || [];
      
      delayedTrips.forEach(trip => {
        alerts.push({
          id: `delayed-${trip.id}`,
          type: 'warning',
          title: 'Delayed Trip',
          message: `${trip.trip_number} is running behind schedule`,
          relatedId: trip.id,
          relatedType: 'trip',
        });
      });

      // Check for trucks needing maintenance
      const trucksResponse = await getTrucks({}, 1, 100);
      const trucks = trucksResponse.data?.data || [];
      const maintenanceTrucks = trucks.filter(t => t.status === TruckStatus.UNDER_MAINTENANCE);
      
      maintenanceTrucks.forEach(truck => {
        alerts.push({
          id: `maintenance-${truck.id}`,
          type: 'critical',
          title: 'Truck Maintenance Due',
          message: `${truck.truck_number} preventive maintenance is required`,
          relatedId: truck.id,
          relatedType: 'truck',
        });
      });

      // Sort: critical first, then warnings
      alerts.sort((a, b) => {
        if (a.type === 'critical' && b.type === 'warning') return -1;
        if (a.type === 'warning' && b.type === 'critical') return 1;
        return 0;
      });

      setUrgentAlerts(alerts.slice(0, 5));
    } catch (error) {
      console.error('Failed to load urgent alerts:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTripRoute = (trip: Trip) => {
    const origin = (trip as any).pickup_location || (trip as any).pickup_warehouse || (trip as any).origin || 'Depot';
    const dest = (trip as any).delivery_destination || (trip as any).destination || 'Delivery';
    return `${origin} → ${dest}`;
  };

  const formatDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return 'Today';
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return timeStr ? `${dateFormatted}, ${timeStr}` : dateFormatted;
  };

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case TripStatus.IN_TRANSIT:
        return { bg: isDarkMode ? '#1E3A5F' : '#F0F9FF', text: '#0EA5E9' };
      case TripStatus.SCHEDULED:
        return { bg: isDarkMode ? '#1E293B' : '#F1F5F9', text: '#64748B' };
      case TripStatus.COMPLETED:
        return { bg: isDarkMode ? '#064E3B' : '#ECFDF5', text: '#10B981' };
      case TripStatus.DELAYED:
        return { bg: isDarkMode ? '#451A1A' : '#FEF2F2', text: '#EF4444' };
      default:
        return { bg: isDarkMode ? '#1E293B' : '#F1F5F9', text: '#64748B' };
    }
  };

  const getStatusLabel = (status: TripStatus) => {
    switch (status) {
      case TripStatus.IN_TRANSIT:
        return 'In Transit';
      case TripStatus.SCHEDULED:
        return 'Scheduled';
      case TripStatus.DELAYED:
        return 'Delayed';
      case TripStatus.COMPLETED:
        return 'Completed';
      default:
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const handleAlertPress = (alert: UrgentAlert) => {
    if (alert.relatedType === 'trip' && alert.relatedId) {
      router.push(`/(operator)/trips/${alert.relatedId}`);
    } else if (alert.relatedType === 'truck' && alert.relatedId) {
      router.push(`/(operator)/trucks/${alert.relatedId}`);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0EA5E9']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Modern Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarCapsule}>
                <Text style={styles.avatarLetter}>
                  {(user?.user_metadata?.first_name || 'Admin')[0].toUpperCase()}
                </Text>
                <View style={[styles.onlineDot, { borderColor: colors.surface }]} />
              </View>
              <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>{getGreeting()},</Text>
                <Text style={[styles.username, { color: colors.text }]}>
                  {user?.user_metadata?.first_name || 'Operator'}
                </Text>
              </View>
            </View>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
              <Text style={[styles.date, { color: colors.textSecondary }]}>{getFormattedDate()}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}
            onPress={() => router.push('/(operator)/profile')}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="View notifications"
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Analytics KPI Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>FLEET OVERVIEW</Text>
            <TouchableOpacity 
              onPress={() => router.push('/(operator)/analytics')} 
              activeOpacity={0.7}
              style={styles.viewAnalyticsLink}
            >
              <Text style={styles.viewAnalyticsText}>Full Report</Text>
              <Ionicons name="arrow-forward" size={13} color="#0EA5E9" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsRow}>
              <TouchableOpacity
                style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.75}
              >
                <View style={styles.kpiTopRow}>
                  <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1E3A5F' : '#F0F9FF' }]}>
                    <Ionicons name="navigate" size={20} color="#0EA5E9" />
                  </View>
                  <View style={[styles.trendPill, { backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5' }]}>
                    <Ionicons name="trending-up" size={11} color="#10B981" />
                    <Text style={styles.trendText}>Live</Text>
                  </View>
                </View>
                <Text style={[styles.analyticsValue, { color: colors.text }]}>{stats.totalTrips}</Text>
                <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Total Trips</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.75}
              >
                <View style={styles.kpiTopRow}>
                  <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5' }]}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                  <View style={[styles.trendPill, { backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5' }]}>
                    <Text style={[styles.trendText, { color: '#10B981' }]}>Done</Text>
                  </View>
                </View>
                <Text style={[styles.analyticsValue, { color: colors.text }]}>{stats.completedTrips}</Text>
                <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Completed</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.analyticsRow}>
              <TouchableOpacity
                style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/(operator)/employees')}
                activeOpacity={0.75}
              >
                <View style={styles.kpiTopRow}>
                  <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                    <Ionicons name="people" size={20} color="#3B82F6" />
                  </View>
                  <View style={[styles.trendPill, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                    <Text style={[styles.trendText, { color: '#38BDF8' }]}>Active</Text>
                  </View>
                </View>
                <Text style={[styles.analyticsValue, { color: colors.text }]}>{stats.activeEmployees}</Text>
                <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Staff Active</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.analyticsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/(operator)/trucks')}
                activeOpacity={0.75}
              >
                <View style={styles.kpiTopRow}>
                  <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#3B2A10' : '#FFFBEB' }]}>
                    <Ionicons name="car" size={20} color="#F59E0B" />
                  </View>
                  <View style={[styles.trendPill, { backgroundColor: isDarkMode ? '#3B2A10' : '#FFFBEB' }]}>
                    <Text style={[styles.trendText, { color: '#F59E0B' }]}>Ready</Text>
                  </View>
                </View>
                <Text style={[styles.analyticsValue, { color: colors.text }]}>{stats.availableTrucks}</Text>
                <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Available Trucks</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3. Urgent Operational Alerts */}
        {urgentAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>OPERATIONAL ALERTS</Text>
            {urgentAlerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: alert.type === 'warning' 
                      ? (isDarkMode ? '#2D2008' : '#FFFBEB') 
                      : (isDarkMode ? '#331111' : '#FEF2F2'),
                    borderColor: alert.type === 'warning' 
                      ? (isDarkMode ? '#5C4010' : '#FDE68A') 
                      : (isDarkMode ? '#5C1D1D' : '#FECACA'),
                  },
                ]}
                onPress={() => handleAlertPress(alert)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.alertIcon,
                  { backgroundColor: alert.type === 'warning' ? '#F59E0B' : '#EF4444' },
                ]}>
                  <Ionicons 
                    name={alert.type === 'warning' ? 'alert-circle' : 'close-circle'} 
                    size={16} 
                    color="#FFFFFF" 
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text style={[
                    styles.alertTitle,
                    { color: alert.type === 'warning' ? (isDarkMode ? '#FCD34D' : '#92400E') : (isDarkMode ? '#FCA5A5' : '#991B1B') },
                  ]}>
                    {alert.title}
                  </Text>
                  <Text style={[
                    styles.alertMessage,
                    { color: alert.type === 'warning' ? (isDarkMode ? '#FBBF24' : '#78350F') : (isDarkMode ? '#F87171' : '#7F1D1D') }
                  ]} numberOfLines={1}>
                    {alert.message}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 4. Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>QUICK ACTIONS</Text>

          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.primaryActionPill}
              onPress={() => router.push('/(operator)/trips/add')}
              activeOpacity={0.85}
            >
              <View style={styles.primaryActionIconBg}>
                <Ionicons name="add" size={20} color="#0F1E36" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.primaryActionTitle}>New Trip Dispatch</Text>
                <Text style={styles.primaryActionSub}>Assign driver and schedule cargo</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.secondaryGridRow}>
              <TouchableOpacity
                style={[styles.secondaryActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/(operator)/trucks')}
                activeOpacity={0.75}
              >
                <View style={[styles.secIconWrap, { backgroundColor: isDarkMode ? '#1E3A5F' : '#F0F9FF' }]}>
                  <Ionicons name="car-outline" size={20} color="#0EA5E9" />
                </View>
                <Text style={[styles.secActionText, { color: colors.text }]}>Manage Fleet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/(operator)/employees')}
                activeOpacity={0.75}
              >
                <View style={[styles.secIconWrap, { backgroundColor: isDarkMode ? '#1E3A5F' : '#EFF6FF' }]}>
                  <Ionicons name="people-outline" size={20} color="#3B82F6" />
                </View>
                <Text style={[styles.secActionText, { color: colors.text }]}>Staff Directory</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryActionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push('/record-expense')}
                activeOpacity={0.75}
              >
                <View style={[styles.secIconWrap, { backgroundColor: isDarkMode ? '#3B2A10' : '#FFFBEB' }]}>
                  <Ionicons name="receipt-outline" size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.secActionText, { color: colors.text }]}>Record Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. Live Trips Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>LIVE TRIP ACTIVITY</Text>
            <TouchableOpacity 
              onPress={() => router.push('/(operator)/trips')} 
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {activeTrips.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                <Ionicons name="navigate-outline" size={28} color="#94A3B8" />
              </View>
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Active Dispatches</Text>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>All trucks are currently parked or idle.</Text>
            </View>
          ) : (
            activeTrips.map((trip) => {
              const statusColors = getStatusColor(trip.status);
              return (
                <TouchableOpacity
                  key={trip.id}
                  style={[styles.tripCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => router.push(`/(operator)/trips/${trip.id}`)}
                  activeOpacity={0.75}
                >
                  <View style={styles.tripCardTop}>
                    <View style={[styles.tripBadgePill, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                      <Ionicons name="car-outline" size={14} color="#0EA5E9" />
                      <Text style={[styles.tripNumber, { color: colors.text }]}>{trip.trip_number}</Text>
                    </View>
                    <View style={[styles.tripStatusBadge, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.tripStatusText, { color: statusColors.text }]}>
                        {getStatusLabel(trip.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tripRouteRow}>
                    <View style={styles.routeDotsCol}>
                      <View style={styles.dotOrigin} />
                      <View style={styles.dotLine} />
                      <View style={styles.dotDest} />
                    </View>
                    <Text style={[styles.tripRouteText, { color: colors.text }]} numberOfLines={1}>
                      {formatTripRoute(trip)}
                    </Text>
                  </View>

                  <View style={styles.tripMetaRow}>
                    <View style={[styles.metaChip, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                      <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                      <Text style={[styles.tripMetaText, { color: colors.textSecondary }]}>
                        {formatDateTime(trip.delivery_date, trip.call_time)}
                      </Text>
                    </View>
                    {trip.assigned_truck_number && (
                      <View style={[styles.metaChip, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                        <Ionicons name="car-outline" size={12} color={colors.textSecondary} />
                        <Text style={[styles.tripMetaText, { color: colors.textSecondary }]}>{trip.assigned_truck_number}</Text>
                      </View>
                    )}
                    {trip.assigned_driver_name && (
                      <View style={[styles.metaChip, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC' }]}>
                        <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                        <Text style={[styles.tripMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
                          {trip.assigned_driver_name}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* 6. This Week Financial Summary */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>WEEKLY FINANCIAL OVERVIEW</Text>

          <TouchableOpacity
            style={[styles.financialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/(operator)/analytics')}
            activeOpacity={0.75}
          >
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Total Revenue</Text>
                <Text style={[styles.financialValue, { color: '#10B981' }]}>
                  {formatPhilippinePeso(financial.tripIncome)}
                </Text>
              </View>
              <View style={[styles.financialDivider, { backgroundColor: colors.border }]} />
              <View style={styles.financialItem}>
                <Text style={[styles.financialLabel, { color: colors.textSecondary }]}>Operating Expenses</Text>
                <Text style={[styles.financialValue, { color: '#EF4444' }]}>
                  {formatPhilippinePeso(financial.expenses)}
                </Text>
              </View>
            </View>

            <View style={[styles.financialDividerHorizontal, { backgroundColor: colors.border }]} />

            <View style={styles.profitSection}>
              <View style={styles.profitHeader}>
                <Text style={[styles.profitLabel, { color: colors.textSecondary }]}>Net Margin & Profit</Text>
                <View style={styles.profitBadgePill}>
                  <Text style={styles.profitPercentageText}>{financial.profitPercentage}% Margin</Text>
                </View>
              </View>
              <Text style={[styles.profitValue, { color: financial.profit >= 0 ? colors.text : '#EF4444' }]}>
                {formatPhilippinePeso(financial.profit)}
              </Text>
              <View style={[styles.profitBar, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }]}>
                <View
                  style={[
                    styles.profitBarFill,
                    {
                      width: `${financial.profitPercentage}%`,
                      backgroundColor: financial.profitPercentage >= 50 ? '#10B981' : '#F59E0B',
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flex: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  avatarCapsule: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#0F1E36',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  greeting: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Sections
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  lastSection: {
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAnalyticsLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAnalyticsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0EA5E9',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0EA5E9',
  },

  // Analytics KPI Overview
  analyticsGrid: {
    gap: 10,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    minHeight: 110,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F1E36',
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  analyticsLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },

  // Urgent Alerts
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  alertBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  alertIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 12,
  },

  // Quick Actions Grid
  quickActionsGrid: {
    marginTop: 10,
    gap: 10,
  },
  primaryActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1E36',
    borderRadius: 18,
    padding: 16,
    gap: 14,
    shadowColor: '#0F1E36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryActionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryActionSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  secondaryGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  secIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  secActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },

  // Live Trips Activity
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
  },
  tripCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tripBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tripNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F1E36',
  },
  tripStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tripStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tripRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  routeDotsCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 10,
  },
  dotOrigin: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  dotLine: {
    width: 1.5,
    height: 8,
    backgroundColor: '#CBD5E1',
    marginVertical: 1,
  },
  dotDest: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0EA5E9',
  },
  tripRouteText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  tripMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tripMetaText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  emptyStateText: {
    fontSize: 12,
    color: '#64748B',
  },

  // Financial Card
  financialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialItem: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 3,
  },
  financialValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  financialDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  financialDividerHorizontal: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  profitSection: {
    marginTop: 0,
  },
  profitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  profitLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  profitBadgePill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  profitPercentageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  profitValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  profitBar: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  profitBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

