/**
 * Import Preview Screen
 * Shows validation results and allows row selection for import
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
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { Button } from '../../../src/components/ui/Button';
import {
  readSpreadsheetData,
  validateImportData,
  importTrips,
} from '../../../src/services/api/import.service';
import {
  type ValidatedRow,
  type ValidationIssue,
  type ColumnMapping,
  type ImportSession,
  type ValidationSeverity,
  ImportSource,
  ImportStatus,
  FIELD_METADATA,
  getFieldLabel,
} from '../../../src/types/import.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PreviewScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [filterMode, setFilterMode] = useState<'all' | 'valid' | 'invalid' | 'duplicate'>('all');

  const mappings: ColumnMapping[] = JSON.parse(params.mappings as string);

  useEffect(() => {
    loadAndValidate();
  }, []);

  const loadAndValidate = async () => {
    setValidating(true);
    try {
      // Read spreadsheet data
      const dataResponse = await readSpreadsheetData(
        params.spreadsheetId as string,
        params.sheetName as string
      );

      if (dataResponse.error || !dataResponse.data) {
        Alert.alert('Error', dataResponse.error || 'Failed to read spreadsheet');
        return;
      }

      const { headers, rows } = dataResponse.data;

      // Validate data
      const validationResponse = await validateImportData(headers, rows, mappings);

      if (validationResponse.error || !validationResponse.data) {
        Alert.alert('Error', validationResponse.error || 'Failed to validate data');
        return;
      }

      setValidatedRows(validationResponse.data.validated_rows);
    } catch (error) {
      Alert.alert('Error', 'Failed to load and validate data');
    } finally {
      setLoading(false);
      setValidating(false);
    }
  };

  const toggleRowExpanded = (rowIndex: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowIndex)) {
      newExpanded.delete(rowIndex);
    } else {
      newExpanded.add(rowIndex);
    }
    setExpandedRows(newExpanded);
  };

  const toggleRowSelected = (rowIndex: number) => {
    const newRows = validatedRows.map((row) =>
      row.row_index === rowIndex
        ? { ...row, selected_for_import: !row.selected_for_import }
        : row
    );
    setValidatedRows(newRows);
  };

  const selectAll = () => {
    const newRows = validatedRows.map((row) => ({
      ...row,
      selected_for_import: row.is_valid && !row.is_duplicate,
    }));
    setValidatedRows(newRows);
  };

  const deselectAll = () => {
    const newRows = validatedRows.map((row) => ({
      ...row,
      selected_for_import: false,
    }));
    setValidatedRows(newRows);
  };

  const handleImport = async () => {
    const selectedRows = validatedRows.filter((row) => row.selected_for_import);

    if (selectedRows.length === 0) {
      Alert.alert('No Rows Selected', 'Please select at least one row to import');
      return;
    }

    Alert.alert(
      'Confirm Import',
      `Import ${selectedRows.length} ${selectedRows.length === 1 ? 'trip' : 'trips'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import',
          onPress: async () => {
            setImporting(true);
            try {
              const session: ImportSession = {
                id: `session_${Date.now()}`,
                source: ImportSource.GOOGLE_SHEETS,
                status: ImportStatus.IMPORTING,
                spreadsheet_id: params.spreadsheetId as string,
                spreadsheet_name: params.spreadsheetName as string,
                sheet_name: params.sheetName as string,
                column_mappings: mappings,
                total_rows: validatedRows.length,
                valid_rows: validatedRows.filter((r) => r.is_valid).length,
                invalid_rows: validatedRows.filter((r) => !r.is_valid).length,
                duplicate_rows: validatedRows.filter((r) => r.is_duplicate).length,
                selected_rows: selectedRows.length,
                validated_rows: validatedRows,
                validation_issues: validatedRows.flatMap((r) => r.issues),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: 'current_user', // TODO: Get from auth
              };

              const response = await importTrips(session, selectedRows);

              if (response.error) {
                Alert.alert('Import Failed', response.error);
                return;
              }

              // Navigate to results screen
              router.replace({
                pathname: '/(operator)/import/results',
                params: {
                  reportId: response.data?.id,
                  imported: response.data?.imported_count || 0,
                  failed: response.data?.failed_count || 0,
                  skipped: response.data?.skipped_count || 0,
                },
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to import trips');
            } finally {
              setImporting(false);
            }
          },
        },
      ]
    );
  };

  const getFilteredRows = () => {
    switch (filterMode) {
      case 'valid':
        return validatedRows.filter((r) => r.is_valid && !r.is_duplicate);
      case 'invalid':
        return validatedRows.filter((r) => !r.is_valid);
      case 'duplicate':
        return validatedRows.filter((r) => r.is_duplicate);
      default:
        return validatedRows;
    }
  };

  const getSeverityColor = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.primary;
    }
  };

  const getSeverityIcon = (severity: ValidationSeverity) => {
    switch (severity) {
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert';
      case 'info':
        return 'information';
    }
  };

  const renderValidationIssue = (issue: ValidationIssue) => (
    <View key={`${issue.row_index}-${issue.field}`} style={styles.issueItem}>
      <MaterialCommunityIcons
        name={getSeverityIcon(issue.severity)}
        size={16}
        color={getSeverityColor(issue.severity)}
      />
      <View style={styles.issueContent}>
        <Text style={[styles.issueMessage, { color: colors.text }]}>
          {issue.message}
        </Text>
        {issue.suggestion && (
          <Text style={[styles.issueSuggestion, { color: colors.textSecondary }]}>
            {issue.suggestion}
          </Text>
        )}
      </View>
    </View>
  );

  const renderRow = ({ item }: { item: ValidatedRow }) => {
    const isExpanded = expandedRows.has(item.row_index);
    const hasErrors = item.issues.some((i) => i.severity === 'error');
    const hasWarnings = item.issues.some((i) => i.severity === 'warning');

    return (
      <Card style={styles.rowCard}>
        <TouchableOpacity
          onPress={() => toggleRowExpanded(item.row_index)}
          activeOpacity={0.7}
        >
          <View style={styles.rowHeader}>
            <View style={styles.rowHeaderLeft}>
              <TouchableOpacity
                onPress={() => toggleRowSelected(item.row_index)}
                disabled={!item.is_valid || item.is_duplicate}
              >
                <MaterialCommunityIcons
                  name={
                    item.selected_for_import
                      ? 'checkbox-marked'
                      : 'checkbox-blank-outline'
                  }
                  size={24}
                  color={
                    item.is_valid && !item.is_duplicate
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
              </TouchableOpacity>

              <View style={styles.rowInfo}>
                <Text style={[styles.rowNumber, { color: colors.text }]}>
                  Row {item.row_index + 1}
                </Text>
                <Text style={[styles.rowReference, { color: colors.textSecondary }]}>
                  {item.parsed_data.delivery_reference || 'No reference'}
                </Text>
              </View>
            </View>

            <View style={styles.rowHeaderRight}>
              {item.is_duplicate && (
                <View style={[styles.badge, { backgroundColor: colors.errorLight }]}>
                  <Text style={[styles.badgeText, { color: colors.error }]}>
                    Duplicate
                  </Text>
                </View>
              )}
              {!item.is_duplicate && item.is_valid && (
                <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
                  <Text style={[styles.badgeText, { color: colors.success }]}>
                    Valid
                  </Text>
                </View>
              )}
              {!item.is_duplicate && !item.is_valid && hasErrors && (
                <View style={[styles.badge, { backgroundColor: colors.errorLight }]}>
                  <Text style={[styles.badgeText, { color: colors.error }]}>
                    {item.issues.filter((i) => i.severity === 'error').length} Errors
                  </Text>
                </View>
              )}
              {!item.is_duplicate && !item.is_valid && !hasErrors && hasWarnings && (
                <View style={[styles.badge, { backgroundColor: colors.warningLight }]}>
                  <Text style={[styles.badgeText, { color: colors.warning }]}>
                    Warnings
                  </Text>
                </View>
              )}

              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={colors.textSecondary}
              />
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.rowDetails}>
            {/* Validation Issues */}
            {item.issues.length > 0 && (
              <View style={styles.issuesSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Validation Issues
                </Text>
                {item.issues.map(renderValidationIssue)}
              </View>
            )}

            {/* Parsed Data */}
            <View style={styles.dataSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Data Preview
              </Text>
              {Object.entries(item.parsed_data).map(([field, value]) => {
                if (!value) return null;
                return (
                  <View key={field} style={styles.dataRow}>
                    <Text style={[styles.dataLabel, { color: colors.textSecondary }]}>
                      {getFieldLabel(field as any)}:
                    </Text>
                    <Text style={[styles.dataValue, { color: colors.text }]}>
                      {value}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </Card>
    );
  };

  if (loading || validating) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          {validating ? 'Validating data...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  const totalRows = validatedRows.length;
  const validRows = validatedRows.filter((r) => r.is_valid && !r.is_duplicate).length;
  const invalidRows = validatedRows.filter((r) => !r.is_valid).length;
  const duplicateRows = validatedRows.filter((r) => r.is_duplicate).length;
  const selectedRows = validatedRows.filter((r) => r.selected_for_import).length;

  const filteredRows = getFilteredRows();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Stats Header */}
      <Card style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>{totalRows}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>{validRows}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Valid</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.error }]}>{invalidRows}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Invalid</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{duplicateRows}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Duplicate</Text>
          </View>
        </View>

        <View style={styles.selectedInfo}>
          <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
          <Text style={[styles.selectedText, { color: colors.text }]}>
            {selectedRows} {selectedRows === 1 ? 'row' : 'rows'} selected for import
          </Text>
        </View>
      </Card>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <TouchableOpacity
          onPress={() => setFilterMode('all')}
          style={[
            styles.filterChip,
            {
              backgroundColor: filterMode === 'all' ? colors.primary : colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: filterMode === 'all' ? '#fff' : colors.text },
            ]}
          >
            All ({totalRows})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterMode('valid')}
          style={[
            styles.filterChip,
            {
              backgroundColor: filterMode === 'valid' ? colors.success : colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: filterMode === 'valid' ? '#fff' : colors.text },
            ]}
          >
            Valid ({validRows})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterMode('invalid')}
          style={[
            styles.filterChip,
            {
              backgroundColor: filterMode === 'invalid' ? colors.error : colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: filterMode === 'invalid' ? '#fff' : colors.text },
            ]}
          >
            Invalid ({invalidRows})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilterMode('duplicate')}
          style={[
            styles.filterChip,
            {
              backgroundColor: filterMode === 'duplicate' ? colors.warning : colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: filterMode === 'duplicate' ? '#fff' : colors.text },
            ]}
          >
            Duplicate ({duplicateRows})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Selection Actions */}
      <View style={styles.actionsBar}>
        <TouchableOpacity onPress={selectAll} style={styles.actionButton}>
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>
            Select All Valid
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={deselectAll} style={styles.actionButton}>
          <Text style={[styles.actionButtonText, { color: colors.primary }]}>
            Deselect All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rows List */}
      <FlatList
        data={filteredRows}
        renderItem={renderRow}
        keyExtractor={(item) => item.row_index.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No rows match the current filter
            </Text>
          </View>
        }
      />

      {/* Import Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Button
          onPress={handleImport}
          fullWidth
          disabled={selectedRows === 0 || importing}
        >
          {importing ? 'Importing...' : `Import ${selectedRows} Trips`}
        </Button>
      </View>
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
  statsCard: {
    margin: 16,
    marginBottom: 8,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    maxHeight: 50,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  rowCard: {
    marginBottom: 12,
    padding: 16,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowInfo: {
    marginLeft: 12,
  },
  rowNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  rowReference: {
    fontSize: 12,
  },
  rowHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rowDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  issuesSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  issueContent: {
    flex: 1,
  },
  issueMessage: {
    fontSize: 13,
    marginBottom: 2,
  },
  issueSuggestion: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  dataSection: {
    marginTop: 8,
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dataLabel: {
    fontSize: 12,
    width: 120,
  },
  dataValue: {
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

