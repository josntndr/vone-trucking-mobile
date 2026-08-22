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
        return { maxWidth: 320 };
      case 'md':
        return { maxWidth: 480 };
      case 'lg':
        return { maxWidth: 640 };
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
              backgroundColor: theme.colors.surface.elevated,
              borderRadius: size === 'full' ? 0 : theme.borderRadius.lg,
              ...theme.shadows.xl,
            },
            getModalWidth(),
            containerStyle,
          ]}
        >
          {title && (
            <View
              style={[
                styles.header,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border.light,
                  padding: theme.spacing[4],
                },
              ]}
            >
              <Text
                style={[
                  styles.title,
                  {
                    color: theme.colors.text.primary,
                    fontSize: theme.fontSizes['2xl'],
                    fontWeight: theme.fontWeights.semibold,
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
                  <Text
                    style={{
                      color: theme.colors.text.secondary,
                      fontSize: theme.fontSizes.xl,
                    }}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <ScrollView
            style={[styles.content, { padding: theme.spacing[4] }]}
            showsVerticalScrollIndicator={true}
          >
            {children}
          </ScrollView>

          {footer && (
            <View
              style={[
                styles.footer,
                {
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.border.light,
                  padding: theme.spacing[4],
                },
              ]}
            >
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
  },
  closeButton: {
    marginLeft: 16,
  },
  content: {
    flexGrow: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
