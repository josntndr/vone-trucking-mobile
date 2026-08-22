/**
 * Register Screen
 * New user registration
 */

import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Button, ControlledInput, ControlledPasswordInput } from '../../src/components';
import { useTheme, useAuth, useForm } from '../../src/hooks';
import { registerSchema, RegisterFormData } from '../../src/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    schema: registerSchema,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsSubmitting(true);

      const result = await signUp(data.email, data.password, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      if (!result.success) {
        Alert.alert('Registration Failed', result.error || 'Please try again.');
      } else {
        Alert.alert(
          'Success',
          'Account created successfully! Please check your email to verify your account.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
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
            Create Account
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
            Sign up to get started with Vone Trucking
          </Text>
        </View>

        <View style={[styles.form, { gap: theme.spacing[4] }]}>
          <View style={[styles.row, { gap: theme.spacing[3] }]}>
            <View style={styles.halfWidth}>
              <ControlledInput
                control={control}
                name="firstName"
                label="First Name"
                placeholder="John"
                autoCapitalize="words"
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <ControlledInput
                control={control}
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                autoCapitalize="words"
                required
              />
            </View>
          </View>

          <ControlledInput
            control={control}
            name="email"
            label="Email"
            placeholder="john.doe@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            required
          />

          <ControlledInput
            control={control}
            name="phone"
            label="Phone"
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
            required
          />

          <ControlledPasswordInput
            control={control}
            name="password"
            label="Password"
            placeholder="Create a strong password"
            required
          />

          <ControlledPasswordInput
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your password"
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
            Create Account
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
            Already have an account?{' '}
            <Text
              style={[
                styles.footerLink,
                {
                  color: theme.colors.primary,
                  fontWeight: theme.fontWeights.semibold,
                },
              ]}
              onPress={() => router.back()}
            >
              Sign In
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
    paddingTop: 40,
  },
  header: {
    alignItems: 'flex-start',
  },
  title: {},
  subtitle: {},
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  halfWidth: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    textAlign: 'center',
  },
  footerLink: {},
});

