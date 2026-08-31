/**
 * Driver Home Screen - Redesigned with Executive Dark Theme
 * Modern, high-contrast dashboard with functional Start Trip & Navigation
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks';
import { TripStatus } from '../../src/types/driver-porter.types';
import StatusChip from '../../src/components/common/StatusChip';
import EmptyStateCard from '../../src/components/common/EmptyStateCard';
import StatCard from '../../src/components/common/StatCard';

const COLORS = {
  background: '#0B1120',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  primary: '#0EA5E9',
  teal: '#0EA5E9',
  orange: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#38BDF8',
  white: '#FFFFFF',
};

// Initial trip assignment data
const INITIAL_TRIP = {
  id: '1',
  tripNumber: 'VT-2024-001',
  status: TripStatus.LOADING,
  truckNumber: 'ABC-1234',
  porterName: 'Pedro Santos',
  callTime: '06:00 AM',
  pickup: 'Metro Manila Warehouse',
  pickupAddress: '123 Quezon Ave, Quezon City',
  delivery: 'SM Megamall',
  deliveryAddress: '456 EDSA, Mandaluyong City',
  estimatedArrival: '10:30 AM',
  currentLocation: 'EDSA Northbound',
  progress: 45,
};

const DEMO_UPCOMING_TRIPS = [
  {
    id: '2',
    tripNumber: 'VT-2024-002',
    date: 'Tomorrow',
    callTime: '05:00 AM',
    destination: "Robinson's Galleria",
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
  const [hasActiveTrip, setHasActiveTrip] = useState(true);
  const [currentTrip, setCurrentTrip] = useState(INITIAL_TRIP);
  const [completedTripsCount, setCompletedTripsCount] = useState(8);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  // Launch navigation app
  const launchMap = (address: string, label: string) => {
    const encoded = encodeURIComponent(address);
    Alert.alert(
      `Navigate to ${label}`,
      address,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Google Maps',
          onPress: () => {
            const nativeUrl =
              Platform.OS === 'ios'
                ? `comgooglemaps://?q=${encoded}`
                : `google.navigation:q=${encoded}`;
            Linking.openURL(nativeUrl).catch(() => {
              Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`);
            });
          },
        },
        {
          text: 'Waze',
          onPress: () => {
            const nativeUrl = `waze://?q=${encoded}&navigate=yes`;
            Linking.openURL(nativeUrl).catch(() => {
              Linking.openURL(`https://www.waze.com/ul?q=${encoded}`);
            });
          },
        },
      ]
    );
  };

  const handleNavigate = () => {
    Alert.alert(
      'Select Route Destination',
      'Where would you like to navigate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Delivery: ${currentTrip.delivery}`,
          onPress: () => launchMap(currentTrip.deliveryAddress || currentTrip.delivery, currentTrip.delivery),
        },
        {
          text: `Pickup: ${currentTrip.pickup}`,
          onPress: () => launchMap(currentTrip.pickupAddress || currentTrip.pickup, currentTrip.pickup),
        },
      ]
    );
  };

  // State machine for Start Trip -> Arrive -> Complete Delivery
  const handlePrimaryAction = () => {
    const status = currentTrip.status;

    if (status === TripStatus.LOADING) {
      Alert.alert(
        'Start Trip',
        `Ready to depart for ${currentTrip.delivery}? Live GPS telemetry will begin recording.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start Trip Now',
            onPress: () => {
              setCurrentTrip((prev) => ({
                ...prev,
                status: TripStatus.IN_TRANSIT,
              }));
              Alert.alert(
                'Trip Started! 🚚',
                `VT-2024-001 is now IN TRANSIT to ${currentTrip.delivery}.\nDrive safely!`
              );
            },
          },
        ]
      );
    } else if (status === TripStatus.IN_TRANSIT) {
      Alert.alert(
        'Arrived at Destination',
        `Confirm arrival at ${currentTrip.delivery}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm Arrival',
            onPress: () => {
              setCurrentTrip((prev) => ({
                ...prev,
                status: TripStatus.UNLOADING,
              }));
              Alert.alert(
                'Arrived at Delivery Site',
                `Status updated to UNLOADING.\nPlease coordinate with ${currentTrip.porterName} for cargo handling.`
              );
            },
          },
        ]
      );
    } else if (status === TripStatus.UNLOADING) {
      Alert.alert(
        'Complete Delivery',
        'Have all cargo items been inspected and handed over?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete Trip',
            onPress: () => {
              setCurrentTrip((prev) => ({
                ...prev,
                status: TripStatus.COMPLETED,
              }));
              setCompletedTripsCount((prev) => prev + 1);
              Alert.alert(
                'Trip Completed 🎉',
                `Trip ${currentTrip.tripNumber} has been successfully completed and recorded to your earnings!`
              );
            },
          },
        ]
      );
    } else if (status === TripStatus.COMPLETED) {
      Alert.alert(
        'Trip Completed',
        'This trip has already been completed. Would you like to view your trip history or reset the demo assignment?',
        [
          { text: 'Close', style: 'cancel' },
          {
            text: 'View Trips',
            onPress: () => router.push('/(driver)/trips'),
          },
          {
            text: 'Reset Demo Trip',
            onPress: () => {
              setCurrentTrip(INITIAL_TRIP);
            },
          },
        ]
      );
    }
  };

  const getPrimaryActionConfig = () => {
    const status = currentTrip.status;

    switch (status) {
      case TripStatus.LOADING:
        return {
          label: 'Start Trip',
          icon: 'truck-fast' as const,
          color: COLORS.primary,
        };
      case TripStatus.IN_TRANSIT:
        return {
          label: 'Arrived at Destination',
          icon: 'map-marker-check' as const,
          color: COLORS.success,
        };
      case TripStatus.UNLOADING:
        return {
          label: 'Complete Delivery',
          icon: 'check-circle' as const,
          color: COLORS.orange,
        };
      case TripStatus.COMPLETED:
        return {
          label: 'Trip Completed ✓',
          icon: 'check-all' as const,
          color: COLORS.textSecondary,
        };
      default:
        return {
          label: 'Start Trip',
          icon: 'truck-fast' as const,
          color: COLORS.primary,
        };
    }
  };

  const getStatusChipConfig = () => {
    switch (currentTrip.status) {
      case TripStatus.LOADING:
        return { status: 'in-progress' as const, label: 'Loading Cargo' };
      case TripStatus.IN_TRANSIT:
        return { status: 'in-progress' as const, label: 'In Transit' };
      case TripStatus.UNLOADING:
        return { status: 'in-progress' as const, label: 'Unloading' };
      case TripStatus.COMPLETED:
        return { status: 'completed' as const, label: 'Completed' };
      default:
        return { status: 'in-progress' as const, label: 'Active' };
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

    const actionConfig = getPrimaryActionConfig();
    const statusChipConfig = getStatusChipConfig();

    return (
      <View>
        {/* Current Trip Card */}
        <View style={styles.currentTripCard}>
          {/* Header */}
          <View style={styles.tripHeader}>
            <View style={styles.tripHeaderLeft}>
              <MaterialCommunityIcons name="truck-delivery" size={24} color={COLORS.primary} />
              <Text style={styles.tripNumber}>
                {currentTrip.tripNumber}
              </Text>
            </View>
            <StatusChip
              status={statusChipConfig.status}
              label={statusChipConfig.label}
              size="md"
            />
          </View>

          {/* Assignment Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={COLORS.info} />
              <Text style={styles.detailLabel}>Call Time:</Text>
              <Text style={styles.detailValue}>
                {currentTrip.callTime}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="truck" size={18} color={COLORS.orange} />
              <Text style={styles.detailLabel}>Truck:</Text>
              <Text style={styles.detailValue}>
                {currentTrip.truckNumber}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="account-hard-hat" size={18} color={COLORS.success} />
              <Text style={styles.detailLabel}>Porter:</Text>
              <Text style={styles.detailValue}>
                {currentTrip.porterName}
              </Text>
            </View>
          </View>

          {/* Route Section */}
          <View style={styles.routeSection}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: COLORS.info }]} />
              <View style={styles.routeContent}>
                <Text style={[styles.routeLabel, { color: COLORS.info }]}>
                  PICKUP
                </Text>
                <Text style={styles.routeLocation}>
                  {currentTrip.pickup}
                </Text>
                <Text style={styles.routeAddress}>
                  {currentTrip.pickupAddress}
                </Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: COLORS.success }]} />
              <View style={styles.routeContent}>
                <Text style={[styles.routeLabel, { color: COLORS.success }]}>
                  DELIVERY
                </Text>
                <Text style={styles.routeLocation}>
                  {currentTrip.delivery}
                </Text>
                <Text style={styles.routeAddress}>
                  {currentTrip.deliveryAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* Primary Action Button (Start Trip / Arrived / Complete) */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: actionConfig.color },
            ]}
            onPress={handlePrimaryAction}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name={actionConfig.icon} size={22} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>
              {actionConfig.label}
            </Text>
          </TouchableOpacity>

          {/* Secondary Actions (Navigate / Report Issue) */}
          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleNavigate}
              activeOpacity={0.7}
            >
              <Ionicons name="navigate" size={18} color={COLORS.primary} />
              <Text style={[styles.secondaryButtonText, { color: COLORS.primary }]}>
                Navigate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/(driver)/reports')}
              activeOpacity={0.7}
            >
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
              <Text style={[styles.secondaryButtonText, { color: COLORS.error }]}>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.name}>
            {user?.user_metadata?.first_name || 'Juan'}
          </Text>
        </View>

        {/* Current Trip Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            CURRENT ASSIGNMENT
          </Text>
          {renderCurrentTrip()}
        </View>

        {/* Quick Stats */}
        {hasActiveTrip && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              THIS WEEK
            </Text>
            <View style={styles.statsRow}>
              <StatCard label="Completed" value={completedTripsCount} icon="check-circle" variant="success" />
              <StatCard label="Total Trips" value={12} icon="truck-delivery" variant="primary" />
            </View>
          </View>
        )}

        {/* Upcoming Trips */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              UPCOMING TRIPS
            </Text>
            <TouchableOpacity onPress={() => router.push('/(driver)/trips')}>
              <Text style={styles.viewAllText}>
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.upcomingTripsContainer}>
            {DEMO_UPCOMING_TRIPS.map((trip, index) => (
              <TouchableOpacity
                key={trip.id}
                onPress={() => router.push('/(driver)/trips')}
                activeOpacity={0.75}
                style={[
                  styles.upcomingTripCard,
                  index < DEMO_UPCOMING_TRIPS.length - 1 && styles.upcomingTripCardMargin,
                ]}
              >
                <View style={styles.upcomingTripHeader}>
                  <View style={styles.upcomingTripLeft}>
                    <MaterialCommunityIcons name="calendar" size={16} color={COLORS.textSecondary} />
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
                  <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.info} />
                  <Text style={styles.upcomingTripDestinationText}>{trip.destination}</Text>
                </View>
              </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: COLORS.background,
  },
  greeting: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  name: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  lastSection: {
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  currentTripCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
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
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '700',
  },
  routeSection: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
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
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  routeLocation: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  routeLine: {
    width: 1.5,
    height: 16,
    backgroundColor: COLORS.border,
    marginLeft: 4,
    marginVertical: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  upcomingTripsContainer: {
    gap: 10,
  },
  upcomingTripCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
  },
  upcomingTripCardMargin: {
    marginBottom: 2,
  },
  upcomingTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  upcomingTripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upcomingTripDate: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  upcomingTripNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  upcomingTripDestination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  upcomingTripDestinationText: {
    fontSize: 13,
    color: COLORS.text,
  },
});
