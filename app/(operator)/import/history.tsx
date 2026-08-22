/**
 * Import History Screen
 * Shows audit log of all imports with detailed reports
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { getImportReports } from '../../../src/services/api/import.service';
import type { ImportReport } from '../../../src/types/import.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<ImportReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ImportReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await getImportReports(1, 50);

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      if (response.data) {
        setReports(response.data.reports);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load import history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const handleViewDetails = (report: ImportReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const renderReportItem = ({ item }: { item: ImportReport }) => {
    const date = new Date(item.created_at);
    const hasErrors = item.failed_count > 0;
    const hasSkipped = item.skipped_count > 0;

    return (
      <TouchableOpacity
        onPress={() => handleViewDetails(item)}
        activeOpacity={0.7}
      >
        <Card style={styles.reportCard}>
          <View style={styles.reportHeader}>
            <View style={styles.reportInfo}>
              <Text style={[styles.reportDate, { color: colors.text }]}>
                {date.toLocaleDateString('en-PH', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
              <Text style={[styles.reportTime, { color: colors.textSecondary }]}>
                {date.toLocaleTimeString('en-PH', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <View style={styles.reportStatus}>
              {hasErrors ? (
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={24}
                  color={colors.warning}
                />
              ) : (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={colors.success}
                />
              )}
            </View>
          </View>

          {item.spreadsheet_name && (
            <Text style={[styles.spreadsheetName, { color: colors.text }]}>
              {item.spreadsheet_name}
            </Text>
          )}

          <View style={styles.reportStats}>
            <View style={styles.reportStat}>
              <Text style={[styles.reportStatValue, { color: colors.success }]}>
                {item.imported_count}
              </Text>
              <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>
                Imported
              </Text>
            </View>

            {hasSkipped && (
              <View style={styles.reportStat}>
                <Text style={[styles.reportStatValue, { color: colors.warning }]}>
                  {item.skipped_count}
                </Text>
                <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>
                  Skipped
                </Text>
              </View>
            )}

            {hasErrors && (
              <View style={styles.reportStat}>
                <Text style={[styles.reportStatValue, { color: colors.error }]}>
                  {item.failed_count}
                </Text>
                <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>
                  Failed
                </Text>
              </View>
            )}

            <View style={styles.reportStat}>
              <Text style={[styles.reportStatValue, { color: colors.textSecondary }]}>
                {item.total_rows}
              </Text>
              <Text style={[styles.reportStatLabel, { color: colors.textSecondary }]}>
                Total
              </Text>
            </View>
          </View>

          <View style={styles.viewDetailsLink}>
            <Text style={[styles.viewDetailsText, { color: colors.primary }]}>
              View Details
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color={colors.primary}
            />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading import history...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="history"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Import History
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Your import history will appear here after you complete your first import.
            </Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Import Details
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedReport && (
              <ScrollView style={styles.modalScroll}>
                {/* Summary */}
                <View style={styles.detailSection}>
                  <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                    Summary
                  </Text>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Date:
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {new Date(selectedReport.created_at).toLocaleString('en-PH')}
                    </Text>
                  </View>
                  {selectedReport.spreadsheet_name && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Source:
                      </Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {selectedReport.spreadsheet_name}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Total Rows:
                    </Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {selectedReport.total_rows}
                    </Text>
                  </View>
                </View>

                {/* Imported Trips */}
                {selectedReport.imported_trips.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                      Successfully Imported ({selectedReport.imported_trips.length})
                    </Text>
                    {selectedReport.imported_trips.map((trip, index) => (
                      <View
                        key={index}
                        style={[
                          styles.tripItem,
                          { backgroundColor: colors.successLight },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={16}
                          color={colors.success}
                        />
                        <View style={styles.tripInfo}>
                          <Text style={[styles.tripNumber, { color: colors.text }]}>
                            {trip.trip_number}
                          </Text>
                          <Text
                            style={[styles.tripReference, { color: colors.textSecondary }]}
                          >
                            {trip.delivery_reference}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Skipped Rows */}
                {selectedReport.skipped_rows.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                      Skipped Rows ({selectedReport.skipped_rows.length})
                    </Text>
                    {selectedReport.skipped_rows.map((row, index) => (
                      <View
                        key={index}
                        style={[
                          styles.errorItem,
                          { backgroundColor: colors.warningLight },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="skip-next"
                          size={16}
                          color={colors.warning}
                        />
                        <View style={styles.errorInfo}>
                          <Text style={[styles.errorRow, { color: colors.text }]}>
                            Row {row.row_index + 1}
                            {row.delivery_reference && ` - ${row.delivery_reference}`}
                          </Text>
                          <Text style={[styles.errorReason, { color: colors.textSecondary }]}>
                            {row.reason}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Failed Rows */}
                {selectedReport.failed_rows.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailSectionTitle, { color: colors.text }]}>
                      Failed Rows ({selectedReport.failed_rows.length})
                    </Text>
                    {selectedReport.failed_rows.map((row, index) => (
                      <View
                        key={index}
                        style={[
                          styles.errorItem,
                          { backgroundColor: colors.errorLight },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={16}
                          color={colors.error}
                        />
                        <View style={styles.errorInfo}>
                          <Text style={[styles.errorRow, { color: colors.text }]}>
                            Row {row.row_index + 1}
                            {row.delivery_reference && ` - ${row.delivery_reference}`}
                          </Text>
                          <Text style={[styles.errorReason, { color: colors.textSecondary }]}>
                            {row.error_message}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Report ID */}
                <View style={styles.reportIdSection}>
                  <Text style={[styles.reportIdLabel, { color: colors.textSecondary }]}>
                    Report ID: {selectedReport.id}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  reportCard: {
    marginBottom: 16,
    padding: 16,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportInfo: {
    flex: 1,
  },
  reportDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  reportTime: {
    fontSize: 13,
  },
  reportStatus: {
    marginLeft: 12,
  },
  spreadsheetName: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  reportStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reportStat: {
    flex: 1,
    alignItems: 'center',
  },
  reportStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  reportStatLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  viewDetailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalScroll: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    fontWeight: '500',
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  tripInfo: {
    flex: 1,
  },
  tripNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tripReference: {
    fontSize: 12,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  errorInfo: {
    flex: 1,
  },
  errorRow: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  errorReason: {
    fontSize: 12,
    lineHeight: 18,
  },
  reportIdSection: {
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  reportIdLabel: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
});

