/**
 * Driver Profile Home Screen
 * Quick access to fuel, history, payslips, cash advance
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

export default function DriverProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { signOut, user } = useAuth();

  const profileActions = [
    {
      title: 'Fuel & Receipts',
      description: 'Record fuel purchases and upload receipts',
      icon: 'gas-station',
      color: colors.primary,
      route: '/(driver)/profile/fuel',
    },
    {
      title: 'Trip History',
      description: 'View completed trips and records',
      icon: 'history',
      color: colors.info,
      route: '/(driver)/profile/history',
    },
    {
      title: 'Payslips',
      description: 'View and download your payslips',
      icon: 'file-document',
      color: colors.success,
      route: '/(driver)/profile/payslips',
    },
    {
      title: 'Cash Advance',
      description: 'Request or view cash advance status',
      icon: 'cash',
      color: colors.warning,
      route: '/(driver)/profile/cash-advance',
    },
  ];

  const handleLogout = () => {
    // Direct navigation - no confirmation for testing
    router.replace('/(auth)/login');
  };

  // Get user display name
  const displayName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
    : user?.email || 'Driver';
  const employeeId = user?.user_metadata?.employee_id || 'N/A';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="account" size={48} color="#fff" />
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
        <Text style={[styles.role, { color: colors.textSecondary }]}>Driver</Text>
        <Text style={[styles.employeeId, { color: colors.textSecondary }]}>
          {employeeId}
        </Text>
      </Card>

      {/* Quick Actions */}
      {profileActions.map((action, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => router.push(action.route as any)}
          activeOpacity={0.7}
        >
          <Card style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
              <MaterialCommunityIcons
                name={action.icon as any}
                size={32}
                color={action.color}
              />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>
                {action.title}
              </Text>
              <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                {action.description}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </Card>
        </TouchableOpacity>
      ))}

      {/* Contact */}
      <Card style={styles.contactCard}>
        <Text style={[styles.contactTitle, { color: colors.text }]}>
          Need Help?
        </Text>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: colors.primary }]}
          onPress={() => Linking.openURL('tel:+639171234567')}
        >
          <MaterialCommunityIcons name="phone" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Call Operator</Text>
        </TouchableOpacity>
      </Card>

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          borderWidth: 2,
          borderColor: colors.error,
          borderRadius: 8,
          padding: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.surface,
          marginTop: 10,
          marginBottom: 20,
        }}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="logout" size={24} color={colors.error} style={{ marginRight: 8 }} />
        <Text style={{ color: colors.error, fontSize: 18, fontWeight: '700' }}>
          Logout
        </Text>
      </TouchableOpacity>

      <View style={styles.version}>
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Vone Trucking v1.0.0
        </Text>
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
  headerCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 14,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  contactCard: {
    padding: 16,
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
  },
});

