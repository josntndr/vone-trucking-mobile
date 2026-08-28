// @ts-nocheck - TODO: Fix type errors
/**
 * Fuel Recording Card Component (Driver)
 * 
 * Driver interface for recording fuel purchases with receipt upload,
 * odometer tracking, and auto-validation.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { FuelRecord } from '../../types/fuel.types';
import { fuelRecordingService } from '../../services/fuel/FuelRecordingService';

interface FuelRecordingCardProps {
  tripId: string;
  truckId: string;
  driverId: string;
  onRecorded?: (record: FuelRecord) => void;
}

export const FuelRecordingCard: React.FC<FuelRecordingCardProps> = ({
  tripId,
  truckId,
  driverId,
  onRecorded,
}) => {
  const [litres, setLitres] = useState('');
  const [pricePerLitre, setPricePerLitre] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [stationName, setStationName] = useState('');
  const [odometer, setOdometer] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [explanation, setExplanation] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  /**
   * Auto-calculate total when litres or price changes
   */
  const handleLitresChange = (value: string) => {
    setLitres(value);
    if (value && pricePerLitre) {
      const calculated = fuelRecordingService.constructor.calculateTotal(
        parseFloat(value),
        parseFloat(pricePerLitre)
      );
      setTotalAmount(calculated.toString());
    }
  };

  const handlePriceChange = (value: string) => {
    setPricePerLitre(value);
    if (litres && value) {
      const calculated = fuelRecordingService.constructor.calculateTotal(
        parseFloat(litres),
        parseFloat(value)
      );
      setTotalAmount(calculated.toString());
    }
  };

  /**
   * Auto-calculate litres when total or price changes
   */
  const handleTotalChange = (value: string) => {
    setTotalAmount(value);
    if (value && pricePerLitre && !litres) {
      const calculated = fuelRecordingService.constructor.calculateLitres(
        parseFloat(value),
        parseFloat(pricePerLitre)
      );
      setLitres(calculated.toString());
    }
  };

  /**
   * Pick receipt photo from gallery
   */
  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permission is needed to upload receipts');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptPhoto(result.assets[0].uri);
    }
  };

  /**
   * Take receipt photo with camera
   */
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptPhoto(result.assets[0].uri);
    }
  };

  /**
   * Validate and submit fuel record
   */
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!litres || !pricePerLitre || !totalAmount || !stationName || !odometer) {
        Alert.alert('Missing Information', 'Please fill in all required fields');
        return;
      }

      // Create record
      const record = await fuelRecordingService.createRecord({
        trip_id: tripId,
        truck_id: truckId,
        driver_id: driverId,
        litres_purchased: parseFloat(litres),
        price_per_litre: parseFloat(pricePerLitre),
        total_amount: parseFloat(totalAmount),
        fuel_station_name: stationName,
        odometer_reading: parseFloat(odometer),
        purchase_date: new Date().toISOString(),
        receipt_photo_url: receiptPhoto || undefined,
        receipt_number: receiptNumber || undefined,
        notes: notes || undefined,
      });

      // Add explanation if required
      let finalRecord = record;
      if (record.requires_explanation && explanation) {
        finalRecord = fuelRecordingService.addExplanation(record, explanation);
      }

      // Show validation results
      if (record.validation_issues && record.validation_issues.length > 0) {
        setShowValidation(true);
        Alert.alert(
          'Validation Issues',
          record.validation_issues.join('\n') + '\n\nPlease review and add explanation if needed.',
          [
            { text: 'Review', style: 'cancel' },
            {
              text: 'Submit Anyway',
              onPress: () => {
                if (onRecorded) onRecorded(finalRecord);
                clearForm();
              },
            },
          ]
        );
      } else {
        if (onRecorded) onRecorded(finalRecord);
        Alert.alert('Success', 'Fuel purchase recorded successfully');
        clearForm();
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to record fuel purchase'
      );
    }
  };

  /**
   * Clear form
   */
  const clearForm = () => {
    setLitres('');
    setPricePerLitre('');
    setTotalAmount('');
    setStationName('');
    setOdometer('');
    setReceiptPhoto(null);
    setReceiptNumber('');
    setNotes('');
    setExplanation('');
    setShowValidation(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="receipt" size={24} color="#1F2937" />
        <Text style={styles.headerTitle}>Record Fuel Purchase</Text>
      </View>

      {/* Fuel Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fuel Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Litres Purchased *</Text>
          <TextInput
            style={styles.input}
            value={litres}
            onChangeText={handleLitresChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Price per Litre ($) *</Text>
          <TextInput
            style={styles.input}
            value={pricePerLitre}
            onChangeText={handlePriceChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Total Amount ($) *</Text>
          <TextInput
            style={styles.input}
            value={totalAmount}
            onChangeText={handleTotalChange}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
          <Text style={styles.helpText}>
            Auto-calculated from litres × price
          </Text>
        </View>
      </View>

      {/* Station Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Station Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fuel Station Name *</Text>
          <TextInput
            style={styles.input}
            value={stationName}
            onChangeText={setStationName}
            placeholder="e.g., Shell, BP, etc."
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Odometer Reading (km) *</Text>
          <TextInput
            style={styles.input}
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="number-pad"
            placeholder="Current odometer"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Receipt Number</Text>
          <TextInput
            style={styles.input}
            value={receiptNumber}
            onChangeText={setReceiptNumber}
            placeholder="Optional"
          />
        </View>
      </View>

      {/* Receipt Photo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receipt Photo</Text>
        
        {!receiptPhoto ? (
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={24} color="#3B82F6" />
              <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={handlePickPhoto}>
              <Ionicons name="images" size={24} color="#3B82F6" />
              <Text style={styles.photoButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoPreview}>
            <Image source={{ uri: receiptPhoto }} style={styles.photoImage} />
            <TouchableOpacity
              style={styles.photoRemove}
              onPress={() => setReceiptPhoto(null)}
            >
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any additional notes..."
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Explanation (if validation issues) */}
      {showValidation && (
        <View style={styles.section}>
          <View style={styles.warningHeader}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.warningTitle}>Explanation Required</Text>
          </View>
          <Text style={styles.warningText}>
            Please explain any discrepancies or unusual values
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={explanation}
            onChangeText={setExplanation}
            placeholder="Explanation (minimum 20 characters)..."
            multiline
            numberOfLines={4}
          />
        </View>
      )}

      {/* Submit Button */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Submit Fuel Record</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 8,
  },
  photoPreview: {
    position: 'relative',
    alignItems: 'center',
  },
  photoImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  photoRemove: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 12,
  },
  actions: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
