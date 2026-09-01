/**
 * Porter Cash Advance Screen
 * Request and view cash advances
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { Button } from '../../../src/components/ui/Button';
import {
  getMyCashAdvances,
  requestCashAdvance,
} from '../../../src/services/api/driver-porter.service';
import type { CashAdvance } from '../../../src/types/driver-porter.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatPhilippineDate, formatPhilippinePeso } from '../../../src/utils/philippines';

export default function PorterCashAdvanceScreen() {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [advances, setAdvances] = useState<CashAdvance[]>([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAdvances();
  }, []);

  const loadAdvances = async () => {
    try {
      const response = await getMyCashAdvances();
      if (response.data) {
        setAdvances(response.data);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAdvances();
  };

  const handleSubmitRequest = async () => {
    if (!requestAmount || parseFloat(requestAmount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!requestReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a reason for the cash advance');
      return;
    }

    setSubmitting(true);
    try {
      const response = await requestCashAdvance(
        parseFloat(requestAmount),
        requestReason.trim()
      );

      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert('Success', 'Cash advance request submitted');
        setShowRequestModal(false);
        setRequestAmount('');
        setRequestReason('');
        loadAdvances();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return colors.success;
      case 'disbursed':
        return colors.primary;
      case 'rejected':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const renderAdvanceCard = ({ item }: { item: CashAdvance }) => {
    return (
      <Card style={styles.advanceCard}>
        <View style={styles.advanceHeader}>
          <View>
            <Text style={[styles.amount, { color: colors.text }]}>
              {formatPhilippinePeso(item.amount)}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>
              Requested {formatPhilippineDate(item.requested_at)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.advanceDetails}>
          <Text style={[styles.reasonLabel, { color: colors.textSecondary }]}>
            Reason:
          </Text>
          <Text style={[styles.reasonText, { color: colors.text }]}>
            {item.reason}
          </Text>

          {item.status === 'rejected' && item.rejection_reason && (
            <View style={[styles.rejectionBox, { backgroundColor: colors.error + '1A', borderColor: colors.error + '50', borderWidth: 1 }]}>
              <MaterialCommunityIcons name="close-circle" size={16} color={colors.error} />
              <Text style={[styles.rejectionText, { color: colors.text }]}>
                {item.rejection_reason}
              </Text>
            </View>
          )}
        </View>
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
        data={advances}
        renderItem={renderAdvanceCard}
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
              name="cash"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No cash advance requests
            </Text>
          </View>
        }
      />

      {/* Request Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Button
          onPress={() => setShowRequestModal(true)}
          fullWidth
          icon={<MaterialCommunityIcons name="plus" size={24} color="#fff" />}
        >
          Request Cash Advance
        </Button>
      </View>

      {/* Request Modal */}
      <Modal
        visible={showRequestModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Request Cash Advance
              </Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.label, { color: colors.text }]}>
                Amount (₱) <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                value={requestAmount}
                onChangeText={setRequestAmount}
                placeholder="Enter amount"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />

              <Text style={[styles.label, { color: colors.text }]}>
                Reason <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.text }]}
                value={requestReason}
                onChangeText={setRequestReason}
                placeholder="Why do you need this cash advance?"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={[styles.note, { color: colors.textSecondary }]}>
                Cash advance requests require operator approval. Approved amounts will be
                deducted from your next payslip.
              </Text>

              <Button
                onPress={handleSubmitRequest}
                fullWidth
                disabled={submitting}
                icon={
                  submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <MaterialCommunityIcons name="send" size={24} color="#fff" />
                  )
                }
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  advanceCard: {
    marginBottom: 16,
    padding: 16,
  },
  advanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
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
  advanceDetails: {},
  reasonLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    lineHeight: 20,
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  rejectionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  textArea: {
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    marginBottom: 16,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
});

