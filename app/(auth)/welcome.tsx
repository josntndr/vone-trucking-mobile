/**
 * Welcome Screen
 * Landing screen with app branding
 */

import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button } from '../../src/components';
import { useTheme } from '../../src/hooks';
import { APP_NAME, APP_TAGLINE } from '../../src/constants';

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Screen padding={4} style={styles.container}>
      <View style={styles.content}>
        {/* Logo placeholder */}
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: theme.colors.primary,
              borderRadius: theme.borderRadius.xl,
            },
          ]}
        >
          <Text
            style={[
              styles.logoText,
              {
                color: theme.colors.text.inverse,
                fontSize: theme.fontSizes['5xl'],
                fontWeight: theme.fontWeights.bold,
              },
            ]}
          >
            VT
          </Text>
        </View>

        <Text
          style={[
            styles.appName,
            {
              color: theme.colors.text.primary,
              fontSize: theme.fontSizes['3xl'],
              fontWeight: theme.fontWeights.bold,
              marginTop: theme.spacing[6],
            },
          ]}
        >
          {APP_NAME}
        </Text>

        <Text
          style={[
            styles.tagline,
            {
              color: theme.colors.text.secondary,
              fontSize: theme.fontSizes.lg,
              marginTop: theme.spacing[2],
            },
          ]}
        >
          {APP_TAGLINE}
        </Text>
      </View>

      <View style={[styles.actions, { gap: theme.spacing[3] }]}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push('/(auth)/login')}
        >
          Sign In
        </Button>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          onPress={() => router.push('/(auth)/register')}
        >
          Create Account
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    textAlign: 'center',
  },
  appName: {
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    maxWidth: 280,
  },
  actions: {
    width: '100%',
  },
});

