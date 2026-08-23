/**
 * Login Screen - Private System Entry Point
 * Vone Trucking internal management system
 * Login-only access for authorized personnel
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
import { useTheme } from '../../theme/ThemeProvider';
import { demoSignIn } from '../../services/demo/demoAuth.service';

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
  const theme = useTheme();
  const colors = theme?.colors || {};
  const fontSizes = theme?.fontSizes || {};
  const fontWeights = theme?.fontWeights || {};
  const spacing = theme?.spacing || {};
  const borderRadius = theme?.borderRadius || {};
  const shadows = theme?.shadows || {};
  
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
      style={[styles.container, { backgroundColor: colors?.background || '#F7F4EF' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Logo and Branding */}
        <View style={[styles.header, { paddingHorizontal: spacing?.[5] || 20 }]}>
          <View style={[styles.brandingContainer, { marginTop: spacing?.[10] || 40 }]}>
            {/* Logo */}
            <View style={[styles.logoContainer, { backgroundColor: colors?.primary || '#192A4A', borderRadius: 22 }]}>
              <MaterialCommunityIcons 
                name="truck-fast-outline" 
                size={44} 
                color={colors?.textInverse || colors?.white || '#FFFFFF'} 
              />
            </View>
            
            {/* Application Name */}
            <Text
              style={[
                styles.appName,
                {
                  color: colors?.text || '#24211F',
                  fontSize: fontSizes?.['3xl'] || 30,
                  fontWeight: (fontWeights?.extrabold || '800') as any,
                  marginTop: spacing?.[3] || 12,
                },
              ]}
            >
              Vone Trucking
            </Text>
            
            {/* Main Tagline */}
            <Text
              style={[
                styles.tagline,
                {
                  color: colors?.textSecondary || '#746B63',
                  fontSize: fontSizes?.base || 16,
                  fontWeight: (fontWeights?.medium || '500') as any,
                  marginTop: spacing?.[2] || 8,
                },
              ]}
            >
              Vone Trucking operations, all in one place.
            </Text>
            
            {/* Supporting Text */}
            <Text
              style={[
                styles.supportingText,
                {
                  color: colors?.textTertiary || colors?.textSecondary || '#746B63',
                  fontSize: fontSizes?.sm || 14,
                  marginTop: spacing?.[2] || 8,
                },
              ]}
            >
              Secure access for authorised Vone Trucking personnel.
            </Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={[styles.form, { paddingHorizontal: spacing?.[5] || 20, marginTop: spacing?.[6] || 24 }]}>
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

          {/* Username Input */}
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
              Username
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.base,
                  borderWidth: 2,
                  borderColor: usernameFocused
                    ? colors.accent
                    : errors.username
                    ? colors.error
                    : colors.border,
                  ...shadows.sm,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={22}
                color={usernameFocused ? colors.accent : colors.textSecondary}
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
                placeholder="Enter your username"
                placeholderTextColor={colors.textTertiary}
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
              <Text
                style={[
                  styles.errorText,
                  {
                    color: colors.error,
                    fontSize: fontSizes.xs,
                    marginTop: spacing[1],
                  },
                ]}
              >
                {errors.username}
              </Text>
            )}
          </View>

          {/* Password Input */}
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
              Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.base,
                  borderWidth: 2,
                  borderColor: passwordFocused
                    ? colors.accent
                    : errors.password
                    ? colors.error
                    : colors.border,
                  ...shadows.sm,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="lock-outline"
                size={22}
                color={passwordFocused ? colors.accent : colors.textSecondary}
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
                placeholder="Enter your password"
                placeholderTextColor={colors.textTertiary}
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
                style={[styles.showPasswordButton, { paddingRight: spacing[4] }]}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text
                style={[
                  styles.errorText,
                  {
                    color: colors.error,
                    fontSize: fontSizes.xs,
                    marginTop: spacing[1],
                  },
                ]}
              >
                {errors.password}
              </Text>
            )}
          </View>

          {/* Remember Me & Forgot Password Row */}
          <View style={[styles.optionsRow, { marginBottom: spacing[6] }]}>
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
                    borderColor: colors.border,
                    backgroundColor: rememberMe ? colors.accent : colors.surface,
                    borderRadius: 6,
                    borderWidth: 2,
                  },
                ]}
              >
                {rememberMe && (
                  <MaterialCommunityIcons name="check" size={18} color={colors.textInverse} />
                )}
              </View>
              <Text
                style={[
                  styles.checkboxLabel,
                  {
                    color: colors.textSecondary,
                    fontSize: fontSizes.sm,
                    marginLeft: spacing[2],
                  },
                ]}
              >
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={onForgotPassword} 
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text
                style={[
                  styles.forgotPasswordText,
                  {
                    color: colors.accent,
                    fontSize: fontSizes.sm,
                    fontWeight: fontWeights.semibold,
                  },
                ]}
              >
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              {
                backgroundColor: loading ? colors.primaryLight : colors.primary,
                borderRadius: borderRadius.md,
                paddingVertical: spacing[5],
                ...shadows.base,
              },
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.textInverse} size="small" />
            ) : (
              <Text
                style={[
                  styles.loginButtonText,
                  {
                    color: colors.textInverse,
                    fontSize: fontSizes.lg,
                    fontWeight: fontWeights.semibold,
                  },
                ]}
              >
                Log In
              </Text>
            )}
          </TouchableOpacity>

          {/* Support Text */}
          <Text
            style={[
              styles.supportLink,
              {
                color: colors.textTertiary,
                fontSize: fontSizes.xs,
                textAlign: 'center',
                marginTop: spacing[6],
              },
            ]}
          >
            Need help? Contact your Operator or system administrator.
          </Text>
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
  brandingContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 88,
    height: 88,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  tagline: {
    textAlign: 'center',
    maxWidth: 320,
  },
  supportingText: {
    textAlign: 'center',
    maxWidth: 280,
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
  showPasswordButton: {
    height: '100%',
    justifyContent: 'center',
  },
  errorText: {},
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {},
  forgotPasswordText: {},
  loginButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {},
  supportLink: {},
});
