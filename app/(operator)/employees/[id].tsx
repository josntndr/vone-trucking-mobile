/**
 * Employee Detail Screen
 * Shows complete employee information and allows editing/archiving
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
  Button,
} from '../../../src/components';
import { useTheme } from '../../../src/hooks';
import {
  getEmployeeById,
  archiveEmployee,
  restoreEmployee,
} from '../../../src/services/api/employee.service';
import { Employee, EmploymentStatus } from '../../../src/types/employee.types';
import { UserRole } from '../../../src/types';
import {
  formatPhilippineDate,
  formatPhilippinePhone,
  formatPeso,
  isExpired,
  isExpiringSoon,
} from '../../../src/utils/philippines';

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmployee = async () => {
    try {
      const response = await getEmployeeById(id);
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setEmployee(response.data);
      }
    } catch (err) {
      setError('Failed to load employee details');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    setError(null);
    loadEmployee();
  };

  const handleArchive = () => {
    Alert.alert(
      'Archive Employee',
      'Are you sure you want to archive this employee? They will no longer appear in active lists.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            const response = await archiveEmployee(id);
            if (response.error) {
              Alert.alert('Error', response.error);
            } else {
              Alert.alert('Success', 'Employee archived successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            }
          },
        },
      ]
    );
  };

  const handleRestore = async () => {
    const response = await restoreEmployee(id);
    if (response.error) {
      Alert.alert('Error', response.error);
    } else {
      Alert.alert('Success', 'Employee restored successfully');
      loadEmployee();
    }
  };

  const getStatusColor = (status?: EmploymentStatus) => {
    switch (status) {
      case EmploymentStatus.ACTIVE:
        return colors.success;
      case EmploymentStatus.ON_LEAVE:
        return colors.warning;
      case EmploymentStatus.SUSPENDED:
        return colors.error;
      case EmploymentStatus.INACTIVE:
      case EmploymentStatus.ARCHIVED:
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status?: EmploymentStatus) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.DRIVER:
        return 'car';
      case UserRole.PORTER:
        return 'cube';
      case UserRole.OPERATOR:
        return 'settings';
      default:
        return 'person';
    }
  };

  const checkLicenseExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    if (isExpired(expiryDate)) return 'expired';
    if (isExpiringSoon(expiryDate)) return 'expiring';
    return 'valid';
  };

  if (loading && !employee) {
    return (
      <Screen>
        <LoadingSpinner />
      </Screen>
    );
  }

  if (error && !employee) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={loadEmployee} />
      </Screen>
    );
  }

  if (!employee) {
    return (
      <Screen>
        <ErrorState message="Employee not found" onRetry={() => router.back()} />
      </Screen>
    );
  }

  const licenseStatus = checkLicenseExpiry(employee.license_expiry);

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={[styles.content, { paddingHorizontal: spacing.md }]}>
          {/* Header Card */}
          <Card style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View
                style={[
                  styles.roleIconLarge,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <Ionicons
                  name={getRoleIcon(employee.role)}
                  size={32}
                  color={colors.primary}
                />
              </View>
              <View style={styles.headerInfo}>
                <Text style={[styles.employeeName, { color: colors.text }]}>
                  {employee.full_name}
                </Text>
                <Text style={[styles.employeeId, { color: colors.textSecondary }]}>
                  {employee.employee_id}
                </Text>
                <View style={styles.roleRow}>
                  <Text style={[styles.roleText, { color: colors.text }]}>
                    {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                  </Text>
                  <StatusChip
                    label={getStatusLabel(employee.employment_status)}
                    color={getStatusColor(employee.employment_status)}
                  />
                </View>
              </View>
            </View>
          </Card>

          {/* License Warning (for drivers) */}
          {employee.role === UserRole.DRIVER && licenseStatus && licenseStatus !== 'valid' && (
            <Card
              style={[
                styles.warningCard,
                {
                  backgroundColor:
                    licenseStatus === 'expired'
                      ? colors.error + '10'
                      : colors.warning + '10',
                  borderColor:
                    licenseStatus === 'expired' ? colors.error : colors.warning,
                },
              ]}
            >
              <Ionicons
                name="warning"
                size={24}
                color={licenseStatus === 'expired' ? colors.error : colors.warning}
              />
              <Text
                style={[
                  styles.warningText,
                  {
                    color:
                      licenseStatus === 'expired' ? colors.error : colors.warning,
                  },
                ]}
              >
                {licenseStatus === 'expired'
                  ? 'Driver license has expired!'
                  : 'Driver license expiring soon'}
              </Text>
            </Card>
          )}

          {/* Contact Information */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Contact Information
            </Text>

            {employee.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Phone
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formatPhilippinePhone(employee.phone)}
                  </Text>
                </View>
              </View>
            )}

            {employee.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Email
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {employee.email}
                  </Text>
                </View>
              </View>
            )}

            {employee.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Address
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {employee.address}
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {/* Emergency Contact */}
          {(employee.emergency_contact_name || employee.emergency_contact_phone) && (
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Emergency Contact
              </Text>

              {employee.emergency_contact_name && (
                <View style={styles.infoRow}>
                  <Ionicons name="person" size={20} color={colors.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Name
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {employee.emergency_contact_name}
                    </Text>
                  </View>
                </View>
              )}

              {employee.emergency_contact_phone && (
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={20} color={colors.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Phone
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {formatPhilippinePhone(employee.emergency_contact_phone)}
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          )}

          {/* Employment Details */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Employment Details
            </Text>

            {employee.hire_date && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Hire Date
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {formatPhilippineDate(employee.hire_date)}
                  </Text>
                </View>
              </View>
            )}

            {(employee.trip_count !== undefined || employee.completed_trips !== undefined) && (
              <View style={styles.infoRow}>
                <Ionicons name="navigate" size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    Trips
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {employee.completed_trips || 0} completed
                    {employee.trip_count ? ` of ${employee.trip_count} total` : ''}
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {/* Driver License (for drivers) */}
          {employee.role === UserRole.DRIVER && employee.license_number && (
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Driver License
              </Text>

              <View style={styles.infoRow}>
                <Ionicons name="card" size={20} color={colors.textSecondary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                    License Number
                  </Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {employee.license_number}
                  </Text>
                </View>
              </View>

              {employee.license_type && (
                <View style={styles.infoRow}>
                  <Ionicons name="ribbon" size={20} color={colors.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Type
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {employee.license_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Text>
                  </View>
                </View>
              )}

              {employee.license_restrictions && (
                <View style={styles.infoRow}>
                  <Ionicons name="alert-circle" size={20} color={colors.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Restrictions
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {employee.license_restrictions}
                    </Text>
                  </View>
                </View>
              )}

              {employee.license_expiry && (
                <View style={styles.infoRow}>
                  <Ionicons name="time" size={20} color={colors.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Expiry Date
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color:
                            licenseStatus === 'expired'
                              ? colors.error
                              : licenseStatus === 'expiring'
                              ? colors.warning
                              : colors.text,
                        },
                      ]}
                    >
                      {formatPhilippineDate(employee.license_expiry)}
                    </Text>
                  </View>
                </View>
              )}

              {employee.assigned_truck_number && (
                <View style={styles.infoRow}>
                  <Ionicons name="car" size={20} color={colors.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Assigned Truck
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {employee.assigned_truck_number}
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          )}

          {/* Compensation */}
          {employee.compensation_config && (
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Compensation
              </Text>

              {employee.compensation_config.base_salary && (
                <View style={styles.infoRow}>
                  <Ionicons name="cash" size={20} color={colors.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Base Salary
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.success }]}>
                      {formatPeso(employee.compensation_config.base_salary)}
                    </Text>
                  </View>
                </View>
              )}

              {employee.compensation_config.daily_rate && (
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Daily Rate
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.success }]}>
                      {formatPeso(employee.compensation_config.daily_rate)}
                    </Text>
                  </View>
                </View>
              )}

              {employee.compensation_config.trip_rate && (
                <View style={styles.infoRow}>
                  <Ionicons name="navigate" size={20} color={colors.textSecondary} />
                  <View style={styles.infoContent}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Per-Trip Rate
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.success }]}>
                      {formatPeso(employee.compensation_config.trip_rate)}
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          )}

          {/* Actions */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.border }]}
              onPress={() => router.push(`/(operator)/employees/edit/${id}`)}
            >
              <Ionicons name="create" size={20} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                Edit Employee
              </Text>
            </TouchableOpacity>

            {employee.employment_status !== EmploymentStatus.ARCHIVED ? (
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.border }]}
                onPress={handleArchive}
              >
                <Ionicons name="archive" size={20} color={colors.error} />
                <Text style={[styles.actionButtonText, { color: colors.error }]}>
                  Archive Employee
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.border }]}
                onPress={handleRestore}
              >
                <Ionicons name="refresh" size={20} color={colors.success} />
                <Text style={[styles.actionButtonText, { color: colors.success }]}>
                  Restore Employee
                </Text>
              </TouchableOpacity>
            )}
          </Card>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerCard: {
    padding: 20,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  employeeId: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
