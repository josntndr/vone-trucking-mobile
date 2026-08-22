/**
 * Driver Trips List Screen
 * Shows all trips with filters
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { getMyAssignments } from '../../../src/services/api/driver-porter.service';
import type { Assignment } from '../../../src/types/driver-porter.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatPhilippineDate, formatPhilippineTime } from '../../../src/utils/philippines';
import { getStatusAction } from '../../../src/types/driver-porter.types';

export default function DriverTripsScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [trips, setTrips] = useState<Assignment[]>([]);

  useEffect(() => {
    loadTrips();
  }, [filter]);

  const loadTrips = async () => {
    try {
      const response = await getMyAssignments(filter);
      if (response.data) {
        setTrips(response.data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const renderTripCard = ({ item }: { item: Assignment }) => {
    const trip = item.trip;
    const statusInfo = getStatusAction(trip.status);

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/(driver)/trips/[id]',
            params: { id: trip.id },
          })
        }
        activeOpacity={0.7}
      >
        <Card style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <View>
              <Text style={[styles.tripNumber, { color: colors.text }]}>
                {trip.trip_number}
              </Text>
              <Text style={[styles.tripDate, { color: colors.textSecondary }]}>
                {formatPhilippineDate(trip.delivery_date)} •{' '}
                {formatPhilippineTime(trip.call_time)}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}
            >
              <MaterialCommunityIcons
                name={statusInfo.icon as any}
                size={16}
                color={statusInfo.color}
              />
            </View>
          </View>

          <View style={styles.locations}>
            <View style={styles.location}>
              <MaterialCommunityIcons
                name="warehouse"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.locationText, { color: colors.text }]}>
                {trip.pickup_warehouse}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="arrow-right"
              size={16}
              color={colors.textSecondary}
            />
            <View style={styles.location}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.locationText, { color: colors.text }]}>
                {trip.delivery_destination}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filters */}
      <View style={[styles.filterBar, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'today' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setFilter('today')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'today' ? '#fff' : colors.text },
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'upcoming' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setFilter('upcoming')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'upcoming' ? '#fff' : colors.text },
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'completed' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'completed' ? '#fff' : colors.text },
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="truck-delivery-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No trips found
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  tripCard: {
    marginBottom: 12,
    padding: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 13,
  },
  statusBadge: {
    padding: 8,
    borderRadius: 8,
  },
  locations: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});

