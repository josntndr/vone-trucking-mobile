/**
 * Driver Home Screen
 * Current trip focus with single primary action
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useAuth } from '../../src/hooks';
import StatusChip from '../../src/components/common/StatusChip';
import EmptyStateCard from '../../src/components/common/EmptyStateCard';
import AlertCard from '../../src/components/common/AlertCard';
import StatCard from '../../src/components/common/StatCard';

// Demo current trip data
const DEMO_CURRENT_TRIP = {
  id: '1',
  tripNumber: 'VT-2024-001',
  status: 'loading' as const, // loading, in-transit, unloading, completed
  truckNumber: 'ABC-1234',
  porterName: 'Pedro Santos',
  callTime: '06:00 AM',
  pickup: 'Metro Manila Warehouse',
  pickupAddress: '123 Quezon Ave, Quezon City',
  delivery: 'SM Megamall',
  deliveryAddress: '456 EDSA, Mandaluyong City',
  estimatedArrival: '10:30 AM',
  currentLocation: 'EDSA Northbound',
  progress: 45, // percentage
};

const DEMO_UPCOMING_TRIPS = [
  {
    id: '2',
    tripNumber: 'VT-2024-002',
    date: 'Tomorrow',
    callTime: '05:00 AM',
    destination: 'Robinson\'s Galleria',
  },
  {
    id: '3',
    tripNumber: 'VT-2024-003',
    date: 'Aug 24',
    callTime: '07:00 AM',
    destination: 'Ayala Center Makati',
  },
];

export default function DriverHome() {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [hasActiveTrip, setHasActiveTrip] = useState(true); // Toggle for demo

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getPrimaryAction = () => {
    const status = DEMO_CURRENT_TRIP.status;
    
    switch (status) {
      case 'loading':
        return {
          label: 'Start Trip',
          icon: 'truck-fast' as const,
          color: colors.primary,
          onPress: () => {},
        };
      case 'in-transit':
        return {
          label: 'Arrived at Destination',
          icon: 'map-marker-check' as const,
          color: colors.success,
          onPress: () => {},
        };
      case 'unloading':
        return {
          label: 'Complete Delivery',
          icon: 'check-circle' as const,
          color: colors.success,
          onPress: () => {},
        };
      default:
        return {
          label: 'Acknowledge Trip',
          icon: 'check-circle-outline' as const,
          color: colors.primary,
          onPress: () => {},
        };
    }
  };

  const renderCurrentTrip = () => {
    if (!hasActiveTrip) {
      return (
        <EmptyStateCard
          iconName="truck-delivery-outline"
          title="No Active Trip"
          description="You don't have any trips in progress. Check your upcoming assignments or contact the operator."
          actionLabel="View My Trips"
          onActionPress={() => router.push('/(driver)/trips')}
        />
      );
    }

    const primaryAction = getPrimaryAction();

    return (
      <View>
        {/* Current Trip Card */}
        <View
          style={[
            styles.currentTripCard,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.md,
              padding: spacing[4],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.tripHeader}>
            <View style={styles.tripHeaderLeft}>
              <MaterialCommunityIcons name="truck-delivery" size={24} color={colors.primary} />
              <Text
                style={[
                  styles.tripNumber,
                  {
                    color: colors.primary,
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    marginLeft: spacing[2],
                  },
                ]}
              >
                {DEMO_CURRENT_TRIP.tripNumber}
              </Text>
            </View>
            <StatusChip
              status="in-progress"
              label={DEMO_CURRENT_TRIP.status === 'loading' ? 'Loading' : 'In Transit'}
              size="md"
            />
          </View>

          {/* Assignment Details */}
          <View style={[styles.detailsSection, { marginTop: spacing[4] }]}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.textSecondary} />
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.sm,
                    marginLeft: spacing[2],
                  },
                ]}
              >
                Call Time:
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    marginLeft: spacing[1],
                  },
                ]}
              >
                {DEMO_CURRENT_TRIP.callTime}
              </Text>
            </View>

            <View style={[styles.detailRow, { marginTop: spacing[2] }]}>
              <MaterialCommunityIcons name="truck" size={18} color={colors.textSecondary} />
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.sm,
                    marginLeft: spacing[2],
                  },
                ]}
              >
                Truck:
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    marginLeft: spacing[1],
                  },
                ]}
              >
                {DEMO_CURRENT_TRIP.truckNumber}
              </Text>
            </View>

            <View style={[styles.detailRow, { marginTop: spacing[2] }]}>
              <MaterialCommunityIcons name="account-hard-hat" size={18} color={colors.textSecondary} />
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: typography.fontSize.sm,
                    marginLeft: spacing[2],
                  },
                ]}
              >
                Porter:
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    marginLeft: spacing[1],
                  },
                ]}
              >
                {DEMO_CURRENT_TRIP.porterName}
              </Text>
            </View>
          </View>

          {/* Route */}
          <View style={[styles.routeSection, { marginTop: spacing[4] }]}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
              <View style={styles.routeContent}>
                <Text
                  style={[
                    styles.routeLabel,
                    {
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.xs,
                    },
                  ]}
                >
                  Pickup
                </Text>
                <Text
                  style={[
                    styles.routeLocation,
                    {
                      color: colors.text,
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                    },
                  ]}
                >
                  {DEMO_CURRENT_TRIP.pickup}
                </Text>
                <Text
                  style={[
                    styles.routeAddress,
                    {
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.sm,
                    },
                  ]}
                >
                  {DEMO_CURRENT_TRIP.pickupAddress}
                </Text>
              </View>
            </View>

            <View style={[styles.routeLine, { backgroundColor: colors.border }]} />

            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
              <View style={styles.routeContent}>
                <Text
                  style={[
                    styles.routeLabel,
                    {
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.xs,
                    },
                  ]}
                >
                  Delivery
                </Text>
                <Text
                  style={[
                    styles.routeLocation,
                    {
                      color: colors.text,
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                    },
                  ]}
                >
                  {DEMO_CURRENT_TRIP.delivery}
                </Text>
                <Text
                  style={[
                    styles.routeAddress,
                    {
                      color: colors.textSecondary,
                      fontSize: typography.fontSize.sm,
                    },
                  ]}
                >
                  {DEMO_CURRENT_TRIP.deliveryAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: primaryAction.color,
                borderRadius: borderRadius.md,
                marginTop: spacing[4],
                padding: spacing[4],
              },
            ]}
            onPress={primaryAction.onPress}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={primaryAction.icon} size={24} color={colors.textInverse} />
            <Text
              style={[
                styles.primaryButtonText,
                {
                  color: colors.textInverse,
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  marginLeft: spacing[2],
                },
              ]}
            >
              {primaryAction.label}
            </Text>
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={[styles.secondaryActions, { marginTop: spacing[3], gap: spacing[2] }]}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: borderRadius.base,
                  flex: 1,
                  padding: spacing[3],
                },
              ]}
              onPress={() => {}}
            >
              <MaterialCommunityIcons name="navigation" size={20} color={colors.primary} />
              <Text
                style={[
                  styles.secondaryButtonText,
                  {
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    marginTop: spacing[1],
                  },
                ]}
              >
                Navigate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderRadius: borderRadius.base,
                  flex: 1,
                  padding: spacing[3],
                },
              ]}
              onPress={() => router.push('/(driver)/reports')}
            >
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.error} />
              <Text
                style={[
                  styles.secondaryButtonText,
                  {
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.medium,
                    marginTop: spacing[1],
                  },
                ]}
              >
                Report Issue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
          <View>
            <Text
              style={[
                styles.greeting,
                {
                  color: colors.textSecondary,
                  fontSize: typography.fontSize.sm,
                },
              ]}
            >
              Welcome back
            </Text>
            <Text
              style={[
                styles.name,
                {
                  color: colors.text,
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                },
              ]}
            >
              {user?.user_metadata?.first_name || 'Driver'}
            </Text>
          </View>
        </View>

        {/* Current Trip Section */}
        <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing[3],
              },
            ]}
          >
            Current Assignment
          </Text>
          {renderCurrentTrip()}
        </View>

        {/* Quick Stats */}
        {hasActiveTrip && (
          <View style={[styles.section, { paddingHorizontal: spacing[4] }]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing[3],
                },
              ]}
            >
              This Week
            </Text>
            <View style={[styles.statsRow, { gap: spacing[3] }]}>
              <StatCard label="Completed" value={8} icon="check-circle" variant="success" />
              <StatCard label="Total Trips" value={12} icon="truck-delivery" variant="primary" />
            </View>
          </View>
        )}

        {/* Upcoming Trips */}
        <View style={[styles.section, { paddingHorizontal: spacing[4], paddingBottom: spacing[8] }]}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                },
              ]}
            >
              Upcoming Trips
            </Text>
            <TouchableOpacity onPress={() => router.push('/(driver)/trips')}>
              <Text style={[styles.viewAllText, { color: colors.primary, fontSize: typography.fontSize.sm }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: spacing[3] }}>
            {DEMO_UPCOMING_TRIPS.map((trip, index) => (
              <View
                key={trip.id}
                style={[
                  styles.upcomingTripCard,
                  {
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.base,
                    padding: spacing[3],
                    marginBottom: index < DEMO_UPCOMING_TRIPS.length - 1 ? spacing[2] : 0,
                  },
                ]}
              >
                <View style={styles.upcomingTripHeader}>
                  <View style={styles.upcomingTripLeft}>
                    <MaterialCommunityIcons name="calendar" size={18} color={colors.textSecondary} />
                    <Text
                      style={[
                        styles.upcomingTripDate,
                        {
                          color: colors.text,
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                          marginLeft: spacing[2],
                        },
                      ]}
                    >
                      {trip.date} • {trip.callTime}
                    </Text>
                  </View>
                  <StatusChip status="scheduled" label="Scheduled" size="sm" />
                </View>
                <Text
                  style={[
                    styles.upcomingTripNumber,
                    {
                      color: colors.primary,
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      marginTop: spacing[2],
                    },
                  ]}
                >
                  {trip.tripNumber}
                </Text>
                <View style={[styles.upcomingTripDestination, { marginTop: spacing[1] }]}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
                  <Text
                    style={[
                      styles.upcomingTripDestinationText,
                      {
                        color: colors.textSecondary,
                        fontSize: typography.fontSize.sm,
                        marginLeft: spacing[1],
                      },
                    ]}
                  >
                    {trip.destination}
                  </Text>
                </View>
              </View>
            ))}
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
  greeting: {},
  name: {},
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
  currentTripCard: {},
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tripNumber: {},
  detailsSection: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {},
  detailValue: {},
  routeSection: {},
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeLine: {
    width: 2,
    height: 24,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeContent: {
    flex: 1,
    marginLeft: 12,
  },
  routeLabel: {},
  routeLocation: {},
  routeAddress: {
    marginTop: 2,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {},
  secondaryActions: {
    flexDirection: 'row',
  },
  secondaryButton: {
    alignItems: 'center',
  },
  secondaryButtonText: {
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
  },
  upcomingTripCard: {},
  upcomingTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingTripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  upcomingTripDate: {},
  upcomingTripNumber: {},
  upcomingTripDestination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingTripDestinationText: {},
});
