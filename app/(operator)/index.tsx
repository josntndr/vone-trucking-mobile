/**
 * Operator Home Screen
 * Today's Operations focus with quick actions and urgent alerts
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/hooks';
import StatCard from '../../src/components/common/StatCard';
import QuickActionCard from '../../src/components/common/QuickActionCard';
import AlertCard from '../../src/components/common/AlertCard';
import TripCard from '../../src/components/common/TripCard';
import EmptyStateCard from '../../src/components/common/EmptyStateCard';
import { getTrucks } from '../../src/services/api/truck.service';
import { getEmployees } from '../../src/services/api/employee.service';
import { TruckStatus } from '../../src/types/truck.types';
import { EmploymentStatus, UserRole } from '../../src/types';

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

export default function OperatorHome() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      // Fetch trucks
      const trucksResponse = await getTrucks({}, 1, 100);
      const trucks = trucksResponse.data?.data || [];

      // Fetch employees
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
      >
        {/* Header */}
        <View style={[styles.header, { padding: spacing[4] }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={[styles.greeting, { color: colors.textSecondary, fontSize: typography.fontSize.sm }]}>
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
              </Text>
              <Text style={[styles.name, { color: colors.text, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }]}>
                {user?.user_metadata?.first_name || 'Operator'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(operator)/profile')}
              style={[styles.notificationButton, { backgroundColor: colors.surface, ...styles.shadow }]}
            >
              <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
              <View style={[styles.badge, { backgroundColor: colors.error }]} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.date, { color: colors.textSecondary, fontSize: typography.fontSize.xs, marginTop: spacing[2] }]}>
            {todayDate}
          </Text>
        </View>

        {/* Urgent Alerts */}
        {DEMO_ALERTS.length > 0 && (
          <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }]}>
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

        {/* Today's Operations */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }]}>
              Today's Operations
            </Text>
            <TouchableOpacity onPress={() => router.push('/(operator)/trips')}>
              <Text style={[styles.viewAllText, { color: colors.primary, fontSize: typography.fontSize.sm }]}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.statsRow, { marginTop: spacing[3], gap: spacing[3] }]}>
            <StatCard
              label="Active Trips"
              value={stats?.onTripTrucks || 2}
              icon="truck-delivery"
              variant="primary"
            />
            <StatCard
              label="Scheduled"
              value={3}
              icon="calendar-clock"
              variant="default"
            />
            <StatCard
              label="Delayed"
              value={1}
              icon="alert-circle"
              variant="warning"
            />
          </View>

          <View style={[styles.statsRow, { marginTop: spacing[3], gap: spacing[3] }]}>
            <StatCard
              label="Available Trucks"
              value={stats?.availableTrucks || 0}
              icon="truck-check"
              variant="success"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }]}>
            Quick Actions
          </Text>
          <View style={[styles.actionsGrid, { marginTop: spacing[3], gap: spacing[3] }]}>
            <QuickActionCard
              icon="plus-circle"
              label="Create Trip"
              onPress={() => router.push('/(operator)/trips/add')}
              variant="primary"
            />
            <QuickActionCard
              icon="file-document-multiple"
              label="Import Schedule"
              onPress={() => router.push('/(operator)/import')}
              variant="secondary"
            />
            <QuickActionCard
              icon="map-marker-radius"
              label="Track Fleet"
              onPress={() => router.push('/(operator)/trucks')}
              variant="secondary"
            />
            <QuickActionCard
              icon="cash-register"
              label="Record Expense"
              onPress={() => {}}
              variant="secondary"
            />
          </View>
        </View>

        {/* Active Trips Preview */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }]}>
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
          <Text style={[styles.sectionTitle, { color: colors.text, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }]}>
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
                <Text style={[styles.financialLabel, { color: colors.textSecondary, fontSize: typography.fontSize.sm }]}>
                  Trip Income
                </Text>
                <Text style={[styles.financialValue, { color: colors.success, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold }]}>
                  ₱125,500
                </Text>
              </View>
              <View style={styles.financialItem}>
                <Text style={[styles.financialLabel, { color: colors.textSecondary, fontSize: typography.fontSize.sm }]}>
                  Expenses
                </Text>
                <Text style={[styles.financialValue, { color: colors.error, fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold }]}>
                  ₱45,200
                </Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: spacing[3] }]} />
            <View style={styles.financialItem}>
              <Text style={[styles.financialLabel, { color: colors.textSecondary, fontSize: typography.fontSize.sm }]}>
                Estimated Profit
              </Text>
              <Text style={[styles.financialValue, { color: colors.primary, fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }]}>
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
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
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

