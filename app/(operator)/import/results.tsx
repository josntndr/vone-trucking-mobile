/**
 * Import Results Screen
 * Shows import completion status and audit log
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { Button } from '../../../src/components/ui/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ResultsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const imported = parseInt(params.imported as string) || 0;
  const failed = parseInt(params.failed as string) || 0;
  const skipped = parseInt(params.skipped as string) || 0;
  const total = imported + failed + skipped;

  const handleViewTrips = () => {
    router.replace('/(operator)/trips');
  };

  const handleViewHistory = () => {
    router.push('/(operator)/import/history');
  };

  const handleNewImport = () => {
    router.replace('/(operator)/import/connect');
  };

  const getStatusIcon = () => {
    if (failed > 0) return 'alert-circle';
    if (imported === 0) return 'information';
    return 'check-circle';
  };

  const getStatusColor = () => {
    if (failed > 0) return colors.warning;
    if (imported === 0) return colors.textSecondary;
    return colors.success;
  };

  const getStatusMessage = () => {
    if (imported === total) return 'Import Completed Successfully';
    if (imported > 0 && (failed > 0 || skipped > 0)) return 'Import Partially Completed';
    if (failed > 0) return 'Import Completed with Errors';
    return 'Import Completed';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <MaterialCommunityIcons
            name={getStatusIcon()}
            size={80}
            color={getStatusColor()}
          />
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            {getStatusMessage()}
          </Text>
          <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
            {new Date().toLocaleString('en-PH', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </Text>
        </View>

        {/* Summary Stats */}
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            Import Summary
          </Text>

          <View style={styles.statRow}>
            <View style={styles.statIcon}>
              <MaterialCommunityIcons
                name="file-document"
                size={24}
                color={colors.textSecondary}
              />
            </View>
            <Text style={[styles.statLabel, { color: colors.text }]}>
              Total Rows Processed
            </Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {total}
            </Text>
          </View>

          {imported > 0 && (
            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={colors.success}
                />
              </View>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Successfully Imported
              </Text>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {imported}
              </Text>
            </View>
          )}

          {skipped > 0 && (
            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons
                  name="skip-next"
                  size={24}
                  color={colors.warning}
                />
              </View>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Skipped (Duplicates)
              </Text>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {skipped}
              </Text>
            </View>
          )}

          {failed > 0 && (
            <View style={styles.statRow}>
              <View style={styles.statIcon}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={24}
                  color={colors.error}
                />
              </View>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Failed
              </Text>
              <Text style={[styles.statValue, { color: colors.error }]}>
                {failed}
              </Text>
            </View>
          )}
        </Card>

        {/* Success Message */}
        {imported > 0 && (
          <Card style={[styles.messageCard, { backgroundColor: colors.success + '1A', borderColor: colors.success + '50', borderWidth: 1 }]}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={colors.success}
            />
            <Text style={[styles.messageText, { color: colors.text }]}>
              {imported} {imported === 1 ? 'trip has' : 'trips have'} been successfully
              created and are now available in your trip list.
            </Text>
          </Card>
        )}

        {/* Warning Message */}
        {skipped > 0 && (
          <Card style={[styles.messageCard, { backgroundColor: colors.warning + '1A', borderColor: colors.warning + '50', borderWidth: 1 }]}>
            <MaterialCommunityIcons
              name="alert"
              size={24}
              color={colors.warning}
            />
            <Text style={[styles.messageText, { color: colors.text }]}>
              {skipped} {skipped === 1 ? 'row was' : 'rows were'} skipped because they
              contained duplicate delivery references or validation errors.
            </Text>
          </Card>
        )}

        {/* Error Message */}
        {failed > 0 && (
          <Card style={[styles.messageCard, { backgroundColor: colors.error + '1A', borderColor: colors.error + '50', borderWidth: 1 }]}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={24}
              color={colors.error}
            />
            <Text style={[styles.messageText, { color: colors.text }]}>
              {failed} {failed === 1 ? 'row' : 'rows'} failed to import due to errors.
              Check the import history for details.
            </Text>
          </Card>
        )}

        {/* Next Steps */}
        <Card style={styles.nextStepsCard}>
          <Text style={[styles.nextStepsTitle, { color: colors.text }]}>
            What's Next?
          </Text>

          {imported > 0 && (
            <TouchableOpacity
              onPress={handleViewTrips}
              style={styles.nextStepItem}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="truck-delivery"
                size={24}
                color={colors.primary}
              />
              <View style={styles.nextStepContent}>
                <Text style={[styles.nextStepTitle, { color: colors.text }]}>
                  View Imported Trips
                </Text>
                <Text style={[styles.nextStepDesc, { color: colors.textSecondary }]}>
                  Review and assign resources to your new trips
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleViewHistory}
            style={styles.nextStepItem}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="history"
              size={24}
              color={colors.primary}
            />
            <View style={styles.nextStepContent}>
              <Text style={[styles.nextStepTitle, { color: colors.text }]}>
                View Import History
              </Text>
              <Text style={[styles.nextStepDesc, { color: colors.textSecondary }]}>
                See detailed logs of all imports
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNewImport}
            style={styles.nextStepItem}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="plus-circle"
              size={24}
              color={colors.primary}
            />
            <View style={styles.nextStepContent}>
              <Text style={[styles.nextStepTitle, { color: colors.text }]}>
                Start New Import
              </Text>
              <Text style={[styles.nextStepDesc, { color: colors.textSecondary }]}>
                Import another delivery schedule
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </Card>

        {/* Report ID */}
        {params.reportId && (
          <View style={styles.reportIdContainer}>
            <Text style={[styles.reportIdLabel, { color: colors.textSecondary }]}>
              Import Report ID
            </Text>
            <Text style={[styles.reportIdValue, { color: colors.textSecondary }]}>
              {params.reportId}
            </Text>
          </View>
        )}
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
  statusHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 24,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: 16,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    alignItems: 'center',
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 16,
    gap: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  nextStepsCard: {
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  nextStepDesc: {
    fontSize: 13,
  },
  reportIdContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  reportIdLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  reportIdValue: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
});

