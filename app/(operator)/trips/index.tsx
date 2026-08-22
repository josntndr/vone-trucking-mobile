/**
 * Trips List Screen
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
import { getTrips } from '../../../src/services/api/trip.service';
import { Trip, TripStatus, getTripStatusInfo } from '../../../src/types/trip.types';
import { formatPhilippineDate, formatPeso } from '../../../src/utils/philippines';

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Draft', value: TripStatus.DRAFT },
  { label: 'Scheduled', value: TripStatus.SCHEDULED },
  { label: 'In Progress', value: 'in_progress', statuses: [
    TripStatus.ASSIGNED,
    TripStatus.ACKNOWLEDGED,
    TripStatus.AT_WAREHOUSE,
    TripStatus.LOADING,
    TripStatus.DISPATCHED,
    TripStatus.IN_TRANSIT,
    TripStatus.ARRIVED,
    TripStatus.UNLOADING,
    TripStatus.DELIVERED,
    TripStatus.RETURNING,
  ]},
  { label: 'Completed', value: TripStatus.COMPLETED },
  { label: 'Delayed', value: TripStatus.DELAYED },
  { label: 'Cancelled', value: TripStatus.CANCELLED },
];

export default function TripsListScreen() {
  const { colors, spacing } = useTheme();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadTrips = async (pageNum: number = 1, append: boolean = false) => {
    try {
      // Handle composite filter for "in progress"
      let actualFilter: any = { search: search || undefined };
      
      if (statusFilter && statusFilter !== 'in_progress') {
        actualFilter.status = statusFilter as TripStatus;
      }

      const response = await getTrips(actualFilter, pageNum, 20);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        let filteredData = response.data.data;

        // Apply "in progress" filter manually
        if (statusFilter === 'in_progress') {
          const inProgressStatuses = STATUS_FILTERS.find(f => f.value === 'in_progress')?.statuses || [];
          filteredData = filteredData.filter(trip => inProgressStatuses.includes(trip.status));
        }

        if (append) {
          setTrips((prev) => [...prev, ...filteredData]);
        } else {
          setTrips(filteredData);
        }
        setHasMore(response.data.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      setError('Failed to load trips');
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
    loadTrips(1, false);
  }, [search, statusFilter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    loadTrips(1, false);
  }, [search, statusFilter]);

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadTrips(page + 1, true);
    }
  };

  const renderTripItem = ({ item }: { item: Trip }) => {
    const statusInfo = getTripStatusInfo(item.status);
    const deliveryDate = new Date(item.delivery_date);
    const isToday = deliveryDate.toDateString() === new Date().toDateString();
    const isPast = deliveryDate < new Date() && !isToday;

    return (
      <TouchableOpacity onPress={() => router.push(`/(operator)/trips/${item.id}`)}>
        <Card style={styles.tripCard}>
          {/* Header */}
          <View style={styles.tripHeader}>
            <View style={styles.tripInfo}>
              <Text style={[styles.tripNumber, { color: colors.text }]}>
                {item.trip_number}
              </Text>
              <Text style={[styles.deliveryRef, { color: colors.textSecondary }]}>
                {item.delivery_reference}
              </Text>
            </View>
            <StatusChip
              label={statusInfo.label}
              color={statusInfo.color}
              icon={statusInfo.icon}
            />
          </View>

          {/* Date and Time */}
          <View style={[styles.dateTimeRow, isToday && styles.todayHighlight]}>
            <View style={styles.dateTimeItem}>
              <Ionicons
                name="calendar"
                size={16}
                color={isToday ? colors.accent : isPast ? colors.error : colors.textSecondary}
              />
              <Text
                style={[
                  styles.dateTimeText,
                  {
                    color: isToday ? colors.accent : isPast ? colors.error : colors.text,
                    fontWeight: isToday ? '700' : '500',
                  },
                ]}
              >
                {formatPhilippineDate(item.delivery_date)}
                {isToday && ' (Today)'}
              </Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Ionicons name="time" size={16} color={colors.textSecondary} />
              <Text style={[styles.dateTimeText, { color: colors.text }]}>
                {item.call_time}
              </Text>
            </View>
          </View>

          {/* Destination */}
          <View style={styles.detailRow}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                Destination
              </Text>
              <Text style={[styles.detailText, { color: colors.text }]} numberOfLines={1}>
                {item.delivery_destination}
              </Text>
            </View>
          </View>

          {/* Cargo */}
          <View style={styles.detailRow}>
            <Ionicons name="cube" size={16} color={colors.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Cargo</Text>
              <Text style={[styles.detailText, { color: colors.text }]} numberOfLines={1}>
                {item.cargo_description}
              </Text>
            </View>
          </View>

          {/* Assignments */}
          <View style={styles.assignmentsRow}>
            {item.assigned_truck_number && (
              <View style={[styles.assignmentBadge, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="car" size={14} color={colors.primary} />
                <Text style={[styles.assignmentText, { color: colors.primary }]}>
                  {item.assigned_truck_number}
                </Text>
              </View>
            )}
            {item.assigned_driver_name && (
              <View style={[styles.assignmentBadge, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons name="person" size={14} color={colors.accent} />
                <Text style={[styles.assignmentText, { color: colors.accent }]}>
                  {item.assigned_driver_name}
                </Text>
              </View>
            )}
            {!item.assigned_truck_number && !item.assigned_driver_name && (
              <Text style={[styles.unassignedText, { color: colors.textSecondary }]}>
                Not assigned
              </Text>
            )}
          </View>

          {/* Footer - Income */}
          {item.expected_income && (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Text style={[styles.incomeLabel, { color: colors.textSecondary }]}>
                Expected Income:
              </Text>
              <Text style={[styles.incomeValue, { color: colors.success }]}>
                {formatPeso(item.expected_income)}
              </Text>
            </View>
          )}
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

  const renderHeader = () => (
    <View>
      {/* Search */}
      <View style={[styles.searchContainer, { paddingHorizontal: spacing.md }]}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search trips..."
        />
      </View>

      {/* Quick Actions */}
      <View style={[styles.quickActions, { paddingHorizontal: spacing.md }]}>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(operator)/trips/add')}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.surface} />
          <Text style={[styles.quickActionText, { color: colors.surface }]}>
            Create Trip
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: colors.info }]}
          onPress={() => router.push('/(operator)/trips/dispatch')}
        >
          <Ionicons name="analytics-outline" size={20} color={colors.surface} />
          <Text style={[styles.quickActionText, { color: colors.surface }]}>
            Dispatch View
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: colors.accent }]}
          onPress={() => router.push('/(operator)/trips/calendar')}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.surface} />
          <Text style={[styles.quickActionText, { color: colors.surface }]}>Calendar</Text>
        </TouchableOpacity>
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
    </View>
  );

  if (loading && trips.length === 0) {
    return (
      <Screen>
        <LoadingSpinner />
      </Screen>
    );
  }

  if (error && trips.length === 0) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={() => loadTrips(1, false)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
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
            icon="navigate-outline"
            title="No trips found"
            message="Create your first trip to get started"
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
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
  tripCard: {
    padding: 16,
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  deliveryRef: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  todayHighlight: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FB923C',
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
  },
  assignmentsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  assignmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  assignmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unassignedText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  incomeLabel: {
    fontSize: 13,
  },
  incomeValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

