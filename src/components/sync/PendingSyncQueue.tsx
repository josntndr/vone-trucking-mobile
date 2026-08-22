/**
 * Pending Sync Queue - Simple Stub for Testing
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PendingSyncQueue: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No pending items to sync</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});
