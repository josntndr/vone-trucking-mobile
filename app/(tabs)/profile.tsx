/**
 * Profile / More Screen
 * User profile, settings, and app information
 */

import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, Card, Button, StatusChip } from '../../src/components';
import { useTheme, useAuth, useOffline } from '../../src/hooks';

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  iconLibrary?: 'ionicons' | 'material';
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { isOnline, pendingCount, sync, isSyncing } = useOffline();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          const result = await signOut();
          if (result.success) {
            router.replace('/(auth)/welcome');
          }
        },
      },
    ]);
  };

  const handleSync = async () => {
    const result = await sync();
    if (result.success) {
      Alert.alert('Sync Complete', `Synced ${result.processed} items successfully.`);
    }
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Operations',
      items: [
        {
          icon: 'water',
          label: 'Fuel and Expenses',
          onPress: () => Alert.alert('Coming Soon', 'Fuel and Expenses management'),
          iconLibrary: 'ionicons',
        },
        {
          icon: 'construct',
          label: 'Maintenance',
          onPress: () => Alert.alert('Coming Soon', 'Maintenance tracking'),
          iconLibrary: 'ionicons',
        },
        {
          icon: 'cloud-upload',
          label: 'Import Schedule',
          onPress: () => router.push('/(operator)/import/connect'),
          iconLibrary: 'ionicons',
        },
      ],
    },
    {
      title: 'Finance and Insights',
      items: [
        {
          icon: 'cash',
          label: 'Payroll',
          onPress: () => Alert.alert('Coming Soon', 'Payroll management'),
          iconLibrary: 'ionicons',
        },
        {
          icon: 'wallet',
          label: 'Cash Advances',
          onPress: () => Alert.alert('Coming Soon', 'Cash Advances tracking'),
          iconLibrary: 'ionicons',
        },
        {
          icon: 'stats-chart',
          label: 'Analytics and Reports',
          onPress: () => Alert.alert('Coming Soon', 'Analytics dashboard'),
          iconLibrary: 'ionicons',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          label: 'Personal Information',
          onPress: () => Alert.alert('Coming Soon', 'Edit personal information'),
          iconLibrary: 'ionicons',
        },
        {
          icon: 'lock-closed',
          label: 'Change Password',
          onPress: () => Alert.alert('Coming Soon', 'Change password'),
          iconLibrary: 'ionicons',
        },
        {
          icon: 'notifications',
          label: 'Notifications',
          onPress: () => Alert.alert('Coming Soon', 'Notifications settings'),
          iconLibrary: 'ionicons',
          badge: pendingCount > 0 ? String(pendingCount) : undefined,
        },
      ],
    },
    {
      title: 'Application',
      items: [
        {
          icon: 'help-circle',
          label: 'Help and Support',
          onPress: () => Alert.alert('Coming Soon', 'Help and Support'),
          iconLibrary: 'ionicons',
        },
        {
          icon: 'information-circle',
          label: 'About Vone Trucking',
          onPress: () => Alert.alert(
            'About Vone Trucking',
            'Version 1.0.0\n\nPrivate management system for Vone Trucking operations.\n\nFor support, please contact your administrator.',
            [{ text: 'OK' }]
          ),
          iconLibrary: 'ionicons',
        },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.label}
      style={[
        styles.menuItem,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.borderLight,
        },
      ]}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        {item.iconLibrary === 'material' ? (
          <MaterialCommunityIcons
            name={item.icon as any}
            size={22}
            color={theme.colors.textSecondary}
          />
        ) : (
          <Ionicons name={item.icon as any} size={22} color={theme.colors.textSecondary} />
        )}
        <Text style={[styles.menuItemLabel, { color: theme.colors.text }]}>
          {item.label}
        </Text>
      </View>
      <View style={styles.menuItemRight}>
        {item.badge && (
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.colors.error, marginRight: theme.spacing[2] },
            ]}
          >
            <Text style={[styles.badgeText, { color: theme.colors.white }]}>
              {item.badge}
            </Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
              paddingHorizontal: theme.spacing.md,
              paddingTop: theme.spacing[3],
              paddingBottom: theme.spacing[3],
            },
          ]}
        >
          <Text
            style={[
              styles.headerTitle,
              {
                color: theme.colors.text,
                fontSize: theme.fontSizes['2xl'],
                fontWeight: theme.fontWeights.bold,
              },
            ]}
          >
            More
          </Text>
        </View>

        {/* Profile Card */}
        <View style={{ padding: theme.spacing.md }}>
          <TouchableOpacity
            onPress={() => Alert.alert('Coming Soon', 'Edit profile')}
          >
            <Card padding={4}>
              <View style={[styles.profileContent, { gap: theme.spacing[3] }]}>
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: theme.colors.primary,
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color: theme.colors.textInverse,
                        fontSize: theme.fontSizes.xl,
                        fontWeight: theme.fontWeights.bold,
                      },
                    ]}
                  >
                    {user?.email?.charAt(0).toUpperCase() || 'O'}
                  </Text>
                </View>

                <View style={styles.profileInfo}>
                  <Text
                    style={[
                      styles.userName,
                      {
                        color: theme.colors.text,
                        fontSize: theme.fontSizes.lg,
                        fontWeight: theme.fontWeights.semibold,
                      },
                    ]}
                  >
                    {user?.email || 'Operator'}
                  </Text>
                  <Text
                    style={[
                      styles.userRole,
                      {
                        color: theme.colors.textSecondary,
                        fontSize: theme.fontSizes.sm,
                        marginTop: theme.spacing[1],
                      },
                    ]}
                  >
                    {user?.role?.toUpperCase() || 'OPERATOR'} / ADMIN
                  </Text>
                  {isOnline && (
                    <StatusChip
                      label="Online"
                      color={theme.colors.success}
                      size="sm"
                      style={{ marginTop: theme.spacing[2], alignSelf: 'flex-start' }}
                    />
                  )}
                  {!isOnline && (
                    <StatusChip
                      label="Offline"
                      color={theme.colors.warning}
                      size="sm"
                      style={{ marginTop: theme.spacing[2], alignSelf: 'flex-start' }}
                    />
                  )}
                </View>

                <Ionicons name="chevron-forward" size={20} color={theme.colors.textTertiary} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Sync Status */}
        {pendingCount > 0 && isOnline && (
          <View style={{ paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <Card padding={3}>
              <View style={[styles.syncSection, { gap: theme.spacing[2] }]}>
                <View style={styles.syncInfo}>
                  <Ionicons name="cloud-upload" size={20} color={theme.colors.warning} />
                  <Text
                    style={[
                      styles.syncText,
                      { color: theme.colors.text, fontSize: theme.fontSizes.sm, marginLeft: theme.spacing[2] },
                    ]}
                  >
                    {pendingCount} items pending sync
                  </Text>
                </View>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleSync}
                  loading={isSyncing}
                >
                  Sync Now
                </Button>
              </View>
            </Card>
          </View>
        )}

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <View key={section.title} style={{ marginBottom: theme.spacing[4] }}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSizes.sm,
                  fontWeight: theme.fontWeights.semibold,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing[2],
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                },
              ]}
            >
              {section.title}
            </Text>
            <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
              {section.items.map((item) => renderMenuItem(item))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <View style={{ paddingHorizontal: theme.spacing.md, marginTop: theme.spacing[2] }}>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onPress={handleSignOut}
            icon={<Ionicons name="log-out-outline" size={20} color={theme.colors.error} />}
            style={{ borderColor: theme.colors.error }}
            textStyle={{ color: theme.colors.error }}
          >
            Sign Out
          </Button>
        </View>

        {/* App Version */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.version,
              {
                color: theme.colors.textTertiary,
                fontSize: theme.fontSizes.xs,
                textAlign: 'center',
              },
            ]}
          >
            Vone Trucking v1.0.0
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {},
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {},
  profileInfo: {
    flex: 1,
  },
  userName: {},
  userRole: {},
  syncSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  syncText: {},
  sectionTitle: {},
  menuSection: {
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 12,
  },
  version: {},
});

