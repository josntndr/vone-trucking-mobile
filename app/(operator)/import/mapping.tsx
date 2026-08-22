/**
 * Column Mapping Screen
 * Maps spreadsheet columns to Vone Trucking fields with preset support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { Button } from '../../../src/components/ui/Button';
import {
  readSpreadsheetData,
  getColumnMappingPresets,
  saveColumnMappingPreset,
} from '../../../src/services/api/import.service';
import type {
  ColumnMapping,
  ColumnMappingPreset,
  VoneTruckingField,
  ImportSource,
} from '../../../src/types/import.types';
import { FIELD_METADATA, getRequiredFields } from '../../../src/types/import.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function MappingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<any[][]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [presets, setPresets] = useState<ColumnMappingPreset[]>([]);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load spreadsheet data
      const dataResponse = await readSpreadsheetData(
        params.spreadsheetId as string,
        params.sheetName as string
      );

      if (dataResponse.error) {
        Alert.alert('Error', dataResponse.error);
        return;
      }

      if (dataResponse.data) {
        setHeaders(dataResponse.data.headers);
        setSampleRows(dataResponse.data.rows.slice(0, 3)); // Show first 3 rows as sample

        // Initialize empty mappings
        const initialMappings: ColumnMapping[] = dataResponse.data.headers.map(
          (header, index) => ({
            spreadsheet_column: header,
            spreadsheet_column_index: index,
            vone_field: '' as VoneTruckingField,
            sample_values: dataResponse.data.rows
              .slice(0, 3)
              .map((row) => row[index])
              .filter(Boolean),
          })
        );
        setMappings(initialMappings);

        // Try auto-mapping based on column names
        autoMapColumns(initialMappings);
      }

      // Load saved presets
      const presetsResponse = await getColumnMappingPresets(ImportSource.GOOGLE_SHEETS);
      if (presetsResponse.data) {
        setPresets(presetsResponse.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load spreadsheet data');
    } finally {
      setLoading(false);
    }
  };

  const autoMapColumns = (initialMappings: ColumnMapping[]) => {
    // Auto-map based on common column name patterns
    const autoMapped = initialMappings.map((mapping) => {
      const columnName = mapping.spreadsheet_column.toLowerCase();
      
      let voneField: VoneTruckingField | '' = '';

      if (columnName.includes('delivery') && columnName.includes('ref')) {
        voneField = 'delivery_reference' as VoneTruckingField;
      } else if (columnName.includes('date') && !columnName.includes('time')) {
        voneField = 'delivery_date' as VoneTruckingField;
      } else if (columnName.includes('time') || columnName.includes('call')) {
        voneField = 'call_time' as VoneTruckingField;
      } else if (columnName.includes('warehouse') || columnName.includes('pickup')) {
        voneField = 'pickup_warehouse' as VoneTruckingField;
      } else if (columnName.includes('destination') && !columnName.includes('address')) {
        voneField = 'delivery_destination' as VoneTruckingField;
      } else if (columnName.includes('address')) {
        voneField = 'delivery_address' as VoneTruckingField;
      } else if (columnName.includes('store') || columnName.includes('branch')) {
        voneField = 'store_branch' as VoneTruckingField;
      } else if (columnName.includes('product') || columnName.includes('cargo')) {
        voneField = 'cargo_description' as VoneTruckingField;
      } else if (columnName.includes('weight')) {
        voneField = 'cargo_weight' as VoneTruckingField;
      } else if (columnName.includes('volume')) {
        voneField = 'cargo_volume' as VoneTruckingField;
      } else if (columnName.includes('items') || columnName.includes('quantity')) {
        voneField = 'number_of_items' as VoneTruckingField;
      } else if (columnName.includes('truck') && !columnName.includes('plate')) {
        voneField = 'truck_number' as VoneTruckingField;
      } else if (columnName.includes('plate')) {
        voneField = 'plate_number' as VoneTruckingField;
      } else if (columnName.includes('driver')) {
        voneField = 'driver_name' as VoneTruckingField;
      } else if (columnName.includes('porter') || columnName.includes('helper')) {
        voneField = 'porter_name' as VoneTruckingField;
      } else if (columnName.includes('income') || columnName.includes('amount')) {
        voneField = 'expected_income' as VoneTruckingField;
      } else if (columnName.includes('instruction')) {
        voneField = 'special_instructions' as VoneTruckingField;
      }

      return { ...mapping, vone_field: voneField };
    });

    setMappings(autoMapped);
  };

  const handleMappingChange = (index: number, field: VoneTruckingField | '') => {
    const newMappings = [...mappings];
    newMappings[index].vone_field = field;
    setMappings(newMappings);
  };

  const handleLoadPreset = (preset: ColumnMappingPreset) => {
    // Map preset mappings to current spreadsheet
    const newMappings = headers.map((header, index) => {
      const presetMapping = preset.mappings.find(
        (m) => m.spreadsheet_column === header
      );

      return {
        spreadsheet_column: header,
        spreadsheet_column_index: index,
        vone_field: presetMapping?.vone_field || ('' as VoneTruckingField),
        sample_values: sampleRows
          .map((row) => row[index])
          .filter(Boolean),
      };
    });

    setMappings(newMappings);
    setShowPresetModal(false);
    Alert.alert('Preset Loaded', `Mapping "${preset.name}" has been applied`);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for this preset');
      return;
    }

    const response = await saveColumnMappingPreset(
      presetName.trim(),
      presetDescription.trim(),
      ImportSource.GOOGLE_SHEETS,
      mappings.filter((m) => m.vone_field) // Only save mapped columns
    );

    if (response.error) {
      Alert.alert('Error', response.error);
      return;
    }

    setShowSaveModal(false);
    setPresetName('');
    setPresetDescription('');
    Alert.alert('Success', 'Mapping preset saved successfully');
    
    // Reload presets
    const presetsResponse = await getColumnMappingPresets(ImportSource.GOOGLE_SHEETS);
    if (presetsResponse.data) {
      setPresets(presetsResponse.data);
    }
  };

  const handleContinue = () => {
    // Validate that all required fields are mapped
    const requiredFields = getRequiredFields();
    const mappedFields = mappings
      .filter((m) => m.vone_field)
      .map((m) => m.vone_field);

    const missingFields = requiredFields.filter(
      (field) => !mappedFields.includes(field)
    );

    if (missingFields.length > 0) {
      const missingLabels = missingFields
        .map((field) => FIELD_METADATA[field].label)
        .join(', ');

      Alert.alert(
        'Missing Required Fields',
        `The following required fields must be mapped: ${missingLabels}`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Navigate to preview screen
    router.push({
      pathname: '/(operator)/import/preview',
      params: {
        spreadsheetId: params.spreadsheetId,
        spreadsheetName: params.spreadsheetName,
        sheetName: params.sheetName,
        mappings: JSON.stringify(mappings.filter((m) => m.vone_field)),
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading spreadsheet data...
        </Text>
      </View>
    );
  }

  const mappedCount = mappings.filter((m) => m.vone_field).length;
  const requiredMappedCount = mappings.filter(
    (m) => m.vone_field && FIELD_METADATA[m.vone_field]?.required
  ).length;
  const requiredFieldsCount = getRequiredFields().length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Text style={[styles.title, { color: colors.text }]}>
            Map Columns to Fields
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {params.spreadsheetName} - {params.sheetName}
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {mappedCount}/{headers.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Mapped
              </Text>
            </View>
            <View style={styles.stat}>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      requiredMappedCount === requiredFieldsCount
                        ? colors.success
                        : colors.error,
                  },
                ]}
              >
                {requiredMappedCount}/{requiredFieldsCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Required
              </Text>
            </View>
          </View>

          <View style={styles.presetButtons}>
            <TouchableOpacity
              onPress={() => setShowPresetModal(true)}
              style={[styles.presetButton, { backgroundColor: colors.surface }]}
            >
              <MaterialCommunityIcons
                name="folder-open"
                size={16}
                color={colors.primary}
              />
              <Text style={[styles.presetButtonText, { color: colors.primary }]}>
                Load Preset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowSaveModal(true)}
              style={[styles.presetButton, { backgroundColor: colors.surface }]}
              disabled={mappedCount === 0}
            >
              <MaterialCommunityIcons
                name="content-save"
                size={16}
                color={mappedCount > 0 ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.presetButtonText,
                  { color: mappedCount > 0 ? colors.primary : colors.textSecondary },
                ]}
              >
                Save Preset
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Mappings */}
        {mappings.map((mapping, index) => {
          const isRequired = mapping.vone_field && FIELD_METADATA[mapping.vone_field]?.required;
          const isMapped = !!mapping.vone_field;

          return (
            <Card key={index} style={styles.mappingCard}>
              <View style={styles.mappingHeader}>
                <View style={styles.columnInfo}>
                  <Text style={[styles.columnName, { color: colors.text }]}>
                    {mapping.spreadsheet_column}
                  </Text>
                  {mapping.sample_values && mapping.sample_values.length > 0 && (
                    <Text style={[styles.sampleText, { color: colors.textSecondary }]}>
                      Sample: {mapping.sample_values[0]}
                    </Text>
                  )}
                </View>
                {isRequired && (
                  <View style={[styles.requiredBadge, { backgroundColor: colors.errorLight }]}>
                    <Text style={[styles.requiredText, { color: colors.error }]}>
                      Required
                    </Text>
                  </View>
                )}
              </View>

              <View style={[styles.pickerContainer, { backgroundColor: colors.surface }]}>
                <Picker
                  selectedValue={mapping.vone_field}
                  onValueChange={(value) => handleMappingChange(index, value)}
                  style={[styles.picker, { color: colors.text }]}
                >
                  <Picker.Item label="-- Skip this column --" value="" />
                  {Object.values(FIELD_METADATA).map((field) => (
                    <Picker.Item
                      key={field.field}
                      label={`${field.label}${field.required ? ' *' : ''}`}
                      value={field.field}
                    />
                  ))}
                </Picker>
              </View>

              {mapping.vone_field && (
                <View style={styles.fieldInfo}>
                  <MaterialCommunityIcons
                    name="information"
                    size={16}
                    color={colors.primary}
                  />
                  <Text style={[styles.fieldDescription, { color: colors.textSecondary }]}>
                    {FIELD_METADATA[mapping.vone_field].description}
                  </Text>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Button
          title="Continue to Preview"
          onPress={handleContinue}
          fullWidth
          disabled={requiredMappedCount < requiredFieldsCount}
        />
      </View>

      {/* Load Preset Modal */}
      <Modal
        visible={showPresetModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPresetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Load Mapping Preset
              </Text>
              <TouchableOpacity onPress={() => setShowPresetModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {presets.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No saved presets yet. Create one after mapping your columns.
                </Text>
              ) : (
                presets.map((preset) => (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => handleLoadPreset(preset)}
                    style={[styles.presetItem, { backgroundColor: colors.background }]}
                  >
                    <View style={styles.presetItemHeader}>
                      <Text style={[styles.presetItemName, { color: colors.text }]}>
                        {preset.name}
                      </Text>
                      <Text style={[styles.presetItemCount, { color: colors.primary }]}>
                        {preset.mappings.length} fields
                      </Text>
                    </View>
                    {preset.description && (
                      <Text style={[styles.presetItemDesc, { color: colors.textSecondary }]}>
                        {preset.description}
                      </Text>
                    )}
                    <Text style={[styles.presetItemMeta, { color: colors.textSecondary }]}>
                      Used {preset.use_count} times
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Save Preset Modal */}
      <Modal
        visible={showSaveModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Save Mapping Preset
              </Text>
              <TouchableOpacity onPress={() => setShowSaveModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formContent}>
              <Text style={[styles.label, { color: colors.text }]}>Preset Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={presetName}
                onChangeText={setPresetName}
                placeholder="e.g., Liwayway January Format"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.label, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={presetDescription}
                onChangeText={setPresetDescription}
                placeholder="Optional description of this mapping"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {mappedCount} columns will be saved in this preset
              </Text>

              <Button
                title="Save Preset"
                onPress={handleSavePreset}
                fullWidth
                disabled={!presetName.trim()}
              />
            </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
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
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  mappingCard: {
    marginBottom: 12,
    padding: 16,
  },
  mappingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  columnInfo: {
    flex: 1,
  },
  columnName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sampleText: {
    fontSize: 12,
  },
  requiredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pickerContainer: {
    borderRadius: 8,
    marginBottom: 8,
  },
  picker: {
    height: 50,
  },
  fieldInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  fieldDescription: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 32,
  },
  presetItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  presetItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  presetItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  presetItemCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  presetItemDesc: {
    fontSize: 13,
    marginBottom: 4,
  },
  presetItemMeta: {
    fontSize: 11,
  },
  formContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  infoText: {
    fontSize: 13,
    marginBottom: 16,
  },
});

