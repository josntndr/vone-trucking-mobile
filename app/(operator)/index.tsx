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

      setActiveTrips(trips.slice(0, 5)); // Show max 5 trips
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

      // Check for trucks needing maintenance (basic check - would need maintenance tracking in production)
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

      setUrgentAlerts(alerts.slice(0, 5)); // Show max 5 alerts
    } catch (error) {
      console.error('Failed to load urgent alerts:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        loadDashboardData();
      }
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFormattedDate = () => {
    const now = new Date();
    const manilaDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    return manilaDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'Asia/Manila',
    });
  };

  const formatTripRoute = (trip: Trip) => {
    const pickup = trip.pickup_warehouse || trip.pickup_location || 'Unknown';
    const destination = trip.delivery_destination || 'Unknown';
    return `${pickup} → ${destination}`;
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case TripStatus.IN_TRANSIT:
      case TripStatus.DISPATCHED:
        return { bg: COLORS.statusOnTrip, text: COLORS.teal };
      case TripStatus.SCHEDULED:
      case TripStatus.ASSIGNED:
        return { bg: COLORS.statusScheduled, text: COLORS.textMuted };
      case TripStatus.DELAYED:
        return { bg: COLORS.statusDelayed, text: COLORS.warning };
      case TripStatus.COMPLETED:
        return { bg: COLORS.statusAvailable, text: COLORS.success };
      case TripStatus.CANCELLED:
        return { bg: COLORS.alertErrorBg, text: COLORS.error };
      default:
        return { bg: COLORS.statusScheduled, text: COLORS.textMuted };
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
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.navy]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Compact Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.username}>
              {user?.user_metadata?.first_name || 'System'}
            </Text>
            <Text style={styles.date}>{getFormattedDate()}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(operator)/profile')}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="View notifications"
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.navy} />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 2. Analytics Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>ANALYTICS OVERVIEW</Text>
            <TouchableOpacity 
              onPress={() => router.push('/(operator)/analytics')} 
              activeOpacity={0.7}
              style={styles.viewAnalyticsLink}
            >
              <Text style={styles.viewAnalyticsText}>View Full Analytics</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.teal} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsRow}>
              <TouchableOpacity
                style={styles.analyticsCard}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: DS.helpers.getIconBackground('teal') }]}>
                  <Ionicons name="navigate" size={22} color={DS.helpers.getIconColor('teal')} />
                </View>
                <Text style={styles.analyticsValue}>{stats.totalTrips}</Text>
                <Text style={styles.analyticsLabel}>Total Trips</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.analyticsCard}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: DS.helpers.getIconBackground('green') }]}>
                  <Ionicons name="checkmark-circle" size={22} color={DS.helpers.getIconColor('green')} />
                </View>
                <Text style={styles.analyticsValue}>{stats.completedTrips}</Text>
                <Text style={styles.analyticsLabel}>Completed</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.analyticsRow}>
              <TouchableOpacity
                style={styles.analyticsCard}
                onPress={() => router.push('/(operator)/employees')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: DS.helpers.getIconBackground('navy') }]}>
                  <Ionicons name="people" size={22} color={DS.helpers.getIconColor('navy')} />
                </View>
                <Text style={styles.analyticsValue}>{stats.activeEmployees}</Text>
                <Text style={styles.analyticsLabel}>Active Employees</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.analyticsCard}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircle, { backgroundColor: DS.helpers.getIconBackground('orange') }]}>
                  <Ionicons name="sync" size={22} color={DS.helpers.getIconColor('orange')} />
                </View>
                <Text style={styles.analyticsValue}>{stats.inProgressTrips}</Text>
                <Text style={styles.analyticsLabel}>In Progress</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 3. Urgent Alerts */}
        {urgentAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.alertsHeader}>
              <Text style={styles.sectionLabel}>URGENT ALERTS</Text>
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{urgentAlerts.length}</Text>
              </View>
            </View>

            {urgentAlerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: alert.type === 'warning' ? COLORS.alertWarningBg : COLORS.alertErrorBg,
                    borderLeftColor: alert.type === 'warning' ? COLORS.warning : COLORS.error,
                  },
                ]}
                onPress={() => handleAlertPress(alert)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.alertIcon,
                  { backgroundColor: alert.type === 'warning' ? COLORS.warning : COLORS.error },
                ]}>
                  <Ionicons 
                    name={alert.type === 'warning' ? 'alert-circle' : 'close-circle'} 
                    size={18} 
                    color={COLORS.white} 
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text style={[
                    styles.alertTitle,
                    { color: alert.type === 'warning' ? COLORS.warning : COLORS.error },
                  ]}>
                    {alert.title}
                  </Text>
                  <Text style={styles.alertMessage} numberOfLines={1}>
                    {alert.message}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 4. Today's Operations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>TODAY'S OPERATIONS</Text>
            <TouchableOpacity 
              onPress={() => router.push('/(operator)/trips')} 
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.operationsGrid}>
            <View style={styles.operationsRow}>
              <TouchableOpacity
                style={styles.operationCard}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircleSmall, { backgroundColor: DS.helpers.getIconBackground('teal') }]}>
                  <Ionicons name="navigate" size={18} color={DS.helpers.getIconColor('teal')} />
                </View>
                <Text style={styles.operationValue}>{stats.activeTodayTrips}</Text>
                <Text style={styles.operationLabel}>Active Trips</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.operationCard}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircleSmall, { backgroundColor: DS.helpers.getIconBackground('navy') }]}>
                  <Ionicons name="calendar" size={18} color={DS.helpers.getIconColor('navy')} />
                </View>
                <Text style={styles.operationValue}>{stats.scheduledTodayTrips}</Text>
                <Text style={styles.operationLabel}>Scheduled</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.operationsRow}>
              <TouchableOpacity
                style={styles.operationCard}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircleSmall, { backgroundColor: DS.helpers.getIconBackground('orange') }]}>
                  <Ionicons name="alert-circle" size={18} color={DS.helpers.getIconColor('orange')} />
                </View>
                <Text style={styles.operationValue}>{stats.delayedTodayTrips}</Text>
                <Text style={styles.operationLabel}>Delayed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.operationCard}
                onPress={() => router.push('/(operator)/trucks')}
                activeOpacity={0.7}
              >
                <View style={[styles.iconCircleSmall, { backgroundColor: DS.helpers.getIconBackground('green') }]}>
                  <Ionicons name="car" size={18} color={DS.helpers.getIconColor('green')} />
                </View>
                <Text style={styles.operationValue}>{stats.availableTrucks}</Text>
                <Text style={styles.operationLabel}>Available Trucks</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 5. Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>

          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => router.push('/(operator)/trips/add')}
            activeOpacity={0.8}
            accessible={true}
            accessibilityLabel="Create new trip"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={22} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.primaryActionText}>Create Trip</Text>
          </TouchableOpacity>

          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => router.push('/(operator)/import')}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Import schedule"
              accessibilityRole="button"
            >
              <Ionicons name="cloud-upload-outline" size={20} color={COLORS.navy} />
              <Text style={styles.secondaryActionText}>Import Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              onPress={() => router.push('/(operator)/trucks')}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Track fleet"
              accessibilityRole="button"
            >
              <Ionicons name="location-outline" size={20} color={COLORS.navy} />
              <Text style={styles.secondaryActionText}>Track Fleet</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.secondaryActionButtonFull}
            onPress={() => router.push('/record-expense')}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="Record expense"
            accessibilityRole="button"
          >
            <Ionicons name="receipt-outline" size={20} color={COLORS.navy} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryActionText}>Record Expense</Text>
          </TouchableOpacity>
        </View>

        {/* 6. Active Trips */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVE TRIPS</Text>

          {activeTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="navigate-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyStateText}>No active trips</Text>
            </View>
          ) : (
            activeTrips.map((trip) => {
              const statusColors = getStatusColor(trip.status);
              return (
                <TouchableOpacity
                  key={trip.id}
                  style={styles.tripCard}
                  onPress={() => router.push(`/(operator)/trips/${trip.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.tripIconCircle}>
                    <Ionicons name="navigate" size={18} color={COLORS.white} />
                  </View>
                  <View style={styles.tripContent}>
                    <View style={styles.tripHeader}>
                      <Text style={styles.tripNumber}>{trip.trip_number}</Text>
                      <View style={[styles.tripStatusBadge, { backgroundColor: statusColors.bg }]}>
                        <Text style={[styles.tripStatusText, { color: statusColors.text }]}>
                          {getStatusLabel(trip.status)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.tripRoute}>
                      <Ionicons name="location" size={12} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                      <Text style={styles.tripRouteText} numberOfLines={1}>
                        {formatTripRoute(trip)}
                      </Text>
                    </View>
                    <View style={styles.tripMeta}>
                      <View style={styles.tripMetaItem}>
                        <Ionicons name="calendar-outline" size={11} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                        <Text style={styles.tripMetaText}>
                          {formatDateTime(trip.delivery_date, trip.call_time)}
                        </Text>
                      </View>
                      {trip.assigned_truck_number && (
                        <View style={styles.tripMetaItem}>
                          <Ionicons name="car-outline" size={11} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                          <Text style={styles.tripMetaText}>{trip.assigned_truck_number}</Text>
                        </View>
                      )}
                      {trip.assigned_driver_name && (
                        <View style={styles.tripMetaItem}>
                          <Ionicons name="person-outline" size={11} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                          <Text style={styles.tripMetaText} numberOfLines={1}>
                            {trip.assigned_driver_name}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* 7. This Week Financial Summary */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionLabel}>THIS WEEK</Text>

          <TouchableOpacity
            style={styles.financialCard}
            onPress={() => router.push('/(operator)/analytics')}
            activeOpacity={0.7}
          >
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>Trip Income</Text>
                <Text style={[styles.financialValue, { color: COLORS.success }]}>
                  {formatPhilippinePeso(financial.tripIncome)}
                </Text>
              </View>
              <View style={styles.financialDivider} />
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>Expenses</Text>
                <Text style={[styles.financialValue, { color: COLORS.error }]}>
                  {formatPhilippinePeso(financial.expenses)}
                </Text>
              </View>
            </View>

            <View style={styles.financialDividerHorizontal} />

            <View style={styles.profitSection}>
              <View style={styles.profitHeader}>
                <Text style={styles.profitLabel}>Estimated Profit</Text>
                <Text style={styles.profitPercentage}>{financial.profitPercentage}%</Text>
              </View>
              <Text style={[styles.profitValue, { color: financial.profit >= 0 ? COLORS.navy : COLORS.error }]}>
                {formatPhilippinePeso(financial.profit)}
              </Text>
              <View style={styles.profitBar}>
                <View
                  style={[
                    styles.profitBarFill,
                    {
                      width: `${financial.profitPercentage}%`,
                      backgroundColor: financial.profitPercentage >= 50 ? COLORS.success : COLORS.warning,
                    },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: SPACING.lg, // 20px space for bottom navigation
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.base,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.orange,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Sections
  section: {
    paddingHorizontal: SPACING.base,
    marginTop: SPACING.lg,
  },
  lastSection: {
    marginBottom: 0, // No extra margin - scrollContent paddingBottom handles it
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAnalyticsLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAnalyticsText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.teal,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.teal,
  },

  // Analytics Overview
  analyticsGrid: {
    gap: SPACING.sm,
  },
  analyticsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: DS.borderRadius.lg,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 120,
    ...DS.shadows.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  analyticsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Urgent Alerts
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  alertBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  alertBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.alertWarningBg,
    borderRadius: DS.borderRadius.base,
    borderLeftWidth: 4,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Today's Operations
  operationsGrid: {
    gap: SPACING.sm,
  },
  operationsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  operationCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: DS.borderRadius.base,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: 100,
    ...DS.shadows.sm,
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  operationValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  operationLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },

  // Quick Actions
  primaryActionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.navy,
    borderRadius: DS.borderRadius.md,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.lg,
    minHeight: 52,
    marginBottom: SPACING.sm,
    ...DS.shadows.sm,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  secondaryActionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: DS.borderRadius.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    ...DS.shadows.sm,
  },
  secondaryActionButtonFull: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: DS.borderRadius.md,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.lg,
    minHeight: 52,
    ...DS.shadows.sm,
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navy,
    textAlign: 'center',
  },

  // Active Trips
  tripCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: DS.borderRadius.base,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...DS.shadows.sm,
  },
  tripIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  tripContent: {
    flex: 1,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tripNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },
  tripStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tripStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tripRouteText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  tripMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  tripMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripMetaText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.base,
  },
  emptyStateText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },

  // Financial Card
  financialCard: {
    backgroundColor: COLORS.white,
    borderRadius: DS.borderRadius.lg,
    padding: SPACING.base,
    ...DS.shadows.sm,
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
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  financialDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.md,
  },
  financialDividerHorizontal: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.base,
  },
  profitSection: {
    marginTop: SPACING.xs,
  },
  profitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  profitLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  profitPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  profitValue: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  profitBar: {
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  profitBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
