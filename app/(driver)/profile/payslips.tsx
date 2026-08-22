/**
 * Payslips Screen
 * View payslips
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
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { getMyPayslips } from '../../../src/services/api/driver-porter.service';
import type { Payslip } from '../../../src/types/driver-porter.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatPhilippineDate, formatPhilippinePeso } from '../../../src/utils/philippines';

export default function PayslipsScreen() {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payslips, setPayslips] = useState<Payslip[]>([]);

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    try {
      const response = await getMyPayslips();
      if (response.data) {
        setPayslips(response.data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPayslips();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'approved':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const renderPayslipCard = ({ item }: { item: Payslip }) => {
    return (
      <Card style={styles.payslipCard}>
        <View style={styles.payslipHeader}>
          <View>
            <Text style={[styles.period, { color: colors.text }]}>
              {formatPhilippineDate(item.period_start)} -{' '}
              {formatPhilippineDate(item.period_end)}
            </Text>
            <Text style={[styles.tripCount, { color: colors.textSecondary }]}>
              {item.trip_count} trips
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.payslipDetails}>
          <View style={styles.payslipRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Base Salary:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {formatPhilippinePeso(item.base_salary)}
            </Text>
          </View>
          <View style={styles.payslipRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Trip Incentives:
            </Text>
            <Text style={[styles.value, { color: colors.success }]}>
              {formatPhilippinePeso(item.trip_incentives)}
            </Text>
          </View>
          <View style={styles.payslipRow}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Deductions:
            </Text>
            <Text style={[styles.value, { color: colors.error }]}>
              -{formatPhilippinePeso(item.deductions)}
            </Text>
          </View>
          <View style={[styles.payslipRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Net Pay:
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatPhilippinePeso(item.net_pay)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.downloadButton, { backgroundColor: colors.primary }]}
        >
          <MaterialCommunityIcons name="download" size={20} color="#fff" />
          <Text style={styles.downloadButtonText}>Download PDF</Text>
        </TouchableOpacity>
      </Card>
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
        data={payslips}
        renderItem={renderPayslipCard}
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
              name="file-document-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No payslips available
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
  payslipCard: {
    marginBottom: 16,
    padding: 16,
  },
  payslipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  period: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tripCount: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  payslipDetails: {
    marginBottom: 16,
  },
  payslipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
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

