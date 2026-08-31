/**
 * ConfirmDialog Component
 * Modern confirmation modal for destructive and confirmation actions
 * Theme-aware with high contrast dark mode support
 */

import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal, ModalProps } from './Modal';
import { useThemeContext } from '../../contexts/ThemeContext';

export interface ConfirmDialogProps extends Omit<ModalProps, 'children' | 'footer'> {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  isDestructive = false,
  loading = false,
  ...props
}) => {
  const { isDarkMode } = useThemeContext();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdropPress={!loading}
      showCloseButton={false}
      footer={
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
                borderColor: isDarkMode ? '#475569' : '#E2E8F0',
                borderWidth: 1,
              },
            ]}
            onPress={onClose}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.cancelButtonText,
                { color: isDarkMode ? '#F8FAFC' : '#475569' },
              ]}
            >
              {cancelLabel}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              isDestructive ? styles.destructiveButton : styles.primaryButton,
            ]}
            onPress={onConfirm}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      }
      {...props}
    >
      <View style={styles.contentWrapper}>
        <View
          style={[
            styles.iconCircle,
            isDestructive
              ? { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.18)' : '#FEE2E2' }
              : { backgroundColor: isDarkMode ? 'rgba(14, 165, 233, 0.18)' : '#F0F9FF' },
          ]}
        >
          <Ionicons
            name={isDestructive ? 'log-out-outline' : 'help-circle-outline'}
            size={28}
            color={isDestructive ? '#EF4444' : '#0EA5E9'}
          />
        </View>

        <Text
          style={[
            styles.title,
            { color: isDarkMode ? '#F8FAFC' : '#0F1E36' },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            styles.message,
            { color: isDarkMode ? '#94A3B8' : '#64748B' },
          ]}
        >
          {message}
        </Text>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#0EA5E9',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
