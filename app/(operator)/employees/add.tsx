/**
 * Add Employee Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput as RNTextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, Card } from '../../../src/components';
import { useTheme } from '../../../src/hooks';
import { createEmployee } from '../../../src/services/api/employee.service';
import {
  employeeSchema,
  CreateEmployeeFormData,
} from '../../../src/validation/schemas/employee.schema';
import { UserRole } from '../../../src/types';
import { LicenseType, EmploymentStatus } from '../../../src/types/employee.types';

const ROLES = [
  { label: 'Driver', value: UserRole.DRIVER },
  { label: 'Porter', value: UserRole.PORTER },
  { label: 'Operator', value: UserRole.OPERATOR },
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

export default function AddEmployeeScreen() {
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
    watch,
  } = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: {
      employee_id: '',
      first_name: '',
      last_name: '',
      role: UserRole.DRIVER,
      email: '',
      phone: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      hire_date: new Date().toISOString().split('T')[0],
      employment_status: EmploymentStatus.ACTIVE,
      license_number: '',
      license_type: LicenseType.PROFESSIONAL,
      license_restrictions: '',
      license_expiry: '',
      base_salary: undefined,
      daily_rate: undefined,
      trip_rate: undefined,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: CreateEmployeeFormData) => {
    setIsSubmitting(true);

    try {
      const response = await createEmployee(data);

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      Alert.alert('Success', response.message || 'Employee created successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTextInput = (
    name: keyof CreateEmployeeFormData,
    label: string,
    options?: {
      placeholder?: string;
      keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
      multiline?: boolean;
      maxLength?: number;
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {!options?.placeholder?.includes('Optional') && (
          <Text style={{ color: colors.error }}> *</Text>
        )}
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
                borderColor: errors[name] ? colors.error : colors.border,
                color: colors.text,
              },
            ]}
            placeholder={options?.placeholder || label}
            placeholderTextColor={colors.textSecondary}
            value={value?.toString() || ''}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType={options?.keyboardType}
            multiline={options?.multiline}
            maxLength={options?.maxLength}
            autoCapitalize={options?.autoCapitalize}
          />
        )}
      />
      {errors[name] && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {errors[name]?.message as string}
        </Text>
      )}
    </View>
  );

  const renderSelectInput = (
    name: keyof CreateEmployeeFormData,
    label: string,
    options: Array<{ label: string; value: any }>
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label} <Text style={{ color: colors.error }}>*</Text>
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View style={styles.selectContainer}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectOption,
                  {
                    backgroundColor:
                      value === option.value ? colors.primary : colors.white,
                    borderColor: value === option.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => onChange(option.value)}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    {
                      color: value === option.value ? colors.white : colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
      {errors[name] && (
        <Text style={[styles.errorText, { color: colors.error }]}>
          {errors[name]?.message as string}
        </Text>
      )}
    </View>
  );

  return (
    <Screen>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.content, { paddingHorizontal: spacing.md }]}>
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Basic Information
            </Text>

            {renderTextInput('employee_id', 'Employee ID', {
              placeholder: 'e.g., EMP-001',
              autoCapitalize: 'characters',
            })}

            {renderTextInput('first_name', 'First Name', {
              autoCapitalize: 'words',
            })}

            {renderTextInput('last_name', 'Last Name', {
              autoCapitalize: 'words',
            })}

            {renderSelectInput('role', 'Role', ROLES)}

            {renderTextInput('email', 'Email', {
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            })}

            {renderTextInput('phone', 'Phone Number', {
              placeholder: 'e.g., 0917-123-4567 (Optional)',
              keyboardType: 'phone-pad',
            })}

            {renderTextInput('address', 'Address', {
              placeholder: 'Optional',
              multiline: true,
              maxLength: 500,
            })}
          </Card>

          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Emergency Contact
            </Text>

            {renderTextInput('emergency_contact_name', 'Contact Name', {
              placeholder: 'Optional',
              autoCapitalize: 'words',
            })}

            {renderTextInput('emergency_contact_phone', 'Contact Phone', {
              placeholder: 'Optional',
              keyboardType: 'phone-pad',
            })}
          </Card>

          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Employment Details
            </Text>

            {renderTextInput('hire_date', 'Hire Date', {
              placeholder: 'YYYY-MM-DD',
            })}

            {renderSelectInput('employment_status', 'Status', EMPLOYMENT_STATUSES)}
          </Card>

          {selectedRole === UserRole.DRIVER && (
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Driver License Information
              </Text>

              {renderTextInput('license_number', 'License Number', {
                placeholder: 'e.g., N01-12-345678',
                autoCapitalize: 'characters',
              })}

              {renderSelectInput('license_type', 'License Type', LICENSE_TYPES)}

              {renderTextInput('license_restrictions', 'Restrictions', {
                placeholder: 'Optional (e.g., 1, 2, 3, etc.)',
              })}

              {renderTextInput('license_expiry', 'Expiry Date', {
                placeholder: 'YYYY-MM-DD',
              })}
            </Card>
          )}

          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Compensation
            </Text>

            {renderTextInput('base_salary', 'Base Salary', {
              placeholder: 'Optional',
              keyboardType: 'numeric',
            })}

            {renderTextInput('daily_rate', 'Daily Rate', {
              placeholder: 'Optional',
              keyboardType: 'numeric',
            })}

            {renderTextInput('trip_rate', 'Per-Trip Rate', {
              placeholder: 'Optional',
              keyboardType: 'numeric',
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
            onPress={() => router.back()}
            variant="outline"
            style={{ flex: 1, marginRight: spacing.sm }}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSubmit((data) => onSubmit(data))}
            loading={isSubmitting}
            style={{ flex: 1 }}
          >
            Create Employee
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
  content: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
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
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  footerContent: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
});
