// @ts-nocheck - TODO: Fix service method signature mismatches
/**
 * Cash Advance Request List Component (Employee)
 * 
 * Displays employee's cash advance requests with status, history,
 * and transaction details.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  CashAdvanceRequest,
  CashAdvanceTransaction,
} from '../../types/payroll.types';
import { cashAdvanceManagementService } from '../../services/payroll/CashAdvanceManagementService';

interface CashAdvanceRequestListProps {
  employeeId: string;
  onRequestPress?: (request: CashAdvanceRequest) => void;
}

export const CashAdvanceRequestList: React.FC<CashAdvanceRequestListProps> = ({
  employeeId,
  onRequestPress,
}) => {
  const [requests, setRequests] = useState<CashAdvanceRequest[]>([]);
  const [transactions, setTransactions] = useState<Map<string, CashAdvanceTransaction[]>>(new Map());
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      // Load all requests for employee
      const allRequests = await cashAdvanceManagementService['getAllRequests']();
      const employeeRequests = allRequests.filter(r => r.employee_id === employeeId);
      
      // Sort by request date, most recent first
      employeeRequests.sort((a, b) => 
        new Date(b.request_date).getTime() - new Date(a.request_date).getTime()
      );
      
      setRequests(employeeRequests);

      // Load transactions for each request
      const txMap = new Map<string, CashAdvanceTransaction[]>();
      const allTransactions = await cashAdvanceManagementService['getAllTransactions']();
      
      for (const request of employeeRequests) {
        const requestTxs = allTransactions.filter(
          tx => tx.cash_advance_id === request.id
        );
        requestTxs.sort((a, b) => 
          new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
        );
        txMap.set(request.id, requestTxs);
      }
      
      setTransactions(txMap);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRequests();
  };

  const toggleExpanded = (requestId: string) => {
    const newExpanded = new Set(expandedRequests);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRequests(newExpanded);
  };

  const getStatusColor = (status: CashAdvanceRequest['status']) => {
    switch (status) {
      case 'approved':
      case 'disbursed':
      case 'completed':
        return '#10B981';
      case 'pending':
      case 'repaying':
        return '#F59E0B';
      case 'rejected':
      case 'written_off':
        return '#EF4444';
      case 'draft':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: CashAdvanceRequest['status']) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'checkmark-circle';
      case 'disbursed':
      case 'repaying':
        return 'cash';
      case 'pending':
        return 'time';
      case 'rejected':
        return 'close-circle';
      case 'written_off':
        return 'alert-circle';
      case 'draft':
        return 'create';
      default:
        return 'help-circle';
    }
  };

  const formatStatus = (status: string): string => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculateBalance = (request: CashAdvanceRequest): number => {
    const txs = transactions.get(request.id) || [];
    let balance = 0;
    
    for (const tx of txs) {
      if (tx.transaction_type === 'advance') {
        balance += tx.amount;
      } else {
        balance -= tx.amount;
      }
    }
    
    return balance;
  };

  const renderRequest = (request: CashAdvanceRequest) => {
    const isExpanded = expandedRequests.has(request.id);
    const requestTransactions = transactions.get(request.id) || [];
    const balance = calculateBalance(request);

    return (
      <TouchableOpacity
        key={request.id}
        style={styles.requestCard}
        onPress={() => toggleExpanded(request.id)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.requestHeader}>
          <View style={styles.requestHeaderLeft}>
            <Ionicons
              name={getStatusIcon(request.status)}
              size={24}
              color={getStatusColor(request.status)}
            />
            <View style={styles.requestHeaderText}>
              <Text style={styles.requestAmount}>
                ${request.amount.toFixed(2)}
              </Text>
              <Text style={styles.requestDate}>
                {new Date(request.request_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={styles.requestHeaderRight}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(request.status)}20` }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(request.status) }
              ]}>
                {formatStatus(request.status)}
              </Text>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </View>
        </View>

        {/* Purpose */}
        <Text style={styles.requestPurpose} numberOfLines={isExpanded ? undefined : 2}>
          {request.purpose}
        </Text>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Repayment Information */}
            {request.status !== 'draft' && request.status !== 'pending' && request.status !== 'rejected' && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Repayment Details</Text>
                
                {balance > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Remaining Balance:</Text>
                    <Text style={styles.detailValue}>
                      ${balance.toFixed(2)}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Installments:</Text>
                  <Text style={styles.detailValue}>
                    {request.repayment_terms.number_of_installments}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Per Installment:</Text>
                  <Text style={styles.detailValue}>
                    ${request.repayment_terms.installment_amount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Frequency:</Text>
                  <Text style={styles.detailValue}>
                    {formatStatus(request.repayment_terms.frequency)}
                  </Text>
                </View>
              </View>
            )}

            {/* Notes */}
            {request.notes && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Notes</Text>
                <Text style={styles.detailNotes}>{request.notes}</Text>
              </View>
            )}

            {/* Rejection Reason */}
            {request.status === 'rejected' && request.rejection_reason && (
              <View style={[styles.detailSection, styles.rejectionSection]}>
                <View style={styles.rejectionHeader}>
                  <Ionicons name="information-circle" size={18} color="#DC2626" />
                  <Text style={styles.rejectionTitle}>Rejection Reason</Text>
                </View>
                <Text style={styles.rejectionText}>{request.rejection_reason}</Text>
                {request.rejected_by && (
                  <Text style={styles.rejectionBy}>
                    Rejected by {request.rejected_by} on{' '}
                    {request.rejected_at && new Date(request.rejected_at).toLocaleDateString()}
                  </Text>
                )}
              </View>
            )}

            {/* Transaction History */}
            {requestTransactions.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Transaction History</Text>
                {requestTransactions.map((tx) => (
                  <View key={tx.id} style={styles.transactionItem}>
                    <View style={styles.transactionLeft}>
                      <Ionicons
                        name={tx.transaction_type === 'advance' ? 'arrow-down' : 'arrow-up'}
                        size={16}
                        color={tx.transaction_type === 'advance' ? '#10B981' : '#EF4444'}
                      />
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionType}>
                          {formatStatus(tx.transaction_type)}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {new Date(tx.transaction_date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      tx.transaction_type === 'advance' 
                        ? styles.transactionAmountPositive 
                        : styles.transactionAmountNegative
                    ]}>
                      {tx.transaction_type === 'advance' ? '+' : '-'}
                      ${tx.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Approval/Disbursement Info */}
            {request.approved_by && (
              <View style={styles.timestampSection}>
                <Text style={styles.timestampText}>
                  Approved by {request.approved_by} on{' '}
                  {request.approved_at && new Date(request.approved_at).toLocaleDateString()}
                </Text>
              </View>
            )}
            {request.disbursed_by && (
              <View style={styles.timestampSection}>
                <Text style={styles.timestampText}>
                  Disbursed by {request.disbursed_by} on{' '}
                  {request.disbursed_at && new Date(request.disbursed_at).toLocaleDateString()}
                </Text>
                {request.disbursement_method && (
                  <Text style={styles.timestampText}>
                    Method: {formatStatus(request.disbursement_method)}
                  </Text>
                )}
              </View>
            )}
            {request.acknowledged_by_employee_at && (
              <View style={styles.timestampSection}>
                <Text style={styles.timestampText}>
                  Acknowledged on{' '}
                  {new Date(request.acknowledged_by_employee_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cash-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No Cash Advance Requests</Text>
        <Text style={styles.emptyText}>
          You haven't submitted any cash advance requests yet
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cash Advances</Text>
        <Text style={styles.headerSubtitle}>
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {requests.map(renderRequest)}

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },

  // Header
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  // Request Card
  requestCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestHeaderText: {
    marginLeft: 12,
  },
  requestAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  requestDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  requestHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestPurpose: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  // Expanded Content
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  detailNotes: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },

  // Rejection Section
  rejectionSection: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 6,
  },
  rejectionText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },
  rejectionBy: {
    fontSize: 12,
    color: '#991B1B',
    marginTop: 6,
    fontStyle: 'italic',
  },

  // Transaction History
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionInfo: {
    marginLeft: 8,
  },
  transactionType: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionAmountPositive: {
    color: '#10B981',
  },
  transactionAmountNegative: {
    color: '#EF4444',
  },

  // Timestamp Section
  timestampSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  timestampText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },

  footer: {
    height: 24,
  },
});
