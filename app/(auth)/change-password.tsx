/**
 * Change Password Screen Route
 * Phase 2: Force password change for temporary passwords
 */

import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ChangePasswordScreen from '../../src/components/auth/ChangePasswordScreen';

export default function ChangePasswordRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Check if this is a forced password change (temporary password)
  const isTemporaryPassword = params.temporary === 'true';
  const userType = params.userType as 'operator' | 'driver' | 'helper' | undefined;

  const handlePasswordChanged = () => {
    // After password change, redirect based on user type
    if (isTemporaryPassword && userType) {
      if (userType === 'operator') {
        router.replace('/(operator)');
      } else if (userType === 'driver') {
        router.replace('/(driver)');
      } else {
        router.replace('/(porter)');
      }
    } else {
      // If not temporary, just go back (user initiated from settings)
      router.back();
    }
  };

  const handleBack = () => {
    // Only allow back if not a forced change
    if (!isTemporaryPassword) {
      router.back();
    }
  };

  return (
    <ChangePasswordScreen
      isTemporaryPassword={isTemporaryPassword}
      onPasswordChanged={handlePasswordChanged}
      onBack={!isTemporaryPassword ? handleBack : undefined}
    />
  );
}
