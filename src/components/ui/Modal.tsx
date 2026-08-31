// @ts-nocheck
/**
 * Modal Component
 * Accessible modal dialog with backdrop
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ModalProps as RNModalProps,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../hooks';
import { Button } from './Button';

export interface ModalProps extends Omit<RNModalProps, 'children'> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  containerStyle?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropPress = true,
  containerStyle,
  ...props
}) => {
  const theme = useTheme();

  const getModalWidth = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { maxWidth: 340 };
      case 'md':
        return { maxWidth: 460 };
      case 'lg':
        return { maxWidth: 600 };
      case 'full':
        return { width: '100%', height: '100%', maxWidth: '100%' };
      default:
        return {};
    }
  };

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={isOpen}
      transparent={size !== 'full'}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      {...props}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />

        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: '#FFFFFF',
              borderRadius: size === 'full' ? 0 : 20,
            },
            getModalWidth(),
            containerStyle,
          ]}
        >
          {title && (
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.colors.text || '#0F1E36',
                    fontSize: 18,
                    fontWeight: '800',
                  },
                ]}
              >
                {title}
              </Text>
              {showCloseButton && (
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeButton}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {footer && (
            <View style={styles.footer}>
              {footer}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  backdropTouchable: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 10000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1E36',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
    width: '100%',
  },
});

