/**
 * Profile Screen
 * User profile and settings
 */

import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Card, Button, StatusChip } from '../../src/components';
import { useTheme, useAuth, useOffline } from '../../src/hooks';

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

  return (
    <Screen scrollable padding={4}>
      <View style={[styles.container, { gap: theme.spacing[4] }]}>
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text.primary,
              fontSize: theme.fontSizes['2xl'],
              fontWeight: theme.fontWeights.bold,
            },
          ]}
        >
          Profile
        </Text>

        <Card padding={4}>
          <View style={[styles.userInfo, { gap: theme.spacing[2] }]}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.full,
                },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  {
                    color: theme.colors.text.inverse,
                    fontSize: theme.fontSizes['2xl'],
                    fontWeight: theme.fontWeights.bold,
                  },
                ]}
              >
                {user?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <Text
              style={[
                styles.userName,
                {
                  color: theme.colors.text.primary,
                  fontSize: theme.fontSizes.xl,
                  fontWeight: theme.fontWeights.semibold,
                },
              ]}
            >
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email}
            </Text>

            <Text
              style={[
                styles.userEmail,
                {
                  color: theme.colors.text.secondary,
                  fontSize: theme.fontSizes.base,
                },
              ]}
            >
              {user?.email}
            </Text>

            {user?.role && (
              <StatusChip
                label={user.role.toUpperCase()}
                type="info"
                size="sm"
                style={{ marginTop: theme.spacing[2] }}
              />
            )}
          </View>
        </Card>

        <Card padding={4}>
          <View style={[styles.section, { gap: theme.spacing[3] }]}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text.primary,
                  fontSize: theme.fontSizes.lg,
                  fontWeight: theme.fontWeights.semibold,
                },
              ]}
            >
              Connection Status
            </Text>

            <View style={[styles.statusRow, { gap: theme.spacing[2] }]}>
              <StatusChip
                label={isOnline ? 'Online' : 'Offline'}
                type={isOnline ? 'success' : 'warning'}
                size="sm"
              />
              {pendingCount > 0 && (
                <StatusChip
                  label={`${pendingCount} Pending`}
                  type="info"
                  size="sm"
                />
              )}
            </View>

            {pendingCount > 0 && isOnline && (
              <Button
                variant="outline"
                size="sm"
                onPress={handleSync}
                loading={isSyncing}
              >
                Sync Now
              </Button>
            )}
          </View>
        </Card>

        <View style={[styles.actions, { gap: theme.spacing[3] }]}>
          <Button variant="outline" size="lg" fullWidth onPress={() => {}}>
            Edit Profile
          </Button>

          <Button variant="outline" size="lg" fullWidth onPress={() => {}}>
            Settings
          </Button>

          <Button variant="danger" size="lg" fullWidth onPress={handleSignOut}>
            Sign Out
          </Button>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.version,
              {
                color: theme.colors.text.tertiary,
                fontSize: theme.fontSizes.xs,
              },
            ]}
          >
            Version 1.0.0
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {},
  userInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {},
  userName: {},
  userEmail: {},
  section: {},
  sectionTitle: {},
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actions: {
    marginTop: 'auto',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  version: {},
});

