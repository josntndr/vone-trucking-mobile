/**
 * Truck Detail Screen
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
} from '../../../src/components';
import { useTheme } from '../../../src/hooks';
import { getTruckById, archiveTruck, updateTruckStatus } from '../../../src/services/api/truck.service';
import { Truck, TruckStatus } from '../../../src/types/truck.types';
import {
  formatPlatNumber,
  formatPhilippineDate,
  isExpiringSoon,
  isExpired,
} from '../../../src/utils/philippines';

export default function TruckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const [truck, setTruck] = useState<Truck | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [archiveDialogVisible, setArchiveDialogVisible] = useState(false);

  const loadTruck = async () => {
    try {
      const response = await getTruckById(id);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setTruck(response.data);
      }
    } catch (err) {
      setError('Failed to load truck details');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTruck();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    setError(null);
    loadTruck();
  };

  const handleArchive = async () => {
    setArchiveDialogVisible(false);
    setLoading(true);

    const response = await archiveTruck(id);
    if (response.error) {
      Alert.alert('Error', response.error);
      setLoading(false);
    } else {
      Alert.alert('Success', 'Truck archived successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleStatusChange = async (newStatus: TruckStatus) => {
    Alert.alert(
      'Update Status',
      `Change truck status to ${newStatus.replace(/_/g, ' ')}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const response = await updateTruckStatus(id, newStatus);
            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Status updated successfully');
              loadTruck();
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: TruckStatus) => {
    switch (status) {
      case TruckStatus.AVAILABLE:
        return colors.success;
      case TruckStatus.ON_TRIP:
        return colors.info;
      case TruckStatus.ASSIGNED:
        return colors.primary;
      case TruckStatus.RESERVED:
        return colors.warning;
      case TruckStatus.UNDER_MAINTENANCE:
        return colors.error;
      case TruckStatus.INACTIVE:
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: TruckStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const checkExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    if (isExpired(expiryDate)) return 'expired';
    if (isExpiringSoon(expiryDate)) return 'expiring';
    return 'valid';
  };

  const renderExpiryWarning = (label: string, date?: string) => {
    if (!date) return null;
    const status = checkExpiryStatus(date);
    if (!status || status === 'valid') return null;

    return (
      <View
        style={[
          styles.warningBanner,
          { backgroundColor: status === 'expired' ? colors.error + '15' : colors.warning + '15' },
        ]}
      >
        <Ionicons
          name="warning"
          size={20}
          color={status === 'expired' ? colors.error : colors.warning}
        />
        <Text
          style={[
            styles.warningText,
            { color: status === 'expired' ? colors.error : colors.warning },
          ]}
        >
          {label} {status === 'expired' ? 'expired' : 'expiring soon'}
        </Text>
      </View>
    );
  };

  if (loading && !truck) {
    return (
      <Screen>
        <LoadingSpinner />
      </Screen>
    );
  }

  if (error || !truck) {
    return (
      <Screen>
        <ErrorState message={error || 'Truck not found'} onRetry={loadTruck} />
      </Screen>
    );
  }

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
              <Text style={[styles.truckNumber, { color: colors.text }]}>{truck.truck_number}</Text>
              <Text style={[styles.plateNumber, { color: colors.textSecondary }]}>
                {formatPlatNumber(truck.license_plate)}
              </Text>
            </View>
            <StatusChip label={getStatusLabel(truck.status)} color={getStatusColor(truck.status)} />
          </View>

          <View style={styles.vehicleInfo}>
            <Text style={[styles.vehicleName, { color: colors.text }]}>
              {truck.make} {truck.model}
            </Text>
            <Text style={[styles.vehicleYear, { color: colors.textSecondary }]}>
              {truck.year} • {truck.fuel_type}
            </Text>
          </View>
        </Card>

        {/* Expiry Warnings */}
        <View style={{ paddingHorizontal: spacing.md }}>
          {renderExpiryWarning('OR/CR', truck.or_expiry || truck.cr_expiry)}
          {renderExpiryWarning('Insurance', truck.insurance_expiry)}
        </View>

        {/* Quick Actions */}
        <View style={[styles.actionsContainer, { paddingHorizontal: spacing.md }]}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push(`/(operator)/trucks/edit/${truck.id}`)}
          >
            <Ionicons name="create-outline" size={20} color={colors.surface} />
            <Text style={[styles.actionButtonText, { color: colors.surface }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error }]}
            onPress={() => setArchiveDialogVisible(true)}
          >
            <Ionicons name="archive-outline" size={20} color={colors.surface} />
            <Text style={[styles.actionButtonText, { color: colors.surface }]}>Archive</Text>
          </TouchableOpacity>
        </View>

        {/* Specifications */}
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Specifications</Text>
          <Card>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {truck.truck_type || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Capacity</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {truck.capacity_kg.toLocaleString()} kg
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Fuel Type</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {truck.fuel_type.charAt(0).toUpperCase() + truck.fuel_type.slice(1)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Fuel Efficiency
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {truck.avg_km_per_liter ? `${truck.avg_km_per_liter} km/L` : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Odometer</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {truck.current_odometer?.toLocaleString() || 'N/A'} km
              </Text>
            </View>
            {truck.vin && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>VIN</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{truck.vin}</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Registration & Insurance */}
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Registration & Insurance
          </Text>
          <Card>
            {truck.or_number && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>OR Number</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{truck.or_number}</Text>
              </View>
            )}
            {truck.or_expiry && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>OR Expiry</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: checkExpiryStatus(truck.or_expiry) === 'expired'
                        ? colors.error
                        : checkExpiryStatus(truck.or_expiry) === 'expiring'
                        ? colors.warning
                        : colors.text,
                    },
                  ]}
                >
                  {formatPhilippineDate(truck.or_expiry)}
                </Text>
              </View>
            )}
            {truck.cr_number && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CR Number</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{truck.cr_number}</Text>
              </View>
            )}
            {truck.cr_expiry && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>CR Expiry</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: checkExpiryStatus(truck.cr_expiry) === 'expired'
                        ? colors.error
                        : checkExpiryStatus(truck.cr_expiry) === 'expiring'
                        ? colors.warning
                        : colors.text,
                    },
                  ]}
                >
                  {formatPhilippineDate(truck.cr_expiry)}
                </Text>
              </View>
            )}
            {truck.insurance_provider && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Insurance Provider
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {truck.insurance_provider}
                </Text>
              </View>
            )}
            {truck.insurance_policy_number && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Policy Number
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {truck.insurance_policy_number}
                </Text>
              </View>
            )}
            {truck.insurance_expiry && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  Insurance Expiry
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: checkExpiryStatus(truck.insurance_expiry) === 'expired'
                        ? colors.error
                        : checkExpiryStatus(truck.insurance_expiry) === 'expiring'
                        ? colors.warning
                        : colors.text,
                    },
                  ]}
                >
                  {formatPhilippineDate(truck.insurance_expiry)}
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Assignment */}
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Assignment</Text>
          <Card>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Assigned Driver
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {truck.assigned_driver_name || 'Not assigned'}
              </Text>
            </View>
            {truck.gps_device_id && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  GPS Tracker
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {truck.gps_device_id}
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Notes */}
        {truck.notes && (
          <View style={[styles.section, { paddingHorizontal: spacing.md, paddingBottom: spacing.xl }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes</Text>
            <Card>
              <Text style={[styles.notesText, { color: colors.text }]}>{truck.notes}</Text>
            </Card>
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        isOpen={archiveDialogVisible}
        onClose={() => setArchiveDialogVisible(false)}
        title="Archive Truck"
        message="Are you sure you want to archive this truck? It will be marked as inactive."
        onConfirm={handleArchive}
        confirmLabel="Archive"
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
    marginBottom: 16,
  },
  headerInfo: {
    flex: 1,
  },
  truckNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  plateNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  vehicleInfo: {
    marginTop: 8,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleYear: {
    fontSize: 14,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    padding: 16,
  },
});
