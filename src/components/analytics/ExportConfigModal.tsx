// @ts-nocheck
/**
 * Export Configuration Modal
 * Allows operators to configure data export settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, DESIGN_SYSTEM } from '../../theme/designSystem';
import { ExportDataset, ExportFormat } from '../../types/reporting.types';

interface ExportConfigModalProps {
  visible: boolean;
  dateRangeLabel: string;
  onClose: () => void;
  onExport: (dataset: ExportDataset, format: ExportFormat) => Promise<void>;
}

const DATASETS: { value: ExportDataset; label: string; description: string }[] = [
  {
    value: 'analytics_summary',
    label: 'Analytics Summary',
    description: 'Key metrics and performance indicators',
  },
  {
    value: 'trip_records',
    label: 'Trip Records',
    description: 'Detailed trip information and status',
  },
  {
    value: 'financial_data',
    label: 'Financial Data',
    description: 'Revenue, expenses, and profit breakdown',
  },
  {
    value: 'fleet_performance',
    label: 'Fleet Performance',
    description: 'Truck utilization and efficiency metrics',
  },
  {
    value: 'employee_performance',
    label: 'Driver and Helper Performance',
    description: 'Employee productivity and ratings',
  },
  {
    value: 'all_data',
    label: 'All Available Analytics Data',
    description: 'Complete dataset with all metrics',
  },
];

const FORMATS: { value: ExportFormat; label: string; icon: string }[] = [
  {
    value: 'csv',
    label: 'CSV (Comma-Separated Values)',
    icon: 'document-text-outline',
  },
  {
    value: 'xlsx',
    label: 'Excel (XLSX)',
    icon: 'grid-outline',
  },
];

export const ExportConfigModal: React.FC<ExportConfigModalProps> = ({
  visible,
  dateRangeLabel,
  onClose,
  onExport,
}) => {
  const [selectedDataset, setSelectedDataset] = useState<ExportDataset>('trip_records');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      await onExport(selectedDataset, selectedFormat);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'overFullScreen'}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          Platform.OS === 'web' && styles.modalContainerWeb
        ]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Export Data</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              disabled={exporting}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={24} color="#F8FAFC" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Date Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SELECTED DATE RANGE</Text>
              <View style={styles.infoBox}>
                <Ionicons name="calendar-outline" size={20} color="#0EA5E9" />
                <Text style={styles.infoText}>{dateRangeLabel}</Text>
              </View>
            </View>

            {/* Dataset Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DATASET</Text>
              {DATASETS.map(dataset => (
                <TouchableOpacity
                  key={dataset.value}
                  style={[
                    styles.radioOption,
                    selectedDataset === dataset.value && styles.radioOptionSelected,
                  ]}
                  onPress={() => setSelectedDataset(dataset.value)}
                  disabled={exporting}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedDataset === dataset.value }}
                >
                  <View style={styles.radioContent}>
                    <View
                      style={[
                        styles.radioCircle,
                        selectedDataset === dataset.value && styles.radioCircleSelected,
                      ]}
                    >
                      {selectedDataset === dataset.value && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.radioText}>
                      <Text style={styles.radioLabel}>{dataset.label}</Text>
                      <Text style={styles.radioDescription}>{dataset.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Format Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FILE FORMAT</Text>
              {FORMATS.map(format => (
                <TouchableOpacity
                  key={format.value}
                  style={[
                    styles.formatOption,
                    selectedFormat === format.value && styles.formatOptionSelected,
                  ]}
                  onPress={() => setSelectedFormat(format.value)}
                  disabled={exporting}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedFormat === format.value }}
                >
                  <View style={styles.formatContent}>
                    <Ionicons
                      name={format.icon as any}
                      size={24}
                      color={selectedFormat === format.value ? '#0EA5E9' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.formatLabel,
                        selectedFormat === format.value && styles.formatLabelSelected,
                      ]}
                    >
                      {format.label}
                    </Text>
                  </View>
                  {selectedFormat === format.value && (
                    <Ionicons name="checkmark-circle" size={24} color="#0EA5E9" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={exporting}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.exportButton,
                exporting && styles.exportButtonDisabled,
              ]}
              onPress={handleExport}
              disabled={exporting}
              accessibilityRole="button"
              accessibilityLabel="Export analytics data"
              accessibilityHint="Exports selected data in chosen format"
            >
              {exporting ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Ionicons name="download" size={20} color={COLORS.white} />
                  <Text style={styles.exportButtonText}>Export Data</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    maxWidth: 390,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  modalContainerWeb: {
    maxWidth: 390,
    borderRadius: 24,
    maxHeight: '88vh',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    backgroundColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  section: {
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    padding: SPACING.sm,
    borderRadius: 10,
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  radioOption: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    minHeight: 60,
  },
  radioOptionSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: '#0EA5E9',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0EA5E9',
  },
  radioText: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    minHeight: 56,
  },
  formatOptionSelected: {
    borderColor: '#0EA5E9',
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
  },
  formatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  formatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  formatLabelSelected: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#1E293B',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  exportButton: {
    flex: 2,
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    minHeight: 48,
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

