/**
 * Record Expense Screen
 * Full form for recording trip expenses
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
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../src/theme/ThemeProvider';
import { Screen } from '../src/components';
import { createExpense } from '../src/services/api/expense.service';
import {
  ExpenseCategory,
  PaymentMethod,
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  CreateExpenseInput,
} from '../src/types/expense.types';
import { formatPhilippinePeso } from '../src/utils/philippines';

export default function RecordExpenseScreen() {
  const { colors, fontSizes, fontWeights, lineHeights, spacing, borderRadius  } = useTheme();

  // Form state
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));

  // UI state
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Focus states
  const [amountFocused, setAmountFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!category) {
      newErrors.category = 'Please select an expense category';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReview = () => {
    if (validateForm()) {
      setShowReview(true);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const expenseInput: CreateExpenseInput = {
        category: category!,
        amount: parseFloat(amount),
        date,
        time,
        payment_method: paymentMethod!,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const response = await createExpense(expenseInput);

      if (response.error) {
        Alert.alert('Error', response.error);
        return;
      }

      // Success
      Alert.alert(
        'Success',
        'Expense recorded successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to record expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showReview) {
    return (
      <Screen>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { paddingHorizontal: spacing[4], paddingVertical: spacing[4], backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowReview(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold }]}>
              Review Expense
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.reviewContent} contentContainerStyle={{ padding: spacing[4] }}>
            <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderRadius: borderRadius.card, padding: spacing[4] }]}>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary, fontSize: fontSizes.sm }]}>Category</Text>
                <Text style={[styles.reviewValue, { color: colors.text, fontSize: fontSizes.base, fontWeight: fontWeights.semibold }]}>
                  {EXPENSE_CATEGORY_LABELS[category!]}
                </Text>
              </View>

              <View style={[styles.reviewDivider, { backgroundColor: colors.border, marginVertical: spacing[3] }]} />

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary, fontSize: fontSizes.sm }]}>Amount</Text>
                <Text style={[styles.reviewValue, { color: colors.primary, fontSize: fontSizes.xl, fontWeight: fontWeights.bold }]}>
                  {formatPhilippinePeso(parseFloat(amount))}
                </Text>
              </View>

              <View style={[styles.reviewDivider, { backgroundColor: colors.border, marginVertical: spacing[3] }]} />

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary, fontSize: fontSizes.sm }]}>Payment Method</Text>
                <Text style={[styles.reviewValue, { color: colors.text, fontSize: fontSizes.base, fontWeight: fontWeights.semibold }]}>
                  {PAYMENT_METHOD_LABELS[paymentMethod!]}
                </Text>
              </View>

              <View style={[styles.reviewDivider, { backgroundColor: colors.border, marginVertical: spacing[3] }]} />

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.textSecondary, fontSize: fontSizes.sm }]}>Date & Time</Text>
                <Text style={[styles.reviewValue, { color: colors.text, fontSize: fontSizes.base }]}>
                  {new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })} at {time}
                </Text>
              </View>

              {description && (
                <>
                  <View style={[styles.reviewDivider, { backgroundColor: colors.border, marginVertical: spacing[3] }]} />
                  <View style={styles.reviewColumn}>
                    <Text style={[styles.reviewLabel, { color: colors.textSecondary, fontSize: fontSizes.sm, marginBottom: spacing[2] }]}>Description</Text>
                    <Text style={[styles.reviewValue, { color: colors.text, fontSize: fontSizes.base }]}>{description}</Text>
                  </View>
                </>
              )}

              {notes && (
                <>
                  <View style={[styles.reviewDivider, { backgroundColor: colors.border, marginVertical: spacing[3] }]} />
                  <View style={styles.reviewColumn}>
                    <Text style={[styles.reviewLabel, { color: colors.textSecondary, fontSize: fontSizes.sm, marginBottom: spacing[2] }]}>Notes</Text>
                    <Text style={[styles.reviewValue, { color: colors.text, fontSize: fontSizes.base }]}>{notes}</Text>
                  </View>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: loading ? colors.primaryLight : colors.primary, borderRadius: borderRadius.base, marginTop: spacing[6], paddingVertical: spacing[4] }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={[styles.submitButtonText, { color: colors.white, fontSize: fontSizes.base, fontWeight: fontWeights.semibold }]}>
                {loading ? 'Saving...' : 'Confirm & Save'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing[4], paddingVertical: spacing[4], backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialCommunityIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text, fontSize: fontSizes.lg, fontWeight: fontWeights.semibold }]}>
            Record Expense
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.form}
          contentContainerStyle={{ padding: spacing[4] }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category */}
          <View style={[styles.fieldContainer, { marginBottom: spacing[5] }]}>
            <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, marginBottom: spacing[2] }]}>
              Expense Category *
            </Text>
            <View style={styles.categoryGrid}>
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: category === key ? colors.primary : colors.surface,
                      borderRadius: borderRadius.base,
                      borderWidth: 2,
                      borderColor: category === key ? colors.primary : colors.border,
                      padding: spacing[3],
                      marginBottom: spacing[2],
                    },
                  ]}
                  onPress={() => {
                    setCategory(key as ExpenseCategory);
                    if (errors.category) {
                      setErrors({ ...errors, category: '' });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.categoryText, { color: category === key ? colors.white : colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium, textAlign: 'center' }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.category && (
              <Text style={[styles.errorText, { color: colors.error, fontSize: fontSizes.xs, marginTop: spacing[1] }]}>
                {errors.category}
              </Text>
            )}
          </View>

          {/* Amount */}
          <View style={[styles.fieldContainer, { marginBottom: spacing[5] }]}>
            <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, marginBottom: spacing[2] }]}>
              Amount (PHP) *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.base,
                  borderWidth: 2,
                  borderColor: amountFocused ? colors.accent : errors.amount ? colors.error : colors.border,
                  paddingHorizontal: spacing[4],
                },
              ]}
            >
              <Text style={[styles.currencySymbol, { color: colors.textSecondary, fontSize: fontSizes.lg }]}>₱</Text>
              <TextInput
                style={[styles.input, { color: colors.text, fontSize: fontSizes.base, paddingHorizontal: spacing[2] }]}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (errors.amount) {
                    setErrors({ ...errors, amount: '' });
                  }
                }}
                onFocus={() => setAmountFocused(true)}
                onBlur={() => setAmountFocused(false)}
                keyboardType="decimal-pad"
              />
            </View>
            {errors.amount && (
              <Text style={[styles.errorText, { color: colors.error, fontSize: fontSizes.xs, marginTop: spacing[1] }]}>
                {errors.amount}
              </Text>
            )}
          </View>

          {/* Payment Method */}
          <View style={[styles.fieldContainer, { marginBottom: spacing[5] }]}>
            <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, marginBottom: spacing[2] }]}>
              Payment Method *
            </Text>
            <View style={styles.paymentMethodGrid}>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.paymentMethodButton,
                    {
                      backgroundColor: paymentMethod === key ? colors.primary : colors.surface,
                      borderRadius: borderRadius.base,
                      borderWidth: 2,
                      borderColor: paymentMethod === key ? colors.primary : colors.border,
                      padding: spacing[3],
                      marginBottom: spacing[2],
                    },
                  ]}
                  onPress={() => {
                    setPaymentMethod(key as PaymentMethod);
                    if (errors.paymentMethod) {
                      setErrors({ ...errors, paymentMethod: '' });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.paymentMethodText, { color: paymentMethod === key ? colors.white : colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.medium, textAlign: 'center' }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.paymentMethod && (
              <Text style={[styles.errorText, { color: colors.error, fontSize: fontSizes.xs, marginTop: spacing[1] }]}>
                {errors.paymentMethod}
              </Text>
            )}
          </View>

          {/* Description */}
          <View style={[styles.fieldContainer, { marginBottom: spacing[5] }]}>
            <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, marginBottom: spacing[2] }]}>
              Description (Optional)
            </Text>
            <View
              style={[
                styles.textAreaWrapper,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.base,
                  borderWidth: 2,
                  borderColor: descriptionFocused ? colors.accent : colors.border,
                  padding: spacing[3],
                },
              ]}
            >
              <TextInput
                style={[styles.textArea, { color: colors.text, fontSize: fontSizes.base }]}
                placeholder="What was this expense for?"
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                onFocus={() => setDescriptionFocused(true)}
                onBlur={() => setDescriptionFocused(false)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Notes */}
          <View style={[styles.fieldContainer, { marginBottom: spacing[5] }]}>
            <Text style={[styles.label, { color: colors.text, fontSize: fontSizes.sm, fontWeight: fontWeights.semibold, marginBottom: spacing[2] }]}>
              Notes (Optional)
            </Text>
            <View
              style={[
                styles.textAreaWrapper,
                {
                  backgroundColor: colors.surface,
                  borderRadius: borderRadius.base,
                  borderWidth: 2,
                  borderColor: notesFocused ? colors.accent : colors.border,
                  padding: spacing[3],
                },
              ]}
            >
              <TextInput
                style={[styles.textArea, { color: colors.text, fontSize: fontSizes.base }]}
                placeholder="Additional notes or details..."
                placeholderTextColor={colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                onFocus={() => setNotesFocused(true)}
                onBlur={() => setNotesFocused(false)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Review Button */}
          <TouchableOpacity
            style={[styles.reviewButton, { backgroundColor: colors.primary, borderRadius: borderRadius.base, paddingVertical: spacing[4], marginTop: spacing[2], marginBottom: spacing[8] }]}
            onPress={handleReview}
            activeOpacity={0.8}
          >
            <Text style={[styles.reviewButtonText, { color: colors.white, fontSize: fontSizes.base, fontWeight: fontWeights.semibold }]}>
              Review Expense
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
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
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  fieldContainer: {},
  label: {},
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    minWidth: '48%',
    flex: 1,
  },
  categoryText: {},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  currencySymbol: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: '100%',
  },
  paymentMethodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentMethodButton: {
    minWidth: '48%',
    flex: 1,
  },
  paymentMethodText: {},
  textAreaWrapper: {},
  textArea: {
    minHeight: 80,
  },
  errorText: {},
  reviewButton: {
    alignItems: 'center',
  },
  reviewButtonText: {},
  reviewContent: {
    flex: 1,
  },
  reviewCard: {},
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewColumn: {},
  reviewLabel: {},
  reviewValue: {},
  reviewDivider: {
    height: 1,
  },
  submitButton: {
    alignItems: 'center',
  },
  submitButtonText: {},
});
