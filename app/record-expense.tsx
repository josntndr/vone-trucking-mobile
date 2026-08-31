/**
 * Record Expense Screen
 * Comprehensive expense recording with trip/truck association, receipt upload, and validation
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DESIGN_SYSTEM, COLORS, SPACING } from '../src/theme/designSystem';
import { useAuth } from '../src/hooks';
import {
  createExpense,
  uploadReceipt,
  validateExpenseAmount,
  validateExpenseDate,
  getCurrentDateManila,
} from '../src/services/api/expense.service';
import { getTrips } from '../src/services/api/trip.service';
import { getTrucks } from '../src/services/api/truck.service';
import {
  ExpenseCategory,
  PaymentMethod,
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  TRIP_RELATED_CATEGORIES,
  TRUCK_RELATED_CATEGORIES,
  REQUIRES_DESCRIPTION,
  CreateExpenseInput,
} from '../src/types/expense.types';
import { formatPhilippinePeso, parsePeso } from '../src/utils/philippines';
import { Trip, TripStatus } from '../src/types/trip.types';
import { Truck } from '../src/types/truck.types';

const DS = DESIGN_SYSTEM;

interface ReceiptFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

export default function RecordExpenseScreen() {
  const { user } = useAuth();
  
  // Form state
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(getCurrentDateManila());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  
  // Trip and Truck selection
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [tripSearch, setTripSearch] = useState('');
  const [truckSearch, setTruckSearch] = useState('');
  
  // Receipt
  const [receipt, setReceipt] = useState<ReceiptFile | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingTrucks, setLoadingTrucks] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Focus states
  const [amountFocused, setAmountFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);
  const [refFocused, setRefFocused] = useState(false);

  // Track if form has any data
  useEffect(() => {
    const formHasData = 
      category !== null ||
      amount !== '' ||
      description !== '' ||
      notes !== '' ||
      transactionRef !== '' ||
      selectedTrip !== null ||
      selectedTruck !== null ||
      receipt !== null;
    
    setHasUnsavedChanges(formHasData);
  }, [category, amount, description, notes, transactionRef, selectedTrip, selectedTruck, receipt]);

  // Load trips and trucks
  useEffect(() => {
    loadTrips();
    loadTrucks();
  }, []);

  // Auto-select truck when trip is selected
  useEffect(() => {
    if (selectedTrip?.assigned_truck_id) {
      const truck = trucks.find(t => t.id === selectedTrip.assigned_truck_id);
      if (truck) {
        setSelectedTruck(truck);
      }
    }
  }, [selectedTrip, trucks]);

  const loadTrips = async () => {
    setLoadingTrips(true);
    try {
      const response = await getTrips(
        { status: TripStatus.IN_TRANSIT }, // Only show active trips
        1,
        50
      );
      if (response.data?.data) {
        setTrips(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setLoadingTrips(false);
    }
  };

  const loadTrucks = async () => {
    setLoadingTrucks(true);
    try {
      const response = await getTrucks({}, 1, 50);
      if (response.data?.data) {
        setTrucks(response.data.data.filter(t => t.is_active));
      }
    } catch (error) {
      console.error('Failed to load trucks:', error);
    } finally {
      setLoadingTrucks(false);
    }
  };

  const handleCategorySelect = (cat: ExpenseCategory) => {
    setCategory(cat);
    if (errors.category) {
      setErrors({ ...errors, category: '' });
    }
    
    // Clear trip/truck if switching to incompatible category
    if (TRUCK_RELATED_CATEGORIES.includes(cat) && selectedTrip) {
      // Keep truck but might clear trip
    } else if (TRIP_RELATED_CATEGORIES.includes(cat) && selectedTruck && !selectedTrip) {
      // Truck is from trip, keep it
    }
  };

  const handleAmountChange = (text: string) => {
    // Allow only numbers and one decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setAmount(cleaned);
    if (errors.amount) {
      setErrors({ ...errors, amount: '' });
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setExpenseDate(dateStr);
      
      if (errors.expenseDate) {
        setErrors({ ...errors, expenseDate: '' });
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload receipts.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileSize = asset.fileSize || 0;
        
        // Check file size (max 10MB)
        if (fileSize > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select an image smaller than 10MB.');
          return;
        }
        
        setReceipt({
          uri: asset.uri,
          name: asset.fileName || 'receipt.jpg',
          type: asset.type || 'image/jpeg',
          size: fileSize,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        
        // Check file size (max 10MB)
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB.');
          return;
        }
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (file.mimeType && !validTypes.includes(file.mimeType)) {
          Alert.alert('Invalid File Type', 'Please select a JPG, PNG, or PDF file.');
          return;
        }
        
        setReceipt({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
          size: file.size || 0,
        });
      }
    } catch (error) {
      // Error is thrown when user cancels, we can ignore it
      console.log('Document picker cancelled or error:', error);
    }
  };

  const handleRemoveReceipt = () => {
    Alert.alert(
      'Remove Receipt',
      'Are you sure you want to remove this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setReceipt(null),
        },
      ]
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!category) {
      newErrors.category = 'Please select an expense category';
    }

    const amountValidation = validateExpenseAmount(amount);
    if (!amountValidation.valid) {
      newErrors.amount = amountValidation.error || 'Invalid amount';
    }

    const dateValidation = validateExpenseDate(expenseDate);
    if (!dateValidation.valid) {
      newErrors.expenseDate = dateValidation.error || 'Invalid date';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    // Category-specific validation
    if (category && REQUIRES_DESCRIPTION.includes(category) && !description.trim()) {
      newErrors.description = 'Description is required for Other category';
    }

    if (category && TRIP_RELATED_CATEGORIES.includes(category) && !selectedTrip) {
      newErrors.trip = 'Please select a trip for this expense type';
    }

    if (category && TRUCK_RELATED_CATEGORIES.includes(category) && !selectedTruck && !selectedTrip) {
      newErrors.truck = 'Please select a truck or trip for this expense type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting.');
      return;
    }

    if (hasUnsavedChanges) {
      Alert.alert(
        'Confirm Submission',
        'Are you sure you want to record this expense?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: submitExpense,
          },
        ]
      );
    }
  };

  const submitExpense = async () => {
    setLoading(true);

    try {
      // Create expense input
      const expenseInput: CreateExpenseInput = {
        category: category!,
        amount: parseFloat(amount),
        expense_date: expenseDate,
        payment_method: paymentMethod!,
        trip_id: selectedTrip?.id,
        truck_id: selectedTruck?.id,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        transaction_reference: transactionRef.trim() || undefined,
      };

      // Upload receipt first if provided
      if (receipt) {
        setUploadingReceipt(true);
        const tempId = `temp_${Date.now()}`;
        const uploadResult = await uploadReceipt(receipt.uri, tempId);
        setUploadingReceipt(false);

        if (uploadResult.error) {
          Alert.alert('Upload Failed', 'Failed to upload receipt. Continue without receipt?', [
            { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
            {
              text: 'Continue',
              onPress: async () => await createExpenseRecord(expenseInput),
            },
          ]);
          return;
        }

        if (uploadResult.data) {
          expenseInput.receipt_url = uploadResult.data.url;
          expenseInput.receipt_filename = uploadResult.data.filename;
        }
      }

      await createExpenseRecord(expenseInput);
    } catch (error) {
      setLoading(false);
      setUploadingReceipt(false);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const createExpenseRecord = async (input: CreateExpenseInput) => {
    const response = await createExpense(input);

    setLoading(false);

    if (response.error) {
      Alert.alert(
        'Failed to Save',
        "We couldn't save this expense. Check your connection and try again.",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => handleSubmit() },
        ]
      );
      return;
    }

    // Success
    setHasUnsavedChanges(false);
    
    Alert.alert(
      'Expense Recorded Successfully',
      `Your expense of ${formatPhilippinePeso(parseFloat(amount))} has been recorded and ${response.data?.approval_status === 'approved' ? 'approved' : 'is pending approval'}.`,
      [
        {
          text: 'Record Another',
          onPress: resetForm,
        },
        {
          text: 'Done',
          style: 'default',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const resetForm = () => {
    setCategory(null);
    setAmount('');
    setExpenseDate(getCurrentDateManila());
    setPaymentMethod(null);
    setDescription('');
    setNotes('');
    setTransactionRef('');
    setSelectedTrip(null);
    setSelectedTruck(null);
    setReceipt(null);
    setErrors({});
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    console.log('handleCancel called, hasUnsavedChanges:', hasUnsavedChanges);
    
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'Are you sure you want to leave? Your changes will be lost.',
        [
          { text: 'Stay', style: 'cancel' },
          {
            text: 'Leave',
            style: 'destructive',
            onPress: () => {
              console.log('User confirmed leave, navigating back');
              router.back();
            },
          },
        ]
      );
    } else {
      console.log('No unsaved changes, navigating back immediately');
      router.back();
    }
  };

  const filteredTrips = trips.filter(trip =>
    trip.trip_number?.toLowerCase().includes(tripSearch.toLowerCase()) ||
    trip.delivery_destination?.toLowerCase().includes(tripSearch.toLowerCase())
  );

  const filteredTrucks = trucks.filter(truck =>
    truck.truck_number?.toLowerCase().includes(truckSearch.toLowerCase()) ||
    truck.license_plate?.toLowerCase().includes(truckSearch.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: '#0B1120' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#0B1120', borderBottomColor: '#1E293B' }]}>
        <TouchableOpacity
          onPress={handleCancel}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessible={true}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: '#F8FAFC' }]}>
          Record Expense
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={{ padding: SPACING.base }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Expense Category */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: '#F8FAFC' }]}>
            Expense Category <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <View style={styles.categoryGrid}>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: category === key ? '#0EA5E9' : '#1E293B',
                    borderColor: category === key ? '#0EA5E9' : '#334155',
                  },
                ]}
                onPress={() => handleCategorySelect(key as ExpenseCategory)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel={label}
                accessibilityRole="button"
                accessibilityState={{ selected: category === key }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: category === key ? '#FFFFFF' : '#94A3B8',
                      fontWeight: category === key ? '700' : '600',
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && (
            <Text style={[styles.errorText, { color: '#EF4444' }]}>
              {errors.category}
            </Text>
          )}
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: '#F8FAFC' }]}>
            Amount (PHP) <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: '#0F172A',
                borderColor: amountFocused ? '#0EA5E9' : errors.amount ? '#EF4444' : '#334155',
              },
            ]}
          >
            <Text style={[styles.currencySymbol, { color: '#0EA5E9' }]}>₱</Text>
            <TextInput
              style={[styles.input, { color: '#F8FAFC' }]}
              placeholder="0.00"
              placeholderTextColor="#64748B"
              value={amount}
              onChangeText={handleAmountChange}
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)}
              keyboardType="decimal-pad"
              accessible={true}
              accessibilityLabel="Expense amount"
              accessibilityHint="Enter expense amount in Philippine pesos"
            />
          </View>
          {errors.amount && (
            <Text style={[styles.errorText, { color: '#EF4444' }]}>
              {errors.amount}
            </Text>
          )}
        </View>

        {/* Expense Date */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: '#F8FAFC' }]}>
            Expense Date <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: '#0F172A', borderColor: errors.expenseDate ? '#EF4444' : '#334155' }]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel="Select expense date"
            accessibilityRole="button"
          >
            <Ionicons name="calendar-outline" size={20} color="#0EA5E9" />
            <Text style={[styles.dateText, { color: '#F8FAFC' }]}>
              {new Date(expenseDate).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          {errors.expenseDate && (
            <Text style={[styles.errorText, { color: '#EF4444' }]}>
              {errors.expenseDate}
            </Text>
          )}
          
          {showDatePicker && (
            <DateTimePicker
              value={new Date(expenseDate)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: '#F8FAFC' }]}>
            Payment Method <Text style={{ color: '#EF4444' }}>*</Text>
          </Text>
          <View style={styles.paymentGrid}>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.paymentButton,
                  {
                    backgroundColor: paymentMethod === key ? '#0EA5E9' : '#1E293B',
                    borderColor: paymentMethod === key ? '#0EA5E9' : '#334155',
                  },
                ]}
                onPress={() => {
                  setPaymentMethod(key as PaymentMethod);
                  if (errors.paymentMethod) {
                    setErrors({ ...errors, paymentMethod: '' });
                  }
                }}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel={label}
                accessibilityRole="button"
                accessibilityState={{ selected: paymentMethod === key }}
              >
                <Text
                  style={[
                    styles.paymentText,
                    {
                      color: paymentMethod === key ? '#FFFFFF' : '#94A3B8',
                      fontWeight: paymentMethod === key ? '700' : '600',
                    },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.paymentMethod && (
            <Text style={[styles.errorText, { color: '#EF4444' }]}>
              {errors.paymentMethod}
            </Text>
          )}
        </View>

        {/* Conditional: Trip Selection (for trip-related expenses) */}
        {category && TRIP_RELATED_CATEGORIES.includes(category) && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: '#F8FAFC' }]}>
              Related Trip <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selectorButton, { backgroundColor: '#0F172A', borderColor: errors.trip ? '#EF4444' : '#334155' }]}
              onPress={() => setShowTripModal(true)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Select related trip"
              accessibilityRole="button"
            >
              {selectedTrip ? (
                <View style={styles.selectedItem}>
                  <View>
                    <Text style={[styles.selectedItemTitle, { color: '#F8FAFC' }]}>
                      {selectedTrip.trip_number}
                    </Text>
                    <Text style={[styles.selectedItemSubtitle, { color: '#94A3B8' }]}>
                      {selectedTrip.delivery_destination}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </View>
              ) : (
                <View style={styles.selectorPlaceholder}>
                  <Ionicons name="car-outline" size={20} color="#0EA5E9" />
                  <Text style={[styles.selectorPlaceholderText, { color: '#94A3B8' }]}>
                    Select Trip
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </View>
              )}
            </TouchableOpacity>
            {errors.trip && (
              <Text style={[styles.errorText, { color: '#EF4444' }]}>
                {errors.trip}
              </Text>
            )}
          </View>
        )}

        {/* Conditional: Truck Selection (for truck-related expenses) */}
        {category && TRUCK_RELATED_CATEGORIES.includes(category) && !selectedTrip && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: '#F8FAFC' }]}>
              Related Truck <Text style={{ color: '#EF4444' }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.selectorButton, { backgroundColor: '#0F172A', borderColor: errors.truck ? '#EF4444' : '#334155' }]}
              onPress={() => setShowTruckModal(true)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Select related truck"
              accessibilityRole="button"
            >
              {selectedTruck ? (
                <View style={styles.selectedItem}>
                  <View>
                    <Text style={[styles.selectedItemTitle, { color: '#F8FAFC' }]}>
                      {selectedTruck.truck_number}
                    </Text>
                    <Text style={[styles.selectedItemSubtitle, { color: '#94A3B8' }]}>
                      {selectedTruck.license_plate}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </View>
              ) : (
                <View style={styles.selectorPlaceholder}>
                  <Ionicons name="car-sport-outline" size={20} color="#0EA5E9" />
                  <Text style={[styles.selectorPlaceholderText, { color: '#94A3B8' }]}>
                    Select Truck
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </View>
              )}
            </TouchableOpacity>
            {errors.truck && (
              <Text style={[styles.errorText, { color: '#EF4444' }]}>
                {errors.truck}
              </Text>
            )}
          </View>
        )}

        {/* Auto-selected Truck (from Trip) */}
        {selectedTrip && selectedTruck && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: '#F8FAFC' }]}>
              Assigned Truck
            </Text>
            <View style={[styles.infoBox, { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <Ionicons name="information-circle" size={20} color="#0EA5E9" />
              <Text style={[styles.infoText, { color: '#F8FAFC' }]}>
                {selectedTruck.truck_number} ({selectedTruck.license_plate})
              </Text>
            </View>
          </View>
        )}

        {/* Transaction Reference (Optional) */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: '#F8FAFC' }]}>
            Transaction Reference (Optional)
          </Text>
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: '#0F172A',
                borderColor: refFocused ? '#0EA5E9' : '#334155',
              },
            ]}
          >
            <Ionicons name="document-text-outline" size={20} color="#0EA5E9" style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.input, { color: '#F8FAFC' }]}
              placeholder="e.g., Receipt #12345, OR #67890"
              placeholderTextColor="#64748B"
              value={transactionRef}
              onChangeText={setTransactionRef}
              onFocus={() => setRefFocused(true)}
              onBlur={() => setRefFocused(false)}
              accessible={true}
              accessibilityLabel="Transaction reference"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: '#F8FAFC' }]}>
            Description {REQUIRES_DESCRIPTION.includes(category!) && <Text style={{ color: '#EF4444' }}>*</Text>}
          </Text>
          <View
            style={[
              styles.textAreaWrapper,
              {
                backgroundColor: '#0F172A',
                borderColor: descriptionFocused ? '#0EA5E9' : errors.description ? '#EF4444' : '#334155',
              },
            ]}
          >
            <TextInput
              style={[styles.textArea, { color: '#F8FAFC' }]}
              placeholder="What was this expense for?"
              placeholderTextColor="#64748B"
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) {
                  setErrors({ ...errors, description: '' });
                }
              }}
              onFocus={() => setDescriptionFocused(true)}
              onBlur={() => setDescriptionFocused(false)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessible={true}
              accessibilityLabel="Expense description"
            />
          </View>
          {errors.description && (
            <Text style={[styles.errorText, { color: '#EF4444' }]}>
              {errors.description}
            </Text>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: '#F8FAFC' }]}>
            Notes (Optional)
          </Text>
          <View
            style={[
              styles.textAreaWrapper,
              {
                backgroundColor: '#0F172A',
                borderColor: notesFocused ? '#0EA5E9' : '#334155',
              },
            ]}
          >
            <TextInput
              style={[styles.textArea, { color: '#F8FAFC' }]}
              placeholder="Additional notes or details..."
              placeholderTextColor="#64748B"
              value={notes}
              onChangeText={setNotes}
              onFocus={() => setNotesFocused(true)}
              onBlur={() => setNotesFocused(false)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessible={true}
              accessibilityLabel="Additional notes"
            />
          </View>
        </View>

        {/* Receipt Upload */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: '#F8FAFC' }]}>
            Receipt (Optional)
          </Text>
          
          {!receipt ? (
            <View style={styles.uploadButtons}>
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                onPress={handlePickImage}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="Upload photo from gallery"
                accessibilityRole="button"
              >
                <Ionicons name="images-outline" size={20} color="#0EA5E9" />
                <Text style={[styles.uploadButtonText, { color: '#F8FAFC' }]}>
                  Photo
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                onPress={handlePickDocument}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="Upload document"
                accessibilityRole="button"
              >
                <Ionicons name="document-outline" size={20} color="#0EA5E9" />
                <Text style={[styles.uploadButtonText, { color: '#F8FAFC' }]}>
                  Document
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.receiptPreview, { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              {receipt.type.startsWith('image/') ? (
                <Image source={{ uri: receipt.uri }} style={styles.receiptImage} resizeMode="cover" />
              ) : (
                <View style={styles.receiptPdf}>
                  <Ionicons name="document-text" size={48} color="#0EA5E9" />
                  <Text style={[styles.receiptPdfName, { color: '#F8FAFC' }]}>
                    {receipt.name}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.removeReceiptButton, { backgroundColor: '#EF4444' }]}
                onPress={handleRemoveReceipt}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel="Remove receipt"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
          
          <Text style={[styles.uploadHint, { color: '#94A3B8' }]}>
            JPG, PNG, or PDF • Max 10MB
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: loading ? '#64748B' : '#0EA5E9',
              opacity: loading ? 0.6 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel="Save expense"
          accessibilityRole="button"
          accessibilityState={{ disabled: loading }}
        >
          {loading || uploadingReceipt ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={[styles.submitButtonText, { color: '#FFFFFF', marginLeft: 12 }]}>
                {uploadingReceipt ? 'Uploading Receipt...' : 'Saving...'}
              </Text>
            </View>
          ) : (
            <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
              Save Expense
            </Text>
          )}
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Trip Selection Modal */}
      <Modal
        visible={showTripModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowTripModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: '#0B1120' }]}>
          <View style={[styles.modalHeader, { backgroundColor: '#0B1120', borderBottomColor: '#1E293B' }]}>
            <TouchableOpacity onPress={() => setShowTripModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#F8FAFC" />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: '#F8FAFC' }]}>Select Trip</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={{ padding: SPACING.base }}>
            <View style={[styles.searchBar, { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <Ionicons name="search" size={20} color="#0EA5E9" />
              <TextInput
                style={[styles.searchInput, { color: '#F8FAFC' }]}
                placeholder="Search by trip number or destination"
                placeholderTextColor="#64748B"
                value={tripSearch}
                onChangeText={setTripSearch}
              />
            </View>
          </View>

          <ScrollView style={styles.modalList}>
            {loadingTrips ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color="#0EA5E9" size="large" />
                <Text style={[styles.loadingText, { color: '#94A3B8' }]}>Loading trips...</Text>
              </View>
            ) : filteredTrips.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="car-outline" size={48} color="#64748B" />
                <Text style={[styles.emptyText, { color: '#94A3B8' }]}>
                  {tripSearch ? 'No matching trips found' : 'No active trips available'}
                </Text>
              </View>
            ) : (
              filteredTrips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={[styles.modalItem, { backgroundColor: '#1E293B', borderBottomColor: '#334155' }]}
                  onPress={() => {
                    setSelectedTrip(trip);
                    setShowTripModal(false);
                    if (errors.trip) {
                      setErrors({ ...errors, trip: '' });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={[styles.modalItemTitle, { color: '#F8FAFC' }]}>
                      {trip.trip_number}
                    </Text>
                    <Text style={[styles.modalItemSubtitle, { color: '#94A3B8' }]}>
                      {trip.delivery_destination}
                    </Text>
                    {trip.assigned_truck_number && (
                      <Text style={[styles.modalItemMeta, { color: '#64748B' }]}>
                        Truck: {trip.assigned_truck_number}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Truck Selection Modal */}
      <Modal
        visible={showTruckModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowTruckModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: '#0B1120' }]}>
          <View style={[styles.modalHeader, { backgroundColor: '#0B1120', borderBottomColor: '#1E293B' }]}>
            <TouchableOpacity onPress={() => setShowTruckModal(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#F8FAFC" />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: '#F8FAFC' }]}>Select Truck</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={{ padding: SPACING.base }}>
            <View style={[styles.searchBar, { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <Ionicons name="search" size={20} color="#0EA5E9" />
              <TextInput
                style={[styles.searchInput, { color: '#F8FAFC' }]}
                placeholder="Search by truck number or plate"
                placeholderTextColor="#64748B"
                value={truckSearch}
                onChangeText={setTruckSearch}
              />
            </View>
          </View>

          <ScrollView style={styles.modalList}>
            {loadingTrucks ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color="#0EA5E9" size="large" />
                <Text style={[styles.loadingText, { color: '#94A3B8' }]}>Loading trucks...</Text>
              </View>
            ) : filteredTrucks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="car-sport-outline" size={48} color="#64748B" />
                <Text style={[styles.emptyText, { color: '#94A3B8' }]}>
                  {truckSearch ? 'No matching trucks found' : 'No trucks available'}
                </Text>
              </View>
            ) : (
              filteredTrucks.map((truck) => (
                <TouchableOpacity
                  key={truck.id}
                  style={[styles.modalItem, { backgroundColor: '#1E293B', borderBottomColor: '#334155' }]}
                  onPress={() => {
                    setSelectedTruck(truck);
                    setShowTruckModal(false);
                    if (errors.truck) {
                      setErrors({ ...errors, truck: '' });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.modalItemContent}>
                    <Text style={[styles.modalItemTitle, { color: '#F8FAFC' }]}>
                      {truck.truck_number}
                    </Text>
                    <Text style={[styles.modalItemSubtitle, { color: '#94A3B8' }]}>
                      {truck.license_plate}
                    </Text>
                    {truck.make && truck.model && (
                      <Text style={[styles.modalItemMeta, { color: '#64748B' }]}>
                        {truck.make} {truck.model}
                      </Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: DS.typography.fontSize.lg,
    fontWeight: DS.typography.fontWeight.bold,
    flex: 1,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.semibold,
    marginBottom: SPACING.sm,
  },
  
  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryButton: {
    minWidth: '48%',
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: DS.borderRadius.base,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 48,
  },
  categoryText: {
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.medium,
    textAlign: 'center',
  },
  
  // Amount Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: SPACING.base,
    borderRadius: DS.borderRadius.base,
    borderWidth: 2,
  },
  currencySymbol: {
    fontSize: DS.typography.fontSize.lg,
    fontWeight: DS.typography.fontWeight.semibold,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: DS.typography.fontSize.base,
    height: '100%',
  },
  
  // Date Button
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.base,
    borderRadius: DS.borderRadius.base,
    borderWidth: 2,
    minHeight: 56,
  },
  dateText: {
    flex: 1,
    fontSize: DS.typography.fontSize.base,
    marginLeft: SPACING.md,
  },
  
  // Payment Grid
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  paymentButton: {
    minWidth: '48%',
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: DS.borderRadius.base,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 48,
  },
  paymentText: {
    fontSize: DS.typography.fontSize.sm,
    fontWeight: DS.typography.fontWeight.medium,
    textAlign: 'center',
  },
  
  // Selector Button
  selectorButton: {
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.base,
    borderRadius: DS.borderRadius.base,
    borderWidth: 2,
    minHeight: 64,
    justifyContent: 'center',
  },
  selectorPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  selectorPlaceholderText: {
    flex: 1,
    fontSize: DS.typography.fontSize.base,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedItemTitle: {
    fontSize: DS.typography.fontSize.base,
    fontWeight: DS.typography.fontWeight.semibold,
    marginBottom: 4,
  },
  selectedItemSubtitle: {
    fontSize: DS.typography.fontSize.sm,
  },
  
  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: DS.borderRadius.base,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  infoText: {
    flex: 1,
    fontSize: DS.typography.fontSize.sm,
  },
  
  // Text Area
  textAreaWrapper: {
    padding: SPACING.md,
    borderRadius: DS.borderRadius.base,
    borderWidth: 2,
    minHeight: 100,
  },
  textArea: {
    fontSize: DS.typography.fontSize.base,
    minHeight: 80,
  },
  
  // Receipt Upload
  uploadButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: DS.borderRadius.base,
    borderWidth: 2,
    gap: SPACING.sm,
    minHeight: 56,
  },
  uploadButtonText: {
    fontSize: DS.typography.fontSize.base,
    fontWeight: DS.typography.fontWeight.medium,
  },
  receiptPreview: {
    position: 'relative',
    borderRadius: DS.borderRadius.base,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 200,
  },
  receiptImage: {
    width: '100%',
    height: 200,
  },
  receiptPdf: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptPdfName: {
    fontSize: DS.typography.fontSize.sm,
    marginTop: SPACING.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.base,
  },
  removeReceiptButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...DS.shadows.base,
  },
  uploadHint: {
    fontSize: DS.typography.fontSize.xs,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  
  // Submit Button
  submitButton: {
    paddingVertical: SPACING.base,
    borderRadius: DS.borderRadius.base,
    alignItems: 'center',
    marginTop: SPACING.lg,
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: DS.typography.fontSize.base,
    fontWeight: DS.typography.fontWeight.semibold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Error Text
  errorText: {
    fontSize: DS.typography.fontSize.xs,
    marginTop: SPACING.xs,
  },
  
  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: DS.typography.fontSize.lg,
    fontWeight: DS.typography.fontWeight.bold,
    flex: 1,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    borderRadius: DS.borderRadius.base,
    borderWidth: 1,
    height: 48,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: DS.typography.fontSize.base,
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemTitle: {
    fontSize: DS.typography.fontSize.base,
    fontWeight: DS.typography.fontWeight.semibold,
    marginBottom: 4,
  },
  modalItemSubtitle: {
    fontSize: DS.typography.fontSize.sm,
    marginBottom: 2,
  },
  modalItemMeta: {
    fontSize: DS.typography.fontSize.xs,
  },
  
  // Loading/Empty States
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
  },
  loadingText: {
    fontSize: DS.typography.fontSize.sm,
    marginTop: SPACING.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
    paddingHorizontal: SPACING.base,
  },
  emptyText: {
    fontSize: DS.typography.fontSize.base,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});
