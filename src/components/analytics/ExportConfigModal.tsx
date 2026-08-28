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
              <Ionicons name="close" size={24} color={COLORS.text} />
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
                <Ionicons name="calendar-outline" size={20} color={COLORS.navy} />
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
                      color={selectedFormat === format.value ? COLORS.navy : COLORS.textSecondary}
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
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.navy} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    ...(Platform.OS === 'web' && {
      alignItems: 'center',
    }),
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    ...(Platform.OS === 'web' && {
      width: '100%',
    }),
  },
  modalContainerWeb: {
    maxWidth: 430,
    borderRadius: 20,
    maxHeight: '85vh',
    marginVertical: 'auto',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
    color: COLORS.navy,
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
    fontSize: 12,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.bold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
  },
  radioOption: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    minHeight: 60,
  },
  radioOptionSelected: {
    borderColor: COLORS.navy,
    backgroundColor: COLORS.navy + '08',
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
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: COLORS.navy,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.navy,
  },
  radioText: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    minHeight: 56,
  },
  formatOptionSelected: {
    borderColor: COLORS.navy,
    backgroundColor: COLORS.navy + '08',
  },
  formatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  formatLabel: {
    fontSize: 14,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
    color: COLORS.text,
  },
  formatLabelSelected: {
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
    color: COLORS.navy,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
    color: COLORS.navy,
  },
  exportButton: {
    flex: 2,
    backgroundColor: COLORS.navy,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    minHeight: 48,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
    color: COLORS.white,
  },
});

