/**
 * Trucks List Screen
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
import { getTrucks } from '../../../src/services/api/truck.service';
import { Truck, TruckStatus } from '../../../src/types/truck.types';
import { formatPlatNumber } from '../../../src/utils/philippines';

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Available', value: TruckStatus.AVAILABLE },
  { label: 'On Trip', value: TruckStatus.ON_TRIP },
  { label: 'Assigned', value: TruckStatus.ASSIGNED },
  { label: 'Maintenance', value: TruckStatus.UNDER_MAINTENANCE },
  { label: 'Inactive', value: TruckStatus.INACTIVE },
];

export default function TrucksListScreen() {
  const { colors, spacing } = useTheme();
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
        return colors.success;
      case TruckStatus.ON_TRIP:
        return colors.info;
      case TruckStatus.ASSIGNED:
        return colors.primary;
      case TruckStatus.RESERVED:
        return colors.warning;
      case TruckStatus.UNDER_MAINTENANCE:
        return colors.error;
      case TruckStatus.INACTIVE:
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: TruckStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderTruckItem = ({ item }: { item: Truck }) => (
    <TouchableOpacity onPress={() => router.push(`/(operator)/trucks/${item.id}`)}>
      <Card style={styles.truckCard}>
        <View style={styles.truckHeader}>
          <View style={styles.truckInfo}>
            <Text style={[styles.truckNumber, { color: colors.text }]}>{item.truck_number}</Text>
            <Text style={[styles.plateNumber, { color: colors.textSecondary }]}>
              {formatPlatNumber(item.license_plate)}
            </Text>
          </View>
          <StatusChip
            label={getStatusLabel(item.status)}
            color={getStatusColor(item.status)}
          />
        </View>

        <View style={styles.truckDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="car-sport" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.text }]}>
              {item.make} {item.model} ({item.year})
            </Text>
          </View>

          {item.truck_type && (
            <View style={styles.detailRow}>
              <Ionicons name="cube" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {item.truck_type} - {item.capacity_kg}kg
              </Text>
            </View>
          )}

          {item.assigned_driver_name && (
            <View style={styles.detailRow}>
              <Ionicons name="person" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {item.assigned_driver_name}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.truckFooter}>
          <View style={styles.fuelInfo}>
            <Ionicons name="speedometer" size={14} color={colors.textSecondary} />
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              {item.current_odometer?.toLocaleString() || 'N/A'} km
            </Text>
          </View>
          {item.avg_km_per_liter && (
            <View style={styles.fuelInfo}>
              <Ionicons name="water" size={14} color={colors.textSecondary} />
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                {item.avg_km_per_liter} km/L
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (loading && trucks.length === 0) {
    return (
      <Screen>
        <LoadingSpinner />
      </Screen>
    );
  }

  if (error && trucks.length === 0) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={() => loadTrucks(1, false)} />
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
            placeholder="Search trucks..."
          />
        </View>

        {/* Status Filters */}
        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            data={STATUS_FILTERS}
            keyExtractor={item => item.label}
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

        {/* Trucks List */}
        <FlatList
          data={trucks}
          renderItem={renderTruckItem}
          keyExtractor={item => item.id}
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
              icon="car-outline"
              title="No trucks found"
              message="Add your first truck to get started"
            />
          }
        />

        {/* Add Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(operator)/trucks/add')}
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
  truckCard: {
    padding: 16,
    marginBottom: 12,
  },
  truckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  truckInfo: {
    flex: 1,
  },
  truckNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  plateNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  truckDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  truckFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  fuelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
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

