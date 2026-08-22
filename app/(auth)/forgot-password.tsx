/**
 * Forgot Password Screen
 * Password reset request
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, ControlledInput } from '../../src/components';
import { useTheme, useAuth, useForm } from '../../src/hooks';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../src/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { requestPasswordReset } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    schema: forgotPasswordSchema,
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsSubmitting(true);

      const result = await requestPasswordReset(data.email);

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to send reset email.');
      } else {
        Alert.alert(
          'Email Sent',
          result.message || 'Check your email for password reset instructions.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
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
            Forgot Password?
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
            Enter your email address and we'll send you instructions to reset your password.
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

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={{ marginTop: theme.spacing[2] }}
          >
            Send Reset Link
          </Button>

          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            Back to Sign In
          </Button>
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
});

