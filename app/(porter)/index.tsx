/**
 * Porter / Helper Home Screen - Executive Dark Theme
 * Comprehensive helper workflow: Assignment, Cargo Checklist, Interactive Status Transitions
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
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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

// Initial assignment data for helper
const INITIAL_ASSIGNMENT = {
  id: '1',
  tripNumber: 'VT-2024-001',
  status: TripStatus.LOADING,
  truckNumber: 'ABC-1234',
  driverName: 'Juan Dela Cruz',
  callTime: '06:00 AM',
  pickup: 'Metro Manila Warehouse',
  pickupAddress: '123 Quezon Ave, Quezon City',
  delivery: 'SM Megamall',
  deliveryAddress: '456 EDSA, Mandaluyong City',
  itemsCount: 120,
  itemsLoaded: 78,
};

const INITIAL_CHECKLIST = [
  { id: '1', label: 'Inspect truck condition', completed: true },
  { id: '2', label: 'Verify cargo manifest', completed: true },
  { id: '3', label: 'Load items carefully', completed: false },
  { id: '4', label: 'Secure cargo properly', completed: false },
  { id: '5', label: 'Final inspection & sign off', completed: false },
];

const DEMO_UPCOMING_ASSIGNMENTS = [
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

export default function PorterHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [hasActiveAssignment, setHasActiveAssignment] = useState(true);
  const [currentAssignment, setCurrentAssignment] = useState(INITIAL_ASSIGNMENT);
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [handledCount, setHandledCount] = useState(120);

  // Modals state
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Perform helper status transitions
  const executeAssignmentAction = () => {
    setActionModalVisible(false);
    const status = currentAssignment.status;

    if (status === TripStatus.LOADING) {
      // Mark all checklist items as completed
      setChecklist((prev) => prev.map((item) => ({ ...item, completed: true })));
      setCurrentAssignment((prev) => ({
        ...prev,
        status: TripStatus.IN_TRANSIT,
        itemsLoaded: prev.itemsCount,
      }));
      setFeedbackMessage('Loading verified! Truck is now in transit to delivery destination.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    } else if (status === TripStatus.IN_TRANSIT) {
      setCurrentAssignment((prev) => ({
        ...prev,
        status: TripStatus.UNLOADING,
      }));
      setFeedbackMessage('Arrival confirmed! Prepare for cargo unloading and customer handover.');
      setTimeout(() => setFeedbackMessage(null), 5000);
    } else if (status === TripStatus.UNLOADING) {
      setCurrentAssignment((prev) => ({
        ...prev,
        status: TripStatus.COMPLETED,
      }));
      setHandledCount((prev) => prev + currentAssignment.itemsCount);
      setFeedbackMessage('Unloading completed! Handover recorded in your helper earnings.');
      setTimeout(() => setFeedbackMessage(null), 6000);
    } else if (status === TripStatus.COMPLETED) {
      setCurrentAssignment(INITIAL_ASSIGNMENT);
      setChecklist(INITIAL_CHECKLIST);
      setFeedbackMessage('Assignment status reset for demonstration.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const getPrimaryActionConfig = () => {
    const status = currentAssignment.status;

    switch (status) {
      case TripStatus.LOADING:
        return {
          label: 'Complete Loading',
          icon: 'check-circle' as const,
          color: COLORS.success,
          modalTitle: 'Complete Cargo Loading',
          modalDesc: `Confirm that all ${currentAssignment.itemsCount} items are safely loaded and secured onto Truck ${currentAssignment.truckNumber}.`,
          confirmLabel: 'Confirm Loading Complete',
        };
      case TripStatus.IN_TRANSIT:
        return {
          label: 'Arrived at Destination',
          icon: 'map-marker-check' as const,
          color: COLORS.primary,
          modalTitle: 'Confirm Arrival',
          modalDesc: `You have arrived at ${currentAssignment.delivery}. Begin unloading preparations with Driver ${currentAssignment.driverName}.`,
          confirmLabel: 'Confirm Arrival at Site',
        };
      case TripStatus.UNLOADING:
        return {
          label: 'Complete Unloading',
          icon: 'check-circle' as const,
          color: COLORS.orange,
          modalTitle: 'Complete Unloading',
          modalDesc: `Confirm that all items have been inspected, unloaded, and received by ${currentAssignment.delivery}.`,
          confirmLabel: 'Finish Unloading & Sign Off',
        };
      case TripStatus.COMPLETED:
        return {
          label: 'Assignment Completed ✓ (Reset Demo)',
          icon: 'check-all' as const,
          color: '#475569',
          modalTitle: 'Reset Assignment Demo',
          modalDesc: 'This assignment is completed. Would you like to reset the demo back to Loading state?',
          confirmLabel: 'Reset Demo Assignment',
        };
      default:
        return {
          label: 'Complete Loading',
          icon: 'check-circle' as const,
          color: COLORS.success,
          modalTitle: 'Complete Loading',
          modalDesc: 'Verify cargo loading.',
          confirmLabel: 'Confirm',
        };
    }
  };

  const getStatusChipConfig = () => {
    switch (currentAssignment.status) {
      case TripStatus.LOADING:
        return { status: 'in-progress' as const, label: 'Loading Cargo' };
      case TripStatus.IN_TRANSIT:
        return { status: 'in-progress' as const, label: 'In Transit' };
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
  const completedChecklistCount = checklist.filter((item) => item.completed).length;
  const loadingPct = Math.round((currentAssignment.itemsLoaded / currentAssignment.itemsCount) * 100);

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
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.name}>
                {user?.user_metadata?.first_name || 'Pedro'}
              </Text>
            </View>
            <View style={styles.rolePill}>
              <View style={styles.roleLiveDot} />
              <Text style={styles.rolePillText}>Active Helper</Text>
            </View>
          </View>
        </View>

        {/* Live Feedback Toast Banner */}
        {feedbackMessage ? (
          <View style={styles.feedbackBanner}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.feedbackText}>{feedbackMessage}</Text>
          </View>
        ) : null}

        {/* Current Assignment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CURRENT ASSIGNMENT</Text>

          {!hasActiveAssignment ? (
            <EmptyStateCard
              iconName="dolly"
              title="No Active Assignment"
              description="You don't have any assignments in progress. Check your upcoming trips or contact dispatch."
              actionLabel="View Assignments"
              onActionPress={() => router.push('/(porter)/trips')}
            />
          ) : (
            <View style={styles.assignmentCard}>
              {/* Card Header */}
              <View style={styles.assignmentHeader}>
                <View style={styles.assignmentHeaderLeft}>
                  <MaterialCommunityIcons name="dolly" size={24} color={COLORS.primary} />
                  <Text style={styles.tripNumber}>{currentAssignment.tripNumber}</Text>
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
                  <Text style={styles.detailValue}>{currentAssignment.callTime}</Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="truck" size={18} color={COLORS.orange} />
                  <Text style={styles.detailLabel}>Truck:</Text>
                  <Text style={styles.detailValue}>{currentAssignment.truckNumber}</Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="steering" size={18} color={COLORS.primary} />
                  <Text style={styles.detailLabel}>Driver:</Text>
                  <Text style={styles.detailValue}>{currentAssignment.driverName}</Text>
                </View>
              </View>

              {/* Loading Progress Bar */}
              <View style={styles.progressBox}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>CARGO LOADING PROGRESS</Text>
                  <Text style={styles.progressCount}>
                    {currentAssignment.itemsLoaded}/{currentAssignment.itemsCount}
                  </Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${loadingPct}%` }]} />
                </View>
                <Text style={styles.progressSubtext}>{loadingPct}% Complete</Text>
              </View>

              {/* Route Section */}
              <View style={styles.routeSection}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: COLORS.info }]} />
                  <View style={styles.routeContent}>
                    <Text style={[styles.routeLabel, { color: COLORS.info }]}>PICKUP</Text>
                    <Text style={styles.routeLocation}>{currentAssignment.pickup}</Text>
                    <Text style={styles.routeAddress}>{currentAssignment.pickupAddress}</Text>
                  </View>
                </View>

                <View style={styles.routeLine} />

                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, { backgroundColor: COLORS.success }]} />
                  <View style={styles.routeContent}>
                    <Text style={[styles.routeLabel, { color: COLORS.success }]}>DELIVERY</Text>
                    <Text style={styles.routeLocation}>{currentAssignment.delivery}</Text>
                    <Text style={styles.routeAddress}>{currentAssignment.deliveryAddress}</Text>
                  </View>
                </View>
              </View>

              {/* Primary Action Button (Complete Loading / Arrived / Unloading) */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: actionConfig.color }]}
                onPress={() => setActionModalVisible(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name={actionConfig.icon} size={22} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>{actionConfig.label}</Text>
              </TouchableOpacity>

              {/* Secondary Action: Report Product Issue */}
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/(porter)/reports')}
                activeOpacity={0.7}
              >
                <Ionicons name="alert-circle-outline" size={18} color={COLORS.error} />
                <Text style={[styles.secondaryButtonText, { color: COLORS.error }]}>
                  Report Product Issue
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Loading Checklist Section */}
        {hasActiveAssignment && (
          <View style={styles.section}>
            <View style={styles.checklistCard}>
              <View style={styles.checklistHeader}>
                <Text style={styles.checklistTitle}>Loading Checklist</Text>
                <View style={styles.checklistBadge}>
                  <Text style={styles.checklistBadgeText}>
                    {completedChecklistCount}/{checklist.length}
                  </Text>
                </View>
              </View>

              <View style={styles.checklistItems}>
                {checklist.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.checklistItem,
                      index < checklist.length - 1 && styles.checklistItemBorder,
                    ]}
                    onPress={() => toggleChecklistItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkboxCircle,
                        item.completed && styles.checkboxCircleCompleted,
                      ]}
                    >
                      {item.completed && (
                        <Ionicons name="checkmark" size={14} color={COLORS.white} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.checklistItemLabel,
                        item.completed && styles.checklistItemCompleted,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Today's Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S SUMMARY</Text>
          <View style={styles.statsRow}>
            <StatCard label="Assigned Trips" value={2} icon="dolly" variant="primary" />
            <StatCard label="Items Handled" value={handledCount} icon="package-variant" variant="success" />
          </View>
        </View>

        {/* Upcoming Assignments */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>UPCOMING TRIPS</Text>
            <TouchableOpacity onPress={() => router.push('/(porter)/trips')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.upcomingTripsContainer}>
            {DEMO_UPCOMING_ASSIGNMENTS.map((trip, index) => (
              <TouchableOpacity
                key={trip.id}
                onPress={() => router.push('/(porter)/trips')}
                activeOpacity={0.75}
                style={[
                  styles.upcomingTripCard,
                  index < DEMO_UPCOMING_ASSIGNMENTS.length - 1 && styles.upcomingTripCardMargin,
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

      {/* ==================== Assignment Action Modal ==================== */}
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

          <Text style={styles.modalTripTitle}>{currentAssignment.tripNumber}</Text>
          <Text style={styles.modalDescText}>{actionConfig.modalDesc}</Text>

          {/* Quick Route Summary in Modal */}
          <View style={styles.modalRouteBox}>
            <View style={styles.modalRouteRow}>
              <Ionicons name="ellipse" size={10} color={COLORS.info} />
              <Text style={styles.modalRoutePoint}>{currentAssignment.pickup}</Text>
            </View>
            <View style={styles.modalRouteLine} />
            <View style={styles.modalRouteRow}>
              <Ionicons name="ellipse" size={10} color={COLORS.success} />
              <Text style={styles.modalRoutePoint}>{currentAssignment.delivery}</Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.modalConfirmBtn, { backgroundColor: actionConfig.color }]}
            onPress={executeAssignmentAction}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderColor: 'rgba(14, 165, 233, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  roleLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
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
  assignmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  assignmentHeaderLeft: {
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
  progressBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
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
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  checklistCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  checklistBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderColor: 'rgba(14, 165, 233, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  checklistBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  checklistItems: {
    gap: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  checklistItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.5)',
  },
  checkboxCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxCircleCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checklistItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  checklistItemCompleted: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
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
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
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
});
