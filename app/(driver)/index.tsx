/**
 * Driver Home Screen - Redesigned with Executive Dark Theme
 * 100% In-App Turn-by-Turn GPS Navigation & Functional Start Trip Workflow
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  Line,
} from 'react-native-svg';
import { useAuth } from '../../src/hooks';
import { TripStatus } from '../../src/types/driver-porter.types';
import StatusChip from '../../src/components/common/StatusChip';
import EmptyStateCard from '../../src/components/common/EmptyStateCard';
import StatCard from '../../src/components/common/StatCard';
import { Modal } from '../../src/components/ui/Modal';

const COLORS = {
  background: '#0B1120',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  borderLight: '#475569',
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

// Turn-by-turn navigation steps for in-app GPS
const NAVIGATION_STEPS = [
  {
    id: 1,
    maneuver: 'arrow-up-bold',
    distance: '350 m',
    instruction: 'Head south on Quezon Ave towards EDSA',
    subtext: 'Stay on the middle 2 lanes',
    eta: '28 mins',
    remKm: '14.8 km',
    speed: 42,
  },
  {
    id: 2,
    maneuver: 'arrow-top-right-thick',
    distance: '1.2 km',
    instruction: 'Take the ramp onto EDSA Southbound Flyover',
    subtext: 'Approaching North Ave MRT Station',
    eta: '24 mins',
    remKm: '12.4 km',
    speed: 55,
  },
  {
    id: 3,
    maneuver: 'arrow-up-bold',
    distance: '4.8 km',
    instruction: 'Continue on EDSA Southbound past Ortigas',
    subtext: 'Keep right for Shaw Blvd Underpass exit',
    eta: '16 mins',
    remKm: '7.6 km',
    speed: 48,
  },
  {
    id: 4,
    maneuver: 'arrow-top-right-thick',
    distance: '850 m',
    instruction: 'Turn right into SM Megamall Service Road',
    subtext: 'Enter Cargo Gate B (Loading Bay 3)',
    eta: '5 mins',
    remKm: '1.2 km',
    speed: 25,
  },
  {
    id: 5,
    maneuver: 'flag-checkered',
    distance: '0 m',
    instruction: 'Arrived at SM Megamall Cargo Bay B',
    subtext: 'Prepare for cargo inspection & unloading',
    eta: 'Arrived',
    remKm: '0.0 km',
    speed: 0,
  },
];

export default function DriverHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [hasActiveTrip, setHasActiveTrip] = useState(true);
  const [currentTrip, setCurrentTrip] = useState(INITIAL_TRIP);
  const [completedTripsCount, setCompletedTripsCount] = useState(8);

  // Modals state
  const [navModalVisible, setNavModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // In-app GPS Navigation state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSimulatingGps, setIsSimulatingGps] = useState(true);
  const truckGpsAnim = useRef(new Animated.Value(0)).current;
  const radarPulseAnim = useRef(new Animated.Value(0)).current;

  const currentStep = NAVIGATION_STEPS[currentStepIndex];

  useEffect(() => {
    // Pulse animation for GPS radar beacon
    const radarLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(radarPulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(radarPulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    radarLoop.start();

    return () => radarLoop.stop();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  // Advance to next GPS navigation waypoint in-app
  const handleNextGpsStep = () => {
    if (currentStepIndex < NAVIGATION_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);

      // Smoothly animate truck pin along the map route
      Animated.timing(truckGpsAnim, {
        toValue: nextIdx / (NAVIGATION_STEPS.length - 1),
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      if (nextIdx === NAVIGATION_STEPS.length - 1) {
        // Automatically update trip status to arrived/unloading
        setCurrentTrip((prev) => ({
          ...prev,
          status: TripStatus.UNLOADING,
        }));
      }
    }
  };

  const handlePrevGpsStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      Animated.timing(truckGpsAnim, {
        toValue: prevIdx / (NAVIGATION_STEPS.length - 1),
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }
  };

  // Perform Trip Status Transitions
  const executeTripAction = () => {
    setActionModalVisible(false);
    const status = currentTrip.status;

    if (status === TripStatus.LOADING) {
      setCurrentTrip((prev) => ({
        ...prev,
        status: TripStatus.IN_TRANSIT,
      }));
      setFeedbackMessage('🚚 Trip started! Live In-App GPS navigation active.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    } else if (status === TripStatus.IN_TRANSIT) {
      setCurrentTrip((prev) => ({
        ...prev,
        status: TripStatus.UNLOADING,
      }));
      setFeedbackMessage('📍 Arrival confirmed. Coordinate cargo unloading with helper.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    } else if (status === TripStatus.UNLOADING) {
      setCurrentTrip((prev) => ({
        ...prev,
        status: TripStatus.COMPLETED,
      }));
      setCompletedTripsCount((prev) => prev + 1);
      setFeedbackMessage('🎉 Delivery completed! Proof of delivery recorded to your earnings.');
      setTimeout(() => setFeedbackMessage(null), 6000);
    } else if (status === TripStatus.COMPLETED) {
      setCurrentTrip(INITIAL_TRIP);
      setCurrentStepIndex(0);
      setFeedbackMessage('Trip status reset for demonstration.');
      setTimeout(() => setFeedbackMessage(null), 3000);
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
          modalTitle: 'Start Trip',
          modalDesc: `Departing from ${currentTrip.pickup} to ${currentTrip.delivery}. Live in-app GPS navigation will activate for this trip.`,
          confirmLabel: 'Confirm Departure & Start Trip',
        };
      case TripStatus.IN_TRANSIT:
        return {
          label: 'Arrived at Destination',
          icon: 'map-marker-check' as const,
          color: COLORS.success,
          modalTitle: 'Confirm Arrival',
          modalDesc: `You are arriving at ${currentTrip.delivery}. Confirming arrival will notify dispatch and begin cargo unloading.`,
          confirmLabel: 'Confirm Arrival at Site',
        };
      case TripStatus.UNLOADING:
        return {
          label: 'Complete Delivery',
          icon: 'check-circle' as const,
          color: COLORS.orange,
          modalTitle: 'Complete Delivery',
          modalDesc: `Confirm that all cargo items have been inspected, handed over to ${currentTrip.delivery}, and verified by ${currentTrip.porterName}.`,
          confirmLabel: 'Finish Trip & Record POD',
        };
      case TripStatus.COMPLETED:
        return {
          label: 'Trip Completed ✓ (Reset Demo)',
          icon: 'check-all' as const,
          color: '#475569',
          modalTitle: 'Reset Trip Assignment',
          modalDesc: `This trip is completed. Would you like to reset the assignment back to Loading status?`,
          confirmLabel: 'Reset Assignment to Loading',
        };
      default:
        return {
          label: 'Start Trip',
          icon: 'truck-fast' as const,
          color: COLORS.primary,
          modalTitle: 'Start Trip',
          modalDesc: 'Start your assigned trip.',
          confirmLabel: 'Start Trip',
        };
    }
  };

  const getStatusChipConfig = () => {
    switch (currentTrip.status) {
      case TripStatus.LOADING:
        return { status: 'in-progress' as const, label: 'Loading Cargo' };
      case TripStatus.IN_TRANSIT:
        return { status: 'in-progress' as const, label: 'In Transit • In-App GPS Live' };
      case TripStatus.UNLOADING:
        return { status: 'in-progress' as const, label: 'Unloading Cargo' };
      case TripStatus.COMPLETED:
        return { status: 'completed' as const, label: 'Completed' };
      default:
        return { status: 'in-progress' as const, label: 'Active' };
    }
  };

  const actionConfig = getPrimaryActionConfig();
  const statusChipConfig = getStatusChipConfig();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.name}>
            {user?.user_metadata?.first_name || 'Juan'}
          </Text>
        </View>

        {/* Live Feedback Notification Banner */}
        {feedbackMessage ? (
          <View style={styles.feedbackBanner}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        ) : null}

        {/* Current Trip Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CURRENT ASSIGNMENT</Text>

          {!hasActiveTrip ? (
            <EmptyStateCard
              iconName="truck-delivery-outline"
              title="No Active Trip"
              description="You don't have any trips in progress. Check your upcoming assignments or contact the operator."
              actionLabel="View My Trips"
              onActionPress={() => router.push('/(driver)/trips')}
            />
          ) : (
            <View style={styles.currentTripCard}>
              {/* Card Header */}
              <View style={styles.tripHeader}>
                <View style={styles.tripHeaderLeft}>
                  <MaterialCommunityIcons name="truck-delivery" size={24} color={COLORS.primary} />
                  <Text style={styles.tripNumber}>{currentTrip.tripNumber}</Text>
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
                  <Text style={styles.detailValue}>{currentTrip.callTime}</Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="truck" size={18} color={COLORS.orange} />
                  <Text style={styles.detailLabel}>Truck:</Text>
                  <Text style={styles.detailValue}>{currentTrip.truckNumber}</Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="account-hard-hat" size={18} color={COLORS.success} />
                  <Text style={styles.detailLabel}>Porter:</Text>
                  <Text style={styles.detailValue}>{currentTrip.porterName}</Text>
                </View>
              </View>

              {/* Route Section */}
              <View style={styles.routeSection}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: COLORS.info }]} />
                  <View style={styles.routeContent}>
                    <Text style={[styles.routeLabel, { color: COLORS.info }]}>PICKUP</Text>
                    <Text style={styles.routeLocation}>{currentTrip.pickup}</Text>
                    <Text style={styles.routeAddress}>{currentTrip.pickupAddress}</Text>
                  </View>
                </View>

                <View style={styles.routeLine} />

                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: COLORS.success }]} />
                  <View style={styles.routeContent}>
                    <Text style={[styles.routeLabel, { color: COLORS.success }]}>DELIVERY</Text>
                    <Text style={styles.routeLocation}>{currentTrip.delivery}</Text>
                    <Text style={styles.routeAddress}>{currentTrip.deliveryAddress}</Text>
                  </View>
                </View>
              </View>

              {/* Primary Action Button (Start Trip / Arrived / Complete) */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: actionConfig.color }]}
                onPress={() => setActionModalVisible(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name={actionConfig.icon} size={22} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>{actionConfig.label}</Text>
              </TouchableOpacity>

              {/* Secondary Actions (In-App Navigate / Report Issue) */}
              <View style={styles.secondaryActions}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setNavModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="navigate" size={18} color={COLORS.primary} />
                  <Text style={[styles.secondaryButtonText, { color: COLORS.primary }]}>
                    In-App GPS Navigate
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
          )}
        </View>

        {/* Quick Stats */}
        {hasActiveTrip && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>THIS WEEK</Text>
            <View style={styles.statsRow}>
              <StatCard label="Completed" value={completedTripsCount} icon="check-circle" variant="success" />
              <StatCard label="Total Trips" value={12} icon="truck-delivery" variant="primary" />
            </View>
          </View>
        )}

        {/* Upcoming Trips */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>UPCOMING TRIPS</Text>
            <TouchableOpacity onPress={() => router.push('/(driver)/trips')}>
              <Text style={styles.viewAllText}>View All</Text>
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
                <Text style={styles.upcomingTripNumber}>{trip.tripNumber}</Text>
                <View style={styles.upcomingTripDestination}>
                  <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.info} />
                  <Text style={styles.upcomingTripDestinationText}>{trip.destination}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ==================== 1. Trip Action Confirmation Modal ==================== */}
      <Modal
        isOpen={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        title={actionConfig.modalTitle}
        size="md"
      >
        <View style={styles.modalBody}>
          <View style={styles.modalIconWrapper}>
            <MaterialCommunityIcons name={actionConfig.icon} size={36} color={actionConfig.color} />
          </View>

          <Text style={styles.modalTripTitle}>{currentTrip.tripNumber}</Text>
          <Text style={styles.modalDescText}>{actionConfig.modalDesc}</Text>

          {/* Quick Route Summary in Modal */}
          <View style={styles.modalRouteBox}>
            <View style={styles.modalRouteRow}>
              <Ionicons name="ellipse" size={10} color={COLORS.info} />
              <Text style={styles.modalRoutePoint}>{currentTrip.pickup}</Text>
            </View>
            <View style={styles.modalRouteLine} />
            <View style={styles.modalRouteRow}>
              <Ionicons name="ellipse" size={10} color={COLORS.success} />
              <Text style={styles.modalRoutePoint}>{currentTrip.delivery}</Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.modalConfirmBtn, { backgroundColor: actionConfig.color }]}
            onPress={executeTripAction}
            activeOpacity={0.8}
          >
            <Text style={styles.modalConfirmBtnText}>{actionConfig.confirmLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalCancelBtn}
            onPress={() => setActionModalVisible(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.modalCancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ==================== 2. IN-APP GPS NAVIGATION MODAL ==================== */}
      <Modal
        isOpen={navModalVisible}
        onClose={() => setNavModalVisible(false)}
        title="In-App Turn-by-Turn GPS HUD"
        size="lg"
      >
        <View style={styles.modalBody}>
          {/* Top Maneuver Card Banner */}
          <View style={styles.gpsManeuverBanner}>
            <View style={styles.gpsManeuverIconCircle}>
              <MaterialCommunityIcons
                name={currentStep.maneuver as any}
                size={28}
                color={COLORS.white}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.gpsManeuverDistance}>{currentStep.distance}</Text>
              <Text style={styles.gpsManeuverText}>{currentStep.instruction}</Text>
              <Text style={styles.gpsManeuverSubtext}>{currentStep.subtext}</Text>
            </View>
          </View>

          {/* Simulated In-App Visual Vector Map */}
          <View style={styles.gpsMapContainer}>
            <Svg height="160" width="100%" viewBox="0 0 340 160">
              <Defs>
                <LinearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.8" />
                  <Stop offset="100%" stopColor="#10B981" stopOpacity="0.9" />
                </LinearGradient>
                <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#0F172A" />
                  <Stop offset="100%" stopColor="#0B1120" />
                </LinearGradient>
              </Defs>

              {/* Map Canvas Background */}
              <Rect x="0" y="0" width="340" height="160" rx="14" fill="url(#bgGrad)" />

              {/* Street grid lines */}
              <Line x1="20" y1="40" x2="320" y2="40" stroke="#1E293B" strokeWidth="2" strokeDasharray="4,4" />
              <Line x1="20" y1="80" x2="320" y2="80" stroke="#334155" strokeWidth="3" />
              <Line x1="20" y1="120" x2="320" y2="120" stroke="#1E293B" strokeWidth="2" strokeDasharray="4,4" />
              <Line x1="90" y1="10" x2="90" y2="150" stroke="#1E293B" strokeWidth="2" />
              <Line x1="180" y1="10" x2="180" y2="150" stroke="#1E293B" strokeWidth="2" strokeDasharray="4,4" />
              <Line x1="270" y1="10" x2="270" y2="150" stroke="#1E293B" strokeWidth="2" />

              {/* Glowing Highway Route Path */}
              <Path
                d="M 40 120 Q 120 120 160 80 T 300 40"
                fill="none"
                stroke="url(#roadGrad)"
                strokeWidth="6"
                strokeLinecap="round"
              />

              {/* Origin Pin: Quezon Ave Warehouse */}
              <Circle cx="40" cy="120" r="9" fill="#0EA5E9" />
              <Circle cx="40" cy="120" r="4" fill="#FFFFFF" />

              {/* Destination Pin: SM Megamall */}
              <Circle cx="300" cy="40" r="9" fill="#10B981" />
              <Circle cx="300" cy="40" r="4" fill="#FFFFFF" />
            </Svg>

            {/* In-Map Telemetry Speed Badge */}
            <View style={styles.inMapSpeedBadge}>
              <Text style={styles.inMapSpeedVal}>{currentStep.speed}</Text>
              <Text style={styles.inMapSpeedUnit}>KM/H</Text>
            </View>

            {/* In-Map Compass Heading */}
            <View style={styles.inMapCompassBadge}>
              <MaterialCommunityIcons name="compass" size={14} color={COLORS.primary} />
              <Text style={styles.inMapCompassText}>EDSA • SSE 158°</Text>
            </View>
          </View>

          {/* Live Telemetry Metrics Row */}
          <View style={styles.gpsMetricsCard}>
            <View style={styles.gpsMetricItem}>
              <Text style={styles.gpsMetricVal}>{currentStep.remKm}</Text>
              <Text style={styles.gpsMetricLabel}>REMAINING</Text>
            </View>
            <View style={styles.gpsMetricDivider} />
            <View style={styles.gpsMetricItem}>
              <Text style={[styles.gpsMetricVal, { color: COLORS.orange }]}>{currentStep.eta}</Text>
              <Text style={styles.gpsMetricLabel}>EST. ARRIVAL</Text>
            </View>
            <View style={styles.gpsMetricDivider} />
            <View style={styles.gpsMetricItem}>
              <Text style={[styles.gpsMetricVal, { color: COLORS.success }]}>Normal</Text>
              <Text style={styles.gpsMetricLabel}>TRAFFIC</Text>
            </View>
          </View>

          {/* Step Controls (Simulate / Previous / Next Step) */}
          <View style={styles.gpsControlsRow}>
            <TouchableOpacity
              style={[
                styles.gpsNavStepBtn,
                currentStepIndex === 0 && { opacity: 0.4 },
              ]}
              onPress={handlePrevGpsStep}
              disabled={currentStepIndex === 0}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={18} color={COLORS.white} />
              <Text style={styles.gpsNavStepBtnText}>Prev Step</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gpsNavStepBtn,
                styles.gpsNavStepBtnPrimary,
                currentStepIndex === NAVIGATION_STEPS.length - 1 && { backgroundColor: COLORS.success },
              ]}
              onPress={handleNextGpsStep}
              activeOpacity={0.8}
            >
              <Text style={styles.gpsNavStepBtnPrimaryText}>
                {currentStepIndex === NAVIGATION_STEPS.length - 1
                  ? 'Arrived at Destination ✓'
                  : 'Next Waypoint →'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Waypoints Timeline Preview */}
          <View style={styles.waypointsContainer}>
            <Text style={styles.waypointsTitle}>ROUTE WAYPOINTS (STEP {currentStepIndex + 1} OF {NAVIGATION_STEPS.length})</Text>
            {NAVIGATION_STEPS.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPassed = idx < currentStepIndex;

              return (
                <TouchableOpacity
                  key={step.id}
                  style={[styles.waypointRow, isCurrent && styles.waypointRowActive]}
                  onPress={() => setCurrentStepIndex(idx)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.waypointDot,
                      isPassed && { backgroundColor: COLORS.success },
                      isCurrent && { backgroundColor: COLORS.primary, borderColor: COLORS.white, borderWidth: 2 },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.waypointText,
                        isCurrent && { color: COLORS.white, fontWeight: '700' },
                        isPassed && { color: COLORS.textMuted },
                      ]}
                    >
                      {step.instruction}
                    </Text>
                  </View>
                  <Text style={styles.waypointDist}>{step.distance}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Close HUD Button */}
          <TouchableOpacity
            style={styles.closeGpsBtn}
            onPress={() => setNavModalVisible(false)}
            activeOpacity={0.8}
          >
            <Text style={styles.closeGpsBtnText}>Close In-App Navigation</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    paddingBottom: 12,
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
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    gap: 10,
  },
  feedbackText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#34D399',
    lineHeight: 18,
  },
  section: {
    marginTop: 14,
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

  // Modal Styles
  modalBody: {
    paddingVertical: 4,
  },
  modalIconWrapper: {
    alignSelf: 'center',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTripTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalDescText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  modalRouteBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  modalRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalRoutePoint: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  modalRouteLine: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.border,
    marginLeft: 4,
    marginVertical: 3,
  },
  modalConfirmBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalConfirmBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },

  // In-App Turn-by-Turn GPS HUD Styles
  gpsManeuverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 12,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  gpsManeuverIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gpsManeuverDistance: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  gpsManeuverText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 1,
  },
  gpsManeuverSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  gpsMapContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  inMapSpeedBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },
  inMapSpeedVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },
  inMapSpeedUnit: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  inMapCompassBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  inMapCompassText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  gpsMetricsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  gpsMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  gpsMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },
  gpsMetricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  gpsMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  gpsControlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  gpsNavStepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
  },
  gpsNavStepBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  gpsNavStepBtnPrimary: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  gpsNavStepBtnPrimaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
  },
  waypointsContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  waypointsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  waypointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 10,
  },
  waypointRowActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
  },
  waypointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
  },
  waypointText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  waypointDist: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  closeGpsBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    alignItems: 'center',
  },
  closeGpsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.error,
  },
});
