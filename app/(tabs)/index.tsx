/**
 * Home Screen
 * Main dashboard screen
 */

import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Screen, Card, Button } from '../../src/components';
import { useTheme, useAuth, useOffline } from '../../src/hooks';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { isOnline, pendingCount } = useOffline();

  return (
    <Screen scrollable padding={4}>
      <View style={[styles.container, { gap: theme.spacing[4] }]}>
        <View style={styles.header}>
          <Text
            style={[
              styles.greeting,
              {
                color: theme.colors.text.secondary,
                fontSize: theme.fontSizes.base,
              },
            ]}
          >
            Welcome back,
          </Text>
          <Text
            style={[
              styles.name,
              {
                color: theme.colors.text.primary,
                fontSize: theme.fontSizes['2xl'],
                fontWeight: theme.fontWeights.bold,
              },
            ]}
          >
            {user?.firstName || user?.email}
          </Text>
        </View>

        {!isOnline && (
          <Card variant="filled" padding={3}>
            <View style={styles.offlineContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={theme.colors.warning} />
              <Text
                style={[
                  styles.offlineText,
                  {
                    color: theme.colors.warning,
                    fontSize: theme.fontSizes.sm,
                  },
                ]}
              >
                You are currently offline. {pendingCount > 0 && `${pendingCount} changes pending sync.`}
              </Text>
            </View>
          </Card>
        )}

        <Card padding={4}>
          <Text
            style={[
              styles.cardTitle,
              {
                color: theme.colors.text.primary,
                fontSize: theme.fontSizes.lg,
                fontWeight: theme.fontWeights.semibold,
                marginBottom: theme.spacing[2],
              },
            ]}
          >
            Getting Started
          </Text>
          <Text
            style={[
              styles.cardText,
              {
                color: theme.colors.text.secondary,
                fontSize: theme.fontSizes.base,
              },
            ]}
          >
            This is the Vone Trucking mobile app foundation. The design system, authentication, and offline support are ready. Business features will be added next.
          </Text>
        </Card>

        <Card padding={4}>
          <Text
            style={[
              styles.cardTitle,
              {
                color: theme.colors.text.primary,
                fontSize: theme.fontSizes.lg,
                fontWeight: theme.fontWeights.semibold,
                marginBottom: theme.spacing[3],
              },
            ]}
          >
            Quick Stats
          </Text>
          <View style={[styles.statsRow, { gap: theme.spacing[3] }]}>
            <View style={styles.stat}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: theme.colors.primary,
                    fontSize: theme.fontSizes['2xl'],
                    fontWeight: theme.fontWeights.bold,
                  },
                ]}
              >
                0
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: theme.colors.text.secondary,
                    fontSize: theme.fontSizes.sm,
                  },
                ]}
              >
                Active Trips
              </Text>
            </View>
            <View style={styles.stat}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: theme.colors.accent,
                    fontSize: theme.fontSizes['2xl'],
                    fontWeight: theme.fontWeights.bold,
                  },
                ]}
              >
                0
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: theme.colors.text.secondary,
                    fontSize: theme.fontSizes.sm,
                  },
                ]}
              >
                Completed
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
  },
  greeting: {},
  name: {},
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineText: {},
  cardTitle: {},
  cardText: {
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {},
  statLabel: {},
});

