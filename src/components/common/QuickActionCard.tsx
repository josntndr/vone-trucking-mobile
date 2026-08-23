/**
 * QuickActionCard Component
 * Card with icon and label for dashboard quick actions
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

interface QuickActionCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export default function QuickActionCard({
  icon,
  label,
  onPress,
  variant = 'primary',
  style,
}: QuickActionCardProps) {
  const { colors, fontSizes, fontWeights, spacing, borderRadius, shadows } = useTheme();

  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isPrimary ? colors.primary : colors.surface,
          borderRadius: borderRadius.md,
          padding: spacing[4],
          ...shadows.base,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <MaterialCommunityIcons
        name={icon}
        size={32}
        color={isPrimary ? colors.textInverse : colors.primary}
      />
      <Text
        style={[
          styles.label,
          {
            color: isPrimary ? colors.textInverse : colors.text,
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.medium,
            marginTop: spacing[2],
          },
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    flex: 1,
  },
  label: {
    textAlign: 'center',
  },
});
