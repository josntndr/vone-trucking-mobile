/**
 * ConfirmDialog Component
 * Modern confirmation modal for destructive and confirmation actions
 */

import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal, ModalProps } from './Modal';

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
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>{cancelLabel}</Text>
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
            isDestructive ? styles.destructiveIconCircle : styles.infoIconCircle,
          ]}
        >
          <Ionicons
            name={isDestructive ? 'log-out-outline' : 'help-circle-outline'}
            size={28}
            color={isDestructive ? '#EF4444' : '#0EA5E9'}
          />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
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
  destructiveIconCircle: {
    backgroundColor: '#FEE2E2',
  },
  infoIconCircle: {
    backgroundColor: '#F0F9FF',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1E36',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
  },
  primaryButton: {
    backgroundColor: '#0F1E36',
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
