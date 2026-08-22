/**
 * Offline Banner - Simple Stub for Testing
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const OfflineBanner: React.FC = () => {
  // For now, just return null (no banner shown)
  // In production, this would check network status
  return null;
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#ff9800',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
