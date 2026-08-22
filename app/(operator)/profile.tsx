/**
 * Operator Profile Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Button, ConfirmDialog } from '../../src/components';
import { useTheme, useAuth } from '../../src/hooks';

export default function ProfileScreen() {
  const { colors, spacing } = useTheme();
  const { user, signOut } = useAuth();
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutDialogVisible(false);
    
    const { error } = await signOut();
    if (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } else {
      router.replace('/(auth)/login');
    }
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Personal Information', onPress: () => {} },
        { icon: 'key-outline', label: 'Change Password', onPress: () => {} },
        { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
      ],
    },
    {
      title: 'App Settings',
      items: [
        { icon: 'moon-outline', label: 'Dark Mode', onPress: () => {} },
        { icon: 'language-outline', label: 'Language', onPress: () => {} },
        { icon: 'information-circle-outline', label: 'About', onPress: () => {} },
      ],
    },
  ];

  return (
    <Screen>
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.surface }]}>
              {user?.email?.charAt(0).toUpperCase() || 'O'}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.user_metadata?.first_name
              ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
              : 'Operator'}
          </Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.info + '15' }]}>
            <Text style={[styles.roleText, { color: colors.info }]}>Operator / Admin</Text>
          </View>
        </View>

        {/* Profile Sections */}
        <View style={{ paddingHorizontal: spacing.md }}>
          {profileSections.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              <Card>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex < section.items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                    onPress={item.onPress}
                  >
                    <View style={styles.menuItemContent}>
                      <Ionicons name={item.icon as any} size={24} color={colors.textSecondary} />
                      <Text style={[styles.menuItemText, { color: colors.text }]}>
                        {item.label}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </Card>
            </View>
          ))}

          {/* Logout Button */}
          <View style={[styles.section, { paddingBottom: spacing.xl }]}>
            <Button
              title="Logout"
              onPress={() => setLogoutDialogVisible(true)}
              variant="outline"
              style={{ borderColor: colors.error }}
              textStyle={{ color: colors.error }}
              icon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
            />
          </View>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Vone Trucking v1.0.0
          </Text>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            © 2026 Vone Trucking. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={logoutDialogVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        onConfirm={handleLogout}
        onCancel={() => setLogoutDialogVisible(false)}
        confirmText="Logout"
        confirmColor={colors.error}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

