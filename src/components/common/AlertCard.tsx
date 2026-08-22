/**
 * AlertCard Component
 * Card for displaying urgent alerts and notifications
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
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getSeverityConfig = () => {
    switch (severity) {
      case 'error':
        return {
          icon: 'alert-circle' as const,
          backgroundColor: colors.error + '15',
          borderColor: colors.error,
          iconColor: colors.errorDark,
          textColor: colors.errorDark,
        };
      case 'warning':
        return {
          icon: 'alert' as const,
          backgroundColor: colors.warning + '15',
          borderColor: colors.warning,
          iconColor: colors.warningDark,
          textColor: colors.warningDark,
        };
      case 'success':
        return {
          icon: 'check-circle' as const,
          backgroundColor: colors.success + '15',
          borderColor: colors.success,
          iconColor: colors.successDark,
          textColor: colors.successDark,
        };
      case 'info':
      default:
        return {
          icon: 'information' as const,
          backgroundColor: colors.info + '15',
          borderColor: colors.info,
          iconColor: colors.infoDark,
          textColor: colors.infoDark,
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
          borderLeftColor: config.borderColor,
          borderRadius: borderRadius.base,
          padding: spacing[3],
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons
          name={config.icon}
          size={24}
          color={config.iconColor}
        />
        
        <View style={[styles.textContainer, { marginLeft: spacing[3] }]}>
          <Text
            style={[
              styles.title,
              {
                color: config.textColor,
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
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
                fontSize: typography.fontSize.sm,
                marginTop: spacing[1],
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
            style={{ marginLeft: spacing[2] }}
          >
            <MaterialCommunityIcons
              name="close"
              size={20}
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
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  title: {},
  message: {
    lineHeight: 20,
  },
});
