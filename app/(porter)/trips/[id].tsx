/**
 * Porter Trip Detail Screen
 * Time tracking, checklists, photo uploads
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
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import {
  getMyAssignments,
  acknowledgeAssignment,
  recordPorterTime,
  submitLoadingChecklist,
  submitDeliveryChecklist,
  uploadPhoto,
} from '../../../src/services/api/driver-porter.service';
import type { Assignment, LoadingChecklist, DeliveryChecklist, LoadingChecklistSubmission, DeliveryChecklistSubmission, PorterTimeEntry } from '../../../src/types/driver-porter.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatPhilippineDate, formatPhilippineTime } from '../../../src/utils/philippines';

export default function PorterTripDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeType, setTimeType] = useState<'in' | 'out'>('in');
  const [showLoadingChecklist, setShowLoadingChecklist] = useState(false);
  const [showDeliveryChecklist, setShowDeliveryChecklist] = useState(false);

  // Time tracking state
  const [timeIn, setTimeIn] = useState<string | null>(null);
  const [timeOut, setTimeOut] = useState<string | null>(null);

  // Loading checklist state
  const [loadingChecklist, setLoadingChecklist] = useState<Partial<LoadingChecklist>>({
    trip_id: id as string,
    total_items_loaded: 0,
    items: [],
    discrepancy_reported: false,
    loading_photos: [],
  });

  // Delivery checklist state
  const [deliveryChecklist, setDeliveryChecklist] = useState<Partial<DeliveryChecklist>>({
    trip_id: id as string,
    total_items_delivered: 0,
    items_returned: 0,
    items_damaged: 0,
    items: [],
    discrepancy_reported: false,
    unloading_photos: [],
  });

  useEffect(() => {
    loadTripDetails();
  }, [id]);

  const loadTripDetails = async () => {
    try {
      const response = await getMyAssignments('today');
      if (response.data) {
        const found = response.data.find(a => a.trip_id === id);
        if (found) {
          setAssignment(found);
        } else {
          // Try upcoming
          const upcomingResponse = await getMyAssignments('upcoming');
          if (upcomingResponse.data) {
            const foundUpcoming = upcomingResponse.data.find(a => a.trip_id === id);
            if (foundUpcoming) {
              setAssignment(foundUpcoming);
            }
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = () => {
    if (!assignment) return;

    Alert.alert(
      'Acknowledge Assignment',
      `Confirm assignment for trip ${assignment.trip.trip_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Acknowledge',
          onPress: async () => {
            const response = await acknowledgeAssignment(assignment.id);
            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Assignment acknowledged');
              loadTripDetails();
            }
          },
        },
      ]
    );
  };

  const handleRecordTime = async (type: 'in' | 'out') => {
    if (!assignment) return;

    setTimeType(type);
    setShowTimeModal(true);
  };

  const submitTime = async () => {
    if (!assignment) return;

    const now = new Date().toISOString();
    const entry: Partial<PorterTimeEntry> = {
      trip_id: assignment.trip_id,
      porter_id: assignment.porter_id || '',
      ...(timeType === 'in' ? { time_in: now } : { time_out: now }),
    };

    const response = await recordPorterTime(entry as PorterTimeEntry);
    if (response.error) {
      Alert.alert('Error', response.error);
    } else {
      if (timeType === 'in') {
        setTimeIn(now);
      } else {
        setTimeOut(now);
      }
      Alert.alert('Success', `Time ${timeType} recorded`);
      setShowTimeModal(false);
    }
  };

  const handleTakePhoto = async (type: 'loading' | 'delivery') => {
    // TODO: Implement camera/photo picker
    Alert.alert('Photo Upload', 'Camera integration pending');
    
    // Mock photo URL for now
    const mockPhotoUrl = `https://example.com/photos/${Date.now()}.jpg`;
    
    if (type === 'loading') {
      setLoadingChecklist(prev => ({
        ...prev,
        loading_photos: [...(prev.loading_photos || []), mockPhotoUrl],
      }));
    } else {
      setDeliveryChecklist(prev => ({
        ...prev,
        unloading_photos: [...(prev.unloading_photos || []), mockPhotoUrl],
      }));
    }
  };

  const handleSubmitLoadingChecklist = async () => {
    if (!loadingChecklist.total_items_loaded || loadingChecklist.total_items_loaded === 0) {
      Alert.alert('Missing Quantity', 'Please enter the quantity loaded');
      return;
    }

    Alert.alert(
      'Submit Loading Checklist',
      'Confirm all items are loaded and secured?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            const response = await submitLoadingChecklist(loadingChecklist as LoadingChecklist);
            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Loading checklist submitted');
              setShowLoadingChecklist(false);
            }
          },
        },
      ]
    );
  };

  const handleSubmitDeliveryChecklist = async () => {
    if (!deliveryChecklist.all_items_delivered ||
        !deliveryChecklist.customer_signature_obtained ||
        !deliveryChecklist.delivery_location_correct ||
        !deliveryChecklist.no_damage_on_delivery) {
      Alert.alert('Incomplete', 'Please complete all checklist items');
      return;
    }

    if (deliveryChecklist.quantity_delivered === 0) {
      Alert.alert('Missing Quantity', 'Please enter the quantity delivered');
      return;
    }

    Alert.alert(
      'Submit Delivery Checklist',
      'Confirm all items are delivered and signed for?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            // Build proper submission payload
            const submissionPayload: DeliveryChecklistSubmission = {
              trip_id: deliveryChecklist.trip_id!,
              porter_id: assignment?.porter_id || '',
              items: deliveryChecklist.items || [],
              total_items_delivered: deliveryChecklist.total_items_delivered || 0,
              items_returned: deliveryChecklist.items_returned || 0,
              items_damaged: deliveryChecklist.items_damaged || 0,
              discrepancy_reported: deliveryChecklist.discrepancy_reported || false,
              discrepancy_notes: deliveryChecklist.discrepancy_notes,
              unloading_photos: deliveryChecklist.unloading_photos || [],
              photo_urls: deliveryChecklist.photo_urls || [],
              completed_at: new Date().toISOString(),
              all_items_delivered: deliveryChecklist.all_items_delivered,
              customer_signature_obtained: deliveryChecklist.customer_signature_obtained,
              delivery_location_correct: deliveryChecklist.delivery_location_correct,
              no_damage_on_delivery: deliveryChecklist.no_damage_on_delivery,
              quantity_delivered: deliveryChecklist.quantity_delivered,
              location: deliveryChecklist.location,
            };
            
            const response = await submitDeliveryChecklist(submissionPayload);
            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Delivery checklist submitted');
              setShowDeliveryChecklist(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="alert-circle" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.text }]}>
          Trip not found
        </Text>
      </View>
    );
  }

  const trip = assignment.trip;
  const isPending = assignment.assignment_status === 'pending';
  const isAcknowledged = assignment.assignment_status === 'acknowledged';

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Status Header */}
        <Card style={[styles.statusCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.statusTripNumber}>{trip.trip_number}</Text>
          <Text style={styles.statusText}>{trip.status.toUpperCase()}</Text>
        </Card>

        {/* Acknowledge Button */}
        {isPending && (
          <TouchableOpacity
            style={[styles.ackButton, { backgroundColor: colors.success }]}
            onPress={handleAcknowledge}
          >
            <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
            <Text style={styles.ackButtonText}>Acknowledge Assignment</Text>
          </TouchableOpacity>
        )}

        {/* Schedule Info */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Schedule</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {formatPhilippineDate(trip.delivery_date)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Call Time: {formatPhilippineTime(trip.call_time)}
            </Text>
          </View>
        </Card>

        {/* Locations */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Locations</Text>
          
          <View style={styles.locationItem}>
            <View style={[styles.locationIcon, { backgroundColor: colors.primaryLight }]}>
              <MaterialCommunityIcons name="warehouse" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
                Pickup Warehouse
              </Text>
              <Text style={[styles.locationText, { color: colors.text }]}>
                {trip.pickup_warehouse}
              </Text>
            </View>
          </View>

          <View style={styles.locationItem}>
            <View style={[styles.locationIcon, { backgroundColor: colors.successLight }]}>
              <MaterialCommunityIcons name="map-marker" size={20} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationLabel, { color: colors.textSecondary }]}>
                Delivery Destination
              </Text>
              <Text style={[styles.locationText, { color: colors.text }]}>
                {trip.delivery_destination}
              </Text>
            </View>
          </View>
        </Card>

        {/* Team Info */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Team</Text>
          
          {assignment.truck && (
            <View style={styles.teamItem}>
              <MaterialCommunityIcons name="truck" size={20} color={colors.textSecondary} />
              <View>
                <Text style={[styles.teamLabel, { color: colors.textSecondary }]}>
                  Truck
                </Text>
                <Text style={[styles.teamText, { color: colors.text }]}>
                  {assignment.truck.truck_number}
                </Text>
              </View>
            </View>
          )}

          {assignment.driver && (
            <View style={styles.teamItem}>
              <MaterialCommunityIcons name="account" size={20} color={colors.textSecondary} />
              <View>
                <Text style={[styles.teamLabel, { color: colors.textSecondary }]}>
                  Driver
                </Text>
                <Text style={[styles.teamText, { color: colors.text }]}>
                  {assignment.driver.first_name} {assignment.driver.last_name}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Time Tracking */}
        {isAcknowledged && (
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Time Tracking</Text>
            
            <View style={styles.timeGrid}>
              <View style={styles.timeItem}>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                  Time In
                </Text>
                {timeIn ? (
                  <Text style={[styles.timeValue, { color: colors.success }]}>
                    {formatPhilippineTime(timeIn)}
                  </Text>
                ) : (
                  <TouchableOpacity
                    style={[styles.timeButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleRecordTime('in')}
                  >
                    <MaterialCommunityIcons name="clock-in" size={20} color="#fff" />
                    <Text style={styles.timeButtonText}>Clock In</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.timeItem}>
                <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                  Time Out
                </Text>
                {timeOut ? (
                  <Text style={[styles.timeValue, { color: colors.error }]}>
                    {formatPhilippineTime(timeOut)}
                  </Text>
                ) : timeIn ? (
                  <TouchableOpacity
                    style={[styles.timeButton, { backgroundColor: colors.error }]}
                    onPress={() => handleRecordTime('out')}
                  >
                    <MaterialCommunityIcons name="clock-out" size={20} color="#fff" />
                    <Text style={styles.timeButtonText}>Clock Out</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.timeValue, { color: colors.textSecondary }]}>
                    --:--
                  </Text>
                )}
              </View>
            </View>
          </Card>
        )}

        {/* Checklists */}
        {isAcknowledged && (
          <View style={styles.checklistButtons}>
            <TouchableOpacity
              style={[styles.checklistButton, { backgroundColor: colors.info }]}
              onPress={() => setShowLoadingChecklist(true)}
            >
              <MaterialCommunityIcons name="clipboard-list" size={24} color="#fff" />
              <Text style={styles.checklistButtonText}>Loading Checklist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checklistButton, { backgroundColor: colors.success }]}
              onPress={() => setShowDeliveryChecklist(true)}
            >
              <MaterialCommunityIcons name="clipboard-check" size={24} color="#fff" />
              <Text style={styles.checklistButtonText}>Delivery Checklist</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Quick Actions</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
            onPress={() => router.push('/(porter)/reports/missing')}
          >
            <MaterialCommunityIcons name="package-variant-closed-remove" size={24} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Report Missing Item
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.warningLight }]}
            onPress={() => router.push('/(porter)/reports/damaged')}
          >
            <MaterialCommunityIcons name="package-variant-closed-minus" size={24} color={colors.warning} />
            <Text style={[styles.actionButtonText, { color: colors.warning }]}>
              Report Damaged Item
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.errorLight }]}
            onPress={() => router.push('/(porter)/reports/rejected')}
          >
            <MaterialCommunityIcons name="package-variant-closed-remove" size={24} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>
              Report Rejected Item
            </Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>

      {/* Time Recording Modal */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Record Time {timeType === 'in' ? 'In' : 'Out'}
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Current time: {formatPhilippineTime(new Date().toISOString())}
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Location will be recorded automatically
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setShowTimeModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={submitTime}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Loading Checklist Modal */}
      <Modal
        visible={showLoadingChecklist}
        animationType="slide"
        onRequestClose={() => setShowLoadingChecklist(false)}
      >
        <View style={[styles.fullModal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => setShowLoadingChecklist(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              Loading Checklist
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.checklistContent} contentContainerStyle={styles.checklistContentPadding}>
            {/* Checklist Items */}
            <TouchableOpacity
              style={[styles.checklistItem, { backgroundColor: colors.surface }]}
              onPress={() => setLoadingChecklist(prev => ({
                ...prev,
                all_items_loaded: !prev.all_items_loaded,
              }))}
            >
              <MaterialCommunityIcons
                name={loadingChecklist.all_items_loaded ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={loadingChecklist.all_items_loaded ? colors.success : colors.textSecondary}
              />
              <Text style={[styles.checklistItemText, { color: colors.text }]}>
                All items loaded
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checklistItem, { backgroundColor: colors.surface }]}
              onPress={() => setLoadingChecklist(prev => ({
                ...prev,
                items_match_manifest: !prev.items_match_manifest,
              }))}
            >
              <MaterialCommunityIcons
                name={loadingChecklist.items_match_manifest ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={loadingChecklist.items_match_manifest ? colors.success : colors.textSecondary}
              />
              <Text style={[styles.checklistItemText, { color: colors.text }]}>
                Items match manifest
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checklistItem, { backgroundColor: colors.surface }]}
              onPress={() => setLoadingChecklist(prev => ({
                ...prev,
                items_properly_secured: !prev.items_properly_secured,
              }))}
            >
              <MaterialCommunityIcons
                name={loadingChecklist.items_properly_secured ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={loadingChecklist.items_properly_secured ? colors.success : colors.textSecondary}
              />
              <Text style={[styles.checklistItemText, { color: colors.text }]}>
                Items properly secured
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checklistItem, { backgroundColor: colors.surface }]}
              onPress={() => setLoadingChecklist(prev => ({
                ...prev,
                no_damage_observed: !prev.no_damage_observed,
              }))}
            >
              <MaterialCommunityIcons
                name={loadingChecklist.no_damage_observed ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={loadingChecklist.no_damage_observed ? colors.success : colors.textSecondary}
              />
              <Text style={[styles.checklistItemText, { color: colors.text }]}>
                No damage observed
              </Text>
            </TouchableOpacity>

            {/* Quantity Input */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Quantity Loaded
              </Text>
              <TextInput
                style={[styles.quantityInput, { color: colors.text, borderColor: colors.border }]}
                value={loadingChecklist.quantity_confirmed.toString()}
                onChangeText={(text) => setLoadingChecklist(prev => ({
                  ...prev,
                  quantity_confirmed: parseInt(text) || 0,
                }))}
                keyboardType="numeric"
                placeholder="Enter quantity"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Notes */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Notes (Optional)
              </Text>
              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                value={loadingChecklist.notes}
                onChangeText={(text) => setLoadingChecklist(prev => ({
                  ...prev,
                  notes: text,
                }))}
                multiline
                numberOfLines={4}
                placeholder="Any additional notes..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Photos */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Photos ({loadingChecklist.photo_urls.length})
              </Text>
              <TouchableOpacity
                style={[styles.photoButton, { borderColor: colors.primary }]}
                onPress={() => handleTakePhoto('loading')}
              >
                <MaterialCommunityIcons name="camera" size={32} color={colors.primary} />
                <Text style={[styles.photoButtonText, { color: colors.primary }]}>
                  Take Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.success }]}
              onPress={handleSubmitLoadingChecklist}
            >
              <Text style={styles.submitButtonText}>Submit Loading Checklist</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Delivery Checklist Modal */}
      <Modal
        visible={showDeliveryChecklist}
        animationType="slide"
        onRequestClose={() => setShowDeliveryChecklist(false)}
      >
        <View style={[styles.fullModal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => setShowDeliveryChecklist(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>
              Delivery Checklist
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.checklistContent} contentContainerStyle={styles.checklistContentPadding}>
            {/* Checklist Items */}
            <TouchableOpacity
              style={[styles.checklistItem, { backgroundColor: colors.surface }]}
              onPress={() => setDeliveryChecklist(prev => ({
                ...prev,
                all_items_delivered: !prev.all_items_delivered,
              }))}
            >
              <MaterialCommunityIcons
                name={deliveryChecklist.all_items_delivered ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={deliveryChecklist.all_items_delivered ? colors.success : colors.textSecondary}
              />
              <Text style={[styles.checklistItemText, { color: colors.text }]}>
                All items delivered
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checklistItem, { backgroundColor: colors.surface }]}
              onPress={() => setDeliveryChecklist(prev => ({
                ...prev,
                customer_signature_obtained: !prev.customer_signature_obtained,
              }))}
            >
              <MaterialCommunityIcons
                name={deliveryChecklist.customer_signature_obtained ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={deliveryChecklist.customer_signature_obtained ? colors.success : colors.textSecondary}
              />
              <Text style={[styles.checklistItemText, { color: colors.text }]}>
                Customer signature obtained
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checklistItem, { backgroundColor: colors.surface }]}
              onPress={() => setDeliveryChecklist(prev => ({
                ...prev,
                delivery_location_correct: !prev.delivery_location_correct,
              }))}
            >
              <MaterialCommunityIcons
                name={deliveryChecklist.delivery_location_correct ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={deliveryChecklist.delivery_location_correct ? colors.success : colors.textSecondary}
              />
              <Text style={[styles.checklistItemText, { color: colors.text }]}>
                Delivery location correct
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checklistItem, { backgroundColor: colors.surface }]}
              onPress={() => setDeliveryChecklist(prev => ({
                ...prev,
                no_damage_on_delivery: !prev.no_damage_on_delivery,
              }))}
            >
              <MaterialCommunityIcons
                name={deliveryChecklist.no_damage_on_delivery ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={deliveryChecklist.no_damage_on_delivery ? colors.success : colors.textSecondary}
              />
              <Text style={[styles.checklistItemText, { color: colors.text }]}>
                No damage on delivery
              </Text>
            </TouchableOpacity>

            {/* Quantity Input */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Quantity Delivered
              </Text>
              <TextInput
                style={[styles.quantityInput, { color: colors.text, borderColor: colors.border }]}
                value={deliveryChecklist.quantity_delivered.toString()}
                onChangeText={(text) => setDeliveryChecklist(prev => ({
                  ...prev,
                  quantity_delivered: parseInt(text) || 0,
                }))}
                keyboardType="numeric"
                placeholder="Enter quantity"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Customer Notes */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Customer Notes (Optional)
              </Text>
              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                value={deliveryChecklist.customer_notes}
                onChangeText={(text) => setDeliveryChecklist(prev => ({
                  ...prev,
                  customer_notes: text,
                }))}
                multiline
                numberOfLines={3}
                placeholder="Notes from customer..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Delivery Notes */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Delivery Notes (Optional)
              </Text>
              <TextInput
                style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                value={deliveryChecklist.delivery_notes}
                onChangeText={(text) => setDeliveryChecklist(prev => ({
                  ...prev,
                  delivery_notes: text,
                }))}
                multiline
                numberOfLines={3}
                placeholder="Any additional notes..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Photos */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Photos ({deliveryChecklist.photo_urls.length})
              </Text>
              <TouchableOpacity
                style={[styles.photoButton, { borderColor: colors.primary }]}
                onPress={() => handleTakePhoto('delivery')}
              >
                <MaterialCommunityIcons name="camera" size={32} color={colors.primary} />
                <Text style={[styles.photoButtonText, { color: colors.primary }]}>
                  Take Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.success }]}
              onPress={handleSubmitDeliveryChecklist}
            >
              <Text style={styles.submitButtonText}>Submit Delivery Checklist</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </>
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
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  content: {
    padding: 16,
  },
  statusCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTripNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  ackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  ackButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '500',
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  teamLabel: {
    fontSize: 12,
  },
  teamText: {
    fontSize: 15,
    fontWeight: '500',
  },
  timeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  timeButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  checklistButtons: {
    gap: 12,
    marginBottom: 16,
  },
  checklistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 12,
  },
  checklistButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 15,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  fullModal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  checklistContent: {
    flex: 1,
  },
  checklistContentPadding: {
    padding: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  checklistItemText: {
    fontSize: 15,
    flex: 1,
  },
  inputContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  quantityInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  photoButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
