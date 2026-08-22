/**
 * Edit Truck Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen, Button, Card, LoadingSpinner, ErrorState } from '../../../../src/components';
import { useTheme } from '../../../../src/hooks';
import { getTruckById, updateTruck } from '../../../../src/services/api/truck.service';
import { truckSchema, TruckFormData } from '../../../../src/validation/schemas/truck.schema';
import { FuelType, TruckStatus } from '../../../../src/types/truck.types';
import { formatPlatNumber } from '../../../../src/utils/philippines';

const FUEL_TYPES = [
  { label: 'Diesel', value: FuelType.DIESEL },
  { label: 'Gasoline', value: FuelType.GASOLINE },
  { label: 'Hybrid', value: FuelType.HYBRID },
  { label: 'Electric', value: FuelType.ELECTRIC },
];

const TRUCK_STATUSES = [
  { label: 'Available', value: TruckStatus.AVAILABLE },
  { label: 'Reserved', value: TruckStatus.RESERVED },
  { label: 'Assigned', value: TruckStatus.ASSIGNED },
  { label: 'On Trip', value: TruckStatus.ON_TRIP },
  { label: 'Under Maintenance', value: TruckStatus.UNDER_MAINTENANCE },
  { label: 'Inactive', value: TruckStatus.INACTIVE },
];

export default function EditTruckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TruckFormData>({
    resolver: zodResolver(truckSchema),
  });

  const selectedFuelType = watch('fuel_type');
  const selectedStatus = watch('status');

  useEffect(() => {
    loadTruck();
  }, [id]);

  const loadTruck = async () => {
    try {
      const response = await getTruckById(id);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        const truck = response.data;
        reset({
          truck_number: truck.truck_number,
          license_plate: truck.license_plate,
          make: truck.make,
          model: truck.model,
          year: truck.year,
          truck_type: truck.truck_type || '',
          capacity_kg: truck.capacity_kg,
          fuel_type: truck.fuel_type,
          avg_km_per_liter: truck.avg_km_per_liter,
          current_odometer: truck.current_odometer,
          vin: truck.vin || '',
          or_number: truck.or_number || '',
          cr_number: truck.cr_number || '',
          or_expiry: truck.or_expiry || '',
          cr_expiry: truck.cr_expiry || '',
          insurance_provider: truck.insurance_provider || '',
          insurance_policy_number: truck.insurance_policy_number || '',
          insurance_expiry: truck.insurance_expiry || '',
          status: truck.status,
          purchase_date: truck.purchase_date || '',
          notes: truck.notes || '',
        });
      }
    } catch (err) {
      setError('Failed to load truck');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TruckFormData) => {
    setIsSubmitting(true);

    try {
      const response = await updateTruck({ id, ...data });

      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert('Success', 'Truck updated successfully', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update truck');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = (
    name: keyof TruckFormData,
    label: string,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
      multiline?: boolean;
      maxLength?: number;
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
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
            autoCapitalize={options?.autoCapitalize}
          />
        )}
      />
      {errors[name] && (
        <Text style={[styles.errorText, { color: colors.error }]}>{errors[name]?.message}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <LoadingSpinner />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={loadTruck} />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ paddingHorizontal: spacing.md }}>
          {/* Basic Information */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
          <Card style={styles.section}>
            {renderInput('truck_number', 'Fleet/Unit Number', 'e.g., TRK-001', {
              autoCapitalize: 'characters',
            })}

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Plate Number
                {errors.license_plate && <Text style={{ color: colors.error }}> *</Text>}
              </Text>
              <Controller
                control={control}
                name="license_plate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <RNTextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        color: colors.text,
                        borderColor: errors.license_plate ? colors.error : colors.border,
                      },
                    ]}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      const formatted = formatPlatNumber(text);
                      onChange(formatted);
                    }}
                    value={value}
                    placeholder="e.g., ABC-1234"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                    maxLength={9}
                  />
                )}
              />
              {errors.license_plate && (
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errors.license_plate.message}
                </Text>
              )}
            </View>

            {renderInput('make', 'Make', 'e.g., Isuzu', { autoCapitalize: 'words' })}
            {renderInput('model', 'Model', 'e.g., ELF', { autoCapitalize: 'words' })}
            {renderInput('year', 'Year', 'e.g., 2023', { keyboardType: 'numeric' })}
            {renderInput('truck_type', 'Type', 'e.g., Closed Van', { autoCapitalize: 'words' })}
            {renderInput('capacity_kg', 'Capacity (kg)', 'e.g., 5000', {
              keyboardType: 'numeric',
            })}
            {renderInput('vin', 'VIN (Optional)', 'Vehicle Identification Number', {
              autoCapitalize: 'characters',
              maxLength: 17,
            })}
          </Card>

          {/* Fuel Information */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Fuel Information</Text>
          <Card style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Fuel Type</Text>
              <View style={styles.optionsRow}>
                {FUEL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor:
                          selectedFuelType === type.value ? colors.primary : colors.surface,
                        borderColor:
                          selectedFuelType === type.value ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setValue('fuel_type', type.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: selectedFuelType === type.value ? colors.surface : colors.text,
                        },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {renderInput('avg_km_per_liter', 'Fuel Efficiency (km/L)', 'e.g., 8.5', {
              keyboardType: 'numeric',
            })}
            {renderInput('current_odometer', 'Current Odometer (km)', 'e.g., 25000', {
              keyboardType: 'numeric',
            })}
          </Card>

          {/* Registration & Insurance */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Registration & Insurance
          </Text>
          <Card style={styles.section}>
            {renderInput('or_number', 'OR Number', 'Official Receipt Number')}
            {renderInput('cr_number', 'CR Number', 'Certificate of Registration Number')}
            {renderInput('or_expiry', 'OR Expiry Date', 'MM/DD/YYYY')}
            {renderInput('cr_expiry', 'CR Expiry Date', 'MM/DD/YYYY')}
            {renderInput('insurance_provider', 'Insurance Provider', 'e.g., MAPFRE Insurance', {
              autoCapitalize: 'words',
            })}
            {renderInput('insurance_policy_number', 'Policy Number', 'Insurance Policy Number')}
            {renderInput('insurance_expiry', 'Insurance Expiry', 'MM/DD/YYYY')}
          </Card>

          {/* Status & Additional Info */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Status & Notes</Text>
          <Card style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Status</Text>
              <View style={styles.optionsRow}>
                {TRUCK_STATUSES.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor:
                          selectedStatus === status.value ? colors.primary : colors.surface,
                        borderColor:
                          selectedStatus === status.value ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setValue('status', status.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: selectedStatus === status.value ? colors.surface : colors.text,
                        },
                      ]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {renderInput('purchase_date', 'Purchase Date', 'MM/DD/YYYY')}
            {renderInput('notes', 'Notes', 'Additional notes or comments', {
              multiline: true,
              maxLength: 1000,
            })}
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
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            style={{ flex: 1, marginRight: spacing.sm }}
          />
          <Button
            title={isSubmitting ? 'Saving...' : 'Save Changes'}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  footerContent: {
    flexDirection: 'row',
  },
});
