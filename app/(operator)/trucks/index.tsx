/**
 * Trucks List Screen - Redesigned with Design System
 * Phase 5: Modern premium design with DESIGN_SYSTEM integration
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
  Animated,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Screen,
  Card,
  LoadingSpinner,
  EmptyState,
  ErrorState,
} from '../../../src/components';
import { DESIGN_SYSTEM, COLORS, SPACING, COMPONENTS } from '../../../src/theme/designSystem';
import { getTrucks } from '../../../src/services/api/truck.service';
import { Truck, TruckStatus } from '../../../src/types/truck.types';
import { formatPlatNumber } from '../../../src/utils/philippines';

const DS = DESIGN_SYSTEM;

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Available', value: TruckStatus.AVAILABLE },
  { label: 'On Trip', value: TruckStatus.ON_TRIP },
  { label: 'Assigned', value: TruckStatus.ASSIGNED },
  { label: 'Maintenance', value: TruckStatus.UNDER_MAINTENANCE },
  { label: 'Inactive', value: TruckStatus.INACTIVE },
];

export default function TrucksListScreen() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TruckStatus | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadTrucks = async (pageNum: number = 1, append: boolean = false) => {
    try {
      const response = await getTrucks(
        {
          search: search || undefined,
          status: statusFilter || undefined,
          is_active: statusFilter === TruckStatus.INACTIVE ? false : true,
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
          setTrucks(prev => [...prev, ...response.data!.data]);
        } else {
          setTrucks(response.data.data);
        }
        setHasMore(response.data.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      setError('Failed to load trucks');
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
    loadTrucks(1, false);
  }, [search, statusFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    loadTrucks(1, false);
  }, [search, statusFilter]);

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadTrucks(page + 1, true);
    }
  };

  const getStatusColor = (status: TruckStatus) => {
    switch (status) {
      case TruckStatus.AVAILABLE:
        return COLORS.success;
      case TruckStatus.ON_TRIP:
        return COLORS.teal;
      case TruckStatus.ASSIGNED:
        return COLORS.navy;
      case TruckStatus.RESERVED:
        return COLORS.warning;
      case TruckStatus.UNDER_MAINTENANCE:
        return COLORS.error;
      case TruckStatus.INACTIVE:
        return COLORS.textSecondary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = (status: TruckStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderTruckItem = ({ item }: { item: Truck }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity 
        onPress={() => router.push(`/(operator)/trucks/${item.id}`)}
        activeOpacity={0.7}
      >
        <Card style={styles.truckCard}>
          {/* Header: Truck Number and Status */}
          <View style={styles.truckHeader}>
            <View style={styles.truckInfo}>
              <Text style={styles.truckNumber}>{item.truck_number}</Text>
              <Text style={styles.plateNumber}>
                {formatPlatNumber(item.license_plate)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          {/* Vehicle Details */}
          <View style={styles.truckDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="car-sport" size={16} color={COLORS.navy} />
              </View>
              <Text style={styles.detailText}>
                {item.make} {item.model} ({item.year})
              </Text>
            </View>

            {item.truck_type && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="cube" size={16} color={COLORS.teal} />
                </View>
                <Text style={styles.detailText}>
                  {item.truck_type} - {item.capacity_kg}kg
                </Text>
              </View>
            )}

            {item.assigned_driver_name && (
              <View style={styles.detailRow}>
                <View style={styles.detailIcon}>
                  <Ionicons name="person" size={16} color={COLORS.orange} />
                </View>
                <Text style={styles.detailText}>
                  {item.assigned_driver_name}
                </Text>
              </View>
            )}
          </View>

          {/* Footer: Odometer and Fuel Efficiency */}
          <View style={styles.truckFooter}>
            <View style={styles.footerMetric}>
              <Ionicons name="speedometer" size={14} color={COLORS.textSecondary} />
              <Text style={styles.footerText}>
                {item.current_odometer?.toLocaleString() || 'N/A'} km
              </Text>
            </View>
            {item.avg_km_per_liter && (
              <View style={styles.footerMetric}>
                <Ionicons name="water" size={14} color={COLORS.textSecondary} />
                <Text style={styles.footerText}>
                  {item.avg_km_per_liter} km/L
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

  if (loading && trucks.length === 0) {
    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Trucks</Text>
            <Text style={styles.headerSubtitle}>Manage your fleet vehicles</Text>
          </View>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  if (error && trucks.length === 0) {
    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Trucks</Text>
            <Text style={styles.headerSubtitle}>Manage your fleet vehicles</Text>
          </View>
          <View style={{ padding: SPACING.md }}>
            <ErrorState 
              message={error} 
              onRetry={() => {
                setError(null);
                setLoading(true);
                loadTrucks(1, false);
              }}
            />
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
          <Text style={styles.headerTitle}>Trucks</Text>
          <Text style={styles.headerSubtitle}>Manage your fleet vehicles</Text>
        </View>

        {/* Search */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search trucks, plate numbers, or drivers"
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

        {/* Status Filter Tabs */}
        <View style={styles.filtersSection}>
          <FlatList
            horizontal
            data={STATUS_FILTERS}
            keyExtractor={item => item.label}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
            renderItem={({ item }) => {
              const isSelected = statusFilter === item.value;
              return (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? COLORS.teal : COLORS.surface,
                      borderColor: isSelected ? COLORS.teal : COLORS.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => setStatusFilter(item.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: isSelected ? COLORS.white : COLORS.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Trucks List */}
        <FlatList
          data={trucks}
          renderItem={renderTruckItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.teal]}
              tintColor={COLORS.teal}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={64} color={COLORS.textTertiary} />
              <Text style={styles.emptyTitle}>No trucks found</Text>
              <Text style={styles.emptyDescription}>
                {search || statusFilter 
                  ? 'Try changing your search or filter.'
                  : 'Add your first truck to get started.'
                }
              </Text>
              {!search && !statusFilter && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/(operator)/trucks/add')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyButtonText}>Add Truck</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(operator)/trucks/add')}
          activeOpacity={0.8}
          accessibilityLabel="Add Truck"
          accessibilityHint="Opens the add truck form"
        >
          <MaterialCommunityIcons name="plus" size={28} color={COLORS.white} />
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
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
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
    backgroundColor: COLORS.surface,
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
  filtersSection: {
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 0,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 15,
    fontWeight: DS.typography.fontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: 32, // Extremely tight spacing for maximum content density
  },
  truckCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: COMPONENTS.card.borderRadius,
  },
  truckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  truckInfo: {
    flex: 1,
  },
  truckNumber: {
    fontSize: 18,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.navy,
    marginBottom: 4,
  },
  plateNumber: {
    fontSize: 14,
    fontWeight: DS.typography.fontWeight.semibold,
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
  truckDetails: {
    marginBottom: SPACING.sm,
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
  truckFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
    bottom: Platform.OS === 'ios' ? 90 : 80,
    right: SPACING.md,
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
