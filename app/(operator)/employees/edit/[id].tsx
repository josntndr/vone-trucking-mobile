// @ts-nocheck
/**
 * Edit Employee Screen
 * Comprehensive edit form with structured address support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput as RNTextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, LoadingSpinner, ErrorState } from '../../../../src/components';
import { AddressFormSection } from '../../../../src/components/forms';
import {
  getEmployeeById,
  updateEmployee,
} from '../../../../src/services/api/employee.service';
import {
  updateEmployeeSchema,
  UpdateEmployeeFormData,
} from '../../../../src/validation/schemas/employee.schema';
import { UserRole } from '../../../../src/types';
import { LicenseType, EmploymentStatus, hasStructuredAddress, getDisplayAddress } from '../../../../src/types/employee.types';
import { COLORS, SPACING } from '../../../../src/theme/designSystem';

const EMPLOYMENT_STATUSES = [
  { label: 'Active', value: EmploymentStatus.ACTIVE },
  { label: 'On Leave', value: EmploymentStatus.ON_LEAVE },
  { label: 'Inactive', value: EmploymentStatus.INACTIVE },
];

const LICENSE_TYPES = [
  { label: 'Non-Professional', value: LicenseType.NON_PROFESSIONAL },
  { label: 'Professional', value: LicenseType.PROFESSIONAL },
  { label: 'Conductor', value: LicenseType.CONDUCTOR },
];

export default function EditEmployeeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [employeeRole, setEmployeeRole] = useState<UserRole | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<UpdateEmployeeFormData>({
    resolver: zodResolver(updateEmployeeSchema),
    mode: 'onBlur',
    defaultValues: {
      id,
      employee_id: '',
      first_name: '',
      last_name: '',
      phone: '',
      // Structured address fields
      country: '',
      country_code: '',
      region: '',
      region_code: '',
      province: '',
      province_code: '',
      city: '',
      city_code: '',
      barangay: '',
      barangay_code: '',
      postal_code: '',
      address_line_1: '',
      address_line_2: '',
      emergency_contact_name: '',
      emergency_contact_relationship: '',
      emergency_contact_phone: '',
      hire_date: '',
      employment_status: EmploymentStatus.ACTIVE,
      license_number: '',
      license_type: undefined,
      license_restrictions: '',
      license_expiry: '',
      per_trip_rate: '' as any,
    },
  });

  const perTripRateValue = watch('per_trip_rate');

  // Load employee data
  useEffect(() => {
    const loadEmployee = async () => {
      setLoadingEmployee(true);
      setError(null);

      try {
        const response = await getEmployeeById(id);
        
        if (response.error) {
          setError(response.error);
          return;
        }

        if (response.data) {
          const emp = response.data;
          setEmployeeRole(emp.role);

          // Check if employee has structured address
          const hasStructured = hasStructuredAddress(emp);

          // Reset form with employee data
          reset({
            id: emp.id,
            employee_id: emp.employee_id,
            first_name: emp.first_name,
            last_name: emp.last_name,
            phone: emp.phone,
            // Structured address (if available)
            country: emp.country || 'Philippines',
            country_code: emp.country_code || 'PH',
            region: emp.region || '',
            region_code: emp.region_code || '',
            province: emp.province || '',
            province_code: emp.province_code || '',
            city: emp.city || '',
            city_code: emp.city_code || '',
            barangay: emp.barangay || '',
            barangay_code: emp.barangay_code || '',
            postal_code: emp.postal_code || '',
            address_line_1: emp.address_line_1 || '',
            address_line_2: emp.address_line_2 || '',
            emergency_contact_name: emp.emergency_contact_name,
            emergency_contact_relationship: emp.emergency_contact_relationship,
            emergency_contact_phone: emp.emergency_contact_phone,
            hire_date: emp.hire_date,
            employment_status: emp.employment_status,
            license_number: emp.license_number || '',
            license_type: emp.license_type,
            license_restrictions: emp.license_restrictions || '',
            license_expiry: emp.license_expiry || '',
            per_trip_rate: emp.per_trip_rate,
          });

          // Show legacy address warning if needed
          if (!hasStructured && emp.address) {
            Alert.alert(
              'Address Update Needed',
              'This employee has a legacy address format. Please update to the new structured address format for better data quality.',
              [{ text: 'OK' }]
            );
          }
        }
      } catch (err) {
        console.error('Error loading employee:', err);
        setError('Failed to load employee details');
      } finally {
        setLoadingEmployee(false);
      }
    };

    loadEmployee();
  }, [id, reset]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Leave', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const onSubmit = async (data: UpdateEmployeeFormData) => {
    setIsSubmitting(true);

    try {
      const response = await updateEmployee(data);

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      Alert.alert(
        'Success',
        'Employee information updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      console.error('Update employee error:', err);
      Alert.alert('Error', 'Failed to update employee. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render text input
  const renderTextInput = (
    name: keyof UpdateEmployeeFormData,
    label: string,
    options: any = {}
  ) => {
    const { placeholder, keyboardType, multiline, maxLength, autoCapitalize, editable = true } = options;

    return (
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {label}
              {name === 'license_number' || name === 'license_expiry' ? (
                employeeRole === UserRole.DRIVER && <Text style={styles.required}> *</Text>
              ) : null}
            </Text>
            <RNTextInput
              style={[styles.input, multiline && styles.multilineInput]}
              value={value?.toString() || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              placeholderTextColor={COLORS.textTertiary}
              keyboardType={keyboardType}
              multiline={multiline}
              maxLength={maxLength}
              autoCapitalize={autoCapitalize}
              editable={editable && !isSubmitting}
            />
            {errors[name] && (
              <Text style={styles.errorText}>{errors[name]?.message as string}</Text>
            )}
          </View>
        )}
      />
    );
  };

  // Render employment status selector
  const renderEmploymentStatusSelector = () => {
    const selectedStatus = watch('employment_status');

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Employment Status</Text>
        <View style={styles.buttonGroup}>
          {EMPLOYMENT_STATUSES.map((status) => {
            const isSelected = selectedStatus === status.value;
            return (
              <Controller
                key={status.value}
                control={control}
                name="employment_status"
                render={({ field: { onChange } }) => (
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      isSelected && styles.toggleButtonActive,
                    ]}
                    onPress={() => onChange(status.value)}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        isSelected && styles.toggleButtonTextActive,
                      ]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            );
          })}
        </View>
        {errors.employment_status && (
          <Text style={styles.errorText}>{errors.employment_status.message as string}</Text>
        )}
      </View>
    );
  };

  // Render license type selector
  const renderLicenseTypeSelector = () => {
    const selectedType = watch('license_type');

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          License Type
          {employeeRole === UserRole.DRIVER && <Text style={styles.required}> *</Text>}
        </Text>
        <View style={styles.buttonGroup}>
          {LICENSE_TYPES.map((type) => {
            const isSelected = selectedType === type.value;
            return (
              <Controller
                key={type.value}
                control={control}
                name="license_type"
                render={({ field: { onChange } }) => (
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      isSelected && styles.toggleButtonActive,
                    ]}
                    onPress={() => onChange(type.value)}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.toggleButtonText,
                        isSelected && styles.toggleButtonTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            );
          })}
        </View>
        {errors.license_type && (
          <Text style={styles.errorText}>{errors.license_type.message as string}</Text>
        )}
      </View>
    );
  };

  // Render per-trip rate input
  const renderPerTripRateInput = () => {
    const displayValue = perTripRateValue
      ? `₱${perTripRateValue.toString().replace(/[₱,]/g, '')}`
      : '';

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Per-Trip Rate *</Text>
        <Controller
          control={control}
          name="per_trip_rate"
          render={({ field: { onChange, onBlur, value } }) => (
            <RNTextInput
              style={styles.input}
              value={displayValue}
              onChangeText={(text) => {
                const cleaned = text.replace(/[₱,\s]/g, '');
                onChange(cleaned);
              }}
              onBlur={onBlur}
              placeholder="e.g., ₱1,500"
              placeholderTextColor={COLORS.textTertiary}
              keyboardType="numeric"
              editable={!isSubmitting}
            />
          )}
        />
        {perTripRateValue && (
          <Text style={styles.hint}>
            Employee will receive {formatPeso(Number(perTripRateValue))} per completed trip
          </Text>
        )}
        {errors.per_trip_rate && (
          <Text style={styles.errorText}>{errors.per_trip_rate.message as string}</Text>
        )}
      </View>
    );
  };

  // Helper function to format Peso (simple version if not imported)
  const formatPeso = (amount: number): string => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loadingEmployee) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { marginTop: SPACING.md }]}>
            Loading employee details...
          </Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ErrorState
          title="Failed to Load Employee"
          message={error}
          onRetry={() => {
            setError(null);
            setLoadingEmployee(true);
            // Re-trigger effect by changing state
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Edit Employee</Text>
              <Text style={styles.headerSubtitle}>Update employee information</Text>
            </View>
          </View>

          {/* Section 1: Basic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>1</Text>
              </View>
              <Text style={styles.sectionTitle}>Basic Information</Text>
            </View>

            {renderTextInput('employee_id', 'Employee ID', {
              placeholder: 'e.g., DRV-001',
              autoCapitalize: 'characters',
            })}

            {renderTextInput('first_name', 'First Name', {
              autoCapitalize: 'words',
            })}

            {renderTextInput('last_name', 'Last Name', {
              autoCapitalize: 'words',
            })}

            {renderTextInput('phone', 'Phone Number', {
              placeholder: 'e.g., 0917 123 4567',
              keyboardType: 'phone-pad',
            })}

            {/* Structured Address Section */}
            <AddressFormSection
              control={control}
              watch={watch}
              setValue={setValue}
              errors={errors}
              disabled={isSubmitting}
            />
          </View>

          {/* Section 2: Emergency Contact */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>Emergency Contact</Text>
            </View>

            {renderTextInput('emergency_contact_name', 'Contact Name', {
              autoCapitalize: 'words',
            })}

            {renderTextInput('emergency_contact_relationship', 'Relationship', {
              placeholder: 'e.g., Spouse, Parent, Sibling',
              autoCapitalize: 'words',
            })}

            {renderTextInput('emergency_contact_phone', 'Contact Phone Number', {
              placeholder: 'e.g., 0917 123 4567',
              keyboardType: 'phone-pad',
            })}
          </View>

          {/* Section 3: Employment Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>3</Text>
              </View>
              <Text style={styles.sectionTitle}>Employment Details</Text>
            </View>

            {renderTextInput('hire_date', 'Hire Date', {
              placeholder: 'YYYY-MM-DD',
            })}

            {renderEmploymentStatusSelector()}
          </View>

          {/* Section 4: Driver License (conditional) */}
          {employeeRole === UserRole.DRIVER && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionNumber}>
                  <Text style={styles.sectionNumberText}>4</Text>
                </View>
                <Text style={styles.sectionTitle}>Driver License Information</Text>
              </View>

              {renderTextInput('license_number', 'License Number', {
                placeholder: 'e.g., N01-12-345678',
                autoCapitalize: 'characters',
              })}

              {renderLicenseTypeSelector()}

              {renderTextInput('license_restrictions', 'Restrictions', {
                placeholder: 'e.g., 1, 2, 3 (if any)',
              })}

              {renderTextInput('license_expiry', 'Expiry Date', {
                placeholder: 'YYYY-MM-DD',
              })}
            </View>
          )}

          {/* Section 5: Compensation */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>
                  {employeeRole === UserRole.DRIVER ? '5' : '4'}
                </Text>
              </View>
              <Text style={styles.sectionTitle}>Compensation</Text>
            </View>

            {renderPerTripRateInput()}
          </View>

          {/* Submit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, (!isValid || isSubmitting) && styles.submitButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleBackPress}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sectionNumberText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.navy,
  },
  inputGroup: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.navy,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: 16,
    color: COLORS.text,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  toggleButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  toggleButtonTextActive: {
    color: COLORS.white,
  },
  footer: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
});
