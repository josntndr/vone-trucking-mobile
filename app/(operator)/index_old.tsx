/**
 * Operator Home Screen
 * Today's Operations focus with quick actions and urgent alerts
 * Redesigned with proper 2x2 grids per specification
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks';
import { getTrucks } from '../../src/services/api/truck.service';
import { getEmployees } from '../../src/services/api/employee.service';
import { isSupabaseConfigured } from '../../src/services/api/supabase';
import { TruckStatus } from '../../src/types/truck.types';
import { EmploymentStatus, UserRole } from '../../src/types';
import { DESIGN_SYSTEM } from '../../src/theme/designSystem';

interface DashboardStats {
  totalTrucks: number;
  availableTrucks: number;
  onTripTrucks: number;
  maintenanceTrucks: number;
  totalEmployees: number;
  activeDrivers: number;
  activePorters: number;
}

// Demo data for Today's Operations
const DEMO_TODAY_TRIPS = [
  {
    id: '1',
    tripNumber: 'VT-2024-001',
    destination: 'Manila - Quezon City',
    callTime: new Date(),
    truckNumber: 'ABC-1234',
    driverName: 'Juan Dela Cruz',
    status: 'in-progress' as const,
    statusLabel: 'In Transit',
  },
  {
    id: '2',
    tripNumber: 'VT-2024-002',
    destination: 'Manila - Makati',
    callTime: new Date(),
    truckNumber: 'XYZ-5678',
    driverName: 'Maria Santos',
    status: 'scheduled' as const,
    statusLabel: 'Scheduled',
  },
];

const DEMO_ALERTS = [
  {
    id: '1',
    severity: 'warning' as const,
    title: 'Delayed Trip',
    message: 'VT-2024-001 is running 30 minutes behind schedule',
  },
  {
    id: '2',
    severity: 'error' as const,
    title: 'Truck Maintenance Due',
    message: 'ABC-1234 preventive maintenance is overdue',
  },
];

// Demo stats when Supabase is not configured
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
  const { colors, fontSizes, fontWeights, lineHeights, spacing, borderRadius  } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(DEMO_STATS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        // Use demo data
        setStats(DEMO_STATS);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch real data from Supabase
      const trucksResponse = await getTrucks({}, 1, 100);
      const trucks = trucksResponse.data?.data || [];

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
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fall back to demo data on error
      setStats(DEMO_STATS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const todayDate = new Date().toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { padding: spacing[4] }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={[styles.greeting, { color: colors.textSecondary, fontSize: fontSizes.sm }]}>
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
              </Text>
              <Text style={[styles.name, { color: colors.text, fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold }]}>
                {user?.user_metadata?.first_name || 'Operator'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(operator)/profile')}
              style={[styles.notificationButton, { backgroundColor: colors.surface }]}
            >
              <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
              <View style={[styles.badge, { backgroundColor: colors.error }]} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.date, { color: colors.textSecondary, fontSize: fontSizes.xs, marginTop: spacing[2] }]}>
            {todayDate}
          </Text>
        </View>

        {/* Analytics Overview */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, marginBottom: spacing[3] }]}>
            Analytics Overview
          </Text>
          
          {/* 2x2 Analytics Grid */}
          <View style={[styles.gridContainer, { gap: spacing[3] }]}>
            <View style={[styles.gridRow, { gap: spacing[3] }]}>
              <View style={styles.gridItem}>
                <View style={[styles.analyticsCard, { backgroundColor: colors.surface, borderRadius: 12, padding: spacing[4], shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }]}>
                  <MaterialCommunityIcons name="truck-delivery" size={24} color="#1B2A4A" style={{ marginBottom: spacing[2] }} />
                  <Text style={[styles.analyticsValue, { color: colors.text, fontSize: 28, fontWeight: fontWeights.bold }]}>
                    45
                  </Text>
                  <Text style={[styles.analyticsLabel, { color: colors.textSecondary, fontSize: fontSizes.xs }]}>
                    Total Trips
                  </Text>
                </View>
              </View>

              <View style={styles.gridItem}>
                <View style={[styles.analyticsCard, { backgroundColor: colors.surface, borderRadius: 12, padding: spacing[4], shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }]}>
                  <MaterialCommunityIcons name="check-circle" size={24} color="#1B2A4A" style={{ marginBottom: spacing[2] }} />
                  <Text style={[styles.analyticsValue, { color: colors.text, fontSize: 28, fontWeight: fontWeights.bold }]}>
                    38
                  </Text>
                  <Text style={[styles.analyticsLabel, { color: colors.textSecondary, fontSize: fontSizes.xs }]}>
                    Completed
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.gridRow, { gap: spacing[3] }]}>
              <View style={styles.gridItem}>
                <View style={[styles.analyticsCard, { backgroundColor: colors.surface, borderRadius: 12, padding: spacing[4], shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }]}>
                  <MaterialCommunityIcons name="account-group" size={24} color="#1B2A4A" style={{ marginBottom: spacing[2] }} />
                  <Text style={[styles.analyticsValue, { color: colors.text, fontSize: 28, fontWeight: fontWeights.bold }]}>
                    {stats.totalEmployees}
                  </Text>
                  <Text style={[styles.analyticsLabel, { color: colors.textSecondary, fontSize: fontSizes.xs }]}>
                    Active Employees
                  </Text>
                </View>
              </View>

              <View style={styles.gridItem}>
                <View style={[styles.analyticsCard, { backgroundColor: colors.surface, borderRadius: 12, padding: spacing[4], shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }]}>
                  <MaterialCommunityIcons name="sync" size={24} color="#1B2A4A" style={{ marginBottom: spacing[2] }} />
                  <Text style={[styles.analyticsValue, { color: colors.text, fontSize: 28, fontWeight: fontWeights.bold }]}>
                    {stats.onTripTrucks}
                  </Text>
                  <Text style={[styles.analyticsLabel, { color: colors.textSecondary, fontSize: fontSizes.xs }]}>
                    In Progress
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* View Full Analytics Link */}
          <TouchableOpacity 
            onPress={() => router.push('/(operator)/analytics')}
            style={{ marginTop: spacing[3], alignSelf: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={[styles.viewAnalyticsLink, { color: colors.primary, fontSize: fontSizes.sm, fontWeight: fontWeights.medium }]}>
              View Full Analytics →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Urgent Alerts */}
        {DEMO_ALERTS.length > 0 && (
          <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold }]}>
              Urgent Alerts
            </Text>
            {DEMO_ALERTS.map((alert) => (
              <AlertCard
                key={alert.id}
                severity={alert.severity}
                title={alert.title}
                message={alert.message}
                onPress={() => {}}
                style={{ marginBottom: spacing[3] }}
              />
            ))}
          </View>
        )}

        {/* Today's Operations - 2x2 Grid */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold }]}>
              Today's Operations
            </Text>
            <TouchableOpacity onPress={() => router.push('/(operator)/trips')}>
              <Text style={[styles.viewAllText, { color: colors.primary, fontSize: fontSizes.sm }]}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* 2x2 Grid with equal width cards */}
          <View style={[styles.gridContainer, { marginTop: spacing[3], gap: spacing[3] }]}>
            <View style={[styles.gridRow, { gap: spacing[3] }]}>
              <TouchableOpacity 
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.7}
              >
                <View style={[styles.statCard, { backgroundColor: colors.surface, borderRadius: borderRadius.card, padding: spacing[4] }]}>
                  <MaterialCommunityIcons name="truck-delivery" size={28} color={colors.primary} />
                  <Text style={[styles.statValue, { color: colors.primary, fontSize: 32, fontWeight: fontWeights.bold, marginTop: spacing[2] }]}>
                    {stats.onTripTrucks}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSizes.sm, marginTop: spacing[1] }]}>
                    Active Trips
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.7}
              >
                <View style={[styles.statCard, { backgroundColor: colors.surface, borderRadius: borderRadius.card, padding: spacing[4] }]}>
                  <MaterialCommunityIcons name="calendar-clock" size={28} color={colors.info} />
                  <Text style={[styles.statValue, { color: colors.info, fontSize: 32, fontWeight: fontWeights.bold, marginTop: spacing[2] }]}>
                    3
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSizes.sm, marginTop: spacing[1] }]}>
                    Scheduled
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.gridRow, { gap: spacing[3] }]}>
              <TouchableOpacity 
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/trips')}
                activeOpacity={0.7}
              >
                <View style={[styles.statCard, { backgroundColor: colors.surface, borderRadius: borderRadius.card, padding: spacing[4] }]}>
                  <MaterialCommunityIcons name="alert-circle" size={28} color={colors.warning} />
                  <Text style={[styles.statValue, { color: colors.warning, fontSize: 32, fontWeight: fontWeights.bold, marginTop: spacing[2] }]}>
                    1
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSizes.sm, marginTop: spacing[1] }]}>
                    Delayed
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/trucks')}
                activeOpacity={0.7}
              >
                <View style={[styles.statCard, { backgroundColor: colors.surface, borderRadius: borderRadius.card, padding: spacing[4] }]}>
                  <MaterialCommunityIcons name="truck-check" size={28} color={colors.success} />
                  <Text style={[styles.statValue, { color: colors.success, fontSize: 32, fontWeight: fontWeights.bold, marginTop: spacing[2] }]}>
                    {stats.availableTrucks}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textSecondary, fontSize: fontSizes.sm, marginTop: spacing[1] }]}>
                    Available Trucks
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions - 2x2 Grid with full labels */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold }]}>
            Quick Actions
          </Text>
          
          {/* 2x2 Grid with equal width cards and full labels */}
          <View style={[styles.gridContainer, { marginTop: spacing[3], gap: spacing[3] }]}>
            <View style={[styles.gridRow, { gap: spacing[3] }]}>
              <TouchableOpacity 
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/trips/add')}
                activeOpacity={0.7}
              >
                <View style={[styles.actionCard, { backgroundColor: colors.primary, borderRadius: borderRadius.card, padding: spacing[4] }]}>
                  <MaterialCommunityIcons name="plus-circle" size={32} color={colors.white} />
                  <Text style={[styles.actionLabel, { color: colors.white, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, marginTop: spacing[2], textAlign: 'center' }]}>
                    Create Trip
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/import')}
                activeOpacity={0.7}
              >
                <View style={[styles.actionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.card, padding: spacing[4] }]}>
                  <MaterialCommunityIcons name="file-document-multiple" size={32} color={colors.primary} />
                  <Text style={[styles.actionLabel, { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, marginTop: spacing[2], textAlign: 'center' }]}>
                    Import Schedule
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.gridRow, { gap: spacing[3] }]}>
              <TouchableOpacity 
                style={styles.gridItem}
                onPress={() => router.push('/(operator)/trucks')}
                activeOpacity={0.7}
              >
                <View style={[styles.actionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.card, padding: spacing[4] }]}>
                  <MaterialCommunityIcons name="map-marker-radius" size={32} color={colors.primary} />
                  <Text style={[styles.actionLabel, { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, marginTop: spacing[2], textAlign: 'center' }]}>
                    Track Fleet
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.gridItem}
                onPress={() => router.push('/record-expense')}
                activeOpacity={0.7}
              >
                <View style={[styles.actionCard, { backgroundColor: colors.surface, borderRadius: borderRadius.card, padding: spacing[4] }]}>
                  <MaterialCommunityIcons name="cash-register" size={32} color={colors.primary} />
                  <Text style={[styles.actionLabel, { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, marginTop: spacing[2], textAlign: 'center' }]}>
                    Record Expense
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Active Trips Preview */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold }]}>
              Active Trips
            </Text>
          </View>

          {DEMO_TODAY_TRIPS.length > 0 ? (
            DEMO_TODAY_TRIPS.slice(0, 3).map((trip) => (
              <TripCard
                key={trip.id}
                tripNumber={trip.tripNumber}
                destination={trip.destination}
                callTime={trip.callTime}
                truckNumber={trip.truckNumber}
                driverName={trip.driverName}
                status={trip.status}
                statusLabel={trip.statusLabel}
                onPress={() => {}}
                style={{ marginBottom: spacing[3] }}
              />
            ))
          ) : (
            <EmptyStateCard
              iconName="truck-delivery-outline"
              title="No Active Trips"
              description="Create a new trip or import a delivery schedule to get started."
              actionLabel="Create Trip"
              onActionPress={() => router.push('/(operator)/trips/add')}
            />
          )}
        </View>

        {/* Financial Summary */}
        <View style={[styles.section, { paddingHorizontal: spacing[4], paddingBottom: spacing[8] }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold }]}>
            This Week
          </Text>
          <View
            style={[
              styles.financialCard,
              {
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                padding: spacing[4],
                marginTop: spacing[3],
              },
            ]}
          >
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text style={[styles.financialLabel, { color: colors.textSecondary, fontSize: fontSizes.sm }]}>
                  Trip Income
                </Text>
                <Text style={[styles.financialValue, { color: colors.success, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }]}>
                  ₱125,500
                </Text>
              </View>
              <View style={styles.financialItem}>
                <Text style={[styles.financialLabel, { color: colors.textSecondary, fontSize: fontSizes.sm }]}>
                  Expenses
                </Text>
                <Text style={[styles.financialValue, { color: colors.error, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }]}>
                  ₱45,200
                </Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing[3] }]} />
            <View style={styles.financialItem}>
              <Text style={[styles.financialLabel, { color: colors.textSecondary, fontSize: fontSizes.sm }]}>
                Estimated Profit
              </Text>
              <Text style={[styles.financialValue, { color: colors.primary, fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold }]}>
                ₱80,300
              </Text>
            </View>
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
    flexGrow: 1,
  },
  header: {},
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  greeting: {},
  name: {},
  date: {},
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {},
  viewAllText: {},
  gridContainer: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    width: '100%',
  },
  gridItem: {
    flex: 1,
  },
  statCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  statValue: {},
  statLabel: {},
  actionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  actionLabel: {
    maxWidth: '100%',
  },
  analyticsCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
  },
  analyticsValue: {},
  analyticsLabel: {
    marginTop: 4,
  },
  viewAnalyticsLink: {},
  financialCard: {},
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  financialItem: {},
  financialLabel: {
    marginBottom: 4,
  },
  financialValue: {},
  divider: {
    height: 1,
  },
});
