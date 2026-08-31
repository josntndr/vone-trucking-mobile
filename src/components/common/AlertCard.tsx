/**
 * AlertCard Component
 * Modern card for displaying urgent alerts and notifications
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

interface AlertCardProps {
  severity: AlertSeverity;
  title: string;
  message: string;
  onPress?: () => void;
  onDismiss?: () => void;
  style?: ViewStyle;
}

export default function AlertCard({
  severity,
  title,
  message,
  onPress,
  onDismiss,
  style,
}: AlertCardProps) {
  const { spacing, shadows } = useTheme();

  const getSeverityConfig = () => {
    switch (severity) {
      case 'error':
        return {
          icon: 'alert-circle' as const,
          backgroundColor: '#FEF2F2',
          borderColor: '#FCA5A5',
          borderLeftColor: '#EF4444',
          iconColor: '#DC2626',
          titleColor: '#991B1B',
          textColor: '#7F1D1D',
        };
      case 'warning':
        return {
          icon: 'alert' as const,
          backgroundColor: '#FFFBEB',
          borderColor: '#FDE68A',
          borderLeftColor: '#F59E0B',
          iconColor: '#D97706',
          titleColor: '#92400E',
          textColor: '#78350F',
        };
      case 'success':
        return {
          icon: 'check-circle' as const,
          backgroundColor: '#ECFDF5',
          borderColor: '#A7F3D0',
          borderLeftColor: '#10B981',
          iconColor: '#059669',
          titleColor: '#065F46',
          textColor: '#047857',
        };
      case 'info':
      default:
        return {
          icon: 'information' as const,
          backgroundColor: '#F0F9FF',
          borderColor: '#BAE6FD',
          borderLeftColor: '#0EA5E9',
          iconColor: '#0284C7',
          titleColor: '#075985',
          textColor: '#0369A1',
        };
    }
  };

  const config = getSeverityConfig();
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderLeftColor: config.borderLeftColor,
          borderColor: config.borderColor,
          ...shadows.sm,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
    >
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: config.backgroundColor }]}>
          <MaterialCommunityIcons
            name={config.icon}
            size={22}
            color={config.iconColor}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              {
                color: config.titleColor,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.message,
              {
                color: config.textColor,
              },
            ]}
          >
            {message}
          </Text>
        </View>

        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            style={styles.closeBtn}
          >
            <MaterialCommunityIcons
              name="close"
              size={18}
              color={config.iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    marginTop: 1,
  },
  textContainer: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  closeBtn: {
    padding: 2,
  },
});

