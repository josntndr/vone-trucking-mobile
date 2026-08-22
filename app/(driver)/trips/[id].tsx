/**
 * Driver Trip Detail Screen
 * Shows full trip details with actions: acknowledge, navigate, update status
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { Button } from '../../../src/components/ui/Button';
import {
  getMyAssignments,
  updateTripStatus,
  acknowledgeAssignment,
  getCurrentLocation,
} from '../../../src/services/api/driver-porter.service';
import type { Assignment, StatusUpdatePayload } from '../../../src/types/driver-porter.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  formatPhilippineDate,
  formatPhilippineTime,
  formatPhilippinePeso,
} from '../../../src/utils/philippines';
import {
  canTransitionStatus,
  getStatusAction,
  requiresLocation,
} from '../../../src/types/driver-porter.types';
import type { TripStatus } from '../../../src/types/trip.types';

export default function DriverTripDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const tripId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    loadTripDetails();
  }, [tripId]);

  const loadTripDetails = async () => {
    try {
      // Load all assignments and find the one matching this trip
      const response = await getMyAssignments();
      if (response.data) {
        const found = response.data.find((a) => a.trip_id === tripId);
        setAssignment(found || null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!assignment) return;

    Alert.alert(
      'Acknowledge Assignment',
      'Confirm that you have received and reviewed this trip assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Acknowledge',
          onPress: async () => {
            setUpdating(true);
            const locationResponse = await getCurrentLocation();
            const response = await acknowledgeAssignment(
              assignment.id,
              locationResponse.data
            );

            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Assignment acknowledged');
              loadTripDetails();
            }
            setUpdating(false);
          },
        },
      ]
    );
  };

  const handleNavigate = (destination: 'pickup' | 'delivery') => {
    if (!assignment) return;

    const trip = assignment.trip;
    const address =
      destination === 'pickup'
        ? trip.pickup_warehouse
        : trip.delivery_address || trip.delivery_destination;

    const encodedAddress = encodeURIComponent(address);

    Alert.alert('Open Navigation', 'Choose navigation app:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Google Maps',
        onPress: () => {
          const url =
            Platform.OS === 'ios'
              ? `comgooglemaps://?q=${encodedAddress}`
              : `google.navigation:q=${encodedAddress}`;
          Linking.openURL(url).catch(() => {
            // Fallback to web
            Linking.openURL(
              `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
            );
          });
        },
      },
      {
        text: 'Waze',
        onPress: () => {
          const url = `waze://?q=${encodedAddress}&navigate=yes`;
          Linking.openURL(url).catch(() => {
            // Fallback to web
            Linking.openURL(`https://www.waze.com/ul?q=${encodedAddress}`);
          });
        },
      },
    ]);
  };

  const handleStatusUpdate = async (newStatus: TripStatus) => {
    if (!assignment) return;

    const trip = assignment.trip;
    const statusInfo = getStatusAction(newStatus);

    // Validate transition
    if (!canTransitionStatus(trip.status, newStatus, 'driver')) {
      Alert.alert('Invalid Action', 'This status change is not allowed');
      return;
    }

    // Confirm action
    Alert.alert(
      `${statusInfo.label}`,
      `Update trip status to "${statusInfo.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdating(true);

            try {
              // Get location if required
              let location;
              if (requiresLocation(newStatus)) {
                const locationResponse = await getCurrentLocation();
                location = locationResponse.data;
              }

              const payload: StatusUpdatePayload = {
                trip_id: trip.id,
                new_status: newStatus,
                location,
              };

              const response = await updateTripStatus(payload);

              if (response.error) {
                Alert.alert('Error', response.error);
              } else {
                Alert.alert('Success', 'Trip status updated');
                loadTripDetails();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to update status');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const getNextActions = () => {
    if (!assignment) return [];

    const trip = assignment.trip;
    const actions: Array<{ status: TripStatus; label: string; icon: string; color: string }> =
      [];

    // Acknowledge
    if (assignment.assignment_status === 'pending') {
      return [
        {
          status: trip.status,
          label: 'Acknowledge Assignment',
          icon: 'check-circle',
          color: colors.success,
        },
      ];
    }

    // Status-based actions
    const transitions: Partial<Record<TripStatus, TripStatus[]>> = {
      assigned: ['acknowledged'],
      acknowledged: ['at_warehouse'],
      at_warehouse: ['loading'],
      loading: ['dispatched'],
      dispatched: ['in_transit'],
      in_transit: ['arrived'],
      arrived: ['unloading'],
      unloading: ['delivered'],
      delivered: ['returning'],
      returning: ['completed'],
    };

    const availableTransitions = transitions[trip.status as keyof typeof transitions] || [];

    availableTransitions.forEach((status) => {
      const info = getStatusAction(status);
      actions.push({
        status,
        label: info.label,
        icon: info.icon,
        color: info.color,
      });
    });

    return actions;
  };

  const renderActionButtons = () => {
    const actions = getNextActions();

    if (actions.length === 0) return null;

    // Special handling for acknowledgement
    if (
      assignment?.assignment_status === 'pending' &&
      actions[0].label === 'Acknowledge Assignment'
    ) {
      return (
        <Card style={styles.actionsCard}>
          <Button
            title="Acknowledge Assignment"
            onPress={handleAcknowledge}
            icon={
              <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
            }
            fullWidth
            size="large"
            disabled={updating}
          />
          <Text style={[styles.ackNote, { color: colors.textSecondary }]}>
            Tap to confirm you've received this trip assignment
          </Text>
        </Card>
      );
    }

    return (
      <Card style={styles.actionsCard}>
        <Text style={[styles.actionTitle, { color: colors.text }]}>Next Actions</Text>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.actionButton,
              { backgroundColor: action.color },
              updating && styles.actionButtonDisabled,
            ]}
            onPress={() => handleStatusUpdate(action.status)}
            disabled={updating}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name={action.icon as any}
              size={28}
              color="#fff"
            />
            <Text style={styles.actionButtonText}>{action.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        ))}
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading trip details...
        </Text>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Trip not found
        </Text>
      </View>
    );
  }

  const trip = assignment.trip;
  const statusInfo = getStatusAction(trip.status);
  const canNavigate =
    assignment.assignment_status === 'acknowledged' &&
    trip.status !== 'completed' &&
    trip.status !== 'cancelled';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Status Header */}
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View
            style={[
              styles.statusIconContainer,
              { backgroundColor: statusInfo.color + '20' },
            ]}
          >
            <MaterialCommunityIcons
              name={statusInfo.icon as any}
              size={32}
              color={statusInfo.color}
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.tripNumber, { color: colors.text }]}>
              {trip.trip_number}
            </Text>
            <Text style={[styles.statusLabel, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>
        <Text style={[styles.deliveryRef, { color: colors.textSecondary }]}>
          {trip.delivery_reference}
        </Text>
      </Card>

      {/* Action Buttons */}
      {renderActionButtons()}

      {/* Schedule Info */}
      <Card style={styles.infoCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Schedule</Text>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="calendar"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Date:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {formatPhilippineDate(trip.delivery_date)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
            Call Time:
          </Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {formatPhilippineTime(trip.call_time)}
          </Text>
        </View>
      </Card>

      {/* Locations */}
      <Card style={styles.locationsCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Locations</Text>

        {/* Pickup */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <MaterialCommunityIcons
              name="warehouse"
              size={24}
              color={colors.primary}
            />
            <View style={styles.locationInfo}>
              <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
                Pickup Warehouse
              </Text>
              <Text style={[styles.locationText, { color: colors.text }]}>
                {trip.pickup_warehouse}
              </Text>
            </View>
          </View>
          {canNavigate && (
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: colors.primary }]}
              onPress={() => handleNavigate('pickup')}
            >
              <MaterialCommunityIcons name="navigation" size={20} color="#fff" />
              <Text style={styles.navButtonText}>Navigate</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.locationDivider}>
          <MaterialCommunityIcons
            name="arrow-down"
            size={24}
            color={colors.textSecondary}
          />
        </View>

        {/* Delivery */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <MaterialCommunityIcons
              name="map-marker"
              size={24}
              color={colors.success}
            />
            <View style={styles.locationInfo}>
              <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
                Delivery Destination
              </Text>
              <Text style={[styles.locationText, { color: colors.text }]}>
                {trip.delivery_destination}
              </Text>
              {trip.delivery_address && (
                <Text style={[styles.locationAddress, { color: colors.textSecondary }]}>
                  {trip.delivery_address}
                </Text>
              )}
              {trip.store_branch_name && (
                <Text style={[styles.locationBranch, { color: colors.textSecondary }]}>
                  {trip.store_branch_name}
                </Text>
              )}
            </View>
          </View>
          {canNavigate && (
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: colors.success }]}
              onPress={() => handleNavigate('delivery')}
            >
              <MaterialCommunityIcons name="navigation" size={20} color="#fff" />
              <Text style={styles.navButtonText}>Navigate</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Cargo Details */}
      <Card style={styles.infoCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Cargo Details</Text>
        <View style={styles.cargoRow}>
          <MaterialCommunityIcons
            name="package-variant"
            size={20}
            color={colors.textSecondary}
          />
          <Text style={[styles.cargoText, { color: colors.text }]}>
            {trip.cargo_description}
          </Text>
        </View>
        {trip.cargo_weight_kg && (
          <View style={styles.cargoDetail}>
            <Text style={[styles.cargoLabel, { color: colors.textSecondary }]}>
              Weight:
            </Text>
            <Text style={[styles.cargoValue, { color: colors.text }]}>
              {trip.cargo_weight_kg} kg
            </Text>
          </View>
        )}
        {trip.number_of_items && (
          <View style={styles.cargoDetail}>
            <Text style={[styles.cargoLabel, { color: colors.textSecondary }]}>
              Items:
            </Text>
            <Text style={[styles.cargoValue, { color: colors.text }]}>
              {trip.number_of_items}
            </Text>
          </View>
        )}
      </Card>

      {/* Truck and Team */}
      <Card style={styles.infoCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Truck & Team</Text>
        {assignment.truck && (
          <View style={styles.teamRow}>
            <MaterialCommunityIcons
              name="truck"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.teamLabel, { color: colors.textSecondary }]}>
              Truck:
            </Text>
            <Text style={[styles.teamValue, { color: colors.text }]}>
              {assignment.truck.truck_number} - {assignment.truck.plate_number}
            </Text>
          </View>
        )}
        {assignment.porters && assignment.porters.length > 0 && (
          <View style={styles.teamRow}>
            <MaterialCommunityIcons
              name="account-group"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={[styles.teamLabel, { color: colors.textSecondary }]}>
              Porter:
            </Text>
            <Text style={[styles.teamValue, { color: colors.text }]}>
              {assignment.porters.map((p) => `${p.first_name} ${p.last_name}`).join(', ')}
            </Text>
          </View>
        )}
      </Card>

      {/* Instructions */}
      {(trip.special_instructions || trip.delivery_instructions) && (
        <Card style={styles.infoCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Instructions</Text>
          {trip.special_instructions && (
            <View style={styles.instructionSection}>
              <Text style={[styles.instructionLabel, { color: colors.warning }]}>
                Special Instructions:
              </Text>
              <Text style={[styles.instructionText, { color: colors.text }]}>
                {trip.special_instructions}
              </Text>
            </View>
          )}
          {trip.delivery_instructions && (
            <View style={styles.instructionSection}>
              <Text style={[styles.instructionLabel, { color: colors.info }]}>
                Delivery Instructions:
              </Text>
              <Text style={[styles.instructionText, { color: colors.text }]}>
                {trip.delivery_instructions}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.surface }]}
            onPress={() =>
              router.push({
                pathname: '/(driver)/reports/delay',
                params: { tripId: trip.id },
              })
            }
          >
            <MaterialCommunityIcons
              name="clock-alert"
              size={32}
              color={colors.warning}
            />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Report Delay
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.surface }]}
            onPress={() =>
              router.push({
                pathname: '/(driver)/reports/incident',
                params: { tripId: trip.id },
              })
            }
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={32}
              color={colors.error}
            />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Report Incident
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.surface }]}
            onPress={() =>
              router.push({
                pathname: '/(driver)/reports/truck-problem',
                params: { tripId: trip.id, truckId: assignment.truck?.id },
              })
            }
          >
            <MaterialCommunityIcons name="wrench" size={32} color={colors.error} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Truck Problem
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.surface }]}
            onPress={() => Linking.openURL('tel:+639171234567')}
          >
            <MaterialCommunityIcons name="phone" size={32} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Call Operator
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  statusCard: {
    marginBottom: 16,
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  tripNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  deliveryRef: {
    fontSize: 14,
  },
  actionsCard: {
    marginBottom: 16,
    padding: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  ackNote: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    marginLeft: 12,
    width: 80,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  locationsCard: {
    marginBottom: 16,
    padding: 16,
  },
  locationSection: {
    marginBottom: 16,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    marginBottom: 2,
  },
  locationBranch: {
    fontSize: 13,
  },
  locationDivider: {
    alignItems: 'center',
    marginVertical: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cargoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  cargoText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  cargoDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cargoLabel: {
    fontSize: 14,
    width: 80,
  },
  cargoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  teamLabel: {
    fontSize: 14,
    width: 60,
  },
  teamValue: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  instructionSection: {
    marginBottom: 12,
  },
  instructionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  quickActionsCard: {
    marginBottom: 32,
    padding: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});
