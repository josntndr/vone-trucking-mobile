/**
 * Trip Expense Card Component (Driver)
 * 
 * Driver interface for recording trip expenses across all categories
 * with receipt upload and validation.
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ExpenseCategory, TripExpense } from '../../types/fuel.types';
import { tripExpenseService } from '../../services/fuel/TripExpenseService';

interface TripExpenseCardProps {
  tripId: string;
  truckId: string;
  driverId: string;
  onRecorded?: (expense: TripExpense) => void;
}

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'fuel', label: 'Fuel', icon: 'fuel' },
  { value: 'toll_fees', label: 'Toll Fees', icon: 'car' },
  { value: 'parking', label: 'Parking', icon: 'car-side' },
  { value: 'meals_allowances', label: 'Meals & Allowances', icon: 'restaurant' },
  { value: 'repairs', label: 'Repairs', icon: 'wrench' },
  { value: 'emergency', label: 'Emergency', icon: 'alert-circle' },
  { value: 'other', label: 'Other', icon: 'receipt' },
];

export const TripExpenseCard: React.FC<TripExpenseCardProps> = ({
  tripId,
  truckId,
  driverId,
  onRecorded,
}) => {
  const [category, setCategory] = useState<ExpenseCategory>('toll_fees');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    try {
      if (!description || !amount) {
        Alert.alert('Missing Information', 'Please provide description and amount');
        return;
      }

      const expense = await tripExpenseService.createExpense({
        trip_id: tripId,
        truck_id: truckId,
        driver_id: driverId,
        category,
        description,
        amount: parseFloat(amount),
        location: location || undefined,
        expense_date: new Date().toISOString(),
        notes: notes || undefined,
      });

      if (onRecorded) onRecorded(expense);
      Alert.alert('Success', 'Expense recorded successfully');
      
      // Clear form
      setDescription('');
      setAmount('');
      setLocation('');
      setNotes('');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to record expense');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="wallet" size={24} color="#1F2937" />
        <Text style={styles.headerTitle}>Record Trip Expense</Text>
      </View>

      {/* Category Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expense Category</Text>
        <View style={styles.categoryGrid}>
          {EXPENSE_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryButton,
                category === cat.value && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat.value)}
            >
              <Ionicons
                name={cat.icon as any}
                size={24}
                color={category === cat.value ? '#FFFFFF' : '#6B7280'}
              />
              <Text
                style={[
                  styles.categoryButtonText,
                  category === cat.value && styles.categoryButtonTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Expense Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expense Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description *</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., Highway toll, Parking fee, etc."
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount ($) *</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Where was this expense incurred?"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional details..."
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>Record Expense</Text>
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  actions: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
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
