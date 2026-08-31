/**
 * QuickActionCard Component
 * Modern action card with tinted icon capsule and responsive feedback
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

interface QuickActionCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'teal' | 'orange' | 'success';
  style?: ViewStyle;
}

export default function QuickActionCard({
  icon,
  label,
  onPress,
  variant = 'primary',
  style,
}: QuickActionCardProps) {
  const { shadows } = useTheme();

  const getVariantConfig = () => {
    switch (variant) {
      case 'teal':
        return { iconBg: '#F0F9FF', iconColor: '#0EA5E9' };
      case 'orange':
        return { iconBg: '#FFFBEB', iconColor: '#F59E0B' };
      case 'success':
        return { iconBg: '#ECFDF5', iconColor: '#10B981' };
      case 'secondary':
        return { iconBg: '#F1F5F9', iconColor: '#64748B' };
      case 'primary':
      default:
        return { iconBg: '#F0F9FF', iconColor: '#0F1E36' };
    }
  };

  const { iconBg, iconColor } = getVariantConfig();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: '#FFFFFF',
          ...shadows.sm,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={iconColor}
        />
      </View>
      <Text
        style={styles.label}
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
});

