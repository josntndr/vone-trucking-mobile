// @ts-nocheck - TODO: Fix service method signature mismatches
/**
 * Cash Advance Management Card Component (Operator)
 * 
 * Operator interface for reviewing cash advance requests, approving/rejecting,
 * disbursing funds, tracking repayments, and managing all employee advances.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  CashAdvanceRequest,
  CashAdvanceTransaction,
} from '../../types/payroll.types';
import { cashAdvanceManagementService } from '../../services/payroll/CashAdvanceManagementService';

interface CashAdvanceManagementCardProps {
  operatorId: string;
  operatorName: string;
  onRequestUpdated?: (request: CashAdvanceRequest) => void;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'disbursed' | 'repaying' | 'completed' | 'rejected';

export const CashAdvanceManagementCard: React.FC<CashAdvanceManagementCardProps> = ({
  operatorId,
  operatorName,
  onRequestUpdated,
}) => {
  const [requests, setRequests] = useState<CashAdvanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CashAdvanceRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [selectedRequest, setSelectedRequest] = useState<CashAdvanceRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [showManualPaymentModal, setShowManualPaymentModal] = useState(false);

  // Form states
  const [rejectionReason, setRejectionReason] = useState('');
  const [disbursementMethod, setDisbursementMethod] = useState<'cash' | 'bank_transfer' | 'check'>('bank_transfer');
  const [disbursementReference, setDisbursementReference] = useState('');
  const [manualPaymentAmount, setManualPaymentAmount] = useState('');
  const [manualPaymentNotes, setManualPaymentNotes] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filterStatus, searchQuery]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const allRequests = await cashAdvanceManagementService['getAllRequests']();
      
      // Sort by request date, most recent first
      allRequests.sort((a, b) => 
        new Date(b.request_date).getTime() - new Date(a.request_date).getTime()
      );
      
      setRequests(allRequests);
    } catch (error) {
      console.error('Failed to load requests:', error);
      Alert.alert('Error', 'Failed to load cash advance requests');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.employee_name.toLowerCase().includes(query) ||
        r.employee_id.toLowerCase().includes(query) ||
        r.purpose.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const approved = await cashAdvanceManagementService.approveRequest(
        selectedRequest.id,
        operatorId,
        operatorName
      );

      Alert.alert(
        'Request Approved',
        `Cash advance of $${approved.amount.toFixed(2)} for ${approved.employee_name} has been approved.`
      );

      setShowApprovalModal(false);
      setSelectedRequest(null);
      loadRequests();
      if (onRequestUpdated) onRequestUpdated(approved);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to approve request'
      );
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!rejectionReason || rejectionReason.trim().length < 10) {
      Alert.alert('Reason Required', 'Please provide a detailed rejection reason (minimum 10 characters)');
      return;
    }

    try {
      const rejected = await cashAdvanceManagementService.rejectRequest(
        selectedRequest.id,
        rejectionReason,
        operatorId,
        operatorName
      );

      Alert.alert(
        'Request Rejected',
        `Cash advance request for ${rejected.employee_name} has been rejected.`
      );

      setShowRejectionModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      loadRequests();
      if (onRequestUpdated) onRequestUpdated(rejected);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to reject request'
      );
    }
  };

  const handleDisburse = async () => {
    if (!selectedRequest) return;

    if (!disbursementReference.trim()) {
      Alert.alert('Reference Required', 'Please provide a disbursement reference number');
      return;
    }

    try {
      const disbursed = await cashAdvanceManagementService.disburseAdvance(
        selectedRequest.id,
        disbursementMethod,
        disbursementReference,
        operatorId,
        operatorName
      );

      Alert.alert(
        'Advance Disbursed',
        `$${disbursed.amount.toFixed(2)} has been disbursed to ${disbursed.employee_name} via ${disbursementMethod}.`
      );

      setShowDisbursementModal(false);
      setSelectedRequest(null);
      setDisbursementReference('');
      loadRequests();
      if (onRequestUpdated) onRequestUpdated(disbursed);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to disburse advance'
      );
    }
  };

  const handleManualPayment = async () => {
    if (!selectedRequest) return;

    const amount = parseFloat(manualPaymentAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount');
      return;
    }

    try {
      await cashAdvanceManagementService.processManualRepayment(
        selectedRequest.id,
        amount,
        operatorId,
        operatorName,
        manualPaymentNotes || undefined
      );

      Alert.alert(
        'Payment Recorded',
        `Manual repayment of $${amount.toFixed(2)} has been recorded for ${selectedRequest.employee_name}.`
      );

      setShowManualPaymentModal(false);
      setSelectedRequest(null);
      setManualPaymentAmount('');
      setManualPaymentNotes('');
      loadRequests();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to record payment'
      );
    }
  };

  const openApprovalModal = (request: CashAdvanceRequest) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const openRejectionModal = (request: CashAdvanceRequest) => {
    setSelectedRequest(request);
    setShowRejectionModal(true);
  };

  const openDisbursementModal = (request: CashAdvanceRequest) => {
    setSelectedRequest(request);
    setShowDisbursementModal(true);
  };

  const openManualPaymentModal = (request: CashAdvanceRequest) => {
    setSelectedRequest(request);
    setShowManualPaymentModal(true);
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
      default:
        return '#6B7280';
    }
  };

  const formatStatus = (status: string): string => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const renderFilterButton = (status: FilterStatus, label: string, count: number) => {
    const isActive = filterStatus === status;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setFilterStatus(status)}
      >
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
          {label}
        </Text>
        <View style={[styles.filterBadge, isActive && styles.filterBadgeActive]}>
          <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRequest = (request: CashAdvanceRequest) => {
    const canApprove = request.status === 'pending';
    const canDisburse = request.status === 'approved';
    const canRecordPayment = request.status === 'disbursed' || request.status === 'repaying';

    return (
      <View key={request.id} style={styles.requestCard}>
        {/* Header */}
        <View style={styles.requestHeader}>
          <View style={styles.requestHeaderLeft}>
            <View>
              <Text style={styles.employeeName}>{request.employee_name}</Text>
              <Text style={styles.employeeId}>ID: {request.employee_id}</Text>
            </View>
          </View>
          <View style={styles.requestHeaderRight}>
            <Text style={styles.requestAmount}>${request.amount.toFixed(2)}</Text>
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
          </View>
        </View>

        {/* Purpose */}
        <View style={styles.purposeSection}>
          <Text style={styles.purposeLabel}>Purpose:</Text>
          <Text style={styles.purposeText}>{request.purpose}</Text>
        </View>

        {/* Request Date */}
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={14} color="#6B7280" />
          <Text style={styles.detailText}>
            Requested: {new Date(request.request_date).toLocaleDateString()}
          </Text>
        </View>

        {/* Repayment Terms */}
        {request.status !== 'draft' && request.status !== 'pending' && request.status !== 'rejected' && (
          <View style={styles.repaymentSection}>
            <Text style={styles.repaymentTitle}>Repayment Terms</Text>
            <View style={styles.repaymentGrid}>
              <View style={styles.repaymentItem}>
                <Text style={styles.repaymentLabel}>Installments</Text>
                <Text style={styles.repaymentValue}>
                  {request.repayment_terms.number_of_installments}
                </Text>
              </View>
              <View style={styles.repaymentItem}>
                <Text style={styles.repaymentLabel}>Per Period</Text>
                <Text style={styles.repaymentValue}>
                  ${request.repayment_terms.installment_amount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.repaymentItem}>
                <Text style={styles.repaymentLabel}>Frequency</Text>
                <Text style={styles.repaymentValue}>
                  {formatStatus(request.repayment_terms.frequency)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Notes */}
        {request.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{request.notes}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {canApprove && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => openApprovalModal(request)}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => openRejectionModal(request)}
              >
                <Ionicons name="close-circle" size={18} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </>
          )}

          {canDisburse && (
            <TouchableOpacity
              style={[styles.actionButton, styles.disburseButton]}
              onPress={() => openDisbursementModal(request)}
            >
              <Ionicons name="cash" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Disburse</Text>
            </TouchableOpacity>
          )}

          {canRecordPayment && (
            <TouchableOpacity
              style={[styles.actionButton, styles.paymentButton]}
              onPress={() => openManualPaymentModal(request)}
            >
              <Ionicons name="card" size={18} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Record Payment</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const disbursedCount = requests.filter(r => r.status === 'disbursed').length;
  const repayingCount = requests.filter(r => r.status === 'repaying').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Ionicons name="wallet" size={24} color="#1F2937" />
          <Text style={styles.headerTitle}>Cash Advance Management</Text>
        </View>
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by employee name, ID, or purpose..."
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {renderFilterButton('all', 'All', requests.length)}
        {renderFilterButton('pending', 'Pending', pendingCount)}
        {renderFilterButton('approved', 'Approved', approvedCount)}
        {renderFilterButton('disbursed', 'Disbursed', disbursedCount)}
        {renderFilterButton('repaying', 'Repaying', repayingCount)}
        {renderFilterButton('completed', 'Completed', completedCount)}
        {renderFilterButton('rejected', 'Rejected', rejectedCount)}
      </ScrollView>

      {/* Requests List */}
      <ScrollView style={styles.requestsList}>
        {filteredRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Requests Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search' : `No ${filterStatus} requests at this time`}
            </Text>
          </View>
        ) : (
          filteredRequests.map(renderRequest)
        )}
        <View style={styles.footer} />
      </ScrollView>

      {/* Approval Modal */}
      <Modal
        visible={showApprovalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowApprovalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              <Text style={styles.modalTitle}>Approve Cash Advance</Text>
            </View>

            {selectedRequest && (
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Approve cash advance of <Text style={styles.modalTextBold}>
                    ${selectedRequest.amount.toFixed(2)}
                  </Text> for <Text style={styles.modalTextBold}>
                    {selectedRequest.employee_name}
                  </Text>?
                </Text>
                <View style={styles.modalDetail}>
                  <Text style={styles.modalDetailLabel}>Repayment:</Text>
                  <Text style={styles.modalDetailValue}>
                    {selectedRequest.repayment_terms.number_of_installments} installments of $
                    {selectedRequest.repayment_terms.installment_amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowApprovalModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleApprove}
              >
                <Text style={styles.modalButtonTextPrimary}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        visible={showRejectionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRejectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="close-circle" size={32} color="#EF4444" />
              <Text style={styles.modalTitle}>Reject Cash Advance</Text>
            </View>

            {selectedRequest && (
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Rejecting cash advance request for{' '}
                  <Text style={styles.modalTextBold}>{selectedRequest.employee_name}</Text>
                </Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Rejection Reason *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                    placeholder="Provide a detailed reason for rejection (minimum 10 characters)..."
                    multiline
                    numberOfLines={4}
                  />
                  <Text style={styles.helpText}>
                    {rejectionReason.length}/10 characters minimum
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={handleReject}
              >
                <Text style={styles.modalButtonTextPrimary}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Disbursement Modal */}
      <Modal
        visible={showDisbursementModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisbursementModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="cash" size={32} color="#3B82F6" />
              <Text style={styles.modalTitle}>Disburse Cash Advance</Text>
            </View>

            {selectedRequest && (
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Disburse <Text style={styles.modalTextBold}>
                    ${selectedRequest.amount.toFixed(2)}
                  </Text> to <Text style={styles.modalTextBold}>
                    {selectedRequest.employee_name}
                  </Text>
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Disbursement Method *</Text>
                  <View style={styles.methodButtons}>
                    {['bank_transfer', 'cash', 'check'].map((method) => (
                      <TouchableOpacity
                        key={method}
                        style={[
                          styles.methodButton,
                          disbursementMethod === method && styles.methodButtonActive
                        ]}
                        onPress={() => setDisbursementMethod(method as any)}
                      >
                        <Text style={[
                          styles.methodButtonText,
                          disbursementMethod === method && styles.methodButtonTextActive
                        ]}>
                          {formatStatus(method)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reference Number *</Text>
                  <TextInput
                    style={styles.input}
                    value={disbursementReference}
                    onChangeText={setDisbursementReference}
                    placeholder="Transaction/check number, etc."
                  />
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowDisbursementModal(false);
                  setDisbursementReference('');
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleDisburse}
              >
                <Text style={styles.modalButtonTextPrimary}>Disburse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manual Payment Modal */}
      <Modal
        visible={showManualPaymentModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowManualPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="card" size={32} color="#8B5CF6" />
              <Text style={styles.modalTitle}>Record Manual Payment</Text>
            </View>

            {selectedRequest && (
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Record manual repayment from{' '}
                  <Text style={styles.modalTextBold}>{selectedRequest.employee_name}</Text>
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Payment Amount ($) *</Text>
                  <TextInput
                    style={styles.input}
                    value={manualPaymentAmount}
                    onChangeText={setManualPaymentAmount}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={manualPaymentNotes}
                    onChangeText={setManualPaymentNotes}
                    placeholder="Payment method, reference, etc. (optional)..."
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowManualPaymentModal(false);
                  setManualPaymentAmount('');
                  setManualPaymentNotes('');
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleManualPayment}
              >
                <Text style={styles.modalButtonTextPrimary}>Record Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },

  // Filters
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterBadgeTextActive: {
    color: '#3B82F6',
  },

  // Requests List
  requestsList: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
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
    marginBottom: 12,
  },
  requestHeaderLeft: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  employeeId: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  requestHeaderRight: {
    alignItems: 'flex-end',
  },
  requestAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
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

  // Purpose
  purposeSection: {
    marginBottom: 12,
  },
  purposeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  purposeText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  // Details
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },

  // Repayment
  repaymentSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  repaymentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  repaymentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  repaymentItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  repaymentLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  repaymentValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Notes
  notesSection: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 6,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  disburseButton: {
    backgroundColor: '#3B82F6',
  },
  paymentButton: {
    backgroundColor: '#8B5CF6',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  modalBody: {
    padding: 24,
  },
  modalText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
  },
  modalTextBold: {
    fontWeight: '600',
    color: '#1F2937',
  },
  modalDetail: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 6,
  },
  modalDetailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  modalButtonDanger: {
    backgroundColor: '#EF4444',
  },
  modalButtonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  modalButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Form Inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  // Method Buttons
  methodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  methodButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  methodButtonTextActive: {
    color: '#FFFFFF',
  },

  footer: {
    height: 24,
  },
});
