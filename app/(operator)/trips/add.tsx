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
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, Card } from '../../../src/components';
import { useTheme } from '../../../src/hooks';
import { createTrip } from '../../../src/services/api/trip.service';
import { createTripSchema, CreateTripFormData } from '../../../src/validation/schemas/trip.schema';
import { TripStatus } from '../../../src/types/trip.types';
import { IMUS_PLANT } from '../../../src/config/plant.config';

export default function AddTripScreen() {
  // Force light theme for operator/admin
  const themeObj = useTheme();
  const colors = {
    background: '#F7F4EF',
    surface: '#FFFDFC',
    text: '#24211F',
    textSecondary: '#746B63',
    border: '#E5DDD5',
    primary: '#192A4A',
    success: '#4F956E',
    error: '#C44C47',
    white: '#FFFFFF',
  };
  const { spacing } = themeObj;
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // pickup_warehouse and pickup_address removed - will be auto-filled with Imus Plant
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
      <Text style={[styles.label, { color: colors.text }]}>
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
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: errors[name] ? colors.error : colors.border,
              },
              options?.multiline && styles.textArea,
            ]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value?.toString() || ''}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            keyboardType={options?.keyboardType}
            multiline={options?.multiline}
            maxLength={options?.maxLength}
          />
        )}
      />
      {errors[name] && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {errors[name]?.message}
        </Text>
      )}
    </View>
  );

  return (
    <Screen>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: spacing.md }}>
          {/* Basic Information */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
          <Card style={styles.section}>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Origin</Text>
          <Card style={styles.section}>
            <View style={styles.readOnlyField}>
              <View style={styles.readOnlyHeader}>
                <Ionicons name="business" size={20} color={colors.primary} />
                <Text style={[styles.readOnlyLabel, { color: colors.text }]}>
                  Pickup Location
                </Text>
              </View>
              <Text style={[styles.readOnlyValue, { color: colors.text }]}>
                {IMUS_PLANT.name}
              </Text>
              <Text style={[styles.readOnlyAddress, { color: colors.textSecondary }]}>
                {IMUS_PLANT.address}
              </Text>
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  All deliveries originate from Imus Plant
                </Text>
              </View>
            </View>
          </Card>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Destination</Text>
          <Card style={styles.section}>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cargo Information</Text>
          <Card style={styles.section}>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Financial</Text>
          <Card style={styles.section}>
            {renderInput('expected_income', 'Expected Income (₱)', 'e.g., 5000', {
              keyboardType: 'numeric',
            })}
          </Card>

          {/* Instructions */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Instructions & Notes</Text>
          <Card style={styles.section}>
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
            onPress={handleSubmit((data) => onSubmit(data, true))}
            variant="outline"
            loading={isSubmitting}
            style={{ flex: 1, marginRight: spacing.sm }}
          >
            Save as Draft
          </Button>
          <Button
            onPress={handleSubmit((data) => onSubmit(data, false))}
            loading={isSubmitting}
            style={{ flex: 1 }}
          >
            Create Trip
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  footerContent: {
    flexDirection: 'row',
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
    fontSize: 14,
    fontWeight: '600',
  },
  readOnlyValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  readOnlyAddress: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#192A4A10',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

