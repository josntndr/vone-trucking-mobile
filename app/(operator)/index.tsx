/**
 * Operator Home Screen - Redesigned v2.0
 * Modern premium design with new design system
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks';
import { getTrucks } from '../../src/services/api/truck.service';
import { getEmployees } from '../../src/services/api/employee.service';
import { getExpensesSummary } from '../../src/services/api/expense.service';
import { isSupabaseConfigured } from '../../src/services/api/supabase';
import { TruckStatus } from '../../src/types/truck.types';
import { EmploymentStatus, UserRole } from '../../src/types';
import { DESIGN_SYSTEM, COLORS, SPACING, COMPONENTS } from '../../src/theme/designSystem';
import { formatPhilippinePeso } from '../../src/utils/philippines';

const DS = DESIGN_SYSTEM;

interface DashboardStats {
  totalTrucks: number;
  availableTrucks: number;
  onTripTrucks: number;
  maintenanceTrucks: number;
  totalEmployees: number;
  activeDrivers: number;
  activePorters: number;
}

interface FinancialSummary {
  tripIncome: number;
  expenses: number;
  profit: number;
  profitPercentage: number;
}

// Demo data
const DEMO_TODAY_TRIPS = [
  {
    id: '1',
    tripNumber: 'VT-2024-001',
    destination: 'Manila - Quezon City',
    callTime: '08/25/2026 11:25 PM',
    truckNumber: 'ABC-1234',
    driverName: 'Juan Dela Cruz',
    status: 'In Transit',
  },
  {
    id: '2',
    tripNumber: 'VT-2024-002',
    destination: 'Manila - Makati',
    callTime: '08/25/2026 11:25 PM',
    truckNumber: 'XYZ-5678',
    driverName: 'Maria Santos',
    status: 'Scheduled',
  },
];

const DEMO_ALERTS = [
  {
    id: '1',
    type: 'warning' as const,
    title: 'Delayed Trip',
    message: 'VT-2024-001 is running 30 minutes behind schedule',
  },
  {
    id: '2',
    type: 'error' as const,
    title: 'Truck Maintenance Due',
    message: 'ABC-1234 preventive maintenance is overdue',
  },
];

const DEMO_STATS: DashboardStats = {
  totalTrucks: 5,
  availableTrucks: 2,
  onTripTrucks: 2,
  maintenanceTrucks: 1,
  totalEmployees: 12,
  activeDrivers: 8,
  activePorters: 4,
};

export default function OperatorHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(DEMO_STATS);
  const [financial, setFinancial] = useState<FinancialSummary>({
    tripIncome: 125500,
    expenses: 45200,
    profit: 80300,
    profitPercentage: 64,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      if (!isSupabaseConfigured()) {
        setStats(DEMO_STATS);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Load trucks data
      const trucksResponse = await getTrucks({}, 1, 100);
      const trucks = trucksResponse.data?.data || [];
      
      // Load employees data
      const employeesResponse = await getEmployees({}, 1, 100);
      const employees = employeesResponse.data?.data || [];

      setStats({
        totalTrucks: trucks.filter(t => t.is_active).length,
        availableTrucks: trucks.filter(t => t.status === TruckStatus.AVAILABLE).length,
        onTripTrucks: trucks.filter(t => t.status === TruckStatus.ON_TRIP).length,
        maintenanceTrucks: trucks.filter(t => t.status === TruckStatus.UNDER_MAINTENANCE).length,
        totalEmployees: employees.filter(e => e.is_active).length,
        activeDrivers: employees.filter(
          e => e.role === UserRole.DRIVER && e.employment_status === EmploymentStatus.ACTIVE
        ).length,
        activePorters: employees.filter(
          e => e.role === UserRole.PORTER && e.employment_status === EmploymentStatus.ACTIVE
        ).length,
      });

      // Load financial data (this week)
      await loadFinancialData();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setStats(DEMO_STATS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFinancialData = async () => {
    try {
      // Get date range for this week (Monday to Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const dateFrom = monday.toISOString().split('T')[0];
      const dateTo = sunday.toISOString().split('T')[0];

      // Get expense summary for the week (approved expenses only)
      const expensesResponse = await getExpensesSummary(dateFrom, dateTo);
      
      // Demo trip income (would come from trips service in production)
      // TODO: Implement getTripIncomeSummary() in trip service
      const tripIncome = 125500; // Placeholder
      
      if (expensesResponse.data) {
        const approvedExpenses = expensesResponse.data.approved_total;
        const profit = tripIncome - approvedExpenses;
        const profitPercentage = tripIncome > 0 ? Math.round((profit / tripIncome) * 100) : 0;

        setFinancial({
          tripIncome,
          expenses: approvedExpenses,
          profit,
          profitPercentage,
        });
      }
    } catch (error) {
      console.error('Failed to load financial data:', error);
      // Keep demo data on error
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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

  const getDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.navy]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Greeting */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.username}>
                {user?.user_metadata?.first_name || 'System'}
              </Text>
              <Text style={styles.date}>{getDate()}</Text>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/(operator)/profile')}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.navy} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>2</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analytics Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ANALYTICS OVERVIEW</Text>
          <View style={styles.grid2x2}>
            {/* Row 1 */}
            <View style={styles.gridRow}>
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.7}
              >
                <View style={[styles.card, styles.statCard]}>
                  <View style={[styles.iconContainer, { backgroundColor: DS.helpers.getIconBackground('teal') }]}>
                    <Ionicons name="navigate" size={24} color={DS.helpers.getIconColor('teal')} />
                  </View>
                  <Text style={styles.statNumber}>45</Text>
                  <Text style={styles.statLabel}>Total Trips</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/analytics')}
                activeOpacity={0.7}
              >
                <View style={[styles.card, styles.statCard]}>
                  <View style={[styles.iconContainer, { backgroundColor: DS.helpers.getIconBackground('green') }]}>
                    <Ionicons name="checkmark-circle" size={24} color={DS.helpers.getIconColor('green')} />
                  </View>
                  <Text style={styles.statNumber}>38</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Row 2 */}
            <View style={styles.gridRow}>
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/employees')}
                activeOpacity={0.7}
              >
                <View style={[styles.card, styles.statCard]}>
                  <View style={[styles.iconContainer, { backgroundColor: DS.helpers.getIconBackground('navy') }]}>
                    <Ionicons name="people" size={24} color={DS.helpers.getIconColor('navy')} />
                  </View>
                  <Text style={styles.statNumber}>{stats.totalEmployees}</Text>
                  <Text style={styles.statLabel}>Active Employees</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.7}
              >
                <View style={[styles.card, styles.statCard]}>
                  <View style={[styles.iconContainer, { backgroundColor: DS.helpers.getIconBackground('orange') }]}>
                    <Ionicons name="sync" size={24} color={DS.helpers.getIconColor('orange')} />
                  </View>
                  <Text style={styles.statNumber}>{stats.onTripTrucks}</Text>
                  <Text style={styles.statLabel}>In Progress</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewAnalyticsLink}
            onPress={() => router.push('/(operator)/analytics')}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAnalyticsText}>View Full Analytics</Text>
            <Ionicons name="arrow-forward" size={16} color={COLORS.teal} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Urgent Alerts */}
        {DEMO_ALERTS.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>URGENT ALERTS</Text>
            {DEMO_ALERTS.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertCard,
                  { 
                    borderLeftColor: alert.type === 'warning' ? COLORS.warning : COLORS.error,
                    backgroundColor: alert.type === 'warning' ? COLORS.alertWarningBg : COLORS.alertErrorBg,
                  }
                ]}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.alertIconContainer,
                  { backgroundColor: alert.type === 'warning' ? COLORS.warning : COLORS.error }
                ]}>
                  <Ionicons 
                    name={alert.type === 'warning' ? 'alert-circle' : 'close-circle'} 
                    size={20} 
                    color={COLORS.white} 
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text style={[
                    styles.alertTitle,
                    { color: alert.type === 'warning' ? COLORS.warning : COLORS.error }
                  ]}>
                    {alert.title}
                  </Text>
                  <Text style={styles.alertMessage} numberOfLines={1}>
                    {alert.message}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Today's Operations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>TODAY'S OPERATIONS</Text>
            <TouchableOpacity onPress={() => router.push('/(operator)/trips')} activeOpacity={0.7}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid2x2}>
            {/* Row 1 */}
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <View style={[styles.card, styles.operationCard]}>
                  <View style={[styles.iconContainerSmall, { backgroundColor: DS.helpers.getIconBackground('teal') }]}>
                    <Ionicons name="navigate" size={20} color={DS.helpers.getIconColor('teal')} />
                  </View>
                  <Text style={[styles.operationNumber, { color: COLORS.teal }]}>{stats.onTripTrucks}</Text>
                  <Text style={styles.operationLabel}>Active Trips</Text>
                </View>
              </View>

              <View style={styles.gridItem}>
                <View style={[styles.card, styles.operationCard]}>
                  <View style={[styles.iconContainerSmall, { backgroundColor: DS.helpers.getIconBackground('navy') }]}>
                    <Ionicons name="calendar" size={20} color={DS.helpers.getIconColor('navy')} />
                  </View>
                  <Text style={[styles.operationNumber, { color: COLORS.navy }]}>3</Text>
                  <Text style={styles.operationLabel}>Scheduled</Text>
                </View>
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <View style={[styles.card, styles.operationCard]}>
                  <View style={[styles.iconContainerSmall, { backgroundColor: DS.helpers.getIconBackground('amber') }]}>
                    <Ionicons name="alert-circle" size={20} color={DS.helpers.getIconColor('amber')} />
                  </View>
                  <Text style={[styles.operationNumber, { color: COLORS.warning }]}>1</Text>
                  <Text style={styles.operationLabel}>Delayed</Text>
                </View>
              </View>

              <View style={styles.gridItem}>
                <View style={[styles.card, styles.operationCard]}>
                  <View style={[styles.iconContainerSmall, { backgroundColor: DS.helpers.getIconBackground('green') }]}>
                    <Ionicons name="car" size={20} color={DS.helpers.getIconColor('green')} />
                  </View>
                  <Text style={[styles.operationNumber, { color: COLORS.success }]}>{stats.availableTrucks}</Text>
                  <Text style={styles.operationLabel}>Available Trucks</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>

          <View style={styles.grid2x2}>
            {/* Row 1 - Create Trip Featured */}
            <View style={styles.gridRow}>
              <TouchableOpacity
                style={[styles.gridItem, { flex: 2 }]}
                onPress={() => router.push('/(operator)/trips/add')}
                activeOpacity={0.8}
              >
                <View style={[styles.card, styles.actionCardPrimary]}>
                  <Ionicons name="add-circle" size={24} color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.actionTextPrimary}>Create Trip</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Row 2 - Other Actions */}
            <View style={styles.gridRow}>
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/import')}
                activeOpacity={0.7}
              >
                <View style={[styles.card, styles.actionCard]}>
                  <Ionicons name="document-text" size={20} color={COLORS.navy} style={{ marginRight: 6 }} />
                  <Text style={styles.actionText}>Import Schedule</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/trucks')}
                activeOpacity={0.7}
              >
                <View style={[styles.card, styles.actionCard]}>
                  <Ionicons name="location" size={20} color={COLORS.navy} style={{ marginRight: 6 }} />
                  <Text style={styles.actionText}>Track Fleet</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Row 3 - Record Expense */}
            <View style={styles.gridRow}>
              <TouchableOpacity
                style={[styles.gridItem, { flex: 2 }]}
                onPress={() => router.push('/record-expense')}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="Record a new expense"
                accessibilityRole="button"
                accessibilityHint="Opens form to record trip or administrative expenses"
              >
                <View style={[styles.card, styles.actionCard]}>
                  <Ionicons name="receipt-outline" size={20} color={COLORS.navy} style={{ marginRight: 6 }} />
                  <Text style={styles.actionText}>Record Expense</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Active Trips */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVE TRIPS</Text>

          {DEMO_TODAY_TRIPS.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <View style={styles.tripIconContainer}>
                <Ionicons name="navigate" size={20} color={COLORS.white} />
              </View>
              <View style={styles.tripContent}>
                <View style={styles.tripHeader}>
                  <Text style={styles.tripId}>{trip.tripNumber}</Text>
                  <View style={[
                    styles.statusBadge,
                    { 
                      backgroundColor: trip.status === 'In Transit' 
                        ? COLORS.statusOnTrip 
                        : COLORS.statusScheduled 
                    }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { 
                        color: trip.status === 'In Transit' 
                          ? COLORS.teal 
                          : COLORS.textMuted 
                      }
                    ]}>
                      {trip.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.tripRoute}>
                  <Ionicons name="location" size={12} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                  <Text style={styles.tripRouteText}>{trip.destination}</Text>
                </View>
                <View style={styles.tripMeta}>
                  <View style={styles.tripMetaItem}>
                    <Ionicons name="calendar" size={11} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.tripMetaText}>{trip.callTime}</Text>
                  </View>
                  <View style={styles.tripMetaItem}>
                    <Ionicons name="car" size={11} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.tripMetaText}>{trip.truckNumber}</Text>
                  </View>
                  <View style={styles.tripMetaItem}>
                    <Ionicons name="person" size={11} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.tripMetaText}>{trip.driverName}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* This Week Financial Summary */}
        <View style={[styles.section, { paddingBottom: SPACING.xl }]}>
          <Text style={styles.sectionLabel}>THIS WEEK</Text>

          <View style={[styles.card, styles.financialCard]}>
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>Trip Income</Text>
                <Text style={[styles.financialValue, { color: COLORS.success }]}>
                  {formatPhilippinePeso(financial.tripIncome)}
                </Text>
              </View>
              <View style={[styles.financialDivider, { backgroundColor: COLORS.divider }]} />
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>Expenses</Text>
                <Text style={[styles.financialValue, { color: COLORS.error }]}>
                  {formatPhilippinePeso(financial.expenses)}
                </Text>
              </View>
            </View>
            
            <View style={[styles.financialProfit, { borderTopColor: COLORS.divider }]}>
              <Text style={styles.financialLabel}>Estimated Profit</Text>
              <Text style={[styles.financialProfitValue, { color: financial.profit >= 0 ? COLORS.navy : COLORS.error }]}>
                {formatPhilippinePeso(financial.profit)}
              </Text>
            </View>

            {/* Profit Progress Bar */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(Math.max(financial.profitPercentage, 0), 100)}%`,
                    backgroundColor: financial.profitPercentage >= 50 ? COLORS.success : COLORS.warning,
                  },
                ]}
              />
            </View>
            <Text style={[styles.profitPercentageText, { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xs }]}>
              {financial.profitPercentage}% profit margin
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING['2xl'],
  },
  
  // Header
  header: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.base,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: DS.typography.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  username: {
    fontSize: DS.typography.fontSize['2xl'],
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.navy,
    marginBottom: 4,
  },
  date: {
    fontSize: DS.typography.fontSize.sm,
    color: COLORS.textMuted,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...DS.shadows.sm,
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
    borderColor: COLORS.background,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.white,
  },
  
  // Section
  section: {
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...COMPONENTS.sectionHeader,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllLink: {
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.teal,
  },
  
  // Card
  card: {
    ...COMPONENTS.card,
  },
  
  // Grid 2x2
  grid2x2: {
    gap: SPACING.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  gridItem: {
    flex: 1,
  },
  
  // Stat Cards (Analytics Overview)
  statCard: {
    alignItems: 'center',
    padding: SPACING.md,
    minHeight: 120,
  },
  iconContainer: {
    ...COMPONENTS.iconContainer,
    marginBottom: SPACING.sm,
  },
  statNumber: {
    ...COMPONENTS.statNumber,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: DS.typography.fontSize.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  viewAnalyticsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: SPACING.md,
  },
  viewAnalyticsText: {
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.teal,
  },
  
  // Alert Cards
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.alertWarningBg,
    borderRadius: DS.borderRadius.base,
    borderLeftWidth: 4,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...DS.shadows.sm,
  },
  alertIconContainer: {
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
    fontSize: DS.typography.fontSize.base,
    fontWeight: DS.typography.fontWeight.bold,
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: DS.typography.fontSize.sm,
    color: COLORS.textMuted,
  },
  
  // Operation Cards (Today's Operations)
  operationCard: {
    alignItems: 'center',
    padding: SPACING.md,
    minHeight: 100,
  },
  iconContainerSmall: {
    ...COMPONENTS.iconContainerSmall,
    marginBottom: SPACING.sm,
  },
  operationNumber: {
    fontSize: 24,
    fontWeight: DS.typography.fontWeight.bold,
    marginBottom: 4,
  },
  operationLabel: {
    fontSize: DS.typography.fontSize.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  
  // Action Cards
  actionCardPrimary: {
    ...COMPONENTS.buttonPrimary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 72,
  },
  actionTextPrimary: {
    ...COMPONENTS.buttonPrimaryText,
    fontSize: DS.typography.fontSize.base,
  },
  actionCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    height: 72,
  },
  actionText: {
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.teal,
    textAlign: 'center',
  },
  
  // Trip Cards
  tripCard: {
    ...COMPONENTS.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  tripIconContainer: {
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
  tripId: {
    fontSize: DS.typography.fontSize.base,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.navy,
  },
  statusBadge: {
    ...COMPONENTS.statusBadge,
  },
  statusText: {
    ...COMPONENTS.statusBadgeText,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tripRouteText: {
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.bold,
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
    fontSize: DS.typography.fontSize.xs,
    color: COLORS.textMuted,
  },
  
  // Financial Card
  financialCard: {
    padding: SPACING.base,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  financialItem: {
    flex: 1,
  },
  financialDivider: {
    width: 1,
    height: 40,
    marginHorizontal: SPACING.md,
  },
  financialLabel: {
    fontSize: DS.typography.fontSize.sm,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  financialValue: {
    fontSize: DS.typography.fontSize.xl,
    fontWeight: DS.typography.fontWeight.bold,
  },
  financialProfit: {
    paddingTop: SPACING.base,
    borderTopWidth: 1,
    marginBottom: SPACING.md,
  },
  financialProfitValue: {
    fontSize: DS.typography.fontSize['2xl'],
    fontWeight: DS.typography.fontWeight.bold,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  profitPercentageText: {
    fontSize: DS.typography.fontSize.xs,
  },
});
