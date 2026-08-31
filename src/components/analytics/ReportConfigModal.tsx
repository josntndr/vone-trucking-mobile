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

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
        disabled={generating}
      />
      <View style={styles.modalContainer}>
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
            <Ionicons name="close" size={24} color="#F8FAFC" />
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
                <Ionicons name="calendar-outline" size={20} color="#0EA5E9" />
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
                    trackColor={{ false: '#334155', true: 'rgba(14, 165, 233, 0.4)' }}
                    thumbColor={section.included ? '#0EA5E9' : '#64748B'}
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
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    maxWidth: 380,
    maxHeight: '88%',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
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
    minHeight: 64,
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    minHeight: 48,
  },
  switchLabel: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
    flex: 1,
  },
  switchLabelDisabled: {
    color: '#64748B',
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
  generateButton: {
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
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

