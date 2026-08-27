/**
 * Login Screen - Private System Entry Point - Redesigned with Design System
 * Phase 7: Align Auth screens with modern premium design
 * 
 * Security Notes:
 * - "Remember me" persists username only (NOT password)
 * - Passwords are never stored in plaintext
 * - Session tokens should use secure storage in production
 * - TODO: Replace AsyncStorage with expo-secure-store or react-native-keychain
 * - TODO: Implement proper OAuth or JWT token authentication
 * - Demo authentication is for development only
 */

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_SYSTEM, COLORS, SPACING, COMPONENTS } from '../../theme/designSystem';
import { demoSignIn } from '../../services/demo/demoAuth.service';

const DS = DESIGN_SYSTEM;
const REMEMBER_ME_KEY = '@vone_remember_me';
const SESSION_TOKEN_KEY = '@vone_session_token';

interface LoginScreenProps {
  onLoginSuccess: (userType: 'operator' | 'driver' | 'helper') => void;
  onForgotPassword: () => void;
}

export default function LoginScreen({
  onLoginSuccess,
  onForgotPassword,
}: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Field focus states for enhanced UX
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    general?: string;
  }>({});

  // Load saved session preference on mount
  useEffect(() => {
    loadSavedSession();
  }, []);

  const loadSavedSession = async () => {
    try {
      const saved = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setUsername(data.username);
        setRememberMe(true);
        // NOTE: Never load or store password in plaintext
        // Only username is saved for convenience
      }
    } catch (error) {
      // Silent fail - not critical
    }
  };

  const saveSession = async (usernameToSave: string, sessionToken: string) => {
    try {
      if (rememberMe && usernameToSave) {
        // Save username for convenience (NOT password - security requirement)
        await AsyncStorage.setItem(
          REMEMBER_ME_KEY,
          JSON.stringify({ username: usernameToSave })
        );
        
        // Save session token securely
        // TODO: In production, use expo-secure-store or react-native-keychain
        // for encrypted storage of authentication tokens
        await AsyncStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
      } else {
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
        await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
      }
    } catch (error) {
      // Silent fail - not critical
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // TODO: Replace with actual authentication API call
      // For now, using demo authentication
      
      // Check for initial operator account
      if (username === 'vonetruckingadmin' && password === 'VoneTrucking15') {
        // Initial Operator account
        const result = await demoSignIn('operator');
        if (result.data) {
          // Generate demo session token
          const sessionToken = `demo_token_${Date.now()}_${Math.random().toString(36)}`;
          await saveSession(username, sessionToken);
          onLoginSuccess('operator');
          return;
        }
      }

      // Demo authentication for development
      await new Promise(resolve => setTimeout(resolve, 800));

      const lowerUsername = username.toLowerCase();
      let userType: 'operator' | 'driver' | 'helper';
      
      // Determine role from username pattern
      if (lowerUsername.includes('operator') || lowerUsername.includes('admin')) {
        userType = 'operator';
        await demoSignIn('operator');
      } else if (lowerUsername.includes('driver')) {
        userType = 'driver';
        await demoSignIn('driver');
      } else if (lowerUsername.includes('porter') || lowerUsername.includes('helper')) {
        userType = 'helper';
        await demoSignIn('porter');
      } else {
        throw new Error('Invalid credentials');
      }

      // Generate demo session token
      const sessionToken = `demo_token_${Date.now()}_${Math.random().toString(36)}`;
      await saveSession(username, sessionToken);
      
      onLoginSuccess(userType);
    } catch (error) {
      setErrors({
        general: 'Username or password is incorrect.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Logo and Branding */}
        <View style={styles.header}>
          <View style={styles.brandingContainer}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons 
                name="truck-fast-outline" 
                size={44} 
                color={COLORS.white} 
              />
            </View>
            
            {/* Application Name */}
            <Text style={styles.appName}>
              Vone Trucking
            </Text>
            
            {/* Main Tagline */}
            <Text style={styles.tagline}>
              Vone Trucking operations, all in one place.
            </Text>
            
            {/* Supporting Text */}
            <Text style={styles.supportingText}>
              Secure access for authorised Vone Trucking personnel.
            </Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          {/* General Error */}
          {errors.general && (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorBannerText}>
                {errors.general}
              </Text>
            </View>
          )}

          {/* Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Username
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor: usernameFocused
                    ? COLORS.navy
                    : errors.username
                    ? COLORS.error
                    : COLORS.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={22}
                color={usernameFocused ? COLORS.navy : COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor={COLORS.textTertiary}
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errors.username) {
                    setErrors({ ...errors, username: undefined });
                  }
                }}
                onFocus={() => setUsernameFocused(true)}
                onBlur={() => setUsernameFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>
            {errors.username && (
              <Text style={styles.errorText}>
                {errors.username}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor: passwordFocused
                    ? COLORS.navy
                    : errors.password
                    ? COLORS.error
                    : COLORS.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="lock-outline"
                size={22}
                color={passwordFocused ? COLORS.navy : COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textTertiary}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined });
                  }
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordButton}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>
                {errors.password}
              </Text>
            )}
          </View>

          {/* Remember Me & Forgot Password Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: rememberMe ? COLORS.navy : COLORS.white,
                  },
                ]}
              >
                {rememberMe && (
                  <MaterialCommunityIcons name="check" size={18} color={COLORS.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onForgotPassword} 
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.forgotPasswordText}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.loginButtonText}>
                Log In
              </Text>
            )}
          </TouchableOpacity>

          {/* Support Text */}
          <Text style={styles.supportLink}>
            Need help? Contact your Operator or system administrator.
          </Text>
        </View>

        {/* Footer Spacing */}
        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: SPACING['2xl'] + SPACING.lg,
  },
  logoContainer: {
    width: 88,
    height: 88,
    backgroundColor: COLORS.navy,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: DS.typography.fontSize['3xl'],
    fontWeight: DS.typography.fontWeight.bold,
    color: COLORS.navy,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: SPACING.md,
  },
  tagline: {
    fontSize: DS.typography.fontSize.base,
    fontWeight: DS.typography.fontWeight.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    marginTop: SPACING.xs,
  },
  supportingText: {
    fontSize: DS.typography.fontSize.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: SPACING.xs,
  },
  form: {
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '15',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorBannerText: {
    flex: 1,
    color: COLORS.error,
    fontSize: DS.typography.fontSize.sm,
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    color: COLORS.text,
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.semibold,
    marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    height: 56,
    ...COMPONENTS.card.shadow,
  },
  inputIcon: {
    marginLeft: SPACING.md,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    fontSize: DS.typography.fontSize.base,
    paddingHorizontal: SPACING.sm,
  },
  showPasswordButton: {
    height: '100%',
    paddingRight: SPACING.md,
    justifyContent: 'center',
  },
  errorText: {
    color: COLORS.error,
    fontSize: DS.typography.fontSize.xs,
    marginTop: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    color: COLORS.textSecondary,
    fontSize: DS.typography.fontSize.sm,
    marginLeft: SPACING.xs,
  },
  forgotPasswordText: {
    color: COLORS.navy,
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.semibold,
  },
  loginButton: {
    backgroundColor: COLORS.navy,
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...COMPONENTS.card.shadow,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: DS.typography.fontSize.lg,
    fontWeight: DS.typography.fontWeight.semibold,
  },
  supportLink: {
    color: COLORS.textTertiary,
    fontSize: DS.typography.fontSize.xs,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});
