/**
 * Universal Modal Component
 * Portal-powered modal dialog & bottom sheet that strictly stays INSIDE
 * the mobile application container (including web simulator & native)
 */

import React, { useEffect, useId, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  Keyboard,
  BackHandler,
  Platform,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePortal } from '../../contexts/PortalContext';
import { useThemeContext } from '../../contexts/ThemeContext';

export interface ModalProps {
  isOpen?: boolean;
  visible?: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
  containerStyle?: ViewStyle;
  maxHeight?: number | string;
  onRequestClose?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  visible,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropPress = true,
  containerStyle,
  maxHeight = '85%',
  onRequestClose,
}) => {
  const isModalOpen = Boolean(isOpen ?? visible);
  const portal = usePortal();
  const portalId = useId();
  const { isDarkMode } = useThemeContext();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;

  const handleClose = () => {
    Keyboard.dismiss();
    if (onRequestClose) {
      onRequestClose();
    }
    onClose();
  };

  // Hardware back button support
  useEffect(() => {
    if (!isModalOpen) return;

    const onBackPress = () => {
      handleClose();
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [isModalOpen]);

  // Animated in/out
  useEffect(() => {
    if (isModalOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 9,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 60,
          duration: 150,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isModalOpen]);

  // Register in PortalProvider
  useEffect(() => {
    if (isModalOpen) {
      portal.registerPortal(portalId, renderOverlay());
    } else {
      portal.unregisterPortal(portalId);
    }

    return () => {
      portal.unregisterPortal(portalId);
    };
  }, [isModalOpen, title, children, footer, size, isDarkMode, containerStyle]);

  const renderOverlay = () => (
    <View style={styles.portalHost} pointerEvents="box-none">
      {/* Dimmed Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {
            if (closeOnBackdropPress) {
              handleClose();
            }
          }}
        />
      </Animated.View>

      {/* Modal / Bottom Sheet Container */}
      <Animated.View
        style={[
          styles.sheetContainer,
          {
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            borderColor: isDarkMode ? '#334155' : '#E2E8F0',
            maxHeight: maxHeight as any,
            transform: [{ translateY: slideAnim }],
          },
          containerStyle,
        ]}
      >
        {/* Drag Handle Bar */}
        <View style={styles.handleContainer}>
          <View style={[styles.handleBar, { backgroundColor: isDarkMode ? '#475569' : '#CBD5E1' }]} />
        </View>

        {/* Modal Header */}
        {(title || showCloseButton) && (
          <View
            style={[
              styles.header,
              {
                borderBottomColor: isDarkMode ? '#334155' : '#E2E8F0',
              },
            ]}
          >
            <Text
              style={[
                styles.titleText,
                { color: isDarkMode ? '#F8FAFC' : '#0F172A' },
              ]}
              numberOfLines={1}
            >
              {title || ''}
            </Text>

            {showCloseButton && (
              <TouchableOpacity
                onPress={handleClose}
                style={[
                  styles.closeButton,
                  { backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9' },
                ]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close"
                  size={18}
                  color={isDarkMode ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Modal Body */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>

        {/* Modal Footer */}
        {footer && (
          <View
            style={[
              styles.footer,
              { borderTopColor: isDarkMode ? '#334155' : '#E2E8F0' },
            ]}
          >
            {footer}
          </View>
        )}
      </Animated.View>
    </View>
  );

  return null;
};

export default Modal;

const styles = StyleSheet.create({
  portalHost: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  sheetContainer: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 10000,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  content: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
});
