/**
 * EmptyStateCard Component
 * Professional empty state with icon, title, description, and optional action
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import Button from '../ui/Button';

interface EmptyStateCardProps {
  icon?: ReactNode;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

export default function EmptyStateCard({
  icon,
  iconName = 'information-outline',
  title,
  description,
  actionLabel,
  onActionPress,
  style,
}: EmptyStateCardProps) {
  const { colors, fontSizes, fontWeights, lineHeights, spacing, borderRadius  } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceElevated,
          borderRadius: borderRadius.md,
          padding: spacing[8],
        },
        style,
      ]}
    >
      {/* Icon */}
      <View style={styles.iconContainer}>
        {icon || (
          <MaterialCommunityIcons
            name={iconName}
            size={64}
            color={colors.textTertiary}
          />
        )}
      </View>

      {/* Title */}
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.semibold,
            marginTop: spacing[4],
          },
        ]}
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
            fontSize: fontSizes.base,
            marginTop: spacing[2],
          },
        ]}
      >
        {description}
      </Text>

      {/* Action Button */}
      {actionLabel && onActionPress && (
        <View style={{ marginTop: spacing[6] }}>
          <Button
            onPress={onActionPress}
            variant="primary"
            size="md"
          >
            {actionLabel}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
