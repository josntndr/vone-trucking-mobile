/**
 * Employees List Screen - Redesigned with Design System
 * Phase 6: Modern premium design with DESIGN_SYSTEM integration
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
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  Card,
  LoadingSpinner,
  ErrorState,
} from '../../../src/components';
import { DESIGN_SYSTEM, COLORS, SPACING, COMPONENTS } from '../../../src/theme/designSystem';
import { getEmployees } from '../../../src/services/api/employee.service';
import { Employee, EmploymentStatus } from '../../../src/types/employee.types';
import { UserRole } from '../../../src/types';
import { formatPhilippinePhone, isExpiringSoon, isExpired } from '../../../src/utils/philippines';

const DS = DESIGN_SYSTEM;

const ROLE_FILTERS = [
  { label: 'All', value: null },
  { label: 'Drivers', value: UserRole.DRIVER },
  { label: 'Porters', value: UserRole.PORTER },
];

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Active', value: EmploymentStatus.ACTIVE },
  { label: 'On Leave', value: EmploymentStatus.ON_LEAVE },
  { label: 'Suspended', value: EmploymentStatus.SUSPENDED },
  { label: 'Inactive', value: EmploymentStatus.INACTIVE },
];

export default function EmployeesListScreen() {
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
        return COLORS.success;
      case EmploymentStatus.ON_LEAVE:
        return COLORS.warning;
      case EmploymentStatus.SUSPENDED:
        return COLORS.error;
      case EmploymentStatus.INACTIVE:
      case EmploymentStatus.ARCHIVED:
        return COLORS.textSecondary;
      default:
        return COLORS.textSecondary;
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
        return COLORS.navy;
      case UserRole.PORTER:
        return COLORS.orange;
      case UserRole.OPERATOR:
        return COLORS.teal;
      default:
        return COLORS.textSecondary;
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
    const statusColor = getStatusColor(item.employment_status);

    return (
      <TouchableOpacity 
        onPress={() => router.push(`/(operator)/employees/${item.id}`)}
        activeOpacity={0.7}
      >
        <Card style={styles.employeeCard}>
          {/* Header: Avatar + Name + Status */}
          <View style={styles.employeeHeader}>
            <View style={styles.employeeInfo}>
              <View style={styles.nameRow}>
                <View style={[styles.roleIconContainer, { backgroundColor: getRoleColor(item.role) + '15' }]}>
                  <Ionicons name={getRoleIcon(item.role)} size={20} color={getRoleColor(item.role)} />
                </View>
                <View style={styles.nameContent}>
                  <Text style={styles.employeeName}>{item.full_name}</Text>
                  <Text style={styles.employeeId}>{item.employee_id}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(item.employment_status)}
              </Text>
            </View>
          </View>

          {/* Employee Details */}
          <View style={styles.employeeDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="briefcase" size={16} color={COLORS.navy} />
              </View>
              <Text style={styles.detailText}>
                {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
              </Text>
            </View>

            {item.phone && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="call" size={16} color={COLORS.teal} />
                </View>
                <Text style={styles.detailText}>
                  {formatPhilippinePhone(item.phone)}
                </Text>
              </View>
            )}

            {item.role === UserRole.DRIVER && item.license_number && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="card" size={16} color={COLORS.orange} />
                </View>
                <Text style={styles.detailText}>
                  License: {item.license_number}
                </Text>
                {licenseStatus && licenseStatus !== 'valid' && (
                  <View
                    style={[
                      styles.warningBadge,
                      {
                        backgroundColor:
                          licenseStatus === 'expired' ? COLORS.error + '15' : COLORS.warning + '15',
                      },
                    ]}
                  >
                    <Ionicons
                      name="warning"
                      size={12}
                      color={licenseStatus === 'expired' ? COLORS.error : COLORS.warning}
                    />
                  </View>
                )}
              </View>
            )}

            {item.assigned_truck_number && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="car" size={16} color={COLORS.success} />
                </View>
                <Text style={styles.detailText}>
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
        <ActivityIndicator size="small" color={COLORS.navy} />
      </View>
    );
  };

  if (loading && employees.length === 0) {
    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Employees</Text>
            <Text style={styles.headerSubtitle}>Manage your team members</Text>
          </View>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  if (error && employees.length === 0) {
    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Employees</Text>
            <Text style={styles.headerSubtitle}>Manage your team members</Text>
          </View>
          <View style={{ padding: SPACING.md }}>
            <ErrorState message={error} onRetry={() => loadEmployees(1, false)} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Employees</Text>
          <Text style={styles.headerSubtitle}>Manage your team members</Text>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search employees, IDs, or phone numbers"
              placeholderTextColor={COLORS.textSecondary}
              style={styles.searchInput}
            />
            {search.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearch('')} 
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Dual Filter Section */}
        <View style={styles.filtersWrapper}>
          {/* Role Filters */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>ROLE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {ROLE_FILTERS.map((item) => {
                const isSelected = roleFilter === item.value;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected ? COLORS.navy : 'transparent',
                        ...COMPONENTS.card.shadow,
                        shadowOpacity: isSelected ? 0.15 : 0,
                        elevation: isSelected ? 2 : 0,
                      },
                    ]}
                    onPress={() => setRoleFilter(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: isSelected ? COLORS.white : COLORS.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Status Filters */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>STATUS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {STATUS_FILTERS.map((item) => {
                const isSelected = statusFilter === item.value;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: isSelected ? COLORS.navy : 'transparent',
                        ...COMPONENTS.card.shadow,
                        shadowOpacity: isSelected ? 0.15 : 0,
                        elevation: isSelected ? 2 : 0,
                      },
                    ]}
                    onPress={() => setStatusFilter(item.value)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: isSelected ? COLORS.white : COLORS.text },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Employees List */}
        <FlatList
          data={employees}
          renderItem={renderEmployeeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[COLORS.navy]}
              tintColor={COLORS.navy}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={COLORS.textTertiary} />
              <Text style={styles.emptyTitle}>No employees found</Text>
              <Text style={styles.emptyDescription}>
                {search || roleFilter || statusFilter
                  ? 'Try changing your search or filters.'
                  : 'Add your first employee to get started.'
                }
              </Text>
              {!search && !roleFilter && !statusFilter && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/(operator)/employees/add')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyButtonText}>Add Employee</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(operator)/employees/add')}
          activeOpacity={0.8}
          accessibilityLabel="Add Employee"
          accessibilityHint="Opens the add employee form"
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: DS.typography.fontSize['2xl'],
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.navy,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    minHeight: 48,
    gap: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: SPACING.sm,
  },
  filtersWrapper: {
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterGroup: {
    marginBottom: SPACING.sm,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: DS.typography.fontWeight.medium,
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.md,
    textTransform: 'uppercase',
  },
  filterScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 0,
    minHeight: 40,
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: DS.typography.fontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: 100,
    flexGrow: 1,
  },
  employeeCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: COMPONENTS.card.borderRadius,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
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
    marginRight: SPACING.sm,
  },
  nameContent: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.navy,
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 14,
    fontWeight: DS.typography.fontWeight.medium,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: DS.typography.fontWeight.bold,
  },
  employeeDetails: {
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailIcon: {
    width: 24,
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  warningBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.white,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: Platform.OS === 'ios' ? 90 : 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
