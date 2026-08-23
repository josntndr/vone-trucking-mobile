/**
 * ConfirmDialog Component
 * Confirmation modal for destructive actions
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks';
import { Modal, ModalProps } from './Modal';
import { Button } from './Button';

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
  const theme = useTheme();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      closeOnBackdropPress={!loading}
      footer={
        <View style={styles.footer}>
          <Button
            variant="ghost"
            onPress={onClose}
            disabled={loading}
            style={{ flex: 1 }}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            onPress={handleConfirm}
            loading={loading}
            style={{ flex: 1 }}
          >
            {confirmLabel}
          </Button>
        </View>
      }
      {...props}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.fontSizes.base,
          lineHeight: theme.lineHeights.normal * theme.fontSizes.base,
        }}
      >
        {message}
      </Text>
    </Modal>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});
