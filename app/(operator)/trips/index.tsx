/**
 * Operator Trips List Screen - Redesigned
 * Manage schedules, assignments, and deliveries
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  Modal,
  Animated,
  Keyboard,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Screen,
  Card,
  LoadingSpinner,
} from '../../../src/components';
import { useTheme } from '../../../src/hooks';
import { getTrips } from '../../../src/services/api/trip.service';
import { Trip, TripStatus, getTripStatusInfo } from '../../../src/types/trip.types';
import { formatPhilippineDate, formatPeso } from '../../../src/utils/philippines';

// Theme colors - Vone Trucking Light Theme
const COLORS = {
  background: '#F0EDE8',
  surface: '#FFFCF8',
  text: '#2C2418',
  textSecondary: '#6B6256',
  textTertiary: '#9B9289',
  border: '#E0D7CC',
  primary: '#1B2A4A',
  teal: '#3A7D8C',
  orange: '#E07B2A',
  success: '#4F7A5E',
  error: '#C74C47',
  warning: '#D89534',
  white: '#FFFFFF',
};

const STATUS_FILTERS = [
  { label: 'All', value: null },
  { label: 'Draft', value: TripStatus.DRAFT },
  { label: 'Scheduled', value: TripStatus.SCHEDULED },
  { 
    label: 'In Progress', 
    value: 'in_progress', 
    statuses: [
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
    ]
  },
  { label: 'Completed', value: TripStatus.COMPLETED },
  { label: 'Cancelled', value: TripStatus.CANCELLED },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Departure Time', value: 'departure' },
  { label: 'Destination', value: 'destination' },
  { label: 'Status', value: 'status' },
];

export default function TripsListScreen() {
  const { spacing, fontSizes, fontWeights, borderRadius } = useTheme();
  
  // State
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripStatus | string | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [filterCount, setFilterCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFAB, setShowFAB] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(0);

  // Pulse animation for "In Progress" filter
  useEffect(() => {
    const hasActiveTrips = trips.some(trip => 
      STATUS_FILTERS.find(f => f.value === 'in_progress')?.statuses?.includes(trip.status)
    );

    if (hasActiveTrips && statusFilter === 'in_progress') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [trips, statusFilter]);

  // FAB animation
  useEffect(() => {
    Animated.spring(fabScale, {
      toValue: showFAB && !keyboardVisible ? 1 : 0,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [showFAB, keyboardVisible]);

  // Keyboard listeners
  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const loadTrips = async (pageNum: number = 1, append: boolean = false) => {
    try {
      let actualFilter: any = { search: search || undefined };
      
      if (statusFilter && statusFilter !== 'in_progress') {
        actualFilter.status = statusFilter as TripStatus;
      }

      const response = await getTrips(actualFilter, pageNum, 20);

      if (response.error) {
        console.error('Trips error:', response.error);
        setTrips([]);
        setHasMore(false);
        setError(null);
        return;
      }

      if (response.data) {
        let filteredData = response.data.data;

        // Apply "in progress" filter manually
        if (statusFilter === 'in_progress') {
          const inProgressStatuses = STATUS_FILTERS.find(f => f.value === 'in_progress')?.statuses || [];
          filteredData = filteredData.filter(trip => inProgressStatuses.includes(trip.status));
        }

        // Apply sorting
        filteredData = sortTrips(filteredData, sortBy);

        if (append) {
          setTrips((prev) => [...prev, ...filteredData]);
        } else {
          setTrips(filteredData);
        }
        setHasMore(response.data.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setTrips([]);
      setHasMore(false);
      setError(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const sortTrips = (data: Trip[], sortOption: string): Trip[] => {
    const sorted = [...data];
    switch (sortOption) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      case 'departure':
        return sorted.sort((a, b) => new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime());
      case 'destination':
        return sorted.sort((a, b) => (a.delivery_destination || '').localeCompare(b.delivery_destination || ''));
      case 'status':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return sorted;
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    loadTrips(1, false);
  }, [search, statusFilter, sortBy]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    loadTrips(1, false);
  }, [search, statusFilter, sortBy]);

  const loadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadTrips(page + 1, true);
    }
  };

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    scrollY.current = currentScrollY;
    // Show FAB after scrolling past 200px
    setShowFAB(currentScrollY > 200);
  };

  const getStatusColor = (status: TripStatus): string => {
    if (status === TripStatus.DRAFT) return '#6B6256';
    if ([TripStatus.SCHEDULED, TripStatus.ASSIGNED].includes(status)) return COLORS.teal;
    if ([TripStatus.LOADING, TripStatus.IN_TRANSIT, TripStatus.ARRIVED, TripStatus.UNLOADING].includes(status)) return COLORS.orange;
    if ([TripStatus.DELIVERED, TripStatus.COMPLETED].includes(status)) return COLORS.success;
    if (status === TripStatus.DELAYED) return COLORS.error;
    if (status === TripStatus.CANCELLED) return '#9B9289';
    return COLORS.primary;
  };

  const getContextualAction = (trip: Trip) => {
    if (trip.status === TripStatus.DRAFT) return { label: 'Continue Setup', icon: 'create-outline' };
    if (!trip.assigned_truck_number || !trip.assigned_driver_name) return { label: 'Assign Team', icon: 'people-outline' };
    if ([TripStatus.DELIVERED, TripStatus.RETURNING].includes(trip.status)) return { label: 'Review', icon: 'checkmark-circle-outline' };
    if ([TripStatus.IN_TRANSIT, TripStatus.LOADING].includes(trip.status)) return { label: 'Track', icon: 'navigate-outline' };
    return null;
  };

  const renderTripItem = ({ item }: { item: Trip }) => {
    const statusInfo = getTripStatusInfo(item.status);
    const statusColor = getStatusColor(item.status);
    const deliveryDate = new Date(item.delivery_date);
    const isToday = deliveryDate.toDateString() === new Date().toDateString();
    const contextualAction = getContextualAction(item);
    
    // Create route presentation
    const pickupLocation = item.pickup_location || 'Pickup';
    const destination = item.delivery_destination || 'Destination';
    const route = `${pickupLocation} → ${destination}`;

    return (
      <TouchableOpacity 
        onPress={() => router.push(`/(operator)/trips/${item.id}`)}
        activeOpacity={0.7}
      >
        <Card style={styles.tripCard}>
          {/* Header: Reference and Status */}
          <View style={styles.tripHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.deliveryRef, { color: COLORS.text }]}>
                {item.delivery_reference}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          {/* Route */}
          <View style={styles.routeRow}>
            <Ionicons name="location" size={18} color={COLORS.orange} />
            <Text style={[styles.routeText, { color: COLORS.text }]} numberOfLines={1}>
              {route}
            </Text>
          </View>

          {/* Date and Time */}
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
              <Text style={[styles.dateTimeText, { color: COLORS.text }]}>
                {formatPhilippineDate(item.delivery_date)}
                {isToday && <Text style={{ color: COLORS.orange, fontWeight: '700' }}> (Today)</Text>}
              </Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
              <Text style={[styles.dateTimeText, { color: COLORS.text }]}>
                {item.call_time}
              </Text>
            </View>
          </View>

          {/* Team Assignments */}
          <View style={styles.teamRow}>
            {item.assigned_truck_number ? (
              <View style={[styles.teamBadge, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '30' }]}>
                <Ionicons name="car-outline" size={14} color={COLORS.primary} />
                <Text style={[styles.teamText, { color: COLORS.primary }]}>
                  {item.assigned_truck_number}
                </Text>
              </View>
            ) : null}
            {item.assigned_driver_name ? (
              <View style={[styles.teamBadge, { backgroundColor: COLORS.teal + '10', borderColor: COLORS.teal + '30' }]}>
                <Ionicons name="person-outline" size={14} color={COLORS.teal} />
                <Text style={[styles.teamText, { color: COLORS.teal }]}>
                  {item.assigned_driver_name}
                </Text>
              </View>
            ) : null}
            {item.assigned_porter_name ? (
              <View style={[styles.teamBadge, { backgroundColor: COLORS.orange + '10', borderColor: COLORS.orange + '30' }]}>
                <Ionicons name="person-outline" size={14} color={COLORS.orange} />
                <Text style={[styles.teamText, { color: COLORS.orange }]}>
                  {item.assigned_porter_name}
                </Text>
              </View>
            ) : null}
            {!item.assigned_truck_number && !item.assigned_driver_name && (
              <Text style={[styles.unassignedText, { color: COLORS.textTertiary }]}>
                No team assigned
              </Text>
            )}
          </View>

          {/* Contextual Action */}
          {contextualAction && (
            <TouchableOpacity 
              style={[styles.actionButton, { borderColor: COLORS.border }]}
              onPress={() => router.push(`/(operator)/trips/${item.id}`)}
              activeOpacity={0.7}
            >
              <Ionicons name={contextualAction.icon as any} size={16} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.primary }]}>
                {contextualAction.label}
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (search || statusFilter) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={COLORS.textTertiary} />
          <Text style={[styles.emptyTitle, { color: COLORS.text }]}>
            No matching trips
          </Text>
          <Text style={[styles.emptyDescription, { color: COLORS.textSecondary }]}>
            Try changing your search or filters.
          </Text>
          <TouchableOpacity
            style={[styles.emptyButtonPrimary, { backgroundColor: COLORS.primary }]}
            onPress={() => {
              setSearch('');
              setStatusFilter(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.emptyButtonPrimaryText, { color: COLORS.white }]}>
              Clear Filters
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        {/* Integrated Trip Illustration */}
        <View style={styles.emptyIllustration}>
          <View style={styles.tripIllustrationContainer}>
            {/* Navy truck/car icon */}
            <Ionicons name="car-outline" size={72} color={COLORS.primary} />
            {/* Orange route path beneath */}
            <View style={styles.routePath}>
              <View style={[styles.routeCircle, { backgroundColor: COLORS.orange }]} />
              <View style={[styles.routeLine, { backgroundColor: COLORS.orange }]} />
              <Ionicons 
                name="location" 
                size={20} 
                color={COLORS.orange} 
                style={styles.routeEndIcon}
              />
            </View>
          </View>
        </View>
        <Text style={[styles.emptyTitle, { color: COLORS.text }]}>
          No trips yet
        </Text>
        <Text style={[styles.emptyDescription, { color: COLORS.textSecondary }]}>
          Create your first trip to begin managing deliveries.
        </Text>
        <TouchableOpacity
          style={[styles.emptyButtonPrimary, { backgroundColor: COLORS.primary }]}
          onPress={() => router.push('/(operator)/trips/add')}
          activeOpacity={0.8}
        >
          <Text style={[styles.emptyButtonPrimaryText, { color: COLORS.white }]}>
            Create Trip
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>
          Trips
        </Text>
        <Text style={[styles.headerSubtitle, { color: COLORS.textSecondary }]}>
          Manage schedules, assignments, and deliveries.
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={[styles.searchSection, { backgroundColor: COLORS.background }]}>
        <View style={[styles.searchContainer, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search trips, locations, trucks, or employees"
            placeholderTextColor={COLORS.textSecondary}
            style={[styles.searchInput, { color: COLORS.text }]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterSortRow}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: COLORS.surface }]}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="funnel-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.filterButtonText, { color: COLORS.primary }]}>
              Filter
            </Text>
            {filterCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: COLORS.orange }]}>
                <Text style={[styles.filterBadgeText, { color: COLORS.white }]}>
                  {filterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: COLORS.surface }]}
            onPress={() => setShowSortModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.sortButtonText, { color: COLORS.primary }]}>
              Sort
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Actions */}
      <View style={[styles.actionsSection, { backgroundColor: COLORS.background }]}>
        <TouchableOpacity
          style={[styles.primaryAction, { backgroundColor: COLORS.primary }]}
          onPress={() => router.push('/(operator)/trips/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
          <Text style={[styles.primaryActionText, { color: COLORS.white }]}>
            Create Trip
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.secondaryAction, { backgroundColor: COLORS.surface }]}
            onPress={() => router.push('/(operator)/trips/dispatch')}
            activeOpacity={0.7}
          >
            <Ionicons name="analytics-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.secondaryActionText, { color: COLORS.primary }]}>
              Dispatch View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryAction, { backgroundColor: COLORS.surface }]}
            onPress={() => router.push('/(operator)/trips/calendar')}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.secondaryActionText, { color: COLORS.primary }]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Filters */}
      <View style={styles.filtersSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScrollContent}
          decelerationRate="fast"
          snapToInterval={undefined}
          snapToAlignment="start"
        >
          {STATUS_FILTERS.map((item) => {
            const isSelected = statusFilter === item.value;
            const isInProgress = item.value === 'in_progress';
            const hasActiveTrips = trips.some(trip => 
              item.statuses?.includes(trip.status)
            );

            return (
              <Animated.View
                key={item.label}
                style={{
                  transform: isInProgress && isSelected && hasActiveTrips ? [{ scale: pulseAnim }] : [],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isSelected ? COLORS.primary : COLORS.surface,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isSelected ? 0.15 : 0.05,
                      shadowRadius: 4,
                      elevation: isSelected ? 3 : 1,
                    },
                  ]}
                  onPress={() => setStatusFilter(item.value)}
                  activeOpacity={0.7}
                >
                  {isInProgress && hasActiveTrips && isSelected && (
                    <View style={[styles.pulseIndicator, { backgroundColor: COLORS.teal }]} />
                  )}
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isSelected ? COLORS.white : COLORS.text },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
        {/* Gradient fade hint */}
        <View style={styles.gradientFade} pointerEvents="none">
          <View style={styles.gradientOverlay} />
        </View>
      </View>
    </View>
  );

  if (loading && trips.length === 0) {
    return (
      <Screen>
        <View style={[styles.container, { backgroundColor: COLORS.background }]}>
          <View style={[styles.header, { backgroundColor: COLORS.surface, borderBottomColor: COLORS.border }]}>
            <Text style={[styles.headerTitle, { color: COLORS.text }]}>Trips</Text>
            <Text style={[styles.headerSubtitle, { color: COLORS.textSecondary }]}>
              Manage schedules, assignments, and deliveries.
            </Text>
          </View>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.container, { backgroundColor: COLORS.background }]}>
        <FlatList
          data={trips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent,
            trips.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button */}
        <Animated.View
          style={[
            styles.fab,
            {
              backgroundColor: COLORS.primary,
              transform: [{ scale: fabScale }],
            },
          ]}
          pointerEvents={showFAB && !keyboardVisible ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.fabTouchable}
            onPress={() => router.push('/(operator)/trips/add')}
            activeOpacity={0.8}
            accessibilityLabel="Create Trip"
            accessibilityHint="Opens the create trip form"
          >
            <Ionicons name="add" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>

        {/* Sort Modal */}
        <Modal
          visible={showSortModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSortModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSortModal(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: COLORS.surface }]}>
              <View style={[styles.modalHeader, { borderBottomColor: COLORS.border }]}>
                <Text style={[styles.modalTitle, { color: COLORS.text }]}>Sort By</Text>
                <TouchableOpacity onPress={() => setShowSortModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.modalOption, { borderBottomColor: COLORS.border }]}
                  onPress={() => {
                    setSortBy(option.value);
                    setShowSortModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalOptionText, { color: COLORS.text }]}>
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  filterSortRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 6,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 6,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    minHeight: 52,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersSection: {
    position: 'relative',
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  filtersScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    paddingRight: 32,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 0,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  filterChipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pulseIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 2,
  },
  gradientFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    justifyContent: 'center',
  },
  gradientOverlay: {
    width: 40,
    height: '100%',
    backgroundColor: COLORS.background,
    opacity: 0.8,
    shadowColor: COLORS.background,
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  tripCard: {
    padding: 16,
    marginTop: 12,
    borderRadius: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deliveryRef: {
    fontSize: 17,
    fontWeight: '700',
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
    fontWeight: '700',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  routeText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
  },
  teamRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  teamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  teamText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unassignedText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
    minHeight: 44,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIllustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  tripIllustrationContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  routePath: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  routeCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeLine: {
    flex: 1,
    height: 3,
    marginHorizontal: 4,
  },
  routeEndIcon: {
    marginLeft: -2,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyButtonPrimary: {
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: 'center',
  },
  emptyButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: Platform.OS === 'ios' ? 90 : 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabTouchable: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  modalOptionText: {
    fontSize: 16,
  },
});
