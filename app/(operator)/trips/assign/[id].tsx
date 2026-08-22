/**
 * Trip Assignment Screen
 * Assign resources (truck, driver, porters) with conflict detection
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  Card,
  Button,
  LoadingSpinner,
  ErrorState,
} from '../../../../src/components';
import { useTheme } from '../../../../src/hooks';
import {
  getTripById,
  assignResources,
  checkAvailability,
} from '../../../../src/services/api/trip.service';
import { getAvailableTrucks } from '../../../../src/services/api/truck.service';
import { getDriversForAssignment, getEmployees } from '../../../../src/services/api/employee.service';
import { Trip, AvailabilityConflict } from '../../../../src/types/trip.types';
import { Truck } from '../../../../src/types/truck.types';
import { Employee } from '../../../../src/types/employee.types';
import { UserRole } from '../../../../src/types';

export default function TripAssignmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  
  const [trip, setTrip] = useState<Trip | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Employee[]>([]);
  const [porters, setPorters] = useState<Employee[]>([]);
  
  const [selectedTruckId, setSelectedTruckId] = useState<string | undefined>();
  const [selectedDriverId, setSelectedDriverId] = useState<string | undefined>();
  const [selectedPorterIds, setSelectedPorterIds] = useState<string[]>([]);
  
  const [conflicts, setConflicts] = useState<AvailabilityConflict[]>([]);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      // Load trip
      const tripResponse = await getTripById(id);
      if (tripResponse.error) {
        setError(tripResponse.error);
        return;
      }
      if (tripResponse.data) {
        setTrip(tripResponse.data);
        setSelectedTruckId(tripResponse.data.assigned_truck_id);
        setSelectedDriverId(tripResponse.data.assigned_driver_id);
        
        // Load existing porter assignments
        if (tripResponse.data.assignments) {
          const porterIds = tripResponse.data.assignments
            .filter(a => a.role === 'porter')
            .map(a => a.employee_id);
          setSelectedPorterIds(porterIds);
        }
      }

      // Load available resources
      const [trucksRes, driversRes, portersRes] = await Promise.all([
        getAvailableTrucks(),
        getDriversForAssignment(),
        getEmployees({ role: UserRole.PORTER, is_active: true }, 1, 100),
      ]);

      if (trucksRes.data) setTrucks(trucksRes.data);
      if (driversRes.data) setDrivers(driversRes.data);
      if (portersRes.data) setPorters(portersRes.data.data);
    } catch (err) {
      setError('Failed to load assignment data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkForConflicts = async () => {
    if (!trip) return;

    setChecking(true);
    setConflicts([]);

    const result = await checkAvailability(
      selectedTruckId,
      selectedDriverId,
      selectedPorterIds,
      trip.delivery_date,
      trip.call_time,
      trip.estimated_duration_hours || 8,
      trip.id
    );

    if (result.data) {
      setConflicts(result.data.conflicts);
      
      if (result.data.conflicts.length > 0) {
        const conflictMessages = result.data.conflicts
          .map(c => `${c.resource_name}: ${c.message}`)
          .join('\n');
        
        Alert.alert(
          'Scheduling Conflicts Detected',
          conflictMessages + '\n\nDo you want to proceed anyway?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Proceed Anyway', onPress: handleAssign, style: 'destructive' },
          ]
        );
      } else {
        handleAssign();
      }
    }

    setChecking(false);
  };

  const handleAssign = async () => {
    if (!selectedTruckId && !selectedDriverId && selectedPorterIds.length === 0) {
      Alert.alert('Error', 'Please select at least one resource to assign');
      return;
    }

    setSaving(true);

    const response = await assignResources({
      trip_id: id,
      truck_id: selectedTruckId,
      driver_id: selectedDriverId,
      porter_ids: selectedPorterIds.length > 0 ? selectedPorterIds : undefined,
    });

    if (response.error) {
      Alert.alert('Error', response.error);
    } else {
      Alert.alert('Success', 'Resources assigned successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }

    setSaving(false);
  };

  const togglePorter = (porterId: string) => {
    if (selectedPorterIds.includes(porterId)) {
      setSelectedPorterIds(selectedPorterIds.filter(id => id !== porterId));
    } else {
      setSelectedPorterIds([...selectedPorterIds, porterId]);
    }
  };

  const getConflictForResource = (resourceId: string) => {
    return conflicts.find(c => c.resource_id === resourceId);
  };

  if (loading) {
    return (
      <Screen>
        <LoadingSpinner />
      </Screen>
    );
  }

  if (error || !trip) {
    return (
      <Screen>
        <ErrorState message={error || 'Trip not found'} onRetry={loadData} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: spacing.md }}>
          {/* Trip Info */}
          <Card style={styles.tripInfo}>
            <Text style={[styles.tripNumber, { color: colors.text }]}>{trip.trip_number}</Text>
            <Text style={[styles.tripDetail, { color: colors.textSecondary }]}>
              {trip.delivery_destination}
            </Text>
            <View style={styles.tripMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {new Date(trip.delivery_date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time" size={14} color={colors.textSecondary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {trip.call_time}
                </Text>
              </View>
            </View>
          </Card>

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <Card style={[styles.warningCard, { backgroundColor: colors.error + '15' }]}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning" size={24} color={colors.error} />
                <Text style={[styles.warningTitle, { color: colors.error }]}>
                  Scheduling Conflicts
                </Text>
              </View>
              {conflicts.map((conflict, index) => (
                <Text key={index} style={[styles.warningText, { color: colors.error }]}>
                  • {conflict.resource_name}: {conflict.message}
                </Text>
              ))}
            </Card>
          )}

          {/* Select Truck */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Truck</Text>
          <Card>
            {trucks.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No available trucks
                </Text>
              </View>
            ) : (
              trucks.map((truck) => {
                const isSelected = selectedTruckId === truck.id;
                const conflict = getConflictForResource(truck.id);

                return (
                  <TouchableOpacity
                    key={truck.id}
                    style={[
                      styles.resourceItem,
                      isSelected && { backgroundColor: colors.primary + '15' },
                      conflict && { borderLeftWidth: 4, borderLeftColor: colors.error },
                    ]}
                    onPress={() => setSelectedTruckId(isSelected ? undefined : truck.id)}
                  >
                    <View style={styles.resourceInfo}>
                      <View style={styles.resourceHeader}>
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={24}
                          color={isSelected ? colors.primary : colors.textSecondary}
                        />
                        <View style={styles.resourceDetails}>
                          <Text style={[styles.resourceName, { color: colors.text }]}>
                            {truck.truck_number}
                          </Text>
                          <Text style={[styles.resourceMeta, { color: colors.textSecondary }]}>
                            {truck.license_plate} • {truck.make} {truck.model}
                          </Text>
                        </View>
                      </View>
                      {conflict && (
                        <View style={[styles.conflictBadge, { backgroundColor: colors.error }]}>
                          <Ionicons name="warning" size={12} color="#FFFFFF" />
                          <Text style={styles.conflictText}>Conflict</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </Card>

          {/* Select Driver */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Driver</Text>
          <Card>
            {drivers.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No available drivers
                </Text>
              </View>
            ) : (
              drivers.map((driver) => {
                const isSelected = selectedDriverId === driver.id;
                const conflict = getConflictForResource(driver.id);

                return (
                  <TouchableOpacity
                    key={driver.id}
                    style={[
                      styles.resourceItem,
                      isSelected && { backgroundColor: colors.primary + '15' },
                      conflict && { borderLeftWidth: 4, borderLeftColor: colors.error },
                    ]}
                    onPress={() => setSelectedDriverId(isSelected ? undefined : driver.id)}
                  >
                    <View style={styles.resourceInfo}>
                      <View style={styles.resourceHeader}>
                        <Ionicons
                          name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                          size={24}
                          color={isSelected ? colors.primary : colors.textSecondary}
                        />
                        <View style={styles.resourceDetails}>
                          <Text style={[styles.resourceName, { color: colors.text }]}>
                            {driver.full_name}
                          </Text>
                          <Text style={[styles.resourceMeta, { color: colors.textSecondary }]}>
                            {driver.employee_id}
                            {driver.license_number && ` • ${driver.license_number}`}
                          </Text>
                        </View>
                      </View>
                      {conflict && (
                        <View style={[styles.conflictBadge, { backgroundColor: colors.error }]}>
                          <Iconicons name="warning" size={12} color="#FFFFFF" />
                          <Text style={styles.conflictText}>Conflict</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </Card>

          {/* Select Porters */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Select Porters (Optional)
          </Text>
          <Card>
            {porters.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No available porters
                </Text>
              </View>
            ) : (
              porters.map((porter) => {
                const isSelected = selectedPorterIds.includes(porter.id);
                const conflict = getConflictForResource(porter.id);

                return (
                  <TouchableOpacity
                    key={porter.id}
                    style={[
                      styles.resourceItem,
                      isSelected && { backgroundColor: colors.accent + '15' },
                      conflict && { borderLeftWidth: 4, borderLeftColor: colors.error },
                    ]}
                    onPress={() => togglePorter(porter.id)}
                  >
                    <View style={styles.resourceInfo}>
                      <View style={styles.resourceHeader}>
                        <Ionicons
                          name={isSelected ? 'checkbox' : 'square-outline'}
                          size={24}
                          color={isSelected ? colors.accent : colors.textSecondary}
                        />
                        <View style={styles.resourceDetails}>
                          <Text style={[styles.resourceName, { color: colors.text }]}>
                            {porter.full_name}
                          </Text>
                          <Text style={[styles.resourceMeta, { color: colors.textSecondary }]}>
                            {porter.employee_id}
                          </Text>
                        </View>
                      </View>
                      {conflict && (
                        <View style={[styles.conflictBadge, { backgroundColor: colors.error }]}>
                          <Ionicons name="warning" size={12} color="#FFFFFF" />
                          <Text style={styles.conflictText}>Conflict</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </Card>

          {/* Summary */}
          {(selectedTruckId || selectedDriverId || selectedPorterIds.length > 0) && (
            <Card style={[styles.summary, { backgroundColor: colors.info + '10' }]}>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Assignment Summary</Text>
              {selectedTruckId && (
                <View style={styles.summaryItem}>
                  <Ionicons name="car" size={16} color={colors.textSecondary} />
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Truck: {trucks.find(t => t.id === selectedTruckId)?.truck_number}
                  </Text>
                </View>
              )}
              {selectedDriverId && (
                <View style={styles.summaryItem}>
                  <Ionicons name="person" size={16} color={colors.textSecondary} />
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Driver: {drivers.find(d => d.id === selectedDriverId)?.full_name}
                  </Text>
                </View>
              )}
              {selectedPorterIds.length > 0 && (
                <View style={styles.summaryItem}>
                  <Ionicons name="people" size={16} color={colors.textSecondary} />
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    Porters: {selectedPorterIds.length} selected
                  </Text>
                </View>
              )}
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <View style={[styles.footerContent, { paddingHorizontal: spacing.md }]}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={{ flex: 1, marginRight: spacing.sm }}
          />
          <Button
            title={checking ? 'Checking...' : 'Assign Resources'}
            onPress={checkForConflicts}
            loading={checking || saving}
            disabled={!selectedTruckId && !selectedDriverId && selectedPorterIds.length === 0}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tripInfo: {
    padding: 16,
    marginBottom: 16,
  },
  tripNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  tripDetail: {
    fontSize: 15,
    marginBottom: 8,
  },
  tripMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
  },
  warningCard: {
    padding: 16,
    marginBottom: 16,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  warningText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  emptySection: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  resourceItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resourceInfo: {
    flex: 1,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resourceDetails: {
    flex: 1,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  resourceMeta: {
    fontSize: 13,
  },
  conflictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  conflictText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  summary: {
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  footerContent: {
    flexDirection: 'row',
  },
});
