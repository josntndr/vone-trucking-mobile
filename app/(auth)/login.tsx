/**
 * Login Screen
 * User authentication screen
 */

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, ControlledInput, ControlledPasswordInput } from '../../src/components';
import { useTheme, useAuth, useForm } from '../../src/hooks';
import { loginSchema, LoginFormData } from '../../src/validation';

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    schema: loginSchema,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);

      const result = await signIn(data.email, data.password);

      if (!result.success) {
        Alert.alert('Login Failed', result.error || 'Please check your credentials and try again.');
      } else {
        // Navigation is handled automatically by the auth state change
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen scrollable keyboardAware padding={4}>
      <View style={[styles.container, { gap: theme.spacing[6] }]}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text.primary,
                fontSize: theme.fontSizes['3xl'],
                fontWeight: theme.fontWeights.bold,
              },
            ]}
          >
            Welcome Back
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: theme.colors.text.secondary,
                fontSize: theme.fontSizes.base,
                marginTop: theme.spacing[2],
              },
            ]}
          >
            Sign in to continue to Vone Trucking
          </Text>
        </View>

        <View style={[styles.form, { gap: theme.spacing[4] }]}>
          <ControlledInput
            control={control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            required
          />

          <ControlledPasswordInput
            control={control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            required
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotPassword}
          >
            <Text
              style={[
                styles.forgotPasswordText,
                {
                  color: theme.colors.primary,
                  fontSize: theme.fontSizes.sm,
                  fontWeight: theme.fontWeights.medium,
                },
              ]}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={{ marginTop: theme.spacing[2] }}
          >
            Sign In
          </Button>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              {
                color: theme.colors.text.secondary,
                fontSize: theme.fontSizes.sm,
              },
            ]}
          >
            Don't have an account?{' '}
            <Text
              style={[
                styles.footerLink,
                {
                  color: theme.colors.primary,
                  fontWeight: theme.fontWeights.semibold,
                },
              ]}
              onPress={() => router.push('/(auth)/register')}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'flex-start',
  },
  title: {},
  subtitle: {},
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {},
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 20,
  },
  footerText: {
    textAlign: 'center',
  },
  footerLink: {},
});

