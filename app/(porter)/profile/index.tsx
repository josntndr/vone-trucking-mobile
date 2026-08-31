/**
 * Porter Profile Home Screen
 * Reuses driver profile structure but porter-specific
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { useAuth } from '../../../src/hooks';
import { Card } from '../../../src/components/common/Card';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PorterProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleCallOperator = () => {
    const operatorPhone = '+639123456789'; // TODO: Get from config
    Alert.alert(
      'Call Operator',
      `Call ${operatorPhone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Linking.openURL(`tel:${operatorPhone}`),
        },
      ]
    );
  };

  const handleLogout = () => {
    // Direct navigation - no confirmation for testing
    router.replace('/(auth)/login');
  };

  // Get user display name
  const displayName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
    : user?.email || 'Porter';
  const employeeId = user?.user_metadata?.employee_id || 'N/A';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* User Info Card */}
      <Card style={styles.userCard}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="account" size={48} color="#fff" />
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>
          {displayName}
        </Text>
        <Text style={[styles.userRole, { color: colors.textSecondary }]}>
          Porter / Helper
        </Text>
        <Text style={[styles.userID, { color: colors.textSecondary }]}>
          ID: {employeeId}
        </Text>
      </Card>

      {/* Quick Access */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Access
        </Text>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/(porter)/profile/history')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
            <MaterialCommunityIcons name="history" size={24} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>
              Trip History
            </Text>
            <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
              View completed trips
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/(porter)/profile/payslips')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.successLight }]}>
            <MaterialCommunityIcons name="cash" size={24} color={colors.success} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>
              Payslips
            </Text>
            <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
              View salary and incentives
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/(porter)/profile/cash-advance')}
        >
          <View style={[styles.menuIcon, { backgroundColor: colors.infoLight }]}>
            <MaterialCommunityIcons name="wallet" size={24} color={colors.info} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>
              Cash Advance
            </Text>
            <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
              Request or view cash advances
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={handleCallOperator}
        >
          <MaterialCommunityIcons name="phone" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Call Operator</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  userCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 15,
    marginBottom: 4,
  },
  userID: {
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

