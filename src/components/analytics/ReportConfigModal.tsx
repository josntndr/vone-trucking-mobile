// @ts-nocheck
/**
 * Report Configuration Modal
 * Allows operators to configure report settings before generation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, DESIGN_SYSTEM } from '../../theme/designSystem';
import { ReportType, ReportSection } from '../../types/reporting.types';

interface ReportConfigModalProps {
  visible: boolean;
  dateRangeLabel: string;
  onClose: () => void;
  onGenerate: (reportType: ReportType, sections: ReportSection[]) => Promise<void>;
}

const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  {
    value: 'analytics_summary',
    label: 'Analytics Summary',
    description: 'High-level overview of operations and performance',
  },
  {
    value: 'detailed_operations',
    label: 'Detailed Operations Report',
    description: 'Comprehensive trip and operational details',
  },
  {
    value: 'financial',
    label: 'Financial Report',
    description: 'Revenue, expenses, and profit analysis',
  },
  {
    value: 'fleet_performance',
    label: 'Fleet Performance Report',
    description: 'Truck utilization and driver performance',
  },
];

const DEFAULT_SECTIONS: ReportSection[] = [
  { id: 'overview', label: 'Executive Summary', included: true, available: true },
  { id: 'trip_stats', label: 'Trip Statistics', included: true, available: true },
  { id: 'performance', label: 'Performance Metrics', included: true, available: true },
  { id: 'financial', label: 'Financial Summary', included: true, available: true },
  { id: 'fleet', label: 'Fleet Utilization', included: true, available: true },
  { id: 'trip_details', label: 'Detailed Trip Records', included: false, available: true },
];

export const ReportConfigModal: React.FC<ReportConfigModalProps> = ({
  visible,
  dateRangeLabel,
  onClose,
  onGenerate,
}) => {
  const [selectedType, setSelectedType] = useState<ReportType>('analytics_summary');
  const [sections, setSections] = useState<ReportSection[]>(DEFAULT_SECTIONS);
  const [generating, setGenerating] = useState(false);

  const toggleSection = (sectionId: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, included: !section.included }
          : section
      )
    );
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await onGenerate(selectedType, sections);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
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
            <Text style={styles.headerTitle}>Generate Report</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              disabled={generating}
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
              <Text style={styles.sectionTitle}>REPORTING PERIOD</Text>
              <View style={styles.infoBox}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.navy} />
                <Text style={styles.infoText}>{dateRangeLabel}</Text>
              </View>
            </View>

            {/* Report Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>REPORT TYPE</Text>
              {REPORT_TYPES.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.radioOption,
                    selectedType === type.value && styles.radioOptionSelected,
                  ]}
                  onPress={() => setSelectedType(type.value)}
                  disabled={generating}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedType === type.value }}
                >
                  <View style={styles.radioContent}>
                    <View
                      style={[
                        styles.radioCircle,
                        selectedType === type.value && styles.radioCircleSelected,
                      ]}
                    >
                      {selectedType === type.value && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <View style={styles.radioText}>
                      <Text style={styles.radioLabel}>{type.label}</Text>
                      <Text style={styles.radioDescription}>{type.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Report Sections */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>INCLUDE SECTIONS</Text>
              {sections.map(section => (
                <View key={section.id} style={styles.switchRow}>
                  <Text
                    style={[
                      styles.switchLabel,
                      !section.available && styles.switchLabelDisabled,
                    ]}
                  >
                    {section.label}
                  </Text>
                  <Switch
                    value={section.included}
                    onValueChange={() => toggleSection(section.id)}
                    disabled={!section.available || generating}
                    trackColor={{ false: COLORS.border, true: COLORS.navy + '40' }}
                    thumbColor={section.included ? COLORS.navy : COLORS.textTertiary}
                    accessibilityRole="switch"
                    accessibilityLabel={`Include ${section.label}`}
                    accessibilityState={{ checked: section.included }}
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={generating}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.generateButton,
                generating && styles.generateButtonDisabled,
              ]}
              onPress={handleGenerate}
              disabled={generating}
              accessibilityRole="button"
              accessibilityLabel="Generate PDF report"
              accessibilityHint="Creates a PDF report with selected options"
            >
              {generating ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Ionicons name="document-text" size={20} color={COLORS.white} />
                  <Text style={styles.generateButtonText}>Generate PDF</Text>
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
    minHeight: 64,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    minHeight: 48,
  },
  switchLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.medium,
    flex: 1,
  },
  switchLabelDisabled: {
    color: COLORS.textTertiary,
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
  generateButton: {
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
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: DESIGN_SYSTEM.typography.fontWeight.semibold,
    color: COLORS.white,
  },
});

