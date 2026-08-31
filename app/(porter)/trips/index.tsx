/**
 * Porter / Helper Trips List Screen - Executive Dark Theme
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
import { Card } from '../../../src/components/common/Card';
import { getMyAssignments } from '../../../src/services/api/driver-porter.service';
import type { Assignment } from '../../../src/types/driver-porter.types';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { formatPhilippineDate, formatPhilippineTime } from '../../../src/utils/philippines';

const COLORS = {
  background: '#0B1120',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  primary: '#0EA5E9',
  orange: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  white: '#FFFFFF',
};

type FilterType = 'today' | 'upcoming' | 'completed';

export default function PorterTripsScreen() {
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
      Alert.alert('Error', 'Failed to load assignments');
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
        activeOpacity={0.75}
      >
        <Card style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tripNumber}>{trip.trip_number}</Text>
              <Text style={styles.tripDate}>
                {formatPhilippineDate(trip.delivery_date)} • {formatPhilippineTime(trip.call_time)}
              </Text>
            </View>
            {isPending && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Needs Ack</Text>
              </View>
            )}
          </View>

          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="warehouse" size={16} color={COLORS.textSecondary} />
            <Text style={styles.locationTextSecondary}>{trip.pickup_warehouse}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.primary} />
            <Text style={styles.locationTextPrimary}>{trip.delivery_destination}</Text>
          </View>

          <View style={styles.tripFooter}>
            {assignment.truck && (
              <View style={styles.footerItem}>
                <MaterialCommunityIcons name="truck" size={14} color={COLORS.orange} />
                <Text style={styles.footerText}>{assignment.truck.truck_number}</Text>
              </View>
            )}
            {assignment.driver && (
              <View style={styles.footerItem}>
                <MaterialCommunityIcons name="steering" size={14} color={COLORS.primary} />
                <Text style={styles.footerText}>{assignment.driver.first_name}</Text>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['today', 'upcoming', 'completed'] as FilterType[]).map((tabKey) => {
          const isActive = filter === tabKey;
          return (
            <TouchableOpacity
              key={tabKey}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setFilter(tabKey)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Trips Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="dolly" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Assignments Found</Text>
          <Text style={styles.emptySubtitle}>
            You have no {filter} assignments at this time.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {trips.map((assignment) => renderTripCard(assignment))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tripCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  tripDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.orange,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  locationTextSecondary: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  locationTextPrimary: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  tripFooter: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
