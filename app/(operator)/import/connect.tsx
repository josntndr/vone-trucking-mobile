/**
 * Google OAuth Connection Screen
 * Allows operator to securely connect their Google account
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/common/Card';
import { connectGoogleAccount } from '../../../src/services/api/import.service';
import type { GoogleSheetsConnection } from '../../../src/types/import.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ConnectGoogleScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connection, setConnection] = useState<GoogleSheetsConnection | null>(null);

  useEffect(() => {
    // Check if already connected
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    // TODO: Check for existing connection
    // For now, assume not connected
    setConnection(null);
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const response = await connectGoogleAccount();
      
      if (response.error) {
        Alert.alert('Connection Failed', response.error);
        return;
      }

      if (response.data) {
        setConnection(response.data);
        Alert.alert(
          'Connected Successfully',
          'Your Google account has been connected. You can now import delivery schedules.',
          [
            {
              text: 'Continue',
              onPress: () => router.push('/(operator)/import/spreadsheets'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect Google account');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Google Account',
      'Are you sure you want to disconnect? You will need to reconnect to import delivery schedules.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setConnection(null);
            Alert.alert('Disconnected', 'Your Google account has been disconnected.');
          },
        },
      ]
    );
  };

  const handleContinue = () => {
    router.push('/(operator)/import/spreadsheets');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="google"
            size={64}
            color={colors.primary}
            style={styles.icon}
          />
          <Text style={[styles.title, { color: colors.text }]}>
            Connect Google Sheets
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Import delivery schedules from Liwayway's Google Sheets
          </Text>
        </View>

        {/* Security Notice */}
        <Card style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <MaterialCommunityIcons
              name="shield-check"
              size={24}
              color={colors.success}
            />
            <Text style={[styles.noticeTitle, { color: colors.text }]}>
              Secure Connection
            </Text>
          </View>
          <Text style={[styles.noticeText, { color: colors.textSecondary }]}>
            Your Google credentials are never stored in the mobile app. All
            authentication goes through our secure backend server.
          </Text>
        </Card>

        {/* Connection Status */}
        {connection ? (
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <MaterialCommunityIcons
                name="check-circle"
                size={32}
                color={colors.success}
              />
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: colors.text }]}>
                  Connected
                </Text>
                <Text style={[styles.statusEmail, { color: colors.textSecondary }]}>
                  {connection.google_email}
                </Text>
              </View>
            </View>
            <Text style={[styles.statusDate, { color: colors.textSecondary }]}>
              Connected on {new Date(connection.connected_at).toLocaleDateString()}
            </Text>
          </Card>
        ) : (
          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={32}
                color={colors.textSecondary}
              />
              <View style={styles.statusInfo}>
                <Text style={[styles.statusTitle, { color: colors.text }]}>
                  Not Connected
                </Text>
                <Text style={[styles.statusEmail, { color: colors.textSecondary }]}>
                  Connect your Google account to get started
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Features */}
        <View style={styles.features}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>
            What you can do:
          </Text>
          
          <View style={styles.feature}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Access Liwayway delivery schedule spreadsheets
            </Text>
          </View>

          <View style={styles.feature}>
            <MaterialCommunityIcons
              name="table-arrow-down"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Import delivery information with automatic validation
            </Text>
          </View>

          <View style={styles.feature}>
            <MaterialCommunityIcons
              name="alert-decagram"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Detect duplicates and validate data before importing
            </Text>
          </View>

          <View style={styles.feature}>
            <MaterialCommunityIcons
              name="content-save"
              size={24}
              color={colors.primary}
            />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>
              Save column mappings for faster future imports
            </Text>
          </View>
        </View>

        {/* Permissions */}
        <Card style={styles.permissionsCard}>
          <Text style={[styles.permissionsTitle, { color: colors.text }]}>
            Permissions Required
          </Text>
          <Text style={[styles.permissionsText, { color: colors.textSecondary }]}>
            • Read-only access to your Google Sheets
          </Text>
          <Text style={[styles.permissionsText, { color: colors.textSecondary }]}>
            • View spreadsheet names and contents
          </Text>
          <Text style={[styles.permissionsNote, { color: colors.textSecondary }]}>
            Note: We never modify or delete your spreadsheets. Access can be
            revoked at any time from your Google account settings.
          </Text>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          {connection ? (
            <>
              <Button
                title="Continue to Spreadsheets"
                onPress={handleContinue}
                fullWidth
              />
              <Button
                title="Disconnect Account"
                onPress={handleDisconnect}
                variant="outline"
                fullWidth
                style={styles.disconnectButton}
              />
            </>
          ) : (
            <Button
              title={loading ? 'Connecting...' : 'Connect Google Account'}
              onPress={handleConnect}
              disabled={loading}
              fullWidth
              icon={
                loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="google" size={20} color="#fff" />
                )
              }
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  noticeCard: {
    marginBottom: 16,
    padding: 16,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  statusCard: {
    marginBottom: 24,
    padding: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusEmail: {
    fontSize: 14,
  },
  statusDate: {
    fontSize: 12,
    marginTop: 8,
  },
  features: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  permissionsCard: {
    marginBottom: 24,
    padding: 16,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  permissionsText: {
    fontSize: 14,
    marginBottom: 6,
  },
  permissionsNote: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  actions: {
    marginBottom: 32,
  },
  disconnectButton: {
    marginTop: 12,
  },
});

