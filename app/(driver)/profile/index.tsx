/**
 * Driver Profile & Settings Screen
 * Account management, driver credentials, settings, and sign out
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../src/hooks';
import { Card } from '../../../src/components/common/Card';
import { ConfirmDialog } from '../../../src/components';

const COLORS = {
  background: '#0B1120',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  primary: '#0EA5E9',
  teal: '#0EA5E9',
  orange: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#38BDF8',
  white: '#FFFFFF',
};

export default function DriverProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const handleSignOut = async () => {
    setLogoutDialogVisible(false);
    try {
      if (signOut) {
        await signOut();
      }
    } catch (e) {
      console.error(e);
    }
    router.replace('/(auth)/login');
  };

  const displayName = user?.user_metadata?.first_name
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
    : user?.email || 'Juan Dela Cruz';
  const employeeId = user?.user_metadata?.employee_id || 'DR-001';
  const email = user?.email || 'driver@vonetrucking.com';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Profile Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account" size={48} color={COLORS.white} />
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="steering" size={14} color={COLORS.primary} />
            <Text style={styles.roleBadgeText}>Fleet Driver</Text>
          </View>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>{employeeId}</Text>
          </View>
        </View>
      </Card>

      {/* Driver Credentials Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DRIVER CREDENTIALS</Text>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="card-account-details-outline" size={20} color={COLORS.orange} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Driver's License</Text>
              <Text style={styles.infoValue}>N01-12-345678</Text>
            </View>
            <View style={styles.validBadge}>
              <Text style={styles.validBadgeText}>Valid</Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons name="truck-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Assigned Truck</Text>
              <Text style={styles.infoValue}>ABC-1234 (Isuzu Giga 10W)</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT & PREFERENCES</Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('Security', 'Password management is managed via company dispatch portal.')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(14, 165, 233, 0.12)' }]}>
              <Ionicons name="key-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.menuTitle}>Change Password</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <View style={styles.cardDivider} />

          <View style={styles.menuRow}>
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
              <Ionicons name="notifications-outline" size={18} color={COLORS.info} />
            </View>
            <Text style={styles.menuTitle}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#334155', true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </Card>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SUPPORT & DISPATCH</Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Linking.openURL('tel:+639171234567')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Ionicons name="call-outline" size={18} color={COLORS.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuTitle}>Call Dispatcher / Operator</Text>
              <Text style={styles.menuSubtitle}>+63 917 123 4567 (24/7 Operations)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        onPress={() => setLogoutDialogVisible(true)}
        style={styles.signOutButton}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          Vone Trucking v1.0.0 © {new Date().getFullYear()}
        </Text>
      </View>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={logoutDialogVisible}
        onClose={() => setLogoutDialogVisible(false)}
        title="Sign Out"
        message="Are you sure you want to sign out of your Driver session?"
        onConfirm={handleSignOut}
        confirmLabel="Sign Out"
        isDestructive={true}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    borderColor: 'rgba(14, 165, 233, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  idBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  idBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
  },
  validBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  validBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  signOutButtonText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '700',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
