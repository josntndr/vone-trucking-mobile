// @ts-nocheck
/**
 * Add Employee Screen
 * Comprehensive redesign with required fields, per-trip compensation, and account management
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
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen } from '../../../src/components';
import { AddressFormSection } from '../../../src/components/forms';
import { 
  createEmployee, 
  checkUsernameAvailability 
} from '../../../src/services/api/employee.service';
import {
  employeeSchema,
  CreateEmployeeFormData,
  generateSecurePassword,
} from '../../../src/validation/schemas/employee.schema';
import { UserRole } from '../../../src/types';
import { LicenseType, EmploymentStatus, AccountStatus } from '../../../src/types/employee.types';
import { COLORS, SPACING } from '../../../src/theme/designSystem';

const ROLES = [
  { label: 'Driver', value: UserRole.DRIVER },
  { label: 'Helper', value: UserRole.PORTER },
];

const LICENSE_TYPES = [
  { label: 'Non-Professional', value: LicenseType.NON_PROFESSIONAL },
  { label: 'Professional', value: LicenseType.PROFESSIONAL },
  { label: 'Conductor', value: LicenseType.CONDUCTOR },
];

const EMPLOYMENT_STATUSES = [
  { label: 'Active', value: EmploymentStatus.ACTIVE },
  { label: 'On Leave', value: EmploymentStatus.ON_LEAVE },
  { label: 'Inactive', value: EmploymentStatus.INACTIVE },
];

const ACCOUNT_STATUSES = [
  { label: 'Active', value: AccountStatus.ACTIVE },
  { label: 'Deactivated', value: AccountStatus.DEACTIVATED },
];

export default function AddEmployeeScreen() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    trigger,
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    mode: 'onBlur',
    defaultValues: {
      employee_id: '',
      first_name: '',
      last_name: '',
      role: UserRole.DRIVER,
      phone: '',
      // Legacy address field (optional for backward compatibility)
      address: '',
      // Structured address fields (required)
      country: 'Philippines',
      country_code: 'PH',
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
      hire_date: new Date().toISOString().split('T')[0],
      employment_status: EmploymentStatus.ACTIVE,
      license_number: '',
      license_type: LicenseType.PROFESSIONAL,
      license_restrictions: '',
      license_expiry: '',
      per_trip_rate: '' as any,
      username: '',
      temporary_password: '',
      confirm_password: '',
      account_status: AccountStatus.ACTIVE,
      require_password_change: true,
    },
  });

  const selectedRole = watch('role');
  const usernameValue = watch('username');
  const perTripRateValue = watch('per_trip_rate');

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!usernameValue || usernameValue.length < 4) {
        setUsernameAvailable(null);
        return;
      }

      setCheckingUsername(true);
      const result = await checkUsernameAvailability(usernameValue);
      setCheckingUsername(false);
      
      if (!result.error) {
        setUsernameAvailable(result.data ?? false);
      }
    };

    const debounce = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounce);
  }, [usernameValue]);

  const handleGeneratePassword = () => {
    const password = generateSecurePassword();
    setValue('temporary_password', password);
    setValue('confirm_password', password);
    trigger(['temporary_password', 'confirm_password']);
    Alert.alert(
      'Password Generated',
      `Secure password: ${password}\n\nMake sure to save this password securely.`,
      [{ text: 'OK' }]
    );
  };

  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          { text: 'Stay', style: 'cancel' },
          { 
            text: 'Leave', 
            style: 'destructive',
            onPress: () => router.back() 
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const onSubmit = async (data: CreateEmployeeFormData) => {
    setIsSubmitting(true);

    try {
      const response = await createEmployee(data);

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      // Show success with one-time credentials
      Alert.alert(
        'Employee Created',
        `${data.first_name} ${data.last_name} has been added successfully.\n\n` +
        `Username: ${data.username}\n` +
        `Role: ${data.role === UserRole.DRIVER ? 'Driver' : 'Helper'}\n\n` +
        `Provide the temporary password securely to the employee. ` +
        `They will be required to change it on first login.`,
        [
          {
            text: 'Done',
            onPress: () => {
              router.back();
              // Optionally navigate to the employee profile
              // router.push(`/(operator)/employees/${response.data?.id}`);
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render text input helper
  const renderTextInput = (
    name: keyof CreateEmployeeFormData,
    label: string,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
      multiline?: boolean;
      maxLength?: number;
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
      secureTextEntry?: boolean;
      rightIcon?: React.ReactNode;
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.inputContainer}>
            <RNTextInput
              style={[
                styles.input,
                options?.multiline && styles.inputMultiline,
                errors[name] && styles.inputError,
              ]}
              placeholder={options?.placeholder || label}
              placeholderTextColor={COLORS.textMuted}
              value={value?.toString() || ''}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType={options?.keyboardType}
              multiline={options?.multiline}
              maxLength={options?.maxLength}
              autoCapitalize={options?.autoCapitalize}
              secureTextEntry={options?.secureTextEntry}
              editable={!isSubmitting}
            />
            {options?.rightIcon && (
              <View style={styles.inputRightIcon}>{options.rightIcon}</View>
            )}
          </View>
        )}
      />
      {errors[name] && (
        <Text style={styles.errorText}>{errors[name]?.message as string}</Text>
      )}
    </View>
  );

  // Render role selector
  const renderRoleSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        Role <Text style={styles.required}>*</Text>
      </Text>
      <Controller
        control={control}
        name="role"
        render={({ field: { onChange, value } }) => (
          <View style={styles.selectorContainer}>
            {ROLES.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectorOption,
                  value === option.value && styles.selectorOptionActive,
                ]}
                onPress={() => onChange(option.value)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.selectorOptionText,
                    value === option.value && styles.selectorOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors.role && (
        <Text style={styles.errorText}>{errors.role.message}</Text>
      )}
    </View>
  );

  // Render employment status selector
  const renderEmploymentStatusSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        Employment Status <Text style={styles.required}>*</Text>
      </Text>
      <Controller
        control={control}
        name="employment_status"
        render={({ field: { onChange, value } }) => (
          <View style={styles.selectorContainer}>
            {EMPLOYMENT_STATUSES.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectorOption,
                  value === option.value && styles.selectorOptionActive,
                ]}
                onPress={() => onChange(option.value)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.selectorOptionText,
                    value === option.value && styles.selectorOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );

  // Render license type selector (for drivers)
  const renderLicenseTypeSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        License Type <Text style={styles.required}>*</Text>
      </Text>
      <Controller
        control={control}
        name="license_type"
        render={({ field: { onChange, value } }) => (
          <View style={styles.selectorContainer}>
            {LICENSE_TYPES.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectorOption,
                  value === option.value && styles.selectorOptionActive,
                ]}
                onPress={() => onChange(option.value)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.selectorOptionText,
                    value === option.value && styles.selectorOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );

  // Render account status selector
  const renderAccountStatusSelector = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        Account Status <Text style={styles.required}>*</Text>
      </Text>
      <Controller
        control={control}
        name="account_status"
        render={({ field: { onChange, value } }) => (
          <View style={styles.selectorContainer}>
            {ACCOUNT_STATUSES.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectorOption,
                  value === option.value && styles.selectorOptionActive,
                ]}
                onPress={() => onChange(option.value)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.selectorOptionText,
                    value === option.value && styles.selectorOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );

  // Render per-trip rate with preview
  const renderPerTripRateInput = () => {
    const rateValue = typeof perTripRateValue === 'number' 
      ? perTripRateValue 
      : parseFloat(String(perTripRateValue).replace(/[₱,\s]/g, '')) || 0;

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Per-Trip Rate <Text style={styles.required}>*</Text>
        </Text>
        <Controller
          control={control}
          name="per_trip_rate"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>₱</Text>
                <RNTextInput
                  style={[
                    styles.input,
                    styles.inputWithPrefix,
                    errors.per_trip_rate && styles.inputError,
                  ]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={value?.toString() || ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="decimal-pad"
                  editable={!isSubmitting}
                />
              </View>
              {rateValue > 0 && !errors.per_trip_rate && (
                <Text style={styles.previewText}>
                  {new Intl.NumberFormat('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                  }).format(rateValue)} per completed trip
                </Text>
              )}
            </>
          )}
        />
        {errors.per_trip_rate && (
          <Text style={styles.errorText}>{errors.per_trip_rate.message as string}</Text>
        )}
      </View>
    );
  };

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
              <Text style={styles.headerTitle}>Add Employee</Text>
              <Text style={styles.headerSubtitle}>Create employee profile and account</Text>
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

            {renderRoleSelector()}

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
          {selectedRole === UserRole.DRIVER && (
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
                <Text style={styles.sectionNumberText}>{selectedRole === UserRole.DRIVER ? '5' : '4'}</Text>
              </View>
              <Text style={styles.sectionTitle}>Compensation</Text>
            </View>

            {renderPerTripRateInput()}
          </View>

          {/* Section 6: Account Access */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>{selectedRole === UserRole.DRIVER ? '6' : '5'}</Text>
              </View>
              <Text style={styles.sectionTitle}>Account Access</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Username <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <RNTextInput
                      style={[
                        styles.input,
                        errors.username && styles.inputError,
                      ]}
                      placeholder="Enter username"
                      placeholderTextColor={COLORS.textMuted}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      editable={!isSubmitting}
                    />
                    {checkingUsername && (
                      <ActivityIndicator size="small" color={COLORS.navy} style={styles.inputRightIcon} />
                    )}
                    {!checkingUsername && usernameAvailable === true && value && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} style={styles.inputRightIcon} />
                    )}
                    {!checkingUsername && usernameAvailable === false && value && (
                      <Ionicons name="close-circle" size={20} color={COLORS.error} style={styles.inputRightIcon} />
                    )}
                  </View>
                )}
              />
              {usernameAvailable === false && usernameValue && (
                <Text style={styles.errorText}>This username is already in use</Text>
              )}
              {errors.username && (
                <Text style={styles.errorText}>{errors.username.message}</Text>
              )}
              <Text style={styles.helpText}>
                Lowercase letters, numbers, underscores, and hyphens only
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Temporary Password <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="temporary_password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <RNTextInput
                      style={[
                        styles.input,
                        styles.inputWithRightButton,
                        errors.temporary_password && styles.inputError,
                      ]}
                      placeholder="Enter temporary password"
                      placeholderTextColor={COLORS.textMuted}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.inputRightIcon}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.temporary_password && (
                <Text style={styles.errorText}>{errors.temporary_password.message as string}</Text>
              )}
              <Text style={styles.helpText}>
                At least 8 characters with uppercase, lowercase, and number
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Confirm Password <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="confirm_password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <RNTextInput
                      style={[
                        styles.input,
                        styles.inputWithRightButton,
                        errors.confirm_password && styles.inputError,
                      ]}
                      placeholder="Confirm password"
                      placeholderTextColor={COLORS.textMuted}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      editable={!isSubmitting}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.inputRightIcon}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.confirm_password && (
                <Text style={styles.errorText}>{errors.confirm_password.message}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGeneratePassword}
              disabled={isSubmitting}
            >
              <MaterialCommunityIcons name="key-variant" size={20} color={COLORS.teal} />
              <Text style={styles.generateButtonText}>Generate Secure Password</Text>
            </TouchableOpacity>

            {renderAccountStatusSelector()}

            <View style={styles.checkboxContainer}>
              <Controller
                control={control}
                name="require_password_change"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => onChange(!value)}
                    disabled={isSubmitting}
                  >
                    <View style={[styles.checkboxBox, value && styles.checkboxBoxChecked]}>
                      {value && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      Require password change on first login
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={COLORS.teal} />
              <Text style={styles.infoText}>
                The temporary password will be shown once after creation. Make sure to provide it securely to the employee.
              </Text>
            </View>
          </View>



        </ScrollView>

        {/* Sticky Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleBackPress}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.createButton,
              (!isValid || isSubmitting || usernameAvailable === false) && styles.createButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting || usernameAvailable === false}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.createButtonText}>Create Employee</Text>
            )}
          </TouchableOpacity>
        </View>
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

    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.base,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sectionNumberText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  inputGroup: {
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputMultiline: {
    height: 100,
    paddingTop: SPACING.md,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputWithPrefix: {
    paddingLeft: 36,
  },
  inputWithRightButton: {
    paddingRight: 44,
  },
  currencySymbol: {
    position: 'absolute',
    left: SPACING.md,
    top: SPACING.md,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    zIndex: 1,
  },
  inputRightIcon: {
    position: 'absolute',
    right: SPACING.md,
    top: SPACING.md,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  previewText: {
    fontSize: 13,
    color: COLORS.teal,
    marginTop: 4,
    fontWeight: '500',
  },
  selectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  selectorOption: {
    paddingHorizontal: SPACING.base,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  selectorOptionActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  selectorOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectorOptionTextActive: {
    color: COLORS.white,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.base,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.teal,
    backgroundColor: COLORS.white,
    marginBottom: SPACING.base,
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.teal,
    marginLeft: SPACING.xs,
  },
  checkboxContainer: {
    marginBottom: SPACING.base,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  checkboxBoxChecked: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F7FA',
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.xs,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    marginLeft: SPACING.xs,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },
  createButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.navy,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.navy,
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

