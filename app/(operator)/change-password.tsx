/**
 * Change Password Screen
 * Allows operators to securely update their password
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button } from '../../src/components';
import { useThemeContext } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/hooks';
import { supabase } from '../../src/services/api/supabase';

const MIN_PASSWORD_LENGTH = 8;

export default function ChangePasswordScreen() {
  const { colors, spacing, fontSizes, fontWeights, borderRadius } = useThemeContext();
  const { user, isDemoMode } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation states
  const hasMinLength = newPassword.length >= MIN_PASSWORD_LENGTH;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isDifferentFromCurrent = currentPassword !== newPassword && newPassword.length > 0;

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword.length >= MIN_PASSWORD_LENGTH &&
    passwordsMatch &&
    isDifferentFromCurrent &&
    !loading;

  const handleChangePassword = async () => {
    if (!canSubmit) {
      return;
    }

    if (isDemoMode) {
      Alert.alert(
        'Demo Mode',
        'Password changes are not available in demo mode.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        setError('Current password is incorrect.');
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        if (updateError.message.includes('session')) {
          setError('Your session has expired. Log in again.');
        } else {
          setError('We couldn\'t change your password. Try again.');
        }
        setLoading(false);
        return;
      }

      // Success
      Alert.alert(
        'Password Changed',
        'Your password has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      console.error('Password change error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: spacing[8] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: spacing[4],
              paddingTop: spacing[4],
              paddingBottom: spacing[5],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.surface,
                marginBottom: spacing[4],
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to More screen"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: 28,
                fontWeight: fontWeights.bold,
                marginBottom: spacing[2],
              },
            ]}
          >
            Change Password
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontSize: fontSizes.sm,
                lineHeight: 20,
              },
            ]}
          >
            Update your password to keep your account secure.
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View
            style={[
              styles.errorContainer,
              {
                marginHorizontal: spacing[4],
                marginBottom: spacing[4],
                padding: spacing[3],
                backgroundColor: colors.error + '10',
                borderRadius: borderRadius.md,
                borderLeftWidth: 4,
                borderLeftColor: colors.error,
              },
            ]}
          >
            <Ionicons
              name="alert-circle"
              size={20}
              color={colors.error}
              style={{ marginRight: spacing[2] }}
            />
            <Text
              style={[
                styles.errorText,
                {
                  color: colors.error,
                  fontSize: fontSizes.sm,
                  flex: 1,
                },
              ]}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Form */}
        <View style={[styles.form, { paddingHorizontal: spacing[4] }]}>
          {/* Current Password */}
          <View style={[styles.inputGroup, { marginBottom: spacing[4] }]}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: fontSizes.sm,
                  fontWeight: fontWeights.medium,
                  marginBottom: spacing[2],
                },
              ]}
            >
              Current Password
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderRadius: borderRadius.md,
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[3],
                    fontSize: fontSizes.base,
                    borderWidth: 1,
                    borderColor: colors.border,
                    minHeight: 48,
                    flex: 1,
                  },
                ]}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  setError(null);
                }}
                placeholder="Enter current password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                accessibilityLabel="Current password"
                accessibilityHint="Enter your current password"
              />
              <TouchableOpacity
                style={[
                  styles.eyeButton,
                  {
                    width: 44,
                    height: 44,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                accessibilityRole="button"
                accessibilityLabel={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={[styles.inputGroup, { marginBottom: spacing[4] }]}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: fontSizes.sm,
                  fontWeight: fontWeights.medium,
                  marginBottom: spacing[2],
                },
              ]}
            >
              New Password
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderRadius: borderRadius.md,
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[3],
                    fontSize: fontSizes.base,
                    borderWidth: 1,
                    borderColor: colors.border,
                    minHeight: 48,
                    flex: 1,
                  },
                ]}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setError(null);
                }}
                placeholder="Enter new password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                accessibilityLabel="New password"
                accessibilityHint="Enter your new password, at least 8 characters"
              />
              <TouchableOpacity
                style={[
                  styles.eyeButton,
                  {
                    width: 44,
                    height: 44,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
                onPress={() => setShowNewPassword(!showNewPassword)}
                accessibilityRole="button"
                accessibilityLabel={showNewPassword ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View style={[styles.inputGroup, { marginBottom: spacing[4] }]}>
            <Text
              style={[
                styles.label,
                {
                  color: colors.text,
                  fontSize: fontSizes.sm,
                  fontWeight: fontWeights.medium,
                  marginBottom: spacing[2],
                },
              ]}
            >
              Confirm New Password
            </Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderRadius: borderRadius.md,
                    paddingHorizontal: spacing[3],
                    paddingVertical: spacing[3],
                    fontSize: fontSizes.base,
                    borderWidth: 1,
                    borderColor: colors.border,
                    minHeight: 48,
                    flex: 1,
                  },
                ]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError(null);
                }}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                accessibilityLabel="Confirm new password"
                accessibilityHint="Re-enter your new password to confirm"
              />
              <TouchableOpacity
                style={[
                  styles.eyeButton,
                  {
                    width: 44,
                    height: 44,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Requirements */}
          <View
            style={[
              styles.requirements,
              {
                padding: spacing[3],
                backgroundColor: colors.surface,
                borderRadius: borderRadius.md,
                marginBottom: spacing[5],
              },
            ]}
          >
            <Text
              style={[
                styles.requirementsTitle,
                {
                  color: colors.text,
                  fontSize: fontSizes.sm,
                  fontWeight: fontWeights.semibold,
                  marginBottom: spacing[2],
                },
              ]}
            >
              Password Requirements
            </Text>

            <View style={styles.requirementItem}>
              <Ionicons
                name={hasMinLength ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={hasMinLength ? colors.success : colors.textSecondary}
                style={{ marginRight: spacing[2] }}
              />
              <Text
                style={[
                  styles.requirementText,
                  {
                    color: hasMinLength ? colors.success : colors.textSecondary,
                    fontSize: fontSizes.sm,
                  },
                ]}
              >
                At least {MIN_PASSWORD_LENGTH} characters
              </Text>
            </View>

            <View style={styles.requirementItem}>
              <Ionicons
                name={passwordsMatch ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={passwordsMatch ? colors.success : colors.textSecondary}
                style={{ marginRight: spacing[2] }}
              />
              <Text
                style={[
                  styles.requirementText,
                  {
                    color: passwordsMatch ? colors.success : colors.textSecondary,
                    fontSize: fontSizes.sm,
                  },
                ]}
              >
                Passwords match
              </Text>
            </View>

            <View style={styles.requirementItem}>
              <Ionicons
                name={isDifferentFromCurrent ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={isDifferentFromCurrent ? colors.success : colors.textSecondary}
                style={{ marginRight: spacing[2] }}
              />
              <Text
                style={[
                  styles.requirementText,
                  {
                    color: isDifferentFromCurrent ? colors.success : colors.textSecondary,
                    fontSize: fontSizes.sm,
                  },
                ]}
              >
                Different from current password
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: canSubmit ? colors.primary : colors.border,
                  borderRadius: borderRadius.md,
                  paddingVertical: spacing[3],
                  minHeight: 48,
                  marginBottom: spacing[3],
                },
              ]}
              onPress={handleChangePassword}
              disabled={!canSubmit}
              accessibilityRole="button"
              accessibilityLabel="Save new password"
              accessibilityHint="Updates your password"
              accessibilityState={{ disabled: !canSubmit }}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text
                  style={[
                    styles.saveButtonText,
                    {
                      color: canSubmit ? colors.white : colors.textTertiary,
                      fontSize: fontSizes.base,
                      fontWeight: fontWeights.semibold,
                    },
                  ]}
                >
                  Save New Password
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cancelButton,
                {
                  borderRadius: borderRadius.md,
                  paddingVertical: spacing[3],
                  minHeight: 48,
                },
              ]}
              onPress={() => router.back()}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              accessibilityHint="Returns to More screen without saving"
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  {
                    color: colors.text,
                    fontSize: fontSizes.base,
                    fontWeight: fontWeights.medium,
                  },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {},
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {},
  subtitle: {},
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {},
  form: {},
  inputGroup: {},
  label: {},
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {},
  eyeButton: {},
  requirements: {},
  requirementsTitle: {},
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {},
  actions: {},
  saveButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {},
  cancelButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {},
});
