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
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Screen,
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
    info: '#4D728C',
    warning: '#C68A24',
    error: '#C44C47',
    white: '#FFFFFF',
  };
  const { spacing, fontSizes, fontWeights, borderRadius } = themeObj;
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

        <View style={[styles.truckFooter, { borderTopColor: colors.border }]}>
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  if (error && trucks.length === 0) {
    return (
      <Screen>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={{ padding: spacing.md }}>
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.headerContainer, { paddingHorizontal: spacing.md, paddingVertical: spacing[4], backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold }]}>
            Trucks
          </Text>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { paddingHorizontal: spacing.md, backgroundColor: colors.background }]}>
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
              placeholder="Search trucks..."
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
                      statusFilter === item.value ? colors.primary : colors.white,
                    borderColor: statusFilter === item.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setStatusFilter(item.value)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: statusFilter === item.value ? colors.white : colors.text,
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <EmptyState
              icon="car-outline"
              title="No trucks found"
              description="Add your first truck to get started"
            />
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { 
            backgroundColor: colors.primary, 
            borderRadius: 30,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }]}
          onPress={() => router.push('/(operator)/trucks/add')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={28} color={colors.white} />
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
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

