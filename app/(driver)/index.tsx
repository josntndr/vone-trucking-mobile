/**
 * Driver Home Screen - Redesigned with Design System
 * Phase 8: Align Driver/Helper side with modern premium design
 */

import React, { useState, useCallback } from 'react';
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
import { DESIGN_SYSTEM, COLORS, SPACING, COMPONENTS } from '../../src/theme/designSystem';
import { useAuth } from '../../src/hooks';
import { TripStatus } from '../../src/types/driver-porter.types';
import StatusChip from '../../src/components/common/StatusChip';
import EmptyStateCard from '../../src/components/common/EmptyStateCard';
import StatCard from '../../src/components/common/StatCard';

const DS = DESIGN_SYSTEM;

// Demo current trip data
const DEMO_CURRENT_TRIP = {
  id: '1',
  tripNumber: 'VT-2024-001',
  status: TripStatus.LOADING, // Use enum value
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
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [hasActiveTrip, setHasActiveTrip] = useState(true); // Toggle for demo

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getPrimaryAction = () => {
    const status = DEMO_CURRENT_TRIP.status;
    
    switch (status) {
      case TripStatus.LOADING:
        return {
          label: 'Start Trip',
          icon: 'truck-fast' as const,
          color: COLORS.navy,
          onPress: () => {},
        };
      case TripStatus.IN_TRANSIT:
        return {
          label: 'Arrived at Destination',
          icon: 'map-marker-check' as const,
          color: COLORS.success,
          onPress: () => {},
        };
      case TripStatus.UNLOADING:
        return {
          label: 'Complete Delivery',
          icon: 'check-circle' as const,
          color: COLORS.success,
          onPress: () => {},
        };
      default:
        return {
          label: 'Acknowledge Trip',
          icon: 'check-circle-outline' as const,
          color: COLORS.navy,
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
        <View style={styles.currentTripCard}>
          {/* Header */}
          <View style={styles.tripHeader}>
            <View style={styles.tripHeaderLeft}>
              <MaterialCommunityIcons name="truck-delivery" size={24} color={COLORS.navy} />
              <Text style={styles.tripNumber}>
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
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>
                Call Time:
              </Text>
              <Text style={styles.detailValue}>
                {DEMO_CURRENT_TRIP.callTime}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="truck" size={18} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>
                Truck:
              </Text>
              <Text style={styles.detailValue}>
                {DEMO_CURRENT_TRIP.truckNumber}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="account-hard-hat" size={18} color={COLORS.textSecondary} />
              <Text style={styles.detailLabel}>
                Porter:
              </Text>
              <Text style={styles.detailValue}>
                {DEMO_CURRENT_TRIP.porterName}
              </Text>
            </View>
          </View>

          {/* Route */}
          <View style={styles.routeSection}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: COLORS.success }]} />
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>
                  Pickup
                </Text>
                <Text style={styles.routeLocation}>
                  {DEMO_CURRENT_TRIP.pickup}
                </Text>
                <Text style={styles.routeAddress}>
                  {DEMO_CURRENT_TRIP.pickupAddress}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: COLORS.error }]} />
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>
                  Delivery
                </Text>
                <Text style={styles.routeLocation}>
                  {DEMO_CURRENT_TRIP.delivery}
                </Text>
                <Text style={styles.routeAddress}>
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
              },
            ]}
            onPress={primaryAction.onPress}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={primaryAction.icon} size={24} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>
              {primaryAction.label}
            </Text>
          </TouchableOpacity>

          {/* Secondary Actions */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {}}
            >
              <MaterialCommunityIcons name="navigation" size={20} color={COLORS.navy} />
              <Text style={styles.secondaryButtonText}>
                Navigate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(driver)/reports')}
            >
              <MaterialCommunityIcons name="alert-circle-outline" size={20} color={COLORS.error} />
              <Text style={styles.secondaryButtonText}>
                Report Issue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.navy]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back
            </Text>
            <Text style={styles.name}>
              {user?.user_metadata?.first_name || 'Driver'}
            </Text>
          </View>
        </View>

        {/* Current Trip Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Current Assignment
          </Text>
          {renderCurrentTrip()}
        </View>

        {/* Quick Stats */}
        {hasActiveTrip && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              This Week
            </Text>
            <View style={styles.statsRow}>
              <StatCard label="Completed" value={8} icon="check-circle" variant="success" />
              <StatCard label="Total Trips" value={12} icon="truck-delivery" variant="primary" />
            </View>
          </View>
        )}

        {/* Upcoming Trips */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Upcoming Trips
            </Text>
            <TouchableOpacity onPress={() => router.push('/(driver)/trips')}>
              <Text style={styles.viewAllText}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.upcomingTripsContainer}>
            {DEMO_UPCOMING_TRIPS.map((trip, index) => (
              <View
                key={trip.id}
                style={[
                  styles.upcomingTripCard,
                  index < DEMO_UPCOMING_TRIPS.length - 1 && styles.upcomingTripCardMargin,
                ]}
              >
                <View style={styles.upcomingTripHeader}>
                  <View style={styles.upcomingTripLeft}>
                    <MaterialCommunityIcons name="calendar" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.upcomingTripDate}>
                      {trip.date} • {trip.callTime}
                    </Text>
                  </View>
                  <StatusChip status="scheduled" label="Scheduled" size="sm" />
                </View>
                <Text style={styles.upcomingTripNumber}>
                  {trip.tripNumber}
                </Text>
                <View style={styles.upcomingTripDestination}>
                  <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.upcomingTripDestinationText}>
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: SPACING.md,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: DS.typography.fontSize.sm,
  },
  name: {
    color: COLORS.navy,
    fontSize: DS.typography.fontSize['2xl'],
    fontWeight: DS.typography.fontWeight.bold,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  lastSection: {
    paddingBottom: SPACING['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: DS.typography.fontSize.lg,
    fontWeight: DS.typography.fontWeight.semibold,
    marginBottom: SPACING.sm,
  },
  viewAllText: {
    color: COLORS.navy,
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.semibold,
  },
  currentTripCard: {
    backgroundColor: COLORS.white,
    borderRadius: COMPONENTS.card.borderRadius,
    padding: SPACING.md,
    ...COMPONENTS.card.shadow,
  },
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
  tripNumber: {
    color: COLORS.navy,
    fontSize: DS.typography.fontSize.lg,
    fontWeight: DS.typography.fontWeight.semibold,
    marginLeft: SPACING.xs,
  },
  detailsSection: {
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: DS.typography.fontSize.sm,
    marginLeft: SPACING.xs,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.medium,
    marginLeft: 4,
  },
  routeSection: {
    marginTop: SPACING.md,
  },
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
    backgroundColor: COLORS.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  routeLabel: {
    color: COLORS.textSecondary,
    fontSize: DS.typography.fontSize.xs,
  },
  routeLocation: {
    color: COLORS.text,
    fontSize: DS.typography.fontSize.base,
    fontWeight: DS.typography.fontWeight.semibold,
  },
  routeAddress: {
    color: COLORS.textSecondary,
    fontSize: DS.typography.fontSize.sm,
    marginTop: 2,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginTop: SPACING.md,
    padding: SPACING.md,
    ...COMPONENTS.card.shadow,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: DS.typography.fontSize.lg,
    fontWeight: DS.typography.fontWeight.semibold,
    marginLeft: SPACING.xs,
  },
  secondaryActions: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.medium,
    marginTop: 4,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  upcomingTripsContainer: {
    marginTop: SPACING.sm,
  },
  upcomingTripCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.sm,
    ...COMPONENTS.card.shadow,
  },
  upcomingTripCardMargin: {
    marginBottom: SPACING.xs,
  },
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
  upcomingTripDate: {
    color: COLORS.text,
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.medium,
    marginLeft: SPACING.xs,
  },
  upcomingTripNumber: {
    color: COLORS.navy,
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.medium,
    marginTop: SPACING.xs,
  },
  upcomingTripDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  upcomingTripDestinationText: {
    color: COLORS.textSecondary,
    fontSize: DS.typography.fontSize.sm,
    marginLeft: 4,
  },
});
