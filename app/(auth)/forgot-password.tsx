/**
 * Forgot Password Screen Route
 * Phase 2: Modern password reset flow
 */

import React from 'react';
import { useRouter } from 'expo-router';
import ForgotPasswordScreen from '../../src/components/auth/ForgotPasswordScreen';

export default function ForgotPasswordRoute() {
  const router = useRouter();

  const handleResetComplete = () => {
    // After sending reset link, go back to login
    router.back();
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ForgotPasswordScreen
      onResetComplete={handleResetComplete}
      onBack={handleBack}
    />
  );
}

