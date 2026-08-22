/**
 * Porter Trip History Screen
 * View completed trips
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
import { formatPhilippineDate } from '../../../src/utils/philippines';

export default function PorterTripHistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trips, setTrips] = useState<Assignment[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await getMyAssignments('completed');
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
    loadHistory();
  };

  const renderTripCard = ({ item }: { item: Assignment }) => {
    const trip = item.trip;

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/(porter)/trips/[id]',
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
                {formatPhilippineDate(trip.delivery_date)}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={colors.success}
            />
          </View>

          <View style={styles.tripInfo}>
            <Text style={[styles.tripLabel, { color: colors.textSecondary }]}>
              Route:
            </Text>
            <Text style={[styles.tripValue, { color: colors.text }]}>
              {trip.pickup_warehouse} → {trip.delivery_destination}
            </Text>
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
              name="history"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No completed trips yet
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
    alignItems: 'center',
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
  tripInfo: {
    gap: 4,
  },
  tripLabel: {
    fontSize: 12,
  },
  tripValue: {
    fontSize: 14,
    fontWeight: '500',
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

