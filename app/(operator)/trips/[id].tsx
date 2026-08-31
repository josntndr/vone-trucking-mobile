/**
 * Trip Detail Screen
 * Shows complete trip information, timeline, status history, and actions
 * Redesigned with Executive Dark Mode design system
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Screen,
  Card,
  LoadingSpinner,
  ErrorState,
  ConfirmDialog,
} from '../../../src/components';
import { getTripById, cancelTrip, duplicateTrip } from '../../../src/services/api/trip.service';
import { Trip, getTripStatusInfo, getNextPossibleStatuses, TripStatus } from '../../../src/types/trip.types';
import {
  formatPhilippineDate,
  formatPhilippineDateTime,
  formatPeso,
} from '../../../src/utils/philippines';
import { formatPlantRoute } from '../../../src/config/plant.config';

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

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const loadTrip = async () => {
    try {
      const response = await getTripById(id);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setTrip(response.data);
      }
    } catch (err) {
      setError('Failed to load trip details');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTrip();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    setError(null);
    loadTrip();
  };

  const handleCancelTrip = async () => {
    if (!cancellationReason.trim() || cancellationReason.length < 10) {
      Alert.alert('Error', 'Please provide a cancellation reason (at least 10 characters)');
      return;
    }

    setCancelDialogVisible(false);
    setLoading(true);

    const response = await cancelTrip({
      trip_id: id,
      reason: cancellationReason,
    });

    if (response.error) {
      Alert.alert('Error', response.error);
      setLoading(false);
    } else {
      Alert.alert('Success', 'Trip cancelled successfully', [
        { text: 'OK', onPress: () => loadTrip() },
      ]);
    }
  };

  const handleDuplicateTrip = () => {
    Alert.alert(
      'Duplicate Trip',
      'Create a copy of this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Duplicate',
          onPress: async () => {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            const response = await duplicateTrip({
              source_trip_id: id,
              new_delivery_date: tomorrowStr,
              new_call_time: trip?.call_time || '08:00',
              copy_assignments: true,
            });

            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Trip duplicated successfully', [
                {
                  text: 'View New Trip',
                  onPress: () => router.replace(`/(operator)/trips/${response.data?.id}`),
                },
                { text: 'Stay Here' },
              ]);
            }
          },
        },
      ]
    );
  };

  if (loading && !trip) {
    return (
      <Screen style={{ backgroundColor: COLORS.background }}>
        <LoadingSpinner />
      </Screen>
    );
  }

  if (error || !trip) {
    return (
      <Screen style={{ backgroundColor: COLORS.background }}>
        <ErrorState message={error || 'Trip not found'} onRetry={loadTrip} />
      </Screen>
    );
  }

  const statusInfo = getTripStatusInfo(trip.status);
  const canEdit = ['draft', 'scheduled'].includes(trip.status);
  const canAssign = !['cancelled', 'completed'].includes(trip.status);
  const canCancel = !['cancelled', 'completed'].includes(trip.status);

  // Format destination display
  const routeDisplay = formatPlantRoute(trip.delivery_destination || 'Destination');

  return (
    <Screen style={{ backgroundColor: COLORS.background }}>
      <ScrollView
        style={styles.container}
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
        {/* Back Button Header */}
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            <Text style={styles.backButtonText}>Trips</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Trip Identifier Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <Text style={styles.tripNumber}>{trip.trip_number}</Text>
              {trip.delivery_reference ? (
                <Text style={styles.deliveryRef}>
                  REF: {trip.delivery_reference}
                </Text>
              ) : null}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '22', borderColor: statusInfo.color + '55' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Actions Row */}
        <View style={styles.actionsContainer}>
          {canEdit && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              onPress={() => router.push(`/(operator)/trips/edit/${trip.id}`)}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={17} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}

          {canAssign && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#0284C7' }]}
              onPress={() => router.push(`/(operator)/trips/assign/${trip.id}`)}
              activeOpacity={0.8}
            >
              <Ionicons name="people-outline" size={17} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Assign Team</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.orange }]}
            onPress={handleDuplicateTrip}
            activeOpacity={0.8}
          >
            <Ionicons name="copy-outline" size={17} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Duplicate</Text>
          </TouchableOpacity>

          {['in_transit', 'loading', 'dispatched'].includes(trip.status) && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              onPress={() => Alert.alert('Track Trip', 'Live GPS telemetry is active for this trip.')}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate-outline" size={17} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Track</Text>
            </TouchableOpacity>
          )}

          {canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.error }]}
              onPress={() => setCancelDialogVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={17} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Schedule Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <Card style={styles.contentCard}>
            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
                <Ionicons name="calendar" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Delivery Date</Text>
                <Text style={styles.infoValue}>
                  {formatPhilippineDate(trip.delivery_date)}
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                <Ionicons name="time" size={18} color={COLORS.orange} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Call Time</Text>
                <Text style={styles.infoValue}>{trip.call_time || '08:00'}</Text>
              </View>
            </View>

            {trip.estimated_duration_hours ? (
              <>
                <View style={styles.cardDivider} />
                <View style={styles.infoRow}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                    <Ionicons name="hourglass" size={18} color={COLORS.success} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Estimated Duration</Text>
                    <Text style={styles.infoValue}>
                      {trip.estimated_duration_hours} hours
                    </Text>
                  </View>
                </View>
              </>
            ) : null}
          </Card>
        </View>

        {/* Location Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>
          <Card style={styles.contentCard}>
            <View style={styles.locationBlock}>
              <View style={styles.locationHeader}>
                <Ionicons name="arrow-up-circle" size={18} color={COLORS.primary} />
                <Text style={[styles.locationLabel, { color: COLORS.primary }]}>PICKUP</Text>
              </View>
              <Text style={styles.locationName}>
                {trip.pickup_warehouse || 'Imus Plant'}
              </Text>
              {trip.pickup_address ? (
                <Text style={styles.locationAddress}>
                  {trip.pickup_address}
                </Text>
              ) : null}
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.locationBlock}>
              <View style={styles.locationHeader}>
                <Ionicons name="arrow-down-circle" size={18} color={COLORS.success} />
                <Text style={[styles.locationLabel, { color: COLORS.success }]}>DELIVERY</Text>
              </View>
              <Text style={styles.locationName}>
                {trip.delivery_destination || 'Destination'}
              </Text>
              {trip.delivery_address ? (
                <Text style={styles.locationAddress}>
                  {trip.delivery_address}
                </Text>
              ) : null}
              {trip.store_branch_name ? (
                <Text style={styles.locationDetail}>
                  Branch: {trip.store_branch_name}
                </Text>
              ) : null}
            </View>
          </Card>
        </View>

        {/* Cargo Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          <Card style={styles.contentCard}>
            <Text style={styles.cargoDescription}>
              {trip.cargo_description || 'General Cargo / Merchandise'}
            </Text>

            {(trip.cargo_weight_kg || trip.cargo_volume_cbm || trip.number_of_items) ? (
              <View style={styles.cargoSpecs}>
                {trip.cargo_weight_kg ? (
                  <View style={styles.cargoSpecChip}>
                    <Ionicons name="barbell-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.cargoSpecText}>
                      {trip.cargo_weight_kg} kg
                    </Text>
                  </View>
                ) : null}
                {trip.cargo_volume_cbm ? (
                  <View style={styles.cargoSpecChip}>
                    <Ionicons name="cube-outline" size={14} color={COLORS.orange} />
                    <Text style={styles.cargoSpecText}>
                      {trip.cargo_volume_cbm} m³
                    </Text>
                  </View>
                ) : null}
                {trip.number_of_items ? (
                  <View style={styles.cargoSpecChip}>
                    <Ionicons name="list-outline" size={14} color={COLORS.success} />
                    <Text style={styles.cargoSpecText}>
                      {trip.number_of_items} items
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </Card>
        </View>

        {/* Team Assignments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Team</Text>
          <Card style={styles.contentCard}>
            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
                <Ionicons name="car-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Assigned Truck</Text>
                <Text style={styles.infoValue}>
                  {trip.assigned_truck_number || 'Not assigned'}
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.infoRow}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="person-outline" size={18} color={COLORS.success} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Driver</Text>
                <Text style={styles.infoValue}>
                  {trip.assigned_driver_name || 'Not assigned'}
                </Text>
              </View>
            </View>

            {trip.assignments && trip.assignments.length > 0 ? (
              <>
                <View style={styles.cardDivider} />
                <View style={styles.infoRow}>
                  <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                    <Ionicons name="people-outline" size={18} color={COLORS.orange} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Helpers / Porters</Text>
                    {trip.assignments.filter(a => a.role === 'porter').map((assignment) => (
                      <View key={assignment.id} style={styles.porterRow}>
                        <Text style={styles.infoValue}>
                          {assignment.employee_name}
                        </Text>
                        {assignment.status === 'acknowledged' ? (
                          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        ) : (
                          <Ionicons name="time" size={16} color={COLORS.warning} />
                        )}
                      </View>
                    ))}
                    {trip.assignments.filter(a => a.role === 'porter').length === 0 ? (
                      <Text style={styles.infoValue}>None assigned</Text>
                    ) : null}
                  </View>
                </View>
              </>
            ) : null}
          </Card>
        </View>

        {/* Financial */}
        {trip.expected_income ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Income & Budget</Text>
            <Card style={styles.contentCard}>
              <View style={styles.infoRow}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Ionicons name="cash-outline" size={20} color={COLORS.success} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Expected Income</Text>
                  <Text style={[styles.infoValue, { color: COLORS.success, fontSize: 18 }]}>
                    {formatPeso(trip.expected_income)}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        ) : null}

        {/* Instructions */}
        {(trip.special_instructions || trip.delivery_instructions) ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Card style={styles.contentCard}>
              {trip.special_instructions ? (
                <View style={styles.instructionBlock}>
                  <Text style={styles.instructionLabel}>Special Instructions</Text>
                  <Text style={styles.instructionText}>{trip.special_instructions}</Text>
                </View>
              ) : null}

              {trip.delivery_instructions ? (
                <View style={[styles.instructionBlock, trip.special_instructions ? { marginTop: 12 } : null]}>
                  <Text style={styles.instructionLabel}>Delivery Instructions</Text>
                  <Text style={styles.instructionText}>{trip.delivery_instructions}</Text>
                </View>
              ) : null}
            </Card>
          </View>
        ) : null}

        {/* Activity Timeline */}
        {trip.status_history && trip.status_history.length > 0 ? (
          <View style={[styles.section, { paddingBottom: 24 }]}>
            <Text style={styles.sectionTitle}>Activity Timeline</Text>
            <Card style={styles.contentCard}>
              {trip.status_history
                .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
                .map((history, index) => {
                  const historyStatusInfo = getTripStatusInfo(history.new_status);
                  const isLast = index === trip.status_history!.length - 1;

                  return (
                    <View key={history.id}>
                      <View style={styles.timelineItem}>
                        <View
                          style={[
                            styles.timelineDot,
                            { backgroundColor: historyStatusInfo.color },
                          ]}
                        />
                        <View style={styles.timelineContent}>
                          <View style={styles.timelineHeader}>
                            <Text style={styles.timelineStatus}>
                              {historyStatusInfo.label}
                            </Text>
                            <Text style={styles.timelineDate}>
                              {formatPhilippineDateTime(history.changed_at)}
                            </Text>
                          </View>

                          {history.changed_by_name ? (
                            <Text style={styles.timelineUser}>
                              by {history.changed_by_name}
                            </Text>
                          ) : null}

                          {history.location ? (
                            <View style={styles.timelineDetail}>
                              <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
                              <Text style={styles.timelineDetailText}>
                                {history.location}
                              </Text>
                            </View>
                          ) : null}

                          {history.notes ? (
                            <Text style={styles.timelineNotes}>
                              "{history.notes}"
                            </Text>
                          ) : null}

                          {history.reason ? (
                            <View style={styles.reasonBlock}>
                              <Text style={styles.reasonText}>
                                Reason: {history.reason}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                      {!isLast ? <View style={styles.timelineLine} /> : null}
                    </View>
                  );
                })}
            </Card>
          </View>
        ) : null}
      </ScrollView>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelDialogVisible}
        onClose={() => {
          setCancelDialogVisible(false);
          setCancellationReason('');
        }}
        title="Cancel Trip"
        message={`Please confirm cancellation of this trip.\n\nReason: ${cancellationReason || '(none provided)'}`}
        onConfirm={handleCancelTrip}
        confirmLabel="Cancel Trip"
        isDestructive={true}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerCard: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  tripNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  deliveryRef: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    minHeight: 40,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  section: {
    marginTop: 14,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  contentCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  locationBlock: {
    paddingVertical: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  locationDetail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cargoDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  cargoSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  cargoSpecChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cargoSpecText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  porterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  instructionBlock: {
    paddingVertical: 2,
  },
  instructionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  timelineDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  timelineUser: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  timelineDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timelineDetailText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timelineNotes: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  reasonBlock: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.orange,
  },
  timelineLine: {
    width: 1.5,
    height: 18,
    backgroundColor: COLORS.border,
    marginLeft: 4,
    marginVertical: 2,
  },
});
