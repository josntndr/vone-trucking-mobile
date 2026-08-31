/**
 * Result Modal
 * Shows success/error after report generation or data export
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, DESIGN_SYSTEM } from '../../theme/designSystem';

interface ResultModalProps {
  visible: boolean;
  type: 'success' | 'error' | 'loading';
  title: string;
  message: string;
  filename?: string;
  recordCount?: number;
  onClose: () => void;
  onShare?: () => void;
  onRetry?: () => void;
  shareLabel?: string;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  visible,
  type,
  title,
  message,
  filename,
  recordCount,
  onClose,
  onShare,
  onRetry,
  shareLabel = 'Share',
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={type !== 'loading' ? onClose : undefined}
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          Platform.OS === 'web' && styles.modalContainerWeb
        ]}>
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              type === 'success' && styles.iconContainerSuccess,
              type === 'error' && styles.iconContainerError,
            ]}
          >
            {type === 'loading' && <ActivityIndicator size="large" color={COLORS.navy} />}
            {type === 'success' && <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />}
            {type === 'error' && <Ionicons name="alert-circle" size={64} color={COLORS.error} />}
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* File Details */}
          {type === 'success' && filename && (
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Ionicons name="document-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.detailLabel}>Filename:</Text>
              </View>
              <Text style={styles.detailValue}>{filename}</Text>

              {recordCount !== undefined && (
                <>
                  <View style={[styles.detailRow, { marginTop: SPACING.sm }]}>
                    <Ionicons name="list-outline" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.detailLabel}>Records:</Text>
                  </View>
                  <Text style={styles.detailValue}>{recordCount.toLocaleString()}</Text>
                </>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {type === 'success' && onShare && (
              <TouchableOpacity
                style={styles.shareButton}
                onPress={onShare}
                accessibilityRole="button"
                accessibilityLabel={shareLabel}
              >
                <Ionicons name="share-outline" size={20} color={COLORS.white} />
                <Text style={styles.shareButtonText}>{shareLabel}</Text>
              </TouchableOpacity>
            )}

            {type === 'error' && onRetry && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={onRetry}
                accessibilityRole="button"
                accessibilityLabel="Retry"
              >
                <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}

            {type !== 'loading' && (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  type === 'success' && onShare && styles.closeButtonSecondary,
                ]}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text
                  style={[
                    styles.closeButtonText,
                    type === 'success' && onShare && styles.closeButtonTextSecondary,
                  ]}
                >
                  Close
                </Text>
              </TouchableOpacity>
            )}
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
    paddingHorizontal: SPACING.md,
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 390,
    alignItems: 'center',
  },
  modalContainerWeb: {
    maxWidth: 390,
    borderRadius: 24,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  iconContainerSuccess: {
    // No additional styles needed
  },
  iconContainerError: {
    // No additional styles needed
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  detailsCard: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: SPACING.sm,
    width: '100%',
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    gap: SPACING.sm,
  },
  shareButton: {
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
  shareButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  retryButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    minHeight: 48,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  closeButtonSecondary: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButtonTextSecondary: {
    color: '#F8FAFC',
  },
});
