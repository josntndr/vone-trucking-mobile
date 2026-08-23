/**
 * Forgot Password Screen
 * Password reset flow with username/email and security question verification
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

interface ForgotPasswordScreenProps {
  onResetComplete: () => void;
  onBack: () => void;
}

export default function ForgotPasswordScreen({
  onResetComplete,
  onBack,
}: ForgotPasswordScreenProps) {
  const { colors, fontSizes, fontWeights, lineHeights, spacing, borderRadius, shadows  } = useTheme();
  
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');

  const validateInput = (): boolean => {
    if (!usernameOrEmail.trim()) {
      setError('Username or email is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInput()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Replace with actual password reset API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Reset Link Sent',
        'If an account exists with this username or email, you will receive password reset instructions.',
        [
          {
            text: 'OK',
            onPress: onResetComplete,
          },
        ]
      );
    } catch (error) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing[5] }]}>
          <TouchableOpacity
            style={[styles.backButton, { marginTop: spacing[8] }]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>

          <View style={[styles.titleContainer, { marginTop: spacing[8] }]}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: colors.accentLight + '20',
                  borderRadius: 32,
                  width: 64,
                  height: 64,
                  marginBottom: spacing[4],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="lock-reset"
                size={32}
                color={colors.accent}
              />
            </View>

            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  fontSize: fontSizes['3xl'],
                  fontWeight: fontWeights.heavy,
                },
              ]}
            >
              Forgot Password?
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  fontSize: fontSizes.base,
                  fontWeight: fontWeights.medium,
                  marginTop: spacing[2],
                },
              ]}
            >
              Enter your username or email address and we'll send you instructions to reset your password
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={[styles.form, { paddingHorizontal: spacing[5], marginTop: spacing[10] }]}>
          {/* General Error */}
          {error && (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: colors.errorLight + '20',
                  borderRadius: borderRadius.base,
                  padding: spacing[4],
                  marginBottom: spacing[4],
                  borderLeftWidth: 4,
                  borderLeftColor: colors.error,
                },
              ]}
            >
              <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
              <Text
                style={[
                  styles.errorBannerText,
                  {
                    color: colors.error,
                    fontSize: fontSizes.sm,
                    marginLeft: spacing[2],
                  },
                ]}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Username or Email Input */}
          <View style={[styles.inputContainer, { marginBottom: spacing[6] }]}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: fontSizes.sm,
                  fontWeight: fontWeights.semibold,
                  marginBottom: spacing[2],
                },
              ]}
            >
              Username or Email
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.base,
                  borderWidth: 2,
                  borderColor: focused
                    ? colors.accent
                    : error
                    ? colors.error
                    : colors.border,
                  ...shadows.sm,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={22}
                color={focused ? colors.accent : colors.textSecondary}
                style={{ marginLeft: spacing[4] }}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    fontSize: fontSizes.base,
                    paddingHorizontal: spacing[3],
                  },
                ]}
                placeholder="Enter your username or email"
                placeholderTextColor={colors.textTertiary}
                value={usernameOrEmail}
                onChangeText={(text) => {
                  setUsernameOrEmail(text);
                  if (error) setError('');
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: loading ? colors.primaryLight : colors.primary,
                borderRadius: borderRadius.md,
                paddingVertical: spacing[5],
                marginBottom: spacing[3],
                ...shadows.base,
              },
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} size="small" />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  {
                    color: colors.textInverse,
                    fontSize: fontSizes.lg,
                    fontWeight: fontWeights.semibold,
                  },
                ]}
              >
                Send Reset Link
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login Link */}
          <TouchableOpacity
            style={[styles.backToLoginButton, { paddingVertical: spacing[4] }]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={18}
              color={colors.accent}
            />
            <Text
              style={[
                styles.backToLoginText,
                {
                  color: colors.accent,
                  fontSize: fontSizes.base,
                  fontWeight: fontWeights.semibold,
                  marginLeft: spacing[2],
                },
              ]}
            >
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={[styles.infoSection, { paddingHorizontal: spacing[5], marginTop: spacing[8] }]}>
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.infoLight + '20',
                borderRadius: borderRadius.md,
                padding: spacing[4],
                borderLeftWidth: 4,
                borderLeftColor: colors.info,
              },
            ]}
          >
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                name="information-outline"
                size={20}
                color={colors.info}
              />
              <Text
                style={[
                  styles.infoTitle,
                  {
                    color: colors.info,
                    fontSize: fontSizes.sm,
                    fontWeight: fontWeights.semibold,
                    marginLeft: spacing[2],
                  },
                ]}
              >
                Need Help?
              </Text>
            </View>
            <Text
              style={[
                styles.infoText,
                {
                  color: colors.textSecondary,
                  fontSize: fontSizes.sm,
                  marginTop: spacing[2],
                  lineHeight: 20,
                },
              ]}
            >
              If you don't receive an email within a few minutes, check your spam folder or contact support for assistance.
            </Text>
          </View>
        </View>

        {/* Footer Spacing */}
        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {},
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 320,
  },
  form: {},
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBannerText: {
    flex: 1,
  },
  inputContainer: {},
  label: {},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {},
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToLoginText: {},
  infoSection: {},
  infoCard: {},
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTitle: {},
  infoText: {},
});
