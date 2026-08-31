/**
 * StatusChip Component
 * Modern pill-shaped status indicator with dot badge and text label
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export type StatusType = 
  | 'scheduled' 
  | 'in-progress' 
  | 'completed' 
  | 'cancelled' 
  | 'delayed'
  | 'pending'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export interface StatusChipProps {
  status?: StatusType; // Optional when color is provided
  label: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  color?: string; // Optional custom color override
  showDot?: boolean;
  icon?: string; // Optional icon name
}

export default function StatusChip({ status, label, size = 'md', style, color, showDot = true }: StatusChipProps) {
  const { colors, fontSizes, fontWeights, spacing, borderRadius } = useTheme();

  const getStatusColors = () => {
    switch (status) {
      case 'scheduled':
        return { background: '#F1F5F9', text: '#475569', dot: '#64748B' };
      case 'info':
        return { background: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' };
      case 'in-progress':
        return { background: '#F0F9FF', text: '#0369A1', dot: '#0EA5E9' };
      case 'pending':
      case 'warning':
        return { background: '#FFFBEB', text: '#B45309', dot: '#F59E0B' };
      case 'completed':
      case 'success':
        return { background: '#ECFDF5', text: '#047857', dot: '#10B981' };
      case 'cancelled':
        return { background: '#F8FAFC', text: '#64748B', dot: '#94A3B8' };
      case 'delayed':
      case 'error':
        return { background: '#FEF2F2', text: '#B91C1C', dot: '#EF4444' };
      default:
        return { background: '#F1F5F9', text: '#334155', dot: '#64748B' };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: 8,
          paddingVertical: 3,
          fontSize: 11,
          dotSize: 5,
        };
      case 'lg':
        return {
          paddingHorizontal: 14,
          paddingVertical: 6,
          fontSize: 14,
          dotSize: 8,
        };
      case 'md':
      default:
        return {
          paddingHorizontal: 10,
          paddingVertical: 4,
          fontSize: 12,
          dotSize: 6,
        };
    }
  };

  const statusColors = status ? getStatusColors() : { background: '#F1F5F9', text: '#334155', dot: '#64748B' };
  const sizeStyles = getSizeStyles();

  const backgroundColor = color ? color + '15' : statusColors.background;
  const textColor = color || statusColors.text;
  const dotColor = color || statusColors.dot;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          borderRadius: 20,
        },
        style,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              width: sizeStyles.dotSize,
              height: sizeStyles.dotSize,
              borderRadius: sizeStyles.dotSize / 2,
              backgroundColor: dotColor,
            },
          ]}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: textColor,
            fontSize: sizeStyles.fontSize,
            fontWeight: '600',
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    marginRight: 2,
  },
  label: {
    letterSpacing: 0.1,
  },
});

