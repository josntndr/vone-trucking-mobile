/**
 * Payslip Viewer Card Component (Employee)
 * 
 * Employee interface for viewing detailed payslips with earnings breakdown,
 * deductions breakdown, net pay, YTD totals, cash advance information,
 * and PDF export capability.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Payslip, PayrollRecord } from '../../types/payroll.types';
import { payrollProcessingService } from '../../services/payroll/PayrollProcessingService';

interface PayslipViewerCardProps {
  employeeId: string;
  payslipId?: string; // Optional: if provided, show specific payslip
  onPayslipSelected?: (payslip: Payslip) => void;
}

export const PayslipViewerCard: React.FC<PayslipViewerCardProps> = ({
  employeeId,
  payslipId,
  onPayslipSelected,
}) => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayslips();
  }, []);

  useEffect(() => {
    if (payslipId && payslips.length > 0) {
      const payslip = payslips.find(p => p.id === payslipId);
      if (payslip) {
        handleSelectPayslip(payslip);
      }
    }
  }, [payslipId, payslips]);

  const loadPayslips = async () => {
    try {
      setIsLoading(true);
      // Load all payroll records for employee
      const allRecords = await payrollProcessingService['getAllRecords']();
      const employeeRecords = allRecords
        .filter(r => r.employee_id === employeeId && r.status === 'paid')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Generate payslips from records (mock - in production, fetch actual payslips)
      const generatedPayslips: Payslip[] = [];
      for (const record of employeeRecords) {
        const period = await payrollProcessingService['getPeriod'](record.payroll_period_id);
        if (period) {
          const payslip: Payslip = {
            id: `payslip_${record.id}`,
            payroll_record_id: record.id,
            payroll_period_id: record.payroll_period_id,
            employee_id: record.employee_id,
            employee_name: record.employee_name,
            employee_number: record.employee_id,
            employee_role: record.employee_role,
            period_start: period.period_start,
            period_end: period.period_end,
            pay_date: period.pay_date,
            earnings_summary: record.earnings.map(e => ({
              description: e.description,
              details: e.calculation_notes,
              amount: e.amount,
            })),
            gross_pay: record.gross_pay,
            deductions_summary: record.deductions.map(d => ({
              description: d.description,
              details: d.calculation_notes,
              amount: d.amount,
            })),
            total_deductions: record.total_deductions,
            net_pay: record.net_pay,
            ytd_gross: record.gross_pay, // Mock - should calculate actual YTD
            ytd_deductions: record.total_deductions,
            ytd_net: record.net_pay,
            cash_advance_deduction: record.cash_advance_deduction,
            cash_advance_balance: record.cash_advance_balance_after,
            generated_at: new Date().toISOString(),
            generated_by: 'system',
          };
          generatedPayslips.push(payslip);
        }
      }

      setPayslips(generatedPayslips);

      // Auto-select most recent if no specific payslip requested
      if (!payslipId && generatedPayslips.length > 0) {
        handleSelectPayslip(generatedPayslips[0]);
      }
    } catch (error) {
      console.error('Failed to load payslips:', error);
      Alert.alert('Error', 'Failed to load payslips');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPayslip = (payslip: Payslip) => {
    setSelectedPayslip(payslip);
    if (onPayslipSelected) onPayslipSelected(payslip);
  };

  const handleExportPDF = async () => {
    if (!selectedPayslip) return;

    // Mock PDF export - in production, generate actual PDF
    const payslipText = generatePayslipText(selectedPayslip);

    try {
      await Share.share({
        message: payslipText,
        title: `Payslip - ${new Date(selectedPayslip.pay_date).toLocaleDateString()}`,
      });
    } catch (error) {
      console.error('Failed to export payslip:', error);
      Alert.alert('Error', 'Failed to export payslip');
    }
  };

  const generatePayslipText = (payslip: Payslip): string => {
    return `
PAYSLIP
${payslip.employee_name} (${payslip.employee_number})

Pay Period: ${new Date(payslip.period_start).toLocaleDateString()} - ${new Date(payslip.period_end).toLocaleDateString()}
Pay Date: ${new Date(payslip.pay_date).toLocaleDateString()}

EARNINGS:
${payslip.earnings_summary.map(e => `${e.description}: $${e.amount.toFixed(2)}`).join('\n')}
Gross Pay: $${payslip.gross_pay.toFixed(2)}

DEDUCTIONS:
${payslip.deductions_summary.map(d => `${d.description}: $${d.amount.toFixed(2)}`).join('\n')}
Total Deductions: $${payslip.total_deductions.toFixed(2)}

NET PAY: $${payslip.net_pay.toFixed(2)}

YTD Summary:
Gross: $${payslip.ytd_gross.toFixed(2)}
Deductions: $${payslip.ytd_deductions.toFixed(2)}
Net: $${payslip.ytd_net.toFixed(2)}
    `.trim();
  };

  const renderPayslipSelector = () => {
    if (payslips.length === 0) return null;

    return (
      <View style={styles.selectorSection}>
        <Text style={styles.selectorTitle}>Select Pay Period</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
          {payslips.map((payslip) => {
            const isSelected = selectedPayslip?.id === payslip.id;
            return (
              <TouchableOpacity
                key={payslip.id}
                style={[styles.selectorCard, isSelected && styles.selectorCardActive]}
                onPress={() => handleSelectPayslip(payslip)}
              >
                <Text style={[styles.selectorDate, isSelected && styles.selectorDateActive]}>
                  {new Date(payslip.pay_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={[styles.selectorAmount, isSelected && styles.selectorAmountActive]}>
                  ${payslip.net_pay.toFixed(2)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderPayslipHeader = () => {
    if (!selectedPayslip) return null;

    return (
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.companyName}>Vone Trucking</Text>
            <Text style={styles.documentTitle}>PAYSLIP</Text>
          </View>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
            <Ionicons name="share-outline" size={20} color="#3B82F6" />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.headerInfoRow}>
            <Text style={styles.headerInfoLabel}>Employee:</Text>
            <Text style={styles.headerInfoValue}>
              {selectedPayslip.employee_name} ({selectedPayslip.employee_number})
            </Text>
          </View>
          <View style={styles.headerInfoRow}>
            <Text style={styles.headerInfoLabel}>Role:</Text>
            <Text style={styles.headerInfoValue}>{selectedPayslip.employee_role}</Text>
          </View>
          <View style={styles.headerInfoRow}>
            <Text style={styles.headerInfoLabel}>Pay Period:</Text>
            <Text style={styles.headerInfoValue}>
              {new Date(selectedPayslip.period_start).toLocaleDateString()} -{' '}
              {new Date(selectedPayslip.period_end).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.headerInfoRow}>
            <Text style={styles.headerInfoLabel}>Pay Date:</Text>
            <Text style={styles.headerInfoValue}>
              {new Date(selectedPayslip.pay_date).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEarningsBreakdown = () => {
    if (!selectedPayslip) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trending-up" size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
        </View>

        {selectedPayslip.earnings_summary.map((earning, index) => (
          <View key={index} style={styles.lineItem}>
            <View style={styles.lineItemLeft}>
              <Text style={styles.lineItemDescription}>{earning.description}</Text>
              {earning.details && (
                <Text style={styles.lineItemDetails}>{earning.details}</Text>
              )}
            </View>
            <Text style={styles.lineItemAmount}>${earning.amount.toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Gross Pay</Text>
          <Text style={styles.totalAmount}>${selectedPayslip.gross_pay.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  const renderDeductionsBreakdown = () => {
    if (!selectedPayslip) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trending-down" size={20} color="#EF4444" />
          <Text style={styles.sectionTitle}>Deductions Breakdown</Text>
        </View>

        {selectedPayslip.deductions_summary.map((deduction, index) => (
          <View key={index} style={styles.lineItem}>
            <View style={styles.lineItemLeft}>
              <Text style={styles.lineItemDescription}>{deduction.description}</Text>
              {deduction.details && (
                <Text style={styles.lineItemDetails}>{deduction.details}</Text>
              )}
            </View>
            <Text style={[styles.lineItemAmount, { color: '#EF4444' }]}>
              -${deduction.amount.toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Deductions</Text>
          <Text style={[styles.totalAmount, { color: '#EF4444' }]}>
            -${selectedPayslip.total_deductions.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderNetPay = () => {
    if (!selectedPayslip) return null;

    return (
      <View style={styles.netPaySection}>
        <View style={styles.netPayCard}>
          <Text style={styles.netPayLabel}>NET PAY</Text>
          <Text style={styles.netPayAmount}>${selectedPayslip.net_pay.toFixed(2)}</Text>
          <Text style={styles.netPaySubtext}>
            Amount deposited to your account
          </Text>
        </View>
      </View>
    );
  };

  const renderCashAdvanceInfo = () => {
    if (!selectedPayslip || selectedPayslip.cash_advance_deduction === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="wallet" size={20} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Cash Advance Information</Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={styles.lineItemDescription}>Deduction This Period</Text>
          <Text style={[styles.lineItemAmount, { color: '#EF4444' }]}>
            -${selectedPayslip.cash_advance_deduction.toFixed(2)}
          </Text>
        </View>

        <View style={styles.lineItem}>
          <Text style={styles.lineItemDescription}>Remaining Balance</Text>
          <Text style={styles.lineItemAmount}>
            ${selectedPayslip.cash_advance_balance.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderYTDSummary = () => {
    if (!selectedPayslip) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Year-to-Date Summary</Text>
        </View>

        <View style={styles.ytdGrid}>
          <View style={styles.ytdItem}>
            <Text style={styles.ytdLabel}>YTD Gross Pay</Text>
            <Text style={styles.ytdValue}>${selectedPayslip.ytd_gross.toFixed(2)}</Text>
          </View>
          <View style={styles.ytdItem}>
            <Text style={styles.ytdLabel}>YTD Deductions</Text>
            <Text style={[styles.ytdValue, { color: '#EF4444' }]}>
              ${selectedPayslip.ytd_deductions.toFixed(2)}
            </Text>
          </View>
          <View style={styles.ytdItem}>
            <Text style={styles.ytdLabel}>YTD Net Pay</Text>
            <Text style={[styles.ytdValue, { color: '#10B981' }]}>
              ${selectedPayslip.ytd_net.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!selectedPayslip) return null;

    return (
      <View style={styles.footerSection}>
        <Text style={styles.footerText}>
          Generated on {new Date(selectedPayslip.generated_at).toLocaleDateString()}
        </Text>
        <Text style={styles.footerText}>
          This is a computer-generated payslip and does not require a signature.
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-text" size={64} color="#D1D5DB" />
        <Text style={styles.loadingText}>Loading payslips...</Text>
      </View>
    );
  }

  if (payslips.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No Payslips Available</Text>
        <Text style={styles.emptyText}>
          Your payslips will appear here once payroll has been processed
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {renderPayslipSelector()}
      
      {selectedPayslip && (
        <View style={styles.payslipContainer}>
          {renderPayslipHeader()}
          {renderEarningsBreakdown()}
          {renderDeductionsBreakdown()}
          {renderNetPay()}
          {renderCashAdvanceInfo()}
          {renderYTDSummary()}
          {renderFooter()}
        </View>
      )}

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

  // Selector
  selectorSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  selectorScroll: {
    flexDirection: 'row',
  },
  selectorCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectorCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  selectorDate: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  selectorDateActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  selectorAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectorAmountActive: {
    color: '#1E40AF',
  },

  // Payslip Container
  payslipContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },

  // Header
  headerSection: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  exportButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
    marginLeft: 6,
  },
  headerInfo: {
    gap: 8,
  },
  headerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerInfoLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  headerInfoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F2937',
  },

  // Section
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },

  // Line Item
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  lineItemLeft: {
    flex: 1,
    marginRight: 16,
  },
  lineItemDescription: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  lineItemDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  lineItemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Total Row
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Net Pay
  netPaySection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  netPayCard: {
    backgroundColor: '#ECFDF5',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  netPayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  netPayAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  netPaySubtext: {
    fontSize: 12,
    color: '#059669',
  },

  // YTD Summary
  ytdGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ytdItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 6,
  },
  ytdLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  ytdValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Footer
  footerSection: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },

  footer: {
    height: 24,
  },
});
