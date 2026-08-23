/**
 * Login Screen Route
 * Private login-only system for Vone Trucking
 * Main entry point after splash screen
 */

import React from 'react';
import { useRouter } from 'expo-router';
import LoginScreen from '../../src/components/auth/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();

  const handleLoginSuccess = (userType: 'operator' | 'driver' | 'helper') => {
    // Route based on user type - no manual role selection
    if (userType === 'operator') {
      router.replace('/(operator)');
    } else if (userType === 'driver') {
      router.replace('/(driver)');
    } else {
      router.replace('/(porter)');
    }
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <LoginScreen
      onLoginSuccess={handleLoginSuccess}
      onForgotPassword={handleForgotPassword}
    />
  );
}

