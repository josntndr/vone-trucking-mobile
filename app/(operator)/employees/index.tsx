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
  TextInput,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
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
  // Force light theme for operator/admin
  const themeObj = useTheme();
  const colors = {
    background: '#F7F4EF',
    surface: '#FFFDFC',
    text: '#24211F',
    textSecondary: '#746B63',
    border: '#E5DDD5',
    primary: '#192A4A',
    accent: '#D87532',
    success: '#4F956E',
    info: '#4D728C',
    warning: '#C68A24',
    error: '#C44C47',
    white: '#FFFFFF',
  };
  const { spacing, fontSizes, fontWeights, borderRadius } = themeObj;
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
        console.error('Employees error:', response.error);
        // Show empty state instead of error
        setEmployees([]);
        setHasMore(false);
        setError(null);
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
      console.error('Unexpected error:', err);
      // Show empty state instead of error
      setEmployees([]);
      setHasMore(false);
      setError(null);
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  if (error && employees.length === 0) {
    return (
      <Screen>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={{ padding: spacing.md }}>
            <ErrorState message={error} onRetry={() => loadEmployees(1, false)} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.headerContainer, { paddingHorizontal: spacing.md, paddingVertical: spacing[3], backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold }]}>
            Employees
          </Text>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { paddingHorizontal: spacing.md, paddingTop: 12, paddingBottom: 8, backgroundColor: colors.background }]}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: colors.border,
            borderRadius: borderRadius.base,
            backgroundColor: colors.white,
            paddingHorizontal: spacing[3],
            minHeight: 48,
          }}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search employees..."
              placeholderTextColor={colors.textSecondary}
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text,
                paddingVertical: 12,
              }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={{ padding: 4 }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters Section */}
        <View style={{ paddingHorizontal: spacing.md, paddingVertical: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          {/* Role Filters */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 }}>
              ROLE
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {ROLE_FILTERS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    backgroundColor: roleFilter === item.value ? colors.primary : 'transparent',
                    borderColor: roleFilter === item.value ? colors.primary : colors.border,
                  }}
                  onPress={() => setRoleFilter(item.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: roleFilter === item.value ? colors.white : colors.text,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status Filters */}
          <View>
            <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 }}>
              STATUS
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {STATUS_FILTERS.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    backgroundColor: statusFilter === item.value ? colors.primary : 'transparent',
                    borderColor: statusFilter === item.value ? colors.primary : colors.border,
                  }}
                  onPress={() => setStatusFilter(item.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: statusFilter === item.value ? colors.white : colors.text,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Employees List */}
        <FlatList
          data={employees}
          renderItem={renderEmployeeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { 
              paddingHorizontal: spacing.md, 
              paddingBottom: spacing.xl,
              flexGrow: 1,
            },
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                icon="people-outline"
                title="No employees found"
                description="Add your first employee to get started"
              />
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, { 
            backgroundColor: colors.primary,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }]}
          onPress={() => router.push('/(operator)/employees/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'flex-start',
  },
  headerTitle: {},
  searchContainer: {},
  filterLabel: {},
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
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
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

