/**
 * Trip Calendar View
 * Shows trips scheduled by date for visual scheduling
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, LoadingSpinner, StatusChip } from '../../../src/components';
import { useTheme } from '../../../src/hooks';
import { getTrips } from '../../../src/services/api/trip.service';
import { Trip, getTripStatusInfo } from '../../../src/types/trip.types';
import { formatPhilippineDate } from '../../../src/utils/philippines';

interface DayTrips {
  date: string;
  displayDate: string;
  trips: Trip[];
  isToday: boolean;
}

export default function TripCalendarScreen() {
  const themeObj = useTheme();
  const colors = {
    background: '#0B1120',
    surface: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
    primary: '#0EA5E9',
    success: '#10B981',
    info: '#38BDF8',
    warning: '#F59E0B',
    error: '#EF4444',
    white: '#FFFFFF',
  };
  const { spacing } = themeObj;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dayTrips, setDayTrips] = useState<DayTrips[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const loadCalendarTrips = async () => {
    try {
      // Get trips for the selected month
      const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const lastDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      const response = await getTrips(
        {
          delivery_date_from: firstDay.toISOString().split('T')[0],
          delivery_date_to: lastDay.toISOString().split('T')[0],
        },
        1,
        100
      );

      if (response.data) {
        // Group trips by date
        const grouped = response.data.data.reduce((acc, trip) => {
          const date = trip.delivery_date;
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(trip);
          return acc;
        }, {} as Record<string, Trip[]>);

        // Convert to array and sort
        const today = new Date().toISOString().split('T')[0];
        const dayTripsArray: DayTrips[] = Object.entries(grouped)
          .map(([date, trips]) => ({
            date,
            displayDate: formatPhilippineDate(date),
            trips: trips.sort((a, b) => a.call_time.localeCompare(b.call_time)),
            isToday: date === today,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setDayTrips(dayTripsArray);
      }
    } catch (error) {
      console.error('Failed to load calendar trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCalendarTrips();
  }, [selectedMonth]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCalendarTrips();
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
    setLoading(true);
  };

  const goToToday = () => {
    setSelectedMonth(new Date());
    setLoading(true);
  };

  if (loading) {
    return (
      <Screen>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <LoadingSpinner />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Month Selector */}
        <View style={[styles.monthSelector, { paddingHorizontal: spacing.md }]}>
          <TouchableOpacity
            style={[styles.monthBtn, { backgroundColor: colors.surface }]}
            onPress={() => changeMonth('prev')}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.monthDisplay}>
            <Text style={[styles.monthText, { color: colors.text }]}>
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <TouchableOpacity onPress={goToToday}>
              <Text style={[styles.todayBtn, { color: colors.primary }]}>Today</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.monthBtn, { backgroundColor: colors.surface }]}
            onPress={() => changeMonth('next')}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Trips by Day */}
        <View style={{ paddingHorizontal: spacing.md }}>
          {dayTrips.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No trips scheduled for this month
              </Text>
            </Card>
          ) : (
            dayTrips.map((day) => (
              <View key={day.date} style={styles.daySection}>
                <View
                  style={[
                    styles.dayHeader,
                    { backgroundColor: colors.surface },
                    day.isToday && {
                      backgroundColor: colors.primary + '15',
                      borderLeftColor: colors.primary,
                      borderLeftWidth: 4,
                    },
                  ]}
                >
                  <Text style={[styles.dayDate, { color: day.isToday ? colors.primary : colors.text }]}>
                    {day.displayDate}
                    {day.isToday && ' (Today)'}
                  </Text>
                  <Text style={[styles.tripCount, { color: colors.textSecondary }]}>
                    {day.trips.length} {day.trips.length === 1 ? 'trip' : 'trips'}
                  </Text>
                </View>

                {day.trips.map((trip) => {
                  const statusInfo = getTripStatusInfo(trip.status);
                  return (
                    <TouchableOpacity
                      key={trip.id}
                      onPress={() => router.push(`/(operator)/trips/${trip.id}`)}
                    >
                      <Card style={styles.tripCard}>
                        <View style={styles.tripHeader}>
                          <View style={styles.tripInfo}>
                            <Text style={[styles.tripTime, { color: colors.text }]}>
                              {trip.call_time}
                            </Text>
                            <Text style={[styles.tripNumber, { color: colors.textSecondary }]}>
                              {trip.trip_number}
                            </Text>
                          </View>
                          <StatusChip label={statusInfo.label} color={statusInfo.color} />
                        </View>

                        <Text style={[styles.destination, { color: colors.text }]} numberOfLines={1}>
                          → {trip.delivery_destination}
                        </Text>

                        {trip.assigned_truck_number && (
                          <View style={styles.assignment}>
                            <Ionicons name="car" size={14} color={colors.textSecondary} />
                            <Text style={[styles.assignmentText, { color: colors.textSecondary }]}>
                              {trip.assigned_truck_number}
                            </Text>
                            {trip.assigned_driver_name && (
                              <>
                                <Text style={[styles.assignmentText, { color: colors.textSecondary }]}>
                                  •
                                </Text>
                                <Ionicons name="person" size={14} color={colors.textSecondary} />
                                <Text style={[styles.assignmentText, { color: colors.textSecondary }]}>
                                  {trip.assigned_driver_name}
                                </Text>
                              </>
                            )}
                          </View>
                        )}
                      </Card>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  monthBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  monthDisplay: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  todayBtn: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: '700',
  },
  tripCount: {
    fontSize: 14,
  },
  tripCard: {
    padding: 12,
    marginBottom: 8,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripInfo: {
    flex: 1,
  },
  tripTime: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  tripNumber: {
    fontSize: 13,
  },
  destination: {
    fontSize: 14,
    marginBottom: 6,
  },
  assignment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignmentText: {
    fontSize: 12,
  },
});

