/**
 * Spreadsheet Selection Screen
 * Shows available Google Sheets for import
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { getSpreadsheets } from '../../../src/services/api/import.service';
import type { GoogleSpreadsheet, GoogleSheet } from '../../../src/types/import.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SpreadsheetsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [spreadsheets, setSpreadsheets] = useState<GoogleSpreadsheet[]>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<GoogleSpreadsheet | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<GoogleSheet | null>(null);

  useEffect(() => {
    loadSpreadsheets();
  }, []);

  const loadSpreadsheets = async () => {
    try {
      const response = await getSpreadsheets();
      
      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      if (response.data) {
        setSpreadsheets(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load spreadsheets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSpreadsheets();
  };

  const handleSelectSpreadsheet = (spreadsheet: GoogleSpreadsheet) => {
    setSelectedSpreadsheet(spreadsheet);
    // Auto-select first sheet if only one
    if (spreadsheet.sheets.length === 1) {
      setSelectedSheet(spreadsheet.sheets[0]);
    } else {
      setSelectedSheet(null);
    }
  };

  const handleSelectSheet = (sheet: GoogleSheet) => {
    setSelectedSheet(sheet);
  };

  const handleContinue = () => {
    if (!selectedSpreadsheet || !selectedSheet) {
      Alert.alert('Selection Required', 'Please select a spreadsheet and sheet to continue');
      return;
    }

    // Navigate to mapping screen with selected spreadsheet and sheet
    router.push({
      pathname: '/(operator)/import/mapping',
      params: {
        spreadsheetId: selectedSpreadsheet.spreadsheet_id,
        spreadsheetName: selectedSpreadsheet.name,
        sheetName: selectedSheet.title,
        sheetId: selectedSheet.sheet_id.toString(),
      },
    });
  };

  const renderSpreadsheetItem = ({ item }: { item: GoogleSpreadsheet }) => {
    const isSelected = selectedSpreadsheet?.spreadsheet_id === item.spreadsheet_id;
    const lastModified = new Date(item.last_modified);
    const daysAgo = Math.floor((Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24));

    return (
      <TouchableOpacity
        onPress={() => handleSelectSpreadsheet(item)}
        activeOpacity={0.7}
      >
        <Card
          style={[
            styles.spreadsheetCard,
            isSelected && { borderColor: colors.primary, borderWidth: 2 },
          ]}
        >
          <View style={styles.spreadsheetHeader}>
            <MaterialCommunityIcons
              name="file-document"
              size={24}
              color={isSelected ? colors.primary : colors.textSecondary}
            />
            <View style={styles.spreadsheetInfo}>
              <Text style={[styles.spreadsheetName, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.spreadsheetOwner, { color: colors.textSecondary }]}>
                Owner: {item.owner}
              </Text>
              <Text style={[styles.spreadsheetMeta, { color: colors.textSecondary }]}>
                {item.sheets.length} {item.sheets.length === 1 ? 'sheet' : 'sheets'} •{' '}
                {daysAgo === 0 ? 'Updated today' : `Updated ${daysAgo}d ago`}
              </Text>
            </View>
            {isSelected && (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={colors.success}
              />
            )}
          </View>

          {/* Show sheets if spreadsheet is selected */}
          {isSelected && item.sheets.length > 1 && (
            <View style={styles.sheetsContainer}>
              <Text style={[styles.sheetsTitle, { color: colors.text }]}>
                Select a sheet:
              </Text>
              {item.sheets.map((sheet) => {
                const isSheetSelected = selectedSheet?.sheet_id === sheet.sheet_id;
                return (
                  <TouchableOpacity
                    key={sheet.sheet_id}
                    onPress={() => handleSelectSheet(sheet)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.sheetItem,
                        {
                          backgroundColor: isSheetSelected
                            ? colors.primaryLight
                            : colors.surface,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="table"
                        size={20}
                        color={isSheetSelected ? colors.primary : colors.textSecondary}
                      />
                      <View style={styles.sheetInfo}>
                        <Text
                          style={[
                            styles.sheetName,
                            {
                              color: isSheetSelected ? colors.primary : colors.text,
                              fontWeight: isSheetSelected ? '600' : '400',
                            },
                          ]}
                        >
                          {sheet.title}
                        </Text>
                        <Text style={[styles.sheetMeta, { color: colors.textSecondary }]}>
                          {sheet.row_count} rows × {sheet.column_count} columns
                        </Text>
                      </View>
                      {isSheetSelected && (
                        <MaterialCommunityIcons
                          name="check"
                          size={20}
                          color={colors.primary}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading spreadsheets...
        </Text>
      </View>
    );
  }

  if (spreadsheets.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons
          name="file-document-outline"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No Spreadsheets Found
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No accessible spreadsheets found. Make sure Liwayway has shared their
          delivery schedule with your Google account.
        </Text>
        <TouchableOpacity
          onPress={handleRefresh}
          style={[styles.refreshButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={spreadsheets}
        renderItem={renderSpreadsheetItem}
        keyExtractor={(item) => item.spreadsheet_id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Available Spreadsheets
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Select a spreadsheet and sheet to import delivery schedules
            </Text>
          </View>
        }
      />

      {/* Continue Button */}
      {selectedSpreadsheet && selectedSheet && (
        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            onPress={handleContinue}
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue to Mapping</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 24,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  spreadsheetCard: {
    marginBottom: 16,
    padding: 16,
  },
  spreadsheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  spreadsheetInfo: {
    flex: 1,
    marginLeft: 12,
  },
  spreadsheetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 22,
  },
  spreadsheetOwner: {
    fontSize: 13,
    marginBottom: 2,
  },
  spreadsheetMeta: {
    fontSize: 12,
  },
  sheetsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sheetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sheetInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sheetName: {
    fontSize: 14,
    marginBottom: 2,
  },
  sheetMeta: {
    fontSize: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

