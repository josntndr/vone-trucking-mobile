// @ts-nocheck - TODO: Fix type errors
/**
 * Payroll Processing Card Component (Operator)
 * 
 * Operator interface for complete 10-step payroll workflow:
 * 1. Select payroll period
 * 2-5. Calculate payroll (retrieves trips, attendance, calculates earnings & deductions)
 * 6. Review preview
 * 7. Make corrections
 * 8. Approve payroll
 * 9. Generate payslips
 * 10. Mark as paid
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
  PayrollPeriod,
  PayrollRecord,
  PayrollSummaryReport,
  EmployeeCompensation,
  DestinationRate,
  Allowance,
  Bonus,
  AttendanceRecord,
} from '../../types/payroll.types';
import { payrollProcessingService } from '../../services/payroll/PayrollProcessingService';

interface PayrollProcessingCardProps {
  operatorId: string;
  operatorName: string;
  onPayrollCompleted?: (period: PayrollPeriod) => void;
}

type ProcessingStep = 'setup' | 'preview' | 'review' | 'approved' | 'paid';

export const PayrollProcessingCard: React.FC<PayrollProcessingCardProps> = ({
  operatorId,
  operatorName,
  onPayrollCompleted,
}) => {
  // Period setup
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [payDate, setPayDate] = useState('');
  
  // Current state
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('setup');
  const [currentPeriod, setCurrentPeriod] = useState<PayrollPeriod | null>(null);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [summary, setSummary] = useState<PayrollSummaryReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Correction modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [correctionField, setCorrectionField] = useState<'gross_pay' | 'net_pay'>('gross_pay');
  const [correctionValue, setCorrectionValue] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');

  // Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<PayrollRecord[]>([]);

  useEffect(() => {
    applyFilter();
  }, [payrollRecords, searchQuery]);

  const applyFilter = () => {
    if (!searchQuery.trim()) {
      setFilteredRecords(payrollRecords);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = payrollRecords.filter(r =>
      r.employee_name.toLowerCase().includes(query) ||
      r.employee_id.toLowerCase().includes(query)
    );
    setFilteredRecords(filtered);
  };

  /**
   * STEP 1: Create payroll period
   */
  const handleCreatePeriod = async () => {
    if (!periodStart || !periodEnd || !payDate) {
      Alert.alert('Missing Information', 'Please fill in all date fields');
      return;
    }

    // Validate dates
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    const pay = new Date(payDate);

    if (start >= end) {
      Alert.alert('Invalid Dates', 'Period start must be before period end');
      return;
    }

    if (pay <= end) {
      Alert.alert('Invalid Pay Date', 'Pay date should be after period end');
      return;
    }

    try {
      setIsProcessing(true);
      const period = await payrollProcessingService.createPayrollPeriod(
        periodStart,
        periodEnd,
        payDate,
        operatorId
      );

      setCurrentPeriod(period);
      Alert.alert(
        'Period Created',
        'Payroll period created successfully. Ready to calculate payroll.'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create payroll period'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * STEPS 2-5: Calculate payroll
   * Note: In production, you would fetch employees, trips, attendance from your data store
   */
  const handleCalculatePayroll = async () => {
    if (!currentPeriod) return;

    Alert.alert(
      'Calculate Payroll',
      'This will calculate payroll for all employees based on approved trips and attendance. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Calculate',
          onPress: async () => {
            try {
              setIsProcessing(true);

              // Mock data - replace with actual data fetching
              const mockEmployees = getMockEmployees();
              const mockTrips = getMockTrips();
              const mockAttendance = getMockAttendance();
              const mockDestinationRates = getMockDestinationRates();
              const mockAllowances = getMockAllowances();
              const mockBonuses = getMockBonuses();

              const records = await payrollProcessingService.calculatePayroll(
                currentPeriod.id,
                mockEmployees,
                mockTrips,
                mockAttendance,
                mockDestinationRates,
                mockAllowances,
                mockBonuses,
                operatorId
              );

              setPayrollRecords(records);

              // Get preview
              const preview = await payrollProcessingService.getPayrollPreview(currentPeriod.id);
              setCurrentPeriod(preview.period);
              setSummary(preview.summary);
              setCurrentStep('preview');

              Alert.alert(
                'Calculation Complete',
                `Payroll calculated for ${records.length} employees. Review the preview below.`
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to calculate payroll'
              );
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  /**
   * STEP 7: Make correction
   */
  const handleOpenCorrectionModal = (record: PayrollRecord) => {
    setSelectedRecord(record);
    setCorrectionField('gross_pay');
    setCorrectionValue('');
    setCorrectionReason('');
    setShowCorrectionModal(true);
  };

  const handleSubmitCorrection = async () => {
    if (!selectedRecord) return;

    const value = parseFloat(correctionValue);
    if (!value || value <= 0) {
      Alert.alert('Invalid Value', 'Please enter a valid amount');
      return;
    }

    if (!correctionReason || correctionReason.trim().length < 10) {
      Alert.alert('Reason Required', 'Please provide a detailed reason (minimum 10 characters)');
      return;
    }

    try {
      const result = await payrollProcessingService.makeCorrection(
        selectedRecord.id,
        'manual_adjustment',
        correctionField,
        value,
        correctionReason,
        operatorId
      );

      // Update records
      const updatedRecords = payrollRecords.map(r =>
        r.id === result.record.id ? result.record : r
      );
      setPayrollRecords(updatedRecords);

      // Refresh preview
      if (currentPeriod) {
        const preview = await payrollProcessingService.getPayrollPreview(currentPeriod.id);
        setSummary(preview.summary);
      }

      setShowCorrectionModal(false);
      setSelectedRecord(null);
      Alert.alert('Correction Applied', 'Payroll record has been corrected successfully.');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to apply correction'
      );
    }
  };

  /**
   * STEP 8: Approve payroll
   */
  const handleApprovePayroll = async () => {
    if (!currentPeriod) return;

    Alert.alert(
      'Approve Payroll',
      'Once approved, no further corrections can be made. Are you sure you want to approve this payroll?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              setIsProcessing(true);
              const approved = await payrollProcessingService.approvePayroll(
                currentPeriod.id,
                operatorId
              );

              setCurrentPeriod(approved);
              setCurrentStep('approved');

              Alert.alert(
                'Payroll Approved',
                'Payroll has been approved successfully. You can now generate payslips.'
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to approve payroll'
              );
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  /**
   * STEP 9: Generate payslips
   */
  const handleGeneratePayslips = async () => {
    if (!currentPeriod) return;

    try {
      setIsProcessing(true);
      const payslips = await payrollProcessingService.generatePayslips(
        currentPeriod.id,
        operatorId
      );

      Alert.alert(
        'Payslips Generated',
        `${payslips.length} payslips have been generated successfully. You can now mark payroll as paid after making actual payments.`
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to generate payslips'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * STEP 10: Mark as paid
   */
  const handleMarkAsPaid = async () => {
    if (!currentPeriod) return;

    Alert.alert(
      'Mark as Paid',
      'Have all employees been paid? This will process cash advance deductions and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark as Paid',
          style: 'default',
          onPress: async () => {
            try {
              setIsProcessing(true);
              const paid = await payrollProcessingService.markAsPaid(
                currentPeriod.id,
                operatorId,
                'All employees paid via bank transfer'
              );

              setCurrentPeriod(paid);
              setCurrentStep('paid');

              Alert.alert(
                'Payroll Completed',
                'Payroll has been marked as paid. Cash advance deductions have been processed.'
              );

              if (onPayrollCompleted) onPayrollCompleted(paid);
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to mark payroll as paid'
              );
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'setup', label: 'Setup', icon: 'create' },
      { key: 'preview', label: 'Preview', icon: 'eye' },
      { key: 'review', label: 'Review', icon: 'search' },
      { key: 'approved', label: 'Approved', icon: 'checkmark-circle' },
      { key: 'paid', label: 'Paid', icon: 'cash' },
    ];

    const currentIndex = steps.findIndex(s => s.key === currentStep);

    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step.key} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                index <= currentIndex && styles.stepCircleActive,
              ]}
            >
              <Ionicons
                name={step.icon as any}
                size={16}
                color={index <= currentIndex ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
            <Text
              style={[
                styles.stepLabel,
                index <= currentIndex && styles.stepLabelActive,
              ]}
            >
              {step.label}
            </Text>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentIndex && styles.stepLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderSetupStep = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Create Payroll Period</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Period Start Date *</Text>
        <TextInput
          style={styles.input}
          value={periodStart}
          onChangeText={setPeriodStart}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Period End Date *</Text>
        <TextInput
          style={styles.input}
          value={periodEnd}
          onChangeText={setPeriodEnd}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Pay Date *</Text>
        <TextInput
          style={styles.input}
          value={payDate}
          onChangeText={setPayDate}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleCreatePeriod}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Create Period</Text>
          </>
        )}
      </TouchableOpacity>

      {currentPeriod && (
        <View style={styles.periodCard}>
          <View style={styles.periodHeader}>
            <Ionicons name="calendar" size={20} color="#3B82F6" />
            <Text style={styles.periodTitle}>Period Created</Text>
          </View>
          <Text style={styles.periodText}>
            {new Date(currentPeriod.period_start).toLocaleDateString()} -{' '}
            {new Date(currentPeriod.period_end).toLocaleDateString()}
          </Text>
          <Text style={styles.periodSubtext}>
            Pay Date: {new Date(currentPeriod.pay_date).toLocaleDateString()}
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: 16 }]}
            onPress={handleCalculatePayroll}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="calculator" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Calculate Payroll</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSummary = () => {
    if (!summary) return null;

    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Payroll Summary</Text>
        
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Employees</Text>
            <Text style={styles.summaryValue}>{summary.total_employees}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gross Pay</Text>
            <Text style={styles.summaryValue}>
              ${summary.total_gross_pay.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Deductions</Text>
            <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
              ${summary.total_deductions.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net Pay</Text>
            <Text style={[styles.summaryValue, { color: '#10B981', fontSize: 20 }]}>
              ${summary.total_net_pay.toFixed(2)}
            </Text>
          </View>
        </View>

        {summary.employees_with_advances > 0 && (
          <View style={styles.summaryDetail}>
            <Ionicons name="wallet" size={16} color="#F59E0B" />
            <Text style={styles.summaryDetailText}>
              {summary.employees_with_advances} employee(s) with cash advance deductions (
              ${summary.total_cash_advance_deductions.toFixed(2)})
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderEmployeeRecord = (record: PayrollRecord) => (
    <View key={record.id} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View>
          <Text style={styles.recordName}>{record.employee_name}</Text>
          <Text style={styles.recordRole}>{record.employee_role}</Text>
        </View>
        <View style={styles.recordAmounts}>
          <Text style={styles.recordGross}>${record.gross_pay.toFixed(2)}</Text>
          <Text style={styles.recordNet}>${record.net_pay.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.recordDetails}>
        <View style={styles.recordDetailRow}>
          <Text style={styles.recordDetailLabel}>Trips:</Text>
          <Text style={styles.recordDetailValue}>
            {record.trips_completed} ({record.trips_approved} approved)
          </Text>
        </View>
        <View style={styles.recordDetailRow}>
          <Text style={styles.recordDetailLabel}>Days:</Text>
          <Text style={styles.recordDetailValue}>{record.days_worked}</Text>
        </View>
        <View style={styles.recordDetailRow}>
          <Text style={styles.recordDetailLabel}>Hours:</Text>
          <Text style={styles.recordDetailValue}>
            {record.hours_worked.toFixed(1)} ({record.overtime_hours.toFixed(1)} OT)
          </Text>
        </View>
        {record.cash_advance_deduction > 0 && (
          <View style={styles.recordDetailRow}>
            <Text style={styles.recordDetailLabel}>Cash Advance:</Text>
            <Text style={[styles.recordDetailValue, { color: '#EF4444' }]}>
              -${record.cash_advance_deduction.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {record.has_corrections && (
        <View style={styles.correctionBadge}>
          <Ionicons name="warning" size={14} color="#F59E0B" />
          <Text style={styles.correctionBadgeText}>Corrected</Text>
        </View>
      )}

      {currentStep === 'preview' && (
        <TouchableOpacity
          style={styles.correctButton}
          onPress={() => handleOpenCorrectionModal(record)}
        >
          <Ionicons name="create" size={16} color="#3B82F6" />
          <Text style={styles.correctButtonText}>Make Correction</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPreviewStep = () => (
    <View style={styles.section}>
      {renderSummary()}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search employees..."
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Employee Records */}
      <Text style={styles.sectionTitle}>
        Employee Records ({filteredRecords.length})
      </Text>
      {filteredRecords.map(renderEmployeeRecord)}

      {/* Actions */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleApprovePayroll}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Approve Payroll</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderApprovedStep = () => (
    <View style={styles.section}>
      {renderSummary()}

      <View style={styles.statusCard}>
        <Ionicons name="checkmark-circle" size={48} color="#10B981" />
        <Text style={styles.statusTitle}>Payroll Approved</Text>
        <Text style={styles.statusText}>
          Payroll has been approved and is ready for payment processing.
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: '#8B5CF6' }]}
          onPress={handleGeneratePayslips}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="document-text" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Generate Payslips</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleMarkAsPaid}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="cash" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Mark as Paid</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaidStep = () => (
    <View style={styles.section}>
      {renderSummary()}

      <View style={styles.statusCard}>
        <Ionicons name="checkmark-done-circle" size={48} color="#10B981" />
        <Text style={styles.statusTitle}>Payroll Completed</Text>
        <Text style={styles.statusText}>
          All payments have been processed and cash advance deductions applied.
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="calculator" size={24} color="#1F2937" />
        <Text style={styles.headerTitle}>Payroll Processing</Text>
      </View>

      {renderStepIndicator()}

      {currentStep === 'setup' && renderSetupStep()}
      {currentStep === 'preview' && renderPreviewStep()}
      {currentStep === 'approved' && renderApprovedStep()}
      {currentStep === 'paid' && renderPaidStep()}

      {/* Correction Modal */}
      <Modal
        visible={showCorrectionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCorrectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="create" size={32} color="#3B82F6" />
              <Text style={styles.modalTitle}>Make Correction</Text>
            </View>

            {selectedRecord && (
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  Correcting payroll for{' '}
                  <Text style={styles.modalTextBold}>{selectedRecord.employee_name}</Text>
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Field to Correct *</Text>
                  <View style={styles.methodButtons}>
                    <TouchableOpacity
                      style={[
                        styles.methodButton,
                        correctionField === 'gross_pay' && styles.methodButtonActive,
                      ]}
                      onPress={() => setCorrectionField('gross_pay')}
                    >
                      <Text
                        style={[
                          styles.methodButtonText,
                          correctionField === 'gross_pay' && styles.methodButtonTextActive,
                        ]}
                      >
                        Gross Pay
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.methodButton,
                        correctionField === 'net_pay' && styles.methodButtonActive,
                      ]}
                      onPress={() => setCorrectionField('net_pay')}
                    >
                      <Text
                        style={[
                          styles.methodButtonText,
                          correctionField === 'net_pay' && styles.methodButtonTextActive,
                        ]}
                      >
                        Net Pay
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Value ($) *</Text>
                  <TextInput
                    style={styles.input}
                    value={correctionValue}
                    onChangeText={setCorrectionValue}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Reason *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={correctionReason}
                    onChangeText={setCorrectionReason}
                    placeholder="Detailed reason for correction (minimum 10 characters)..."
                    multiline
                    numberOfLines={4}
                  />
                  <Text style={styles.helpText}>
                    {correctionReason.length}/10 characters minimum
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowCorrectionModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSubmitCorrection}
              >
                <Text style={styles.modalButtonTextPrimary}>Apply Correction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer} />
    </ScrollView>
  );
};

// Mock data generators (replace with actual data fetching)
const getMockEmployees = () => [
  {
    employee_id: 'EMP001',
    employee_name: 'John Driver',
    employee_role: 'driver' as const,
    compensation_config: {
      method: 'per_trip' as const,
      base_amount: 500,
      effective_from: '2024-01-01',
    },
  },
];

const getMockTrips = () => [];
const getMockAttendance = () => [];
const getMockDestinationRates = () => [];
const getMockAllowances = () => [];
const getMockBonuses = () => [];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#3B82F6',
  },
  stepLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  stepLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E5E7EB',
    zIndex: -1,
  },
  stepLineActive: {
    backgroundColor: '#3B82F6',
  },

  // Section
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },

  // Inputs
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
    backgroundColor: '#FFFFFF',
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

  // Buttons
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Period Card
  periodCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  periodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
    marginLeft: 8,
  },
  periodText: {
    fontSize: 14,
    color: '#1F2937',
  },
  periodSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryDetailText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 6,
    flex: 1,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },

  // Record Card
  recordCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  recordRole: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  recordAmounts: {
    alignItems: 'flex-end',
  },
  recordGross: {
    fontSize: 14,
    color: '#6B7280',
  },
  recordNet: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 2,
  },
  recordDetails: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 6,
  },
  recordDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  recordDetailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  recordDetailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },
  correctionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  correctionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 4,
  },
  correctButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  correctButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 6,
  },

  // Status Card
  statusCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },

  // Action Buttons
  actionButtons: {
    gap: 12,
    marginTop: 16,
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
    marginBottom: 16,
  },
  modalTextBold: {
    fontWeight: '600',
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
