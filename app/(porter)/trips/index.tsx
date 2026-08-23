/**
 * Porter Trips List Screen
 * Shows today's, upcoming, and completed trips
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { getMyAssignments } from '../../../src/services/api/driver-porter.service';
import type { Assignment } from '../../../src/types/driver-porter.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatPhilippineDate, formatPhilippineTime } from '../../../src/utils/philippines';

type FilterType = 'today' | 'upcoming' | 'completed';

export default function PorterTripsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('today');
  const [trips, setTrips] = useState<Assignment[]>([]);

  useEffect(() => {
    loadTrips();
  }, [filter]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const response = await getMyAssignments(filter);
      if (response.data) {
        setTrips(response.data);
      } else if (response.error) {
        Alert.alert('Error', response.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTrip = (assignment: Assignment) => {
    router.push({
      pathname: '/(porter)/trips/[id]',
      params: { id: assignment.trip_id },
    });
  };

  const renderTripCard = (assignment: Assignment) => {
    const trip = assignment.trip;
    const isPending = assignment.assignment_status === 'pending';

    return (
      <TouchableOpacity
        key={assignment.id}
        onPress={() => handleViewTrip(assignment)}
        activeOpacity={0.7}
      >
        <Card style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tripNumber, { color: colors.text }]}>
                {trip.trip_number}
              </Text>
              <Text style={[styles.tripDate, { color: colors.textSecondary }]}>
                {formatPhilippineDate(trip.delivery_date)} • {formatPhilippineTime(trip.call_time)}
              </Text>
            </View>
            {isPending && (
              <View style={[styles.badge, { backgroundColor: colors.warningLight }]}>
                <Text style={[styles.badgeText, { color: colors.warning }]}>
                  Needs Ack
                </Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="warehouse"
              size={16}
              color={colors.textSecondary}
            />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              {trip.pickup_warehouse}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.locationText, { color: colors.text }]}>
              {trip.delivery_destination}
            </Text>
          </View>

          <View style={styles.tripFooter}>
            {assignment.truck && (
              <View style={styles.footerItem}>
                <MaterialCommunityIcons
                  name="truck"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                  {assignment.truck.truck_number}
                </Text>
              </View>
            )}
            {assignment.driver && (
              <View style={styles.footerItem}>
                <MaterialCommunityIcons
                  name="account"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                  {assignment.driver.first_name}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter Tabs */}
      <View style={[styles.filterTabs, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'today' && [styles.filterTabActive, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setFilter('today')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'today' ? colors.primary : colors.textSecondary },
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'upcoming' && [styles.filterTabActive, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setFilter('upcoming')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'upcoming' ? colors.primary : colors.textSecondary },
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === 'completed' && [styles.filterTabActive, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setFilter('completed')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: filter === 'completed' ? colors.primary : colors.textSecondary },
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="dolly"
            size={64}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Trips Found
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {filter === 'today' && 'You don\'t have any trips scheduled for today.'}
            {filter === 'upcoming' && 'You don\'t have any upcoming trips.'}
            {filter === 'completed' && 'You haven\'t completed any trips yet.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {trips.map(renderTripCard)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomWidth: 2,
  },
  filterTabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  tripFooter: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});

