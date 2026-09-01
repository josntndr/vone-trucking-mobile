/**
 * Driver Home Screen - Redesigned with Executive Dark Theme
 * 100% In-App Google Maps Style Turn-by-Turn Navigation & Functional Start Trip Workflow
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
  Platform,
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
  googleGreen: '#0F9D58',
  googleGreenDark: '#0B8043',
  googleBlue: '#1A73E8',
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

// Google Maps Turn-by-Turn Navigation Steps
const GOOGLE_NAV_STEPS = [
  {
    id: 1,
    maneuver: 'arrow-up-bold',
    distance: '350 m',
    street: 'Quezon Avenue (Route 170)',
    instruction: 'Head southwest on Quezon Ave toward EDSA',
    nextStreet: 'Then 1.2 km, Merge onto EDSA Southbound',
    etaMin: '28 min',
    remKm: '14.8 km',
    speed: 42,
  },
  {
    id: 2,
    maneuver: 'arrow-top-right-thick',
    distance: '1.2 km',
    street: 'EDSA / AH26 Southbound Flyover',
    instruction: 'Keep right at the fork, merge onto EDSA Southbound',
    nextStreet: 'Then 4.5 km, Pass North Ave Station',
    etaMin: '24 min',
    remKm: '12.4 km',
    speed: 55,
  },
  {
    id: 3,
    maneuver: 'arrow-up-bold',
    distance: '4.8 km',
    street: 'EDSA (Epifanio de los Santos Ave)',
    instruction: 'Continue straight on EDSA past Ortigas Avenue',
    nextStreet: 'Then 850 m, Use right lane toward Shaw Blvd',
    etaMin: '16 min',
    remKm: '7.6 km',
    speed: 48,
  },
  {
    id: 4,
    maneuver: 'arrow-top-right-thick',
    distance: '850 m',
    street: 'SM Megamall Service Road',
    instruction: 'Turn right onto SM Megamall Cargo Access Road',
    nextStreet: 'Then 200 m, Gate B Loading Bay 3',
    etaMin: '5 min',
    remKm: '1.2 km',
    speed: 25,
  },
  {
    id: 5,
    maneuver: 'flag-checkered',
    distance: '0 m',
    street: 'SM Megamall Cargo Bay B',
    instruction: 'You have arrived at your delivery destination',
    nextStreet: 'Destination is on the right',
    etaMin: 'Arrived',
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

  // Google Maps navigation state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [mapType, setMapType] = useState<'directions' | 'vector'>('directions');
  const truckGpsAnim = useRef(new Animated.Value(0)).current;

  const currentStep = GOOGLE_NAV_STEPS[currentStepIndex];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  // Advance to next Google Maps GPS waypoint
  const handleNextGpsStep = () => {
    if (currentStepIndex < GOOGLE_NAV_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);

      Animated.timing(truckGpsAnim, {
        toValue: nextIdx / (GOOGLE_NAV_STEPS.length - 1),
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      if (nextIdx === GOOGLE_NAV_STEPS.length - 1) {
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
        toValue: prevIdx / (GOOGLE_NAV_STEPS.length - 1),
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
      setFeedbackMessage('Trip started! Live In-App Navigation is active.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    } else if (status === TripStatus.IN_TRANSIT) {
      setCurrentTrip((prev) => ({
        ...prev,
        status: TripStatus.UNLOADING,
      }));
      setFeedbackMessage('Arrival confirmed. Coordinate cargo unloading with helper.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    } else if (status === TripStatus.UNLOADING) {
      setCurrentTrip((prev) => ({
        ...prev,
        status: TripStatus.COMPLETED,
      }));
      setCompletedTripsCount((prev) => prev + 1);
      setFeedbackMessage('Delivery completed! Proof of delivery recorded to your earnings.');
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
          modalDesc: `Departing from ${currentTrip.pickup} to ${currentTrip.delivery}. Live in-app navigation will activate for this trip.`,
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
        return { status: 'in-progress' as const, label: 'In Transit • GPS Live' };
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

  // Embedded Google Maps Directions URL
  const googleMapsDirectionsUrl = `https://maps.google.com/maps?saddr=123+Quezon+Ave+Quezon+City+Philippines&daddr=SM+Megamall+EDSA+Mandaluyong+Philippines&t=m&z=13&output=embed`;

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

              {/* Secondary Actions (Navigate / Report Issue) */}
              <View style={styles.secondaryActions}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => setNavModalVisible(true)}
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

      {/* ==================== 2. GOOGLE MAPS IN-APP NAVIGATION MODAL ==================== */}
      <Modal
        isOpen={navModalVisible}
        onClose={() => setNavModalVisible(false)}
        title="Google Maps Navigation"
        size="lg"
      >
        <View style={styles.googleNavContainer}>
          {/* Google Maps Iconic Emerald Green Turn Banner */}
          <View style={styles.gmapsTopBanner}>
            <View style={styles.gmapsIconBox}>
              <MaterialCommunityIcons
                name={currentStep.maneuver as any}
                size={34}
                color={COLORS.white}
              />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.gmapsDistRow}>
                <Text style={styles.gmapsDistText}>{currentStep.distance}</Text>
                <View style={styles.gmapsNextChip}>
                  <Text style={styles.gmapsNextChipText}>NEXT</Text>
                </View>
              </View>
              <Text style={styles.gmapsStreetText} numberOfLines={1}>
                {currentStep.street}
              </Text>
              <Text style={styles.gmapsSubInstruction} numberOfLines={1}>
                {currentStep.nextStreet}
              </Text>
            </View>
          </View>

          {/* Embedded Google Maps View Container */}
          <View style={styles.gmapsCanvasBox}>
            {Platform.OS === 'web' && mapType === 'directions' ? (
              // Real Interactive Google Maps Embedded Iframe
              <iframe
                src={googleMapsDirectionsUrl}
                style={{
                  width: '100%',
                  height: '220px',
                  border: '0',
                  borderRadius: '12px',
                }}
                loading="lazy"
                title="Google Maps Directions"
              />
            ) : (
              // High-fidelity Google Maps Dark Navigation Vector Map
              <View style={{ width: '100%', height: 220, position: 'relative' }}>
                <Svg height="220" width="100%" viewBox="0 0 340 220">
                  <Defs>
                    <LinearGradient id="gmapRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <Stop offset="0%" stopColor="#4285F4" />
                      <Stop offset="100%" stopColor="#0F9D58" />
                    </LinearGradient>
                  </Defs>
                  {/* Dark Map Canvas */}
                  <Rect x="0" y="0" width="340" height="220" rx="12" fill="#182335" />

                  {/* Secondary Streets */}
                  <Line x1="10" y1="50" x2="330" y2="50" stroke="#253549" strokeWidth="4" />
                  <Line x1="10" y1="110" x2="330" y2="110" stroke="#253549" strokeWidth="4" />
                  <Line x1="10" y1="170" x2="330" y2="170" stroke="#253549" strokeWidth="4" />
                  <Line x1="80" y1="10" x2="80" y2="210" stroke="#253549" strokeWidth="4" />
                  <Line x1="170" y1="10" x2="170" y2="210" stroke="#253549" strokeWidth="4" />
                  <Line x1="260" y1="10" x2="260" y2="210" stroke="#253549" strokeWidth="4" />

                  {/* Main EDSA Highway (Thick Slate Gray Base) */}
                  <Path
                    d="M 40 180 Q 120 180 170 110 T 300 50"
                    fill="none"
                    stroke="#37475A"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />

                  {/* Active Google Blue Route Polyline */}
                  <Path
                    d="M 40 180 Q 120 180 170 110 T 300 50"
                    fill="none"
                    stroke="url(#gmapRouteGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />

                  {/* Origin Marker */}
                  <Circle cx="40" cy="180" r="10" fill="#4285F4" />
                  <Circle cx="40" cy="180" r="5" fill="#FFFFFF" />

                  {/* Destination Marker */}
                  <Circle cx="300" cy="50" r="10" fill="#EA4335" />
                  <Circle cx="300" cy="50" r="5" fill="#FFFFFF" />
                </Svg>
              </View>
            )}

            {/* Google Maps Floating Speedometer & Controls */}
            <View style={styles.gmapsSpeedBubble}>
              <Text style={styles.gmapsSpeedNum}>{currentStep.speed}</Text>
              <Text style={styles.gmapsSpeedUnit}>km/h</Text>
            </View>

            <View style={styles.gmapsFloatingControls}>
              <TouchableOpacity
                style={styles.gmapsCircleBtn}
                onPress={() => setIsAudioMuted(!isAudioMuted)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isAudioMuted ? 'volume-mute' : 'volume-high'}
                  size={18}
                  color={COLORS.white}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.gmapsCircleBtn}
                onPress={() => setMapType(mapType === 'directions' ? 'vector' : 'directions')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={mapType === 'directions' ? 'layers-outline' : 'google-maps'}
                  size={18}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Google Maps Bottom ETA & Travel Time Dashboard */}
          <View style={styles.gmapsBottomHud}>
            <View style={styles.gmapsEtaLeft}>
              <Text style={styles.gmapsEtaDuration}>{currentStep.etaMin}</Text>
              <View style={styles.gmapsEtaSubRow}>
                <Text style={styles.gmapsDistanceText}>{currentStep.remKm}</Text>
                <Text style={styles.gmapsDotSep}>•</Text>
                <Text style={styles.gmapsArrivalText}>10:30 AM</Text>
              </View>
            </View>

            {/* Google Maps Exit Red Button */}
            <TouchableOpacity
              style={styles.gmapsExitBtn}
              onPress={() => setNavModalVisible(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Turn Step Stepper (Prev / Next Step) */}
          <View style={styles.gmapsStepStepper}>
            <TouchableOpacity
              style={[styles.gmapsStepperBtn, currentStepIndex === 0 && { opacity: 0.35 }]}
              onPress={handlePrevGpsStep}
              disabled={currentStepIndex === 0}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={16} color={COLORS.white} />
              <Text style={styles.gmapsStepperBtnText}>Previous</Text>
            </TouchableOpacity>

            <View style={styles.gmapsStepperIndicator}>
              <Text style={styles.gmapsStepCountText}>
                Step {currentStepIndex + 1} of {GOOGLE_NAV_STEPS.length}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.gmapsStepperBtn,
                styles.gmapsStepperBtnNext,
                currentStepIndex === GOOGLE_NAV_STEPS.length - 1 && { backgroundColor: COLORS.googleGreen },
              ]}
              onPress={handleNextGpsStep}
              activeOpacity={0.8}
            >
              <Text style={styles.gmapsStepperBtnNextText}>
                {currentStepIndex === GOOGLE_NAV_STEPS.length - 1 ? 'Arrived ✓' : 'Next Turn →'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Direction Steps Accordion */}
          <View style={styles.gmapsTurnList}>
            <Text style={styles.gmapsTurnListHeader}>DIRECTIONS PREVIEW</Text>
            {GOOGLE_NAV_STEPS.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPassed = idx < currentStepIndex;

              return (
                <TouchableOpacity
                  key={step.id}
                  style={[styles.gmapsTurnRow, isCurrent && styles.gmapsTurnRowActive]}
                  onPress={() => setCurrentStepIndex(idx)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.gmapsTurnIconWrap,
                      isCurrent && { backgroundColor: COLORS.googleGreen },
                      isPassed && { backgroundColor: '#334155' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={step.maneuver as any}
                      size={16}
                      color={isCurrent || isPassed ? COLORS.white : COLORS.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.gmapsTurnTitle,
                        isCurrent && { color: COLORS.white, fontWeight: '700' },
                        isPassed && { color: COLORS.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {step.instruction}
                    </Text>
                    <Text style={styles.gmapsTurnSub} numberOfLines={1}>
                      {step.street}
                    </Text>
                  </View>
                  <Text style={styles.gmapsTurnDist}>{step.distance}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
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

  // ==================== Google Maps Styles ====================
  googleNavContainer: {
    paddingVertical: 2,
  },
  gmapsTopBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.googleGreen,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 10,
    shadowColor: COLORS.googleGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  gmapsIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gmapsDistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gmapsDistText: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  gmapsNextChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gmapsNextChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  gmapsStreetText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 1,
  },
  gmapsSubInstruction: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  gmapsCanvasBox: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  gmapsSpeedBubble: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  gmapsSpeedNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 18,
  },
  gmapsSpeedUnit: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
  },
  gmapsFloatingControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 8,
  },
  gmapsCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gmapsBottomHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  gmapsEtaLeft: {
    flex: 1,
  },
  gmapsEtaDuration: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  gmapsEtaSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  gmapsDistanceText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  gmapsDotSep: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  gmapsArrivalText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  gmapsExitBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  gmapsStepStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 10,
  },
  gmapsStepperBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  gmapsStepperBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  gmapsStepperIndicator: {
    alignItems: 'center',
  },
  gmapsStepCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  gmapsStepperBtnNext: {
    backgroundColor: COLORS.googleBlue,
    borderColor: COLORS.googleBlue,
  },
  gmapsStepperBtnNextText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  gmapsTurnList: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  gmapsTurnListHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  gmapsTurnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 10,
  },
  gmapsTurnRowActive: {
    backgroundColor: 'rgba(15, 157, 88, 0.15)',
  },
  gmapsTurnIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gmapsTurnTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  gmapsTurnSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  gmapsTurnDist: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
});
