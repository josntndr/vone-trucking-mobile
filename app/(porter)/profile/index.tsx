/**
 * Porter Profile & Settings Screen
 * Account management, helper info, settings, and sign out
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

export default function PorterProfileScreen() {
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
    : user?.email || 'Pedro Reyes';
  const employeeId = user?.user_metadata?.employee_id || 'PT-001';
  const email = user?.email || 'porter@vonetrucking.com';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Profile Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-hard-hat" size={48} color={COLORS.white} />
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="cube" size={14} color={COLORS.orange} />
            <Text style={styles.roleBadgeText}>Porter / Helper</Text>
          </View>
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>{employeeId}</Text>
          </View>
        </View>
      </Card>

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
        message="Are you sure you want to sign out of your Helper session?"
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
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.orange,
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
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.orange,
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
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
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
