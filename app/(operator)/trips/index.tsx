/**
 * Operator Trips List Screen - Redesigned with Design System
 * Phase 4: Modern premium design with DESIGN_SYSTEM integration
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
import { DESIGN_SYSTEM, COLORS, SPACING, COMPONENTS } from '../../../src/theme/designSystem';
import { getTrips } from '../../../src/services/api/trip.service';
import { Trip, TripStatus, getTripStatusInfo } from '../../../src/types/trip.types';
import { formatPhilippineDate, formatPeso } from '../../../src/utils/philippines';
import { formatPlantRoute } from '../../../src/config/plant.config';

const DS = DESIGN_SYSTEM;

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
        console.error('Trips fetch error:', response.error);
        
        // Determine error message based on error type
        let errorMessage = 'Couldn\'t load trips. Check your connection and try again.';
        
        if (response.error.includes('Database not configured') || response.error.includes('Supabase')) {
          errorMessage = 'Database connection not configured. Please contact your administrator.';
        } else if (response.error.includes('session') || response.error.includes('authentication') || response.error.includes('authenticated')) {
          errorMessage = 'Your session has expired. Please sign in again.';
        } else if (response.error.includes('permission') || response.error.includes('not authorized')) {
          errorMessage = 'You don\'t have permission to view these trips.';
        } else if (response.error.includes('network') || response.error.includes('timeout')) {
          errorMessage = 'Network error. Check your connection and try again.';
        }
        
        // If this is the first page, show error state
        if (!append) {
          setError(errorMessage);
          setTrips([]);
          setHasMore(false);
        }
        // If loading more pages, keep existing trips and stop pagination
        else {
          setHasMore(false);
        }
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
        setError(null); // Clear error on success
      }
    } catch (err) {
      console.error('Unexpected trips error:', err);
      
      // Determine error message
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err instanceof TypeError && err.message.includes('null')) {
        errorMessage = 'Database connection not configured. Please contact your administrator.';
      } else if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Check your connection and try again.';
        }
      }
      
      // If this is the first page, show error state
      if (!append) {
        setError(errorMessage);
        setTrips([]);
        setHasMore(false);
      }
      // If loading more pages, keep existing trips and stop pagination
      else {
        setHasMore(false);
      }
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
    if (status === TripStatus.DRAFT) return COLORS.textSecondary;
    if ([TripStatus.SCHEDULED, TripStatus.ASSIGNED].includes(status)) return COLORS.teal;
    if ([TripStatus.LOADING, TripStatus.IN_TRANSIT, TripStatus.ARRIVED, TripStatus.UNLOADING].includes(status)) return COLORS.orange;
    if ([TripStatus.DELIVERED, TripStatus.COMPLETED].includes(status)) return COLORS.success;
    if (status === TripStatus.DELAYED) return COLORS.error;
    if (status === TripStatus.CANCELLED) return COLORS.textTertiary;
    return COLORS.navy;
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
    
    // Create route presentation using Imus Plant → Destination
    const route = formatPlantRoute(item.delivery_destination || 'Destination');

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
            <Text style={styles.routeText} numberOfLines={1}>
              {route}
            </Text>
          </View>

          {/* Date and Time */}
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.dateTimeText}>
                {formatPhilippineDate(item.delivery_date)}
                {isToday && <Text style={{ color: COLORS.orange, fontWeight: '700' }}> (Today)</Text>}
              </Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.dateTimeText}>
                {item.call_time}
              </Text>
            </View>
          </View>

          {/* Team Assignments */}
          <View style={styles.teamRow}>
            {item.assigned_truck_number ? (
              <View style={[styles.teamBadge, { backgroundColor: COLORS.navy + '10', borderColor: COLORS.navy + '30' }]}>
                <Ionicons name="car-outline" size={14} color={COLORS.navy} />
                <Text style={[styles.teamText, { color: COLORS.navy }]}>
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
              <Text style={styles.unassignedText}>
                No team assigned
              </Text>
            )}
          </View>

          {/* Contextual Action */}
          {contextualAction && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push(`/(operator)/trips/${item.id}`)}
              activeOpacity={0.7}
            >
              <Ionicons name={contextualAction.icon as any} size={16} color={COLORS.navy} />
              <Text style={styles.actionText}>
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
        <ActivityIndicator size="small" color={COLORS.navy} />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (search || statusFilter) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={COLORS.textTertiary} />
          <Text style={styles.emptyTitle}>
            No matching trips
          </Text>
          <Text style={styles.emptyDescription}>
            Try changing your search or filters.
          </Text>
          <TouchableOpacity
            style={styles.emptyButtonPrimary}
            onPress={() => {
              setSearch('');
              setStatusFilter(null);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyButtonPrimaryText}>
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
            <Ionicons name="car-outline" size={72} color={COLORS.navy} />
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
        <Text style={styles.emptyTitle}>
          No trips yet
        </Text>
        <Text style={styles.emptyDescription}>
          Create your first trip to begin managing deliveries.
        </Text>
        <TouchableOpacity
          style={styles.emptyButtonPrimary}
          onPress={() => router.push('/(operator)/trips/add')}
          activeOpacity={0.8}
        >
          <Text style={styles.emptyButtonPrimaryText}>
            Create Trip
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Trips
        </Text>
        <Text style={styles.headerSubtitle}>
          Manage schedules, assignments, and deliveries.
        </Text>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search trips, destinations, trucks, or employees"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterSortRow}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="funnel-outline" size={18} color={COLORS.navy} />
            <Text style={styles.filterButtonText}>
              Filter
            </Text>
            {filterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {filterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => setShowSortModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical-outline" size={18} color={COLORS.navy} />
            <Text style={styles.sortButtonText}>
              Sort
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={() => router.push('/(operator)/trips/add')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
          <Text style={styles.primaryActionText}>
            Create Trip
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => router.push('/(operator)/trips/dispatch')}
            activeOpacity={0.7}
          >
            <Ionicons name="analytics-outline" size={18} color={COLORS.navy} />
            <Text style={styles.secondaryActionText}>
              Dispatch View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => router.push('/(operator)/trips/calendar')}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color={COLORS.navy} />
            <Text style={styles.secondaryActionText}>
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
                      backgroundColor: isSelected ? COLORS.navy : COLORS.white,
                      ...DS.shadows.base,
                      shadowOpacity: isSelected ? 0.15 : 0.05,
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
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Trips</Text>
            <Text style={styles.headerSubtitle}>
              Manage schedules, assignments, and deliveries.
            </Text>
          </View>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  // Error state - show retry option
  if (error && trips.length === 0) {
    return (
      <Screen>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Trips</Text>
            <Text style={styles.headerSubtitle}>
              Manage schedules, assignments, and deliveries.
            </Text>
          </View>
          <View style={styles.errorState}>
            <View style={styles.errorIcon}>
              <Ionicons name="cloud-offline-outline" size={64} color={COLORS.textMuted} />
            </View>
            <Text style={styles.errorTitle}>
              Couldn't load trips
            </Text>
            <Text style={styles.errorMessage}>
              {error}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setLoading(true);
                loadTrips(1, false);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={20} color={COLORS.white} />
              <Text style={styles.retryButtonText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
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
              colors={[COLORS.navy]}
              tintColor={COLORS.navy}
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
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sort By</Text>
                <TouchableOpacity onPress={() => setShowSortModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.modalOption}
                  onPress={() => {
                    setSortBy(option.value);
                    setShowSortModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalOptionText}>
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <Ionicons name="checkmark" size={20} color={COLORS.navy} />
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
    backgroundColor: COLORS.background,
  },
  header: {
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
    paddingHorizontal: SPACING.md,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.md,
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
  filterSortRow: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    gap: 6,
    minHeight: 48,
    ...DS.shadows.base,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.navy,
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.white,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    gap: 6,
    minHeight: 48,
    ...DS.shadows.base,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.navy,
  },
  actionsSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    paddingVertical: 14,
    gap: SPACING.xs,
    minHeight: 52,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.white,
  },
  secondaryActions: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    gap: 6,
    minHeight: 48,
    ...DS.shadows.base,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.navy,
  },
  filtersSection: {
    position: 'relative',
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  filtersScrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
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
    fontWeight: DS.typography.fontWeight.semibold,
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
    paddingHorizontal: SPACING.md,
    paddingBottom: 70, // Reduced spacing for tighter layout with FAB
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  tripCard: {
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: COMPONENTS.card.borderRadius,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  deliveryRef: {
    fontSize: 17,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.navy,
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
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  routeText: {
    fontSize: 15,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.text,
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    color: COLORS.text,
  },
  teamRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
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
    fontWeight: DS.typography.fontWeight.semibold,
  },
  unassignedText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: COLORS.textTertiary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
    minHeight: 44,
  },
  actionText: {
    fontSize: 14,
    fontWeight: DS.typography.fontWeight.semibold,
    color: COLORS.navy,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.navy,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    minHeight: 52,
    minWidth: 160,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.white,
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
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.text,
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
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: SPACING.sm,
    minHeight: 48,
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: DS.typography.fontWeight.semibold,
  },
  emptyButtonPrimary: {
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: 'center',
  },
  emptyButtonPrimaryText: {
    fontSize: 16,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.white,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    bottom: Platform.OS === 'ios' ? 90 : 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.navy,
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
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.text,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 56,
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.text,
  },
});
