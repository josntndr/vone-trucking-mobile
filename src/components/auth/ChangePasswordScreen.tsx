/**
 * Change Password Screen
 * Used for:
 * - Force password change on first login (temporary password)
 * - User-initiated password change from settings
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

interface ChangePasswordScreenProps {
  isTemporaryPassword?: boolean; // If true, show "force change" messaging
  onPasswordChanged: () => void;
  onBack?: () => void; // Optional - not available for forced changes
}

export default function ChangePasswordScreen({
  isTemporaryPassword = false,
  onPasswordChanged,
  onBack,
}: ChangePasswordScreenProps) {
  const { colors, fontSizes, fontWeights, lineHeights, spacing, borderRadius, shadows  } = useTheme();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Calculate password strength
  const getPasswordStrength = (): { strength: number; label: string; color: string } => {
    if (!newPassword) return { strength: 0, label: '', color: colors.textTertiary };
    
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;
    if (/[a-z]/.test(newPassword)) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/\d/.test(newPassword)) strength++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) strength++;
    
    if (strength <= 2) return { strength, label: 'Weak', color: colors.error };
    if (strength <= 4) return { strength, label: 'Fair', color: colors.warning };
    return { strength, label: 'Strong', color: colors.success };
  };

  const passwordStrength = getPasswordStrength();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (newPassword && newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // TODO: Replace with actual password change API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Password Changed',
        'Your password has been updated successfully.',
        [{ text: 'OK', onPress: onPasswordChanged }]
      );
    } catch (error) {
      setErrors({
        general: 'Failed to change password. Please verify your current password and try again.',
      });
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
          {!isTemporaryPassword && onBack && (
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
          )}

          <View style={[styles.titleContainer, { marginTop: isTemporaryPassword ? spacing[12] : spacing[8] }]}>
            {isTemporaryPassword && (
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: colors.warningLight + '20',
                    borderRadius: 32,
                    width: 64,
                    height: 64,
                    marginBottom: spacing[4],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="shield-alert"
                  size={32}
                  color={colors.warning}
                />
              </View>
            )}

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
              {isTemporaryPassword ? 'Change Your Password' : 'Update Password'}
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
              {isTemporaryPassword
                ? 'You are using a temporary password. Please create a new password to continue.'
                : 'Enter your current password and choose a new one'}
            </Text>
          </View>

          {/* Warning Banner for Temporary Password */}
          {isTemporaryPassword && (
            <View
              style={[
                styles.warningBanner,
                {
                  backgroundColor: colors.warningLight + '20',
                  borderRadius: borderRadius.base,
                  padding: spacing[4],
                  marginTop: spacing[6],
                  borderLeftWidth: 4,
                  borderLeftColor: colors.warning,
                },
              ]}
            >
              <MaterialCommunityIcons name="information" size={20} color={colors.warning} />
              <Text
                style={[
                  styles.warningText,
                  {
                    color: colors.warning,
                    fontSize: fontSizes.sm,
                    marginLeft: spacing[2],
                    flex: 1,
                  },
                ]}
              >
                For security reasons, you must change your temporary password before accessing the app.
              </Text>
            </View>
          )}
        </View>

        {/* Form */}
        <View style={[styles.form, { paddingHorizontal: spacing[5], marginTop: spacing[8] }]}>
          {/* General Error */}
          {errors.general && (
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
                {errors.general}
              </Text>
            </View>
          )}

          {/* Current Password */}
          <View style={[styles.inputContainer, { marginBottom: spacing[4] }]}>
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
              Current Password *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.base,
                  borderWidth: 2,
                  borderColor: focusedField === 'currentPassword'
                    ? colors.accent
                    : errors.currentPassword
                    ? colors.error
                    : colors.border,
                  ...shadows.sm,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color={focusedField === 'currentPassword' ? colors.accent : colors.textSecondary}
                style={{ marginLeft: spacing[3] }}
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
                placeholder="Enter current password"
                placeholderTextColor={colors.textTertiary}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  if (errors.currentPassword) {
                    setErrors({ ...errors, currentPassword: undefined });
                  }
                }}
                onFocus={() => setFocusedField('currentPassword')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={[styles.showPasswordButton, { paddingRight: spacing[3] }]}
              >
                <MaterialCommunityIcons
                  name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.currentPassword && (
              <Text style={[styles.errorText, { color: colors.error, fontSize: fontSizes.xs, marginTop: spacing[1] }]}>
                {errors.currentPassword}
              </Text>
            )}
          </View>

          {/* New Password */}
          <View style={[styles.inputContainer, { marginBottom: spacing[2] }]}>
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
              New Password *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.base,
                  borderWidth: 2,
                  borderColor: focusedField === 'newPassword'
                    ? colors.accent
                    : errors.newPassword
                    ? colors.error
                    : colors.border,
                  ...shadows.sm,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="lock-plus-outline"
                size={20}
                color={focusedField === 'newPassword' ? colors.accent : colors.textSecondary}
                style={{ marginLeft: spacing[3] }}
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
                placeholder="Create a strong new password"
                placeholderTextColor={colors.textTertiary}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (errors.newPassword) {
                    setErrors({ ...errors, newPassword: undefined });
                  }
                }}
                onFocus={() => setFocusedField('newPassword')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={[styles.showPasswordButton, { paddingRight: spacing[3] }]}
              >
                <MaterialCommunityIcons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <View style={[styles.passwordStrengthContainer, { marginTop: spacing[2] }]}>
                <View style={styles.passwordStrengthBars}>
                  {[1, 2, 3, 4, 5, 6].map((bar) => (
                    <View
                      key={bar}
                      style={[
                        styles.passwordStrengthBar,
                        {
                          backgroundColor: bar <= passwordStrength.strength ? passwordStrength.color : colors.border,
                          borderRadius: 2,
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.passwordStrengthLabel,
                    {
                      color: passwordStrength.color,
                      fontSize: fontSizes.xs,
                      fontWeight: fontWeights.semibold,
                      marginLeft: spacing[2],
                    },
                  ]}
                >
                  {passwordStrength.label}
                </Text>
              </View>
            )}
            
            {errors.newPassword && (
              <Text style={[styles.errorText, { color: colors.error, fontSize: fontSizes.xs, marginTop: spacing[1] }]}>
                {errors.newPassword}
              </Text>
            )}
            
            {/* Password Requirements */}
            <View style={[styles.passwordRequirements, { marginTop: spacing[2] }]}>
              <Text
                style={[
                  styles.requirementText,
                  {
                    color: colors.textTertiary,
                    fontSize: fontSizes.xs,
                  },
                ]}
              >
                • At least 8 characters
              </Text>
              <Text
                style={[
                  styles.requirementText,
                  {
                    color: colors.textTertiary,
                    fontSize: fontSizes.xs,
                  },
                ]}
              >
                • Include uppercase, lowercase, and numbers
              </Text>
            </View>
          </View>

          {/* Confirm New Password */}
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
              Confirm New Password *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.base,
                  borderWidth: 2,
                  borderColor: focusedField === 'confirmPassword'
                    ? colors.accent
                    : errors.confirmPassword
                    ? colors.error
                    : colors.border,
                  ...shadows.sm,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="lock-check-outline"
                size={20}
                color={focusedField === 'confirmPassword' ? colors.accent : colors.textSecondary}
                style={{ marginLeft: spacing[3] }}
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
                placeholder="Re-enter your new password"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined });
                  }
                }}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={[styles.showPasswordButton, { paddingRight: spacing[3] }]}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={[styles.errorText, { color: colors.error, fontSize: fontSizes.xs, marginTop: spacing[1] }]}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: loading ? colors.primaryLight : colors.accent,
                borderRadius: borderRadius.md,
                paddingVertical: spacing[5],
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
                {isTemporaryPassword ? 'Continue to App' : 'Update Password'}
              </Text>
            )}
          </TouchableOpacity>
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {},
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
    height: 52,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  showPasswordButton: {
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {},
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordStrengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  passwordStrengthBar: {
    height: 4,
    flex: 1,
  },
  passwordStrengthLabel: {},
  passwordRequirements: {},
  requirementText: {},
  submitButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {},
});
