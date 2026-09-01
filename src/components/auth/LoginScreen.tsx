/**
 * Login Screen - Modern Executive Redesign
 * 
 * Features:
 * - Premium executive branding header with glowing emblem & status badge
 * - Overlapping card layout with glassmorphism touches
 * - Modern role-based demo quick-switcher with visual icons
 * - Refined input fields with high-contrast icon badges & focus glow
 * - Remember me option with custom toggle
 * - High-impact executive Sign In action button
 * - Security & compliance verification badge footer
 * - Full Dark Mode and Light Mode integration
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeContext } from '../../contexts/ThemeContext';
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
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useThemeContext();

  const [username, setUsername] = useState('vonetruckingadmin');
  const [password, setPassword] = useState('VoneTrucking15');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<'operator' | 'driver' | 'porter'>('operator');
  
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
        setUsername(data.username || 'vonetruckingadmin');
        setRememberMe(true);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const saveSession = async (usernameToSave: string, sessionToken: string) => {
    try {
      if (rememberMe && usernameToSave) {
        await AsyncStorage.setItem(
          REMEMBER_ME_KEY,
          JSON.stringify({ username: usernameToSave })
        );
        await AsyncStorage.setItem(SESSION_TOKEN_KEY, sessionToken);
      } else {
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
        await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
      }
    } catch (error) {
      // Silent fail
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
      // Check for initial operator account
      if (username === 'vonetruckingadmin' && password === 'VoneTrucking15') {
        const result = await demoSignIn('operator');
        if (result.data) {
          const sessionToken = `demo_token_${Date.now()}_${Math.random().toString(36)}`;
          await saveSession(username, sessionToken);
          onLoginSuccess('operator');
          return;
        }
      }

      // Demo authentication delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const lowerUsername = username.toLowerCase();
      let userType: 'operator' | 'driver' | 'helper';
      
      // Determine role from username pattern
      if (lowerUsername.includes('operator') || lowerUsername.includes('admin') || lowerUsername.includes('vone')) {
        userType = 'operator';
        await demoSignIn('operator');
      } else if (lowerUsername.includes('driver')) {
        userType = 'driver';
        await demoSignIn('driver');
      } else if (lowerUsername.includes('porter') || lowerUsername.includes('helper')) {
        userType = 'helper';
        await demoSignIn('porter');
      } else {
        userType = 'operator';
        await demoSignIn('operator');
      }

      const sessionToken = `demo_token_${Date.now()}_${Math.random().toString(36)}`;
      await saveSession(username, sessionToken);
      
      onLoginSuccess(userType);
    } catch (error) {
      setErrors({
        general: 'Username or password is incorrect. Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (role: 'operator' | 'driver' | 'porter') => {
    setActiveRole(role);
    if (role === 'operator') {
      setUsername('vonetruckingadmin');
      setPassword('VoneTrucking15');
    } else if (role === 'driver') {
      setUsername('driver_juan');
      setPassword('Driver1234!');
    } else {
      setUsername('porter_pedro');
      setPassword('Porter1234!');
    }
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDarkMode ? '#0B1120' : '#0F1E36' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== Top Executive Hero Header ==================== */}
        <View style={[styles.heroHeader, { paddingTop: insets.top + 28 }]}>
          {/* Emblem Icon */}
          <View style={styles.emblemContainer}>
            <MaterialCommunityIcons 
              name="truck-fast" 
              size={44} 
              color="#0EA5E9" 
            />
          </View>
          
          <Text style={styles.brandTitle}>VONE TRUCKING</Text>
          
          <View style={styles.statusPill}>
            <View style={styles.statusLiveDot} />
            <Text style={styles.statusText}>Fleet & Logistics Operations</Text>
          </View>
        </View>

        {/* ==================== Main Floating Form Card ==================== */}
        <View style={[
          styles.mainCard,
          {
            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            borderColor: isDarkMode ? '#334155' : '#E2E8F0',
          }
        ]}>
          {/* Header Inside Card */}
          <View style={styles.welcomeSection}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.welcomeTitle, { color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}>
                Welcome Back
              </Text>
              <Text style={[styles.welcomeSubtitle, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                Sign in to your fleet workspace
              </Text>
            </View>
            <View style={[styles.securityShield, { backgroundColor: isDarkMode ? '#334155' : '#F0F9FF' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#0EA5E9" />
            </View>
          </View>

          {/* Quick Demo Role Selector */}
          <View style={[
            styles.demoSection,
            {
              backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
              borderColor: isDarkMode ? '#334155' : '#E2E8F0',
            }
          ]}>
            <View style={styles.demoHeaderRow}>
              <Ionicons name="flash-outline" size={13} color="#0EA5E9" />
              <Text style={[styles.demoLabel, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                DEMO QUICK ROLES
              </Text>
            </View>

            <View style={styles.demoPillsRow}>
              <TouchableOpacity
                style={[
                  styles.demoPill,
                  activeRole === 'operator' && styles.demoPillActiveOperator,
                  {
                    backgroundColor: activeRole === 'operator' 
                      ? '#0EA5E9' 
                      : (isDarkMode ? '#1E293B' : '#FFFFFF'),
                    borderColor: activeRole === 'operator' 
                      ? '#0EA5E9' 
                      : (isDarkMode ? '#334155' : '#E2E8F0'),
                  }
                ]}
                onPress={() => quickFill('operator')}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons 
                  name="shield-crown" 
                  size={15} 
                  color={activeRole === 'operator' ? '#FFFFFF' : '#0EA5E9'} 
                />
                <Text style={[
                  styles.demoPillText,
                  { color: activeRole === 'operator' ? '#FFFFFF' : (isDarkMode ? '#F8FAFC' : '#0F172A') }
                ]}>
                  Operator
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.demoPill,
                  activeRole === 'driver' && styles.demoPillActiveDriver,
                  {
                    backgroundColor: activeRole === 'driver' 
                      ? '#10B981' 
                      : (isDarkMode ? '#1E293B' : '#FFFFFF'),
                    borderColor: activeRole === 'driver' 
                      ? '#10B981' 
                      : (isDarkMode ? '#334155' : '#E2E8F0'),
                  }
                ]}
                onPress={() => quickFill('driver')}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons 
                  name="steering" 
                  size={15} 
                  color={activeRole === 'driver' ? '#FFFFFF' : '#10B981'} 
                />
                <Text style={[
                  styles.demoPillText,
                  { color: activeRole === 'driver' ? '#FFFFFF' : (isDarkMode ? '#F8FAFC' : '#0F172A') }
                ]}>
                  Driver
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.demoPill,
                  activeRole === 'porter' && styles.demoPillActivePorter,
                  {
                    backgroundColor: activeRole === 'porter' 
                      ? '#F59E0B' 
                      : (isDarkMode ? '#1E293B' : '#FFFFFF'),
                    borderColor: activeRole === 'porter' 
                      ? '#F59E0B' 
                      : (isDarkMode ? '#334155' : '#E2E8F0'),
                  }
                ]}
                onPress={() => quickFill('porter')}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons 
                  name="dolly" 
                  size={15} 
                  color={activeRole === 'porter' ? '#FFFFFF' : '#F59E0B'} 
                />
                <Text style={[
                  styles.demoPillText,
                  { color: activeRole === 'porter' ? '#FFFFFF' : (isDarkMode ? '#F8FAFC' : '#0F172A') }
                ]}>
                  Porter
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* General Error Banner */}
          {errors.general && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          )}

          {/* Username Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.fieldLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
              Username / Operator ID
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: usernameFocused 
                    ? '#0EA5E9' 
                    : (errors.username ? '#EF4444' : (isDarkMode ? '#334155' : '#E2E8F0')),
                },
              ]}
            >
              <View style={[
                styles.inputIconCircle,
                { backgroundColor: usernameFocused ? 'rgba(14, 165, 233, 0.12)' : (isDarkMode ? '#1E293B' : '#FFFFFF') }
              ]}>
                <Ionicons
                  name="person-outline"
                  size={17}
                  color={usernameFocused ? '#0EA5E9' : '#64748B'}
                />
              </View>
              <TextInput
                style={[styles.textInput, { color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}
                placeholder="Enter username or ID"
                placeholderTextColor="#94A3B8"
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
              {username.length > 0 && (
                <TouchableOpacity
                  onPress={() => setUsername('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.fieldLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
              Secure Password
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  borderColor: passwordFocused 
                    ? '#0EA5E9' 
                    : (errors.password ? '#EF4444' : (isDarkMode ? '#334155' : '#E2E8F0')),
                },
              ]}
            >
              <View style={[
                styles.inputIconCircle,
                { backgroundColor: passwordFocused ? 'rgba(14, 165, 233, 0.12)' : (isDarkMode ? '#1E293B' : '#FFFFFF') }
              ]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color={passwordFocused ? '#0EA5E9' : '#64748B'}
                />
              </View>
              <TextInput
                style={[styles.textInput, { color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}
                placeholder="Enter password"
                placeholderTextColor="#94A3B8"
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
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Remember Me & Options Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.8}
            >
              <View style={[
                styles.checkbox,
                rememberMe && styles.checkboxActive,
                { borderColor: rememberMe ? '#0EA5E9' : (isDarkMode ? '#475569' : '#CBD5E1') }
              ]}>
                {rememberMe && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
              <Text style={[styles.rememberMeText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                Remember credentials
              </Text>
            </TouchableOpacity>

            {onForgotPassword && (
              <TouchableOpacity
                onPress={onForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
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
              <View style={styles.btnRow}>
                <Text style={styles.signInButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ==================== Trust & Security Footer ==================== */}
        <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
          <View style={styles.securityBadge}>
            <Ionicons name="lock-closed" size={13} color="#0EA5E9" style={{ marginRight: 6 }} />
            <Text style={[styles.securityText, { color: isDarkMode ? '#94A3B8' : '#94A3B8' }]}>
              256-Bit SSL Encrypted Enterprise System
            </Text>
          </View>
          <Text style={[styles.copyrightText, { color: isDarkMode ? '#64748B' : '#94A3B8' }]}>
            Vone Trucking v1.0.0 © {new Date().getFullYear()}
          </Text>
        </View>
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
  
  // ==================== Hero Header ====================
  heroHeader: {
    backgroundColor: '#0F1E36',
    alignItems: 'center',
    paddingBottom: 42,
    position: 'relative',
  },
  emblemContainer: {
    width: 76,
    height: 76,
    backgroundColor: '#0A1220',
    borderWidth: 1.5,
    borderColor: 'rgba(14, 165, 233, 0.4)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    letterSpacing: 0.2,
  },
  
  // ==================== Main Floating Form Card ====================
  mainCard: {
    marginHorizontal: 16,
    marginTop: -22,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  welcomeSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  securityShield: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==================== Quick Demo Switcher ====================
  demoSection: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  demoLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  demoPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  demoPillActiveOperator: {
    shadowColor: '#0EA5E9',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  demoPillActiveDriver: {
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  demoPillActivePorter: {
    shadowColor: '#F59E0B',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  demoPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  
  // ==================== Error Banner ====================
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // ==================== Input Fields ====================
  inputGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    height: 52,
    paddingHorizontal: 10,
  },
  inputIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    height: '100%',
  },
  eyeButton: {
    padding: 6,
    marginLeft: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },

  // ==================== Options Row ====================
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 18,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#0EA5E9',
  },
  rememberMeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  forgotPasswordText: {
    color: '#0EA5E9',
    fontSize: 12,
    fontWeight: '700',
  },
  
  // ==================== Sign In Button ====================
  signInButton: {
    backgroundColor: '#0F1E36',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#0F1E36',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  // ==================== Footer ====================
  footerContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  securityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
