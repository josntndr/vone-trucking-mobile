/**
 * Fuel & Receipts Screen
 * Record fuel, odometer, upload receipts
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Card } from '../../../src/components/common/Card';
import { Button } from '../../../src/components/ui/Button';
import {
  submitFuelEntry,
  submitReceipt,
  recordOdometerReading,
  getCurrentLocation,
  uploadPhoto,
} from '../../../src/services/api/driver-porter.service';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatPhilippinePeso } from '../../../src/utils/philippines';

export default function FuelReceiptsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const tripId = params.tripId as string;

  const [activeTab, setActiveTab] = useState<'fuel' | 'receipts' | 'odometer'>('fuel');
  const [submitting, setSubmitting] = useState(false);

  // Fuel form
  const [fuelStation, setFuelStation] = useState('');
  const [liters, setLiters] = useState('');
  const [cost, setCost] = useState('');
  const [fuelOdometer, setFuelOdometer] = useState('');
  const [fuelPhoto, setFuelPhoto] = useState<string | null>(null);

  // Receipt form
  const [receiptType, setReceiptType] = useState<'toll' | 'parking' | 'meal' | 'other'>('toll');
  const [receiptDescription, setReceiptDescription] = useState('');
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);

  // Odometer form
  const [odometerReading, setOdometerReading] = useState('');
  const [odometerType, setOdometerType] = useState<'start' | 'end'>('start');
  const [odometerPhoto, setOdometerPhoto] = useState<string | null>(null);

  const handleTakePhoto = (type: 'fuel' | 'receipt' | 'odometer') => {
    // TODO: Implement camera/photo picker
    Alert.alert('Photo Upload', 'Camera integration coming soon');
    // For now, simulate photo selection
    const mockPhotoUri = `photo_${Date.now()}.jpg`;
    if (type === 'fuel') setFuelPhoto(mockPhotoUri);
    else if (type === 'receipt') setReceiptPhoto(mockPhotoUri);
    else setOdometerPhoto(mockPhotoUri);
  };

  const handleSubmitFuel = async () => {
    if (!fuelStation.trim()) {
      Alert.alert('Required', 'Please enter fuel station name');
      return;
    }
    if (!liters || parseFloat(liters) <= 0) {
      Alert.alert('Required', 'Please enter valid liters amount');
      return;
    }
    if (!cost || parseFloat(cost) <= 0) {
      Alert.alert('Required', 'Please enter valid cost');
      return;
    }
    if (!fuelOdometer || parseInt(fuelOdometer) <= 0) {
      Alert.alert('Required', 'Please enter current odometer reading');
      return;
    }
    if (!fuelPhoto) {
      Alert.alert('Photo Required', 'Please take a photo of the receipt');
      return;
    }

    setSubmitting(true);
    try {
      const locationResponse = await getCurrentLocation();

      const response = await submitFuelEntry({
        trip_id: tripId,
        truck_id: 'current_truck_id', // TODO: Get from trip
        driver_id: 'current_driver_id',
        fuel_date: new Date().toISOString(),
        fuel_station: fuelStation.trim(),
        liters: parseFloat(liters),
        cost: parseFloat(cost),
        odometer_reading: parseInt(fuelOdometer),
        receipt_photo: fuelPhoto,
        location: locationResponse.data,
      });

      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert('Success', 'Fuel entry recorded', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFuelStation('');
              setLiters('');
              setCost('');
              setFuelOdometer('');
              setFuelPhoto(null);
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit fuel entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!receiptDescription.trim()) {
      Alert.alert('Required', 'Please enter description');
      return;
    }
    if (!receiptAmount || parseFloat(receiptAmount) <= 0) {
      Alert.alert('Required', 'Please enter valid amount');
      return;
    }
    if (!receiptPhoto) {
      Alert.alert('Photo Required', 'Please take a photo of the receipt');
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitReceipt({
        trip_id: tripId,
        receipt_type: receiptType,
        description: receiptDescription.trim(),
        amount: parseFloat(receiptAmount),
        receipt_date: new Date().toISOString(),
        receipt_photo: receiptPhoto,
        created_by: 'current_driver_id',
      });

      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert('Success', 'Receipt submitted', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setReceiptDescription('');
              setReceiptAmount('');
              setReceiptPhoto(null);
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit receipt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOdometer = async () => {
    if (!odometerReading || parseInt(odometerReading) <= 0) {
      Alert.alert('Required', 'Please enter valid odometer reading');
      return;
    }
    if (!odometerPhoto) {
      Alert.alert('Photo Required', 'Please take a photo of the odometer');
      return;
    }

    setSubmitting(true);
    try {
      const locationResponse = await getCurrentLocation();

      const response = await recordOdometerReading({
        trip_id: tripId,
        truck_id: 'current_truck_id',
        driver_id: 'current_driver_id',
        reading_type: odometerType,
        reading: parseInt(odometerReading),
        recorded_at: new Date().toISOString(),
        location: locationResponse.data,
        photo: odometerPhoto,
      });

      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        Alert.alert('Success', 'Odometer reading recorded', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setOdometerReading('');
              setOdometerPhoto(null);
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record odometer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'fuel' && [styles.activeTab, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('fuel')}
        >
          <MaterialCommunityIcons
            name="gas-station"
            size={24}
            color={activeTab === 'fuel' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'fuel' ? colors.primary : colors.textSecondary },
            ]}
          >
            Fuel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'receipts' && [styles.activeTab, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('receipts')}
        >
          <MaterialCommunityIcons
            name="receipt"
            size={24}
            color={activeTab === 'receipts' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'receipts' ? colors.primary : colors.textSecondary },
            ]}
          >
            Receipts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'odometer' && [styles.activeTab, { borderBottomColor: colors.primary }],
          ]}
          onPress={() => setActiveTab('odometer')}
        >
          <MaterialCommunityIcons
            name="counter"
            size={24}
            color={activeTab === 'odometer' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'odometer' ? colors.primary : colors.textSecondary },
            ]}
          >
            Odometer
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Fuel Tab */}
        {activeTab === 'fuel' && (
          <>
            <Card style={styles.card}>
              <Text style={[styles.label, { color: colors.text }]}>
                Fuel Station <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={fuelStation}
                onChangeText={setFuelStation}
                placeholder="e.g., Petron EDSA"
                placeholderTextColor={colors.textSecondary}
              />
            </Card>

            <View style={styles.row}>
              <Card style={[styles.card, styles.halfCard]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Liters <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={liters}
                  onChangeText={setLiters}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </Card>

              <Card style={[styles.card, styles.halfCard]}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Cost (₱) <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                  value={cost}
                  onChangeText={setCost}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </Card>
            </View>

            <Card style={styles.card}>
              <Text style={[styles.label, { color: colors.text }]}>
                Odometer Reading (km) <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={fuelOdometer}
                onChangeText={setFuelOdometer}
                placeholder="e.g., 12345"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </Card>

            <Card style={styles.card}>
              <Text style={[styles.label, { color: colors.text }]}>
                Receipt Photo <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: colors.surface }]}
                onPress={() => handleTakePhoto('fuel')}
              >
                <MaterialCommunityIcons
                  name={fuelPhoto ? 'check-circle' : 'camera'}
                  size={32}
                  color={fuelPhoto ? colors.success : colors.textSecondary}
                />
                <Text style={[styles.photoText, { color: colors.text }]}>
                  {fuelPhoto ? 'Photo Captured' : 'Take Photo'}
                </Text>
              </TouchableOpacity>
            </Card>

            <Button
              title={submitting ? 'Submitting...' : 'Submit Fuel Entry'}
              onPress={handleSubmitFuel}
              fullWidth
              size="large"
              disabled={submitting}
              icon={
                submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="send" size={24} color="#fff" />
                )
              }
            />
          </>
        )}

        {/* Receipts Tab */}
        {activeTab === 'receipts' && (
          <>
            <Card style={styles.card}>
              <Text style={[styles.label, { color: colors.text }]}>
                Receipt Type <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View style={styles.typeButtons}>
                {[
                  { value: 'toll', label: 'Toll', icon: 'highway' },
                  { value: 'parking', label: 'Parking', icon: 'parking' },
                  { value: 'meal', label: 'Meal', icon: 'food' },
                  { value: 'other', label: 'Other', icon: 'receipt' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor:
                          receiptType === type.value ? colors.primaryLight : colors.surface,
                        borderColor:
                          receiptType === type.value ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setReceiptType(type.value as any)}
                  >
                    <MaterialCommunityIcons
                      name={type.icon as any}
                      size={24}
                      color={receiptType === type.value ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.typeButtonText,
                        {
                          color: receiptType === type.value ? colors.primary : colors.text,
                        },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={[styles.label, { color: colors.text }]}>
                Description <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={receiptDescription}
                onChangeText={setReceiptDescription}
                placeholder="e.g., NLEX Toll Fee"
                placeholderTextColor={colors.textSecondary}
              />
            </Card>

            <Card style={styles.card}>
              <Text style={[styles.label, { color: colors.text }]}>
                Amount (₱) <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={receiptAmount}
                onChangeText={setReceiptAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </Card>

            <Card style={styles.card}>
              <Text style={[styles.label, { color: colors.text }]}>
                Receipt Photo <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: colors.surface }]}
                onPress={() => handleTakePhoto('receipt')}
              >
                <MaterialCommunityIcons
                  name={receiptPhoto ? 'check-circle' : 'camera'}
                  size={32}
                  color={receiptPhoto ? colors.success : colors.textSecondary}
                />
                <Text style={[styles.photoText, { color: colors.text }]}>
                  {receiptPhoto ? 'Photo Captured' : 'Take Photo'}
                </Text>
              </TouchableOpacity>
            </Card>

            <Button
              title={submitting ? 'Submitting...' : 'Submit Receipt'}
              onPress={handleSubmitReceipt}
              fullWidth
              size="large"
              disabled={submitting}
              icon={
                submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="send" size={24} color="#fff" />
                )
              }
            />
          </>
        )}

        {/* Odometer Tab */}
        {activeTab === 'odometer' && (
          <>
            <Card style={styles.card}>
              <Text style={[styles.label, { color: colors.text }]}>
                Reading Type <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        odometerType === 'start' ? colors.primaryLight : colors.surface,
                      borderColor:
                        odometerType === 'start' ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setOdometerType('start')}
                >
                  <MaterialCommunityIcons
                    name="play-circle"
                    size={24}
                    color={odometerType === 'start' ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color: odometerType === 'start' ? colors.primary : colors.text,
                      },
                    ]}
                  >
                    Start of Trip
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor:
                        odometerType === 'end' ? colors.primaryLight : colors.surface,
                      borderColor:
                        odometerType === 'end' ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setOdometerType('end')}
                >
                  <MaterialCommunityIcons
                    name="stop-circle"
                    size={24}
                    color={odometerType === 'end' ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color: odometerType === 'end' ? colors.primary : colors.text,
                      },
                    ]}
                  >
                    End of Trip
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Card style={styles.card}>
              <Text style={[styles.label, { color: colors.text }]}>
                Odometer Reading (km) <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[styles.largeInput, { backgroundColor: colors.surface, color: colors.text }]}
                value={odometerReading}
                onChangeText={setOdometerReading}
                placeholder="12345"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </Card>

            <Card style={styles.card}>
              <Text style={[styles.label, { color: colors.text }]}>
                Odometer Photo <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.photoButton, { backgroundColor: colors.surface }]}
                onPress={() => handleTakePhoto('odometer')}
              >
                <MaterialCommunityIcons
                  name={odometerPhoto ? 'check-circle' : 'camera'}
                  size={32}
                  color={odometerPhoto ? colors.success : colors.textSecondary}
                />
                <Text style={[styles.photoText, { color: colors.text }]}>
                  {odometerPhoto ? 'Photo Captured' : 'Take Photo'}
                </Text>
              </TouchableOpacity>
            </Card>

            <Button
              title={submitting ? 'Recording...' : 'Record Odometer'}
              onPress={handleSubmitOdometer}
              fullWidth
              size="large"
              disabled={submitting}
              icon={
                submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="send" size={24} color="#fff" />
                )
              }
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfCard: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  largeInput: {
    padding: 20,
    borderRadius: 8,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
    minWidth: '47%',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    gap: 12,
  },
  photoText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

