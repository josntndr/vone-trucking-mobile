/**
 * Trip Detail Screen
 * Shows complete trip information, timeline, status history, and actions
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
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  Card,
  StatusChip,
  LoadingSpinner,
  ErrorState,
  ConfirmDialog,
  Button,
} from '../../../src/components';
import { useTheme } from '../../../src/hooks';
import { getTripById, cancelTrip, duplicateTrip } from '../../../src/services/api/trip.service';
import { Trip, getTripStatusInfo, getNextPossibleStatuses } from '../../../src/types/trip.types';
import {
  formatPhilippineDate,
  formatPhilippineDateTime,
  formatPeso,
} from '../../../src/utils/philippines';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
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
      <Screen>
        <LoadingSpinner />
      </Screen>
    );
  }

  if (error || !trip) {
    return (
      <Screen>
        <ErrorState message={error || 'Trip not found'} onRetry={loadTrip} />
      </Screen>
    );
  }

  const statusInfo = getTripStatusInfo(trip.status);
  const nextStatuses = getNextPossibleStatuses(trip.status);
  const canEdit = ['draft', 'scheduled'].includes(trip.status);
  const canAssign = !['cancelled', 'completed'].includes(trip.status);
  const canCancel = !['cancelled', 'completed'].includes(trip.status);

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Card */}
        <Card style={[styles.headerCard, { marginHorizontal: spacing.md, marginTop: spacing.md }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <Text style={[styles.tripNumber, { color: colors.text }]}>{trip.trip_number}</Text>
              <Text style={[styles.deliveryRef, { color: colors.textSecondary }]}>
                {trip.delivery_reference}
              </Text>
            </View>
            <StatusChip label={statusInfo.label} color={statusInfo.color} icon={statusInfo.icon} />
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={[styles.actionsContainer, { paddingHorizontal: spacing.md }]}>
          {canEdit && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/(operator)/trips/edit/${trip.id}`)}
            >
              <Ionicons name="create-outline" size={18} color={colors.surface} />
              <Text style={[styles.actionButtonText, { color: colors.surface }]}>Edit</Text>
            </TouchableOpacity>
          )}

          {canAssign && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.info }]}
              onPress={() => router.push(`/(operator)/trips/assign/${trip.id}`)}
            >
              <Ionicons name="people-outline" size={18} color={colors.surface} />
              <Text style={[styles.actionButtonText, { color: colors.surface }]}>Assign</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accent }]}
            onPress={handleDuplicateTrip}
          >
            <Ionicons name="copy-outline" size={18} color={colors.surface} />
            <Text style={[styles.actionButtonText, { color: colors.surface }]}>Duplicate</Text>
          </TouchableOpacity>

          {canCancel && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={() => setCancelDialogVisible(true)}
            >
              <Ionicons name="close-circle-outline" size={18} color={colors.surface} />
              <Text style={[styles.actionButtonText, { color: colors.surface }]}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Schedule Information */}
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Schedule</Text>
          <Card>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Delivery Date
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatPhilippineDate(trip.delivery_date)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Call Time</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{trip.call_time}</Text>
              </View>
            </View>

            {trip.estimated_duration_hours && (
              <View style={styles.infoRow}>
                <Ionicons name="hourglass" size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Estimated Duration
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {trip.estimated_duration_hours} hours
                  </Text>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Location Information */}
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Locations</Text>
          <Card>
            <View style={styles.locationBlock}>
              <View style={styles.locationHeader}>
                <Ionicons name="arrow-up-circle" size={20} color={colors.info} />
                <Text style={[styles.locationLabel, { color: colors.info }]}>Pickup</Text>
              </View>
              <Text style={[styles.locationName, { color: colors.text }]}>
                {trip.pickup_warehouse}
              </Text>
              {trip.pickup_address && (
                <Text style={[styles.locationAddress, { color: colors.textSecondary }]}>
                  {trip.pickup_address}
                </Text>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.locationBlock}>
              <View style={styles.locationHeader}>
                <Ionicons name="arrow-down-circle" size={20} color={colors.success} />
                <Text style={[styles.locationLabel, { color: colors.success }]}>Delivery</Text>
              </View>
              <Text style={[styles.locationName, { color: colors.text }]}>
                {trip.delivery_destination}
              </Text>
              <Text style={[styles.locationAddress, { color: colors.textSecondary }]}>
                {trip.delivery_address}
              </Text>
              {trip.store_branch_name && (
                <Text style={[styles.locationDetail, { color: colors.textSecondary }]}>
                  {trip.store_branch_name}
                </Text>
              )}
            </View>
          </Card>
        </View>

        {/* Cargo Information */}
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cargo Details</Text>
          <Card>
            <Text style={[styles.cargoDescription, { color: colors.text }]}>
              {trip.cargo_description}
            </Text>

            {(trip.cargo_weight_kg || trip.cargo_volume_cbm || trip.number_of_items) && (
              <View style={styles.cargoSpecs}>
                {trip.cargo_weight_kg && (
                  <View style={styles.cargoSpec}>
                    <Ionicons name="barbell" size={16} color={colors.textSecondary} />
                    <Text style={[styles.cargoSpecText, { color: colors.textSecondary }]}>
                      {trip.cargo_weight_kg} kg
                    </Text>
                  </View>
                )}
                {trip.cargo_volume_cbm && (
                  <View style={styles.cargoSpec}>
                    <Ionicons name="cube" size={16} color={colors.textSecondary} />
                    <Text style={[styles.cargoSpecText, { color: colors.textSecondary }]}>
                      {trip.cargo_volume_cbm} m³
                    </Text>
                  </View>
                )}
                {trip.number_of_items && (
                  <View style={styles.cargoSpec}>
                    <Ionicons name="list" size={16} color={colors.textSecondary} />
                    <Text style={[styles.cargoSpecText, { color: colors.textSecondary }]}>
                      {trip.number_of_items} items
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        </View>

        {/* Assignments */}
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Assignments</Text>
          <Card>
            <View style={styles.infoRow}>
              <Ionicons name="car" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Truck</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {trip.assigned_truck_number || 'Not assigned'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={colors.textSecondary} />
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Driver</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {trip.assigned_driver_name || 'Not assigned'}
                </Text>
              </View>
            </View>

            {trip.assignments && trip.assignments.length > 0 && (
              <View style={styles.infoRow}>
                <Ionicons name="people" size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Porters</Text>
                  {trip.assignments.filter(a => a.role === 'porter').map((assignment) => (
                    <View key={assignment.id} style={styles.porterRow}>
                      <Text style={[styles.infoValue, { color: colors.text }]}>
                        {assignment.employee_name}
                      </Text>
                      {assignment.status === 'acknowledged' && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      )}
                      {assignment.status === 'pending' && (
                        <Ionicons name="time" size={16} color={colors.warning} />
                      )}
                    </View>
                  ))}
                  {trip.assignments.filter(a => a.role === 'porter').length === 0 && (
                    <Text style={[styles.infoValue, { color: colors.text }]}>None assigned</Text>
                  )}
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Financial */}
        {trip.expected_income && (
          <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Financial</Text>
            <Card>
              <View style={styles.infoRow}>
                <Ionicons name="cash" size={20} color={colors.success} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Expected Income
                  </Text>
                  <Text style={[styles.incomeValue, { color: colors.success }]}>
                    {formatPeso(trip.expected_income)}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Instructions */}
        {(trip.special_instructions || trip.delivery_instructions) && (
          <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Instructions</Text>
            <Card>
              {trip.special_instructions && (
                <View style={styles.instructionBlock}>
                  <Text style={[styles.instructionLabel, { color: colors.textSecondary }]}>
                    Special Instructions
                  </Text>
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    {trip.special_instructions}
                  </Text>
                </View>
              )}

              {trip.delivery_instructions && (
                <View style={styles.instructionBlock}>
                  <Text style={[styles.instructionLabel, { color: colors.textSecondary }]}>
                    Delivery Instructions
                  </Text>
                  <Text style={[styles.instructionText, { color: colors.text }]}>
                    {trip.delivery_instructions}
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Status Timeline */}
        {trip.status_history && trip.status_history.length > 0 && (
          <View style={[styles.section, { paddingHorizontal: spacing.md, paddingBottom: spacing.xl }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Status Timeline</Text>
            <Card>
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
                            <Text style={[styles.timelineStatus, { color: colors.text }]}>
                              {historyStatusInfo.label}
                            </Text>
                            <Text style={[styles.timelineDate, { color: colors.textSecondary }]}>
                              {formatPhilippineDateTime(history.changed_at)}
                            </Text>
                          </View>

                          {history.changed_by_name && (
                            <Text style={[styles.timelineUser, { color: colors.textSecondary }]}>
                              by {history.changed_by_name}
                            </Text>
                          )}

                          {history.location && (
                            <View style={styles.timelineDetail}>
                              <Ionicons name="location" size={14} color={colors.textSecondary} />
                              <Text style={[styles.timelineDetailText, { color: colors.textSecondary }]}>
                                {history.location}
                              </Text>
                            </View>
                          )}

                          {history.notes && (
                            <Text style={[styles.timelineNotes, { color: colors.textSecondary }]}>
                              {history.notes}
                            </Text>
                          )}

                          {history.reason && (
                            <View
                              style={[
                                styles.reasonBlock,
                                { backgroundColor: colors.warning + '15' },
                              ]}
                            >
                              <Text style={[styles.reasonText, { color: colors.text }]}>
                                {history.reason}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      {!isLast && (
                        <View
                          style={[styles.timelineLine, { backgroundColor: colors.border }]}
                        />
                      )}
                    </View>
                  );
                })}
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Cancel Dialog */}
      <ConfirmDialog
        isOpen={cancelDialogVisible}
        onClose={() => {
          setCancelDialogVisible(false);
          setCancellationReason('');
        }}
        title="Cancel Trip"
        message={`Please provide a reason for cancellation (min 10 characters):\n\nReason: ${cancellationReason || '(not entered)'}`}
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
  },
  headerCard: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  tripNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  deliveryRef: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  locationBlock: {
    padding: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    lineHeight: 20,
  },
  locationDetail: {
    fontSize: 13,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  cargoDescription: {
    fontSize: 15,
    lineHeight: 22,
    padding: 16,
  },
  cargoSpecs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  cargoSpec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cargoSpecText: {
    fontSize: 14,
  },
  porterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  incomeValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  instructionBlock: {
    padding: 16,
  },
  instructionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    padding: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '700',
  },
  timelineDate: {
    fontSize: 12,
  },
  timelineUser: {
    fontSize: 13,
    marginBottom: 4,
  },
  timelineDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  timelineDetailText: {
    fontSize: 13,
  },
  timelineNotes: {
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic',
  },
  reasonBlock: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timelineLine: {
    width: 2,
    height: 20,
    marginLeft: 21,
  },
});
