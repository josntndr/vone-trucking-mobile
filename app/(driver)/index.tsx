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
                  <MaterialCommunityIcons name="map-marker" size={14} color="#64748B" />
                  <Text style={styles.upcomingTripDestinationText}>{trip.destination}</Text>
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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  name: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  driverStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 6,
  },
  driverDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  driverStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  lastSection: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  viewAllText: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '700',
  },
  currentTripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tripHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  tripNumber: {
    color: '#0F1E36',
    fontSize: 16,
    fontWeight: '700',
  },
  detailsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 4,
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  detailValue: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  routeSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E2E8F0',
    marginLeft: 4,
    marginVertical: 2,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  routeLocation: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  routeAddress: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: '#0F1E36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryActions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  upcomingTripsContainer: {
    gap: 8,
  },
  upcomingTripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  upcomingTripCardMargin: {
    marginBottom: 0,
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
    gap: 8,
  },
  upcomingTripDate: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  upcomingTripNumber: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  upcomingTripDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  upcomingTripDestinationText: {
    color: '#64748B',
    fontSize: 12,
  },
});
