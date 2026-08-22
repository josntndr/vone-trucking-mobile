/**
 * Employees List Screen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  SearchInput,
  StatusChip,
  Card,
  LoadingSpinner,
  EmptyState,
  ErrorState,
} from '../../../src/components';
import { useTheme } from '../../../src/hooks';
import { getEmployees } from '../../../src/services/api/employee.service';
import { Employee, EmploymentStatus } from '../../../src/types/employee.types';
import { UserRole } from '../../../src/types';
import { formatPhilippinePhone, isExpiringSoon, isExpired } from '../../../src/utils/philippines';

const ROLE_FILTERS = [
  { label: 'All', value: null },
  { label: 'Drivers', value: UserRole.DRIVER },
  { label: 'Porters', value: UserRole.PORTER },
  { label: 'Operators', value: UserRole.OPERATOR },
];

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Active', value: EmploymentStatus.ACTIVE },
  { label: 'On Leave', value: EmploymentStatus.ON_LEAVE },
  { label: 'Suspended', value: EmploymentStatus.SUSPENDED },
  { label: 'Inactive', value: EmploymentStatus.INACTIVE },
];

export default function EmployeesListScreen() {
  const { colors, spacing } = useTheme();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | null>(null);
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadEmployees = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const response = await getEmployees(
        {
          search: search || undefined,
          role: roleFilter || undefined,
          employment_status: statusFilter || undefined,
          is_active: statusFilter === EmploymentStatus.INACTIVE ? false : true,
        },
        pageNum,
        20
      );

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        if (append) {
          setEmployees((prev) => [...prev, ...response.data!.data]);
        } else {
          setEmployees(response.data.data);
        }
        setHasMore(response.data.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      setError('Failed to load employees');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadEmployees(1, false);
  }, [search, roleFilter, statusFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    loadEmployees(1, false);
  }, [search, roleFilter, statusFilter]);

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadEmployees(page + 1, true);
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

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.DRIVER:
        return colors.primary;
      case UserRole.PORTER:
        return colors.accent;
      case UserRole.OPERATOR:
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const checkLicenseExpiry = (employee: Employee) => {
    if (employee.role !== UserRole.DRIVER || !employee.license_expiry) return null;
    if (isExpired(employee.license_expiry)) return 'expired';
    if (isExpiringSoon(employee.license_expiry)) return 'expiring';
    return 'valid';
  };

  const renderEmployeeItem = ({ item }: { item: Employee }) => {
    const licenseStatus = checkLicenseExpiry(item);

    return (
      <TouchableOpacity onPress={() => router.push(`/(operator)/employees/${item.id}`)}>
        <Card style={styles.employeeCard}>
          <View style={styles.employeeHeader}>
            <View style={styles.employeeInfo}>
              <View style={styles.nameRow}>
                <View
                  style={[styles.roleIconContainer, { backgroundColor: getRoleColor(item.role) + '15' }]}
                >
                  <Ionicons name={getRoleIcon(item.role)} size={20} color={getRoleColor(item.role)} />
                </View>
                <View style={styles.nameContent}>
                  <Text style={[styles.employeeName, { color: colors.text }]}>{item.full_name}</Text>
                  <Text style={[styles.employeeId, { color: colors.textSecondary }]}>
                    {item.employee_id}
                  </Text>
                </View>
              </View>
            </View>
            <StatusChip
              label={getStatusLabel(item.employment_status)}
              color={getStatusColor(item.employment_status)}
            />
          </View>

          <View style={styles.employeeDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="briefcase" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
              </Text>
            </View>

            {item.phone && (
              <View style={styles.detailRow}>
                <Ionicons name="call" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  {formatPhilippinePhone(item.phone)}
                </Text>
              </View>
            )}

            {item.role === UserRole.DRIVER && item.license_number && (
              <View style={styles.detailRow}>
                <Ionicons name="card" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  License: {item.license_number}
                </Text>
                {licenseStatus && licenseStatus !== 'valid' && (
                  <View
                    style={[
                      styles.warningBadge,
                      {
                        backgroundColor:
                          licenseStatus === 'expired' ? colors.error + '15' : colors.warning + '15',
                      },
                    ]}
                  >
                    <Ionicons
                      name="warning"
                      size={12}
                      color={licenseStatus === 'expired' ? colors.error : colors.warning}
                    />
                  </View>
                )}
              </View>
            )}

            {item.assigned_truck_number && (
              <View style={styles.detailRow}>
                <Ionicons name="car" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  Truck: {item.assigned_truck_number}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (loading && employees.length === 0) {
    return (
      <Screen>
        <LoadingSpinner />
      </Screen>
    );
  }

  if (error && employees.length === 0) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={() => loadEmployees(1, false)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* Search */}
        <View style={[styles.searchContainer, { paddingHorizontal: spacing.md }]}>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search employees..."
          />
        </View>

        {/* Role Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={ROLE_FILTERS}
            keyExtractor={(item) => item.label}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.filtersContent, { paddingHorizontal: spacing.md }]}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: roleFilter === item.value ? colors.primary : colors.surface,
                    borderColor: roleFilter === item.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setRoleFilter(item.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: roleFilter === item.value ? colors.surface : colors.text,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Status Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={STATUS_FILTERS}
            keyExtractor={(item) => item.label}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.filtersContent, { paddingHorizontal: spacing.md }]}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      statusFilter === item.value ? colors.primary : colors.surface,
                    borderColor: statusFilter === item.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setStatusFilter(item.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: statusFilter === item.value ? colors.surface : colors.text,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Employees List */}
        <FlatList
          data={employees}
          renderItem={renderEmployeeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No employees found"
              message="Add your first employee to get started"
            />
          }
        />

        {/* Add Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(operator)/employees/add')}
        >
          <Ionicons name="add" size={28} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingVertical: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 8,
  },
  employeeCard: {
    padding: 16,
    marginBottom: 12,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  employeeInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nameContent: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 14,
    fontWeight: '500',
  },
  employeeDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  warningBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

