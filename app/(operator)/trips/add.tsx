/**
 * Add Trip Screen
 * Create new trip with draft saving capability
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, Card } from '../../../src/components';
import { createTrip } from '../../../src/services/api/trip.service';
import { createTripSchema, CreateTripFormData } from '../../../src/validation/schemas/trip.schema';
import { TripStatus } from '../../../src/types/trip.types';
import { IMUS_PLANT } from '../../../src/config/plant.config';

export default function AddTripScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = {
    background: '#0B1120',
    surface: '#1E293B',
    inputBg: '#0F172A',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#334155',
    primary: '#0EA5E9',
    success: '#10B981',
    error: '#EF4444',
    white: '#FFFFFF',
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTripFormData>({
    resolver: zodResolver(createTripSchema) as any,
    defaultValues: {
      delivery_reference: '',
      delivery_date: '',
      call_time: '',
      delivery_destination: '',
      delivery_address: '',
      store_branch_name: '',
      cargo_description: '',
      cargo_weight_kg: undefined,
      cargo_volume_cbm: undefined,
      number_of_items: undefined,
      estimated_duration_hours: undefined,
      expected_income: undefined,
      special_instructions: '',
      delivery_instructions: '',
      internal_notes: '',
    },
  });

  const onSubmit = async (data: CreateTripFormData, isDraft: boolean = false) => {
    setIsSubmitting(true);

    try {
      const submitData = {
        ...data,
        status: isDraft ? TripStatus.DRAFT : TripStatus.SCHEDULED,
      };

      const response = await createTrip(submitData);

      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        const message = isDraft ? 'Trip saved as draft' : 'Trip created successfully';
        Alert.alert('Success', message, [
          {
            text: 'View Trip',
            onPress: () => router.replace(`/(operator)/trips/${response.data?.id}`),
          },
          { text: 'Create Another', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create trip');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    name: keyof CreateTripFormData,
    label: string,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'numeric' | 'email-address';
      multiline?: boolean;
      maxLength?: number;
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {errors[name] && <Text style={{ color: colors.error }}> *</Text>}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <RNTextInput
            style={[
              styles.input,
              {
                borderColor: errors[name] ? colors.error : colors.border,
              },
              options?.multiline && styles.textArea,
            ]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value?.toString() || ''}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardType={options?.keyboardType}
            multiline={options?.multiline}
            maxLength={options?.maxLength}
          />
        )}
      />
      {errors[name] && (
        <Text style={styles.errorText}>
          {errors[name]?.message}
        </Text>
      )}
    </View>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Screen Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Trip</Text>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Card style={styles.sectionCard}>
            {renderInput('delivery_reference', 'Delivery Reference *', 'e.g., DR-2024-001')}
            {renderInput('delivery_date', 'Delivery Date *', 'YYYY-MM-DD or MM/DD/YYYY')}
            {renderInput('call_time', 'Call Time *', 'HH:MM (e.g., 08:00)')}
            {renderInput(
              'estimated_duration_hours',
              'Estimated Duration (hours)',
              'e.g., 8',
              { keyboardType: 'numeric' }
            )}
          </Card>

          {/* Locations */}
          <Text style={styles.sectionTitle}>Origin</Text>
          <Card style={styles.sectionCard}>
            <View style={styles.readOnlyField}>
              <View style={styles.readOnlyHeader}>
                <Ionicons name="business" size={20} color="#0EA5E9" />
                <Text style={styles.readOnlyLabel}>
                  Pickup Location
                </Text>
              </View>
              <Text style={styles.readOnlyValue}>
                {IMUS_PLANT.name}
              </Text>
              <Text style={styles.readOnlyAddress}>
                {IMUS_PLANT.address}
              </Text>
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color="#0EA5E9" />
                <Text style={styles.infoText}>
                  All deliveries originate from Imus Plant
                </Text>
              </View>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Destination</Text>
          <Card style={styles.sectionCard}>
            {renderInput(
              'delivery_destination',
              'Destination Name *',
              'e.g., SM Megamall'
            )}
            {renderInput(
              'delivery_address',
              'Delivery Address *',
              'Full delivery address',
              { multiline: true }
            )}
            {renderInput(
              'store_branch_name',
              'Store/Branch Name',
              'e.g., SM Megamall - Building A'
            )}
          </Card>

          {/* Cargo Details */}
          <Text style={styles.sectionTitle}>Cargo Information</Text>
          <Card style={styles.sectionCard}>
            {renderInput(
              'cargo_description',
              'Cargo Description *',
              'Describe the cargo/products',
              { multiline: true, maxLength: 1000 }
            )}
            {renderInput('cargo_weight_kg', 'Weight (kg)', 'e.g., 1500', {
              keyboardType: 'numeric',
            })}
            {renderInput('cargo_volume_cbm', 'Volume (m³)', 'e.g., 25.5', {
              keyboardType: 'numeric',
            })}
            {renderInput('number_of_items', 'Number of Items', 'e.g., 50', {
              keyboardType: 'numeric',
            })}
          </Card>

          {/* Financial */}
          <Text style={styles.sectionTitle}>Financial</Text>
          <Card style={styles.sectionCard}>
            {renderInput('expected_income', 'Expected Income (₱)', 'e.g., 5000', {
              keyboardType: 'numeric',
            })}
          </Card>

          {/* Instructions */}
          <Text style={styles.sectionTitle}>Instructions & Notes</Text>
          <Card style={styles.sectionCard}>
            {renderInput(
              'special_instructions',
              'Special Instructions',
              'Any special handling requirements',
              { multiline: true, maxLength: 2000 }
            )}
            {renderInput(
              'delivery_instructions',
              'Delivery Instructions',
              'Instructions for the delivery team',
              { multiline: true, maxLength: 2000 }
            )}
            {renderInput(
              'internal_notes',
              'Internal Notes',
              'Notes for internal use only',
              { multiline: true, maxLength: 2000 }
            )}
          </Card>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.draftButton}
            onPress={handleSubmit((data) => onSubmit(data, true))}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.draftButtonText}>Save as Draft</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleSubmit((data) => onSubmit(data, false))}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={styles.createButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Trip'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#0B1120',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    marginRight: 14,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 18,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#F8FAFC',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '600',
  },
  readOnlyField: {
    paddingVertical: 4,
  },
  readOnlyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  readOnlyLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  readOnlyValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  readOnlyAddress: {
    fontSize: 14,
    lineHeight: 20,
    color: '#94A3B8',
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#94A3B8',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 12,
  },
  draftButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  draftButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
