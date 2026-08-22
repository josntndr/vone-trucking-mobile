/**
 * Dispatch Dashboard
 * Shows active trips organized by status for real-time monitoring
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, LoadingSpinner, StatusChip } from '../../../src/components';
import { useTheme } from '../../../src/hooks';
import { getTrips, getTripStats } from '../../../src/services/api/trip.service';
import { Trip, TripStatus, getTripStatusInfo, TripStats } from '../../../src/types/trip.types';

interface StatusGroup {
  status: TripStatus;
  label: string;
  color: string;
  icon: string;
  trips: Trip[];
}

export default function DispatchDashboardScreen() {
  const { colors, spacing } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<TripStats | null>(null);
  const [statusGroups, setStatusGroups] = useState<StatusGroup[]>([]);

  const activeStatuses: TripStatus[] = [
    TripStatus.SCHEDULED,
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
    TripStatus.DELAYED,
  ];

  const loadDispatchData = async () => {
    try {
      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch stats
      const statsResponse = await getTripStats(today, today);
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Fetch active trips
      const tripsResponse = await getTrips({}, 1, 100);

      if (tripsResponse.data) {
        const activeTrips = tripsResponse.data.data.filter((trip) =>
          activeStatuses.includes(trip.status)
        );

        // Group by status
        const groups: StatusGroup[] = activeStatuses.map((status) => {
          const statusInfo = getTripStatusInfo(status);
          const trips = activeTrips.filter((trip) => trip.status === status);

          return {
            status,
            label: statusInfo.label,
            color: statusInfo.color,
            icon: statusInfo.icon,
            trips: trips.sort((a, b) => a.call_time.localeCompare(b.call_time)),
          };
        }).filter(group => group.trips.length > 0); // Only show groups with trips

        setStatusGroups(groups);
      }
    } catch (error) {
      console.error('Failed to load dispatch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDispatchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDispatchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDispatchData();
  };

  if (loading) {
    return (
      <Screen>
        <LoadingSpinner />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Overview */}
        {stats && (
          <View style={[styles.statsContainer, { paddingHorizontal: spacing.md }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Overview</Text>
            <View style={styles.statsGrid}>
              <Card style={[styles.statCard, { backgroundColor: colors.info + '15' }]}>
                <Text style={[styles.statValue, { color: colors.info }]}>
                  {stats.in_progress_trips}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  In Progress
                </Text>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: colors.success + '15' }]}>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {stats.completed_trips}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Completed
                </Text>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: colors.warning + '15' }]}>
                <Text style={[styles.statValue, { color: colors.warning }]}>
                  {stats.scheduled_trips}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Scheduled
                </Text>
              </Card>

              <Card style={[styles.statCard, { backgroundColor: colors.error + '15' }]}>
                <Text style={[styles.statValue, { color: colors.error }]}>
                  {stats.delayed_trips}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Delayed</Text>
              </Card>
            </View>
          </View>
        )}

        {/* Status Groups */}
        <View style={{ paddingHorizontal: spacing.md }}>
          {statusGroups.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>All Clear!</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No active trips at the moment
              </Text>
            </Card>
          ) : (
            statusGroups.map((group) => (
              <View key={group.status} style={styles.statusGroup}>
                <View
                  style={[
                    styles.statusHeader,
                    { backgroundColor: group.color + '15', borderLeftColor: group.color },
                  ]}
                >
                  <View style={styles.statusHeaderLeft}>
                    <Ionicons name={group.icon as any} size={20} color={group.color} />
                    <Text style={[styles.statusLabel, { color: group.color }]}>
                      {group.label}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: group.color }]}>
                    <Text style={[styles.statusCount, { color: '#FFFFFF' }]}>
                      {group.trips.length}
                    </Text>
                  </View>
                </View>

                {group.trips.map((trip) => (
                  <TouchableOpacity
                    key={trip.id}
                    onPress={() => router.push(`/(operator)/trips/${trip.id}`)}
                  >
                    <Card style={styles.tripCard}>
                      <View style={styles.tripRow}>
                        <View style={styles.tripTime}>
                          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                          <Text style={[styles.timeText, { color: colors.text }]}>
                            {trip.call_time}
                          </Text>
                        </View>
                        <Text style={[styles.tripNumber, { color: colors.textSecondary }]}>
                          {trip.trip_number}
                        </Text>
                      </View>

                      <Text style={[styles.destination, { color: colors.text }]} numberOfLines={1}>
                        → {trip.delivery_destination}
                      </Text>

                      <View style={styles.tripAssignments}>
                        {trip.assigned_truck_number && (
                          <View style={[styles.assignmentTag, { backgroundColor: colors.surface }]}>
                            <Ionicons name="car" size={12} color={colors.textSecondary} />
                            <Text style={[styles.assignmentTagText, { color: colors.textSecondary }]}>
                              {trip.assigned_truck_number}
                            </Text>
                          </View>
                        )}
                        {trip.assigned_driver_name && (
                          <View style={[styles.assignmentTag, { backgroundColor: colors.surface }]}>
                            <Ionicons name="person" size={12} color={colors.textSecondary} />
                            <Text style={[styles.assignmentTagText, { color: colors.textSecondary }]}>
                              {trip.assigned_driver_name.split(' ')[0]}
                            </Text>
                          </View>
                        )}
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          )}
        </View>

        {/* Auto-refresh indicator */}
        <View style={styles.refreshIndicator}>
          <Ionicons name="sync-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.refreshText, { color: colors.textSecondary }]}>
            Auto-refreshes every 30 seconds
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    marginBottom: 24,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
  },
  statusGroup: {
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 8,
  },
  statusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  tripCard: {
    padding: 12,
    marginBottom: 8,
  },
  tripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  tripNumber: {
    fontSize: 13,
  },
  destination: {
    fontSize: 14,
    marginBottom: 8,
  },
  tripAssignments: {
    flexDirection: 'row',
    gap: 6,
  },
  assignmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  assignmentTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  refreshText: {
    fontSize: 12,
  },
});

