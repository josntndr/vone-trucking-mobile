/**
 * Login Screen - Redesigned to Match Reference Image
 * 
 * Features:
 * - Large dark navy branding section with rounded bottom corners
 * - Centered truck icon, app name, and subtitle
 * - Professional input fields with icons
 * - Password visibility toggle
 * - Solid navy Sign In button
 * - Responsive design (320px - 430px)
 * - Preserves existing authentication logic
 * 
 * Security Notes:
 * - "Remember me" persists username only (NOT password)
 * - Passwords are never stored in plaintext
 * - Session tokens should use secure storage in production
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
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DESIGN_SYSTEM, COLORS, SPACING } from '../../theme/designSystem';
import { demoSignIn } from '../../services/demo/demoAuth.service';

const DS = DESIGN_SYSTEM;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
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
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Field focus states
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
        showsVerticalScrollIndicator={false}
      >
        {/* Navy Branding Header with Rounded Bottom Corners */}
        <View style={[styles.brandingHeader, { paddingTop: insets.top + 40 }]}>
          {/* Truck Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name="truck-outline" 
              size={64} 
              color="#FFFFFF" 
            />
          </View>
          
          {/* App Name */}
          <Text style={styles.appName}>Vone Trucking</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>Fleet Management System</Text>
        </View>

        {/* Login Form Container */}
        <View style={styles.formContainer}>
          {/* Welcome Text */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your account</Text>
          </View>

          {/* General Error Banner */}
          {errors.general && (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons name="alert-circle" size={20} color={COLORS.error} />
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <View
              style={[
                styles.inputWrapper,
                usernameFocused && styles.inputWrapperFocused,
                errors.username && styles.inputWrapperError,
              ]}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={24}
                color={usernameFocused ? '#1B2A4A' : '#9CA3AF'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Username"
                placeholderTextColor="#9CA3AF"
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
                returnKeyType="next"
              />
            </View>
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View
              style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused,
                errors.password && styles.inputWrapperError,
              ]}
            >
              <MaterialCommunityIcons
                name="lock-outline"
                size={24}
                color={passwordFocused ? '#1B2A4A' : '#9CA3AF'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
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
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.signInButton,
              loading && styles.signInButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password Link */}
          {onForgotPassword && (
            <TouchableOpacity
              onPress={onForgotPassword}
              style={styles.forgotPasswordContainer}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: Math.max(insets.bottom, 20) + 20 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F4F0', // Warm off-white background
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // ==================== Branding Header ====================
  brandingHeader: {
    backgroundColor: '#1B2A4A', // Dark navy
    alignItems: 'center',
    paddingBottom: 56,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 40, // Space after the rounded corners
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.2,
  },
  
  // ==================== Form Container ====================
  formContainer: {
    paddingHorizontal: 24,
    marginTop: 0, // No extra margin needed now
  },
  welcomeSection: {
    marginBottom: 28,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D2D2D',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#9E9E9E',
  },
  
  // ==================== Error Banner ====================
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  errorBannerText: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 14,
    marginLeft: 12,
    fontWeight: '500',
  },
  
  // ==================== Input Fields ====================
  inputGroup: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    height: 56,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: '#1B2A4A',
    borderWidth: 2,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: '#D32F2F',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#2D2D2D',
    height: '100%',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },
  
  // ==================== Sign In Button ====================
  signInButton: {
    backgroundColor: '#1B2A4A', // Solid navy - NO gradient
    borderRadius: 14,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#1B2A4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  // ==================== Forgot Password ====================
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: '#1B2A4A',
    fontSize: 14,
    fontWeight: '600',
  },
});
