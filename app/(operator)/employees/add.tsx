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
  const [createdSuccessData, setCreatedSuccessData] = useState<CreateEmployeeFormData | null>(null);
  const [errorBannerList, setErrorBannerList] = useState<string[]>([]);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setValue,
    trigger,
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    mode: 'onChange',
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

  const [inAppAlert, setInAppAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'info' | 'error' | 'success' | 'warning' | 'confirm';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showAppAlert = (
    title: string,
    message: string,
    type: 'info' | 'error' | 'success' | 'warning' = 'info'
  ) => {
    setInAppAlert({
      visible: true,
      title,
      message,
      type,
      confirmText: 'OK',
      onConfirm: () => setInAppAlert(null),
    });
  };

  const showAppConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Leave',
    cancelText = 'Stay'
  ) => {
    setInAppAlert({
      visible: true,
      title,
      message,
      type: 'confirm',
      confirmText,
      cancelText,
      onConfirm: () => {
        setInAppAlert(null);
        onConfirm();
      },
      onCancel: () => setInAppAlert(null),
    });
  };

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
    setValue('temporary_password', password, { shouldValidate: true, shouldDirty: true });
    setValue('confirm_password', password, { shouldValidate: true, shouldDirty: true });
    trigger(['temporary_password', 'confirm_password']);
    
    showAppAlert(
      'Password Generated',
      `Secure password: ${password}\n\nMake sure to save this password securely.`,
      'success'
    );
  };

  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      showAppConfirm(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        () => router.back(),
        'Leave',
        'Stay'
      );
    } else {
      router.back();
    }
  };

  const onFormError = (formErrors: any) => {
    console.warn('Form validation errors:', formErrors);
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length > 0) {
      setErrorBannerList(errorKeys);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      showAppAlert('Incomplete Form', 'Please fill in the required fields highlighted in red below.', 'error');
    }
  };

  const onSubmit = async (data: CreateEmployeeFormData) => {
    setErrorBannerList([]);

    if (usernameAvailable === false) {
      showAppAlert('Username Taken', 'This username is already in use. Please enter a unique username.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createEmployee(data);

      if (response.error) {
        showAppAlert('Creation Failed', response.error, 'error');
        return;
      }

      // Show success modal inside mobile frame
      setCreatedSuccessData(data);
    } catch (error: any) {
      const errorMsg = error?.message || 'An unexpected error occurred';
      showAppAlert('Error', errorMsg, 'error');
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
          ref={scrollViewRef}
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

          {/* Validation Errors Banner */}
          {errorBannerList.length > 0 && (
            <View style={styles.errorBanner}>
              <View style={styles.errorBannerHeader}>
                <Ionicons name="alert-circle" size={18} color={COLORS.error} />
                <Text style={styles.errorBannerTitle}>
                  Please fill in the required fields highlighted in red below.
                </Text>
              </View>
            </View>
          )}

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
              isSubmitting && styles.createButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit, onFormError)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.createButtonText}>Create Employee</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      {createdSuccessData && (
        <View style={styles.modalOverlay}>
          <View style={styles.successModalCard}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={44} color={COLORS.success} />
            </View>
            
            <Text style={styles.successModalTitle}>Employee Created!</Text>
            <Text style={styles.successModalSubtitle}>
              {createdSuccessData.first_name} {createdSuccessData.last_name} has been added successfully.
            </Text>

            <View style={styles.credentialsBox}>
              <View style={styles.credRow}>
                <Text style={styles.credLabel}>Role:</Text>
                <Text style={styles.credValue}>
                  {createdSuccessData.role === UserRole.DRIVER ? 'Driver' : 'Helper'}
                </Text>
              </View>
              <View style={styles.credRow}>
                <Text style={styles.credLabel}>Username:</Text>
                <Text style={styles.credValue}>{createdSuccessData.username}</Text>
              </View>
              <View style={styles.credRow}>
                <Text style={styles.credLabel}>Temp Password:</Text>
                <Text style={[styles.credValue, { color: COLORS.teal, fontWeight: '700' }]}>
                  {createdSuccessData.temporary_password}
                </Text>
              </View>
            </View>

            <Text style={styles.successNote}>
              Provide this temporary password securely. The employee will be required to change it on their first login.
            </Text>

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => {
                setCreatedSuccessData(null);
                router.back();
              }}
            >
              <Text style={styles.modalDoneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* In-App Alert / Confirm Modal (Contained within mobile frame) */}
      {inAppAlert && inAppAlert.visible && (
        <View style={styles.modalOverlay}>
          <View style={styles.inAppAlertCard}>
            <View style={[
              styles.inAppAlertIconCircle,
              inAppAlert.type === 'error' && { backgroundColor: '#FEE2E2' },
              inAppAlert.type === 'warning' && { backgroundColor: '#FEF3C7' },
              inAppAlert.type === 'success' && { backgroundColor: '#DCFCE7' },
              inAppAlert.type === 'confirm' && { backgroundColor: '#FEE2E2' },
            ]}>
              <Ionicons
                name={
                  inAppAlert.type === 'error'
                    ? 'alert-circle'
                    : inAppAlert.type === 'warning'
                    ? 'warning'
                    : inAppAlert.type === 'success'
                    ? 'checkmark-circle'
                    : inAppAlert.type === 'confirm'
                    ? 'help-circle'
                    : 'information-circle'
                }
                size={34}
                color={
                  inAppAlert.type === 'error' || inAppAlert.type === 'confirm'
                    ? '#EF4444'
                    : inAppAlert.type === 'warning'
                    ? '#F59E0B'
                    : inAppAlert.type === 'success'
                    ? '#10B981'
                    : '#0EA5E9'
                }
              />
            </View>

            <Text style={styles.inAppAlertTitle}>{inAppAlert.title}</Text>
            <Text style={styles.inAppAlertMessage}>{inAppAlert.message}</Text>

            <View style={styles.inAppAlertButtonsRow}>
              {inAppAlert.cancelText && (
                <TouchableOpacity
                  style={styles.inAppAlertCancelBtn}
                  onPress={inAppAlert.onCancel || (() => setInAppAlert(null))}
                >
                  <Text style={styles.inAppAlertCancelText}>{inAppAlert.cancelText}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.inAppAlertConfirmBtn,
                  inAppAlert.cancelText ? { flex: 1 } : { width: '100%' },
                ]}
                onPress={inAppAlert.onConfirm || (() => setInAppAlert(null))}
              >
                <Text style={styles.inAppAlertConfirmText}>{inAppAlert.confirmText || 'OK'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  inAppAlertCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  inAppAlertIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  inAppAlertTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  inAppAlertMessage: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  inAppAlertButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
  },
  inAppAlertCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  inAppAlertCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  inAppAlertConfirmBtn: {
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inAppAlertConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.base,
    padding: SPACING.md,
  },
  errorBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  errorBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
  },
  errorBannerItem: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
    marginLeft: 4,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
    zIndex: 9999,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  successModalSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.base,
  },
  credentialsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  credLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  credValue: {
    fontSize: 14,
    color: COLORS.navy,
    fontWeight: '600',
  },
  successNote: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: SPACING.lg,
  },
  modalDoneButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDoneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
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
    marginHorizontal: SPACING.base,
    padding: SPACING.base,
    borderRadius: 16,
    shadowColor: COLORS.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  sectionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  sectionNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
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
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.base,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  inputWithPrefix: {
    paddingLeft: 36,
  },
  inputWithRightButton: {
    paddingRight: 48,
  },
  inputRightIcon: {
    position: 'absolute',
    right: SPACING.sm,
    top: 14,
  },
  currencySymbol: {
    position: 'absolute',
    left: SPACING.base,
    top: 14,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
    zIndex: 1,
  },
  previewText: {
    fontSize: 13,
    color: COLORS.teal,
    fontWeight: '600',
    marginTop: SPACING.xs,
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
  selectorContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  selectorOption: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    alignItems: 'center',
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
